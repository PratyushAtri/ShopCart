const express = require('express');
const {check, validationResult} = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/User');

// Register User // JWT token returned for success
router.post ('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please Enter a password with 5 or more characters').isLength({ min: 5 })
], async (req, res) => {
   
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, adminPass } = req.body;
    const adminCorrectPass = 94038020440540460420160;
    

    try {
        let admin = false;
        
        // See if the user exists
        let user = await User.findOne({ name });  
        
        // user already exists
        if (user) {
            return res.status(400).json({ errors: [{ msg: `User ${name} already exists` }] });
        }

        // user does not exist
        // see if the user is admin
        if (adminPass === adminCorrectPass) {
            admin = true;
        }

        // save the user ini database 
        user = new User({
            name,
            email,
            password,
            admin
        });

        await user.save();

        // Return JWT

        const payload = {
            user: {
                id: user.id
            }
        }

        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
            );

    } 
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }

});

module.exports = router;