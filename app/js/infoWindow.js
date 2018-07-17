window.$ = window.jQuery = require("../../node_modules/jquery/dist/jquery.min.js");
const electron = require('electron');
const { ipcRenderer } = electron;
var mysql = require('mysql');
var connection = require('../js/config.js').localConnect();
var dataType = require('../js/sqltohtmldatatype.js');

// connect to mysql
connection.connect(function (err) {
    // in case of error
    if (err) {
        console.log(err.code);
        console.log(err.fatal);
    }
});

ipcRenderer.on('onload-user', function (data) {
    console.log(data);
});
document.ready = (function () {
    ipcRenderer.send('did-finish-load');
});

//Receive call from main
ipcRenderer.on('loadInfo', function (e, table, info) {
    loadForm(table, info);
    console.log(info);
});

//Load html content into info window
function loadForm(table, info) {
    var html = "";
    var sql = 'SELECT * FROM ??';
    connection.query(sql, table, function (err, result, fields) {
        if (err) {
            console.log(err)
        }
        var name;
        for (var i = 0; i < fields.length; i++) {
            name = fields[i].name.toUpperCase();
            type = dataType.getType(fields[i].type);

                html += '<div>' + name + ': ' + info[i] + '</div>';
        }

        document.getElementById("infoDiv").innerHTML = html;
    });
}