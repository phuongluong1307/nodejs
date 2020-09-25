const express = require('express');
const router = express.Router();
var controller = require('../controllers/InvoiceController');
const cache = require('../redis');

let key = "listInvoiceByBranch";

router.get('/', cache.caching(key) , function(req,res){
    return controller.list(req,res);
});

router.get('/:id', function(req,res){
    return controller.lone(req,res);
});

router.post('/', function(req,res){
    return controller.add(req,res)
});

router.put('/:id', function(req,res){
    return controller.update(req,res)
});

router.delete('/:id', function(req,res){
    return controller.delete(req,res)
});

module.exports = router;