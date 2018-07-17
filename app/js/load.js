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
var moment = require('moment');
var parse = require('csv-parse');
const settings = require('electron-settings');
const electron = require('electron');
const win = electron.remote.getCurrentWindow();
const chart = require('chart.js');

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

/************************************************************
        DASHBOARD 
*************************************************************/

var _ = require('underscore');

var speciesChart = null;
var sizeChart = null;
var barChart = null;
var radarChart = null;

var knex = require('knex')({
    client: 'mysql',
    connection: {
        host: "localhost",
        user: settings.get('userInfo.user'),
        password: settings.get('userInfo.password'),
        database: settings.get('database.db')
    }
});
//Load Sample IDs into select
async function loadSampleIDs() {
    var sampleIDs = await knex('samples').select('sampleID');
    var option;
    for (var i = 0; sampleIDs[i] != null; i++) {
        option = document.createElement("option");
        option.text = sampleIDs[i].sampleID;
        option.id = sampleIDs[i].sampleID;
        document.getElementById("sampleIDSelect").appendChild(option);
    }

}


function getSampleID() {
    var e = document.getElementById("sampleIDSelect");
    var text = e.options[e.selectedIndex].text;
    console.log(text);
    return text;
}

async function loadSpeciesChart() {

    var sampleID = getSampleID();
    console.log(sampleID);
    var numSpecies = await knex.raw(`
    SELECT species, count(*) as count
    FROM counts
    WHERE sampleID = ?
    GROUP BY species
    `, sampleID);

    var str = JSON.parse(JSON.stringify(numSpecies));
    console.log(str);
    var labels = [];
    var data = [];
    for (var i = 0; i < numSpecies[0].length; i++) {
        console.log(numSpecies[0][i].species);
        console.log(numSpecies[0][i].count);
        data.push(numSpecies[0][i].count)
        labels.push(numSpecies[0][i].species);
    }

    console.log(labels, data);

    var ctx = document.getElementById("speciesChart").getContext('2d');
    
    if(speciesChart!=null){
        speciesChart.destroy();
        console.log("Destroyed");
    }
    speciesChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Species',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        }
    })
}

async function loadSizeChart() {

    var species = await knex.raw(`
    SELECT DISTINCT species
    FROM measures
    `);
    var results = [];
    for (var i = 0; i < species[0].length; i++) {
        results.push(await knex.raw(`
        select species, length
        FROM measures
        WHERE (length > 0) AND (species = ?)
        `, species[0][i].species));

    }
    var species1 = {
        labels: [],
        dataset: [],
    };
    var species2 = {
        labels: [],
        dataset: [],
    };

    for (var i = 0; i < results[0][0].length; i++) {
        // species1.dataset.push(results[0][0][i].length);
        // species1.labels.push(results[0][0][i].species);
        // species2.dataset.push(results[1][0][i].length);
        // species2.labels.push(results[1][0][i].species);
    }

    var ctx = document.getElementById("sizeChart").getContext('2d');

    if(sizeChart!=null){
        sizeChart.destroy();
    }
    sizeChart = new Chart(ctx, {
        type: 'scatter',
        // data: {
            // labels: species1.labels,
            // datasets: [{
            //     label: species1.labels[0],
            //     data: species1.dataset,
            //     backgroundColor: 'rgba(255, 99, 132, 0.2)',
            //     borderColor: 'rgba(255,99,132,1)',
            //     borderWidth: 1,
            //     lineTension: 0,
            // }, {
            //     label: species2.labels[0],
            //     data: species2.dataset,
            //     backgroundColor: 'rgba(54, 162, 235, 0.2)',
            //     borderColor: 'rgba(54, 162, 235, 1)',
            //     borderWidth: 1,
            //     lineTension: 0,
            // }]
        
        // }
        "data": {
            "labels":["January","February","March","April","May","June","July"],
            "datasets":[{
                "label":"My First Dataset",
                "data":[65,59,80,81,56,55,40],
                "fill":false,
                "backgroundColor":["rgba(255, 99, 132, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 205, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(201, 203, 207, 0.2)"
            ],
            "borderColor":[
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(201, 203, 207)"
            ],
            "borderWidth":1}]},
            "options":{
                "scales":{
                    "yAxes":[{
                        "ticks":{
                            "beginAtZero":true
                        }
                    }
                ]
            }
        }
    })
}

