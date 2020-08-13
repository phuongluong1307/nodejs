const { branch } = require('../models/BranchModel');
const { user } = require('../models/UserModel');

exports.list = async function(req,res){
    try{
        let listBranch = await branch.find({});
        if(listBranch){
            res.json({
                error: false,
                message: "Get list branch success",
                data: listBranch
            })
        };
    }catch(err){
        res.json({
            error: true,
            message: "Get list branch failing!"
        })
    }
};

exports.add = async function(req,res){
    try{
        let body = req.body;
        let new_branch = {
            name: body.hasOwnProperty('name') ? body.name : '',
        };
        let add_branch = await new branch(new_branch).save();
        if(add_branch){
            res.json({
                error: false,
                message: "Add branch success!"
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: "Get list branch failing!"
        })
    }
};

exports.update = async function(req,res){
    try{

    }catch(err){
        res.json({
            error: true,
            message: "Get list branch failing!"
        })
    }
};

exports.delete = async function(req,res){
    try{

    }catch(err){
        res.json({
            error: true,
            message: "Get list branch failing!"
        })
    }
};