const express = require('express');
const Product = require('../models/Product');
const {protect,admin} = require('../middleware/authMiddleware');
const router = express.Router();


//GET /api/admin/products
//@desc Get all products
//@access private
router.get("/" ,protect,admin,async(req, res) => {
    
    try {
        const products = await Product.find({});
        return res.status(200).json(products);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
});


module.exports = router;