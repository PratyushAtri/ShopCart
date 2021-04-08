const express = require('express');
const { check, validationResult } = require('express-validator');

const auth = require('../middleware/auth');

const User = require('../models/User');
const Product = require('../models/Product');

const router = express.Router();

// get all products / return products if success
router.get('/', auth, async (req, res) => {

    try {
        const products = await Product.find();

        res.json(products);
        
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// get a product / return product on success
router.get('/:id', auth, async (req, res) => {

    try {
        const product = await Product.findById(req.params.id);

        res.json(product);
        
    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
    
});


// delete products / return products if success
router.delete('/', [ auth, 
    check('productId', 'Please include the id of the product you want to remove').exists()
], async (req, res) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { productId } = req.body;

    const user = await User.findById(req.user.id);
    const product = await Product.findById(productId);

    try {

        if (user.id == product.user) {
            await Product.findOneAndRemove({ _id: productId });
            const products = await Product.find();

            res.json(products); 
        }        

    }
    catch(err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

// add product / return products if success
router.post('/', [ auth, 
    check('name', 'Please enter a name for your product').exists(),
    check('image', 'Please include a image of your product').exists(),
    check('cost', 'Please enter a cost for the product').exists(),
    check('inStock', 'Please enter the number of products you have in stock').exists(),
    check('qualities', 'Please enter qualities of the product').exists()
], async (req, res) => {
    
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, image, cost, inStock, qualities } = req.body;
    const canBuy = inStock > 0 ? true : false;
    const numberOfQuality = qualities.length;
    let user = await User.findById( req.user.id );
    user = user.id
    
    try {
        
        let product = await Product.findOne({ user });

        if (!product) {
            const newProduct = new Product({
                name,
                image,
                cost,
                inStock,
                canBuy,
                qualities,
                numberOfQuality,
                user
            });
    
            product = await newProduct.save();
            const products = await Product.find();
    
            res.json(products);
        }
        else {
            res.send('Product already exists');
        }

    }
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }


});

module.exports = router;