async function loadBarChart(){
    var ctx = document.getElementById("barChart").getContext('2d');
    var data = [1,2,3,4];
    var options = "";

    if(barChart!=null){
        barChart.destroy();
    }
    barChart =  new Chart(ctx, {
        "type":"bar",
        "data": {
            "labels":["January","February","March","April","May","June","July"],
            "datasets":[{
                "label":"My First Dataset",
                "data":[65,59,80,81,56,55,40],
                "fill":false,
                "backgroundColor":["rgba(255, 99, 132, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 205, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(201, 203, 207, 0.2)"
            ],
            "borderColor":[
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(201, 203, 207)"
            ],
            "borderWidth":1}]},
            "options":{
                "scales":{
                    "yAxes":[{
                        "ticks":{
                            "beginAtZero":true
                        }
                    }
                ]
            }
        }
    });
}

async function loadRadarChart(){
    var ctx = document.getElementById("radarChart").getContext('2d');
    var data = [1,2,3,4];
    var options = "";

    if(radarChart!=null){
        radarChart.destroy();
    }
    radarChart = new Chart(ctx,{"type":"radar","data":{"labels":["Eating","Drinking","Sleeping","Designing","Coding","Cycling","Running"],"datasets":[{"label":"My First Dataset","data":[65,59,90,81,56,55,40],"fill":true,"backgroundColor":"rgba(255, 99, 132, 0.2)","borderColor":"rgb(255, 99, 132)","pointBackgroundColor":"rgb(255, 99, 132)","pointBorderColor":"#fff","pointHoverBackgroundColor":"#fff","pointHoverBorderColor":"rgb(255, 99, 132)"},{"label":"My Second Dataset","data":[28,48,40,19,96,27,100],"fill":true,"backgroundColor":"rgba(54, 162, 235, 0.2)","borderColor":"rgb(54, 162, 235)","pointBackgroundColor":"rgb(54, 162, 235)","pointBorderColor":"#fff","pointHoverBackgroundColor":"#fff","pointHoverBorderColor":"rgb(54, 162, 235)"}]},"options":{"elements":{"line":{"tension":0,"borderWidth":3}}}});
}

function resizeCanvas() {
    canvas = document.querySelectorAll("canvas");
    console.log(canvas);
    canvas.forEach(function (item, index) {
        console.log(item, index);
        item.style.width = '100%';
        item.style.height = '100%';
        item.width = item.offsetWidth;
        item.height = item.offsetHeight;
    })

    loadDashboard();
}

function loadDashboard() {

    loadSpeciesChart();
    loadSizeChart();
    loadBarChart();
    loadRadarChart();
}



