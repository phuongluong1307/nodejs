const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

let collection_name = "invoices";

const ModelSchema = new Schema({
    code_bill: {type: String},
    date: {type: String},
    month: {type: String},
    customer_id: {type: String},
    branch_id: {type:String},
    seller_id: {type: String},
    image: {type: String},
    tax_value: {type: Number},
    tax_price: {type: Number},
    subtotal: {type: Number},
    total_price: {type: Number},
    discount_price: {type: Number}, // 100,000 | 100,000 
    discount_value: {type: Number}, // 10 | 100,000 
    discount_type: {type: String}, // percent | money 
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()}
}, {
    toJSON: {virtuals: true}
});

ModelSchema.pre('save', async function(next) {
    const { invoice } = require('./InvoiceModel');
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
    this.code_bill = code_bill;
    next();
});

ModelSchema.virtual('seller', {
    ref: 'users', // The model to use
    localField: 'seller_id', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`
    justOne: true
});

ModelSchema.virtual('customer', {
    ref: 'customers', // The model to use
    localField: 'customer_id', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`
    justOne: true
});

ModelSchema.virtual('branch', {
    ref: 'branches', // The model to use
    localField: 'branch_id', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`
    justOne: true
});

ModelSchema.plugin(mongoosePaginate);

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    invoice: MainModel
}