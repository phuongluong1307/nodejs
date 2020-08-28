const mongoose = require('mongoose');
const helper = require('../libs/helper');
var collection_name = "branches";
const Schema = mongoose.Schema;
const mongoosePaginate = require('mongoose-paginate-v2');

const ModelSchema = new Schema({
    name: {type:String},
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()},
    name_search: {type:String}
});

ModelSchema.pre('save', function(next) {
    this.name_search = helper.toSlug(this.name);
    next();
});

ModelSchema.plugin(mongoosePaginate);

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    branch: MainModel
}