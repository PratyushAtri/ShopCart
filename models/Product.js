const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    cost: {
        type: Number,
        required: true,
        default: 0
    },
    inStock: {
        type: Number,
        required: true,
        default: 0
    },
    canBuy: {
        type: Boolean,
        required: true,
        default: false
    },
    qualities: {
        type: Array,
        required: true
    },
    numberOfQuality: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = Product = mongoose.model('product', ProductSchema);