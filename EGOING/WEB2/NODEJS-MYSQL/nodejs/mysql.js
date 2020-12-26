var mysql      = require('mysql');
var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'nodejs',
    password : '123456',
    database : 'egoing_nodejs_mysql'
});

connection.connect();

connection.query('SELECT * FROM topic', function(error, results, fields) {
    if (error) {
        console.log(error);
    }
    console.log('The solution is: ', results);
});

connection.end();