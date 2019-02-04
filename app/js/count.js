//JS logic for count window

//Include modules
var fabric = require('fabric').fabric;
var randomColor = require('randomcolor');
const electron = require('electron');
const { ipcRenderer } = electron;
var win = electron.remote.getCurrentWindow();
const settings = require('electron-settings');
console.log(win, win.id);

var markerID;
var speciesOption = [];

var knex = require('../js/config.js').connect();

//Refresh Count Dropdowns on Call from Main
//Receive call from another window
ipcRenderer.on('refreshCountDropdowns', function (e) {
    loadSubsampleIDs();
    loadSpeciesDropdown();
});

//Should implement ability to choose colours in dashboard 
function random_rgba() {
    return randomColor(); //Random Color Library
}

//Load dropdown of Sample IDs from database
async function loadSubsampleIDs() {
    //Clear options 
    removeOptions(document.getElementById("subsampleIDSelect"));

    var result = await knex('subsamples').select('subsampleID');
    var option;
    for (var i = 0; result[i] != null; i++) {
        option = document.createElement("option");
        option.text = result[i].subsampleID;
        option.id = result[i].subsampleID;
        document.getElementById("subsampleIDSelect").appendChild(option);
    }
}

//Load dropdown of Species from database
async function loadSpeciesDropdown() {
    //Clear options 
    removeOptions(document.getElementById("speciesSelect"));

    var dropdown = document.getElementById("speciesSelect");
    var result = await knex('species').select('speciesID', 'speciesAbbrev');

    var option;
    for (var i = 0; result[i] != null; i++) {
        option = document.createElement("option");
        option.text = result[i].speciesID + " " + result[i].speciesAbbrev;
        option.id = result[i].speciesID;
        option.fill = random_rgba();    //assigns random colours to each species
        option.stroke = random_rgba();
        speciesOption.push(option);
        document.getElementById("speciesSelect").appendChild(option);
    }

}

//Clear options from select dropdown
function removeOptions(selectBox) {
    console.log(selectBox);
    if (selectBox) {
        for (var i = selectBox.options.length - 1; i > 0; i--) {
            selectBox.remove(i);
        }
    }
}

//Doesn't delete from database
function deleteCircle() {
    canvas.remove(canvas.getActiveObject());
    subCount();
}
//Clears Canvas
function clearCanvas(event) {
    canvas.clear();
}
//Resize canvas to window size
function resizeCanvas() {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
    canvas.renderAll();
}

//Get id of selected species in dropdown
function getSpeciesID() {
    var e = document.getElementById("speciesSelect");
    // console.log(e);
    // console.log(e.selectedIndex);
    // console.log(e.options[e.selectedIndex]);
    var text = e.options[e.selectedIndex].id;
    return text;
}

//Get selected Sample Id in dropdown
function getSampleID() {
    var e = document.getElementById("sampleIDSelect");
    console.log(e);
    var text = e.options[e.selectedIndex].value;
    console.log(text)
    return text;
}


//Get selected Sample Id in dropdown
function getSubsampleID() {
    var e = document.getElementById("subsampleIDSelect");
    console.log(e);
    var text = e.options[e.selectedIndex].value;
    console.log(text)
    return text;
}

//Add Count to database
async function addCount() {

    //Prevent DB insert if select is on default message
    var speciesID = getSpeciesID();
    var subsampleID = getSubsampleID();

    var mult;
    if(document.getElementById("setNaturalUnit").checked){
        mult = document.getElementById("naturalUnitMultiplierInput").value;
    } 
    else{
        mult = 1; 
    }
    naturalUnitID = await knex('counts').max({maxID: 'countID'});
    
    //Insert multiple cells for natural unit
    for (var i = 0; i < mult; i++){
        var result = await knex('counts').insert({ 'speciesID': speciesID, 'naturalUnitID': naturalUnitID[0].maxID + 1, 'subsampleID': subsampleID });
    }

    markerID = result.insertId;
    refreshCountTable();


    setCounter(); //Refresh displayed count total
}

