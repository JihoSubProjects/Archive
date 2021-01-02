var express = require('express');
var router  = express.Router(); // Router 객체를 리턴해주는 역할

var template = require('../lib/template');

router.get('/', function(request, response) {
    // fs.readdir('./data', function(error, filelist) {}) -> 자체 미들웨어를 사용함으로써 필요 없어짐
    var title       = 'Welcome';
    var description = 'Hello, Node.js';
    var list        = template.list(request.list);
    var control     = `<a href="/topic/create">create</a>`;
    var body        =  `<h2>${title}</h2>${description}
                        <img src="/images/hello.jpg" style="width:300px; display:block; margin-top:10px;">`;

    var html = template.HTML(title, list, control, body);
    response.send(html);
});

module.exports = router; // 모듈로서 사용되기 위해서 선언해야 함