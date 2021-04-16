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

// get all orders
router.get('/orders', auth, async (req, res) => {

    const user = await User.findById(req.user.id);
    const orders = await Order.find();
    let admin = user.admin;

    try {

        if (admin) {
            res.json(orders);
        }

        res.json({ errors: "You are not a admin, you can not access to this command" });

    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// delete/cancel order
router.delete('/:orderListId/:productId', auth, async (req, res) => {
    
    const user = await User.findById(req.user.id);
    const orders = await Order.findById(req.params.orderListId);
    let admin = user.admin;

    try {

        if (admin) {
            const removeIndex = orders.orders.map(it => it.productId).indexOf(req.params.productId);
            orders.orders.splice(removeIndex, 1);
            await orders.save();

            res.json(orders);
        }

        res.json({ errors: "You are not a admin, you can not access to this command" });

    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

module.exports = router;