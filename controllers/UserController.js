const { user } = require('../models/UserModel');
const helper = require('../libs/helper');
const { role } = require('../models/RoleModel');
const { page } = require('../models/PageModel');
const { avatar } = require('../models/AvatarModel');
var bcrypt = require('bcrypt');
exports.list = async function (req, res) {
    try {
        let sort_by = req.query.sort_by ? req.query.sort_by : 'created_at';
        let sort_type = req.query.sort_type ? req.query.sort_type : 'desc';
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let limit = req.query.limit ? parseInt(req.query.limit) : 10;
        let keyword = req.query.keyword ? helper.toSlug(req.query.keyword) : '';
        let query = {};
        if(keyword!=''){
            /** Tìm 1 key nào đó trong các record có "username" chứa từ khóa "keyword" */
            // query.username = {$regex: '.*'+keyword+'.*'};

            /** Tìm 1 key nào đó trong các record có "username", hoặc "name" chứa từ khóa "keyword" */
            query.$or = [
                {username_search: {$regex: '.*'+keyword+'.*'}},
                {name_search: {$regex: '.*'+keyword+'.*'}}
            ]
        }
        
        let sort = {};
        sort[sort_by] = sort_type;
        var options = {
            sort: sort,
            limit: limit,
            page: page,
        };

        user.paginate(query, options).then(function (result) {
            res.json({
                error: false,
                message: 'Get list success!',
                data: result,
                options: options,
            })
        });

    } catch{
        res.json({
            error: true,
            message: 'Get list fail!'
        })
    }
};

exports.single = async function (req, res) {
    try {
        let id = req.params.id;
        let single_user = await user.findOne({ _id: id }, function (err, doc) {
            if (err) {
                res.json({
                    error: true,
                    message: err
                })
            } else {
                res.json({
                    error: false,
                    message: 'Get user success!',
                    data: doc
                })
            }
        });
        return single_user;
    } catch{
        res.json({
            error: true,
            message: 'Get user fail!'
        })
    }
}

// chỗ mà nãy mình bỏ vô nó sẽ tự parse dữ liệu thành các biến bỏ vô thằng req.body 
// sau này mính chỉ cần nhận dữ liệu giao thức POST thông qua thằng body
// còn dữ liệu giao thức GET thì mình nhận dữ liệu thông qua biến req.query
// còn dữ liệu route động "/:id" kiểu này thì mình nhận biến id thông qua thằng req.params.id

exports.add = async function (req, res) {
    try {
        /*rồi mình giả sử các biến thằng client gửi lên làn lượt là username,password,name,default_url,email */
        let role_id = await role.findOne({name: req.body.role_id});
        let default_url = await page.findOne({name: req.body.default_url});
        let dupli_user = await user.findOne({username: req.body.username});
        if(dupli_user) return res.status(403).send('Username already exists');
        let new_record = {
            name: req.body.hasOwnProperty('name') ? req.body.name : '',
            username: req.body.hasOwnProperty('username') ? req.body.username : '',
            password: req.body.hasOwnProperty('password') ? req.body.password : '',
            email: req.body.hasOwnProperty('email') ? req.body.email : '',
            default_url: default_url ? default_url.url : '',
            forget_token: '',
            token_exprired: '',
            role_id: role_id
        };
        const salt = await bcrypt.genSalt(10);
        const hashPassword = await bcrypt.hash(new_record.password, salt);
        if (new_record.password != '') {
            new_record.password = hashPassword;
        }
        let handle_empty = [new_record.name, new_record.password, new_record.username, new_record.email, new_record.role_id, new_record.default_url].indexOf('');
        if (handle_empty > -1) return res.status(400).send('Please enter a full information!');
        let inserted_record = await (new user(new_record)).save();
        if(inserted_record){
            let avatarUser = {
                avatar: "https://www.wishare.com/images/user_default.png",
                name: new_record.username
            }
            await avatar(avatarUser).save();
        };

        //rồi giở mình xử lý mấy cái ràng buộc kiểm tra dữ liệu trước kiểm tra username , name, password, email phải khác rỗng . con viết cái này cho cậu hiếu sau
        res.json({
            error: false,
            message: 'Add user success!',
            data: inserted_record,
        })
    } catch (err) {
        res.json({
            error: true,
            message: 'Add user fail!'
        })
    }
}

exports.update = async function (req, res, next) {
    try {
        let id = req.params.id;
        
        let old_password = await user.findOne({_id: id});
        let new_password = req.body.password;
        const salt = await bcrypt.genSalt(10);
        var hashPassword = await bcrypt.hash(new_password, salt);;
        if(new_password !== old_password.password){
            hashPassword;
        }else{
            hashPassword = old_password.password;
        };
        let role_id = await role.findOne({name: req.body.role_id});
        let new_user = {
            username: req.body.username,
            password: hashPassword,
            name: req.body.name,
            email: req.body.email,
            default_url: req.body.default_url,
            forget_token: '',
            token_exprired: '',
            name_search: helper.toSlug(req.body.name),
            username_search: helper.toSlug(req.body.username),
            role_id: role_id
        };
        let result = await user.findOneAndUpdate({ _id: id }, new_user, { new: true }, function (err, doc) {
            if (!err) {
                return res.json({
                    error: false,
                    message: 'Update user success!',
                    data: doc
                })
            } else {
                return res.json({
                    error: true,
                    message: 'Update user fail!'
                })
            }
        });
        return result;
    } catch (err) {
        res.json({
            error: true,
            message: 'Update list fail!'
        })
    }
};

exports.delete = async function (req, res) {
    try {
        let id = req.params.id;
        let result = await user.findOneAndDelete({ _id: id })
        if (result) {
            res.json({
                error: false,
                message: 'Delete user success!',
                data: result
            })
        } else {
            res.json({
                error: true,
                message: 'Delete user fail!'
            })
        };
    } catch (err) {
        res.json({
            error: true,
            message: 'Delete user fail!'
        })
    }
}
