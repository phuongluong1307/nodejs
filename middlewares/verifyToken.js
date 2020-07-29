const jwt = require('jsonwebtoken');
const config = require('../configs/overview');
const {user} = require('../models/UserModel');
const {role} = require('../models/RoleModel');
const { static } = require('express');
module.exports = async function(req,res,next){
    try{
        var headerToken = req.headers['auth-token'];
        var token = headerToken || headerToken.split(' ')[1];
        if(!token) return res.status(401).send('Access Denied');
        jwt.verify(token, config.secret_token,async function(err, decoded){
            if(err) return res.status(403);
            let current_user = await user.findOne({_id: decoded.id});
            let allow = false;
            if(current_user){
                let role_data = await role.findOne(current_user.role_id);
                if(role_data){
                    let method_url = req.method.toLowerCase() + ":" + req.baseUrl;
                    let permission = role_data.permissions;
                    if(permission.indexOf(method_url)>-1){
                        allow = true;
                    };
                };
                if(current_user.is_superadmin) allow = true;
            };
            if(allow) next();
            else res.status(403).send({message: 'Truy cập bị từ chối'})
            // next();
        });
    }catch(err){
        res.json({
            error: true,
            message: 'Cannot found!!!'
        });
    }
}