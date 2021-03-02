const express = require("express");
const { Product, validateProduct } = require('../../models/product');

const router = express.Router();

//for adding products to database
router.post("/", async (req, res) => {
    try {
        const { error } = validateProduct(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let product = new Product(req.body);
        product = await product.save();
        if (!product) return res.status(500).send("Something went wrong");
        res.send(product);
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

module.exports = router;