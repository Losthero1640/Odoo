from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class MessageRole(str, Enum):
    USER = "user"
    ASSISTANT = "assistant"
    SYSTEM = "system"

class Message(BaseModel):
    role: MessageRole
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

class ChatRequest(BaseModel):
    message: str
    user_id: str
    session_id: int
    context: Optional[Dict[str, Any]] = None

class ChatResponse(BaseModel):
    response: str
    sources: List[Dict[str, Any]] = Field(default_factory=list)
    confidence: float = Field(ge=0.0, le=1.0)
    session_id: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ChatSession(BaseModel):
    session_id: str
    user_id: Optional[str] = None
    messages: List[Message] = Field(default_factory=list)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    metadata: Optional[Dict[str, Any]] = None

class SearchResult(BaseModel):
    content: str
    source_type: str  # "product", "order", "user", "faq"
    source_id: str
    score: float
    metadata: Dict[str, Any]

class ConversationContext(BaseModel):
    user_preferences: Dict[str, Any] = Field(default_factory=dict)
    recent_products: List[str] = Field(default_factory=list)
    order_history: List[str] = Field(default_factory=list)
    search_history: List[str] = Field(default_factory=list) 