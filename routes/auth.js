const express = require('express');
const jwt = require('jsonwebtoken');
const config = require('config');
const { check, validationResult } = require('express-validator');

const router = express.Router();

const User = require('../models/User');
const auth = require('../middleware/auth');

// Get user information
router.get('/', auth, async (req, res) => {
    
    try {
        // find the user
        const user = await User.findById(req.user.id).select('-password');
        // send the user
        res.json(user);        
    } 
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');    
    }

});

// Get all Users
router.get('/users', auth, async (req, res) => {

    const user = await User.findById(req.user.id);

    try {
        
        // get all user
        const users = await User.find().select('-password');
        // if current user is an admin send all the users
        if (user.admin == true) {
            res.json(users);
        }
        else {
            res.status(400).json({ errors: 'You are not an Admin' });
        }

    } 
    catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');    
    }

});

// Login User / return jwt if success
router.post('/', [
    check('email', 'Please include a valid email').isEmail(),
    check('password', 'Password is required').exists()
], async (req, res) => {

    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    try {

        // See if usre exists
        let user = await User.findOne({ email });   

        // user does not exists
        if (!user) {
            return res.status(400).json({ errors: [{ msg: 'Invalid email or password' }]});
        }

        // user exists
        // check password
        let isMatch = false;
        // if password is correct make isMatch true
        if (user.password == password) {
            isMatch = true;
        }
        // password dont match
        if (!isMatch) {
            return res.status(400).json({ errors: [{ msg: 'Invalid email or password' }] });
        }

        // return JWT
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