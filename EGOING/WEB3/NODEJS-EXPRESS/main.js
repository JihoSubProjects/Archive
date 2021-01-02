var fs = require('fs');

var express      = require('express');
var bodyParser   = require('body-parser');
var compression  = require('compression');

var indexRouter = require('./routes/index');
var topicRouter = require('./routes/topic');

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

app.use('/',      indexRouter);
app.use('/topic', topicRouter);

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