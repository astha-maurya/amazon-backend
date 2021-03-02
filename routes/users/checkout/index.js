const express = require('express');
const payment = require("./payment");
const placeOrder = require("./placeOrder");
const pendingOrder = require("./pendingOrder");
const router = express.Router({ mergeParams: true });

router.use((req, res, next) => {
    const sessionUser = req.session.user;
    if (!sessionUser) return res.send(null);
    next();
});

router.use('/payment', payment);
router.use('/pending-order', pendingOrder);
router.use('/place-order', placeOrder);

module.exports = router;