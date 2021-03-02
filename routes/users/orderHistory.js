const { User } = require('../../models/user');
const express = require('express');
const { Order } = require('../../models/order');
const router = express.Router({ mergeParams: true });

router.use((req, res, next) => {
    const sessionUser = req.session.user;
    if (!sessionUser) return res.send(null);
    next();
});

//fetches order history of logged in user
router.get('/', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId).populate('cart.product');
        if (!user) return res.status(500).send("Something went wrong.");

        await Order.updateMany({ user: user._id, created: { $lte: (Date.now() - 1200000) }, status: "payment-pending" },
            { $set: { status: "payment-failed" } });

        let orderHistory = await Order
            .find({ user: user._id })
            .populate('items.product')
            .sort({ created: -1 });

        res.send(orderHistory);
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

module.exports = router;