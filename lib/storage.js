module.exports = function(basepath){
    return new _storage(basepath);
};

function _storage(basepath){
    var self = this;
    function save(metadata, dataBuffer, CB){
        var metaBuf = new $.node.buffer.Buffer(
            JSON.stringify(metadata), 
            'ascii'
        );

        // digest of this file. we do not want to consume a lot of time hashing
        // the real file and therefore would use only the meta data. The meta data
        // includes filename, date, size, path, and should represent a file.
        var digest = $.crypto.hash.objectID('sha1', metadata);

        var filename = srcName + '-' + digest.toString('hex'),
            savename = $.tools.resolve(storagePath, filename);

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
