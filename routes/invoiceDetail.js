const express = require('express');
const router = express.Router();
var controller = require('../controllers/InvoiceDetailController');

router.get('/', function(req,res){
    return controller.list(req,res);
});

router.post('/', function(req,res){
    return controller.add(req,res);
});

router.put('/:id', function(req,res){
    return controller.update(req,res);
});

router.delete('/:id', function(req,res){
    return controller.delete(req,res);
});

module.exports = router;