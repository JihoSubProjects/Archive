var http = require('http');
var fs = require('fs');
var url = require('url');
var qs = require('querystring');

// refactoring : 동작방식은 그대로 유지하면서, 내부의 코드를 더 효율적으로 바꾸는 행위
var template = {
    html: function(title, list, body, control) {
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
    }, list: function(filelist) {
        var list = '<ul>';
        var i = 0;
        while (i < filelist.length) {
            list = list + `<li><a href="/?id=${filelist[i]}">${filelist[i]}</a></li>`;
            i = i + 1;
        }
        list = list + '</ul>';
    
        return list;
    }
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
                var list = template.list(filelist);
                var html = template.html(title, list,
                    `<h2>${title}</h2><p>${descrption}</p>`,
                    `<a href="/create">create</a>`);

                /* var list = templateList(filelist);
                var template = templateHTML(title, list,
                    `<h2>${title}</h2><p>${descrption}</p>`,
                    `<a href="/create">create</a>`); */
        
                response.writeHead(200);
                response.end(html);
            });
        } else {
            fs.readdir('./data', function(err, filelist) {
                fs.readFile(`data/${queryData.id}`, 'utf8', function(err, descrption) {
                    var title = queryData.id;
                    var list = template.list(filelist);
                    var html = template.html(title, list,
                        `<h2>${title}</h2><p>${descrption}</p>`,
                        `<a href="/create">create</a>
                        <a href="/update?id=${title}">update</a>
                        <form action="process_delete" method="POST">
                            <input type="hidden" name="id" value="${title}">
                            <input type="submit" value="delete">
                        </form>`);
                        /* <a href="/delete?id=${title}">delete</a> 
                            위처럼 사용하면 GET방식이므로 form으로 만들어서 안전하게 사용한다.*/
            
                    response.writeHead(200); // 파일은 성공적으로 찾음
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        fs.readdir('./data', function(err, filelist) {
            // console.log(filelist);
            var title = 'WEB - create';
            var list = template.list(filelist);
            var html = template.html(title, list, `
            <form action="/process_create" method="POST">
                <p><input type="text" name="title" placeholder="title"></p>
                <p><textarea name="description" placeholder="description"></textarea></p>
                <p><input type="submit"></p>
            </form>
            `, '');
    
            response.writeHead(200);
            response.end(html);
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
                var list = template.list(filelist);
                var html = template.html(title, list, `
                    <form action="/process_update" method="POST">
                        <input type="hidden" name="id" value="${title}">
                        <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                        <p><textarea name="description" placeholder="description">${descrption}</textarea></p>
                        <p><input type="submit"></p>
                    </form>`,
                    `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`);
        
                response.writeHead(200);
                response.end(html);
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
    } else if (pathname === '/process_delete') {
        var body = '';

        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            
            var id = post.id; // hidden으로 받은 문서 제목
            
            // unlink(path, callback) -> 파일 삭제
            fs.unlink(`data/${id}`, function(error) {
                // 리다이렉션 처리 -> 삭제를 했으니 홈으로 보내자
                response.writeHead(302, {Location: `/`});
                response.end();
            })
        })
    } else {
        response.writeHead(404); // 파일 찾기 실패함
        response.end('Not found');
    }
});
app.listen(3000);