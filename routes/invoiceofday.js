const express = require('express');
const router = express.Router();

var controller = require('../controllers/InvoiceOfDayController');
console.log('Route runing base on /api/invoice-of-day/');

router.get('/', function(req,res){
    return controller.list(req,res)
});

module.exports = router;