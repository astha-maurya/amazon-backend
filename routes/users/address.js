const { User } = require('../../models/user');
const express = require('express');
const { validateNewaddress } = require('../../models/address');
const router = express.Router({ mergeParams: true });

router.use((req, res, next) => {
    const sessionUser = req.session.user;
    if (!sessionUser) return res.send(null);
    next();
});

//fetches address array of logged in user
router.get('/', async (req, res) => {
    try {
        const sessionUser = req.session.user;

        let user = await User.findById(sessionUser.userId);
        if (!user) return res.status(500).send("Something went wrong.");

        res.send(user.address);
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

//adds new address to address array of logged in user
router.post('/', async (req, res) => {
    try {
        const { error } = validateNewaddress(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId);
        if (!user) return res.status(500).send("Something went wrong.");

        let addressAdded = user.address.addToSet(req.body);

        user.save((e, r) => {
            if (e) return res.status(400).send("Something went wrong");
            return res.send(addressAdded[0]);
        });
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

//modifies address  with id==addressId of logged in user
router.put('/', async (req, res) => {
    try {
        const { error } = validateNewaddress(req.body);
        if (error) return res.status(400).send(error.details[0].message);

        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId);
        if (!user) return res.status(500).send("Something went wrong.");

        let addressObject = user.address.id(req.query.addressId);
        addressObject.set(req.body);
        user.save((e, r) => {
            if (e) return res.status(400).send("Something went wrong");
            return res.status(200).send(addressObject);
        });
    } catch {
        res.status(400).send("Something went Wrong");
    }
})

//deletes address  with id==addressId of logged in user
router.delete('/', async (req, res) => {
    try {
        const sessionUser = req.session.user;
        let user = await User.findById(sessionUser.userId);
        if (!user) return res.status(500).send("Something went wrong.");

        let newAddressArray = user.address.pull(req.query.addressId);

        user.save((e, r) => {
            if (e) res.status(400).send("Something went wrong");
            return res.status(200).send(newAddressArray);
        });
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

module.exports = router;