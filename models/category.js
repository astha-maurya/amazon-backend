const mongoose = require('mongoose');
const Joi = require('joi');

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        minlength: 1,
        maxlength: 255,
        required: true
    },
    slug: {
        type: String,
        required: true,
        unique: true
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

function validateCategory(category) {
    const schema = Joi.object({
        name: Joi.string().min(1).max(255).required(),
        parentId: Joi.string()
    });

    return schema.validate(category);
};

exports.Category = Category;
exports.validateCategory = validateCategory;
exports.categorySchema = categorySchema;