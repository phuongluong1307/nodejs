const { user } = require('../models/UserModel');
const config = require('../configs/overview');
var bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const nodemailer = require("nodemailer");

exports.login = async function (req, res) {
    try {
        let username = req.body.hasOwnProperty('username') ? req.body.username : '';
        let password = req.body.hasOwnProperty('password') ? req.body.password : '';

        let finduser = await user.findOne({
            username: username
        });
        if (!finduser) {
            return res.json({
                error: true,
                message: 'Not found user !'
            });
        };
        bcrypt.compare(password, finduser.password, async function (err, result) {
            if (result === true) {
                const token = jwt.sign({
                    id: finduser._id,
                    name: finduser.name,
                    username: finduser.username
                }, config.secret_token);
                return res.json({
                    error: false,
                    message: 'Login success !',
                    default_url: finduser.default_url,
                    token: token,
                    username: finduser.username
                });
            } else {
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash('123123', salt);
                return res.json({
                    error: true,
                    message: 'User or Password invalid !'
                });
            }
        });
    } catch (err) {

    }
}

exports.forget = async function (req, res) {
    try {
    let info_user = req.body.hasOwnProperty('info') ? req.body.info : '';
    user.findOne(
        {
            $or: [
                { username: info_user },
                { email: info_user }
            ]
        }, async function (err, User) {
            if (err || !User) {
                return res.json({
                    error: true,
                    message: 'Username or your email does not exists'
                })
            }
            const token = jwt.sign({ _id: User.id, username: User.username }, config.forget_token, { expiresIn: '15m' });
            var transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                port: 587,
                secure: false, // true for 465, false for other ports
                service: 'Gmail',
                auth: {
                  user: config.username,
                  pass: config.password
                }
            });
            var mailOptions = {
                from: config.username,
                to: 'phuongluong130796@gmail.com',
                subject: 'Sending Email using Node.js',
                text: 'That was easy!',
                html: `
                    <div style="background: #eee;width:100%;overflow: hidden;min-height: 100%;font-family: Arial, Helvetica, sans-serif;">
                        <div style="width:500px;background:#fff;margin:50px auto;border:1px solid #e1e1e1;">
                            <table style="width:100%;border-collapse: collapse;">
                                <tr>
                                    <td style="text-align: center;font-size: 17px;font-weight: bold;border-bottom:1px solid #e1e1e1;padding:20px;">Yêu cầu reset mật khẩu</td>
                                </tr>
                                <tr>
                                    <td style="padding:20px;text-align: center;">
                                        <p>Bạn vừa yêu cầu cấp lại mật khẩu mới từ trang <a href="${config.linkForgot}">${config.linkForgot}</a></p>
                                        <p>Nếu bạn là người gửi yêu cầu hãy click vào link bên dưới để hoàn tất việc cấp lại mật khẩu</p>
                                        <p><a href="${config.linkForgot}/reset-password.html?token=${token}&user_id=${User.id}" style="display: inline-block;color:#fff;background:#27c;padding:8px 12px;border-radius:4px;text-decoration:none;cursor:pointer;">Xác nhận cấp lại mật khẩu</a></p>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding:20px;text-align: center;border-top:1px solid #e1e1e1;font-size: 12px;">Copyright by ${config.linkForgot}</td>
                                </tr>
                            </table>
                        </div>
                    </div>
                `
              };
            return User.updateOne({forget_token: token},function(err, success){
                if(err){
                    return res.json({
                        error: true,
                        message: 'Reset password link error'
                    })
                }else{
                    transporter.sendMail(mailOptions, function(err, info){
                        if(err){
                            console.log(err)
                        }else{
                            return res.json({
                                message: 'Email has been sent, kindly activate your account',
                                token: token
                            })
                        }
                    })
                }
            })
        }
    );
    } catch (err) {
        res.json({
            error: true,
            message: err
        })
    }
}

exports.resetPassword = function(req, res){
    try{
        let token = req.body.hasOwnProperty('token') ? req.body.token : '';
        let newPass = req.body.hasOwnProperty('newPass') ? req.body.newPass : '';
        let user_id = req.body.hasOwnProperty('user_id') ? req.body.user_id : '';
        
        if(token){
            jwt.verify(token, config.forget_token, async function(err, decoded){
                if(err){
                    return res.json({
                        error: true,
                        message: 'Incorrect token or it is expired'
                    })
                }
                let find = await user.findOne({forget_token: token, _id: user_id});
                if(!find){
                    return res.json({
                        error: true,
                        message: 'Users with this token does not exists !'
                    });
                }
                
                const salt = await bcrypt.genSalt(10);
                const hashPassword = await bcrypt.hash(newPass, salt);
                const new_password = {
                    password: hashPassword,
                    forget_token: ''
                }
                find.password = new_password.password;
                find.forget_token = '';
                await find.save();
                return res.json({
                    error: false,
                    message: 'Your password has been changed'
                })
            })
        }else{
            return res.json({
                error: true,
                message: 'Users with this token does not exists.'
            })
        }
    }catch(err){
        res.json({
            error: true,
            message: err
        })
    }
}

exports.chekResetToken = async function(req, res){
    try{
        let token = req.body.hasOwnProperty('token') ? req.body.token : '';
        let user_id = req.body.hasOwnProperty('user_id') ? req.body.user_id : '';
        let find = await user.findOne({forget_token: token, _id: user_id});
        if(!find){
            return res.json({
                error: true,
                message: 'Token or user not found !'
            });
        }
        return res.json({
            error: false,
            message: 'Token valid !',
            data: find,
            req: req.body
        });
    }catch(e){
        res.json({
            error: true,
            message: e.message
        });
    }
}