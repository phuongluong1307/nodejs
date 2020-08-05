const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const server = http.createServer(app);
const { role } = require('./models/RoleModel');

/** Chỗ này là middleware trước khi đưa vào route mình sẽ parse sẵn dữ liệu json thành các biến để sau này không phải parse nữa 
 * express.json({limit: '50mb'})
*/
app.use(express.json({ limit: '50mb' }));

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
            return mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, socketTimeoutMS: 5000, poolSize: 15 }, function (err, db) {
                if (err) {
                    console.error('Failed to connect to mongo on startup - retrying in 5 sec', err);
                    setTimeout(connectWithRetry, 2000);
                } else {
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