const axios = require('axios');
const Product = require('../models/Product');
const Order = require('../models/Order');
const User = require('../models/User');

class AIAssistantService {
    constructor() {
        this.aiAssistantUrl = process.env.AI_ASSISTANT_URL || 'http://localhost:8000';
        this.isAvailable = false;
        this.checkAvailability();
    }

    async checkAvailability() {
        try {
            const response = await axios.get(`${this.aiAssistantUrl}/health`, { timeout: 5000 });
            this.isAvailable = response.data.status === 'healthy';
            console.log(`AI Assistant ${this.isAvailable ? 'is available' : 'is not available'}`);
        } catch (error) {
            this.isAvailable = false;
            console.log('AI Assistant is not available:', error.message);
        }
    }

    async sendChatMessage(message, userId, sessionId = null) {
        if (!this.isAvailable) {
            return {
                response: "I'm currently unavailable. Please try again later or contact customer support.",
                confidence: 0.0,
                sources: []
            };
        }

        try {
            const response = await axios.post(`${this.aiAssistantUrl}/chat`, {
                message,
                user_id: userId,
                session_id: sessionId
            }, { timeout: 10000 });

            return response.data;
        } catch (error) {
            console.error('Error sending chat message to AI assistant:', error.message);
            return {
                response: "I'm having trouble processing your request right now. Please try again later.",
                confidence: 0.0,
                sources: []
            };
        }
    }

    async performSemanticSearch(query, topK = 5) {
        if (!this.isAvailable) {
            return { query, results: [] };
        }

        try {
            const response = await axios.get(`${this.aiAssistantUrl}/search`, {
                params: { query, top_k: topK },
                timeout: 10000
            });

            return response.data;
        } catch (error) {
            console.error('Error performing semantic search:', error.message);
            return { query, results: [] };
        }
    }

    async createNotification(notificationData) {
        if (!this.isAvailable) {
            console.log('AI Assistant not available, notification not sent:', notificationData);
            return null;
        }

        try {
            const response = await axios.post(`${this.aiAssistantUrl}/notifications`, notificationData, {
                timeout: 10000
            });

            return response.data;
        } catch (error) {
            console.error('Error creating notification via AI assistant:', error.message);
            return null;
        }
    }

    async createNotificationFromTemplate(templateName, recipients, variables, channels = null) {
        if (!this.isAvailable) {
            console.log('AI Assistant not available, template notification not sent:', { templateName, recipients });
            return null;
        }

        try {
            const response = await axios.post(`${this.aiAssistantUrl}/notifications/template/${templateName}`, {
                recipients,
                variables,
                channels
            }, { timeout: 10000 });

            return response.data;
        } catch (error) {
            console.error('Error creating template notification:', error.message);
            return null;
        }
    }

    async getUserNotifications(userId, limit = 50, unreadOnly = false) {
        if (!this.isAvailable) {
            return [];
        }

        try {
            const response = await axios.get(`${this.aiAssistantUrl}/notifications/user/${userId}`, {
                params: { limit, unread_only: unreadOnly },
                timeout: 10000
            });

            return response.data;
        } catch (error) {
            console.error('Error getting user notifications:', error.message);
            return [];
        }
    }

    async markNotificationRead(notificationId, userId) {
        if (!this.isAvailable) {
            return false;
        }

        try {
            await axios.put(`${this.aiAssistantUrl}/notifications/${notificationId}/read`, null, {
                params: { user_id: userId },
                timeout: 10000
            });

            return true;
        } catch (error) {
            console.error('Error marking notification as read:', error.message);
            return false;
        }
    }

    async reindexData(dataType, dataId = null) {
        if (!this.isAvailable) {
            return false;
        }

        try {
            const response = await axios.post(`${this.aiAssistantUrl}/index/reindex`, {
                data_type: dataType,
                data_id: dataId
            }, { timeout: 30000 });

            return response.data;
        } catch (error) {
            console.error('Error reindexing data:', error.message);
            return false;
        }
    }

    async fullReindex() {
        if (!this.isAvailable) {
            return false;
        }

        try {
            const response = await axios.post(`${this.aiAssistantUrl}/index/full`, {}, {
                timeout: 60000
            });

            return response.data;
        } catch (error) {
            console.error('Error performing full reindex:', error.message);
            return false;
        }
    }

    async getSystemStats() {
        if (!this.isAvailable) {
            return null;
        }

        try {
            const response = await axios.get(`${this.aiAssistantUrl}/admin/stats`, {
                timeout: 10000
            });

            return response.data;
        } catch (error) {
            console.error('Error getting system stats:', error.message);
            return null;
        }
    }

    // Helper methods for common notification scenarios
    async notifyOrderStatusUpdate(orderId, newStatus, userId) {
        const order = await Order.findById(orderId);
        if (!order) return null;

        return await this.createNotificationFromTemplate(
            'order_status_update',
            [userId],
            {
                order_number: orderId,
                status: newStatus,
                additional_info: `Your order is now ${newStatus}`
            },
            ['email', 'in_app']
        );
    }

    async notifyProductRestock(productId, userId) {
        const product = await Product.findById(productId);
        if (!product) return null;

        return await this.createNotificationFromTemplate(
            'product_restock',
            [userId],
            {
                product_name: product.name,
                size: 'All sizes'
            },
            ['email', 'in_app']
        );
    }

    async notifyPriceDrop(productId, oldPrice, newPrice, userId) {
        const product = await Product.findById(productId);
        if (!product) return null;

        const discountPercent = Math.round(((oldPrice - newPrice) / oldPrice) * 100);

        return await this.createNotificationFromTemplate(
            'price_drop',
            [userId],
            {
                product_name: product.name,
                discount_percent: discountPercent,
                original_price: oldPrice,
                new_price: newPrice
            },
            ['email', 'in_app']
        );
    }

    async notifyNewArrival(productId, userId) {
        const product = await Product.findById(productId);
        if (!product) return null;

        return await this.createNotification({
            type: 'new_arrival',
            title: `New Arrival: ${product.name}`,
            message: `Check out our latest ${product.name}!`,
            recipients: [userId],
            channels: ['email', 'in_app'],
            priority: 'medium'
        });
    }

    // Method to automatically reindex when data changes
    async autoReindexOnChange(dataType, dataId) {
        try {
            await this.reindexData(dataType, dataId);
        } catch (error) {
            console.error(`Error auto-reindexing ${dataType}:`, error.message);
        }
    }
}

// Create singleton instance
const aiAssistantService = new AIAssistantService();

module.exports = aiAssistantService; 