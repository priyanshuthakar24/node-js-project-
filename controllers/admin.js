const mongoose = require('mongoose');
const Product = require('../models/product');


exports.getaddproduct = (req, res, next) => {
    res.render('admin/edit-product', { pagetitle: "addproduct", path: '/admin/add-product', editing: false, isAuthenticated: true });
}

exports.postaddproduct = (req, res, next) => {
    // products.push({title: req.body.title});
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    console.log(image);
    const imageUrl = image.path;
    const product = new Product({ title: title, imageUrl: imageUrl, description: description, price: price, userId: req.user });
    product.save().then(result => {
        console.log(result);
        console.log('product created');
        res.redirect('/admin/product-list');
    }).catch(err => {
        const error = new Error(err);
        error.httpStatusCode = 500;
        return next(error);
    });
}


exports.geteditproduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect('/');
    }
    const prodId = req.params.productId;
    Product.findById(prodId).then(product => {
        if (!product) {
            return res.redirect('/');
        }
        res.render('admin/edit-product', { pagetitle: "editproduct", path: '/admin/edit-product', editing: editMode, product: product, isAuthenticated: req.session.isLoggedIn });
    });
}

exports.posteditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const updatedImageUrl = req.body.imageUrl;
    const updatedDesc = req.body.description;
    // const updatedProduct = new Product( {title:updatedTitle, imageUrl:updatedImageUrl, description:updatedDesc, price:updatedPrice});
    Product.findById(prodId).then(product => {
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageUrl = updatedImageUrl;
        product.description = updatedDesc;
        return product.save();
    }).then(result => {
        console.log('Upadated Product!');
        res.redirect('/admin/product-list');
    }).catch(err => {
        console.log(err);
    });
};
exports.getproducts = (req, res, next) => {
    Product.find().then(products => {
        res.render('admin/product-list', { prods: products, pagetitle: "admin product", path: "/admin/product-list", isAuthenticated: req.session.isLoggedIn });
    }).catch(err => {
        console.log(err);
    });
}

exports.postDeleteProduct = (req, res, next) => {
    const prodID = req.body.productId;
    Product.findByIdAndRemove(prodID).then(() => {
        console.log("Destroyed Product");
        res.redirect('/admin/product-list');
    }).catch(err => console.log(err));
}
