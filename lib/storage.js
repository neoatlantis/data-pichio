/*
 * Encrypt and save the target
 * ===========================
 *
 * The filename is the conjunction of an identity string and a character
 * string. The first identifies a position of a file, aka the full filename,
 * the second the meta data.
 */

module.exports = function(basepath){
    console.log("STORAGE PATH AT >>", basepath);
    var ret = new _storage(basepath);
    ret.refresh();
    return ret;
};

function _storage(basepath, backupPaths){
    var self = this;

    var dir = [];

    this.save = function(prefix, metadata, dataBuffer, CB){
        var filename = 
            [metadata.character, metadata.identity, prefix].join('-');
        var savename = $.tools.resolve(basepath, filename);
        
        var metaBuf = new $.node.buffer.Buffer(
            JSON.stringify(metadata), 
            'ascii'
        );

        var workflow = [];

        // async check existence
        workflow.push(function(RR){
            $.node.fs.exists(savename, function(exists){
                if(exists) return RR(true);
                RR(null);
            });
        });

        // encrypt and save
        workflow.push(function(RR){
            encryptor.encrypt(dataBuffer, RR);
        });
        workflow.push(function(ciphertextBuf, RR){
            encryptor.encrypt(metaBuf, function(err, res){
                RR(err, res, ciphertextBuf);
            });
        });
        workflow.push(function(encryptedMetaBuf, ciphertextBuf, RR){
            var lenBuf = new $.node.buffer.Buffer(4);
            lenBuf.writeUInt32BE(encryptedMetaBuf.length, 0);

            var storageData = $.node.buffer.Buffer.concat([
                lenBuf,
                encryptedMetaBuf,
                ciphertextBuf,
            ]);
            $.node.fs.writeFile(savename, storageData, RR);
        });

        $.node.async.waterfall(workflow, function(err){
            smallRefresh();
            callback(err);
        });
    };

    function smallRefresh(){
        dir = $.node.fs.readdirSync(basepath);
    };

    this.refresh = function(){
        smallRefresh();
        var ret = {}, identity, character;
        // the length of identity and character is defined in ./metadata.js
        for(var each in basepath){
            character = basepath.slice(0, 32);
            identity = basepath.slice(33, 49);
            ret[identity] = character;
        };
        return ret;
    };

    this.existCharacter = function(character){
        for(var i in dir)
            if(dir[i].startsWith(character)) return true;
        return false;
    };

    return this;
};