/************************************************************
        TABLES 
*************************************************************/
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
                        else if (table === "counts") {
                            loadCounts(table);
                        }
                        else if (table === "measures") {
                            loadMeasures(table);
                        }
                        else if (table === "samples") {
                            loadSamples(table);
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

function exportJoinedData(table1, table2) {
    
    dialog.showSaveDialog({
        filters: [{ name: 'csv', extensions: ['csv'] }
        ]
    }, function (fileName) {
        if (fileName === undefined) return;

        var sql = "SELECT * FROM ?? JOIN ?? ON ??.sampleID = ??.sampleID";
        connection.query(sql, [table1,table2,table1,table2], function (err, result, fields) {
            if (err) throw err;
            var header = [];
            console.log(result);
            console.log(fields);
            for (var i = 0; i < fields.length; i++) {
                console.log(fields[i]);
                //Sketchy way of doing it, should replace
                var flag = 0;
                for (var j = 0; j < header.length; j++) {
                    if (fields[i].name === header[j]) {
                        flag = 1;
                    }
                }
                if (flag === 0) {
                    header.push(fields[i].name);
                }

            }
            stringify(result, {
                formatters: {
                    date: function (value) {
                        return moment(value).format('YYYY-MM-DD');
                    }
                }
            }, function (err, output) {
                console.log(output);
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
    importData("counts");
}

function importSpecies() {
    importData("species");
}

function importMeasure() {
    importData("measures");
}

//Export MySql Count Table to csv file
function exportCount() {
    exportJoinedData("counts","samples");
}

//Export MySql Measure Table to csv file
function exportMeasure() {
    exportJoinedData("measures","samples");
}


//Receive call from another window
ipcRenderer.on('refreshTable', function (e, table) {
    console.log(table);
    if (table === "counts") {
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
    else if (table === "samples") {
        loadSamples(table, scrollTable);
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


//Load Info Browser Window 
function makeInfoWindow(btn, table) {
    var row = btn.parentNode.parentNode;
    var info = [];
    for (var i = 0; i < row.cells.length - 3; i++) {
        info.push(row.cells[i].innerHTML);
    }
    // var id = row.getElementsByClassName('code')[0].innerText;
    //maybe add a pause to reduce flashing
    ipcRenderer.send('showInfoWindow', table, info)
}

function showCountWindow(){
    ipcRenderer.send('showCountWindow');
}

function showMeasureWindow(){
    ipcRenderer.send('showMeasureWindow');
}

//Load Species page
function loadSpecies(table, callback) {
    var html = '<button class="btn btn-default" id="addSpeciesBtn" onclick="loadAddWindow(\'species\')">Add Species</button>';
    html += '<button class="btn btn-default" id="importSpecies" onclick="importSpecies()">Import Species List</button><br></br>'
    document.querySelector('#buttonSection').innerHTML = html;

    loadTable(table, callback);
}

//Load Count page
function loadCounts(table, callback) {
    var html = '<button class="btn btn-default" id="startCountBtn" onclick="showCountWindow()">Start Counting</button>'
    html += '<button class="btn btn-default" id="exportCountBtn" onclick="exportCount()">Export Data</button>'
    html += '<button class="btn btn-default" id="importCount" onclick="importCount()">Import Data</button><br></br>'
    document.querySelector('#buttonSection').innerHTML = html;

    loadTable(table, callback);

}

//Load Measures page
function loadMeasures(table, callback) {

    var html = '<button class="btn btn-default" id="startMeasureBtn" onclick="showMeasureWindow()">Start Measuring</button>'
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
            html += '<button type= "button" class="btn btn-default" value="Info" onclick="makeInfoWindow(this,\'' + table + '\')">Info</button>';
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

/************************************************************
        SETTINGS 
*************************************************************/
function loadDBUserInfo() {
    var x = document.getElementById("DBUserInfo");
    var y = document.getElementById("DBCreate");
    var z = document.getElementById("DBDelete");

    x.style.display = "block";
    y.style.display = "none";
    z.style.display = "none";

}
function loadDBCreate() {
    var x = document.getElementById("DBUserInfo");
    var y = document.getElementById("DBCreate");
    var z = document.getElementById("DBDelete");
    x.style.display = "none";
    y.style.display = "block";
    z.style.display = "none";
}
function loadDBDelete() {
    var x = document.getElementById("DBUserInfo");
    var y = document.getElementById("DBCreate");
    var z = document.getElementById("DBDelete");

    x.style.display = "none";
    y.style.display = "none";
    z.style.display = "block";

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
        $query = "CREATE TABLE counts (countID int(5) AUTO_INCREMENT PRIMARY KEY, species varchar(10), speciesType varchar(10), sampleID int(5))";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', win.id, err.message);
            }
            console.log("Query succesfully executed");
        })
        $query = "CREATE TABLE countTypes (countType varchar(10) PRIMARY KEY)";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', win.id, err.message);
            }
            console.log("Query succesfully executed");

        })
        var values = [['Cell'], ['Piece']];
        $query = "INSERT INTO `counttypes`(`countType`) VALUES ?";
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
        $query = "CREATE TABLE measures (measureID int(5) AUTO_INCREMENT PRIMARY KEY, species varchar(10), length float(10), width float(10), area float(10), volume float(10), sampleID int(5))";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', win.id, err.message);
            }
            console.log("Query succesfully executed");
        })
        $query = "CREATE TABLE species (speciesID int(3) PRIMARY KEY, speciesAbbrev varchar(8), speciesName varchar(20), depth int(11))";
        connection.query($query, function (err, result, fields) {
            if (err) {
                ipcRenderer.send('errorMessage', win.id, err.message);
            }
            console.log("Query succesfully executed");
        })
        $query = "CREATE TABLE samples (sampleID int(5) PRIMARY KEY, type varchar(5), lakeID int(4), date date, crewChief varchar(5), gearID int(3), stationID int(3), numTow int(3), towLength int(5), volume float(5))";
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


/************************************************************
        INITIALIZE 
*************************************************************/
async function init() {

    //Initial loadCount as default
    loadCounts('counts');

    //Load saved User Settings for Database Login
    document.getElementById("dbUser").value = settings.get('userInfo.user');
    document.getElementById("dbPassword").value = settings.get('userInfo.password');

    //Currently getting non passive event listener warning
    loadDBSelect();
    await loadSampleIDs();
    loadDashboard();
    document.getElementById("sampleIDSelect").addEventListener('change', loadDashboard);
    window.addEventListener('resize', resizeCanvas, false);

    
}

window.addEventListener('load', init, false);

//Should probably figure out where to put this
    // // Close the connection
    // connection.end(function () {
    //     console.log("close");
    //     // The connection has been closed
    // });
