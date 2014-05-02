/*
 * Controls an collector to watch or download file.
 *
 * Emits Events:
 *  1. refresh
 *      The collector should now refresh the watch list.
 */
module.exports = function(saveFunc, prefix){
    if(!prefix) prefix = 'default';
    return new _CONTROLLER(saveFunc, prefix);
};

function _CONTROLLER(saveFunc, prefix){
    $.node.events.EventEmitter.call(this);
    var self = this;

    this.register = function(list){
        /*
         * Input a list of files
         */

    };

    this.save = function(dataBuffer, metaObj){
        var meta = metaObj || {};
        save(prefix, metaObj, dataBuffer, function(err, res){
            
        });
    };

    return this;
};

$.node.util.inherits(_CONTROLLER, $.node.events.EventEmitter);
