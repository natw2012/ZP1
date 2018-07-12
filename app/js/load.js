//Include modules
const $ = require('jquery');
window.$ = window.jQuery = require('jquery');
var mysql = require('mysql');
var Promise = require('bluebird');
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
var photon = require('electron-photon');
const { ipcRenderer } = require('electron');
var dialog = require('electron').remote.dialog;
var fs = require('fs');
var stringify = require('csv-stringify');
var parse = require('csv-parse');
const settings = require('electron-settings');
const electron = require('electron');
const win = electron.remote.getCurrentWindow();

//Include global MySql database module
var connection = require('./js/config.js').localConnect();


//Connect to Mysql Database
connection.connect(function (err) {
    // in case of error
    if (err) {

        dialog.showErrorBox("Can't connect to database", "Check Log In Credentials");
        console.log(err.code);
        console.log(err.fatal);
    }
});

//Import file to table using OS Dialog
function importData(table) {
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

                var sql = "SELECT * FROM ??";
                connection.query(sql, table, function (err, result, fields) {
                    if (err) throw err;
                    var header = [];
                    for (var i = 0; i < fields.length; i++) {
                        header.push(fields[i].name);
                    }
                    console.log(header);
                    var sql = "INSERT INTO ?? (??) VALUES ?";
                    connection.query(sql, [table, header, output], function (err, result, fields) {
                        if (err) {
                            console.log(win);
                            ipcRenderer.send('errorMessage', win.id, err.message);
                        }
                        if (table === "species") {
                            loadSpecies(table);
                        }
                        else if (table === "count") {
                            loadCounts(table);
                        }
                        else if (table === "measures") {
                            loadMeasures(table);
                        }
                        else {
                            ipcRenderer.send('errorMessage', win.id, "Error Importing");
                        }
                        scrollTable();
                    })
                })
            })
        })
    })
}

//Includes Headers
//Exports a given table using OS Dialog
function exportData(table) {
    dialog.showSaveDialog({
        filters: [{ name: 'csv', extensions: ['csv'] }
        ]
    }, function (fileName) {
        if (fileName === undefined) return;

        var sql = "SELECT * FROM ??";
        connection.query(sql, table, function (err, result, fields) {
            if (err) throw err;
            var header = [];
            for (var i = 0; i < fields.length; i++) {
                header.push(fields[i].name);
            }
            stringify(result, function (err, output) {
                fs.writeFile(fileName, header + "\n" + output, function (err) {
                    if (err === null) {

                        dialog.showMessageBox(win, {
                            message: "The file has been saved! :-)",
                            buttons: ["OK"]
                        });
                    } else {
                        dialog.showErrorBox("Error", err.message); //Not sure if this works
                    }
                });
            });
        });
    });
}

function importCount() {
    importData("count");
}

function importSpecies() {
    importData("species");
}

function importMeasure() {
    importData("measures");
}

//Export MySql Count Table to csv file
function exportCount() {
    exportData("count");
}

//Export MySql Measure Table to csv file
function exportMeasure() {
    exportData("measures");
}


//Receive call from another window
ipcRenderer.on('refreshTable', function (e, table) {
    console.log(table);
    if (table === "count") {
        loadCounts(table, scrollTable);
    }
    else if (table === "measures") {
        loadMeasures(table, scrollTable);
    }
    else if (table === "lakes") {
        loadLakes(table, scrollTable);
    }
    else if (table === "species") {
        loadSpecies(table, scrollTable);
    }
    else {
        console.log("No table");
        return;
    }
});

//Scrolls table down to the bottom to see new inputted data
function scrollTable() {
    var tbl = document.getElementById('tableSection');
    tbl.scrollTop = tbl.scrollHeight;
    console.log(tbl, tbl.scrollTop, tbl.scrollHeight);
}

//Make the Edit Window
function makeEditWindow(btn, table) {

    var row = btn.parentNode.parentNode;
    var info = [];
    for (var i = 0; i < row.cells.length - 3; i++) {
        info.push(row.cells[i].innerHTML);
    }
    // var id = row.getElementsByClassName('code')[0].innerText;
    //maybe add a pause to reduce flashing
    ipcRenderer.send('showEditWindow', table, info);
}

