const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');
const helper = require('../libs/helper');

const Schema = mongoose.Schema;
var collection_name = "customers";

const ModelSchema = new Schema({
    name: {type:String},
    phone_number: {type:Number},
    email: {type:String},
    created_at: {type:Number,default: Date.now()},
    updated_at: {type:Number, default: Date.now()},
    name_search: {type:String}
});

ModelSchema.pre('save', function(next) {
    this.name_search = helper.toSlug(this.name);
    next();
});

ModelSchema.plugin(mongoosePaginate);

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    customer: MainModel
}

