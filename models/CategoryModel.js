const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var collection_name = 'categories';

const ModalSchema = new Schema({
    category_name: {type:String},
    category: {type:String},
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()}
});

const MainModal = mongoose.model(collection_name, ModalSchema);
module.exports = {
    category: MainModal
}