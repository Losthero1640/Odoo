const express = require("express");
const multer = require("multer");
const cloudinary = require("cloudinary").v2;
const streamifier = require("streamifier");

require("dotenv").config();

const router = express.Router();

//Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD__NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post("/", upload.single("image"),async(req,res) =>{
    try {
        if(!req.file) {
            return res.status(400).json({message: "No file uploaded"});
        } 
        
        const streamUpload = (fileBuffer) => {
            return new Promise((resolve,reject) => {
                const stream = cloudinary.uploader.upload_stream((error, result) =>{
                    if(result) {
                        resolve(result)
                    } else {
                        reject(error)
                    }
                });

                //streamifier to convert file buffer to a stream
                streamifier.createReadStream(fileBuffer).pipe(stream);
            });
        };

        //Call the streamUpload function
        const result = await streamUpload(req.file.buffer);

        // Respond with uploaded image
        res.json({
            imageUrl: result.secure_url
        });
        
    } catch (error) {
        console.error("Error uploading image:", error);
        res.status(500).json({message: "Internal server error"});
    }
});

module.exports = router;

