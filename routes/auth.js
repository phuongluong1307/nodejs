const express = require('express')
const router = express.Router();
var controller = require('../controllers/AuthController.js');
console.log('Route runing base on /api/auth/');

/** Insert data */
router.post('/', function(req, res){
    return  controller.login(req, res);
});

router.put('/forget', function(req, res){
    return  controller.forget(req, res);
});

router.put('/reset-password', function(req, res){
    return controller.resetPassword(req, res)
});

router.post('/check-reset-token', function(req, res){
    return controller.chekResetToken(req, res)
});

module.exports = router;