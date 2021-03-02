const mongoose = require('mongoose');
const express = require('express');
const Joi = require('joi');

const productSchema = new mongoose.Schema({
    title: {
        type: String,
        minlength: 1,
        maxlength: 255,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    brand: {
        type: String,
        required: true,
        minlength: 1,
        maxlength: 255,
    },
    rating: {
        type: Number,
        required: true,
        min: 0,
        max: 5
    },
    image: {
        type: String,
        required: true,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true
    },
    tags: [String],
    id: Number
});

const Product = mongoose.model('Product', productSchema);

function validateProduct(product) {
    const schema = Joi.object({
        title: Joi.string().min(1).max(255).required(),
        brand: Joi.string().min(1).max(255).required(),
        price: Joi.number().min(0).required(),
        rating: Joi.number().min(0).max(5).required(),
        image: Joi.string().required(),
        id: Joi.number(),
        category: Joi.string(),
        tags: Joi.array()
    });

    return schema.validate(product);
};

exports.Product = Product;
exports.validateProduct = validateProduct;
exports.productSchema = productSchema;