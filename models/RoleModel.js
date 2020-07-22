const mongoose = require("mongoose");
// const mongoosePaginate = require('mongoose-paginate-v2');
const Schema = mongoose.Schema;
var collection_name = "roles";

const ModelSchema = new Schema({
    name: {type: String},
    permissions: {type: Array },
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()},
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


ModelSchema.plugin(mongoosePaginate);
*/
const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    role: MainModel
}
