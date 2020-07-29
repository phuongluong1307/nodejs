const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let collection_name = "invoices";

const ModelSchema = new Schema({
    code_bill: {type: String},
    date_of_sale: {type: String},
    customer_id: {type: String},
    list_product: {type: Array},
    seller: {type: String},
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()}
});

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    invoice: MainModel
}