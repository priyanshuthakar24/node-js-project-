// const products=[];
const path = require('path');
const fs = require('fs');
const pdfDocument = require('pdfkit');
const Product = require('../models/product');
const Order = require('../models/order');
const User = require('../models/user');

const ITEMS_PER_PAGE = 2;
exports.getproducts = (req, res, next) => {
    Product.find().then(products => {
        // console.log(products) 
        res.render('shop/product-list', { prods: products, pagetitle: "All Products", path: "/products" });
    });
};
exports.getindex = (req, res, next) => {
    const page = +req.query.page || 1;
    let totalItems;
    Product.find().countDocuments().then(numProducts => {
        totalItems = numProducts;
        return Product.find().skip((page - 1) * ITEMS_PER_PAGE).limit(ITEMS_PER_PAGE)
    }).then(products => {
        res.render('shop/index', { prods: products, pagetitle: "shop", path: "/", isAuthenticated: req.session.isLoggedIn, currentPage: page, totalProducts: totalItems, hasNextPage: ITEMS_PER_PAGE * page < totalItems, hasPreviousPage: page > 1, nextPage: page + 1, previousPage: page - 1, lastPage: Math.ceil(totalItems / ITEMS_PER_PAGE) });
    });
}

exports.getproduct = (req, res, next) => {
    const prodid = req.params.productid;
    // console.log(prodid);
    Product.findById(prodid).then(product => {
        // console.log(product);
        res.render('shop/product-detail', { product: product, pagetitle: product.title, path: '/products', isAuthenticated: req.session.isLoggedIn });
    }).catch(err => {
        console.log(err);
    });
    // res.redirect('/');
}


exports.postcart = (req, res, next) => {
    const prodid = req.body.productId;
    Product.findById(prodid).then(item => {
        return req.user.addtoCart(item);
    }).then(result => {
        console.log(result);
        res.redirect('/cart');
    })
    //  console.log(prodid);
};



exports.getcartitem = (req, res, next) => {
    req.user.populate('cart.items.productId').then(user => {
        // console.log(user.cart.items); 
        const products = user.cart.items;
        res.render('shop/cart', { pagetitle: "cart", path: '/cart', products: products, isAuthenticated: req.session.isLoggedIn })
    });
};
// Product.fetchAll(products => {
// const cartProducts = []; 
// for ( product of products) {
//     const cartProductData = cart.products.find(prod => prod.id===id);
//     if (cartProductData) {
//         cartProducts.push({ productData: product, qty: cartProductData.qty });
//     }
// }
// });

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    req.user.removefromCart(prodId).then(result => {
        res.redirect('/cart');
    }).catch(err => {
        console.log(err);
    })
}

exports.getorders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', { pagetitle: "orders", path: '/orders', orders: orders, isAuthenticated: req.session.isLoggedIn });
        })
}

exports.postOrder = (req, res, next) => {

    req.user.populate('cart.items.productId').then(user => {
        const products = user.cart.items.map(i => {
            return { quantity: i.quantity, product: { ...i.productId._doc } };
        });
        const order = new Order({
            user: {
                email: req.user.email,
                userId: req.user
            },
            products: products
        });
        return order.save();
    }).then(result => {
        return req.user.clearCart();
    }).then(() => {
        res.redirect('/orders');
    })
        .catch(err => console.log(err));
}
exports.getcheckout = (req, res, next) => {
    res.render('shop/checkout', { pagetitle: 'checkout', path: '/checkout', isAuthenticated: req.session.isLoggedIn });
}

exports.getinvoice = (req, res, next) => {
    const orderid = req.params.orderid;
    Order.findById(orderid).then(order => {
        if (!order) {
            return next()
        }
        if (order.user.userId.toString() !== req.user._id.toString()) {
            return next()
        }
        const invoicename = "invoice-" + orderid + '.pdf';
        const invoicepath = path.join('data', 'invoices', invoicename);

        const pdfDoc = new pdfDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline;filename="' + invoicename + '"');
        pdfDoc.pipe(fs.createWriteStream(invoicepath));
        pdfDoc.pipe(res);
        pdfDoc.text('hello World!');
        order.products.forEach(prod => {
            pdfDoc.text(prod.product.title + '-' + prod.quantity)
        });
        pdfDoc.end();
    }).catch(err => { console.log(err) })

}
// , isAuthenticated: req.session.isLoggedIn, csrfToken: req.csrfToken()