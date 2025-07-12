const mongoose = require("mongoose");


const itemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    category: String,
    type: String,
    size: String,
    condition: String,
    tags: [String],
    imagePaths: [String], // store file paths
    uploader: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    approved: {
        type: Boolean,
        default: false
    },
    availability: {
        type: String,
        enum: ['available', 'swapped', 'redeemed'],
        default: 'available'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model("Item", itemSchema);