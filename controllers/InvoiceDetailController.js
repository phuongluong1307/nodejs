const { invoiceDetail } = require('../models/InvoiceDetailModel');
const { customer } = require('../models/CustomerModel');
const { user } = require('../models/UserModel');
const { invoice } = require('../models/InvoiceModel');

exports.list = async function(req,res){
    try{
        let day = new Date();
        let firstDay = new Date(day.getFullYear(), day.getMonth(), 1);
        let lastDay = new Date(day.getFullYear(), day.getMonth() + 1, 0);
        let firstDayOfMonth = (firstDay.getMonth() + 1) + '/' + firstDay.getDate() + '/' + firstDay.getFullYear();
        let lastDayOfMonth = (lastDay.getMonth() + 1) + '/' + lastDay.getDate() + '/' + lastDay.getFullYear();
        let findDateOfMonth = await invoiceDetail.find({date: {$gte: firstDayOfMonth, $lte: lastDayOfMonth}})
        if(findDateOfMonth){
            let result = [];
            findDateOfMonth.map(item => {
                result.push({
                    product_name: item.product_name,
                    quantity: item.quantity,
                    price: item.price
                });
            });
            res.json({
                error: false,
                message: 'Get list invoice-detail success!!!!',
                data: result
            })
        }
        
    }catch(err){
        res.json({
            error: true,
            message: "Get list invoice-detail failing!!!!"
        })
    }
};

exports.lone = async function(req,res){
    // try{
        // let query = req.query;
        // let id = req.params.id;
        // let seller_id = query.hasOwnProperty('seller_id') ? query.seller_id : '';
        // let customer_id = query.hasOwnProperty('customer_id') ? query.customer_id : '';
        // let findInvoiceDetail = await invoiceDetail.find({invoice_id: id});
        // let findSeller = await user.findOne({_id: seller_id});
        // let findCustomer = null;
        // if(customer_id != ""){
        //     findCustomer = await customer.findOne({_id: customer_id});
        // };
        // if(findInvoiceDetail){
        //     res.json({
        //         error: false,
        //         message: "Retrieving user by id success",
        //         data: findCustomer ? findCustomer : null,
        //         name: findSeller.name,
        //         invoice_detail: findInvoiceDetail,
        //     })
        // }
    // }catch(err){
    //     res.json({
    //         error: true,
    //         message: "Get list invoice-detail failing"
    //     })
    // }
};

exports.add = async function(req,res){
    try{

    }catch(err){
        res.json({
            error: true,
            message: "Get list invoice-detail success"
        })
    }
};

exports.update = async function(req,res){
    try{

    }catch(err){
        res.json({
            error: true,
            message: "Get list invoice-detail success"
        })
    }
};

exports.delete = async function(req,res){
    try{

    }catch(err){
        res.json({
            error: true,
            message: "Get list invoice-detail success"
        })
    }
};