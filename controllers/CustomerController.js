const { customer } = require('../models/CustomerModel');
const { user } = require('../models/UserModel');
const { invoiceDetail } = require('../models/InvoiceDetailModel');
const { product } = require('../models/ProductModel');
const helper = require('../libs/helper');

exports.list = async function(req,res){
    try{
        let sort_by = req.query.sort_by ? req.query.sort_by : 'created_at';
        let sort_type = req.query.sort_type ? req.query.sort_type : 'desc';
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let keyword = req.query.keyword ? helper.toSlug(req.query.keyword) : '';
        let query= {};
        if(keyword != ''){
            query.$or = [
                {name_search: {$regex: '.*'+keyword+'.*'}},
                {phonne_number: {$regex: '.*'+keyword+'.*'}}
            ]
        };

        let sort = {};
        sort[sort_by] = sort_type;
        var options = {
            sort: sort,
            limit: limit,
            page: page,
        };

        customer.paginate(query,options).then(function (result) {
            res.json({
                error: false,
                message: 'Get list success!',
                data: result,
            })
        });
    }catch(err){
        res.json({
            error: true,
            message: 'Get customer failing!'
        })
    }
};

exports.lone = async function(req,res){
    try{
        let query = req.query;
        let id = req.params.id;
        let seller_id = query.hasOwnProperty('seller_id') ? query.seller_id : '';
        let invoice_id = query.hasOwnProperty('invoice_id') ? query.invoice_id : '';
        let findInvoiceDetail = await invoiceDetail.find({invoice_id: invoice_id});
        let findSeller = await user.findOne({_id: seller_id});
        let findCustomer = await customer.findOne({_id: id});
        if(findCustomer){
            res.json({
                error: false,
                message: "Retrieving user by id success",
                data: findCustomer,
                name: findSeller.name,
                invoice_detail: findInvoiceDetail,
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: "Retrieving user by id failed!"
        })
    }
}

exports.add = async function(req,res){
    try{
        let body = req.body;
        let new_customer = {
            name: body.hasOwnProperty('name') ? body.name : '',
            phone_number: body.hasOwnProperty('phone_number') ? body.phone_number : '',
            email: body.hasOwnProperty('email') ? body.email : ''
        };
        let add_customer = await new customer(new_customer).save();
        if(!add_customer){
            return res.json({
                error: true,
                message: 'Add customer fail!'
            })
        }else{
            return res.json({
                error: false,
                message: 'Add customer success!',
                data: add_customer
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: 'Add custome failing!'
        })
    }
};

exports.update = async function(req,res){
    try{
        let body = req.body;
        let new_customer = {
            name: body.hasOwnProperty('name') ? body.name : '',
            phone_number: body.hasOwnProperty('phone_number') ? body.phone_number : '',
            email: body.hasOwnProperty('email') ? body.email : ''
        };
        let add_customer = await new customer.findOneAndUpdate({_id: req.params.id},new_customer, {new: true}, function(err, doc){
            if(!add_customer){
                return res.json({
                    error: true,
                    message: 'Add customer fail!'
                })
            }else{
                return res.json({
                    error: false,
                    message: 'Add customer success!'
                })
            }
        });
        return add_customer;
    }catch(err){
        res.json({
            error: true,
            message: 'Update customer failing!'
        })
    }
};

exports.delete = async function(req,res){
    try{
        let id = req.params.id;
        let delete_customer = await customer.findOneAndDelete({_id: id});
        if(!delete_customer){
            res.json({
                error: true,
                message: 'Delete customer fail!'
            })
        }else{
            res.json({
                error: false,
                message: 'Delete customer success'
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: 'Delete customer failing!'
        })
    }
}