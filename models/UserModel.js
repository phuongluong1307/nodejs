const mongoose = require("mongoose");
const mongoosePaginate = require('mongoose-paginate-v2');
const helper = require('../libs/helper');

const Schema = mongoose.Schema;
var collection_name = "users";

const ModelSchema = new Schema({
    username: {type: String},
    password: {type: String},
    name: {type: String},
    email: {type: String},
    forget_token: {type: String},
    token_exprired: {type: String},
    default_url: {type: String},
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()},
    role_id: {type: Object},
    name_search: {type: String},
    username_search: {type: String}
}, {
    toJSON: {virtuals: true}
});

/** Chỗ này tí mình xài sau giờ mình làm model cho user test trước */
/*
ModelSchema.virtual('parent', {
    ref: 'categories', // The model to use
    localField: 'parent_id', // Find people where `localField`
    foreignField: '_id', // is equal to `foreignField`
    justOne: true
});

*/

ModelSchema.pre('save', function(next) {
    this.name_search = helper.toSlug(this.name);
    this.username_search = helper.toSlug(this.username);
    next();
});

ModelSchema.plugin(mongoosePaginate);

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    user: MainModel
}
