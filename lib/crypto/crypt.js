/*
 * Data Encrypt and Decrypt using Symmetric Ciphers
 * ================================================
 *
 * Data is compressed before encryption and uncompressed after decryption.
 * This is using `gzip`.
 *
 * When there are errors in above processes, an Error class will be returned
 * but not thrown.
 *
 * The `keyBuffer` will be accepted as it is. If passphrases are planned to be
 * use to derive a key, this should have been done outside of this call. A
 * key length of 512bits is desired.
 */

module.exports = function(){
    return new _SYMCRYPT();
};

///////////////////////////// IMPLEMENTATION /////////////////////////////////

function _SYMCRYPT(){
    var self = this;

    function compress(buffer, CB){
        $.node.zlib.gzip(buffer, function(err, res){
            if(err)
                return CB($.error('unable-to-compress'));
            CB(null, res);
        });
    };

    function uncompress(buffer, CB){
        $.node.zlib.gunzip(buffer, function(err, res){
            if(err)
                return CB($.error('unable-to-uncompress'));
            CB(null, res);
        });
    };

    var keyBuffer = null;

    /*
     * Only a derivation of several sub keys used for algorithms.
     * need not to be time-consuming in order to be against Rainbow-Tables.
     */
    function deriveKey(keyBuffer, salt, keyCount){
        var result = [], lastKey = keyBuffer;
        for(var i=0; i<keyCount; i++){
            var hashed = $.crypto.hash.HMAC('SHA512', salt, lastKey);
            result.push(hashed);
            lastKey = hashed;
        };
        return result;
    };

    var encrypt = function(dataBuffer, CB){
        if(!(
            $.tools.type.isBuffer(keyBuffer) &&
            $.tools.type.isBuffer(dataBuffer)
        ))
            CB($.error('invalid-parameter'));

        // get random bytes
        var salt = $.crypto.random.bytes(32);

        // derive keys for cascade algorithms
        var keys = deriveKey(keyBuffer, salt, 3);

        $.node.async.waterfall([
            function(RR){
                // compress dataBuffer
                compress(dataBuffer, RR);
            },

            function(raw, RR){
                // cascade encryption
                var ciphertext = raw;
                ciphertext = OpenSSLEncrypt('cast5-cbc', keys[1], ciphertext);
                ciphertext = OpenSSLEncrypt('aes-256-cbc', keys[2], ciphertext);

                if($.tools.type.isBuffer(ciphertext))
                    RR(null, ciphertext);
                else
                    RR($.error('unable-to-encrypt'));
            },
        ], function(err, ciphertext){
            if(err)
                return CB($.error('unable-to-encrypt'));
            CB(null, new $.node.buffer.Buffer.concat([salt, ciphertext]));
        });
    };

    var decrypt = function(dataBuffer, CB){
        if(!(
            $.tools.type.isBuffer(keyBuffer) &&
            $.tools.type.isBuffer(dataBuffer) &&
            dataBuffer.length > 32
        ))
            CB($.error('invalid-parameter'));

        // get salt 
        var salt = dataBuffer.slice(0, 32);
        dataBuffer = dataBuffer.slice(32);

        // derive keys for cascade algorithms
        var keys = deriveKey(keyBuffer, salt, 3);

        $.node.async.waterfall([
            function(RR){
                // cascade encryption
                var plaintext = dataBuffer;
                plaintext = OpenSSLDecrypt('aes-256-cbc', keys[2], plaintext);
                plaintext = OpenSSLDecrypt('cast5-cbc', keys[1], plaintext);

                if($.tools.type.isBuffer(plaintext))
                    RR(null, plaintext);
                else
                    RR($.error('unable-to-decrypt'));
            },

            function(dataBuffer, RR){
                // uncompress dataBuffer
                uncompress(dataBuffer, RR);
            },
        ], function(err, plaintext){
            if(err)
                return CB($.error('unable-to-decrypt'));
            CB(null, plaintext);
        });
    };

    /* initially exposed functions */

    this.setKey = function(keyBuf){
        if(!$.tools.type.isBuffer(keyBuf))
            throw $.error('invalid-key');
        keyBuffer = keyBuf;

        self.encrypt = encrypt;
        self.decrypt = decrypt;

        return self;
    };

    return this;
};

//////////////////// ENCRYPTION CALLS AND IMPLEMENTATIONS ////////////////////

/* OpenSSL Encrypt & Decrypt */

var OpenSSLEncrypt = function(algorithm, key, plaintext){
    try{
        var cipher = $.node.crypto.createCipher(algorithm, key);
        var buf1 = cipher.update(plaintext);
        var buf2 = cipher.final();
//                console.log('Encrypt with algorithm [' + algorithm + '].');
        return new $.node.buffer.Buffer.concat([buf1, buf2]);
    } catch (e){
        return $.error('unable-to-encrypt');
    };
};

var OpenSSLDecrypt = function(algorithm, key, ciphertext){
    try{
        var decipher = $.node.crypto.createDecipher(algorithm, key);
        var buf1 = decipher.update(ciphertext);
        var buf2 = decipher.final();
//                console.log('Decrypt with algorithm [' + algorithm + '].');
        return new $.node.buffer.Buffer.concat([buf1, buf2]);
    } catch (e){
        return $.error('unable-to-decrypt');
    };
};

/* Gibberish AES Encrypt & Decrypt */

var gibberishAES = require('./_aes.js');

var GibberishAESEncrypt = function(key, plaintext){
    try{
        return gibberishAES.neoatlantis.encrypt(key, plaintext);
    } catch(e){
        return $.error('unable-to-encrypt', e);
    };
};

var GibberishAESDecrypt = function(key, ciphertext){
    try{
        return gibberishAES.neoatlantis.decrypt(key, ciphertext);
    } catch(e){
        return $.error('unable-to-decrypt', e);
    };
};
