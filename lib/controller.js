/*
 * Controls an collector to watch or download file.
 *
 * Emits Events:
 *  1. refresh
 *      The collector should now refresh the watch list.
 */
module.exports = function(storage, prefix){
    if(!prefix) prefix = 'default';
    return new _CONTROLLER(storage, prefix);
};

function _CONTROLLER(storage, prefix){
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

            console.log([
                (list[i].folder?'DIR':'FILE'),
                list[i].attr,
                list[i].size,
                list[i].date,
                list[i].time,
                list[i].fullname,
            ].join('\t'));

            meta = list[i];
            identifier = meta.path + meta.name;
            character = meta.date + meta.time + meta.attr;
            if(!record[identifier]){
                record[identifier] = character;
            } else {
                if(record[identifier] == character) continue;
            };
            // emit a signal to download this piece
            self.emit(
                'download',
                list[i].path,
                list[i].name,
                (function(d, id, newCharacter){
                    return function(err, dataBuffer){
                        if(!err){
                            saver(dataBuffer, d);
                            record[id] = newCharacter;
                        };
                        // TODO what if there are errors obtaining wrong data,
                        // or even no data.
                    };
                })(task[i], identifier, character)
            );
        };
    };

    function saver(dataBuffer, metaObj){
        var meta = metaObj || {};
        saveFunc(prefix, meta, dataBuffer, function(err, res){
            
        });
    };

    this.start = function(){
        self.emit('refresh', '/DCIM');
        delete(self.start);
    };

    return this;
};

$.node.util.inherits(_CONTROLLER, $.node.events.EventEmitter);
