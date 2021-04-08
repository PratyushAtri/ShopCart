const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const OrderSchema = new mongoose.Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    orders: [
        {
            productId: {
                type: Schema.Types.ObjectId,
                ref: 'products'
            },
            date: {
                type: Date,
                defaul: Date.now
            },
        }
    ]

});

module.exports = Order = mongoose.model('order', OrderSchema);