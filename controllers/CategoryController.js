const {category} = require('../models/CategoryModel');
exports.list = async function(req,res){
    try{
        let listCategory = await category.find({});
        if(!listCategory){
            return res.json({
                error: true,
                message: 'Get list category failed!'
            })
        }
        return res.json({
            error: false,
            message: 'Get list category success!',
            data: listCategory
        })
    }catch(err){
        res.json({
            error: true,
            err
        })
    }
}

exports.add = async function(req,res){
    try{
        let body = req.body;
        let new_category = {
            category_name: body.hasOwnProperty('category_name') ? body.category_name : '',
            category: body.hasOwnProperty('category') ? body.category : '',
        };
        let result = await new category(new_category).save();
        if(!result){
            return res.json({
                error: true,
                message: 'Add category failed!'
            })
        }
        return res.json({
            error: false,
            message: 'Add category success!',
            data: result
        })
    }catch(err){
        res.json({
            error: true,
            err
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