window.$ = window.jQuery = require("../../node_modules/jquery/dist/jquery.min.js");
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
ipcRenderer.on('loadAdd', function (e, table) {
    loadForm(table);
});

//Load html content into edit window
function loadForm(table) {

    var html = "";
    var sql = 'SELECT * FROM ??';
    connection.query(sql, table, function (err, result, fields) {
        if (err) {
            console.log(err)
        }
        var name;
        for (var i = 0; i < fields.length; i++) {
            name = fields[i].name.toUpperCase();
            if (i === 0) {
                html += '<div class="form-group"><label for="' + name + '">' + name + ': </label>';
                html += '<input class="form-control form-control-sm" type="text" id="' + name + '" name="' + name + '"></div>';

            }
            else {
                html += '<div class="form-group"><label for="' + name + '">' + name + ': </label>';
                html += '<input class="form-control form-control-sm" type="text" id="' + name + '" name="' + name + '"></div>';

            }
        }

        html += '<button id="addBtn" type="button" class="btn btn-system btn-primary" onclick="addToDB(\'' + table + '\')">Add</button>';


        document.getElementById("addForm").innerHTML = html;
    });
}

//Add to Database from form input
function addToDB(table) {

    console.log(document.querySelector("form"));
    var formData = new FormData(document.querySelector("form"));
    var keys = [];
    var values = [];

    for (var [key, value] of formData.entries()) {
        keys.push(key);
        values.push(value);
    }

    console.log(keys, values);
    console.log(table);
    var sql = "INSERT INTO ?? (??) VALUES (?)";
    connection.query(sql, [table, keys, values], function (err, result, fields) {
        if (err) {
            console.log(err)
            ipcRenderer.send('errMessage2', err);
        }
        ipcRenderer.send('refreshTable', table);
    })

}