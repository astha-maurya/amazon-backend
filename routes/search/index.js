const express = require('express');
const { Product } = require('../../models/product');
const router = express.Router();

//fetching products matching query k
router.get('/', async (req, res) => {
    try {
        let k = req.query.k;
        k = k.replace(/\W+/g, '*|');
        var patt = new RegExp(k + '*', "gi");
        const result = await Product
            .find()
            .or([{ title: patt }, { brand: patt }, { tags: patt }])
            .sort("title");
        res.send(result);
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

module.exports = router;