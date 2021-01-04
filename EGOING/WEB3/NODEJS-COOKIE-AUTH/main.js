var http = require('http');
var fs   = require('fs');
var url  = require('url');
var qs   = require('querystring');

var path = require('path');

var template = require('./lib/template.js');

var sanitizeHtml = require('sanitize-html');
var cookie = require('cookie');

function authIsOwner(request, response) {
    var isOwner = false;
    var cookies = {};

    if (request.headers.cookie) {
        cookies = cookie.parse(request.headers.cookie);
    }

    if (cookies.email === 'jiho@kakao.com' && cookies.password === '123456') {
        isOwner = true;
    }

    return isOwner;
}

function authStatusUI(request, response) {
    var authStatusUI = '<a href="/login">login</a>';

    if (authIsOwner(request, response)) {
        authStatusUI = '<a href="/logout_process">logout</a>';
    }

    return authStatusUI;
}

var app = http.createServer(function(request, response) {
    var _url         = request.url;
    var queryData    = url.parse(_url, true).query;
    var pathname     = url.parse(_url, true).pathname;

    if (pathname === '/') {
        if (queryData.id === undefined) {
            fs.readdir('./data', function(error, filelist) {
                var title       = 'Welcome';
                var description = 'Hello, Node.js';
                var list        = template.list(filelist);
                var control     = '<a href="/create">create</a>';
                var body        = `<h2>${title}</h2>${description}`;
                var html        = template.HTML(title, list, control, body, authStatusUI(request, response));

                response.writeHead(200);
                response.end(html);
            });
        } else {
            fs.readdir('./data', function(error, filelist) {
                var filteredId = path.parse(queryData.id).base;
                fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                    var title                = queryData.id;
                    var sanitizedTitle       = sanitizeHtml(title);
                    var sanitizedDescription = sanitizeHtml(description, {allowedTags:['h1']});
                    var list                 = template.list(filelist);
                    var control              = `<a href="/create">create</a> <a href="/update?id=${sanitizedTitle}">update</a>
                                                <form action="delete_process" method="post">
                                                    <input type="hidden" name="id" value="${sanitizedTitle}">
                                                    <input type="submit" value="delete">
                                                </form>`;
                    var body                 = `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`;
                    var html                 = template.HTML(title, list, control, body, authStatusUI(request, response));

                    response.writeHead(200);
                    response.end(html);
                });
            });
        }
    } else if (pathname === '/create') {
        if (authIsOwner(request, response) === false) { // 접근 제어; 로그인한 사람만 글 등록 가능
            response.end('Login required!!');
            return false;
        }

        fs.readdir('./data', function(error, filelist) {
            var title   = 'WEB - create';
            var list    = template.list(filelist);
            var control = '';
            var body    =  `<form action="/create_process" method="post">
                                <p><input type="text" name="title" placeholder="title"></p>
                                <p><textarea name="description" placeholder="description"></textarea></p>
                                <p><input type="submit"></p>
                            </form>`;
            var html    = template.HTML(title, list, control, body, authStatusUI(request, response));

            response.writeHead(200);
            response.end(html);
        });
    } else if (pathname === '/create_process') {
        if (authIsOwner(request, response) === false) { // 접근 제어; 로그인한 사람만 글 등록 가능
            response.end('Login required!!');
            return false;
        }

        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var title = post.title;
            var description = post.description;
            fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                response.writeHead(302, {Location:`/?id=${title}`});
                response.end();
            })
        });
    } else if(pathname === '/update') {
        if (authIsOwner(request, response) === false) { // 접근 제어
            response.end('Login required!!');
            return false;
        }

        fs.readdir('./data', function(error, filelist) {
            var filteredId = path.parse(queryData.id).base;
            fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
                var title   = queryData.id;
                var list    = template.list(filelist);
                var control = `<a href="/create">create</a> <a href="/update?id=${title}">update</a>`;
                var body    =  `<form action="/update_process" method="post">
                                    <input type="hidden" name="id" value="${title}">
                                    <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                                    <p><textarea name="description" placeholder="description">${description}</textarea></p>
                                    <p><input type="submit"></p>
                                </form>`;
                var html    = template.HTML(title, list, control, body, authStatusUI(request, response));
                
                response.writeHead(200);
                response.end(html);
            });
        });
    } else if (pathname === '/update_process') {
        if (authIsOwner(request, response) === false) { // 접근 제어
            response.end('Login required!!');
            return false;
        }

        var body = '';
        request.on('data', function(data) {
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var title = post.title;
            var description = post.description;
            fs.rename(`data/${id}`, `data/${title}`, function(error) {
                fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
                response.writeHead(302, {Location:`/?id=${title}`});
                response.end();
                })
            });
        });
    } else if (pathname === '/delete_process') {
        if (authIsOwner(request, response) === false) { // 접근 제어
            response.end('Login required!!');
            return false;
        }

        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);
            var id = post.id;
            var filteredId = path.parse(id).base;
            fs.unlink(`data/${filteredId}`, function(error) {
                response.writeHead(302, {Location:`/`});
                response.end();
            })
        });
    } else if (pathname === '/login') {
        fs.readdir('./data', function(error, filelist) {
            var title       = 'Login';
            var list        = template.list(filelist);
            var control     = '<a href="/create">create</a>';
            var body        =  `<form action="login_process" method="POST">
                                    <p><input type="text" name="email" placeholder="email"></p>
                                    <p><input type="password" name="password" placeholder="password"></p>
                                    <p><input type="submit" value="login"></p>
                                </form>`;
            var html        = template.HTML(title, list, control, body, authStatusUI(request, response));

            response.writeHead(200);
            response.end(html);
        });
    } else if(pathname === '/login_process') {
        var body = '';
        request.on('data', function(data){
            body = body + data;
        });
        request.on('end', function() {
            var post = qs.parse(body);

            if (post.email === 'jiho@kakao.com' && post.password === '123456') {
                response.writeHead(302, {
                    'Set-Cookie':[
                        `email=${post.email}`,
                        `password=${post.password}`,
                        'nickname=jiho'
                    ], Location:`/`
                });
                response.end();
            } else {
                response.end('Who?');
            }
        });
    } else if ('/logout_process') {
        var post = qs.parse(body);

        response.writeHead(302, {
            'Set-Cookie':[
                'email=   ; Max-Age=0',
                'password=; Max-Age=0',
                'nickname=; Max-Age=0'
            ], Location:`/`
        });
        response.end();
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);
