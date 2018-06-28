const electron = require('electron');
const { ipcRenderer } = electron;
var mysql = require('mysql');

var connection = require('../js/config.js').localConnect();
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
ipcRenderer.on('loadIT', function (e, table, info) {
    console.log("Remember me");
    loadForm(table, info);
});

function loadForm(table, info) {

    var table = `species`;
    var html = "";
    var sql = 'SELECT * FROM ??';
    connection.query(sql, table, function (err, result, fields) {
        if (err) {
            console.log(err)
        }

        // console.log(result, fields);
        // console.log(fields[0].name);
        var name;
        console.log(fields.length);
        for (var i = 0; i < fields.length; i++) {
            name = fields[i].name;
            html += '<div class="form-group"><label for="' + name + '">' + name + ': </label>';
            html += '<input class="form-control form-control-sm" type="text" id="' + name + '" value="' + info[i] + '"></div>';
        }

        document.getElementById("editForm").innerHTML = html;
    });
}