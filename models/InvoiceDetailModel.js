const mongoose= require('mongoose');
var collection_name = "invoice_detail";

const Schema = mongoose.Schema;

const ModelSchema = new Schema({
    invoice_id: {type: String},
    customer_id: {type:String},
    product_id: {type: String},
    product_name: {type: String},
    image: {type: String},
    quantity: {type: Number},
    price: {type:Number},
    date: {type: String},
    discount_price: {type:Number},
    discount_value: {type:Number},
    discount_type: {type:String},
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()}
});

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    invoiceDetail: MainModel
}