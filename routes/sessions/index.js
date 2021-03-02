const express = require("express");
const { User, validateExistingUser } = require('../../models/user');
const bcrypt = require("bcrypt");
const router = express.Router();

//login an exisiting user
router.post("/", async (req, res) => {
    try {
        const { error } = validateExistingUser(req.body);
        if (error) return res.status(400).send("Incorrect e-mail or password");

        let user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(401).send("Incorrect e-mail or password");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(401).send("Incorrect e-mail or password");

        const sessionUser = { userId: user._id, name: user.name, email: user.email };
        req.session.user = sessionUser;
        res.send({ name: user.name, email: user.email });
    } catch {
        res.status(400).send("Something went Wrong");
    }
})

//logout an existing user
router.delete("/", async (req, res) => {
    try {
        const user = req.session.user;
        if (!user) return res.status(400).send("Something went wrong");

        req.session.destroy(er => {
            if (er) return res.status(500).send("Something went wrong");

            const { SESS_NAME = "sid" } = process.env;
            res.clearCookie(SESS_NAME);
            res.send({ name: user.name, email: user.email });
        });
    } catch {
        res.status(400).send("Something went Wrong");
    }
})

//fetches the current user
router.get("/", async (req, res) => {
    try {
        const user = req.session.user;
        if (user) res.send({ name: user.name, email: user.email });
        else res.send(null);
    } catch {
        res.status(400).send("Something went Wrong");
    }
});

module.exports = router;