const express = require("express");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");
const aiAssistantService = require("../services/aiAssistantService");

const router = express.Router();

// post api/products
router.post("/", protect, admin, async (req, res) => {
    try {
        const { name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;
        const product = new Product({
            name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
            user: req.user._id, // reference to the admin user who created it 
        });

        const createdProduct = await product.save();

        // Reindex the new product in vector database
        await aiAssistantService.autoReindexOnChange('products', createdProduct._id.toString());

        // Send new arrival notification to subscribers (if product is published)
        if (isPublished) {
            // This would typically get all subscribers
            // For now, we'll just log it
            console.log(`New product published: ${name}`);
        }

        res.status(201).json(createdProduct);

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error creating product" });
    }
})

// PUT /api/products/:id
// updating an existing product
router.put("/:id", protect, admin, async (req, res) => {
    try {
        const { name,
            description,
            price,
            discountPrice,
            countInStock,
            category,
            brand,
            sizes,
            colors,
            collections,
            material,
            gender,
            images,
            isFeatured,
            isPublished,
            tags,
            dimensions,
            weight,
            sku,
        } = req.body;
        const product = await Product.findById(req.params.id);
        if (product) {
            const oldPrice = product.price;
            const oldStock = product.countInStock;

            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.discountPrice = discountPrice || product.discountPrice;
            product.countInStock = countInStock || product.countInStock;
            product.category = category || product.category;
            product.brand = brand || product.brand;
            product.sizes = sizes || product.sizes;
            product.colors = colors || product.colors;
            product.collections = collections || product.collections;
            product.material = material || product.material;
            product.gender = gender || product.gender;
            product.images = images || product.images;
            product.isFeatured = isFeatured != undefined ? isFeatured : product.isFeatured;
            product.isPublished = isPublished != undefined ? isPublished : product.isPublished;
            product.tags = tags || product.tags;
            product.dimensions = dimensions || product.dimensions;
            product.weight = weight || product.weight;
            product.sku = sku || product.sku;

            const updatedProduct = await product.save();

            // Reindex the updated product in vector database
            await aiAssistantService.autoReindexOnChange('products', product._id.toString());

            // Check for price drop and notify interested users
            if (price && price < oldPrice) {
                // This would typically get users who have this product in their wishlist
                // For now, we'll just log it
                console.log(`Price drop detected for ${product.name}: ${oldPrice} -> ${price}`);
            }

            // Check for restock and notify interested users
            if (countInStock && countInStock > 0 && oldStock === 0) {
                // This would typically get users who were waiting for restock
                // For now, we'll just log it
                console.log(`Product restocked: ${product.name}`);
            }

            res.status(200).json(updatedProduct);
        } else {
            res.status(404).json({ message: "Product not found" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error updating product" });
    }
})

//Delete /api/products/:id
router.delete("/:id", protect, admin, async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            await product.deleteOne();
            
            // Reindex to remove the product from vector database
            await aiAssistantService.autoReindexOnChange('products', req.params.id);
            
            res.json({ message: "Product deleted successfully" });
        } else {
            res.status(404).json({ message: "Product not found" })
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Error deleting product" });
    }
})


// get /api/products
// get all product with optional filters

router.get("/", async (req, res) => {
    try {
        const { collection, size, color, gender, minPrice, maxPrice, sortBy, search, category, material, brand, limit } = req.query;
        let query = {};

        //filter logic
        if (collection && collection.toLocaleLowerCase() !== "all") {
            query.collections = collection;
        }

        if (category && category.toLocaleLowerCase() !== "all") {
            query.category = category
        }

        if (material) {
            query.material = { $in: material.split(",") }
        }

        if (brand) {
            query.brand = { $in: brand.split(",") }
        }

        if (size) {
            query.sizes = { $in: size.split(",") }
        }

        if (color) {
            query.colors = { $in: color.split(",") }  //query.colors = {$in:[color]}
        }

        if (gender) {
            query.gender = gender
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) {
                query.price.$gte = Number(minPrice);
            }
            if (maxPrice) {
                query.price.$lte = Number(maxPrice);
            }
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ]
        }


        //sort logic
        let sort = {};
        if (sortBy) {
            switch (sortBy) {
                case "priceAsc":
                    sort = { price: 1 };
                    break;
                case "priceDesc":
                    sort = { price: -1 };
                    break;
                case "popularity":
                    sort = { rating: -1 };
                    break;
                default:
                    break;
            }
        }


        //fetch products and apply sort and limit

        let products = await Product.find(query).sort(sort).limit(Number(limit) || 0);
        res.json(products);


    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Error fetching products" });
    }
});


//best selling products route
// GET /api/products/best-seller
router.get("/best-seller", async (req, res) => {
    try {
        
        const bestSeller = await Product.findOne().sort({rating:-1}); //sort rating -1 means sorting the ratings of the product in descending order
        if(bestSeller){
            res.json(bestSeller)
        }else{
            res.status(404).json({message:"No best selling product found"})
        }
    } catch (error) {
        console.error("Error fetching best selling product:", error);
        res.status(500).json({ message: "Server Error" });
    }
})


//Get /api/products/new-arrivals
// Retrieve latest products 
router.get("/new-arrivals",async (req,res) =>{
    try {
        const newArrivals = await Product.find().sort({ createdAt: -1 }).limit(8); //sort by createdAt in descending order
        res.json(newArrivals);
    } catch (error) {
        console.error("Error fetching new arrivals:", error);
        res.status(500).json({ message: "Server Error" });  
    }
});

//get api/product/:id
//@desc get single product by id

router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);

        } else {
            res.status(404).json({ message: "Product not found" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error fetching product" });
    }
})

//similar products route
// GET /api/products/similar

router.get("/similar/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        const similarProducts = await Product.find({
            _id: { $ne: id },// exclude the current product
            gender: product.gender,
            category: product.category,
        }).limit(4);
        res.json(similarProducts);
    } catch (error) {
        console.error("Error fetching similar products:", error);
        res.status(500).json({ message: "Server Error" });
    }
})





module.exports = router;