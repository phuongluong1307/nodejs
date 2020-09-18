const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const { branch } = require('./models/BranchModel');
const { invoice } = require('./models/InvoiceModel');
const { invoice_of_month } = require('./models/InvoiceOfMonthModel');

global.io = io;

io.on('connection', async function(socket){
    socket.on('new bill', async function(branch_id, total_price){
        let findBranch = await branch.findOne({_id: branch_id})
        io.emit('add bill', {branch: findBranch.name, total_price});
    });
    socket.on('client sent image', function(image){
        socket.emit('user stream webcam', image);
    });
    socket.on('user disconnect', (data) => {
        socket.broadcast.emit('data user disconnect', data)
    })
});

/** Chỗ này là middleware trước khi đưa vào route mình sẽ parse sẵn dữ liệu json thành các biến để sau này không phải parse nữa 
 * express.json({limit: '50mb'})
*/
app.use(express.json({ limit: '50mb' }));
app.use(express.static('upload'));

/** Allow cors */
app.use(function (req, res, next) {
    try {
        /** Chỗ header này là mình sẽ khai báo cho phép truy cập từ những tên miền không thuộc tên miền hiện tại với các giao thức cho phép đi qua như GET,PUT,POST,DELETE,OPTIONS 
         * Các request từ các nguồn sẽ cho phép các key trong header bao gồm Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token, auth-token, access-key
        */

        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Methods", "GET, PUT, POST, DELETE, OPTIONS");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, X-Auth-Token, auth-token, access-key");

        var database_name = "first_project";
        /** Chỗ này là mình connect database first_project xem được chưa */
        let DB_URI = "mongodb://127.0.0.1:27017/" + database_name;
        var connectWithRetry = function () {
            return mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, socketTimeoutMS: 30000, poolSize: 15 },async function (err, db) {
                if (err) {
                    console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
                    setTimeout(connectWithRetry, 2000);
                } else {
                    // let status = false;
                    // if(!status){
                    //     let listInvoiceByBranch = await invoice.aggregate([
                    //         {
                    //             $match: {branch_id: "5f3df95bd2cd38126514a743", month: "5/2020"}
                    //         },
                    //         {$group: {_id: {branch_id: "$branch_id", month: "$month"}, total: {$sum: "$total_price"}, count: {$sum: 1}}},
                    //     ]);
                    //     if(listInvoiceByBranch){
                    //         await invoice_of_month.insertMany({
                    //             branch_id: listInvoiceByBranch[0]._id.branch_id,
                    //             year: "2020",
                    //             month: listInvoiceByBranch[0]._id.month,
                    //             data: {
                    //                 total_order: listInvoiceByBranch[0].count,
                    //                 total_price: listInvoiceByBranch[0].total
                    //             }
                    //         })
                    //     };
                    //     status = true;
                    // };
                    // for(let k = 0; k < 2500000; k++){
                    //     let i = Math.floor(Math.random() * 5) + 5;
                    //     let j = Math.floor(Math.random() * 30) + 1;
                    //     let total_price = Math.floor(Math.random() * 1000000);
                    //     let date = i + '/' + j + '/' + 2020;
                    //     let new_invoice = {
                    //         date: i + '/' + j + '/' + 2020,
                    //         total_price: total_price,
                    //         month: ((new Date(date)).getMonth() + 1) + "/" + (new Date(date)).getFullYear(),
                    //         branch_id: "5f3df95bd2cd38126514a743",
                    //         created_at: (new Date(date)).getTime(),
                    //         updated_at: 1599148451267,
                    //         customer_id:"5f409cf4fe41fffe78f72075",
                    //         seller_id:"5f2a887fb651671f705128d7",
                    //     };
                    //     await invoice.insertMany(new_invoice);
                    // };
                    console.log("Connect database " + database_name + " success !");
                    next();
                }
            });
        };
        connectWithRetry();
    } catch (err) {
        res.json({
            error: true,
            message: err
        });
    }
});
/** Route cho phép đi qua không cần token */
var arr_route_public = {
    auth: 'auth'
};

for (key in arr_route_public) {
    var route_file = require('./routes/' + key + '.js');
    app.use('/api/' + arr_route_public[key], route_file);
};

/** Route bắt buộc phải có token mới cho qua */
let verifyToken = require('./middlewares/verifyToken');
var arr_route_private = {
    user: 'users',
    role: 'roles',
    page: 'pages',
    product: 'products',
    category: 'product-categories',
    album: 'product-album',
    avatar: 'avatar-user',
    customer: 'customers',
    invoice: 'invoices',
    invoiceDetail: 'invoice-detail',
    branch: 'branches'
};
for (key in arr_route_private) {
    var route_file = require('./routes/' + key + '.js');
    app.use('/api/' + arr_route_private[key], verifyToken, route_file);
};

app.use('/reload-permission', async function(req, res){
    var arr_permission = [];
    for (key in arr_route_private) {
        var route_file = require('./routes/' + key + '.js');
        const routes = [];
        route_file.stack.forEach(middleware => {
            if (middleware.route) {
                routes.push(`${Object.keys(middleware.route.methods)}`);
            }
        });
        for(i in routes){
            arr_permission.push({
                name: "",
                method: routes[i],
                route: '/api/' + arr_route_private[key]
            });
        };
    };
    res.json({
        data: arr_permission,
        error: false,
        message: "Get list permission success"
    })
})

console.log("server runing at http://localhost:" + port);
server.listen(port);