const mongoose = require('mongoose');

const Joi = require('joi');

const addressSchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 3,
        maxlength: 50,
        required: true
    },
    mobileNumber: {
        type: String,
        required: true,
        minlength: 10,
        maxlength: 10,
    },
    pinCode: {
        type: String,
        required: true,
        minlength: 6,
        maxlength: 6,
    },
    line1: {
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true
    },
    line2: {
        type: String,
        minlength: 3,
        maxlength: 255,
        required: true
    },
    line3: {
        type: String,
        minlength: 0,
        maxlength: 255
    },
    city: {
        type: String,
        minlength: 3,
        maxlength: 100
    },
    state: {
        type: String,
        minlength: 3,
        maxlength: 100
    },
    type: {
        type: String,
        enum: ["home", "office"],
        required: true
    }
});

const Address = mongoose.model('Address', addressSchema);

function validateNewAddress(address) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(25).required(),
        mobileNumber: Joi.string().min(10).max(10).required(),
        pinCode: Joi.string().min(6).max(6),
        line1: Joi.string().min(3).max(255).required(),
        line2: Joi.string().min(3).max(255).required(),
        line3: Joi.string().allow("").min(0).max(255),
        city: Joi.string().min(3).max(25).required(),
        state: Joi.string().min(3).max(25).required(),
        type: Joi.string().required(),
        addressId: Joi.string()
    });

    return schema.validate(address);
};

// function validateExistingaddress(address) {
//     const schema = Joi.object({
//         email: Joi.string().min(5).max(255).required().email(),
//         password: Joi.string().min(6).max(255).required()
//     });

//     return schema.validate(address);
// };

exports.Address = Address;
exports.validateNewaddress = validateNewAddress;
exports.addressSchema = addressSchema;
// exports.validateExistingaddress = validateExistingaddress;