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
ipcRenderer.on('loadEdit', function (e, table, info) {
    loadForm(table, info);
});

//Load html content into edit window
function loadForm(table, info) {
    var html = "";
    var sql = 'SELECT * FROM ??';
    connection.query(sql, table, function (err, result, fields) {
        if (err) {
            console.log(err)
        }
        var name;
        for (var i = 0; i < fields.length; i++) {
            name = fields[i].name;
            if (i === 0) {
                html += '<div class="form-group"><label for="' + name + '">' + name + ': </label>';
                html += '<input class="form-control form-control-sm" type="text" id="' + name + '" name="' + name + '" value="' + info[i] + '"readonly></div>';

            }
            else {
                html += '<div class="form-group"><label for="' + name + '">' + name + ': </label>';
                html += '<input class="form-control form-control-sm" type="text" id="' + name + '" name="' + name + '" value="' + info[i] + '"></div>';

            }
        }
        document.getElementById("editForm").innerHTML = html;
    });
}

//Update Database from form input
function updateDB(table) {
    var pKey;
    var pKeyValue = 1;
    console.log(document.querySelector("form"));
    var formData = new FormData(document.querySelector("form"));
    var i = 0;
    for (var [key, value] of formData.entries()) {
        console.log(key, value);
        // var sql = 'UPDATE `species` SET `depth` = \'5\' WHERE `species`.`code` = 1';
        if (i === 0) {
            pKey = key;
            pKeyValue = value;
        }
        else {
            var sql = 'UPDATE ?? SET ?? = ? WHERE ??.?? = ?';
            connection.query(sql, [table, key, value, table, pKey, pKeyValue], function (err, result, fields) {
                if (err) {
                    console.log(err)
                }
                ipcRenderer.send('refreshTable', "species");
            })
        }
        i++;
    }


}