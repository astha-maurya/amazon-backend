const express = require('express');
const { User } = require('../../../models/user');
const Stripe = require('stripe');
const stripe = Stripe(process.env.STRIPE_SK);
const { Order } = require('../../../models/order');
const router = express.Router({ mergeParams: true });

//fetches client secret for an order==orderId
router.post('/make-payment', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId).populate('pendingOrder.items.product');
        if (!user) return res.status(500).send("Something went wrong.");

        let order = await Order.findById(req.body.orderId);
        if (!order) return res.status(404).send("Order not found");

        if (order.paymentIntent) {
            const paymentIntent = await stripe.paymentIntents.retrieve(
                order.paymentIntent
            );

            if (!paymentIntent) return res.status(500).send("Something went wrong");
            else if (paymentIntent.status === "succeeded") {
                if (order.status != "processing") {
                    order.status = "processing";
                    order.save();
                }
                return res.status(400).send("Payment Process Completed");
            }
            return res.send({ clientSecret: paymentIntent.client_secret, order });
        }
        else {
            const orderId = order._id.toString();

            const paymentIntent = await stripe.paymentIntents.create({
                amount: Math.round(order.orderTotal) * 100,
                currency: 'inr',
                payment_method_types: ['card'],
                metadata: {
                    orderId
                }
            }, {
                idempotencyKey: orderId
            });
            if (!paymentIntent) return res.status(500).send("Something went wrong");

            order.paymentIntent = paymentIntent.id;

            await order.save();
            return res.send({ clientSecret: paymentIntent.client_secret, order });
        }
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

router.post('/update-status', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId).populate('pendingOrder.items.product');
        if (!user) return res.status(500).send("Something went wrong.");

        let order = await Order.findById(req.body.orderId);
        if (!order) return res.status(404).send("Order not found");

        const paymentIntent = await stripe.paymentIntents.retrieve(
            order.paymentIntent
        );

        if (!paymentIntent) return res.status(500).send("Something went wrong");

        if (paymentIntent.status === "succeeded") order.status = "processing";
        else order.status = "payment-failed";

        await order.save();
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

module.exports = router;