/*
 * Controls an collector to watch or download file.
 *
 * Emits Events:
 *  1. refresh
 *      The collector should now refresh the watch list.
 */
module.exports = function(storage, suffix, interval){
    if(!suffix) suffix = 'default';
    return new _CONTROLLER(storage, suffix, parseInt(interval) * 1000);
};

function _CONTROLLER(storage, suffix, interval){
    $.node.events.EventEmitter.call(this);
    var self = this;

    var dirs = ['/DCIM'];

    this.register = function(list){
        console.log("Controller >> New List Arrival");
        /*
         * Input a list of files
         */
        var meta;
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
                if(dirs.indexOf(meta.fullname) < 0){
                    dirs.push(meta.fullname);
                    console.log(
                        "Controller >> Record New Path:",
                        meta.fullname
                    );
                };
                continue
            };

            // emit a signal to download this piece
            if(!storage.existCharacter(meta.character)){
                console.log("Controller >> Command Download:", meta.fullname);
                self.emit(
                    'download',
                    meta.path,
                    meta.name,
                    (function(_meta){
                        return function(err, dataBuffer){
                            if(!err) return saver(dataBuffer, _meta);
                            // TODO what if there are errors obtaining wrong
                            // data, or even no data.
                            console.log("Download Error:", err);
                        };
                    })(meta)
                );
            };

            // done. next!
        };
    };

    function saver(dataBuffer, meta){
        storage.save(suffix, meta, dataBuffer, function(err){
            if(err){
                console.log("ERROR Saving:", meta.fullname);
            } else {
                console.log("SUCCESS Saving:", meta.fullname);
            };
        });
    };

    function refresher(){
        for(var i in dirs) self.emit('refresh', dirs[i]);
    };

    this.start = function(){
        (function _doRefresh(){
            refresher();
            setTimeout(_doRefresh, interval);
        })();

        delete(self.start);
    };

    return this;
};

$.node.util.inherits(_CONTROLLER, $.node.events.EventEmitter);
