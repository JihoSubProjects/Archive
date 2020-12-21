var http = require('http');
var fs = require('fs');
var url = require('url');

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;

    // console.log(url.parse(_url, true));
    if (pathname == '/'/* root */) {
        if (queryData.id === undefined) {
            fs.readdir('./data', function(err, filelist) {
                // console.log(filelist);
                var title = 'Welcome';
                var descrption = 'Hello, Node.js';

                var list = '<ul>';
                var i = 0;
                while (i < filelist.length) {
                    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
                    i = i + 1;
                }
                list = list + '</ul>';

                var template = `
                <!doctype html>
                <html>
                <head>
                    <title>WEB1 - ${title}</title>
                    <meta charset="utf-8">
                </head>
                <body>
                    <h1><a href="/">WEB</a></h1>
                    ${list}
                    <h2>${title}</h2>
                    <p>${descrption}</p>
                </body>
                </html>
                `;
        
                response.writeHead(200);
                response.end(template);
            });
        } else {
            fs.readdir('./data', function(err, filelist) {
                var list = '<ul>';
                var i = 0;
                while (i < filelist.length) {
                    list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
                    i = i + 1;
                }
                list = list + '</ul>';

                fs.readFile(`data/${queryData.id}`, 'utf8', function(err, descrption) {
                    var title = queryData.id;
                    var template = `
                    <!doctype html>
                    <html>
                    <head>
                        <title>WEB1 - ${title}</title>
                        <meta charset="utf-8">
                    </head>
                    <body>
                        <h1><a href="/">WEB</a></h1>
                        ${list}
                        <h2>${title}</h2>
                        <p>${descrption}</p>
                    </body>
                    </html>
                    `;
            
                    response.writeHead(200); // 파일은 성공적으로 찾음
                    response.end(template);
                });
            });
        }
    } else {
        response.writeHead(404); // 파일 찾기 실패함
        response.end('Not found');
    }
});
app.listen(3000);