const express = require('express');
const router = express.Router();
const auth = require('../config/auth');
const isAdmin = auth.isAdmin;

// Get Category model
const Category = require('../models/category');

/*
 * GET category index
 */
router.get('/', isAdmin, function (req, res) {
    Category.find(function (err, categories) {
        if (err)
            return console.log(err);
        res.render('admin/categories', {
            categories: categories
        });
    });
});

/*
 * GET add category
 */
router.get('/add-category', isAdmin, function (req, res) {
    const title = "";
    res.render('admin/add_category', {
        title: title
    });
});

/*
 * POST add category
 */
router.post('/add-category', function (req, res) {

    req.checkBody('title', 'Title must have a value.').notEmpty();

    const title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();

    const errors = req.validationErrors();

    if (errors) {
        res.render('admin/add_category', {
            errors: errors,
            title: title
        });
    } else {
        Category.findOne({slug: slug}, function (err, category) {
            if (category) {
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/add_category', {
                    title: title
                });
            } else {
                const category = new Category({
                    title: title,
                    slug: slug
                });

                category.save(function (err) {
                    if (err)
                        return console.log(err);

                    Category.find(function (err, categories) {
                        if (err) {
                            console.log(err);
                        } else {
                            req.app.locals.categories = categories;
                        }
                    });

                    req.flash('success', 'Category added!');
                    res.redirect('/admin/categories');
                });
            }
        });
    }

});

/*
 * GET edit category
 */
router.get('/edit-category/:id', isAdmin, function (req, res) {

    Category.findById(req.params.id, function (err, category) {
        if (err)
            return console.log(err);

        res.render('admin/edit_category', {
            title: category.title,
            id: category._id
        });
    });

});

/*
 * POST edit category
 */
router.post('/edit-category/:id', function (req, res) {

    req.checkBody('title', 'Title must have a value.').notEmpty();

    const title = req.body.title;
    const slug = title.replace(/\s+/g, '-').toLowerCase();
    const id = req.params.id;

    const errors = req.validationErrors();

    if (errors) {
        res.render('admin/edit_category', {
            errors: errors,
            title: title,
            id: id
        });
    } else {
        Category.findOne({slug: slug, _id: {'$ne': id}}, function (err, category) {
            if (category) {
                req.flash('danger', 'Category title exists, choose another.');
                res.render('admin/edit_category', {
                    title: title,
                    id: id
                });
            } else {
                Category.findById(id, function (err, category) {
                    if (err)
                        return console.log(err);

                    category.title = title;
                    category.slug = slug;

                    category.save(function (err) {
                        if (err)
                            return console.log(err);

                        Category.find(function (err, categories) {
                            if (err) {
                                console.log(err);
                            } else {
                                req.app.locals.categories = categories;
                            }
                        });

                        req.flash('success', 'Category edited!');
                        res.redirect('/admin/categories/edit-category/' + id);
                    });

                });


            }
        });
    }

});

/*
 * GET delete category
 */
router.get('/delete-category/:id', isAdmin, function (req, res) {
    Category.findByIdAndRemove(req.params.id, function (err) {
        if (err)
            return console.log(err);

        Category.find(function (err, categories) {
            if (err) {
                console.log(err);
            } else {
                req.app.locals.categories = categories;
            }
        });

        req.flash('success', 'Category deleted!');
        res.redirect('/admin/categories/');
    });
});


// Exports
module.exports = router;


