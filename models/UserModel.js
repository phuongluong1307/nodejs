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
    list_branch: {type:Array},
    forget_token: {type: String},
    token_exprired: {type: String},
    default_url: {type: String},
    created_at: {type: Number, default: Date.now()},
    updated_at: {type: Number, default: Date.now()},
    role_id: {type: Object},
    name_search: {type: String},
    username_search: {type: String},
    is_superadmin: {type: Boolean}
}, {
    toJSON: {virtuals: true}
});

ModelSchema.virtual('role', {
    ref: 'roles', // Tên bảng muốn liên kết
    localField: 'role_id', // Khóa liên kết giữa bảng này và bảng ở trên (roles)
    foreignField: '_id', // Khóa liên kết ở bảng này (role_id) sẽ tương ứng với khóa nào bên bảng kia (roles)
    justOne: true
});
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
