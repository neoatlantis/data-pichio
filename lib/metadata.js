module.exports = function(
    isFolder,
    attr,
    path,
    name,
    size,
    date,
    time
){
    var obj = {
        folder: isFolder,
        file: !isFolder,
        attr: attr,
        name: name,
        path: path,
        fullname: $.node.path.resolve(path, name),
        size: size,
        date: date,
        time: time,
    };

    var character = $.crypto.hash.objectID('md5', obj).toString('hex');

    obj.identity = $.crypto.hash.digest('md5', fullname)
        .toString('hex')
        .slice(0, 16)
    ;
    obj.character = character;
    return obj;
};
