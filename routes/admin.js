const express = require('express');
const path=require('path');
const router=express.Router();
const adminController =require('../controllers/admin');
const isAuth=require('../middleware/is-auth');
// /admin/add-product ==>GET 
router.get('/add-product',isAuth,adminController.getaddproduct );
// res.sendFile(path.join(__dirname,'../','views','add-product.html'));
// res.send('<form action="/product" method="POST"><input type="text" name="title"><button type="submit">Add product</button></form>')
router.get('/product-list',isAuth,adminController.getproducts );

router.post('/product', isAuth,adminController.postaddproduct);
// console.log(req.body);
router.get('/edit-product/:productId',isAuth,adminController.geteditproduct);
    // res.send('<h1>Hello from product js!');

router.post('/edit-product',isAuth,adminController.posteditProduct);
router.post('/delete-product',isAuth,adminController.postDeleteProduct);

module.exports =router;
// exports.routes=router;
// exports.products=products;