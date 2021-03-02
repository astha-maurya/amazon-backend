const mongoose = require('mongoose');
const express = require('express');
const Joi = require('joi');
const { productSchema } = require("./product");
const { addressSchema } = require('./address');
const { string } = require('joi');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 5,
        maxlength: 50,
    },
    email: {
        type: String,
        required: true,
        minlength: 5,
        maxlength: 255,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 1024,
    },
    cart: {
        type: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, default: 1, min: 0 }
        }],
        default: []
    },
    address: {
        type: [addressSchema],
        default: []
    },
    pendingOrder: {
        type: new mongoose.Schema({
            createdOn: Date,
            orderId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Order'
            },
            items: {
                type: [{
                    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
                    quantity: { type: Number, default: 1 }
                }],
                default: []
            },
            delivery: {
                type: String,
                enum: ["standard", "express", "one-day"]
            },
            itemsTotal: {
                type: Number,
                min: 0,
                default: 0
            },
            deliveryCharges: {
                type: Number,
                min: 0,
                default: 0
            },
            orderTotal: {
                type: Number,
                min: 0,
                default: 0
            },
            status: {
                type: Number,
                min: -1,
                max: 5,
                default: 0
            },
            paymentIntentId: String,
            shippingAddress: {
                type: addressSchema,
                default: null,
            },
            containsGift: {
                type: Boolean,
                default: false
            }
        },
        ),
        default: {}
    }
});

const User = mongoose.model('User', userSchema);

function validateNewUser(user) {
    const schema = Joi.object({
        name: Joi.string().min(5).max(50).required(),
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
    });

    return schema.validate(user);
};

function validateExistingUser(user) {
    const schema = Joi.object({
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(6).max(255).required()
    });

    return schema.validate(user);
};


exports.User = User;
exports.validateNewUser = validateNewUser;
exports.validateExistingUser = validateExistingUser;
