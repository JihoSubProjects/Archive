var express = require('express');
var router  = express.Router(); // Router 객체를 리턴해주는 역할

var fs = require('fs'); // filesystem

var path = require('path');

var sanitizeHtml = require('sanitize-html');
var express      = require('express');

var template = require('../lib/template');

router.get('/create', function(request, response) {
    var title   = 'WEB - create';
    var list    = template.list(request.list);
    var control = '';
    var body    =  `<form action="/topic/create_process" method="post">
                        <p><input type="text" name="title" placeholder="title"></p>
                        <p><textarea name="description" placeholder="description"></textarea></p>
                        <p><input type="submit" value="create"></p>
                    </form>`;

    var html = template.HTML(title, list, control, body);
    response.send(html);
})

router.post('/create_process', function(request, response) {
    var post        = request.body; // body-parser 사용
    var title       = post.title;
    var description = post.description;

    fs.writeFile(`data/${title}`, description, 'utf8', function(err) { response.redirect(`/topic/${title}`) })
})

router.get('/update/:pageId', function(request, response) {
        var filteredId = path.parse(request.params.pageId).base

        fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
            var title   = request.params.pageId;
            var list    = template.list(request.list);
            var control = `<a href="/topic/create">create</a> <a href="/topic/update/${title}">update</a>`;
            var body    =  `<form action="/topic/update_process" method="post">
                                <input type="hidden" name="id" value="${title}">
                                <p><input type="text" name="title" placeholder="title" value="${title}"></p>
                                <p><textarea name="description" placeholder="description">${description}</textarea></p>
                                <p><input type="submit" value="update"></p>
                            </form>`;

            var html = template.HTML(title, list, control, body);
            response.send(html);
        });
});

router.post('/update_process', function(request, response) {
    var post        = request.body; // body-parser 사용
    var id          = post.id
    var title       = post.title
    var description = post.description

    fs.rename(`data/${id}`, `data/${title}`, function(error) {
        fs.writeFile(`data/${title}`, description, 'utf8', function(err) {
            response.redirect(`/topic/${title}`)
        })
    })
})

router.post('/delete_process', function(request, response) {
    var post       = request.body; // body-parser 사용
    var id         = post.id
    var filteredId = path.parse(id).base

    // redirect 간소화 -> express 쓰면 편하다. 이게 프레임워크의 장점.
    fs.unlink(`data/${filteredId}`, function(error) { response.redirect('/') })
})

// url parameter를 어떻게 분석하는지 ':pageId'
router.get('/:pageId', function(request, response, next) {
    var filteredId = path.parse(request.params.pageId).base;

    fs.readFile(`data/${filteredId}`, 'utf8', function(err, description) {
        if (err) { next(err); }
        else {
            var title                = request.params.pageId;
            var sanitizedTitle       = sanitizeHtml(title);
            var sanitizedDescription = sanitizeHtml(description, { allowedTags: ['h1'] });
            var list                 = template.list(request.list);
            var control              = `<a href="/topic/create">create</a> <a href="/topic/update/${sanitizedTitle}">update</a>
                                        <form action="/topic/delete_process" method="post">
                                            <input type="hidden" name="id" value="${sanitizedTitle}">
                                            <input type="submit" value="delete">
                                        </form>`;
            var body                 = `<h2>${sanitizedTitle}</h2>${sanitizedDescription}`;
    
            var html = template.HTML(title, list, control, body);
            response.send(html);
        }
    });
});

module.exports = router; // 모듈로서 사용되기 위해서 선언해야 함