const aiAssistantService = require('../services/aiAssistantService');

// Middleware to automatically reindex data when it changes
const autoReindexMiddleware = (dataType) => {
    return async (req, res, next) => {
        // Store original send method
        const originalSend = res.json;
        
        // Override send method to capture response
        res.json = function(data) {
            // Call original send method
            originalSend.call(this, data);
            
            // Auto-reindex after successful response
            if (res.statusCode >= 200 && res.statusCode < 300) {
                const dataId = data._id || data.id || req.params.id;
                if (dataId) {
                    aiAssistantService.autoReindexOnChange(dataType, dataId.toString())
                        .catch(error => {
                            console.error(`Error auto-reindexing ${dataType}:`, error.message);
                        });
                }
            }
        };
        
        next();
    };
};

// Middleware to send notifications for specific events
const notificationMiddleware = (eventType) => {
    return async (req, res, next) => {
        // Store original send method
        const originalSend = res.json;
        
        // Override send method to capture response
        res.json = function(data) {
            // Call original send method
            originalSend.call(this, data);
            
            // Send notification after successful response
            if (res.statusCode >= 200 && res.statusCode < 300) {
                handleNotification(eventType, req, data)
                    .catch(error => {
                        console.error(`Error sending notification for ${eventType}:`, error.message);
                    });
            }
        };
        
        next();
    };
};

// Helper function to handle different notification types
async function handleNotification(eventType, req, data) {
    const userId = req.user?._id?.toString();
    
    switch (eventType) {
        case 'order_status_update':
            if (data.status && userId) {
                await aiAssistantService.notifyOrderStatusUpdate(
                    data._id.toString(),
                    data.status,
                    data.user?.toString() || userId
                );
            }
            break;
            
        case 'product_restock':
            if (data.countInStock > 0 && userId) {
                await aiAssistantService.notifyProductRestock(
                    data._id.toString(),
                    userId
                );
            }
            break;
            
        case 'price_drop':
            if (data.price && userId) {
                // This would need the old price from somewhere
                // For now, we'll just log it
                console.log(`Price drop detected for product: ${data._id}`);
            }
            break;
            
        case 'new_arrival':
            if (data.isPublished && userId) {
                await aiAssistantService.notifyNewArrival(
                    data._id.toString(),
                    userId
                );
            }
            break;
            
        default:
            console.log(`Unknown notification event type: ${eventType}`);
    }
}

// Middleware to check AI assistant availability
const checkAIAvailability = async (req, res, next) => {
    if (!aiAssistantService.isAvailable) {
        console.log('AI Assistant is not available');
    }
    next();
};

// Middleware to add AI assistant info to response headers
const addAIAssistantHeaders = (req, res, next) => {
    res.set('X-AI-Assistant-Available', aiAssistantService.isAvailable.toString());
    next();
};

module.exports = {
    autoReindexMiddleware,
    notificationMiddleware,
    checkAIAvailability,
    addAIAssistantHeaders
}; 