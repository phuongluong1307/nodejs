const express = require('express');
const router = express.Router();
let permissions = require('../controllers/PermissionsController');

router.get('/',function(req,res){
    return permissions.list(req,res)
})

router.post('/',function(req, res){
    return permissions.add(req, res)
});

module.exports = router;