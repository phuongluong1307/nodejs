const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;

let collection_name = "invoices";

const ModelSchema = new Schema({
    code_bill: {type: String},
    date: {type: String},
    customer_id: {type: String},
    seller_id: {type: String},
    total_price: {type: Number},
    discount_price: {type: Number}, // 100,000 | 100,000 
    discount_value: {type: Number}, // 10 | 100,000 
    discount_type: {type: String}, // percent | money 
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()}
});

ModelSchema.plugin(mongoosePaginate);

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    invoice: MainModel
}