//Load Species page
function loadSpecies(table, callback) {
    var html = '<button class="btn btn-default" id="addSpeciesWindowBtn" onclick="loadAddWindow(\'species\')">Add Species</button>';
    html += '<button class="btn btn-default" id="importSpecies" onclick="importSpecies()">Import Species List</button><br></br>'
    document.querySelector('#buttonSection').innerHTML = html;

    loadTable(table, callback);
}

//Load Count page
function loadCounts(table, callback) {
    var html = '<button class="btn btn-default" id="startCountBtn" onclick="createCountWindow()">Start Counting</button>'
    html += '<button class="btn btn-default" id="exportCountBtn" onclick="exportCount()">Export Table</button>'
    html += '<button class="btn btn-default" id="importCount" onclick="importCount()">Import Data</button><br></br>'
    document.querySelector('#buttonSection').innerHTML = html;

    loadTable(table, callback);

}

//Load Measures page
function loadMeasures(table, callback) {

    var html = '<button class="btn btn-default" id="startMeasureBtn" onclick="createMeasureWindow()">Start Measuring</button>'
    html += '<button class="btn btn-default" id="exportMeasureBtn" onclick="exportMeasure()">Export Data</button>'
    html += '<button class="btn btn-default" id="importMeasureBtn" onclick="importMeasure()">Import Data</button><br></br>'
    document.querySelector('#buttonSection').innerHTML = html;
    loadTable(table, callback);
}

//Load Formulas page
function loadFormulas(table, callback) {
    var html = '<button class="btn btn-default" id="addFormulaBtn" onclick="loadAddFormula(\'formula\')">Add Formula</button><br></br>'
    document.querySelector('#buttonSection').innerHTML = html;

    loadTable(table, callback);
}

//Load Lakes page
function loadLakes(table, callback) {
    var html = '<button class="btn btn-default" id="addLakeWindowBtn" onclick="loadAddWindow(\'lakes\')">Add Lake</button><br></br>';
    document.querySelector('#buttonSection').innerHTML = html;

    loadTable(table, callback);
}

//Load Attributes page
function loadAttributes() {
    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/attributes.html" ></object>';
}

//Load Gear page
function loadGear() {
    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/gear.html" ></object>';
}

//Load Samples Page
function loadSamples(table, callback) {
    var html = '<button class="btn btn-default" id="addSampleBtn" onclick="loadAddWindow(\'samples\')">Add Sample</button><br></br>';
    document.querySelector('#buttonSection').innerHTML = html;

    loadTable(table, callback);
}

//Load Add Browser Window 
function loadAddWindow(table) {
    ipcRenderer.send('showAddWindow', table);
}

//Load Table function, used by several other functions
function loadTable(table, callback) {

    // Perform a query
    var sql = 'SELECT * FROM ??';
    connection.query(sql, table, function (err, rows, fields) {
        if (err) {
            ipcRenderer.send('errorMessage', win.id, err.message);
            console.log(err);
        }
        var html = "";
        var headers = [];

        //Build table headers
        html += '<thead>';
        for (var i = 0; i < fields.length; i++) {
            headers[i] = fields[i].name;
            html += '<th>';
            html += headers[i].toUpperCase();
            html += '</th>';
        }
        for (var i = 0; i < 3; i++) {
            html += '<th>';
            html += 'ACTIONS';
            html += '</th>';
        }
        console.log(headers);
        html += '</thead>';

        rows.forEach(function (row) {
            html += '<tr>';

            //Dynamically get row.property from header strings
            headers.forEach(function (header) {
                html += '<td>';
                html += row[header];
                html += '</td>';
            })
            html += '<td>';
            html += '<button class="btn btn-default">Info</button>';
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="Edit" onclick="makeEditWindow(this,\'' + table + '\')">Edit</button>';
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="' + row[headers[0]] + '" onclick="deleteRow(this,\'' + table + '\')">Delete</button>'; //Requires primary key to be 1st column
            html += '</td>';
            html += '</tr>';
            console.log(row);
        });

        //Inject html and build table contents
        document.querySelector('#table').innerHTML = html;

        // callback(rows);

        console.log("Query succesfully executed");
        typeof callback === 'function' && callback();
    });




}

