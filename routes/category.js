const express = require('express')
const router = express.Router();
var controller = require('../controllers/CategoryController.js');
console.log('Route runing base on /api/categories/');

/** Get data */
router.get('/', function(req, res){
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