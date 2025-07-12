const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Product = require("./models/Product");
const User = require("./models/User");
const Cart = require("./models/Cart");
const products = require("./data/products");


dotenv.config();

mongoose.connect(process.env.MONGODB_URL)

// seeding data
const seedData = async () => {
    try {
        await Product.deleteMany();
        await User.deleteMany();
        await Cart.deleteMany();

        //create a default admin user
        const createdUser = await User.create({
            name:"Admin User",
            email:"admin@admin.com",
            password:"12334567",
            role:"admin",
        })

        const userID = createdUser._id;

        const sampleProducts = products.map((product) => {
            return { ...product, user: userID };
        });

        await Product.insertMany(sampleProducts);
        console.log("Data seeded successfully");
        process.exit();

    } catch (error) {
        console.error("Error seeding data:", error);
        process.exit(1);
    }
}

seedData();