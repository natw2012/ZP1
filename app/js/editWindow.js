//JS Logic for Edit Window

//Include modules
window.$ = window.jQuery = require("../../node_modules/jquery/dist/jquery.min.js");
const electron = require('electron');
const { ipcRenderer } = electron;
var knex = require('../js/config.js').connect();
var dataType = require('../js/sqltohtmldatatype.js');
var win = electron.remote.getCurrentWindow();

ipcRenderer.on('onload-user', function(data) {
    console.log(data);
});
document.ready = (function() {
    ipcRenderer.send('did-finish-load');
});


//Receive call from main
ipcRenderer.on('loadEdit', function(e, table, info) {
    loadForm(table, info);
});

//Load html content into edit window
async function loadForm(table, info) {
    var html = "";
    var result = await knex.raw(`PRAGMA TABLE_INFO(??)`, table);
    var fields = [];
    for (var i = 0; i < result.length; i++) {
        fields.push(result[i].name);
    }
    var result = await knex(table).columnInfo();
    var name;
    for (var i = 0; i < fields.length; i++) {
        name = fields[i].toUpperCase();
        type = dataType.getType(Object.values(result)[i].type);

        if (i === 0) {
            html += '<div class="form-group"><label for="' + name + '">' + name + ': </label>';
            html += '<input class="form-control form-control-sm" style="width:100%" type="' + type + 'id="' + name + '" name="' + name + '" value="' + info[i] + '"readonly></div>';

        }
        else {
            html += '<div class="form-group"><label for="' + name + '">' + name + ': </label>';
            html += '<input class="form-control form-control-sm" style="width:100%" type="' + type + 'id="' + name + '" name="' + name + '" value="' + info[i] + '"></div>';

        }
    }

    html += '<button id="editBtn" type="submit" class="btn btn-default" onclick="updateDB(\'' + table + '\')">Save</button>';

    document.getElementById("editForm").innerHTML = html;
}

//Update Database from form input
async function updateDB(table) {
    try {
        var pKey;
        var pKeyValue = 1;
        console.log(document.querySelector("form"));
        var formData = new FormData(document.querySelector("form"));
        var i = 0;
        for (var [key, value] of formData.entries()) {
            console.log(key, value);
            if (i === 0) {
                pKey = key;
                pKeyValue = value;
            }
            else {
                var result = await knex(table).where(pKey, '=', pKeyValue).update({
                    [key]: value
                });
                console.log(result);
                // var result = knex.raw('UPDATE ?? SET ?? = ? WHERE ??.?? = ?',[table, key, value, table, pKey, pKeyValue]);
                // var sql = 'UPDATE ?? SET ?? = ? WHERE ??.?? = ?';
                ipcRenderer.send('refreshTable', table);
                ipcRenderer.send('refreshCountAndMeasureDropdowns');
                ipcRenderer.send('hideEditWindow');
            }
            i++;
        }
    }
    catch (err) {
        ipcRenderer.send('errorMessage', win.id, err.message);
        ipcRenderer.send('hideEditWindow');
    }



}