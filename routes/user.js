const express = require('express')
const router = express.Router();
var controller = require('../controllers/UserController.js');
console.log('Route runing base on /api/users/');
/** Get data */
router.get('/', function(req, res){
    return  controller.list(req, res);
});

/** Get data by id */
router.get('/:id', function(req, res){
    return  controller.single(req, res);
});

/** Insert data */
router.post('/', function(req, res){
    return  controller.add(req, res);
});

/** Update data by id */
router.put('/:id' , function(req, res){
    return controller.update(req, res);
});

/** Delete data by id */
router.delete('/:id', function(req, res){
    return controller.delete(req, res);
});

module.exports = router;