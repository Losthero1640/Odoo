const express = require('express');
const router = express.Router();
const aiAssistantService = require('../services/aiAssistantService');
const { protect } = require('../middleware/authMiddleware');

// Chat endpoints
router.post('/chat', protect, async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user._id.toString();

        if (!message) {
            return res.status(400).json({ message: 'Message is required' });
        }

        const response = await aiAssistantService.sendChatMessage(message, userId, sessionId);
        res.json(response);
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({ message: 'Error processing chat message' });
    }
});

router.get('/chat/session/:sessionId', protect, async (req, res) => {
    try {
        const { sessionId } = req.params;
        const userId = req.user._id.toString();

        // This would typically get chat history from the AI assistant
        // For now, we'll return a simple response
        res.json({
            session_id: sessionId,
            user_id: userId,
            messages: []
        });
    } catch (error) {
        console.error('Get chat session error:', error);
        res.status(500).json({ message: 'Error getting chat session' });
    }
});

// Search endpoints
router.get('/search', async (req, res) => {
    try {
        const { query, top_k = 5 } = req.query;

        if (!query) {
            return res.status(400).json({ message: 'Query is required' });
        }

        const results = await aiAssistantService.performSemanticSearch(query, parseInt(top_k));
        res.json(results);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({ message: 'Error performing search' });
    }
});

// Notification endpoints
router.get('/notifications', protect, async (req, res) => {
    try {
        const userId = req.user._id.toString();
        const { limit = 50, unread_only = false } = req.query;

        const notifications = await aiAssistantService.getUserNotifications(
            userId,
            parseInt(limit),
            unread_only === 'true'
        );

        res.json(notifications);
    } catch (error) {
        console.error('Get notifications error:', error);
        res.status(500).json({ message: 'Error getting notifications' });
    }
});

router.put('/notifications/:notificationId/read', protect, async (req, res) => {
    try {
        const { notificationId } = req.params;
        const userId = req.user._id.toString();

        const success = await aiAssistantService.markNotificationRead(notificationId, userId);
        
        if (success) {
            res.json({ message: 'Notification marked as read' });
        } else {
            res.status(404).json({ message: 'Notification not found or error occurred' });
        }
    } catch (error) {
        console.error('Mark notification read error:', error);
        res.status(500).json({ message: 'Error marking notification as read' });
    }
});

// Admin endpoints (require admin role)
router.get('/admin/stats', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const stats = await aiAssistantService.getSystemStats();
        res.json(stats || { message: 'AI Assistant not available' });
    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({ message: 'Error getting system stats' });
    }
});

router.post('/admin/reindex', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const { data_type, data_id } = req.body;

        if (!data_type) {
            return res.status(400).json({ message: 'Data type is required' });
        }

        const result = await aiAssistantService.reindexData(data_type, data_id);
        res.json(result);
    } catch (error) {
        console.error('Reindex error:', error);
        res.status(500).json({ message: 'Error reindexing data' });
    }
});

router.post('/admin/reindex/full', protect, async (req, res) => {
    try {
        // Check if user is admin
        if (req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Admin access required' });
        }

        const result = await aiAssistantService.fullReindex();
        res.json(result);
    } catch (error) {
        console.error('Full reindex error:', error);
        res.status(500).json({ message: 'Error performing full reindex' });
    }
});

// Health check endpoint
router.get('/health', async (req, res) => {
    try {
        const isAvailable = aiAssistantService.isAvailable;
        res.json({
            status: isAvailable ? 'healthy' : 'unavailable',
            service: 'AI Assistant Integration',
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            service: 'AI Assistant Integration',
            error: error.message
        });
    }
});

module.exports = router; 