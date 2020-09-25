const { invoice_of_month } = require('../models/InvoiceOfMonthModel');
const cache = require('../redis');
exports.list = async function(req,res){
    try{
        let arrMonth = req.query.arrMonth ? req.query.arrMonth : '';
        let listBranch = req.query.listBranch ? req.query.listBranch : '';
        let findRecords = await invoice_of_month.aggregate([
            {
                $match: {branch_id: listBranch, month: {$in: typeof arrMonth == "array" || typeof arrMonth == 'object' ? arrMonth : []}}
            },
            {
                $group: {_id: {branch_id: "$branch_id", month: "$month"}, count: {$sum : "$data.total_order"}, total: {$sum: "$data.total_price"}}
            }
        ]);
        if(findRecords){
            let key = 'invoice_of_month';
            cache.setCache(key, JSON.stringify(findRecords));
            res.json({
                error: false,
                message: 'Get list invoice of month success!!!',
                data: findRecords
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: err
        })
    }
}