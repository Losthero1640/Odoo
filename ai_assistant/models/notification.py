from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
from enum import Enum

class NotificationType(str, Enum):
    ORDER_STATUS = "order_status"
    PRODUCT_RESTOCK = "product_restock"
    PRICE_DROP = "price_drop"
    NEW_ARRIVAL = "new_arrival"
    PROMOTION = "promotion"
    SYSTEM_ALERT = "system_alert"
    CHAT_MESSAGE = "chat_message"

class NotificationPriority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    URGENT = "urgent"

class NotificationChannel(str, Enum):
    EMAIL = "email"
    SMS = "sms"
    PUSH = "push"
    IN_APP = "in_app"
    WEBHOOK = "webhook"

class NotificationStatus(str, Enum):
    PENDING = "pending"
    SENT = "sent"
    DELIVERED = "delivered"
    READ = "read"
    FAILED = "failed"

class Notification(BaseModel):
    id: Optional[str] = None
    type: NotificationType
    title: str
    message: str
    priority: NotificationPriority = NotificationPriority.MEDIUM
    channels: List[NotificationChannel] = Field(default_factory=list)
    recipients: List[str] = Field(default_factory=list)
    metadata: Optional[Dict[str, Any]] = None
    scheduled_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    status: NotificationStatus = NotificationStatus.PENDING

class NotificationTemplate(BaseModel):
    id: Optional[str] = None
    name: str
    type: NotificationType
    title_template: str
    message_template: str
    channels: List[NotificationChannel]
    priority: NotificationPriority = NotificationPriority.MEDIUM
    variables: List[str] = Field(default_factory=list)
    is_active: bool = True
    created_at: datetime = Field(default_factory=datetime.utcnow)

class NotificationDelivery(BaseModel):
    id: Optional[str] = None
    notification_id: str
    recipient_id: str
    channel: NotificationChannel
    status: NotificationStatus
    sent_at: Optional[datetime] = None
    delivered_at: Optional[datetime] = None
    read_at: Optional[datetime] = None
    error_message: Optional[str] = None
    retry_count: int = 0

class NotificationPreferences(BaseModel):
    user_id: str
    email_enabled: bool = True
    sms_enabled: bool = False
    push_enabled: bool = True
    in_app_enabled: bool = True
    order_updates: bool = True
    product_updates: bool = True
    promotions: bool = True
    system_alerts: bool = True
    quiet_hours_start: Optional[str] = None  # HH:MM format
    quiet_hours_end: Optional[str] = None    # HH:MM format 