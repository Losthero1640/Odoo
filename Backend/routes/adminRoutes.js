const express = require("express");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const User = require("../models/User");
const Item = require("../models/Item");
const Swap = require("../models/Swap");
const fs = require("fs");
const path = require("path");


const router = express.Router();

router.get("/pending", authenticateToken, isAdmin, async (req, res) => {
    try {
        const items = await Item.find({ approved: false }).populate('uploader', 'email profileDetails');
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
})


//approve items
router.post("/:id/approve", authenticateToken, isAdmin, async (req, res) => {
    try {

        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        item.approved = true;
        await item.save();
        res.json({ message: 'Item approved' });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
})


//Reject and delte items
router.delete("/:id/reject", authenticateToken, isAdmin, async (req, res) => {
    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ message: 'Item not found' });

        // Delete images files
        item.imagePaths.forEach(p => {
            const filePath = path.join(__dirname, "..", "uploads", path.basename(p));
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        });

        await Item.findByIdAndDelete(req.params.id);
        res.json({ message: 'Item rejected and deleted' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})


//delete inappropriate items
router.delete("/:id/remove",authenticateToken,isAdmin,async(req,res)=>{
    try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });

    // Delete images files
    item.imagePaths.forEach(p => {
      const filePath = path.join(__dirname, p);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    });

    await item.remove();
    res.json({ message: 'Item removed' });
  } catch(err) {
    res.status(500).json({ message: 'Server error' });
  }
})

module.exports = router;