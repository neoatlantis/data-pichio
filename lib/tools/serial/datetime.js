module.exports = function(regtree){
    regtree["datetime"] = function(){return new _datetime();};
};

function _datetime(){
    var self = this;

    this.pack = function(date){
        if(!Boolean(date)){
            var ret = new $.node.buffer.Buffer(5);
            ret.fill(0);
            return ret;
        };

        if(!$.tools.type.isDate(date))
            throw $.error('invalid-parameter', 'date');

        var timestamp = parseInt(date.getTime() / 1000).toString(16);
        if(timestamp.length > 10) timestamp = 'ffffffffff'; 
        // This system will stop at AC 36812 Feb. 2 00:36:15 UTC. :-)

        timestamp = timestamp.rjust(10, '0');
        return new $.node.buffer.Buffer(timestamp, 'hex');
    };

    this.unpack = function(buf){
        var tempBuf = buf.slice(0, 5);
        buf = buf.slice(5);

        if(tempBuf.toString('hex') == '0000000000') 
            return [null, buf];

        var timestamp = parseInt(tempBuf.toString('hex'), 16) * 1000;
        var ret = new Date(timestamp);
        
        return [ret, buf];
    };

    return this;
};
