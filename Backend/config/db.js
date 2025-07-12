const mongoose = require("mongoose");

const connectDB = async() =>{
    try {
        await mongoose.connect(process.env.MONGODB_URL);
        console.log("MongoDB connected Successfully");
    } catch(err) {
        console.log("MongoDb connection Failed",err);
    }
};

module.exports = connectDB