const mongoose = require("mongoose");

const connectDB = async() =>{
    try {
        await mongoose.connect("mongodb+srv://bishalhota264:xCoxidbuQ7d9luZV@cluster0.fbbpsv4.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0");
        console.log("MongoDB connected Successfully");
    } catch(err) {
        console.log("MongoDb connection Failed",err);
    }
};

module.exports = connectDB;