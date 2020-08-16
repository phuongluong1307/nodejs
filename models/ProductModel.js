const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;
var collection_name = "products";
var helper = require('../libs/helper');

const ModelSchema = new Schema({
    barcode_id: {type: String},
    product_name: {type: String},
    product_SKU: {type: String},
    thumbnail: {type: String},
    price: {type: Number},
    category: {type:String},
    token_exprired: {type: String},
    default_url: {type: String},
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()},
    product_name_search: {type:String}
}, {
    toJSON: {virtuals: true}
});

/*
ModelSchema.virtual('parent', {
    ref: 'categories', // The model to use
    localField: 'parent_id', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`
    justOne: true
});
*/

ModelSchema.pre('save', function(next) {
    this.product_name_search = helper.toSlug(this.product_name);
    this.barcode_id = this.barcode_id.split(' ').join('');
    this.barcode_id = helper.toSlug(this.barcode_id);
    next();
});

ModelSchema.plugin(mongoosePaginate);

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    product: MainModel
}
