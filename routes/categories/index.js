const slugify = require('slugify');
const { Category, validateCategory } = require('../../models/category');
const express = require('express');
const { Product } = require('../../models/product');
const router = express.Router();

//fetching products from a category
router.get('/products', async (req, res) => {
    try {
        let k = req.query.k;
        k = k.replace(/\W+/g, '|');
        var patt = new RegExp(k, "gi");
        const result = await Product
            .find()
            .or([{ tags: patt }])
            .sort("title");
        res.send(result);
    }
    catch {
        res.status(400).send("Something went Wrong");
    }
});

//creating a new category
router.post('/', async (req, res) => {
    try {
        const { error } = validateCategory(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const newCategory = {
            name: req.body.name,
            slug: slugify(req.body.name)
        };
        if (req.body.parentId) {
            newCategory.parentId = req.body.parentId;
        }

        let category = await Category.findOne({ slug: newCategory.slug });
        if (category) return res.status(400).send("Category already registered.");

        category = new Category(newCategory);
        category = await category.save();
        if (!category) return res.status(500).send("Something went wrong");

        return res.json({ category });
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

module.exports = router;