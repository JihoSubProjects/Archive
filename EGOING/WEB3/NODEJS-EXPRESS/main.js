var fs = require('fs');
// var qs = require('querystring');

var path = require('path');

var sanitizeHtml = require('sanitize-html');
var express      = require('express');
var bodyParser   = require('body-parser');
var compression  = require('compression');

var template = require('./lib/template.js');

var app = express();

app.use(express.static('public'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(compression());

// 임의로 만든 미들웨어
// .get으로 사용하면 get방식으로 들어온 때만 반응한다. use를 쓰면 c/u/d_process에서도 반응하므로 낭비가 심하다.
app.get('*', function(request, response, next) {
    fs.readdir('./data', function(error, filelist) {
        request.list = filelist;
        next();
    });
});

// route, routing
// app.get('/', (req, res) => res.send('Hello World!'))
app.get('/', function(request, response) {
    // fs.readdir('./data', function(error, filelist) {}) -> 자체 미들웨어를 사용함으로써 필요 없어짐
    var title       = 'Welcome';
    var description = 'Hello, Node.js';
    var list        = template.list(request.list);
    var control     = `<a href="/create">create</a>`;
    var body        =  `<h2>${title}</h2>${description}
                        <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">`;

    var html = template.HTML(title, list, control, body);
    response.send(html);
})

// url parameter를 어떻게 분석하는지 ':pageId'
app.get('/page/:pageId', function(request, response, next) {
    var filteredId = path.parse(request.params.pageId).base;

    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
        if (err) { next(err); }
        else {
            var title                = request.params.pageId;
            var sanitizedTitle       = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, { allowedTags: ['h1'] });
            var list                 = template.list(request.list);
            var control              = `<a href="/create">create</a> <a href="/update/${sanitizedTitle}">update</a>
                                        <form action="/delete_process" method="post">
                                            <input type="hidden" name="id" value="${sanitizedTitle}">
                                            <input type="submit" value="delete">
                                        </form>`;
            var body                 = `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`;
    
            var html = template.HTML(title, list, control, body);
            response.send(html);
        }
    });
});

app.get('/create', function(request, response) {
    var title   = 'WEB - create';
    var list    = template.list(request.list);
    var control = '';
    var body    =  `<form action="/create_process" method="post">
                        <p><input type="text" name="title" placeholder="title"></p>
                        <p><textarea name="description" placeholder="description"></textarea></p>
                        <p><input type="submit" value="create"></p>
                    </form>`;

    var html = template.HTML(title, list, control, body);
    response.send(html);
})

app.post('/create_process', function(request, response) {
    var post        = request.body; // body-parser 사용
    var title       = post.title;
    var description = post.description;

    fs.writeFile(`data/${title}`, description, 'utf8', function(err) { response.redirect(`/page/${title}`) })
})

app.get('/update/:pageId', function(request, response) {
        var filteredId = path.parse(request.params.pageId).base

        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
            var title   = request.params.pageId;
            var list    = template.list(request.list);
            var control = `<a href="/create">create</a> <a href="/update/${title}">update</a>`;
            var body    =  `<form action="/update_process" method="post">
                                <input type="hidden" name="id" value="${title}">
                                <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                                <p><textarea name="description" placeholder="description">${description}</textarea></p>
                                <p><input type="submit" value="update"></p>
                            </form>`;

            var html = template.HTML(title, list, control, body);
            response.send(html);
        });
});

app.post('/update_process', function(request, response) {
    var post        = request.body; // body-parser 사용
    var id          = post.id
    var title       = post.title
    var description = post.description

    fs.rename(`data/${id}`, `data/${title}`, function(error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.redirect(`/page/${title}`)
        })
    })
})

app.post('/delete_process', function(request, response) {
    var post        = request.body; // body-parser 사용
    var id         = post.id
    var filteredId = path.parse(id).base

    // redirect 간소화 -> express 쓰면 편하다. 이게 프레임워크의 장점.
    fs.unlink(`data/${filteredId}`, function(error) { response.redirect('/') })
})

app.use(function(req, res, next) {
    res.status(404).send('Sorry cant find that!');
});

// 404보다 먼저 오면 안 됨
app.use(function(err, req, res, next) {
    console.log(err.stack);
    res.status(500).send('Something broke!');
});

// app.listen(3000, () => console.log('Example app listening on port 3000'))
app.listen(3000, function() {})