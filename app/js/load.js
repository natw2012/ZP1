const $ = require('jquery');
var mysql = require('mysql');
var photon = require('electron-photon');
// var photon2 = require('photon');
const { ipcRenderer } = require('electron')
var dialog = require('electron').remote.dialog;
var fs = require('fs');
var stringify = require('csv-stringify');
var connection = require('./js/config.js').localConnect();
// connect to mysql
connection.connect(function (err) {
    // in case of error
    if (err) {
        console.log(err.code);
        console.log(err.fatal);
    }
});

function openFile() {
    dialog.showOpenDialog({
        filters: [{ name: 'csv', extensions: ['csv'] }
        ]
    }, function (fileNames) {
        if (fileNames === undefined) return;

        var fileName = fileNames[0];

        fs.readFile(fileName, 'utf-8', function (err, data) {
            console.log(data);
        })
    });
}

//Export MySql Count Table to csv file
//Includes Headers
function exportCount() {
    dialog.showSaveDialog({
        filters: [{ name: 'csv', extensions: ['csv'] }
        ]
    }, function (fileName) {
        if (fileName === undefined) return;

        var sql = "SELECT * FROM count";
        connection.query(sql, function (err, result, fields) {
            if (err) throw err;
            var header = [];
            for(var i = 0; i < fields.length; i++){
                header.push(fields[i].name);
            }
            stringify(result,function(err,output){
                fs.writeFile(fileName, header+"\n"+output, function (err) {
                    if (err === null) {
    
                        dialog.showMessageBox({
                            message: "The file has been saved! :-)",
                            buttons: ["OK"]
                        });
                    } else {
                        dialog.showErrorBox("File Save Error", err.message); //Not sure if this works
                    }
                });
            });
        })
    });
}

//Receive call from another window
ipcRenderer.on('refreshTable', function (e, table) {
    console.log(table);
    if (table === "count") {
        loadCounts(scrollTable);
    }
    else if (table === "measure") {
        loadMeasures(scrollTable);
    }
    else if (table === "lake") {
        loadLakes(scrollTable);
    }
    else if (table === "species") {
        loadSpecies(scrollTable);
    }

});

function scrollTable() {
    var tbl = document.getElementById('tableSection');
    tbl.scrollTop = tbl.scrollHeight;
    console.log(tbl, tbl.scrollTop, tbl.scrollHeight);
}

