const express = require("express");
const Checkout = require("../models/Checkout");
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");


const router = express.Router();

// POST /api/checkout
//@desc Create a new checkout
//@access Private
router.post("/",protect,async(req,res) =>{
    const {checkoutItems, shippingAddress, paymentMethod , totalPrice} = req.body;

    if(!checkoutItems || checkoutItems.length === 0) {
        return res.status(400).json({message:"No items in checkout"});
    }

    try {
        const newCheckout = await Checkout.create({
            user: req.user._id,
            checkoutItems,
            shippingAddress,
            paymentMethod,
            totalPrice,
            paymentStatus : "Pending",
            isPaid: false,
        });
        console.log(`Checkout created for user: ${req.user._id}`);
        res.status(201).json(newCheckout);
    } catch (error) {
        console.error("Error creating checkout session:", error);
        res.status(500).json({message:"Internal server error"});
    }
} );

// PUT /api/checkout/:id/pay
//@desc Pay for checkout
router.put("/:id/pay",protect,async(req,res) =>{
    const {paymentStatus,paymentDetails} = req.body;

    try {
        const checkout = await Checkout.findById(req.params.id);

        if(!checkout) {
            return res.status(404).json({message:"Checkout not found"});
        }

        if(paymentStatus === "Paid") {
            checkout.isPaid = true;
            checkout.paymentStatus = paymentStatus;
            checkout.paidAt = new Date();
            checkout.paymentDetails = paymentDetails;
            await checkout.save();
            res.status(200).json(checkout);
        }else{
            return res.status(400).json({message:"Payment status must be 'Paid'"});
        }

    } catch (error) {
        console.error("Error processing payment:", error);
        res.status(500).json({message:"Internal server error"});
    }
});

//POST /api/checkout/:id/finalize
//@desc Finalize checkout
//@access private
router.post("/:id/finalize", protect, async (req, res) => {
    try {
        const checkout = await Checkout.findById(req.params.id);

        if (!checkout) {
            return res.status(404).json({ message: "Checkout not found" });
        }

        if (checkout.isPaid && !checkout.isFinalized) {
            // Create order from checkout
            const finalOrder = await Order.create({
                user: checkout.user,
                orderItems: checkout.checkoutItems,
                shippingAddress: checkout.shippingAddress,
                paymentMethod: checkout.paymentMethod,
                totalPrice:checkout.totalPrice,
                isPaid:true,
                paidAt:checkout.paidAt,
                isDelivered: false,
                paymentStatus:"paid",
                paymentDetails:checkout.paymentDetails,
            })

            //marking checkout as finalized
            checkout.isFinalized = true;
            checkout.finalizedAt = Date.now();
            await checkout.save();

            //delete the associate cart
            await Cart.deleteOne({ user: checkout.user });
            res.status(201).json(finalOrder);
        }else if(checkout.isFinalized) {
            return res.status(400).json({ message: "Checkout already finalized" });
        }else{
            res.status(400).json({ message: "Checkout not paid" });
        }
       
    } catch (error) {
        console.error("Error finalizing checkout:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
