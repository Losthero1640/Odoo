const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const bycrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const itemRoutes = require("./routes/itemRoutes");
const userDashboardRoutes = require("./routes/userDashboardRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = "PhoenixCOde1234@"

const PORT = 4000;

connectDB();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/",(req,res)=>{
    res.send("welcome to Phoenix Code");
})

app.use('/api', userRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/users/dashboard", userDashboardRoutes);
app.use("/api/admin/items", adminRoutes);



app.listen(PORT,()=>{
    console.log(`server is running on http://localhost:${PORT}`);
})




