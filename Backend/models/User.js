const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");


const userSchema = new mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true,
        trim:true,
        match: [/.+\@.+\..+/, "Please enter a valid email address"]
    },
    passwordHash:{
        type: String,
        required: true,
    },
    isAdmin:{
        type: Boolean,
        default: false
    },
    points:{
        type:Number,
        default:0
    },
    profileDetails:{
        fullName:String,
        age:Number,
        gender:String,
    }
});



module.exports = mongoose.model("User",userSchema);