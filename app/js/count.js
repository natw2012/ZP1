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
    console.log(e);
    console.log(e.selectedIndex);
    console.log(e.options[e.selectedIndex]);
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

        var species = getSpecies();
        var sql = "INSERT INTO count SET species = ?";
        con.query(sql, species, function (err, result) {
            if (err) throw err;
            console.log(result);
            markerID = result.insertId;
            console.log(markerID);
        });
    });
    getCount();
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
function drawDot() {
    var pointer = canvas.getPointer(event.e);
    addCount();
    var circle = new fabric.Circle({
        left: pointer.x,
        top: pointer.y,
        fill: 'red',
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

function init() {
    canvas = new fabric.Canvas('canvas');

    resizeCanvas();
    loadSpeciesDropdown();
    getCount();
    document.getElementById("clear").addEventListener('click', clearCanvas, false);
    document.getElementById("delete").addEventListener('click', deleteCircle, false);
    document.getElementById("speciesSelect").addEventListener('change', getCount);
    canvas.on('mouse:dblclick', function (options) {
        drawDot();
    });
}

window.addEventListener('load', init, false);