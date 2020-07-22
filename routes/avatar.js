const express = require('express');
const router = express.Router();
var controller = require('../controllers/AvatarController.js');

router.get('/', function(req, res){
    return controller.list(req,res)
});

router.post('/', function(req, res){
    return controller.add(req, res)
})

module.exports = router;