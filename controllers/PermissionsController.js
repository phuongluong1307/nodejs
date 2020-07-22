const { permission } = require('../models/PermissionsModel');

exports.list = async function (req, res) {
    try {
        let data = await permission.find({});
        res.json({
            error: false,
            message: 'Get list permissions success!',
            data: data
        })
    } catch (err) {
        res.json({
            error: true,
            message: 'Get list permissions fail!'
        })
    }
}

exports.add = async function (req, res) {
    try {
        var new_per = {
            name: req.body.hasOwnProperty('name') ? req.body.name : '',
            key: req.body.hasOwnProperty('key') ? req.body.key : '',
        }
        let add_per = await new permission(new_per).save();
        return res.json({
            error: false,
            message: 'Add permissions success!',
            data: add_per
        })
    } catch (err) {
        res.json({
            error: true,
            message: 'Add permissions fail!'
        })
    }
}