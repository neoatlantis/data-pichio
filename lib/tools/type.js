module.exports = new (function(){
    var self = this;

    this.isError = function(v){
        return toString.apply(v) === '[object Error]';
    };

    this.isArray = function(v){
        return toString.apply(v) === '[object Array]';
    };
    
    this.isDate = function(v){
        return toString.apply(v) === '[object Date]';
    };
    
    this.isObject = function(v){
        return !!v && Object.prototype.toString.call(v) === '[object Object]';
    };
    
    this.isPrimitive = function(v){
        return self.isString(v) || self.isNumber(v) || self.isBoolean(v);
    };
    
    this.isFunction = function(v){
        return toString.apply(v) === '[object Function]';
    };
    
    this.isNumber = function(v){
        return typeof v === 'number' && isFinite(v);
    };
    
    this.isString = function(v){
        return typeof v === 'string';
    };
    
    this.isBoolean = function(v){
        return typeof v === 'boolean';
    };

    this.isBuffer = function(v){
        return $.node.buffer.Buffer.isBuffer(v);
    };

    this.areBuffers = function(vs){
        if(!self.isArray(vs)) return false;
        for(var i in vs){
            if(!self.isBuffer(vs[i])) return false;
        };
        return true;
    };
})();
