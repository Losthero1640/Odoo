const express = require("express");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Item = require("../models/Item");
const Swap = require("../models/Swap");

const router = express.Router();

router.get("/",authenticateToken,async(req,res)=>{
    try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) return res.status(404).json({ message: 'User not found' });

    const uploadedItems = await Item.find({ uploader: userId });
    const swapsRequested = await Swap.find({ requester: userId }).populate({
      path: 'item',
      select: 'title availability'
    });

    res.json({
      user,
      uploadedItems,
      swapsRequested,
    });
  } catch(err) {
    res.status(500).json({ message: 'Server error' });
  }
})

module.exports = router;