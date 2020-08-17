const { product } = require('../models/ProductModel');
const { category } = require('../models/CategoryModel');
const helper = require('../libs/helper');
const base64 = require('../libs/base64');
var path = require('path');
var fs = require('fs');
const request = require('request')
exports.list = async function (req, res) {
    try {
        let query = {};
        let limit = req.query.limit ? parseInt(req.query.limit) : 100;
        let page = req.query.page ? parseInt(req.query.page) : 1;
        let sort_by = req.query.sort_by ? req.query.sort_by : 'created_at';
        let sort_type = req.query.sort_type ? req.query.sort_type : 'desc';
        let keyword = req.query.keyword ? helper.toSlug(req.query.keyword) : '';
        let barcode_id = req.query.barcode_id ? req.query.barcode_id : '';
        if(keyword != ''){
            query.product_name_search = {$regex: '.*'+keyword+'.*'};
        };
        if(barcode_id!=''){
            barcode_id = barcode_id.split(' ').join('');
            barcode_id = helper.toSlug(barcode_id);
            query.barcode_id = barcode_id;
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
                data: result,
                query: query
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
        let new_category = await category.findOne({ category: body.category });
        let thumbnail = body.hasOwnProperty('thumbnail') ? body.thumbnail : '';
        let new_product = {
            barcode_id: body.hasOwnProperty('barcode_id') ? body.barcode_id : '',
            product_name: body.hasOwnProperty('product_name') ? body.product_name : '',
            product_SKU: body.hasOwnProperty('product_SKU') ? body.product_SKU : '',
            thumbnail: thumbnail ? await base64.base64(thumbnail) : '',
            price: body.hasOwnProperty('price') ? parseInt(body.price) : '',
            category: new_category ? new_category.category_name : ''
        };
        let data = req.body.data ? req.body.data : '';
        var arr_product_excel = [];
        let list_product = await product.find({});
        var arr_success = [];
        if(data!=''){
            
            let month = `${(new Date().getMonth() + 1) + "-" + (new Date().getFullYear())}`;
            let addMonth = await fs.mkdir(`./upload/${month}`, { recursive: true }, function(err){
                console.log(err)
            })

            data.forEach(async (item) => {
                let check_dupli = list_product.findIndex(row => row.product_name === item.TênSP);
                let add_product = {
                    product_name: "",
                    product_SKU: "",
                    thumbnail: "",
                    price: "",
                    category: "",
                    option: ""
                };

                let file_name = (Math.floor(Math.random() * (new Date()).getMilliseconds()) + "-" + (new Date()).getDate() + "-" + (new Date().getMonth() + 1))+".jpg";

                let dirname = month ? month : addMonth;
                let Path = path.format({
                    root: "",
                    dir: `./upload/${dirname}`,
                    base: file_name,
                });
                const download = (url, path, callback) => {
                    request.head(url, (err, res, body) => {
                        request(url)
                        .pipe(fs.createWriteStream(path))
                        .on('close', callback)
                    })
                };

                const url = item.HìnhẢnh;
                const urlImage = Path;
                
                let pathImage = "/" + dirname +'/' + file_name;
                if(check_dupli > -1){
                    add_product = {
                        product_name: item.TênSP,
                        product_SKU: item.MãSP,
                        thumbnail: pathImage,
                        price: item.Giá,
                        category: item.LoạiSP,
                        option: "Thêm thất bại"
                    };
                }else{
                    download(url, urlImage, () => {
                        console.log('done')
                    });
                    add_product = {
                        product_name: item.TênSP,
                        product_SKU: item.MãSP,
                        thumbnail: pathImage,
                        price: item.Giá,
                        category: item.LoạiSP,
                        option: "Thêm thành công"
                    };
                    arr_success.push(add_product)
                }
                arr_product_excel.push(add_product);
            });
        };
        if(arr_product_excel.length > 0){
            await product.insertMany(arr_success);
            return res.json({
                error: false,
                message: "Add file success!",
                data: arr_product_excel
            });
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
        let thumbnail = body.hasOwnProperty('thumbnail') ? body.thumbnail : '';
        let findImage = await product.findOne({thumbnail: thumbnail});
        console.log(findImage)
        let barcode_id = body.hasOwnProperty('barcode_id') ? body.barcode_id : '';
        barcode_id = barcode_id.split(' ').join('');
        barcode_id = helper.toSlug(barcode_id);
        let new_product = {
            barcode_id: barcode_id,
            product_name: body.hasOwnProperty('product_name') ? body.product_name : '',
            product_SKU: body.hasOwnProperty('product_SKU') ? body.product_SKU : '',
            thumbnail: findImage ? thumbnail : await base64.base64(thumbnail),
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