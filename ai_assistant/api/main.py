from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import asyncio
import json
from typing import List, Dict, Any
import os
from dotenv import load_dotenv

# services
from ..config.database import db_manager
from ..services.chat_service import chat_service
from ..services.notification_service import notification_service
from ..services.vector_indexer import vector_indexer
from ..services.rag_service import rag_service
from ..models.chat import ChatRequest, ChatResponse
from ..models.notification import (
    Notification, NotificationPreferences, NotificationType, 
    NotificationChannel, NotificationPriority
)

load_dotenv()

app = FastAPI(
    title="AI Assistant",
    description="AI-powered chatbot and notification system for Odoo",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure properly for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        self.active_connections[user_id] = websocket
    
    def disconnect(self, user_id: str):
        if user_id in self.active_connections:
            del self.active_connections[user_id]
    
    async def send_personal_message(self, message: str, user_id: str):
        if user_id in self.active_connections:
            await self.active_connections[user_id].send_text(message)
    
    async def broadcast(self, message: str):
        for connection in self.active_connections.values():
            await connection.send_text(message)

manager = ConnectionManager()

@app.on_event("startup")
async def startup_event():
    try:
        await db_manager.connect()
        await notification_service.create_default_templates()
        await vector_indexer.full_reindex()   # Index data for semantic search
        
        print("AI Assistant started successfully!")
    except Exception as e:
        print(f"Error during startup: {e}")

@app.on_event("shutdown")
async def shutdown_event():
    try:
        await db_manager.disconnect()
        print("AI Assistant shutdown complete!")
    except Exception as e:
        print(f"Error during shutdown: {e}")

# check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "AI Assistant"}

# Chat endpoints
@app.post("/chat", response_model=ChatResponse)
async def chat_endpoint(request: ChatRequest):
    try:
        response = await chat_service.process_message(request, user_id=request.user_id, session_id=str(request.session_id))
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/chat/session/{session_id}")
async def get_chat_history(session_id: str, user_id: str):
    try:
        session = await chat_service.get_chat_history(session_id, user_id)
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        return session
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# endpoint for real-time chat
@app.websocket("/ws/chat/{user_id}")
async def websocket_chat_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            # Process chat message
            chat_request = ChatRequest(
                message=message_data.get("message", ""),
                user_id=user_id,
                session_id=message_data.get("session_id"),
                context=message_data.get("context")
            )
            
            response = await chat_service.process_message(
                chat_request, 
                user_id=user_id, 
                session_id=str(chat_request.session_id)
            )
            
            # Send response back
            await websocket.send_text(json.dumps(response if isinstance(response, dict) else response.model_dump()))
            
    except WebSocketDisconnect:
        manager.disconnect(user_id)
    except Exception as e:
        await websocket.send_text(json.dumps({"error": str(e)}))

# Notification endpoints
@app.post("/notifications")
async def create_notification(notification: Notification):
   
    created_notification = await notification_service.create_notification(
        notification_type=notification.type,
        title=notification.title,
        message=notification.message,
        recipients=notification.recipients,
        channels=notification.channels,
        priority=notification.priority,
        metadata=notification.metadata if notification.metadata is not None else {},
        scheduled_at=notification.scheduled_at
        )
    return created_notification

@app.post("/notifications/template/{template_name}")
async def create_notification_from_template(
    template_name: str,
    recipients: List[str],
    variables: Dict[str, Any],
    channels: List[NotificationChannel] = [NotificationChannel.EMAIL, NotificationChannel.PUSH]
):
    notification = await notification_service.create_notification_from_template(
        template_name=template_name,
        recipients=recipients,
        variables=variables,
        channels=channels
    )
    # if not notification:
    #     raise HTTPException(status_code=404, detail="Template not found")
    return notification

@app.get("/notifications/user/{user_id}")
async def get_user_notifications(
    user_id: str,
    limit: int = 50,
    unread_only: bool = False
):
    notifications = await notification_service.get_user_notifications(
        user_id=user_id,
        limit=limit,
        unread_only=unread_only
    )
    return notifications

# @app.put("/notifications/{notification_id}/read")
# async def mark_notification_read(notification_id: str, user_id: str):  
#     await notification_service.mark_notification_read(notification_id, user_id)
#     return {"message": "Notification marked as read"}

@app.get("/notifications/preferences/{user_id}")
async def get_notification_preferences(user_id: str):
    preferences = await notification_service._get_user_preferences(user_id)
    if not preferences:
        preferences = NotificationPreferences(user_id=user_id)
        if db_manager.db is None:
            raise HTTPException(status_code=500, detail="Database connection not established")
        await db_manager.db.notification_preferences.insert_one(preferences.dict())
    return preferences

@app.put("/notifications/preferences/{user_id}")
async def update_notification_preferences(user_id: str, preferences: NotificationPreferences):
    preferences.user_id = user_id
    if db_manager.db is None:
        raise HTTPException(status_code=500, detail="Database connection not established")
    await db_manager.db.notification_preferences.update_one(
            {"user_id": user_id},
            {"$set": preferences.dict()},
            upsert=True
        )
    return {"message": "Preferences updated successfully"}

# endpoint for real-time notifications
@app.websocket("/ws/notifications/{user_id}")
async def websocket_notifications_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(user_id)

# Vector search endpoints
@app.get("/search")
async def semantic_search(query: str, top_k: int = 5):
    results = await db_manager.semantic_search(query, top_k)
    return {"query": query, "results": results}

# @app.post("/index/reindex")
# async def reindex_data(data_type: str, data_id: str = None):
#     await vector_indexer.reindex_specific_data(data_type, data_id)
#     return {"message": f"Reindexed {data_type}"}

@app.post("/index/full")
async def full_reindex():
    await vector_indexer.full_reindex()
    return {"message": "Full reindex completed"}

# Admin endpoints
@app.get("/admin/stats")
async def get_admin_stats():
    if db_manager.db is None:
        raise HTTPException(status_code=500, detail="Database connection not established")
    product_count = await db_manager.db.products.count_documents({})
    order_count = await db_manager.db.orders.count_documents({})
    user_count = await db_manager.db.users.count_documents({})
    notification_count = await db_manager.db.notifications.count_documents({})

    return {
            "products": product_count,
            "orders": order_count,
            "users": user_count,
            "notifications": notification_count,
            "vector_index_size": len(db_manager.vector_mapping) if db_manager.vector_mapping else 0
        }

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error", "error": str(exc)}
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 