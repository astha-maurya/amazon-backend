const { User, validateNewUser } = require('../../models/user');
const express = require('express');
const cart = require("./cart");
const address = require("./address");
const checkout = require("./checkout/index");
const orderHistory = require("./orderHistory");
const bcrypt = require("bcrypt");
const router = express.Router();

router.use('/cart/:id?', cart);
router.use('/address', address);
router.use('/checkout', checkout);
router.use('/order-history', orderHistory);

//creates a new user
router.post('/', async (req, res) => {
    try {
        const { error } = validateNewUser(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        let user = await User.findOne({ email: req.body.email });
        if (user) return res.status(400).send("User already registered.");
        const hashingSalt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, hashingSalt);
        user = new User({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        user = await user.save();
        if (!user) return res.status(500).send("Something went wrong.");

        const sessionUser = { userId: user._id, email: user.email, name: user.name };
        req.session.user = sessionUser;
        res.send({ name: user.name, email: user.email });
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

module.exports = router;