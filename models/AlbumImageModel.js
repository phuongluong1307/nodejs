const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const collection_name = 'albumImage';

const ModalSchema = new Schema({
    album_name: {type:String},
    album: {type:Array},
    created_at: {type:Number, default: Date.now()},
    updated_at: {type:Number, default: Date.now()}
});

const MainModel = mongoose.model(collection_name, ModalSchema);

module.exports = {
    album: MainModel
}