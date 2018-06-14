const $ = require('jquery');
var mysql = require('mysql');
var photon = require('electron-photon');
// var photon2 = require('photon');
var connection = require('./js/config.js').localConnect();
// connect to mysql
connection.connect(function (err) {
    // in case of error
    if (err) {
        console.log(err.code);
        console.log(err.fatal);
    }
});

function loadSpecies() {
    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/species.html" ></object>';
    var html = '<br></br><button class="btn btn-default" id="addSpeciesWindowBtn" onclick="createAddWindow(\'html/addSpecies.html\')">Add Species</button><br></br>';
    document.querySelector('#buttonSection').innerHTML = html;

    $query = 'SELECT `code` ,`abbrev`, `name` FROM `species`';

    getFirstTenRows($query,function (rows) {
        var html = '<thead><th>Species Code</th><th>Species Abbrev</th><th>Species Name</th><th>Actions</th></thead><tbody>';

        rows.forEach(function (row) {
            html += '<tr>';
            html += '<td>';
            html += row.code;
            html += '</td>';
            html += '<td>';
            html += row.abbrev;
            html += '</td>';
            html += '<td>';
            html += row.name;
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteRow(this)">Delete</button>';
            html += '</td>';
            html += '</tr>';
            console.log(row);
        });
        html += '</tbody>';
        console.log(html);
        document.querySelector('#table').innerHTML = html;
    });
}
function loadCounts() {
    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/counts.html" ></object>';
    document.querySelector('#buttonSection').innerHTML = '';

    $query = 'SELECT `id` as speciesID,`species` FROM `count`';

    getFirstTenRows($query,function (rows) {
        var html = '<thead><th>Count ID</th><th>Count Species</th><th>Actions</th></thead><tbody>';

        rows.forEach(function (row) {
            html += '<tr>';
            html += '<td>';
            html += row.speciesID;
            html += '</td>';
            html += '<td>';
            html += row.species;
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteRow(this)">Delete</button>';
            html += '</td>';
            html += '</tr>';
            console.log(row);
        });
        html += '</tbody>';
        document.querySelector('#table').innerHTML = html;
    });

}
function loadAttributes() {
    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/attributes.html" ></object>';
}
function loadLakes() {
    // document.getElementById("content").innerHTML='<object type="text/html" data="html/lakes.html" style="width:100%; height: 100%;"></object>';
    var html = '<br></br><button class="btn btn-default" id="addLakeWindowBtn" onclick="createAddWindow(\'html/addLake.html\')">Add Lake</button><br></br>';
    document.querySelector('#buttonSection').innerHTML = html;

    $query = 'SELECT `lakeCode`,`lakeName` FROM `lakes` LIMIT 10';
    getFirstTenRows($query,function (rows) {
        var html = '<thead><th>Lake Code</th><th>Lake Name</th><th>Actions</th><th>Actions</th><th>Actions</th></thead>';

        rows.forEach(function (row) {
            html += '<tr>';
            html += '<td class="code">';
            html += row.lakeCode;
            html += '</td>';
            html += '<td>';
            html += row.lakeName;
            html += '</td>';
            html += '<td>';
            html += '<button class="btn btn-default">Info</button>';
            html += '</td>';
            html += '<td>';
            html += '<button class="btn btn-default">Edit</button>';
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteRow(this)">Delete</button>';
            html += '</td>';
            html += '</tr>';
            console.log(row);
        });
        html += '</tbody>';
        document.querySelector('#table').innerHTML = html;
    });

}
function loadGear() {
    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/gear.html" ></object>';
}

function getFirstTenRows($query,callback) {
    // Perform a query
    connection.query($query, function (err, rows, fields) {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        callback(rows);

        console.log("Query succesfully executed");
    });
}

function deleteRow(btn){
    var row = btn.parentNode.parentNode;
    var code = row.getElementsByClassName("code")[0].innerText;
    row.parentNode.removeChild(row);

    $query = 'DELETE FROM lakes WHERE lakeCode = ?';
    // Perform a query
    connection.query($query, code, function (err, rows, fields) {
        if (err) {
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }
        console.log("Query succesfully executed");
        
    });

}

//Should probably figure out where to put this
    // // Close the connection
    // connection.end(function () {
    //     console.log("close");
    //     // The connection has been closed
    // });