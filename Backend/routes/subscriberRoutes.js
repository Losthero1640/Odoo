const express = require('express');
const router = express.Router();
const Subscriber = require('../models/Subscriber');




//POST /api/subscribe
router.post("/subscribe",async (req, res) => {
    const {email} = req.body;

    if(!email) {
        return res.status(400).json({message:"Email is required"});
    }

    if(!email.includes("@")) {
        return res.status(400).json({message:"Invalid email format"});
    }


    try {
        let subscriber = await Subscriber.findOne({ email });

        if(subscriber) {
            return res.status(400).json({message:"Email is already subscribed"});
        }

        //create if not exists
        subscriber = new Subscriber({ email });
        await subscriber.save();
        return res.status(201).json({message:"Successfully subscribed to the newsletter"});

    } catch (error) {
        return res.status(500).json({message:"Internal server error"});
    }
})

module.exports = router;