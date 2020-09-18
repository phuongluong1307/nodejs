const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var collection_name = "invoice_of_day"

const ModelSchema = new Schema({
    branch_id: {type: String},
    year: {type: String},
    month: {type: String},
    day: {type: String},
    data: {
        total_order: {type: Number},
        total_price: {type: Number},
    },
    created_at: {default: Date.now(), type: Number},
    updated_at: {default: Date.now(), type: Number}
});

const MainModel = mongoose.model(collection_name, ModelSchema);

module.exports = {
    invoice_of_day: MainModel
}