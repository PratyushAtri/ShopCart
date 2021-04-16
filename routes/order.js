const express = require('express');

const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const auth = require('../middleware/auth');

const router = express.Router();

// add product to order list
router.post('/:id', auth, async (req, res) => {

    const user = await User.findById(req.user.id);
    let product = await Product.findById(req.params.id);
    let orderList = await Order.findOne({ userId: user.id });

    try {
        
        if (!orderList) {
            orderList = new Order({
                userId: user.id,
                orders: []
            });
        }

        if (product.inStock > 0) {
            orderList.orders.push({
                productId: product.id
            });

            product.inStock--;

            await product.save();
            await orderList.save();

            res.json(orderList);
        }
        else {
            res.json({ errors: "There are no products in the stock" });
        }
        
    }
    catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// get ordered products
router.get('/', auth, async (req, res) => {

    let orders = await Order.findOne({ userId: req.user.id });
    let products = [];
    let i = 0;

    try {

        if (orders) {
            let length = orders.orders.length;

            for (; i < length; i++) {
                products[i] = await Product.findOne( { userId: orders.orders[i].userId } );
            }

            res.json(products);
        } 

        res.json({ errors: "You haven't ordered any product yet" });

    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    } 

});

module.exports = router;