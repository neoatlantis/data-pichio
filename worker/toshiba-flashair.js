/*
 *  $curl "http://192.168.0.1/command.cgi?op=100&DIR=/DCIM/100__TSB&TIME=123"
    WLANSD_FILELIST
    /DCIM/100__TSB,FA000001.JPG,128751,33,17003,18432
    /DCIM/100__TSB,1170121.jpg,112808,32,16486,2957
    /DCIM/100__TSB,download.png,390914,32,16434,19113
*/

module.exports = function(p){
    return new _WORKER(p);
};

function _WORKER(p){
    var self = this;

    var controller;

    var ip = p.ip || '192.168.0.1';
    if(!/^[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$/.test(ip))
        throw $.error('invalid-parameter', 'ip');

    //////////////////////////////////////////////////////////////////////

    function _refresh(path){
        var workflow = [];

        workflow.push(function(RR){
            var url = 'http://' + ip + '/command.cgi?op=100&DIR=' 
                    + path + '&TIME=' + (new Date().getTime());
            var req = $.node.http.get(
                url,
                function(res){
                    var data = '';
                    res.on('data', function(chunk){
                        if(chunk) data += chunk;
                    });
                    res.on('end', function(chunk){
                        if(chunk) data += chunk;
                        RR(null, data);
                    });
                }
            ).on('error', function(e){
                try{
                    req.abort();
                    RR($.error('unable-to-access', e.message));
                } catch(e){
                };
            });
        });

        workflow.push(function(data, RR){
            var list = data.split('\r\n'),
                ret = [];
            for(var i=1; i<list.length; i++){
                var dataline = list[i].split(',');
                if(dataline.length != 6) continue;
                ret.push($.metadata(
                    Boolean(dataline[3] & 0x10),            // is folder
                    dataline[3],                            // attr
                    $.node.path.resolve(path, dataline[0]), // path
                    dataline[1],                            // name
                    parseInt(dataline[2], 10),              // size
                    dataline[4],                            // date
                    dataline[5]                             // time
                ));
            };
            RR(null, ret);
        });

        // inform the controller with new directory list.
        $.node.async.waterfall(workflow, function(err, res){
            if(err) return;
            controller.register(res);
        });
    };

    function _download(path, name, saveFunc){
        var workflow = [];

        workflow.push(function(RR){
            var url = 'http://' + ip + '/';
            url = $.node.url.resolve(url, path, name);

            var req = $.node.http.get(
                url,
                function(res){
                    var data = new $.node.buffer.Buffer(0);
                    res.on('data', function(chunk){
                        if(chunk) data = $.node.buffer.Buffer.concat([
                            data,
                            chunk,
                        ]);
                    });
                    res.on('end', function(chunk){
                        if(chunk) data = $.node.buffer.Buffer.concat([
                            data,
                            chunk,
                        ]);
                        RR(null, data);
                    });
                }
            ).on('error', function(e){
                try{
                    req.abort();
                    RR($.error('unable-to-access', e.message));
                } catch(e){
                };
            });
        });

        $.node.async.waterfall(workflow, saveFunc);
    };

    this.obey = function(c){
        controller = c;
        controller.on('download', _download);
        controller.on('refresh', _refresh);
        delete self.obey;
    };

    return this;
};
