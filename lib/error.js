module.exports = function(errid, additional){
    var ret = new Error(errid);

    ret.details = errid + '\n';

    if(additional){
        if($.tools.type.isError(additional)){
            if(additional.details)
                ret.details += additional.details;
        } else if($.tools.type.isString(additional))
            ret.details += additional;
    };

    return ret;
};
