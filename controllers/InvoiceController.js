const { invoice } = require('../models/InvoiceModel');
const { customer } = require('../models/CustomerModel');
const { user } = require('../models/UserModel');

exports.list = async function(req,res){
    try{
        let list_invoice = await invoice.find({});
        res.json({
            error: false,
            message: 'Get list invoice success!',
            data: list_invoice
        })
    }catch(err){
        res.json({
            error: true,
            message: 'Get list invoice failing!'
        })
    }
};

exports.add = async function(req,res){
    try{
        let body = req.body;
        let name_customer = body.hasOwnProperty('customer_id') ? body.customer_id : '';
        let customer_id = await customer.findOne({name: name_customer});
        let new_invoice = {
            code_bill: {type: String},
            date_of_sale: (new Date()).toLocaleDateString(),
            customer_id: customer_id._id,
            list_product: body.hasOwnProperty('list_product') ? body.list_product : '',
            seller: body.hasOwnProperty('seller') ? body.seller : '',
        };
        let add_invoice = await new invoice(new_invoice).save();
        if(!add_invoice){
            res.json({
                error: true,
                message: 'Add invoice fail!'
            })
        }else{
            res.json({
                error: false,
                message: 'Add invoice success'
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: 'Add invoice failing'
        })
    }
};

exports.update = async function(req,res){
    try{

    }catch(err){
        res.json({
            error: true,
            message: 'Update invoice failing!'
        })
    }
}

exports.delete = async function(req,res){
    try{

    }catch(err){
        res.json({
            error: true,
            message: 'Delete invoice failing!'
        })
    }
}