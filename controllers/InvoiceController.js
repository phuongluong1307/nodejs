const { invoice } = require('../models/InvoiceModel');
const { customer } = require('../models/CustomerModel');
const { user } = require('../models/UserModel');
const { invoiceDetail } = require('../models/InvoiceDetailModel');
const { branch } = require('../models/BranchModel');
const helper = require('../libs/helper');
const e = require('express');
const base64 = require('../libs/base64');

exports.list = async function(req,res){
    // try{
        let sort_by = req.query.sort_by ? req.query.sort_by : 'created_at';
        let sort_type = req.query.sort_type ? req.query.sort_type : 'desc';
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let keyword = req.query.keyword ? req.query.keyword : '';
        let date = req.query.date ? req.query.date : '';
        let customer_id = req.query.customer_id ? req.query.customer_id : "";
        let branch_id = req.query.branch_id ? req.query.branch_id : "";
        let query = {};
        let arrMonth = req.query.arrMonth ? req.query.arrMonth : "";
        let listBranch = req.query.listBranch ? req.query.listBranch : "";
        let date_by_branch = req.query.date_by_branch ? req.query.date_by_branch : '';
        if(branch_id != '' && date_by_branch != ''){
            let listInvoiceByBranch = await invoice.aggregate([
                {
                    $match: {branch_id: branch_id, date: date_by_branch}
                },
                {$group: {_id: {branch_id: "$branch_id", date: "$date"}, total: {$sum: "$total_price"}}}
            ]);
            if(listInvoiceByBranch){
                return res.json({
                    error: false,
                    data: listInvoiceByBranch
                })
            }
        };
        if(arrMonth.length == 2){
            if(typeof listBranch == 'array' || typeof listBranch == 'object'){
                let findDateOfMonth = null;
                let promise = new Promise(async function(resolve,reject){
                    let result = [];
                    let arr = [];
                    arrMonth.map(async (item) => {
                        item = JSON.parse(item);
                        result = await invoice.aggregate([
                            {
                                $match: {branch_id: {$in: typeof listBranch == "array" || typeof listBranch == 'object' ? listBranch : []}, $or: [{created_at: {$gte: (new Date(item.year, item.month - 1, 1)).getTime(), $lte: (new Date(item.year, item.month, 0)).getTime()}}]}
                            },
                            {$group: {_id: "$branch_id", total: {$sum: "$total_price"}, count: {$sum: 1},month: {$first: "$date"}}},
                        ]);
                        arr = arr.concat(result);
                        if(arr.length == 2){
                            resolve(arr);
                        }
                    });
                });
                let result = await promise;
                findDateOfMonth = result;
                if(findDateOfMonth){
                    return res.json({
                        error: false,
                        message: 'Get invoice compare success!!!!',
                        data: findDateOfMonth
                    });
                };
            }else if(arrMonth.length == 2 && typeof listBranch == 'string'){
                    let result = null;
                        result = await invoice.aggregate([
                            {
                                $match: {branch_id: listBranch, month: {$in: typeof arrMonth == "array" || typeof arrMonth == 'object' ? arrMonth : []}}
                            }, 
                            // {
                            //     $lookup: {
                            //         from: 'branches',
                            //         localField: 'branch_id',
                            //         foreignField: '_id',
                            //         as: 'branch'
                            //     }
                            // },
                            {$group: {_id: {branch_id: "$branch_id", month: "$month"}, total: {$sum: "$total_price"}, count: {$sum: 1}}},
                        ]);
                if(result){
                    return res.json({
                        error: false,
                        message: 'Get invoice compare success!!!!!!',
                        data: result
                    });    
                };
            };
        };
        let findFilters = null;
        let day = new Date();
        let firstDay = new Date(day.getFullYear(), day.getMonth(), 1);
        let lastDay = new Date(day.getFullYear(), day.getMonth() + 1, 0);
        let firstDayOfMonth = (firstDay.getMonth() + 1) + '/' + firstDay.getDate() + '/' + firstDay.getFullYear();
        let lastDayOfMonth = (lastDay.getMonth() + 1) + '/' + lastDay.getDate() + '/' + lastDay.getFullYear();
        let findDateOfMonth = await invoice.find({date: {$gte: firstDayOfMonth, $lte: lastDayOfMonth}}).populate('seller');
        if(customer_id != ''){
            findFilters = await invoice.find({customer_id: customer_id});
        };
        if(date != ''){
            findFilters = await invoice.find({date: date}).populate(['customer', 'seller']);
        };
        if(customer_id != '' && date != ''){
            findFilters = await invoice.find({date: date, customer_id: customer_id});
        };
        if(keyword != ''){
            /** Tìm 1 key nào đó trong các record có "username" chứa từ khóa "keyword" */
            // query.username = {$regex: '.*'+keyword+'.*'};

            /** Tìm 1 key nào đó trong các record có "username", hoặc "name" chứa từ khóa "keyword" */
            let findCustomer = await customer.findOne({name_search: keyword});
            findCustomer = findCustomer ? findCustomer._id : null;
            query.$or = [
                {code_bill: {$regex: '.*'+keyword+'.*'}},
                {customer_id: findCustomer._id},
            ]
        };
        
        let sort = {};
        sort[sort_by] = sort_type;
        var options = {
            sort: sort,
            limit: limit,
            page: page,
            populate: ['seller' , 'customer']
        };

        invoice.paginate(query, options).then(function (result) {
            res.json({
                error: false,
                message: 'Get list success!',
                data: result,
                filters: findFilters ? findFilters : [],
                invoiceOfMonth: findDateOfMonth ? findDateOfMonth : []
            })
        });
    // }catch(err){
    //     res.json({
    //         error: true,
    //         message: 'Get list invoice failing!'
    //     })
    // }
};

