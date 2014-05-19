/*
 * Encrypt and save the target
 * ===========================
 *
 * The filename is the conjunction of an identity string and a character
 * string. The first identifies a position of a file, aka the full filename,
 * the second the meta data.
 */

module.exports = function(basepath){
    return new _storage(basepath);
};

function _storage(basepath, backupPaths){
    var self = this;

    this.save = function(prefix, metadata, dataBuffer, CB){
        var filename = 
            ['prefix', metadata.identity, metadata.character.join('-')];
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

        $.node.async.waterfall(workflow, CB);
    };

    return this;
};
