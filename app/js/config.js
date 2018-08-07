const settings = require('electron-settings');
var sqlite3 = require('sqlite3').verbose();


// function getUserInfo() {
//     settings.set('userInfo', {
//         localhost: 'localhost',
//         user: 'root',
//         password: null,
//         database: 'ZP1'
//     });
// }
// getUserInfo();
// var userInfo = {
//     localhost: 'localhost',
//     user: 'root',
//     password: null,
//     database: 'ZP1'
// }

// var mysql = function localConnect() {
//     // Add the credentials to access your database
//     return require('mysql').createConnection({
//         host: "localhost",
//         user: settings.get('userInfo.user'),
//         password: settings.get('userInfo.password'),
//         database: settings.get('database.db')
//     });
// }
// module.exports.localConnect = mysql;




var knex = function connect() {
    return knex = require('knex')({
        client: 'sqlite3',
        connection: {
            filename: settings.get('database.db') //"zp1.db"
        },
        useNullAsDefault: true
    });
}

module.exports.connect = knex;

