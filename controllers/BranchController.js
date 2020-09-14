const { branch } = require('../models/BranchModel');
const { user } = require('../models/UserModel');
const helper = require('../libs/helper');

exports.list = async function(req,res){
    try{
        let sort_by = req.query.sort_by ? req.query.sort_by : 'created_at';
        let sort_type = req.query.sort_type ? req.query.sort_type : 'desc';
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let keyword = req.query.keyword ? helper.toSlug(req.query.keyword) : '';
        let listBranch = req.query.listBranch ? req.query.listBranch : '';
        if(listBranch){
            let result = await branch.find({_id: {$in: listBranch}});
            if(result){
                res.json({
                    error: false,
                    data: result
                })
            }
        }
        let query = {};
        if(keyword!=''){
            /** Tìm 1 key nào đó trong các record có "username" chứa từ khóa "keyword" */
            // query.username = {$regex: '.*'+keyword+'.*'};

            /** Tìm 1 key nào đó trong các record có "username", hoặc "name" chứa từ khóa "keyword" */
            query.$or = [
                {name_search: {$regex: '.*'+keyword+'.*'}}
            ]
        }
        
        let sort = {};
        sort[sort_by] = sort_type;
        var options = {
            sort: sort,
            limit: limit,
            page: page,
        };

        branch.paginate(query, options).then(function (result) {
            res.json({
                error: false,
                message: 'Get list success!',
                data: result,
                options: options,
            })
        });
    }catch(err){
        res.json({
            error: true,
            message: "Get list branch failing!"
        })
    }
};

exports.lone = async function(req,res){
    try{
        let id = req.params.id;
        let findBranch = await branch.findOne({_id: id});
        if(findBranch){
            res.json({
                error: false,
                message: "Retrieving branch by id success!!!!",
                data: findBranch
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: "Retrieving branch by id failed "
        })
    }
}

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
        let id = req.params.id;
        let new_records = {
            name: req.body.hasOwnProperty('name') ? req.body.name : ''
        }
        let updateBranch = await branch.findOneAndUpdate({_id: id}, new_records, {new: true});
        if(updateBranch){
            res.json({
                error: false,
                message: "Update branch success!"
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: "Get list branch failing!"
        })
    }
};

exports.delete = async function(req,res){
    try{
        let id = req.params.id;
        let delete_branch = await branch.findOneAndDelete({_id: id});
        if(delete_branch){
            res.json({
                error: false,
                message: "Delete branch success!"
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: "Get list branch failing!"
        })
    }
};