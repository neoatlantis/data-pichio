module.exports = new (function(){
    var desired = {
        'http': 'http',
        'util': 'util',
        'os': 'os',
        'path': 'path',
        'fs': 'fs',
        'url': 'url',
        'crypto': 'crypto',
        'zlib': 'zlib',
        'buffer': 'buffer',
        'events': 'events',
        'querystring': 'querystring',
        'child_process': 'childProcess',
        'stream': 'stream',

        /* dependencies */
        'async': 'async',
    };

    for(var i in desired){
        this[desired[i]] = require(i);
    };

    return this;
})();
