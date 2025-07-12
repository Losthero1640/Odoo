import os
import asyncio
import smtplib
import json
from typing import List, Dict, Any, Optional
from datetime import datetime, time
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import httpx
import redis
from celery import Celery

from ..config.database import db_manager
from ..models.notification import (
    Notification, NotificationTemplate, NotificationDelivery,
    NotificationPreferences, NotificationType, NotificationChannel,
    NotificationStatus, NotificationPriority
)

class NotificationService:
    def __init__(self):
        self.redis_client = None
        self.celery_app = None
        self._initialize_services()
    
    def _initialize_services(self):
        try:
            # Initialize Redis
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            self.redis_client = redis.from_url(redis_url)
            
            # Initialize Celery
            self.celery_app = Celery(
                'notification_tasks',
                broker=redis_url,
                backend=redis_url
            )
            
            print("Notification services initialized successfully")
        except Exception as e:
            print(f"Error initializing notification services: {e}")
    
    async def create_notification(
        self,
        notification_type: NotificationType,
        title: str,
        message: str,
        recipients: List[str],
        channels: List[NotificationChannel] = None,
        priority: NotificationPriority = NotificationPriority.MEDIUM,
        metadata: Dict[str, Any] = None,
        scheduled_at: Optional[datetime] = None
    ) -> Notification:
        if channels is None:
            channels = [NotificationChannel.IN_APP, NotificationChannel.EMAIL]
        
        notification = Notification(
            type=notification_type,
            title=title,
            message=message,
            recipients=recipients,
            channels=channels,
            priority=priority,
            metadata=metadata,
            scheduled_at=scheduled_at
        )
        
        # Save to database
        notification_dict = notification.dict()
        if db_manager.db is None:
            raise RuntimeError("Database connection is not initialized.")
        result = await db_manager.db.notifications.insert_one(notification_dict)
        notification.id = str(result.inserted_id)
        
        # Queue for delivery
        await self._queue_notification(notification)
        
        return notification
    
    async def create_notification_from_template(
        self,
        template_name: str,
        recipients: List[str],
        variables: Dict[str, Any],
        channels: List[NotificationChannel] = None
    ) -> Optional[Notification]:
        template = await self._get_template(template_name)
        if not template:
            return None
        
        title = template.title_template
        message = template.message_template
        
        for key, value in variables.items():
            title = title.replace(f"{{{key}}}", str(value))
            message = message.replace(f"{{{key}}}", str(value))
        
        return await self.create_notification(
            notification_type=template.type,
            title=title,
            message=message,
            recipients=recipients,
            channels=channels or template.channels,
            priority=template.priority,
            metadata={"template": template_name, "variables": variables}
        )
    
    async def _get_template(self, template_name: str) -> Optional[NotificationTemplate]:
        """Get notification template by name"""
        if db_manager.db is None:
            raise RuntimeError("Database connection is not initialized.")
        template_data = await db_manager.db.notification_templates.find_one({"name": template_name})
        if template_data:
            return NotificationTemplate(**template_data)
        return None
    
    async def _queue_notification(self, notification: Notification):
        # Queue notification for delivery
        if self.celery_app:
            self.celery_app.send_task(
                'notification_tasks.send_notification',
                args=[notification.dict()]
            )
        else:
            # Fallback: process immediately
            await self._process_notification(notification)
    
    async def _process_notification(self, notification: Notification):
        for recipient_id in notification.recipients:
            preferences = await self._get_user_preferences(recipient_id)
            if not preferences:
                continue
            
            if self._is_quiet_hours(preferences):
                if notification.priority != NotificationPriority.URGENT:
                    continue
            
            # Send through enabled channels
            for channel in notification.channels:
                if self._is_channel_enabled(channel, preferences, notification.type):
                    await self._send_notification_channel(
                        notification, recipient_id, channel
                    )
    
    async def _get_user_preferences(self, user_id: str) -> Optional[NotificationPreferences]:
        if db_manager.db is None:
            raise RuntimeError("Database connection is not initialized.")
        prefs_data = await db_manager.db.notification_preferences.find_one({"user_id": user_id})
        if prefs_data:
            return NotificationPreferences(**prefs_data)
        return None
    
    def _is_quiet_hours(self, preferences: NotificationPreferences) -> bool:
        """Check if current time is in quiet hours"""
        if not preferences.quiet_hours_start or not preferences.quiet_hours_end:
            return False
        
        current_time = datetime.now().time()
        start_time = time.fromisoformat(preferences.quiet_hours_start)
        end_time = time.fromisoformat(preferences.quiet_hours_end)
        
        if start_time <= end_time:
            return start_time <= current_time <= end_time
        else:  # Crosses midnight
            return current_time >= start_time or current_time <= end_time
    
    def _is_channel_enabled(
        self, 
        channel: NotificationChannel, 
        preferences: NotificationPreferences,
        notification_type: NotificationType
    ) -> bool:
        # Check channel preference
        if channel == NotificationChannel.EMAIL and not preferences.email_enabled:
            return False
        elif channel == NotificationChannel.SMS and not preferences.sms_enabled:
            return False
        elif channel == NotificationChannel.PUSH and not preferences.push_enabled:
            return False
        elif channel == NotificationChannel.IN_APP and not preferences.in_app_enabled:
            return False
        
        # Check notification type preference
        if notification_type == NotificationType.ORDER_STATUS and not preferences.order_updates:
            return False
        elif notification_type == NotificationType.PRODUCT_RESTOCK and not preferences.product_updates:
            return False
        elif notification_type == NotificationType.PROMOTION and not preferences.promotions:
            return False
        elif notification_type == NotificationType.SYSTEM_ALERT and not preferences.system_alerts:
            return False
        
        return True
    
    async def _send_notification_channel(
        self, 
        notification: Notification, 
        recipient_id: str, 
        channel: NotificationChannel
    ):
        try:
            if channel == NotificationChannel.EMAIL:
                await self._send_email_notification(notification, recipient_id)
            elif channel == NotificationChannel.SMS:
                await self._send_sms_notification(notification, recipient_id)
            elif channel == NotificationChannel.PUSH:
                await self._send_push_notification(notification, recipient_id)
            elif channel == NotificationChannel.IN_APP:
                await self._send_in_app_notification(notification, recipient_id)
            elif channel == NotificationChannel.WEBHOOK:
                await self._send_webhook_notification(notification, recipient_id)
            
            await self._record_delivery(notification.id or "", recipient_id, channel, NotificationStatus.SENT)
            
        except Exception as e:
            print(f"Error sending {channel} notification: {e}")
            await self._record_delivery(
                notification.id or "", recipient_id, channel, 
                NotificationStatus.FAILED, error_message=str(e)
            )
    
    async def _send_email_notification(self, notification: Notification, recipient_id: str):
        # Get user email
        if db_manager.db is None:
            raise RuntimeError("Database connection is not initialized.")
        user_data = await db_manager.db.users.find_one({"_id": recipient_id})
        if not user_data or not user_data.get("email"):
            return
        
        email = user_data["email"]
        
        # Email configuration
        smtp_server = os.getenv("SMTP_SERVER", "smtp.gmail.com")
        smtp_port = int(os.getenv("SMTP_PORT", "587"))
        smtp_username = os.getenv("SMTP_USERNAME")
        smtp_password = os.getenv("SMTP_PASSWORD")
        
        if smtp_username is None or smtp_password is None:
            print("SMTP credentials not configured")
            return
        
        # Create email
        msg = MIMEMultipart()
        msg['From'] = smtp_username
        msg['To'] = email
        msg['Subject'] = notification.title
        
        body = f"""
        Dear {user_data.get('name', 'Customer')},
        {notification.message}
        This is an automated message from your clothing brand.
        """
        
        msg.attach(MIMEText(body, 'plain'))
        
        # Send email
        with smtplib.SMTP(smtp_server, smtp_port) as server:
            server.starttls()
            server.login(smtp_username, smtp_password)
            server.send_message(msg)
    
    async def _send_sms_notification(self, notification: Notification, recipient_id: str):
        """Send SMS notification (placeholder)"""
        # Implement SMS service integration (Twilio, etc.)
        print(f"SMS notification to {recipient_id}: {notification.message}")
    
    # async def _send_push_notification(self, notification: Notification, recipient_id: str):
    #     # Implement push notification service (Firebase, etc.)
    #     print(f"Push notification to {recipient_id}: {notification.message}")
    
    async def _send_in_app_notification(self, notification: Notification, recipient_id: str):
        """Send in-app notification"""
        # Store in database for in-app display
        in_app_notification = {
            "user_id": recipient_id,
            "title": notification.title,
            "message": notification.message,
            "type": notification.type,
            "created_at": datetime.utcnow(),
            "read": False,
            "metadata": notification.metadata
        }
        
        await db_manager.db.in_app_notifications.insert_one(in_app_notification)
        
        # Send to WebSocket if available
        if self.redis_client:
            self.redis_client.publish(
                f"notifications:{recipient_id}",
                json.dumps(in_app_notification)
            )
    
    async def _send_webhook_notification(self, notification: Notification, recipient_id: str):
        """Send webhook notification"""
        webhook_url = os.getenv("WEBHOOK_URL")
        if not webhook_url:
            return
        
        payload = {
            "notification_id": notification.id,
            "recipient_id": recipient_id,
            "type": notification.type,
            "title": notification.title,
            "message": notification.message,
            "metadata": notification.metadata
        }
        
        async with httpx.AsyncClient() as client:
            await client.post(webhook_url, json=payload)
    
    async def _record_delivery(
        self, 
        notification_id: str, 
        recipient_id: str, 
        channel: NotificationChannel,
        status: NotificationStatus,
        error_message: Optional[str] = None
    ):
        delivery = NotificationDelivery(
            notification_id=notification_id,
            recipient_id=recipient_id,
            channel=channel,
            status=status,
            sent_at=datetime.utcnow() if status == NotificationStatus.SENT else None,
            error_message=error_message
        )
        
        await db_manager.db.notification_deliveries.insert_one(delivery.dict())
    
    async def get_user_notifications(
        self, 
        user_id: str, 
        limit: int = 50, 
        unread_only: bool = False
    ) -> List[Dict[str, Any]]:
        query = {"user_id": user_id}
        if unread_only:
            query["read"] = False
        
        cursor = db_manager.db.in_app_notifications.find(query).sort("created_at", -1).limit(limit)
        notifications = await cursor.to_list(length=limit)
        
        return notifications
    
    async def mark_notification_read(self, notification_id: str, user_id: str):
        """Mark notification as read"""
        await db_manager.db.in_app_notifications.update_one(
            {"_id": notification_id, "user_id": user_id},
            {"$set": {"read": True, "read_at": datetime.utcnow()}}
        )
    
    async def create_default_templates(self):
        """Create default notification templates"""
        templates = [
            {
                "name": "order_status_update",
                "type": NotificationType.ORDER_STATUS,
                "title_template": "Order {order_number} Status Update",
                "message_template": "Your order {order_number} has been {status}. {additional_info}",
                "channels": [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
                "priority": NotificationPriority.MEDIUM,
                "variables": ["order_number", "status", "additional_info"]
            },
            {
                "name": "product_restock",
                "type": NotificationType.PRODUCT_RESTOCK,
                "title_template": "{product_name} is back in stock!",
                "message_template": "Great news! {product_name} is now available in your size {size}. Don't miss out!",
                "channels": [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
                "priority": NotificationPriority.HIGH,
                "variables": ["product_name", "size"]
            },
            {
                "name": "price_drop",
                "type": NotificationType.PRICE_DROP,
                "title_template": "Price Drop Alert: {product_name}",
                "message_template": "{product_name} is now {discount_percent}% off! Original price: ${original_price}, New price: ${new_price}",
                "channels": [NotificationChannel.EMAIL, NotificationChannel.IN_APP],
                "priority": NotificationPriority.HIGH,
                "variables": ["product_name", "discount_percent", "original_price", "new_price"]
            }
        ]
        
        for template_data in templates:
            template = NotificationTemplate(**template_data)
            await db_manager.db.notification_templates.update_one(
                {"name": template.name},
                {"$set": template.dict()},
                upsert=True
            )
notification_service = NotificationService()