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
            'tasty_cookie=strawberry', // 별다른 옵션을 달지 않으면 기본적으로 Session Cookie로 할당
            `Permanent=cookies; Max-age=${60*60*24*30}`, // 30일 동안 살아있는 Permanent Cookie
            'Secure=Secure; Secure',       // HTTPS 방식에서만 사용할 수 있는 쿠키
            'HttpOnly=HttpOnly; HttpOnly', // 서버와 통신할 때만 사용 가능한 쿠키. 즉 js로 정보를 탈취할 수 없음.
            'Path=Path; Path=/cookie',     // 경로를 지정해주면 그 경로와 하위 디렉토리까지만 살아있음
            'Domain=Domain; Domain=o2.org' // o2.org에서만 사용할 수 있는 게 아닌, 서브도메인까지 살아있는 쿠키
        ]
    });

    response.end('Cookie!!');
}).listen(3000);