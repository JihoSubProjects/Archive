var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

function templateHTML(title, list, body, control) {
    return `
    <!doctype html>
    <html>
    <head>
        <title>WEB1 - ${title}</title>
        <meta charset="utf-8">
    </head>
    <body>
        <h1><a href="/">WEB</a></h1>
        ${list}
        ${control}
        ${body}
    </body>
    </html>
    `
    // <a href="/create">create</a> <a href="/update">update</a> -> control
}

function templateList(filelist) {
    var list = '<ul>';
    var i = 0;
    while (i < filelist.length) {
        list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
        i = i + 1;
    }
    list = list + '</ul>';

    return list;
}

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
                var list = templateList(filelist);
                var template = templateHTML(title, list,
                    `<h2>${title}</h2><p>${descrption}</p>`,
                    `<a href="/create">create</a>`);
        
                response.writeHead(200);
                response.end(template);
            });
        } else {
            fs.readdir('./data', function(err, filelist) {
                fs.readFile(`data/${queryData.id}`, 'utf8', function(err, descrption) {
                    var title = queryData.id;
                    var list = templateList(filelist);
                    var template = templateHTML(title, list,
                        `<h2>${title}</h2><p>${descrption}</p>`,
                        `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
            
                    response.writeHead(200); // 파일은 성공적으로 찾음
                    response.end(template);
                });
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function(err, filelist) {
            // console.log(filelist);
            var title = 'WEB - create';
            var list = templateList(filelist);
            var template = templateHTML(title, list, `
            <form action="/process_create" method="POST">
                <p><input type="text" name="title" placeholder="title"></p>
                <p><textarea name="description" placeholder="description"></textarea></p>
                <p><input type="submit"></p>
            </form>
            `, '');
    
            response.writeHead(200);
            response.end(template);
        });
    } else if (pathname === '/process_create') {
        var body = '';

        // Event
        request.on('data', function(data) {
            // 대용량의 데이터를 POST 방식으로 받게 되면 서버에 무리가 될 수 있음
            // 따라서, 일정 데이터만큼 잘라서 받아내는 과정
            body = body + data;
        });
        request.on('end', function() {
            // 정보 수신이 끝났을 경우
            var post = qs.parse(body);
            // console.log(post);

            var title = post.title;
            var description = post.description;

            // POST 방식으로 받은 데이터를 파일로 저장
            fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                // 리다이렉션 처리
                response.writeHead(302, {Location: `/?id=${title}`});
                response.end('success');
            });
        })
    } else if(pathname === '/update') {
        fs.readdir('./data', function(err, filelist) {
            fs.readFile(`data/${queryData.id}`, 'utf8', function(err, descrption) {
                var title = queryData.id;
                var list = templateList(filelist);
                var template = templateHTML(title, list, `
                    <form action="/process_update" method="POST">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p><textarea name="description" placeholder="description">${descrption}</textarea></p>
                        <p><input type="submit"></p>
                    </form>`,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
                    {/* <input type="hidden" name="id" value="${title}">
                        제목을 수정할 경우 기존 제목을 알아야 하므로 hidden으로 넘겨준다. */}
        
                response.writeHead(200);
                response.end(template);
            });
        });
    } else if (pathname === '/process_update') {
        var body = '';

        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            
            var id = post.id; // hidden으로 받은 기존 문서 제목
            var title = post.title;
            var description = post.description;

            // 파일 이름명 변경 함수 rename(oldPath, newPath, callback)
            fs.rename(`data/${id}`, `data/${title}`, function(error) {
                fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                    // 리다이렉션 처리
                    response.writeHead(302, {Location: `/?id=${title}`});
                    response.end('success');
                });
            });
        })
    } else {
        response.writeHead(404); // 파일 찾기 실패함
        response.end('Not found');
    }
});
app.listen(3000);