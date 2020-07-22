const { avatar } = require('../models/AvatarModel');
var fs = require('fs');
var path = require('path');

exports.list = async function (req, res) {
    try {
        let username = req.query.username ? req.query.username : '';
        let avatarUser = await avatar.findOne({name: username});
        if(!avatarUser){
            return res.json({
                error: true,
                message: 'User not found!'
            })
        }
        res.json({
            error: false,
            data: avatarUser
        })
    } catch (err) {
        res.json({
            error: true,
            err
        })
    }
};

exports.add = async function (req, res) {
    try {
        let image = req.body.hasOwnProperty('avatar') ? req.body.avatar : '';
        let username = req.body.hasOwnProperty('username') ? req.body.username : '';
        // let file_name = ((new Date()).getTime() + "-" + (new Date()).getDate() + "-" + (new Date().getMonth() + 1))+".jpg";
        // let month = `${(new Date().getMonth() + 1) + "-" + (new Date().getFullYear())}`;
        // let addMonth = await fs.mkdir(`./upload/avatar-user/${month}`, { recursive: true }, function(err){
        //     console.log(err)
        // })
        // let dirname = month ? month : addMonth;
        // let Path = path.format({
        //     root: "C:\Users\ADMINS\Desktop\nodejs",
        //     dir: `upload/avatar-user/${dirname}`,
        //     base: file_name,
        // });
        // let checkImage = image.indexOf(';base64');
        // if(checkImage > -1){
        //     image = image.replace(/^data:image\/jpeg;base64,/, "");
        //     fs.writeFile(Path, image, 'base64', function(err) {
        //         console.log(err);
        //     });
        // };
        let findUser = await avatar.findOne({name: username});
        if(findUser.listImage){
            let valid = findUser.listImage.includes(image);
            if(!valid){
                await findUser.updateOne({$push: {listImage: image}})
            }
        }
        let success = await findUser.updateOne({avatar: image});
        if(!success){
            return res.json({
                error: true,
                message: 'Update avatar failed!'
            })
        }
        return res.json({
            error: false,
            message: 'Update avatar success!'
        })
    } catch (err) {
        res.json({
            error: true,
            err
        })
    }
};