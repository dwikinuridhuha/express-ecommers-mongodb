const express = require('express');
const router = express.Router();
const fs = require('fs-extra');
const auth = require('../config/auth');
const isUser = auth.isUser;

// Get Product model
const Product = require('../models/product');

// Get Category model
const Category = require('../models/category');

/*
 * GET all products
 */
router.get('/', function (req, res) {
//router.get('/', isUser, function (req, res) {

    Product.find(function (err, products) {
        if (err)
            console.log(err);

        res.render('all_products', {
            title: 'All products',
            products: products
        });
    });
});

/*
 * GET products by category
 */
router.get('/:category', function (req, res) {
    const categorySlug = req.params.category;
    Category.findOne({slug: categorySlug}, function (err, c) {
        if (err) console.log(err);
        Product.find({category: categorySlug}, function (err, products) {
            if (err) console.log(err);

            res.render('cat_products', {
                title: c.title,
                products: products
            });
        });
    });

});

/*
 * GET product details
 */
router.get('/:category/:product', function (req, res) {

    let galleryImages = null;
    const loggedIn = (req.isAuthenticated()) ? true : false;

    Product.findOne({slug: req.params.product}, function (err, product) {
        if (err) {
            console.log(err);
        } else {
            const galleryDir = 'public/product_images/' + product._id + '/gallery';

            fs.readdir(galleryDir, function (err, files) {
                if (err) {
                    console.log(err);
                } else {
                    galleryImages = files;

                    res.render('product', {
                        title: product.title,
                        p: product,
                        galleryImages: galleryImages,
                        loggedIn: loggedIn
                    });
                }
            });
        }
    });
});

// Exports
module.exports = router;


