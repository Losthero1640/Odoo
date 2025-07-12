const express = require('express');
const Order = require('../models/Order');
const { protect, admin } = require('../middleware/authMiddleware');
const router = express.Router();


//GET /api/admin/orders
//@desc Get all orders
//@access private
router.get("/", protect, admin, async (req, res) => {

    try {

        const orders = await Order.find({}).populate('user', 'name email');  // here for using this populate method, we need to have a reference to the user in the Order model and type of the user should be mongoose.ObjectId and ref should be User
        return res.status(200).json(orders);
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
});

//PUT /api/admin/orders/:id
//@desc Update order details
//@access private
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (order) {
            order.status = req.body.status || order.status;
            order.isDelivered = req.body.status === "Delivered" ? true : order.isDelivered;
            order.deliveredAt =
                req.body.status === "Delivered" ? Date.now() : order.deliveredAt;

            const updatedOrder = await order.save();
            res.json({ messsage: "Order updated successfully", order: updatedOrder });
        } else {
            return res.status(404).json({ message: "Order not found" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
})


//DELETE /api/admin/orders/:id
//@desc Delete order
//@access private
router.delete("/:id",protect,admin,async (req,res)=>{
    try {
        const order = await Order.findById(req.params.id);
        if(order) {
            await order.deleteOne();
            return res.status(200).json({message:"Order Removed successfully"});
        } else {
            return res.status(404).json({message:"Order not found"});
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
})

module.exports = router;