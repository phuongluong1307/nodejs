const { page } = require('../models/PageModel');
exports.list = async function(req,res){
    try{
        var list = await page.find({});
        res.json({
            error: false,
            message: 'Get page success!',
            data: list
        })
    }catch(err){
        res.json({
            error: true,
            message: 'Get page fail!'
        })
    }
}

exports.add = async function(req,res){
    try{
        var new_page = {
            name: req.body.hasOwnProperty('name') ? req.body.name : '',
            url: req.body.hasOwnProperty('url') ? req.body.url : '',
        }
        var data = await new page(new_page).save()
        res.json({
            error: false,
            message: 'Get add success!',
            data: data
        })
    }catch(err){
        res.json({
            error: true,
            message: 'Get add fail!'
        })
    }
}

exports.update = function(req,res){
    try{
        res.json({
            error: false,
            message: 'Get update success!'
        })
    }catch(err){
        res.json({
            error: true,
            message: 'Get update fail!'
        })
    }
}

exports.delete = function(req,res){
    try{
        res.json({
            error: false,
            message: 'Get update success!'
        })
    }catch(err){
        res.json({
            error: true,
            message: 'Get update fail!'
        })
    }
}