module.exports = function(regtree){
    regtree.uint32 = function(){return new _uint32();};
};

//////////////////////////////////////////////////////////////////////////////
function _uint32(){
    var self = this;

    this.unpack = function(buf){
        var result = buf.readUInt32LE(0);
        var buf = buf.slice(4);
        return [result, buf]; 
    };

    this.pack = function(num){
        if(!$.tools.type.isNumber(num))
            throw $.error('invalid-parameter', 'not-number');

        var uint32 = new Uint32Array(1);
        uint32.set(0, num);

        var ret = new $.node.buffer.Buffer(4);
        ret.writeUInt32LE(uint32.get(0), 0);
        return ret;
    };

    return this;
};
