const express = require('express');
const Order = require('../models/Order');
const { protect } = require('../middleware/authMiddleware');
const aiAssistantService = require('../services/aiAssistantService');

const router = express.Router();  

//GET /api/orders/myorders
//@desc Get all orders for current user
//@access Private
router.get("/my-orders",protect,async(req,res) =>{
    try {
        
        const orders = await Order.find({user:req.user._id}).sort({
            createdAt: -1,
        });
        console.log("fetched orders",orders);
        res.json(orders)

    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({message:"Internal server error"});
    }
})

router.get("/:id",protect,async(req,res)=>{
    try {
        const order = await Order.findById(req.params.id).populate("user", "name email");
        
        if(!order) {
            return res.status(404).json({message:"Order not found"});
        }

        res.json(order);

    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({message:"Internal server error"});
    }
})

// Update order status with AI assistant integration
router.put("/:id/status", protect, async (req, res) => {
    try {
        const { status } = req.body;
        const orderId = req.params.id;
        const userId = req.user._id.toString();

        // Check if user is admin or order owner
        const order = await Order.findById(orderId);
        if (!order) {
            return res.status(404).json({ message: "Order not found" });
        }

        if (req.user.role !== 'admin' && order.user.toString() !== userId) {
            return res.status(403).json({ message: "Not authorized" });
        }

        // Update order status
        const updatedOrder = await Order.findByIdAndUpdate(
            orderId,
            { status },
            { new: true }
        );

        // Send notification via AI assistant
        await aiAssistantService.notifyOrderStatusUpdate(
            orderId,
            status,
            order.user.toString()
        );

        // Reindex the order in vector database
        await aiAssistantService.autoReindexOnChange('orders', orderId);

        res.json(updatedOrder);
    } catch (error) {
        console.error("Error updating order status:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;