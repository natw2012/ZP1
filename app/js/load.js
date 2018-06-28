const $ = require('jquery');
window.$ = window.jQuery = require('jquery');
var mysql = require('mysql');
var photon = require('electron-photon');
const { ipcRenderer } = require('electron');
var dialog = require('electron').remote.dialog;
var fs = require('fs');
var stringify = require('csv-stringify');
var parse = require('csv-parse');
const settings = require('electron-settings');


var connection = require('./js/config.js').localConnect();

// connect to mysql
connection.connect(function (err) {
    // in case of error
    if (err) {
        dialog.showErrorBox("Can't connect to database", "Check Log In Credentials");
        console.log(err.code);
        console.log(err.fatal);
    }
});

function importCount() {
    dialog.showOpenDialog({
        filters: [{ name: 'csv', extensions: ['csv'] }
        ]
    }, function (fileNames) {
        if (fileNames === undefined) return;

        var fileName = fileNames[0];

        fs.readFile(fileName, 'utf-8', function (err, data) {
            console.log(data);
            parse(data, function (err, output) {
                console.log(output);
                var sql = "INSERT INTO `count` (`id`, `species`, `type`) VALUES ?";
                connection.query(sql, [output], function (err, result, fields) {
                    if (err) throw err;
                    loadCounts(scrollTable);

                })
            });

        })
    });
}

