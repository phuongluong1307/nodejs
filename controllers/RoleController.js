const {role} = require('../models/RoleModel');
exports.list = async function (req, res) {
    try {
        let list_roles = await role.find({});
        res.json({
            error: false,
            message: 'Get role success!',
            data: list_roles
        })
    } catch{
        res.json({
            error: true,
            message: 'Get role fail!'
        })
    }
};

exports.single = async function (req, res) {
    try {
        res.json({
            error: false,
            message: 'Get role success!',
        })
    } catch{
        res.json({
            error: true,
            message: 'Get user fail!'
        })
    }
}

exports.add = async function (req, res) {
    try {
        let body = req.body;
        let new_role = {
            name: body.hasOwnProperty('name') ? body.name : '',
            permissions: body.hasOwnProperty('permissions') ? body.permissions : ''
        };
        let newPer = await new role(new_role).save();
        return res.json({
            error: false,
            message: 'Add role success!',
            data: newPer
        })
    } catch (err) {
        res.json({
            error: true,
            message: 'Add role fail!'
        })
    }
}

exports.update = async function (req, res, next) {
    try {
        return res.json({
            error: false,
            message: 'Update role success!'
        })
    } catch (err) {
        res.json({
            error: true,
            message: 'Update role fail!'
        })
    }
};

exports.delete = async function (req, res) {
    try {
        let id = req.params.id;
        let result = await user.findOneAndDelete({ _id: id })
        if (result) {
            res.json({
                error: false,
                message: 'Delete role success!',
                data: result
            })
        } else {
            res.json({
                error: true,
                message: 'Delete role fail!'
            })
        };
    } catch (err) {
        res.json({
            error: true,
            message: 'Delete role fail!'
        })
    }
}