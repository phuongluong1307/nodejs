const { album } = require('../models/AlbumImageModel');
exports.list = async function (req, res) {
    try {
        let listRecords = await album.find({});
        if (listRecords) {
            return res.json({
                error: false,
                message: 'Get list album success!',
                data: listRecords
            })
        }
    } catch (err) {
        res.json({
            error: true,
            err
        })
    }
}

exports.add = async function (req, res) {
    try {
        let album_name = req.body.hasOwnProperty('album_name') ? req.body.album_name : '';
        let addImage = await new album({album_name: album_name}).save();
        if(!addImage){
            return res.json({
                error: true,
                message: 'Add album failed!'
            })
        }
        return res.json({
            error: false,
            message: 'Get album success!',
            data: addImage
        })
    } catch (err) {
        res.json({
            error: true,
            err
        })
    }
}

exports.push = async function(req, res){
    try{
        let id = req.params.id;
        let new_image = {
            id: Math.random(),
            image: req.body.hasOwnProperty('image') ? req.body.image : '',
            title: req.body.hasOwnProperty('title') ? req.body.title : '',
        };
        let records = await album.updateOne({_id: id},{$push: {album: new_image}})
        if(records){
            return res.json({
                error: false,
                message: 'Push image success!',
                data: records
            })
        }
    }catch(err){
        res.json({
            error: true,
            err
        })
    }
}