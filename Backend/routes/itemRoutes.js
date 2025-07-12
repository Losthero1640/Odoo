const express = require("express");
const Item = require("../models/Item");
const { authenticateToken, isAdmin } = require("../middleware/authMiddleware");
const upload = require("../middleware/multerConfig");
const User = require("../models/User");
const Swap = require("../models/Swap");

const router = express.Router();


router.post("/create", authenticateToken, upload.array('images', 5), async (req, res) => {
    try {
        const {
            title,
            description,
            category,
            type,
            size,
            condition,
            tags,
        } = req.body;

        if (!title) return res.status(400).json({ message: 'Title is required' });
        const imagePaths = req.files.map(f => '/uploads/' + f.filename);

        //save item 
        const item = new Item({
            title,
            description,
            category,
            type,
            size,
            condition,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            imagePaths,
            uploader: req.user.id,
            approved: false,
            availability: 'available',
        });

        await item.save();
        res.status(201).json({ message: "item submitted for approval", itemId: item._id })
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
})

//items for landing page 
router.get("/featured", async (req, res) => {
    try {
        const items = await Item.find({
            approved: true,
            availability: 'available'
        }).sort({ createdAt: -1 }).limit(10);
        res.json(items);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
})

//filters pagination 

router.get("/", async (req, res) => {
    try {
        const { page = 1, limit = 12, category, tags } = req.query;
        const query = { approved: true, availability: 'available' };

        if (category) query.category = category;
        if (tags) {
            const tagsArray = tags.split(',').map(t => t.trim());
            query.tags = { $all: tagsArray };
        }

        const skip = (page - 1) * limit;
        const items = await Item.find(query).skip(skip).limit(Number(limit));
        const count = await Item.countDocuments(query);
        res.json({ items, total: count, page: Number(page), pages: Math.ceil(count / limit) });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
})

//single item based on id 
router.get("/:id", async (req, res) => {
    try {
        const item = await Item.findById(req.params.id).populate('uploader', 'profileDetails email');
        if (!item) return res.status(404).json({ message: 'Item not found' });
        if (!item.approved) return res.status(403).json({ message: 'Item not approved' });
        res.json(item);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
})


//Item Swap 

router.post("/:id/swap-request",authenticateToken,async(req,res)=>{
    try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!item.approved) return res.status(403).json({ message: 'Item not approved' });
    if (item.availability !== 'available') return res.status(400).json({ message: 'Item is not available for swap' });
    if (item.uploader.equals(req.user.id)) return res.status(400).json({ message: 'Uploader cannot request own item' });

    // Check if user already has a pending swap for this item
    const existing = await Swap.findOne({ item: item._id, requester: req.user.id, status: 'pending' });
    if (existing) return res.status(400).json({ message: 'Swap request already pending for this item' });

    const swap = new Swap({
      item: item._id,
      requester: req.user.id,
      status: 'pending',
    });
    await swap.save();

    res.json({ message: 'Swap request submitted' });
  } catch(err) {
    res.status(500).json({ message: 'Server error' });
  }
})


//Redeem via points
router.post("/:id/redeem",authenticateToken,async(req,res)=>{
    try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: 'Item not found' });
    if (!item.approved) return res.status(403).json({ message: 'Item not approved' });
    if (item.availability !== 'available') return res.status(400).json({ message: 'Item is not available' });

    
    const POINTS_REQUIRED = 100;
    const user = await User.findById(req.user.id);
    if (user.points < POINTS_REQUIRED) return res.status(400).json({ message: 'Not enough points to redeem' });

    
    user.points -= POINTS_REQUIRED;
    await user.save();

    
    item.availability = 'redeemed';
    await item.save();

    res.json({ message: 'Item redeemed successfully' });
  } catch(err) {
    res.status(500).json({ message: 'Server error' });
  }
})

module.exports = router;
