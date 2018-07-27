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
ipcRenderer.on('loadInfo', function (e, table, info) {
    loadForm(table, info);
    console.log(info);
});

//Load html content into info window
async function loadForm(table, info) {
    var html = "";
    var result = await knex.raw(`PRAGMA TABLE_INFO(??)`,table);
    var fields = [];
    for (var i =0;i<result.length;i++){
        fields.push(result[i].name);
    }
    var result = await knex(table).columnInfo();
    var name;
    for (var i = 0; i < fields.length; i++) {
        name = fields[i].toUpperCase();
        type = dataType.getType(fields[i].type);

            html += '<div>' + name + ': ' + info[i] + '</div>';
    }
    document.getElementById("infoDiv").innerHTML = html;
}