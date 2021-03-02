const mongoose = require('mongoose');
const Joi = require('joi');
const { addressSchema } = require('./address');

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
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
    shippingAddress: {
        type: addressSchema,
        required: true
    },
    paymentIntent: String,
    created: {
        type: Number,
        default: Date.now
    },
    items: {
        type: [{
            product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
            quantity: { type: Number, default: 1 }
        }],
        required: true
    },
    status: {
        type: String,
        enum: ["payment-pending", "processing", "shipped", "delivered", "payment-failed"],
        default: "payment-pending"
    },
    containsGift: {
        type: Boolean,
        default: false
    }
});
const Order = mongoose.model('Order', orderSchema);


function validateDeliveryOption(deliveryOption) {
    const schema = Joi.object({
        delivery: Joi.string().required().valid('standard', 'express', 'one-day')
    });
    return schema.validate(deliveryOption);
};

function validateGiftOption(giftOption) {
    const schema = Joi.object({
        containsGift: Joi.bool().required()
    });
    return schema.validate(giftOption);
};

function itemsTotal(items) {
    console.log(items);
    let total = 0;
    for (let i = 0; i < items.length; i++) {
        total = total + items[i].quantity * items[i].product.price;
    }
    return total;
}

exports.Order = Order;
exports.orderSchema = orderSchema;
exports.validateDeliveryOption = validateDeliveryOption;
exports.validateGiftOption = validateGiftOption;
exports.itemsTotal = itemsTotal;