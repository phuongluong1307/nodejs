const http = require('http');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const mongoose = require("mongoose");
const server = http.createServer(app);
const io = require('socket.io').listen(server);
const { branch } = require('./models/BranchModel');
var amqp = require('amqplib/callback_api');
const { invoice_of_day } = require('./models/InvoiceOfDayModel');
const { invoice_of_month } = require('./models/InvoiceOfMonthModel');
const { invoice_of_year } = require('./models/InvoiceOfYearModel');

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
    });

    var rabbit = 'amqp://localhost'

    amqp.connect(rabbit, function(error0, connection){
        if(error0){
            throw error0;
        }

        connection.createChannel(function(error1, channel){
            if(error1){
                throw error1;
            }
            var queue = 'Invoice';

            channel.assertQueue(queue, {durable: true});

            channel.consume(queue, async function(msg){
                let obj = JSON.parse(msg.content.toString());
                let date = new Date(obj.date)
                console.log(date)
                let find_record = await invoice_of_day.find({branch_id: obj.branch_id,year: date.getFullYear(), month: date.getMonth(), day: date.getDate()});
                if(find_record.length > 0){
                    let update_record = {
                        data: {
                            total_order: find_record[0].data.total_order += 1,
                            total_price: find_record[0].data.total_price += obj.total_price
                        }
                    };
                    await invoice_of_day.findOneAndUpdate({_id: find_record[0]._id}, update_record, {new: true},function(err, docs){
                        if(err){
                            throw err;
                        }
                        let total_order = docs.total_order;
                        let total_price = docs.total_price;
                        socket.emit('update invoice', total_order, total_price);
                    });
                    await invoice_of_month.findOneAndUpdate({year: find_record[0].year, month: find_record[0].month,}, update_record, {new: true});
                    await invoice_of_year.findOneAndUpdate({year: find_record[0].year}, update_record, {new: true});
                }else{
                    let add_record = {
                        branch_id: obj.branch_id,
                        year: new Date(obj.date).getFullYear().toString(),
                        month: (new Date(obj.date).getMonth()).toString(),
                        day: new Date(obj.date).getDate().toString(),
                        data: {
                            total_price: obj.total_price,
                            total_order: 1
                        }
                    };
                    let add_invoice = await new invoice_of_day(add_record).save();
                    if(add_invoice){
                        socket.emit('add invoice', add_invoice);
                    };
                }
            },{
                noAck: true
            });

        })

    });
    
});

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
            return mongoose.connect(DB_URI, { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false, socketTimeoutMS: 300000, poolSize: 15 },async function (err, db) {
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

app.use(express.static('upload'));
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
    branch: 'branches',
    invoiceofday: 'invoice-of-day',
    invoice_of_month: 'invoice-of-month',
    invoice_of_year: 'invoice-of-year',
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