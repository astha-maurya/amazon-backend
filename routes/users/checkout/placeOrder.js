const express = require('express');
const { User } = require('../../../models/user');
const { Order } = require('../../../models/order');
const router = express.Router({ mergeParams: true });

//transfers cart items to a new order
router.post('/', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId).populate('pendingOrder.items.product');
        if (!user) return res.status(500).send("Something went wrong.");

        let pendingOrder = user.pendingOrder;
        const newOrder = new Order({
            user: user._id,
            itemsTotal: Math.round(pendingOrder.itemsTotal),
            deliveryCharges: pendingOrder.deliveryCharges,
            orderTotal: Math.round(pendingOrder.orderTotal),
            containsGift: pendingOrder.containsGift,
            delivery: pendingOrder.delivery,
            items: user.pendingOrder.items,
            shippingAddress: user.pendingOrder.shippingAddress
        });

        newOrder.save((err, order) => {
            if (err) return res.send(err).status(400);
            user.pendingOrder = {};
            user.cart = [];
            user.save((err, user) => {
                if (err) return res.send(err).status(500);
                return res.status(200).send({ orderId: order._id });
            });
        });
    } catch {
        res.status(400).send("Something went Wrong");
    }
});


module.exports = router;