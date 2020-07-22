const mongoose = require('mongoose');
const Schema = mongoose.Schema;
var collection_name = 'pages';

const ModelSchema = new Schema({
    name: {type:String},
    url: {type: String},
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()},
}, {
    toJSON: {virtuals: true}
});

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    page: MainModel
}