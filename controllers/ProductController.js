const { product } = require('../models/ProductModel');
const { category } = require('../models/CategoryModel');
const helper = require('../libs/helper');
var path = require('path');
var fs = require('fs');
exports.list = async function (req, res) {
    try {
        let query = {};
        let limit = req.query.limit ? parseInt(req.query.limit) : 100;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let sort_by = req.query.sort_by ? req.query.sort_by : 'created_at';
        let sort_type = req.query.sort_type ? req.query.sort_type : 'desc';
        let keyword = req.query.keyword ? helper.toSlug(req.query.keyword) : '';
        if(keyword != ''){
            query.product_name_search = {$regex: '.*'+keyword+'.*'};
        }
        let sort = {};
        sort[sort_by] = sort_type;
        const options = {
            page: page,
            limit: limit,
            sort: sort
        };
        product.paginate(query, options).then(function(result){
            res.json({
                error: false,
                message: 'Get list product success!',
                data: result
            })
        });
    } catch (err) {
        res.json({
            error: true,
            message: 'Get list product fail!'
        })
    }
}

exports.add = async function (req, res) {
    try {
        let body = req.body;
        let new_category = await category.findOne({ category_name: body.category });
        let thumbnail = body.hasOwnProperty('thumbnail') ? body.thumbnail : '';
        let file_name = ((new Date()).getTime() + "-" + (new Date()).getDate() + "-" + (new Date().getMonth() + 1))+".jpg";
        let month = `${(new Date().getMonth() + 1) + "-" + (new Date().getFullYear())}`;
        let addMonth = await fs.mkdir(`./upload/${month}`, { recursive: true }, function(err){
            console.log(err)
        })
        let dirname = month ? month : addMonth;
        let Path = path.format({
            root: "C:\Users\ADMINS\Desktop\nodejs",
            dir: `upload/${dirname}`,
            base: file_name,
        });
        let ext = thumbnail.replace("data:image/", "");
        ext = ext.split(";base64");
        var base64Rejex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
        var isBase64Valid = base64Rejex.test(thumbnail); 
        var regex = new RegExp(`^data:image\/${ext[0]};base64,`);
        if(isBase64Valid){
            thumbnail = thumbnail.replace(regex, "");
            fs.writeFile(Path, thumbnail, 'base64', function(err) {
                console.log(err);
            });
        };
        let new_product = {
            product_name: body.hasOwnProperty('product_name') ? body.product_name : '',
            product_SKU: body.hasOwnProperty('product_SKU') ? body.product_SKU : '',
            thumbnail: isBase64Valid ? '/'+file_name : thumbnail,
            price: body.hasOwnProperty('price') ? parseInt(body.price) : '',
            category: new_category ? new_category.category_name : ''
        };
        let check_empty = [new_product.product_name, new_product.product_SKU, new_product.thumbnail, new_product.price].indexOf('');
        if (check_empty > -1) {
            return res.json({
                error: true,
                message: 'Please enter a full information!'
            })
        };
        let check_dupli = await product.findOne({ product_name: new_product.product_name });
        if (check_dupli) return res.json({
            error: true,
            message: 'Product name already exists!'
        })
        let product_records = await new product(new_product).save();
        if (product_records) {
            return res.json({
                error: false,
                message: 'Add product success!'
            })
        }
    } catch (err) {
        res.json({
            error: true,
            message: 'Add product fail!'
        })
    }
};

exports.update = async function (req, res) {
    try {
        let body = req.body;
        let new_category = await category.findOneAndUpdate({ category: body.category }, { category_name: body.category, category: body.category }, { new: true });
        let new_product = {
            product_name: body.hasOwnProperty('product_name') ? body.product_name : '',
            product_SKU: body.hasOwnProperty('product_SKU') ? body.product_SKU : '',
            thumbnail: body.hasOwnProperty('thumbnail') ? body.thumbnail : '',
            price: body.hasOwnProperty('price') ? parseInt(body.price) : '',
            category: new_category ? new_category.category_name : '',
            default_url: body.hasOwnProperty('product_name') ? body.default_url : '',
        };
        let id = req.params.id;
        let after_update = await product.findOneAndUpdate({ _id: id }, new_product, { new: true }, function (err, doc) {
            if (err) {
                return res.json({
                    error: true,
                    message: 'Update product failed!'
                })
            }
            return res.json({
                error: false,
                message: 'Update product success!'
            })
        });
        return after_update;
    } catch (err) {
        res.json({
            error: true,
            message: 'Update product fail!'
        })
    }
};

exports.delete = async function (req, res) {
    try {
        let id = req.params.id;
        let delete_product = await product.findOneAndDelete({ _id: id });
        if (delete_product) {
            return res.json({
                error: false,
                message: 'Delete product success!'
            })
        }
    } catch (err) {
        res.json({
            error: true,
            message: 'Delete product fail!'
        })
    }
}