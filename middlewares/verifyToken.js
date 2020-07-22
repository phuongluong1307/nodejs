const jwt = require('jsonwebtoken');
const config = require('../configs/overview');
module.exports = function(req,res,next){
    try{
        var headerToken = req.headers['auth-token'];
        var token = headerToken || headerToken.split(' ')[1];
        // Theo tài liệu thì hàm này trả về key auth-token trong header mà sao nó ko ra mà nó chết luôn ở đây  ; tạm thời để đây mai cậu hiếu coi 
        if(!token) return res.status(401).send('Access Denied');
        jwt.verify(token, config.secret_token,function(err, decoded){
            if(err) return res.status(403);
            req.user = decoded;
            next();
        });
    }catch(err){
        res.json({
            error: true,
            message: 'Cannot found!!!'
        });
    }
}