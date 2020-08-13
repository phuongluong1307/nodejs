const mongoose = require('mongoose');
const helper = require('../libs/helper');
var collection_name = "branches";
const Schema = mongoose.Schema;

const ModelSchema = new Schema({
    name: {type:String},
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()}
});

ModelSchema.pre('save', function(next) {
    this.name_search = helper.toSlug(this.name);
    next();
});

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    branch: MainModel
}