function loadSpecies() {
    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/species.html" ></object>';
    var html = '<button class="btn btn-default" id="addSpeciesWindowBtn" onclick="createAddWindow(\'html/addSpecies.html\')">Add Species</button><br></br>';
    document.querySelector('#buttonSection').innerHTML = html;

    $query = 'SELECT `code` ,`abbrev`, `name` FROM `species`';

    loadTable($query, function (rows) {
        var html = '<thead><th>Species Code</th><th>Species Abbrev</th><th>Species Name</th><th>Actions</th><th>Actions</th><th>Actions</th></thead><tbody>';

        rows.forEach(function (row) {
            html += '<tr>';
            html += '<td class="code">';
            html += row.code;
            html += '</td>';
            html += '<td>';
            html += row.abbrev;
            html += '</td>';
            html += '<td>';
            html += row.name;
            html += '</td>';
            html += '<td>';
            html += '<button class="btn btn-default">Info</button>';
            html += '</td>';
            html += '<td>';
            html += '<button class="btn btn-default">Edit</button>';
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteSpeciesRow(this)">Delete</button>';
            html += '</td>';
            html += '</tr>';
            console.log(row);
        });
        html += '</tbody>';
        console.log(html);
        document.querySelector('#table').innerHTML = html;
    });
}
function loadCounts(callback) {
    var html = '<button class="btn btn-default" id="startCountBtn" onclick="createCountWindow()">Start Counting</button>'
    html += '<button class="btn btn-default" id="exportCountBtn" onclick="exportCount()">Export Table</button><br></br>'
    html += '<button class="btn btn-default" id="openFile" onclick="openFile()">Open File</button><br></br>'

    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/counts.html" ></object>';
    document.querySelector('#buttonSection').innerHTML = html;

    $query = 'SELECT `id` as speciesID,`species`,`type` as speciesType FROM `count`';

    loadTable($query, function (rows) {
        var html = '<thead><th>Count ID</th><th>Count Species</th><th>Count Type</th><th>Actions</th><th>Actions</th><th>Actions</th></thead><tbody>';

        rows.forEach(function (row) {
            html += '<tr>';
            html += '<td class="code">';
            html += row.speciesID;
            html += '</td>';
            html += '<td>';
            html += row.species;
            html += '</td>';
            html += '<td>';
            html += row.speciesType;
            html += '</td>';
            html += '<td>';
            html += '<button class="btn btn-default">Info</button>';
            html += '</td>';
            html += '<td>';
            html += '<button class="btn btn-default">Edit</button>';
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteCountRow(this)">Delete</button>';
            html += '</td>';
            html += '</tr>';
            console.log(row);
        });
        html += '</tbody>';
        document.querySelector('#table').innerHTML = html;

        typeof callback === 'function' && callback();
    });

}
function loadMeasures(callback) {
    var html = '<button class="btn btn-default" id="startMeasureBtn" onclick="createMeasureWindow()">Start Measuring</button><br></br>'

    document.querySelector('#buttonSection').innerHTML = html;

    $query = 'SELECT `id` as measureID,`species`,`area` FROM `measures`';

    loadTable($query, function (rows) {
        var html = '<thead><th>ID</th><th>Species</th><th>Area</th><th>Actions</th><th>Actions</th><th>Actions</th></thead><tbody>';

        rows.forEach(function (row) {
            html += '<tr>';
            html += '<td class="code">';
            html += row.measureID;
            html += '</td>';
            html += '<td>';
            html += row.species;
            html += '</td>';
            html += '<td>';
            html += row.area;
            html += '</td>';
            html += '<td>';
            html += '<button class="btn btn-default">Info</button>';
            html += '</td>';
            html += '<td>';
            html += '<button class="btn btn-default">Edit</button>';
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteMeasuresRow(this)">Delete</button>';
            html += '</td>';
            html += '</tr>';
            console.log(row);
        });
        html += '</tbody>';
        document.querySelector('#table').innerHTML = html;

        typeof callback === 'function' && callback();
    });
}
function loadFormulas() {
    var html = '<button class="btn btn-default" id="addFormulaBtn" onclick="createAddWindow(\'html/addFormula.html\')">Add Formula</button><br></br>'

    document.querySelector('#buttonSection').innerHTML = html;

    $query = 'SELECT `id` as measureID,`species`,`area` FROM `measures`';

    loadTable($query, function (rows) {
        var html = '<thead><th>ID</th><th>Species</th><th>Area</th><th>Actions</th><th>Actions</th><th>Actions</th></thead><tbody>';

        // rows.forEach(function (row) {
        //     html += '<tr>';
        //     html += '<td class="code">';
        //     html += row.measureID;
        //     html += '</td>';
        //     html += '<td>';
        //     html += row.species;
        //     html += '</td>';
        //     html += '<td>';
        //     html += row.area;
        //     html += '</td>';
        //     html += '<td>';
        //     html += '<button class="btn btn-default">Info</button>';
        //     html += '</td>';
        //     html += '<td>';
        //     html += '<button class="btn btn-default">Edit</button>';
        //     html += '</td>';
        //     html += '<td>';
        //     html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteMeasuresRow(this)">Delete</button>';
        //     html += '</td>';
        //     html += '</tr>';
        //     console.log(row);
        // });
        html += '</tbody>';
        document.querySelector('#table').innerHTML = html;
    });
}
function loadLakes(callback) {
    // document.getElementById("content").innerHTML='<object type="text/html" data="html/lakes.html" style="width:100%; height: 100%;"></object>';
    var html = '<button class="btn btn-default" id="addLakeWindowBtn" onclick="createAddWindow(\'html/addLake.html\')">Add Lake</button><br></br>';
    document.querySelector('#buttonSection').innerHTML = html;

    $query = 'SELECT `lakeCode`,`lakeName` FROM `lakes` LIMIT 10';
    loadTable($query, function (rows) {
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
            html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteLakeRow(this)">Delete</button>';
            html += '</td>';
            html += '</tr>';
            console.log(row);
        });
        html += '</tbody>';
        document.querySelector('#table').innerHTML = html;

        typeof callback === 'function' && callback();
    });

}
function loadAttributes() {
    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/attributes.html" ></object>';
}
function loadGear() {
    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/gear.html" ></object>';
}

function loadTable($query, callback) {
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

function deleteLakeRow(btn) {
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
function deleteSpeciesRow(btn) {
    var row = btn.parentNode.parentNode;
    var code = row.getElementsByClassName("code")[0].innerText;
    row.parentNode.removeChild(row);

    $query = 'DELETE FROM species WHERE code = ?';
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
function deleteCountRow(btn) {
    var row = btn.parentNode.parentNode;
    var code = row.getElementsByClassName("code")[0].innerText;
    row.parentNode.removeChild(row);

    $query = 'DELETE FROM count WHERE id = ?';
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
function deleteMeasuresRow(btn) {
    var row = btn.parentNode.parentNode;
    var code = row.getElementsByClassName("code")[0].innerText;
    row.parentNode.removeChild(row);

    $query = 'DELETE FROM measures WHERE id = ?';
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