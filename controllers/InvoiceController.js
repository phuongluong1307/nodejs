const { invoice } = require('../models/InvoiceModel');
const { customer } = require('../models/CustomerModel');
const { user } = require('../models/UserModel');
const { invoiceDetail } = require('../models/InvoiceDetailModel');

exports.list = async function(req,res){
    try{
        let sort_by = req.query.sort_by ? req.query.sort_by : 'created_at';
        let sort_type = req.query.sort_type ? req.query.sort_type : 'desc';
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let keyword = req.query.keyword ? helper.toSlug(req.query.keyword) : '';
        let query = {};
        if(keyword!=''){
            /** Tìm 1 key nào đó trong các record có "username" chứa từ khóa "keyword" */
            // query.username = {$regex: '.*'+keyword+'.*'};

            /** Tìm 1 key nào đó trong các record có "username", hoặc "name" chứa từ khóa "keyword" */
            query.$or = [
                {code_bill: {$regex: '.*'+keyword+'.*'}},
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

        invoice.paginate(query, options).then(function (result) {
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
            message: 'Get list invoice failing!'
        })
    }
};

exports.add = async function(req,res){
    try{
        let body = req.body;
        let name_customer = body.hasOwnProperty('customer') ? body.customer : '';
        let customer_id = await customer.findOne({name: name_customer});
        let seller = await user.findOne({name: body.seller});
        let new_date = new Date();
        let number = 1;
        let code_bill = "HD" + new_date.getDate() + (new_date.getMonth() + 1) + new_date.getFullYear();
        let bill = await invoice.find({date: (new Date()).toLocaleDateString()});
        if(bill.length != 0){
            let last_number = bill[bill.length - 1].code_bill.replace(code_bill, "");
            if(last_number){
                number = Number(last_number) + 1;
            }
        };
        code_bill = "HD" + new_date.getDate() + (new_date.getMonth() + 1) + new_date.getFullYear() + number;
        let new_invoice = {
            code_bill: code_bill,
            date: (new Date()).toLocaleDateString(),
            customer_id: customer_id ? customer_id._id : '',
            seller_id: seller._id,
            total_price: body.hasOwnProperty('total_price') ? body.total_price : '',
            discount_price: body.hasOwnProperty('discount_price') ? body.discount_price : '',
            discount_value: body.hasOwnProperty('discount_value') ? body.discount_value : '',
            discount_type: body.hasOwnProperty('discount_type') ? body.discount_type : '',
        };
        let add_invoice = await new invoice(new_invoice).save();
        let arr_product_bill = [];
        body.products.forEach(item => {
            let records_invoiceDetail = {
                invoice_id: add_invoice._id,
                customer_id: add_invoice.customer_id,
                product_id: item.id,
                quantity: item.quantity,
                price: item.price,
                discount_price: item.discount_price,
                discount_value: item.discount_value,
                discount_type: item.discount_type,
            };
            arr_product_bill.push(records_invoiceDetail);
        });
        let list_product = await invoiceDetail.insertMany(arr_product_bill);
        if(!add_invoice){
            res.json({
                error: true,
                message: 'Add invoice fail!'
            })
        }else{
            res.json({
                error: false,
                message: 'Add invoice success',
                data: list_product
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