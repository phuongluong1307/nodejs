const { invoice } = require('../models/InvoiceModel');
const { customer } = require('../models/CustomerModel');
const { user } = require('../models/UserModel');
const { invoiceDetail } = require('../models/InvoiceDetailModel');
const { branch } = require('../models/BranchModel');
const helper = require('../libs/helper');

exports.list = async function(req,res){
    // try{
        let sort_by = req.query.sort_by ? req.query.sort_by : 'created_at';
        let sort_type = req.query.sort_type ? req.query.sort_type : 'desc';
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let keyword = req.query.keyword ? req.query.keyword : '';
        let date = req.query.date ? req.query.date : '';
        let customer_name = req.query.customer ? req.query.customer : "";
        let query = {};
        let findCustomer = await customer.findOne({name: customer_name});
        let findFilters = null;
        if(findCustomer){
            findFilters = await invoice.find({customer_id: findCustomer._id});
        };
        if(date!=''){
            findFilters = await invoice.find({date: date});
        };
        if(findCustomer && date!=''){
            findFilters = await invoice.find({date: date, customer_id: findCustomer._id});
        };
        if(keyword != ''){
            /** Tìm 1 key nào đó trong các record có "username" chứa từ khóa "keyword" */
            // query.username = {$regex: '.*'+keyword+'.*'};

            /** Tìm 1 key nào đó trong các record có "username", hoặc "name" chứa từ khóa "keyword" */
            let findCustomer = await customer.findOne({name: keyword});
            findCustomer = findCustomer ? findCustomer._id : null;
            query.$or = [
                {code_bill: {$regex: '.*'+keyword+'.*'}},
                {customer_id: {$regex: '.*'+findCustomer+'.*'}},
            ]
        };
        
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
                filters: findFilters ? findFilters : []
            })
        });
    // }catch(err){
    //     res.json({
    //         error: true,
    //         message: 'Get list invoice failing!'
    //     })
    // }
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
        let nameBranch = await branch.findOne({name: body.nameBranch});
        let new_invoice = {
            code_bill: code_bill,
            date: (new Date()).toLocaleDateString(),
            customer_id: customer_id ? customer_id._id : "",
            seller_id: seller ? seller._id : '',
            tax_type: body.hasOwnProperty('tax_type') ? body.tax_type : '',
            tax_value: body.hasOwnProperty('tax_value') ? body.tax_value : 0,
            tax_price: body.hasOwnProperty('tax_price') ? body.tax_price : 0,
            total_price: body.hasOwnProperty('total_price') ? body.total_price : 0,
            subtotal: body.hasOwnProperty('subtotal') ? body.subtotal : 0,
            discount_price: body.hasOwnProperty('discount_price') ? body.discount_price : 0,
            discount_value: body.hasOwnProperty('discount_value') ? body.discount_value : 0,
            discount_type: body.hasOwnProperty('discount_type') ? body.discount_type : '',
            branch_id: nameBranch ? nameBranch._id : '',
        };
        let add_invoice = await new invoice(new_invoice).save();
        let arr_product_bill = [];
        body.products.forEach(item => {
            let records_invoiceDetail = {
                invoice_id: add_invoice._id,
                customer_id: add_invoice.customer_id,
                product_id: item.id,
                product_name: item.product_name,
                image: item.image,
                quantity: item.quantity,
                price: item.price,
                discount_price: item.discount_price,
                discount_value: item.discount_value,
                discount_type: item.discount_type,
            };
            arr_product_bill.push(records_invoiceDetail);
        });
        await invoiceDetail.insertMany(arr_product_bill);
        let findSeller = await user.findOne({_id: add_invoice.seller_id});
        if(!add_invoice){
            res.json({
                error: true,
                message: 'Add invoice fail!'
            })
        }else{
            res.json({
                error: false,
                message: 'Add invoice success',
                data: body.products,
                seller: findSeller.name,
                invoice: add_invoice,
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
        let id = req.params.id;
        let products = req.query.products;
        products.map(async (item) => {
            let product = JSON.parse(item);
            let id = product._id;
            await invoiceDetail.updateOne({_id: id}, product, {new: true})
        });
        let new_invoice = req.query.hasOwnProperty('new_invoice') ? req.query.new_invoice : '';
        new_invoice = JSON.parse(new_invoice);
        let update_invoice = {
            total_price: new_invoice.total_price,
            tax_price: new_invoice.tax_price,
            discount_price: new_invoice.discount_price,
            subtotal: new_invoice.subtotal
        };
        let updateInvoice = await invoice.findOneAndUpdate({_id: id}, update_invoice, {new: true}, function(err ,doc){
            if (!err) {
                return res.json({
                    error: false,
                    message: 'Update invoice success!',
                    data: doc
                })
            } else {
                return res.json({
                    error: true,
                    message: 'Update invoice fail!'
                })
            }
        });
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