exports.lone = async function(req,res){
    try{
        let query = req.query;
        let id = req.params.id;
        let seller_id = query.hasOwnProperty('seller_id') ? query.seller_id : '';
        let customer_id = query.hasOwnProperty('customer_id') ? query.customer_id : '';
        let findInvoiceDetail = await invoiceDetail.find({invoice_id: id});
        let findSeller = null;
        if(seller_id!=''){
            findSeller = await user.findOne({_id: seller_id});
        };
        let findCustomer = null;
        if(customer_id != ""){
            findCustomer = await customer.findOne({_id: customer_id});
        };
        if(findInvoiceDetail){
            res.json({
                error: false,
                message: "Retrieving user by id success",
                data: findCustomer ? findCustomer : null,
                name: findSeller ? findSeller.name : null,
                invoice_detail: findInvoiceDetail,
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: "Retrieving invoice by id failed "
        })
    }
}

exports.add = async function(req,res){
    try{
        let body = req.body;
        let customer_id = body.customer_id ? body.customer_id : '';
        if(customer_id==''){
            let new_record = {
                name: "Khách lẻ",
                phone_number: "",
                email: "",
            };
            let findCustomer = await customer.findOne({name: new_record.name});
            if(!findCustomer){
                let add_new_customer = await (new customer(new_record)).save();
                customer_id = add_new_customer._id;
            }else{
                customer_id = findCustomer._id;
            }
        };
        let seller = await user.findOne({name: body.seller});
        let branch_id = body.branch_id ? body.branch_id : '';
        let image = body.hasOwnProperty('image') ? body.image : '';
        let new_invoice = {
            date: (new Date()).toLocaleDateString(),
            customer_id: customer_id,
            seller_id: seller ? seller._id : '',
            image: image ? await base64.base64(image) : '',
            tax_type: body.hasOwnProperty('tax_type') ? body.tax_type : '',
            tax_value: body.hasOwnProperty('tax_value') ? body.tax_value : 0,
            tax_price: body.hasOwnProperty('tax_price') ? body.tax_price : 0,
            total_price: body.hasOwnProperty('total_price') ? body.total_price : 0,
            subtotal: body.hasOwnProperty('subtotal') ? body.subtotal : 0,
            discount_price: body.hasOwnProperty('discount_price') ? body.discount_price : 0,
            discount_value: body.hasOwnProperty('discount_value') ? body.discount_value : 0,
            discount_type: body.hasOwnProperty('discount_type') ? body.discount_type : '',
            branch_id: branch_id
        };
        let add_invoice = await new invoice(new_invoice).save();
        let arr_product_bill = [];
        body.products.forEach(item => {
            let records_invoiceDetail = {
                date: add_invoice.date,
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