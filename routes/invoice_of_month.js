const express = require('express');
const router = express.Router();
const cache = require('../redis');
var controller = require('../controllers/InvoiceOfMonthController');

let key = 'invoice_of_month';

router.get('/', cache.caching(key) , function(req,res){
    return controller.list(req,res)
});

module.exports = router;