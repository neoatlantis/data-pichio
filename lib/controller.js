/*
 * Controls an collector to watch or download file.
 *
 * Emits Events:
 *  1. refresh
 *      The collector should now refresh the watch list.
 */
module.exports = function(saveFunc){
    return new _CONTROLLER(saveFunc);
};

function _CONTROLLER(saveFunc){
    $.node.events.EventEmitter.call(this);
    var self = this;

    this.register = function(list){
        /*
         * Input a list of files
         */

    };

    this.save = function(dataBuffer, metaObj){
        
    };

    return this;
};

$.node.util.inherits(_CONTROLLER, $.node.events.EventEmitter);
