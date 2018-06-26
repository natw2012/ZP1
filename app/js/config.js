const settings = require('electron-settings');



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

var mysql = function localConnect() {
    // Add the credentials to access your database
    return require('mysql').createConnection({
        host: settings.get('userInfo.localhost'),
        user: settings.get('userInfo.user'),
        password: settings.get('userInfo.password'),
        database: settings.get('userInfo.database')
    });
}
module.exports.localConnect = mysql;