const express = require("express");
const User = require("../models/User");
const {protect,admin} = require("../middleware/authMiddleware");

const router = express.Router();

//GET /api/admin/users
//@desc Get all users
//@access private
router.get("/",protect,admin,async(req,res)=>{
    
    try {
        const users = await User.find({});
        return res.status(200).json(users);
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }

});

//POST /api/admin/users
//@desc Create a new user
//@access private
router.post("/",protect,admin,async(req,res) =>{
    const {name,email,password,role} = req.body;

    try {
        let user = await User.findOne({ email });
        if(user) {
            return res.status(400).json({message:"User already exists"});
        }

        user = new User({
            name,
            email,
            password,
            role: role || "customer" // default role will be customer
        })

        await user.save();
        return res.status(201).json({message:"User created successfully", user});

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
});

//PUT /api/admin/users/:id
//@desc Update user details
//@access private
router.put("/:id",protect,admin,async(req,res)=>{
    try {
        const user = await User.findById(req.params.id);
        if(user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.password = req.body.password || user.password;
            user.role = req.body.role || user.role;
        }
        const updatedUser = await user.save();
        res.json({messsage:"User updated successfully", user:updatedUser});
    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
});

//DELETE /api/admin/users/:id
//@desc Delete user
//@access private
router.delete("/:id",protect,admin,async (req,res) => {
    try {
        const user = await User.findById(req.params.id);
        if(user) {
            await user.deleteOne();
            return res.status(200).json({message:"User deleted successfully"});
        } else {
            return res.status(404).json({message:"User not found"});
        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({message:"Internal server error"});
    }
})


module.exports = router;