//Remove row from html table and from MySql database
function deleteRow(btn, table) {

    //Confirm delete
    dialog.showMessageBox(win, {
        type: "question",
        buttons: ['Yes', 'No'],
        defaultId: 0,
        message: "Are you sure you would like to delete?",

    }, function (response) {
        if (response === 0) { //If user clicks yes
            var row = btn.parentNode.parentNode;
            var code = btn.value;

            row.parentNode.removeChild(row);

            var sql = 'SHOW KEYS FROM ?? WHERE Key_name = \'PRIMARY\'';
            connection.query(sql, table, function (err, result, fields) {
                if (err) {
                    console.log(err);
                }
                var sql = 'DELETE FROM ?? WHERE ?? = ?';
                connection.query(sql, [table, result[0].Column_name, code], function (err, result, fields) {
                    if (err) {
                        console.log(err);
                    }
                });
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

//Save Database Setting
function setDB() {
    var dbDatabase = document.getElementById("dbDatabase").value;
    settings.set('database', {
        db: dbDatabase
    });
    connection.changeUser({ database: dbDatabase }, function (err) {
        if (err) throw err;
    });
    dialog.showMessageBox(win, { message: "Set database as: " + dbDatabase });
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
            ipcRenderer.send('errorMessage', win.id, err.message);
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
            ipcRenderer.send('errorMessage', win.id, err.message);
            console.log(err);
        }
        connection.changeUser({ database: name }, function (err) {
            if (err) throw err;
        });
        console.log("Query succesfully executed");
        $query = "CREATE TABLE count (id int(5) AUTO_INCREMENT PRIMARY KEY, species varchar(10), type varchar(10))";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', win.id, err.message);
            }
            console.log("Query succesfully executed");
        })
        $query = "CREATE TABLE countTypes (type varchar(10) PRIMARY KEY)";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', win.id, err.message);
            }
            console.log("Query succesfully executed");

        })
        var values = [['Cell'], ['Piece']];
        $query = "INSERT INTO `counttypes`(`type`) VALUES ?";
        connection.query($query, [values], function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', win.id, err.message);

            }
            console.log("Query succesfully executed");
        })
        $query = "CREATE TABLE lakes (lakeCode int(4) AUTO_INCREMENT PRIMARY KEY, lakeName varchar(10))";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', win.id, err.message);
            }
            console.log("Query succesfully executed");
        })
        $query = "CREATE TABLE measures (id int(5) AUTO_INCREMENT PRIMARY KEY, species varchar(10), length float(10), width float(10), area float(10), volume float(10))";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', win.id, err.message);
            }
            console.log("Query succesfully executed");
        })
        $query = "CREATE TABLE species (code int(3) PRIMARY KEY, abbrev varchar(8), name varchar(20), depth int(11))";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', win.id, err.message);
            }
            console.log("Query succesfully executed");
        })
        //Load dropdown after new database is created
        loadDBSelect();
    });
    dialog.showMessageBox(win, { message: "Succesfully Created New Database" });
}

//Delete database
function deleteDatabase() {

    dialog.showMessageBox(win, {
        type: "question",
        buttons: ['Yes', 'No'],
        defaultId: 0,
        message: "Are you sure you would like to delete this database?",

    }, function (response) {
        if (response === 0) { //If user clicks 'Yes'
            var db = document.getElementById("deleteDatabaseSelect").value;
            $query = "DROP DATABASE ??";
            connection.query($query, db, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    ipcRenderer.send('errorMessage', win.id, err.message);
                }
                console.log("Query Succesfully executed");
            });
            loadDBSelect();
        }
    }
    );
}

function init() {
    //Load saved User Settings for Database Login
    document.getElementById("dbUser").value = settings.get('userInfo.user');
    document.getElementById("dbPassword").value = settings.get('userInfo.password');

    //Currently getting non passive event listener warning
    loadDBSelect();
}

window.addEventListener('load', init, false);

//Should probably figure out where to put this
    // // Close the connection
    // connection.end(function () {
    //     console.log("close");
    //     // The connection has been closed
    // });
