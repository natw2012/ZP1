var mysql = function localConnect() {
    // Add the credentials to access your database
    return require('mysql').createConnection({
        host: 'localhost',
        user: 'root',
        password: null,
        database: 'ZP1'
    });
}
module.exports.localConnect = mysql;