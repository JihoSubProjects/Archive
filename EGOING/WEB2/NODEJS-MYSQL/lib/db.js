var mysql = require('mysql');
var db = mysql.createConnection({
    host     : 'localhost',
    user     : 'nodejs',
    password : '123456',
    database : 'egoing_nodejs_mysql'
});
db.connect();

module.exports = db;