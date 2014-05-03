#!/usr/local/bin/node

require('./lib');

var publicKeyPath = $.tools.resolve('conf', 'public-key'),
    algorithm = $.config["encryption"]["algorithm"];

if(!$.node.fs.existsSync(publicKeyPath)){
    var privateKey = $.crypto.random.bytes(32);
    var deriver = $.crypto.acrypt(algorithm);
    deriver.setPrivateKey(privateKey);

    var publicKey = deriver.getPublicKey();

    var privateKeyHex = privateKey.toString('hex').toLowerCase(),
        publicKeyB64 = publicKey.toString('base64'),
        privateKeyShow = '',
        publicKeyShow = '';

    for(var i=0; i<privateKeyHex.length; i+=8)
        privateKeyShow += privateKeyHex.slice(i, i+8) + ' ';

    for(var i=0; i<publicKeyB64.length; i+=64)
        publicKeyShow += '  ' + publicKeyB64.slice(i, i+64) + '\n';

    console.log(
        "\nWelcome to use Data-Pichio!\n" +
        "---------------------------\n" +
        "You have not yet specified your public key.\n" +
        "System have randomly choosen one for you.\n\n" +

        "Your PRIVATE key is following, please write it down carefully\n" +
        "and DOUBLE CHECK its correctness!.\n\n  " +
        privateKeyShow + '\n\n' +
        "Your Public Key is following, please save it to the config file.\n" +
        '\n' +
        publicKeyShow + '\n' +
        'The config for public key is usually in [./conf/public-key].\n' +
        'Create this file, if it doesn\'t exists.\n\n' +
        'Your note of PRIVATE key is useful for recovering swallowed data\n' +
        'in this system. But it is no use, to bring this note together\n' +
        'and leaving the unfriendly people clues. Secure it! You will NOT\n' +
        'need it during data capturing activities!!\n'
    );
    process.exit(0);
};

// read public key
var publicKey = $.node.fs.readFileSync($.tools.resolve('conf', 'public-key'));
publicKey = publicKey.toString('ascii').replace(/[^0-9a-z\/\+=]/gi, '');
publicKey = new $.node.buffer.Buffer(publicKey, 'base64');

var encryptor = $.crypto.acrypt(algorithm);
encryptor.setPublicKey(publicKey);

var storagePath = $.config["storage-path"];

function save(srcName, metaJSON, dataBuffer, CB){
    var metaBuf = new $.node.buffer.Buffer(JSON.stringify(metaJSON), 'ascii');

    var digest = $.crypto.hash.digest('sha1', $.node.buffer.Buffer.concat([
        $.crypto.hash.objectID('sha512', metaJSON),
        $.crypto.hash.digest('sha512', dataBuffer),
    ]));

    var filename = srcName + '-' + digest.toString('hex'),
        savename = $.tools.resolve(storagePath, filename);

    if($.node.fs.existsSync(savename)) return CB(null);

    // encrypt and save
    var workflow = [];
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

/////////////////////////////// HTTP SERVER //////////////////////////////////
if($.config.server){
    $.server(storagePath, $.config.server);
};

///////////////////////// COLLECTOR INITIALIZATION ///////////////////////////
workers = [];
var workerGetter = require('./worker');

for(var i in $.config.connections){
    var connConfig = $.config.connections[i];
    
    var worker = workerGetter[connConfig["type"]](connConfig["parameter"]);
    var controller = $.controller(save, connConfig["name"]);

    worker.obey(controller);
    controller.start();

    workers.push(worker);
};
