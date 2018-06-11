var fabric = require('fabric').fabric;
var mysql = require('mysql');

var markerID;

var con = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: null,
    database: "ZP1"
});

function loadSpeciesDropdown() {
    con.connect(function (err) {
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
        }
        var dropdown = document.getElementById("speciesSelect");
        var sql = "SELECT name FROM species";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            var option;
            for (var i = 0; result[i] != null; i++) {
                option = document.createElement("option");
                option.text = result[i].name;
                option.id = result[i].name;
                document.getElementById("speciesSelect").appendChild(option);
            }
        });
    });
}
function getSpecies() {
    var e = document.getElementById("speciesSelect");
    var text = e.options[e.selectedIndex].value;
    return text;
}
function clearCanvas(event) {
    canvas.clear();
}
function resizeCanvas() {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
    canvas.renderAll();
}
function getCount() {
    con.connect(function (err) {
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
        }
        var speciesDropdown = getSpecies();
        var sql = "SELECT species, COUNT(*) as total FROM count GROUP BY species";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            for (var i = 0; result[i] != null; i++) {
                if (result[i].species == speciesDropdown) {
                    document.getElementById("count").innerHTML = result[i].total;
                }
            }
        });
    });
}

function addCount(cakkbacj)

async function newCount() {
    addCount()
        .then((value))
    drawDot();
}
function addCount() {
    return new Promise(function (resolve, reject) {
        var species = getSpecies();
        var sql = "INSERT INTO count SET species = ?";
        var returnValue = "";
        con.query(sql, function (error, rows) {
            if (error) {
                returnValue = "";
            }
            else {

            }
        })
    })
    con.connect(function (err) {
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
        }


        con.query(sql, species, function (err, result) {
            if (err) throw err;
            markerID = result.insertId;
            console.log(markerID);
        });
    });
    getCount();
}



function init() {
    canvas = new fabric.Canvas('canvas');

    resizeCanvas();
    loadSpeciesDropdown();
    getCount();
    document.getElementById("clear").addEventListener('click', clearCanvas, false);
    // document.getElementById("delete").addEventListener('click', deleteCircle, false);
    document.getElementById("speciesSelect").addEventListener('change', getCount);
    canvas.on('mouse:dblclick', function (options) {
        // drawDot();
    });
}

window.addEventListener('load', init, false);