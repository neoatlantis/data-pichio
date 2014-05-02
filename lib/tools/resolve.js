/*
 * Relative path resolver
 * ======================
 *
 * This resolves the relative path relating to the path, where the process
 * program exists.
 */
var dirname = $.node.path.dirname(process.argv[1]);

module.exports = function(){
    var params = [dirname,];
    for(var i=0; i<arguments.length; i++){
        if($.tools.type.isString(arguments[i]))
            params.push(arguments[i]);
        else if($.tools.type.isArray(arguments[i])){
            for(var j=0; j<arguments[i].length; j++){
                if($.tools.type.isString(arguments[i][j]))
                    params.push(arguments[i][j]);
                else
                    throw $.error('invalid-path');
            };
        } else
            throw $.error('invalid-path');
    };

    for(var i=0; i<params.length; i++)
        if('..' == params[i]) throw $.error('invalid-path');

    return $.node.path.resolve.apply(global, params);
};