function importSpecies() {
    dialog.showOpenDialog({
        filters: [{ name: 'csv', extensions: ['csv'] }
        ]
    }, function (fileNames) {
        if (fileNames === undefined) return;

        var fileName = fileNames[0];

        fs.readFile(fileName, 'utf-8', function (err, data) {
            console.log(data);
            parse(data, function (err, output) {
                console.log(output);
                var sql = "INSERT INTO `species` (`code`,`abbrev`,`name`) VALUES ?";
                connection.query(sql, [output], function (err, result, fields) {
                    if (err) throw err;
                    loadSpecies(scrollTable);
                })
            })
        })
    })
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
            for (var i = 0; i < fields.length; i++) {
                header.push(fields[i].name);
            }
            stringify(result, function (err, output) {
                fs.writeFile(fileName, header + "\n" + output, function (err) {
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
        });
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
    var html = '<button class="btn btn-default" id="addSpeciesWindowBtn" onclick="createAddWindow(\'html/addSpecies.html\')">Add Species</button>';
    html += '<button class="btn btn-default" id="importSpecies" onclick="importSpecies()">Import Species List</button><br></br>'

    document.querySelector('#buttonSection').innerHTML = html;

    $query = 'SELECT `code` ,`abbrev`, `name`, `depth` FROM `species`';

    loadTable($query, function (rows) {
        var html = '<thead><th>Species Code</th><th>Species Abbrev</th><th>Species Name</th><th>Depth</th><th>Actions</th><th>Actions</th><th>Actions</th></thead><tbody>';

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
            html += row.depth;
            html += '</td>';
            html += '<td>';
            html += '<button class="btn btn-default">Info</button>';
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="Edit" onclick="makeEditWindow(this)">Edit</button>';
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteRow(this,\'species\',\'code\',\'code\')">Delete</button>';
            html += '</td>';
            html += '</tr>';
            console.log(row);
        });
        html += '</tbody>';
        document.querySelector('#table').innerHTML = html;
    });
}

function makeEditWindow(btn){
    console.log("test");
    console.log(btn);
    var row = btn.parentNode.parentNode;
    console.log(row);
    var info = [];
    console.log(row.cells.length);
    for(var i = 0; i < row.cells.length-3; i++){
        console.log(i);
        console.log(row.cells[i].innerHTML);
        info.push(row.cells[i].innerHTML);
        console.log(info);
    }
    var id = row.getElementsByClassName('code')[0].innerText;
    console.log(info);
    ipcRenderer.send('showEditWindow',"species",info);
}
function loadCounts(callback) {
    var html = '<button class="btn btn-default" id="startCountBtn" onclick="createCountWindow()">Start Counting</button>'
    html += '<button class="btn btn-default" id="exportCountBtn" onclick="exportCount()">Export Table</button>'
    html += '<button class="btn btn-default" id="importCount" onclick="importCount()">Import Data</button><br></br>'

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
            html += '<button type="button" class="btn btn-default" value="Edit" onclick="createEditWindow(this)">Edit</button>';
            html += '</td>';
            html += '<td>';
            // html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteConfirm()">Delete</button>';
            html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteRow(this,\'count\',\'code\',\'id\')">Delete</button>';
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
            html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteRow(this,\'measures\',\'code\',\'id\')">Delete</button>';
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
            html += '<button type="button" class="btn btn-default" value="Delete" onclick="deleteRow(this,\'lakes\',\'code\',\'lakeCode\')">Delete</button>';
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

//Load Table function, used by several other functions
function loadTable($query, callback) {
    // Perform a query
    connection.query($query, function (err, rows, fields) {
        if (err) {
            ipcRenderer.send('errorMessage', err);
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }

        callback(rows);

        console.log("Query succesfully executed");
    });
}

//Remove row from html table and from MySql database
function deleteRow(btn, table, className, pKey) {


    dialog.showMessageBox({
        type: "question",
        buttons: ['Yes', 'No'],
        defaultId: 0,
        message: "Are you sure you would like to delete?",

    }, function (response) {
        if (response === 0) {
            var row = btn.parentNode.parentNode;
            var code = row.getElementsByClassName(className)[0].innerText;
            row.parentNode.removeChild(row);
            console.log(btn,table,className,pKey);
            $query = 'DELETE FROM ' + table + ' WHERE ' + pKey + ' = ?';
            connection.query($query, code, function (err, rows, fields) {
                if (err) {
                    console.log("An error occured performing the query.");
                    console.log(err);
                    return;
                }
                console.log("Query successfuly executed");
            });
        }
    }
    );
}


function loadSettings() {
    // document.getElementById('settingsContent').innerHTML = '<object type="text/html" data="html/dbLogin.html" height=100% width=100%></object>';
}

//Save UserInfo Settings
function setUserInfo() {
    var dbUser = document.getElementById("dbUser").value;
    var dbPassword = document.getElementById("dbPassword").value;
    settings.set('userInfo', {
        user: dbUser,
        password: dbPassword
    });
    connection.changeUser({ user: dbUser, password: dbPassword }, function (err) {
        if (err) throw err;
    });
    loadDBSelect();
}

//Save Database 
function setDB() {
    var dbDatabase = document.getElementById("dbDatabase").value;
    settings.set('database', {
        db: dbDatabase
    });
    connection.changeUser({ database: dbDatabase }, function (err) {
        if (err) throw err;
    });
    dialog.showMessageBox({ message: "Set database as: " + dbDatabase });
}

//Load database from MySql Database into dropdown
function loadDBSelect() {
    //Clear options 
    removeOptions(document.getElementById("dbDatabase"));
    removeOptions(document.getElementById("deleteDatabaseSelect"));
    console.log(document.getElementById("dbDatabase"));
    // Perform a query
    var $query = "SHOW DATABASES"
    connection.query($query, function (err, result, fields) {
        if (err) {
            ipcRenderer.send('errorMessage', err);
            console.log("An error ocurred performing the query.");
            console.log(err);
            return;
        }
        var option;
        for (var i = 0; result[i] != null; i++) {
            option = document.createElement("option");
            option.text = result[i].Database;
            option.id = result[i].Database;
            document.getElementById("dbDatabase").appendChild(option);
            document.getElementById("deleteDatabaseSelect").appendChild(option.cloneNode(true));
        }
        console.log("Query succesfully executed");

        //Show saved database 
        var e = document.getElementById("dbDatabase");
        e.value = settings.get('database.db');
    });

}
//Clear options from select dropdown
function removeOptions(selectBox) {
    console.log(selectBox);
    if (selectBox) {
        for (var i = selectBox.options.length - 1; i >= 0; i--) {
            selectBox.remove(i);
        }
    }

}

//New Database
function createNewDatabase() {
    var name = document.getElementById("newDatabaseName").value;
    var $query = "CREATE DATABASE " + name; //Change to ??
    connection.query($query, function (err, result, fields) {
        if (err) {
            ipcRenderer.send('errorMessage', err);
            console.log(err);
        }
        connection.changeUser({ database: name }, function (err) {
            if (err) throw err;
        });
        console.log("Query succesfully executed");
        $query = "CREATE TABLE count (id int(5) AUTO_INCREMENT PRIMARY KEY, species varchar(10), type varchar(10))";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', err);
            }
            console.log("Query succesfully executed");
        })
        $query = "CREATE TABLE countTypes (type varchar(10) PRIMARY KEY)";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', err);
            }
            console.log("Query succesfully executed");

        })
        var values = [['Cell'], ['Piece']];
        $query = "INSERT INTO `counttypes`(`type`) VALUES ?";
        connection.query($query, [values], function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', err);

            }
            console.log("Query succesfully executed");
        })
        $query = "CREATE TABLE lakes (lakeCode int(4) AUTO_INCREMENT PRIMARY KEY, lakeName varchar(10))";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', err);
            }
            console.log("Query succesfully executed");
        })
        $query = "CREATE TABLE measures (id int(5) AUTO_INCREMENT PRIMARY KEY, species varchar(10), area float(10))";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', err);
            }
            console.log("Query succesfully executed");
        })
        $query = "CREATE TABLE species (code int(3) PRIMARY KEY, abbrev varchar(8), name varchar(20), depth int(11))";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', err);
            }
            console.log("Query succesfully executed");
        })
        //Load dropdown after new database is created
        loadDBSelect();
    });
    dialog.showMessageBox({ message: "Succesfully Created New Database" });
}

function deleteDatabase() {
    var db = document.getElementById("deleteDatabaseSelect").value;
    $query = "DROP DATABASE " + db;
    connection.query($query, function (err, result, fields) {
        if (err) {
            console.log(err);
            ipcRenderer.send('errorMessage', err);
        }
        console.log("Query Succesfully executed");
    });
    loadDBSelect();
}

function init() {
    //Load saved User Settings for Database Login
    document.getElementById("dbUser").value = settings.get('userInfo.user');
    document.getElementById("dbPassword").value = settings.get('userInfo.password');

    //Currently getting non passive event listener warning
    loadDBSelect();
}

window.addEventListener('load', init, false);
function deleteConfirm(btn, table, className, pKey) {

}

//Should probably figure out where to put this
    // // Close the connection
    // connection.end(function () {
    //     console.log("close");
    //     // The connection has been closed
    // });
