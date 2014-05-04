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

    var record = {};

    this.register = function(list){
        /*
         * Input a list of files
         */
        var meta;
        var identifier, character;
        var task = [];
        for(var i in list){
            meta = list[i];
            identifier = meta.path + meta.name;
            character = meta.date + meta.time + meta.attr;
            if(!record[identifier]){
                record[identifier] = character;
            } else {
                if(record[identifier] == character) continue;
            };
            task.push(meta);
        };

        for(var i in task){
            self.emit('download', task[i]);
        };
    };

    this.save = function(dataBuffer, metaObj){
        var meta = metaObj || {};
        save(prefix, metaObj, dataBuffer, function(err, res){
            
        });
    };

    this.start = function(){
        self.emit('refresh', '/DCIM');
        delete(self.start);
    };

    return this;
};

$.node.util.inherits(_CONTROLLER, $.node.events.EventEmitter);
