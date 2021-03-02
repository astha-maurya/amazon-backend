const mongoose = require('mongoose');
const express = require('express');
const cors = require('cors');
require('dotenv').config();
const users = require('./routes/users/index');
const sessions = require('./routes/sessions/index');
const categories = require('./routes/categories/index');
const products = require('./routes/products/index');
const search = require('./routes/search/index');
const session = require("express-session");
const MongoStore = require('connect-mongo').default;
const app = express();

mongoose.connect(process.env.DB_CONNECTION_STRING)
    .then(() => console.log('connected to MongoDB...'))
    .catch(err => console.error('could not connect to MongoDB..', err));

const { SESS_NAME,
    SESS_SECRET,
    SESS_LIFETIME
} = process.env;

app.use(cors())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(session({
    name: SESS_NAME,
    secret: SESS_SECRET,
    saveUninitialized: false,
    resave: false,
    cookie: {
        sameSite: true,
        maxAge: parseInt(SESS_LIFETIME)
    },
    store: MongoStore.create({ mongoUrl: process.env.DB_CONNECTION_STRING })
}));
app.use('/api/users', users);
app.use('/api/sessions', sessions);
app.use('/api/category', categories);
app.use('/api/products', products);
app.use('/api/search', search);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Listening on PORT ${PORT}......`));