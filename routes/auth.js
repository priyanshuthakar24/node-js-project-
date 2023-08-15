const express = require('express');
const router = express.Router();
const { check, body } = require('express-validator');
const authcontroller = require('../controllers/auth');
const User = require('../models/user');
const { route } = require('./admin');
router.get('/login', authcontroller.getlogin);
router.get('/signup', authcontroller.getsignup);
router.post('/signup', [check('email').isEmail().withMessage("please enter valid email.").custom((value, { req }) => {
    return User.findOne({ email: value }).then(userDoc => {
        if (userDoc) {
            return Promise.reject('E-mail exists already, please pick a different one.')
        }
    });
}), body('password', 'enter valid password').isLength({ min: 5 })], authcontroller.postSignup)
router.post('/login', authcontroller.postLogin);
router.post('/logout', authcontroller.postlogout);
router.get('/reset', authcontroller.getreset);
router.post('/reset', authcontroller.postreset);
router.get('/reset/:token', authcontroller.getnewpassword);
router.post('/new-password',authcontroller.postnewpasword);
module.exports = router;