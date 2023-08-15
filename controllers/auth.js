const bcrypt = require('bcryptjs');
const User = require('../models/user');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
        user: 'priyanshu_20262@ldrp.ac.in',
        pass: 'priyanshu2401'
    },
});
transporter.verify().then(console.log).catch(console.log);

exports.getlogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    console.log(req.session.isLoggedIn);
    res.render('auth/login', { path: '/login', pagetitle: 'login', errorMessage: message/*req.flash('error')*/ });
};
exports.getsignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/signup', { path: '/signup', pagetitle: 'signup', isAuthenticated: false, errorMessage: message, olddata: { email: '', password: '' } });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email: email }).then(data => {
        if (!data) {
            req.flash('error', 'Invalid email or password');
            return res.redirect('/login');
        }
        bcrypt.compare(password, data.password).then(doMatch => {
            if (doMatch) {
                req.session.isLoggedIn = true;
                req.session.user = data;
                return req.session.save(err => {
                    console.log(err);
                    res.redirect('/');
                    // res.redirect('/');
                });
            }
            res.redirect('/login');
        }).catch(err => {
            console.log(err);
            res.redirect('/login');
        });

    }).catch(err => { console.log(err) });
};
exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmpassword = req.body.confirmpassword;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        return res.status(422).render('auth/signup', {
            path: '/signup',
            pagetitle: "Signup",
            errorMessage: errors.array()[0].msg,
            olddata: { email: email, password: password }
        });
    }
    bcrypt.hash(password, 12)

        .then(hashedpassword => {
            const user = new User({
                email: email,
                password: hashedpassword,
                cart: { items: [] }
            });
            return user.save();
        })
        .then(result => {
            res.redirect('/login');
            return transporter.sendMail({
                from: 'priyanshu_20262@ldrp.ac.in',
                to: email,
                subject: "This is welcome message",
                html: "<b>We are very excitd to have you </b>",
            }).then(info => {
                console.log(info);
            }).catch(console.error);
        }).catch(err => console.log(err));


};
exports.postlogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect('/');
    });
};
exports.getreset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    } else {
        message = null;
    }
    res.render('auth/reset', { pagetitle: 'reset', path: '/reset', errorMessage: message });
}
exports.postreset = (req, res, next) => {
    const email = req.body.email;
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }
        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email }).then(user => {
            if (!user) {
                req.flash('error', 'No account Found with that email found.')
                return res.redirect('/reset');
            }
            user.resetToken = token;
            user.resetTokenExpiration = Date.now() + 3600000;
            return user.save();
        }).then(result => {
            res.redirect('/');
            transporter.sendMail({
                to: req.body.email,
                from: 'priyanshu_20262@ldrp.ac.in',
                subject: 'Reset Form Link',
                html: `
                <p>You requested a password reset</p>
                <p>Click this <a href="http://localhost:3001/reset/${token}">Link</a> To set password</p>
                `
            })
        }).catch(err => { console.log(err) });
    })
}

exports.getnewpassword = (req, res, next) => {
    const token = req.params.token;
    User.findOne({ resetToken: token, resetTokenExpiration: { $gt: Date.now() } }).then(user => {
        let message = req.flash('error');
        if (message.length > 0) {
            message = message[0];
        } else {
            message = null;
        }
        res.render('auth/new-password', { pagetitle: 'new-password', path: '/new-password', errorMessage: message, userid: user._id.toString(), passwordtoken: token });
    }).catch(err => {
        console.log(err);
    })

}
exports.postnewpasword = (req, res, next) => {
    const newpassword = req.body.password;
    const userid = req.body.userid;
    const passwordtoken = req.body.passwordtoken;
    let resetUser;
    User.findOne({ resetToken: passwordtoken, resetTokenExpiration: { $gt: Date.now() }, _id: userid }).then(user => {
        resetUser = user;
        return bcrypt.hash(newpassword, 12);
    }).then(hashedpassword => {
        resetUser.password = hashedpassword;
        resetUser.resetToken = undefined;
        resetUser.resetTokenExpiration = undefined;
        return resetUser.save();
    }).then(result => {
        res.redirect('/login');
    }).catch(err => { console.log(err) });
}