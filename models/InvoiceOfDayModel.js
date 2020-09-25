const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var collection_name = "invoice_of_day";

const ModelSchema = new Schema({
    branch_id: {type: String},
    year: {type: String},
    month: {type: String},
    day: {type: String},
    data: {
        total_order: {type: Number},
        total_price: {type: Number},
    },
    created_at: {default: Date.now(), type: Number},
    updated_at: {default: Date.now(), type: Number}
});

ModelSchema.pre('save', async function(next){
    const { invoice_of_month } = require('../models/InvoiceOfMonthModel');
    const { invoice_of_year } = require('../models/InvoiceOfYearModel');
    let findOfMonth = await invoice_of_month.find({month: this.month});
    if(findOfMonth.length == 0){
        let record = {
            branch_id: this.branch_id,
            year: this.year,
            month: this.month,
            data: this.data
        };
        await new invoice_of_month(record).save();
    };
    let findOfYear = await invoice_of_year.find({year: this.year});
    if(findOfYear.length == 0){
        let record = {
            branch_id: this.branch_id,
            year: this.year,
            data: this.data
        };
        await new invoice_of_year(record).save();
    };
    next();
});

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    invoice_of_day: MainModel
}