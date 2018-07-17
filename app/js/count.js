var fabric = require('fabric').fabric;
var mysql = require('mysql');
var randomColor = require('randomcolor');
const electron = require('electron');
const { ipcRenderer } = electron;


var markerID;
var speciesOption = [];

var con = require('../js/config.js').localConnect();



//Should implement ability to choose colours in dashboard 
function random_rgba() {
    return randomColor(); //Random Color Library
}

function loadSampleIDs() {
    con.connect(function (err) {
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
        }
        var sql = "SELECT sampleID FROM samples";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            var option;
            for (var i = 0; result[i] != null; i++) {
                option = document.createElement("option");
                option.text = result[i].sampleID;
                option.id = result[i].sampleID;
                document.getElementById("sampleIDSelect").appendChild(option);
            }

        });
    });
}

function loadCountingTypes() {
    con.connect(function (err) {
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
        }
        var sql = "SELECT countType FROM counttypes";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            var option;
            for (var i = 0; result[i] != null; i++) {
                option = document.createElement("option");
                option.text = result[i].countType;
                option.id = result[i].countType;
                document.getElementById("typeSelect").appendChild(option);
            }

        });
    });
}

function loadSpeciesDropdown() {
    con.connect(function (err) {
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
        }
        var dropdown = document.getElementById("speciesSelect");
        var sql = "SELECT speciesName FROM species";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            console.log(result);
            var option;
            for (var i = 0; result[i] != null; i++) {
                option = document.createElement("option");
                option.text = result[i].speciesName;
                option.id = result[i].speciesName;
                option.fill = random_rgba();
                speciesOption.push(option);
                document.getElementById("speciesSelect").appendChild(option);
            }

        });
    });
}
//Doesn't delete from database
function deleteCircle() {
    canvas.remove(canvas.getActiveObject());
    subCount();
}
function clearCanvas(event) {
    canvas.clear();
}
function resizeCanvas() {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
    canvas.renderAll();
}
function getSpecies() {
    var e = document.getElementById("speciesSelect");
    // console.log(e);
    // console.log(e.selectedIndex);
    // console.log(e.options[e.selectedIndex]);
    var text = e.options[e.selectedIndex].value;
    return text;
}
function getType() {
    var e = document.getElementById("typeSelect");
    // console.log(e);
    // console.log(e.selectedIndex);
    // console.log(e.options[e.selectedIndex]);
    var text = e.options[e.selectedIndex].value;
    return text;
}
function getSampleID() {
    var e = document.getElementById("sampleIDSelect");
    var text = e.options[e.selectedIndex].value;
    return text;
}

function addCount() {
    con.connect(function (err) {
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
        }
        //Prevent DB insert if select is on default message
        var species = getSpecies();
        var sampleID = getSampleID();
        var type = getType();
        if (species != "" && sampleID != "") {
            var sql = "INSERT INTO counts SET species = ?, speciesType = ?, sampleID = ?";
            con.query(sql, [species, type, sampleID], function (err, result) {
                if (err) throw err;
                console.log(result);
                markerID = result.insertId;
                // console.log(markerID);
                console.log("after getCount");
                refreshCountTable();
            });
        }
    });
    getCount(); //Refresh displayed count total
}

//Calls main window to refresh the count table
function refreshCountTable() {
    ipcRenderer.send('refreshTable', "counts");
}


// function subCount() {
//     con.connect(function (err) {
//         // in case of error
//         if (err) {
//             console.log(err.code);
//             console.log(err.fatal);
//         }

//         // var subID = canvas.getActiveObject.id;
//         // console.log(subID);
//         var sql = "DELETE FROM count WHERE id = ?";
//         // con.query(sql, subID, function (err, result) {
//         //     if (err) throw err;
//         //     console.log(result);
//         // });
//     });
//     getCount();
// }

//Get number of entries of selected species
function getCount() {
    con.connect(function (err) {
        // in case of error
        if (err) {
            console.log(err.code);
            console.log(err.fatal);
        }
        var speciesDropdown = getSpecies();
        var sql = "SELECT species, COUNT(*) as total FROM counts GROUP BY species";
        con.query(sql, function (err, result, fields) {
            if (err) throw err;
            // console.log(result);
            // console.log(result[i]);
            if (result[i] === null) {
                document.getElementById("count").innerHTML = "0";
            }
            for (var i = 0; result[i] != null; i++) {
                // console.log(result[i].species);
                // console.log(speciesDropdown);
                console.log("Inside getCount");
                if (result[i].species === speciesDropdown) {
                    document.getElementById("count").innerHTML = result[i].total;
                    break;
                }
                else {
                    document.getElementById("count").innerHTML = "0";
                }
            }
        });
    });
    console.log("during getCount");
}
function drawDot() {
    var pointer = canvas.getPointer(event.e);
    var speciesColor;
    for (var i = 0; speciesOption[i] != null; i++) {
        if (getSpecies() === speciesOption[i].id)
            speciesColor = speciesOption[i].fill;

    }
    var circle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        fill: speciesColor,
        radius: 5,
        lockMovementX: true,
        lockMovementY: true,
        lockRotation: true,
        lockScalingFlip: true,
        lockScalingX: true,
        lockScalingY: true,
        lockUniScaling: true,
    });
    // let obj = { id: markerID };
    // console.log(markerID,obj.id);
    circle.setControlsVisibility({
        bl: false,
        br: false,
        tl: false,
        tr: false,
        mt: false,
        mb: false,
        ml: false,
        mr: false,
        mtr: false,
    });
    canvas.add(circle);

}

// function exportCount(){

// }

function init() {
    canvas = new fabric.Canvas('canvas');

    resizeCanvas();
    loadSpeciesDropdown();
    loadCountingTypes();
    loadSampleIDs();
    getCount();
    window.addEventListener('resize', resizeCanvas, false);
    document.getElementById("clear").addEventListener('click', clearCanvas, false);
    document.getElementById("delete").addEventListener('click', deleteCircle, false);
    document.getElementById("speciesSelect").addEventListener('change', getCount);
    canvas.on('mouse:dblclick', function (options) {
        //Alert user to input species
        if(document.getElementById("speciesSelect").value === "Select Species"){
            ipcRenderer.send('errorMessage2', "Must Select Species");
        }
        else{
            drawDot();
            addCount();
        }
        
    });
}

window.addEventListener('load', init, false);
