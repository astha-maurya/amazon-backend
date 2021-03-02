const express = require('express');
const { User } = require('../../../models/user');
const { validateDeliveryOption, validateGiftOption } = require('../../../models/order');
const router = express.Router({ mergeParams: true });
const { itemsTotal } = require('../../../models/order')

//fetches the pending order
router.get('/', async (req, res) => {
    try {
        const sessionUser = req.session.user;

        let user = await User.findById(sessionUser.userId).populate('pendingOrder.items.product');
        if (!user) return res.status(500).send("Something went wrong.");

        let { status, items, itemsTotal, deliveryCharges, delivery, orderTotal, containsGift, shippingAddress, orderId, createdOn } = user.pendingOrder;
        const pendingOrder = { status, items, itemsTotal, deliveryCharges, delivery, orderTotal, containsGift, shippingAddress, orderId, createdOn };

        res.send(pendingOrder);
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

//creates new pending order
router.post('/create', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId).populate('cart.product');
        if (!user) return res.status(500).send("Something went wrong.");

        let cartTotal = itemsTotal(user.cart.toObject());

        let newPendingOrder = {
            createdOn: Date.now(),
            containsGift: user.pendingOrder.containsGift,
            items: user.cart,
            itemsTotal: cartTotal,
            orderTotal: cartTotal
        };

        user.pendingOrder = newPendingOrder;

        await user.save();

        user.populate('pendingOrder.items.product', (e, r) => {
            if (e) res.status(500).send("Something went wrong");
            let { status, items, itemsTotal, deliveryCharges, delivery, orderTotal, containsGift, shippingAddress, orderId, createdOn } = user.pendingOrder;
            const pendingOrder = { status, items, itemsTotal, deliveryCharges, delivery, orderTotal, containsGift, shippingAddress, orderId, createdOn };
            res.status(200).send(pendingOrder);
        });
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

//updates the shipping address of the pending order
router.post('/ship-address', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId).populate('pendingOrder.items.product');
        if (!user) return res.status(500).send("Something went wrong.");

        let addressSelected = user.address.id(req.body.addressId);
        if (!addressSelected) return res.status(404).send("Requested address not found");

        user.pendingOrder.shippingAddress = addressSelected;

        await user.save();

        let { status, items, itemsTotal, deliveryCharges, delivery, orderTotal, containsGift, shippingAddress, orderId, createdOn } = user.pendingOrder;
        const pendingOrder = { status, items, itemsTotal, deliveryCharges, delivery, orderTotal, containsGift, shippingAddress, orderId, createdOn };
        res.status(200).send(pendingOrder);
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

//updates shipping option of the pending order
router.post('/ship-option', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId).populate('pendingOrder.items.product');
        if (!user) return res.status(500).send("Something went wrong.");

        const { error } = validateDeliveryOption(req.body);
        if (error) return res.status(400).send("Invalid Delivery Option.");

        let deliveryChosen = req.body.delivery;
        user.pendingOrder.delivery = deliveryChosen;

        if (deliveryChosen === "standard") user.pendingOrder.deliveryCharges = 0;
        else if (deliveryChosen === "express") user.pendingOrder.deliveryCharges = 80;
        else user.pendingOrder.deliveryCharges = 100;

        user.pendingOrder.orderTotal = user.pendingOrder.itemsTotal + user.pendingOrder.deliveryCharges;

        await user.save();

        let { status, items, itemsTotal, deliveryCharges, delivery, orderTotal, containsGift, shippingAddress, orderId, createdOn } = user.pendingOrder;
        const pendingOrder = { status, items, itemsTotal, deliveryCharges, delivery, orderTotal, containsGift, shippingAddress, orderId, createdOn };
        res.status(200).send(pendingOrder);
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

//updates gift option of pending order
router.post('/gift-option', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId).populate('pendingOrder.items.product');
        if (!user) return res.status(500).send("Something went wrong.");

        const { error } = validateGiftOption(req.body);
        if (error) return res.status(400).send("Invalid Gift Option.");

        let containsGiftChosen = req.body.containsGift;
        user.pendingOrder.containsGift = containsGiftChosen;

        await user.save();

        let { status, items, itemsTotal, deliveryCharges, delivery, orderTotal, containsGift, shippingAddress, orderId, createdOn } = user.pendingOrder;
        const pendingOrder = { status, items, itemsTotal, deliveryCharges, delivery, orderTotal, containsGift, shippingAddress, orderId, createdOn };
        res.status(200).send(pendingOrder);
    } catch {
        res.status(400).send("Something went Wrong");
    }
});


module.exports = router;