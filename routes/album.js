const express = require('express');
const router = express.Router();
var controller = require('../controllers/AlbumImageController.js');

router.get('/', function(req,res){
    return controller.list(req,res)
})

router.post('/', function(req,res){
    return controller.add(req,res)
})

router.post('/:id', function(req,res){
    return controller.push(req,res)
})

module.exports = router;