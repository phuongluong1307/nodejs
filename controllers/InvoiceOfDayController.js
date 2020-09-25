const { invoice_of_day } = require('../models/InvoiceOfDayModel');
exports.list = async function(req,res){
    try{
        let branch_id = req.query.branch_id ? req.query.branch_id : "";
        let month_of_year = req.query.month_of_year ? req.query.month_of_year : '';
        if(branch_id != '' && month_of_year != ''){
            let invoiceOfBranch = await invoice_of_day.aggregate([
                {
                    $match: {branch_id: branch_id, month: month_of_year}
                },
                {
                    $group: {_id: {branch_id: "$branch_id", day: "$day"}, total: {$sum: "$data.total_price"}}
                },
            ]);
            if(invoiceOfBranch !== null){
                return res.json({
                    error: false,
                    data: invoiceOfBranch
                })
            }
        };
    }catch(err){
        res.json({
            error: true,
            message: err
        })
    }
}