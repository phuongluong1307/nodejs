const express = require('express')
const router = express.Router();
var cache = require('../redis');
var controller = require('../controllers/ProductController.js');
console.log('Route runing base on /api/products/');

let key = "product";

/** Get data */
router.get('/', cache.caching(key), function(req, res){
    return  controller.list(req, res);
});

/** Insert data */
router.post('/', function(req, res){
    return  controller.add(req, res);
});

/** Update data */
router.put('/:id', function(req, res){
    return controller.update(req, res);
});

/** Delete data */
router.delete('/:id', function(req, res){
    return controller.delete(req, res);
});

module.exports = router;