//JS Logic for Add Window

//Include modules
window.$ = window.jQuery = require("../../node_modules/jquery/dist/jquery.min.js");
const electron = require('electron');
const { ipcRenderer } = electron;
var dataType = require('../js/sqltohtmldatatype.js');
var knex = require('../js/config.js').connect();

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
async function loadForm(table) {

    var html = "";
    console.log('PRAGMA TABLE_INFO(??)',table);
    var result = await knex.raw(`PRAGMA TABLE_INFO(groups)`);
    console.log(result);
    var fields = [];
    for (var i =0;i<result.length;i++){
        fields.push(result[i].name);
    }
    console.log(fields);
    var result = await knex(table).columnInfo();
    var fields = Object.keys(result);
    console.log(result);
    console.log(fields);
    console.log(Object.values(result));
    var name;
    for (var i = 0; i < fields.length; i++) {
        name = fields[i].toUpperCase();
        type = dataType.getType(Object.values(result)[i].type);
        console.log(Object.values(result)[i]);
        console.log(Object.values(result)[i].type);
        console.log(dataType.getType(Object.values(result)[i]));

        if (i === 0) {
            html += '<div class="form-group"><label for="' + name + '">' + name + ': </label>';
            html += '<input class="form-control form-control-sm" style="width:100%" type="' + type + '" id="' + name + '" name="' + name + '"></div>';


        }
        else {
            html += '<div class="form-group"><label for="' + name + '">' + name + ': </label>';
            html += '<input class="form-control form-control-sm" style="width:100%" type="' + type + '" id="' + name + '" name="' + name + '"></div>';

        }
    }

    html += '<button id="addBtn" type="submit" class="btn btn-system btn-primary" onclick="addToDB(\'' + table + '\')">Add</button>';

    document.getElementById("addForm").innerHTML = html;
}

//Add to Database from form input
async function addToDB(table) {

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

    //Raw parameter binding
    var result = await knex.raw('INSERT INTO ?? VALUES (' + values.map(_ => '?').join(',') + ')', [table, ...values]);

    ipcRenderer.send('refreshTable', table);
    ipcRenderer.send('refreshMeasureDropdowns');

}