module.exports = new (function(){
    var self = this;

    this.parseArguments = require('./parseArguments.js');
    this.type = require('./type.js');
    this.resolve = require('./resolve.js');
    this.readTime = require('./datetime.js');

    return this;
})();
