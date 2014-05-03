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
            var req = $.node.http.get(
                'http://' + ip + '/command.cgi?op=100&DIR=' 
                + path + '&TIME=' + (new Date().getTime()),
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
                ret.push({
                    path: dataline[0],
                    name: dataline[1],
                    size: dataline[2],
                    attr: dataline[3],
                    date: dataline[4],
                    time: dataline[5],
                });
            };
            RR(null, ret);
        });

    };

    function _download(path){
    };

    this.obey = function(c){
        controller = c;
        controller.on('download', _download);
        controller.on('refresh', _refresh);
        delete self.obey;
    };

    return this;
};
