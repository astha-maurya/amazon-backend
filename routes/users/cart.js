const { Product } = require('../../models/product');
const { User } = require('../../models/user');
const express = require('express');
const router = express.Router({ mergeParams: true });

router.use((req, res, next) => {
    const sessionUser = req.session.user;
    if (!sessionUser) return res.send(null);
    next();
});

//fetches cart array of the logged in user
router.get('/', async (req, res) => {
    const sessionUser = req.session.user;

    let user = await User.findById(sessionUser.userId).populate('cart.product');
    if (!user) return res.status(500).send("Something went wrong.");

    res.send(user.cart);
});

//increases quantity of product with id==product else adds the product to cart array
router.post('/', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId);
        if (!user) return res.status(500).send("Something went wrong.");

        const productObject = await Product.findById(req.body.product);
        if (!productObject) return res.status(404).send("Product with requested id does not exist");

        User.bulkWrite(
            [
                {
                    "updateOne": {
                        "filter": { "_id": sessionUser.userId, "cart.product": req.body.product },
                        "update": {
                            "$inc": { "cart.$.quantity": 1 }
                        }
                    }
                },
                {
                    "updateOne": {
                        "filter": { "_id": sessionUser.userId, "cart.product": { $ne: req.body.product } },
                        "update": {
                            "$push": { cart: { product: req.body.product } }
                        }
                    }
                }
            ], async (e, r) => {
                if (e) return res.status(400).send("Something went wrong");
                else {
                    return res.send(productObject);
                }
            }
        );
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

//updates quantity of product with id=product
router.put('/', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId);
        if (!user) return res.status(500).send("Something went wrong.");

        const productObject = await Product.findById(req.body.product);
        if (!productObject) return res.status(404).send("Product with requested id does not exist");

        let productInCart = await User.findOne({ _id: sessionUser.userId, "cart.product": req.body.product });
        if (!productInCart) return res.status(400).send("Something went wrong");

        if (parseInt(req.body.quantity) === NaN || req.body.quantity < 0) return res.status(400).send("Invalid Quantity");

        User.bulkWrite(
            [
                {
                    "updateOne": {
                        "filter": { "_id": sessionUser.userId, "cart.product": req.body.product },
                        "update": {
                            "$set": { "cart.$.quantity": parseInt(req.body.quantity) }
                        }
                    }
                },
                {
                    "updateOne": {
                        "filter": { "_id": sessionUser.userId, "cart.quantity": 0 },
                        "update": {
                            "$pull": { cart: { quantity: 0 } }
                        }
                    }
                }
            ], async (e, r) => {
                if (e) return res.status(400).send("Something went wrong");
                user = await User.findById(sessionUser.userId);
                return res.send(user.cart);
            }
        );
    } catch {
        res.status(400).send("Something went Wrong");
    }
})

//deletes product with id=product
router.delete('/', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId);
        if (!user) return res.status(500).send("Something went wrong.");

        const productObject = await Product.findById(req.query.product);
        if (!productObject) return res.status(404).send("Product with requested id does not exist");

        User.bulkWrite(
            [
                {
                    "updateOne": {
                        "filter": { "_id": sessionUser.userId, "cart.product": req.query.product },
                        "update": {
                            "$set": { "cart.$.quantity": 0 }
                        }
                    }
                },
                {
                    "updateOne": {
                        "filter": { "_id": sessionUser.userId, "cart.quantity": 0 },
                        "update": {
                            "$pull": { cart: { quantity: 0 } }
                        }
                    }
                }
            ], async (e, r) => {
                if (e) return res.send(e);
                user = await User.findById(sessionUser.userId);
                return res.send(productObject);
            }
        );
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

module.exports = router;