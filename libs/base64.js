var path = require('path');
var fs = require('fs');

exports.base64 = async function(thumbnail){
    let file_name = ((new Date()).getTime() + "-" + (new Date()).getDate() + "-" + (new Date().getMonth() + 1))+".jpg";
    let month = `${(new Date().getMonth() + 1) + "-" + (new Date().getFullYear())}`;
    let addMonth = await fs.mkdir(`./upload/${month}`, { recursive: true }, function(err){
        console.log(err)
    })
    let dirname = month ? month : addMonth;
    let Path = path.format({
        root: "",
        dir: `./upload/${dirname}`,
        base: file_name,
    });
    let ext = thumbnail.replace("data:image/", "");
    ext = ext.split(";base64");
    var base64Rejex = /^\s*data:([a-z]+\/[a-z]+(;[a-z\-]+\=[a-z\-]+)?)?(;base64)?,[a-z0-9\!\$\&\'\,\(\)\*\+\,\;\=\-\.\_\~\:\@\/\?\%\s]*\s*$/i;
    var isBase64Valid = base64Rejex.test(thumbnail); 
    var regex = new RegExp(`^data:image\/${ext[0]};base64,`);
    if(isBase64Valid){
        thumbnail = thumbnail.replace(regex, "");
        fs.writeFile(Path, thumbnail, 'base64', function(err) {
            console.log(err);
        });
    };
    let pathImage = "/" + dirname +'/' + file_name;
    return isBase64Valid ? pathImage : '';
}