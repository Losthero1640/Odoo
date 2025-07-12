const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/User");
const {authenticateToken,isAdmin} = require("../middleware/authMiddleware");

const jwt = require("jsonwebtoken");
const JWT_SECRET = "PhoenixCOde1234@"

const router = express.Router();

router.post('/auth/signup', async (req, res) => {
    try {
        const { email, password, fullName } = req.body;
        if (!(email && password)) return res.status(400).json({ message: 'Email and password required' });

        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: 'Email already registered' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = new User({ email, passwordHash, profileDetails: { fullName } });
        await user.save();

        const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!(email && password)) return res.status(400).json({ message: 'Email and password required' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ message: 'Invalid credentials' });

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({ id: user._id, email: user.email, isAdmin: user.isAdmin }, JWT_SECRET);
        res.json({ token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

router.get("/user/profile", authenticateToken,async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-passwordHash');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
})

router.put('/user/profile', authenticateToken, async (req,res)=>{
  try {
    const { fullName } = req.body;
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if(fullName !== undefined) user.profileDetails.fullName = fullName;
    await user.save();
    res.json(user);
  } catch(err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;