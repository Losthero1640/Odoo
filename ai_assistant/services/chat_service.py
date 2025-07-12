import asyncio
from typing import Dict, Any, List, Optional
from config.database import db_manager
import logging
from datetime import datetime
from .rag_service import rag_service

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class ChatService:
    def __init__(self):
        self.db_manager = db_manager
        self.conversation_history = {}
        
    async def process_message(self, message: str, user_id: str, session_id: str) -> Dict[str, Any]:
        try:
            # Use the RAG system with Gemini
            response = await rag_service.process_chat_message(message, user_id, session_id)
            return response
            
        except Exception as e:
            logger.error(f"Error processing message: {e}")
            return {
                'response': "I'm having trouble processing your request right now. Please try again later.",
                'confidence': 0.0,
                'sources': [],
                'session_id': session_id
            }
    
    async def get_chat_history(self, session_id: str, user_id: str) -> List[Dict[str, Any]]:
        if not hasattr(self.db_manager, 'db') or self.db_manager.db is None:
            logger.error("Database connection is not initialized.")
            return []
        chat_session = await self.db_manager.db.chat_sessions.find_one({
            'session_id': session_id,
            'user_id': user_id
        })
            
        if chat_session:
            return chat_session.get('messages', [])
        return []

chat_service = ChatService() 