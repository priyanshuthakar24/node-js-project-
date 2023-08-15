const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '../', 'data', 'cart.json');


module.exports = class Cart {
    static addProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            let cart = { cartlist: [], totalPrice: 0 };
            if (!err) {
                cart = JSON.parse(fileContent);
            }

            // analyze the cart=>Find exiting product 
            const exitingProductIndex = cart.cartlist.findIndex(prod => prod.id === id);
            const exitingProduct = cart.cartlist[exitingProductIndex];
            let updatedProduct;
            if (exitingProduct) {
                updatedProduct = { ...exitingProduct };
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.cartlist = [...cart.cartlist];
                cart.cartlist[exitingProductIndex] = updatedProduct;
            } else {
                updatedProduct = { id: id, qty: 1 };
                cart.cartlist = [...cart.cartlist, updatedProduct];
            }
            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(p, JSON.stringify(cart), (err) => {
                console.log(err);
            });
        });
    }

    static deleteProduct(id, productPrice) {
        fs.readFile(p, (err, fileContent) => {
            if (err) {
                return;
            }
            const updatedCart = { ... JSON.parse(fileContent) };
            const product = updatedCart.products.find(prod => prod.id === id);
            const productQty = product.qty;
            updatedCart.products = updatedCart.products.filter(prod => prod.id !== id);
            cart.totalPrice = cart.totalPrice - productPrice * productQty;
            fs.writeFile(p, JSON.stringify(updatedCart), err => {
                console.log(err);
            });
        });
    }



    static getCart(cb) {
        fs.readFile(p, (err, fileContent) => {
            const cart = JSON.parse(fileContent);
            if (err) {
                cb(null);
            }
            else {
                cb(cart);
            }
        });
    }
}