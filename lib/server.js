module.exports = function(storagePath, conf){
    var port = conf.port || 10000;

    $.node.http.createServer(function(request, response) {
        var pathname = $.node.url.parse(request.url).pathname,
            filename = $.node.path.basename(pathname);

        console.log('Access URL: ', request.url);

        function answerCode(code){
            response.writeHead(code, {"Content-Type": "text/plain"});
            response.write(
                code.toString() + ' ' + $.node.http.STATUS_CODES[code]
            );
            response.end();
            return;
        };

        function answerList(list){
            var html = '<!DOCTYPE html><html>' + 
                '<head><title>Pichio</title></head><body>';
            for(var i in list){
                html += '<a href="/' + list[i] + '">' + list[i] + '</a><br />';
            };
            html += '</body></html>';
            response.writeHead(200, {"Content-Type": "text/html"});
            response.write(html);
            response.end();
            return;
        };

        if('' == filename){
            $.node.fs.readdir(
                $.tools.resolve(storagePath),
                function(err, files){
                    if(err) return answerCode(500);
                    answerList(files);
                }
            );
            return;
        };

        if(!/^[0-9a-z\-\.]+$/.test(filename)) return answerCode(404);
        
        // server static file
        
        filename = $.tools.resolve(storagePath, filename);
        $.node.fs.exists(filename, function(exists) {
            if(!exists) return answerCode(404);
         
            $.node.fs.readFile(filename, "binary", function(err, file){
                if(err) return answerCode(500);
                response.writeHead(
                    200,
                    {"Content-Type": "application/octet-stream"}
                );
                response.write(file, "binary");
                response.end();
            });
        });
    }).listen(port);
};