//Calls main window to refresh the count table
function refreshCountTable() {
    ipcRenderer.send('refreshTable', "counts");
}

function changeView() {

    if(document.getElementById("setNaturalUnit").checked) {
        document.querySelector('#naturalUnitMultiplierInput').style.display = 'initial';
        document.querySelector('#naturalUnitMultiplierInputLbl').style.display = 'initial';
    }
    else {
        document.querySelector('#naturalUnitMultiplierInput').style.display = 'none';
        document.querySelector('#naturalUnitMultiplierInputLbl').style.display = 'none';
    }
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
    return document.getElementById("count").innerHTML;
}


//Get number of entries of selected species
async function setCounter() {
    var speciesID = getSpeciesID();
    var subsampledID = getSubsampleID();
    var result = await knex('counts')
        .select('speciesID', knex.raw('count(*) as total'))
        .where('subsampleID', subsampledID)
        .groupBy('speciesID');

    console.log(result);
    
    

    // var result = await knex('species').select('speciesID', knex('species').count('*')).where('sampleID', sampledID).groupBy('speciesID');
    if (result.length == 0) {
        document.getElementById("count").innerHTML = "0";
    }

    // document.getElementById("count").innerHTML = result.;

    for (var i = 0; result[i] != null; i++) {
        // console.log(result[i].speciesID);
        // console.log(speciesID);
        // console.log("Inside setCounter");
        if (result[i].speciesID == speciesID) {
            document.getElementById("count").innerHTML = result[i].total;
            return;
        }
        else {
            document.getElementById("count").innerHTML = "0";
        }
    }
    console.log("during setCounter");
}

//Draws circle on canvas
function drawDot() {
    var pointer = canvas.getPointer(event.e);
    var speciesColor;
    for (var i = 0; speciesOption[i] != null; i++) {
        if (getSpeciesID() === speciesOption[i].id){
            speciesColor = speciesOption[i].fill;
            speciesStroke = speciesOption[i].stroke;
        }

    }
    var circle = new fabric.Circle({
        left: pointer.x - 6,    //Adjusted for radius of circle
        top: pointer.y - 6,
        fill: speciesColor,
        radius: 6,
        strokeWidth: 2,
        stroke: speciesStroke,
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

    //Removes additional Fabric js controls
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

    //Add to Canvas
    canvas.add(circle);
    
}

//Main Function
function init() {
    canvas = new fabric.Canvas('canvas');

    resizeCanvas(); //Resize canvas on load
    
    //Load all dropdowns and count
    loadSpeciesDropdown(); 
    loadSubsampleIDs();
    setCounter();
    changeView();

    //Add event listeners for resizing, buttons, and dropdowns
    window.addEventListener('resize', resizeCanvas, false);
    document.getElementById("clear").addEventListener('click', clearCanvas, false);
    document.getElementById("delete").addEventListener('click', deleteCircle, false);
    document.getElementById("speciesSelect").addEventListener('change', setCounter);
    document.getElementById("subsampleIDSelect").addEventListener('change', setCounter);
    document.getElementById("setNaturalUnit").addEventListener('click', changeView, false);

    //On Mouse Double Click, draw dot and add to database
    canvas.on('mouse:dblclick', function (options) {
        //Alert user to input species
        if (document.getElementById("subsampleIDSelect").value === "Select Subsample ID") {
            ipcRenderer.send('errorMessage', win.id, "Must Select Subsample");
        }
        else if (document.getElementById("speciesSelect").value === "Select Species") {
            ipcRenderer.send('errorMessage', win.id, "Must Select Species");
        }
        else {
            drawDot();
            addCount();
        }
        if (settings.get('stoppingRule.limit') == getCount()){
            console.log(settings.get('stoppingRule.limit'))
            ipcRenderer.send('errorMessage', win.id, "You have reached your stopping limit, finish this subsample and stop counting this species");
        }

    });
}

//Call Main Function on load
window.addEventListener('load', init, false);
