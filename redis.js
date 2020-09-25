const redis = require('redis');

const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient(REDIS_PORT);

global.client = client;

exports.setCache = function(key,data){
    this.key = key;
    this.data = data;
    return client.set(this.key, this.data);
};

exports.caching = function(key){
    try {
        this.result = function(req,res,next){
            client.get(key, function(err, data){
                if(err) throw err;
                if(data !== null){
                    res.json({
                        error: false,
                        data: JSON.parse(data),
                        message: 'data ' + key + '/123'
                    })
                }else{
                    next();
                }
            });
        }
        return this.result;
    } catch (error) {
        if(error) throw error;
    }
};