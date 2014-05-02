String.prototype.startsWith = function(str){
    return (this.toString().substr(0, str.length) == str);
};

String.prototype.endsWith = function(str){
    return (this.toString().substr(-str.length) == str);
};

String.prototype.rjust = function(num, padding){
    if(!padding) padding = ' ';
    var s = this.toString();
    if(1 != padding.length) throw new Error('Padding must be one character.');
    if(s.length >= num) return s;
    for(var i=0; i<=num-s.length; i++)
        s = padding + s;
    return s;
};
