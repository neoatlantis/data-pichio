var serial = $.tools.serial({
    folder: "boolean",
    file: "boolean",
    attr: "uint32",
    name: "binary",
    path: "binary",
    fullname: "binary",
    size: "uint32",
    date: "uint32",
    time: "uint32",
});

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
        attr: parseInt(attr),
        name: new $.node.buffer.Buffer(name, 'binary'),
        path: new $.node.buffer.Buffer(path, 'binary'),
        fullname: new $.node.buffer.Buffer(
            $.node.path.resolve(path, name),
            'binary'
        ),
        size: size,
        date: parseInt(date),
        time: parseInt(time),
    };

    var serialized = serial.serialize(obj);
    
    var character = $.crypto.hash.digest('md5', serialized).toString('hex');
    obj.identity = $.crypto.hash.digest('md5', obj.fullname)
        .toString('hex')
        .slice(0, 16)
    ;
    obj.character = character;
    obj.serialized = serialized;

    obj.name = obj.name.toString('binary');
    obj.path = obj.path.toString('binary');
    obj.fullname = obj.fullname.toString('binary');
    return obj;
};
