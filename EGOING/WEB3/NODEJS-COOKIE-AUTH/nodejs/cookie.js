var http   = require('http');
var cookie = require('cookie');

http.createServer(function(request, response) {
    var cookies = {};
    if (request.headers.cookie !== undefined) {
        cookies = cookie.parse(request.headers.cookie);
    }
    
    console.log(request.headers.cookie); // yummy_cookie=choco; tasty_cookie=strawberry
    console.log(cookies); // { yummy_cookie: 'choco', tasty_cookie: 'strawberry' }

    response.writeHead(200, {
        'Set-Cookie':[
            'yummy_cookie=choco',
            'tasty_cookie=strawberry',
            `Permanent=cookies; Max-age=${60*60*24*30}`, // 30일 동안 살아있는 Permanent Cookie
            'Secure=Secure; Secure', // HTTPS 방식에서만 사용할 수 있는 쿠키
            'HttpOnly=HttpOnly; HttpOnly'
        ]
    });

    response.end('Cookie!!');
}).listen(3000);