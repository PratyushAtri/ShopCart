const express = require('express');
const {check, validationResult} = require('express-validator');
const config = require('config');
const jwt = require('jsonwebtoken');

const router = express.Router();

const User = require('../models/User');

router.post ('/', [
    check('name', 'Name is required').not().isEmpty(),
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Please Enter a password with 5 or more characters').isLength({ min: 5 }),
    check('Admin', 'Wanna be an admin? Enter admin  password')
], async (req, res) => {
   
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password, adminPass } = req.body;
    let admin = false;

    try {

        // See if the user exists
        let user = await User.findOne({ name });  
        
        if (user) {
            return res.status(400).json({ errors: [{ msg: `User ${name} already exists` }] });
        }

        if (adminPass === 94038020440540460420160) {
            admin = true;
        }

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