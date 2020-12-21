var http = require('http');
var fs = require('fs');
var url = require('url');
var template;

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var title = queryData.id;

    // console.log('URL: ' + _url);
    console.log(queryData.id);

    if (_url == '/') {
        /* url = '/index.html'; */
        title = 'Welcome';
    }

    if (_url == '/favicon.ico') {
        return response.writeHead(404);
    }

    response.writeHead(200);
    fs.readFile(`data/${queryData.id}`, 'utf8', function(err, descrption) {
        template = `
        <!doctype html>
        <html>
        <head>
            <title>WEB1 - ${title}</title>
            <meta charset="utf-8">
        </head>
        <body>
            <h1><a href="/">WEB</a></h1>
            <ol>
                <li><a href="/?id=HTML">HTML</a></li>
                <li><a href="/?id=CSS">CSS</a></li>
                <li><a href="/?id=JavaScript">JavaScript</a></li>
            </ol>
            <h2>${title}</h2>
            <p>${descrption}</p>
        </body>
        </html>
        `;
    });

    // console.log(__dirname + url);
    // response.end(fs.readFileSync(__dirname + _url));
    response.end(template);
});
app.listen(3000);