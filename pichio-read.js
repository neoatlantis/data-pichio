#!/usr/local/bin/node

require('./lib');

if(process.argv.length < 5){
    console.log('Usage: ./pichio-read.js <PRIVATE-KEY> <"meta"|"decrypt"> <FILENAME>');
    process.exit(1);
};

var privateKeyHex = process.argv[2].replace(/[^0-9a-f]/gi, ''),
    privateKey = new $.node.buffer.Buffer(privateKeyHex, 'hex');

var command = process.argv[3].toLowerCase(),
    filename = process.argv[4];

if(command != 'meta' && command != 'decrypt'){
    console.log('Bad command.');
    process.exit(2);
};

filename = $.node.path.resolve(filename);

var fileContent = $.node.fs.readFileSync(filename);

var lenBuf = fileContent.slice(0, 4),
    splitLen = lenBuf.readUInt32BE(0),
    fileContent = fileContent.slice(4);

if(splitLen > fileContent.length)
    process.exit(128);

var metaBuf = fileContent.slice(0, splitLen),
    ciphertextBuf = fileContent.slice(splitLen);


