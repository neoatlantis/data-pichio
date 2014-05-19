/*
 * Controls an collector to watch or download file.
 *
 * Emits Events:
 *  1. refresh
 *      The collector should now refresh the watch list.
 */
module.exports = function(storage, suffix){
    if(!suffix) suffix = 'default';
    return new _CONTROLLER(storage, suffix);
};

function _CONTROLLER(storage, suffix){
    $.node.events.EventEmitter.call(this);
    var self = this;

    var dirs = ['/DCIM'], record = storage.refresh();

    this.register = function(list){
        console.log("Controller >> New List Arrival");
        /*
         * Input a list of files
         */
        var task = [], meta;
        for(var i in list){
            meta = list[i];

            console.log([
                (meta.folder?'DIR':'FILE'),
                meta.attr,
                meta.size,
                meta.date,
                meta.time,
                meta.fullname,
            ].join('\t'));

            // dirs will be recorded but not treated.
            if(meta.folder){
                if(dirs.indexOf(meta.fullname) < 0)
                    dirs.push(meta.fullname);
                continue
            };

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
        saveFunc(suffix, meta, dataBuffer, function(err, res){
            
        });
    };

    this.start = function(){
        self.emit('refresh', '/DCIM');
        delete(self.start);
    };

    return this;
};

$.node.util.inherits(_CONTROLLER, $.node.events.EventEmitter);
