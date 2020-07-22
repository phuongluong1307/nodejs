const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var collection_name = "avatars";

const ModalSchema = new Schema({
    avatar: {type: String},
    name: {type:String},
    listImage: {type:Array},
    created_at: {type:Number, default: Date.now()},
    updated_at: {type:Number, default: Date.now()}
});

const MainModel = mongoose.model(collection_name, ModalSchema);

module.exports = {
    avatar: MainModel
}