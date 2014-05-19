module.exports = new (function(){
    var self = this;
    
    var knownAlgorithms = {
        'md5': 128,
        'sha1': 160,
        'sha256': 256,
        'sha512': 512,
    };

    this.algorithms = Object.keys(knownAlgorithms);

    this.PBKDF2 = function(passwordBuffer, saltBuffer, iterations, keylen){
        
        if(!(
            $.tools.type.isBuffer(passwordBuffer) &&
            $.tools.type.isBuffer(saltBuffer) &&
            $.tools.type.isNumber(iterations) && iterations > 0 &&
            $.tools.type.isNumber(keylen) && keylen > 0
        ))
            throw Error('invalid-parameter');

        return PBKDF2(passwordBuffer, saltBuffer, iterations, keylen);
    };

    this.digest = function(algo, dataBuffer){

        if(!$.tools.type.isBuffer(dataBuffer)) 
            throw Error('invalid-parameter');

        algo = algo.toLowerCase().trim();

        var choosenAlgorithm = knownAlgorithms[algo];
        if(!choosenAlgorithm) throw Error('hash-algorithm-unknown');

        if('sha' == algo.substr(0, 3)){
            return SHA(choosenAlgorithm, dataBuffer);
        };
        if('md5' == algo) return _nodeJSHash('md5', dataBuffer);

        return Error('not-implemented');
    };

    this.HMAC = function(algo, keyBuffer, dataBuffer){
        
        if(!(
            $.tools.type.isBuffer(keyBuffer) &&
            $.tools.type.isBuffer(dataBuffer)
        ))
            throw Error('invalid-parameter');

        algo = algo.toLowerCase().trim();

        var choosenAlgorithm = knownAlgorithms[algo];
        if(!choosenAlgorithm) throw Error('hash-algorithm-unknown');

        if('sha' == algo.substr(0, 3)){
            return SHAHMAC(choosenAlgorithm, keyBuffer, dataBuffer);
        };

        return Error('not-implemented');
    };

    return this;
})();

///////////////////////////// HASH ALGORITHMS ////////////////////////////////

function _nodeJSHash(algoName, dataBuffer){
    var obj = $.node.crypto.createHash(algoName);
    obj.update(dataBuffer);
    return obj.digest();
};

function SHA(length, dataBuffer){
    /* SHA worker will be defined using NodeJS's `crypto` library, which
     * depends on OpenSSL.*/
    var worker = function(length, dataBuffer){
        var algoName = {
            160: 'sha1',
            256: 'sha256',
            512: 'sha512',
        }[length];
        if(!algoName) throw Error('hash-algorithm-unknown');
        return _nodeJSHash(algoName, dataBuffer);
    };

    return worker(length, dataBuffer);
};

///////////////////////////// HMAC ALGORITHMS ////////////////////////////////

function _nodeJSHMAC(algoName, keyBuffer, dataBuffer){
    var obj = $.node.crypto.createHmac(algoName, keyBuffer);
    obj.update(dataBuffer);
    return obj.digest();
};

function SHAHMAC(length, keyBuffer, dataBuffer){
    /* SHA worker will be defined using NodeJS's `crypto` library, which
     * depends on OpenSSL.*/
    var worker = function(length, keyBuffer, dataBuffer){
        var algoName = {
            160: 'sha1',
            256: 'sha256',
            512: 'sha512',
        }[length];
        if(!algoName) throw Error('hash-algorithm-unknown');
        return _nodeJSHMAC(algoName, keyBuffer, dataBuffer);
    };
    return worker(length, keyBuffer, dataBuffer);
};

function RIPEMD160HMAC(keyBuffer, dataBuffer){
    return _genericHMAC(RIPEMD160, keyBuffer, dataBuffer, 64);
};

///////////////////////////// PBKDF2 IMPLEMENTATION //////////////////////////

function PBKDF2(passwordBuffer, saltBuffer, iterations, keylen){
    return $.node.crypto.pbkdf2Sync(
        passwordBuffer,
        saltBuffer,
        iterations,
        keylen
    ); 
};
