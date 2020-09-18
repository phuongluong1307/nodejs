const express = require('express');
const router = express.Router();

var controller = require('../controllers/InvoiceOfYearController');

router.get('/', function(req,res){
    return controller.list(req,res)
});

module.exports = router;