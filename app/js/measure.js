//JS Logic for Measure Window

//Include modules
var fabric = require('fabric').fabric;
var randomColor = require('randomcolor');
const electron = require('electron');
const { ipcRenderer } = electron;
var win = electron.remote.getCurrentWindow();


var calibrationRatio;
var pixelLength;
var realLength;

var mode = "automatic"; //Default set to automatic

console.log(window.location.href);
var knex = require('../js/config.js').connect();

/************************************************************
        GENERAL FUNCTIONS 
*************************************************************/

//Refresh Measure Dropdowns on Call from Main
//Receive call from another window
ipcRenderer.on('refreshMeasureDropdowns', function (e) {
    loadSubsampleIDs();
    loadSpeciesDropdown();
    loadCustomFormulas();
    loadCalibrationSelect();
});

//Should implement ability to choose colours in dashboard 
function random_rgba() {
    return randomColor(); //Random Color Library
}

//Clear textboxes
function clearOutputs() {
    document.getElementById("lengthOutput").value = "";
    document.getElementById("widthOutput").value = "";
    document.getElementById("areaOutput").value = "";
    document.getElementById("totalLengthOutput").value = "";
    document.getElementById("totalWidthOutput").value = "";
    document.getElementById("totalAreaOutput").value = "";
}

//Clear Canvas
function clearCanvas(event) {
    canvas.clear();
    clearOutputs();
    changeView();
}

//Resize canvas to fit adjusted window
function resizeCanvas() {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
    canvas.renderAll();
}

//Delete selected object
function deleteObject() {
    canvas.remove(canvas.getActiveObject());
    changeView();
}

//Load Sample IDs into select
async function loadSubsampleIDs() {
    //Clear options 
    removeOptions(document.getElementById("subsampleIDSelect"));

    var option;
    var result = await knex('subsamples').select("subsampleID");
    console.log(result);
    for (var i = 0; result[i] != null; i++) {
        option = document.createElement("option");
        option.text = result[i].subsampleID;
        option.id = result[i].subsampleID;
        document.getElementById("subsampleIDSelect").appendChild(option);
    }
}

//Load dropdown of species
async function loadSpeciesDropdown() {
    //Clear options 
    removeOptions(document.getElementById("speciesSelect"));

    var option;
    var result = await knex('species').select("speciesID", "speciesAbbrev");
    console.log(result);
    for (var i = 0; result[i] != null; i++) {
        option = document.createElement("option");
        option.text = result[i].speciesID + " " + result[i].speciesAbbrev;
        option.id = result[i].speciesID;
        document.getElementById("speciesSelect").appendChild(option);
    }
}

//Load dropdown of custom formulas
async function loadCustomFormulas() {

    var option;
    var result = await knex('formulas').select("formulaName");
    console.log(result);
    for (var i = 0; result[i] != null; i++) {
        option = document.createElement("option");
        option.text = result[i].speciesName;
        option.id = result[i].speciesName;
        document.getElementById("formulaSelect").appendChild(option);
    }
}

//Maintains scaling of shape borders while changing shape size
function onObjectScaled(e) {
    //Eliminates caching error during scaling
    fabric.Object.prototype.objectCaching = false;
    // console.log(e); //Something here
    // console.log(e.target);
    var allShapes = e.target;
    allShapes.width = allShapes.scaleX * allShapes.width;
    allShapes.height = allShapes.scaleY * allShapes.height;
    allShapes.radius = allShapes.radius * allShapes.scaleX;
    allShapes.rx = allShapes.rx * allShapes.scaleX;
    allShapes.ry = allShapes.ry * allShapes.scaleY;
    allShapes.scaleX = 1;
    allShapes.scaleY = 1;

    var oneShape = e.target.canvas._objects;
    // console.log(oneShape);
    shape = canvas.getActiveObject();
    if (mode === "automatic") {
        if (shape.type === "line") {
            lineLength(shape);
        }
        else {
            console.log(shape);
            console.log(shape.type);
            calcArea(shape);
            calcVolume(shape);
        }
        calcTotalLength();
        calcTotalWidth();
        calcTotalArea();
        calcTotalVolume();
    }
    else if (mode === "manual") {
        manualModeOutput();
    }
    else if (mode === "lengthOnly") {
        lineLength(shape);
        calcTotalWidth();
        calcTotalLength();
    }

}

//Calculate length of all objects on canvas
function calcTotalLength() {
    var totalLength = 0;
    pixelLength = 0;
    realLength = 0;

    var objects = canvas.getObjects();
    objects.forEach(object => {
        // if(object.type === "line"){
        pixelLength = object.width;
        realLength = Number(calibrationRatio) * Number(pixelLength);

        totalLength = totalLength + realLength;
        console.log(totalLength);
        // }

    })
    document.getElementById("totalLengthOutput").value = (totalLength).toFixed(4);
}

//Calculate width of all lines on canvas
function calcTotalWidth() {
    var totalWidth = 0;
    pixelLength = 0;
    realLength = 0;

    var objects = canvas.getObjects();
    objects.forEach(object => {
        // if(object.type === "line"){
        pixelLength = object.height;
        realLength = Number(calibrationRatio) * Number(pixelLength);

        totalWidth = totalWidth + realLength;
        console.log(totalWidth);
        // }

    })
    document.getElementById("totalWidthOutput").value = (totalWidth).toFixed(4);
}

//Calculate area of all objects on canvas
function calcTotalArea() {
    var totalArea = 0;
    var maxLength = 0;
    var maxWidth = 0;
    var objects = canvas.getObjects();

    var activeLength = 0;
    var activeWidth = 0;

    objects.forEach(object => {
        totalArea = totalArea + calcArea(object);
        //If multiple shapes, output shows largest length and width
        // if (object.width > maxLength) {
        //     maxLength = object.width;
        // }
        // if (object.height > maxWidth) {
        //     maxWidth = object.height;
        // }
    });

    document.getElementById("totalAreaOutput").value = (totalArea).toFixed(2);
}

//Calculate volume of all objects on canavas
function calcTotalVolume(){
    var totalVolume = 0;
    var objects = canvas.getObjects();

    objects.forEach(async(object) => {
        totalVolume = totalVolume + await calcVolume(object);
    });
    console.log(totalVolume);
    document.getElementById("totalVolumeOutput").value = (totalVolume).toFixed(2);
}

//Calculate the pixel to measurement ratio eg. cm/pix
async function pixelToDistanceRatio() {

    if (!document.getElementById("knownDistanceTextBox").value) {
        ipcRenderer.send('errorMessage', win.id, "Please enter a known distance to calibrate");
        document.getElementById("knownDistanceTextBox").focus();
    }
    else if (!canvas.getActiveObject()) {
        ipcRenderer.send('errorMessage', win.id, "Please draw and select line object used to measure");
        document.getElementById("shapeSelect").focus();
    }
    else {
        try {
            calibrationRatio = Number(document.getElementById("knownDistanceTextBox").value) / canvas.getActiveObject().width;
            document.getElementById("pdRatio").value = calibrationRatio.toFixed(4);
            clearCanvas();
            clearOutputs();
        }
        catch (err) {
            // ipcRenderer.send('errorMessage', err.message);
        }
    }


}

function getActiveLengthWidth() {
    var activeObject = canvas.getActiveObject();
    activeLength = activeObject.width;
    activeWidth = activeObject.height;

    console.log(activeLength);
    document.getElementById("lengthOutput").value = (activeLength * calibrationRatio).toFixed(4);
    document.getElementById("widthOutput").value = (activeWidth * calibrationRatio).toFixed(4);
}

//Find pixel length of beginning and end position of line, convert to real length by ratio and output
function lineLength(line) {
    pixelLength = line.width;
    realLength = Number(calibrationRatio) * Number(pixelLength);
    console.log(pixelLength, realLength);
    document.getElementById("lengthOutput").value = realLength.toFixed(4);
}

//Get depth from database or manually set depth
async function getDepth(){
    try {
        var species = getSpecies();
        //get species depth
        var result = await knex('species').select("depth").where('speciesID', species);
        console.log("result");

        var depth;
        var setting = getSettings();
        if(setting.manualDepth){
            depth = document.getElementById("manualDepthInput").value;
        } 
        else{
            depth = result[0].depth;
        }
        console.log(depth)
        return depth.valueOf();
    } catch (error) {
        ipcRenderer.send('errorMessage', win.id, "Please select species");
    }
    
}
//Find shape input
function getShape() {
    var e = document.getElementById("shapeSelect");
    var text = e.options[e.selectedIndex].text;
    console.log(text);
    return text;
}

function getSpecies() {
    var e = document.getElementById("speciesSelect");
    var text = e.options[e.selectedIndex].id;
    console.log(text);
    return text;
    
}

function getCalibration() {
    var e = document.getElementById("calibrationSelect");
    var text = e.options[e.selectedIndex].id;
    console.log(text);
    return text;
}

function getSettings() {
    var setting = {
        lengthOnly: document.getElementById("lengthOnly").checked,
        manual: document.getElementById("setManual").checked,
        customFormula: document.getElementById("customFormula").checked,
        manualDepth: document.getElementById("setManualDepth").checked,
        naturalUnit: document.getElementById("setNaturalUnit").checked
    }

    console.log(setting);
    return setting;

}

function unselect() {
    document.getElementById("lengthOutput").value = "";
    document.getElementById("widthOutput").value = "";
    document.getElementById("areaOutput").value = "";
    document.getElementById("volumeOutput").value = "";
}
function select(e) {
    var object = canvas.getActiveObject();
    onObjectScaled(e);
    getActiveLengthWidth();
    // console.log("TEst");
    // console.log(e);
    // onObjectScaled(e);
}

function updated(e) {
    getActiveLengthWidth();
}

async function submit() {
    var species = getSpecies();
    var e = document.getElementById("speciesSelect");

    //Must have proper input
    if (!calibrationRatio) {
        ipcRenderer.send('errorMessage', win.id, "Please enter known distance to calibrate");
    }
    else if (!document.getElementById("subsampleIDSelect").value) {
        ipcRenderer.send('errorMessage', win.id, "Please select subsample ID");
        document.getElementById("subsampleIDSelect").focus();
    }
    else if (!document.getElementById("speciesSelect").value) {
        ipcRenderer.send('errorMessage', win.id, "Please select species");
        document.getElementById("speciesSelect").focus();
    }
    else if (!document.getElementById("lengthOutput").value) {
        ipcRenderer.send('errorMessage', win.id, "Please draw/select shape");
        document.getElementById("shapeSelect").focus();
    }
    //Should clean up this logic
    else if ((mode === "manual" || mode === "manual-custom") && document.getElementById("shapeSelectManual").value === "Select Shape:") {
        ipcRenderer.send('errorMessage', win.id, "Please select shape");
        document.getElementById("shapeSelectManual").focus();
    }
    else {

        var setting = getSettings();
        var mult;
        if(setting.naturalUnit){
            mult = document.getElementById("naturalUnitMultiplierInput").value;
        } 
        else{
            mult = 1; 
        }

        naturalUnitID = await knex('measures').max({maxID: 'measureID'});
        let measure = {
            speciesID: species,
            length: document.getElementById("lengthOutput").value,
            width: document.getElementById("widthOutput").value,
            area: document.getElementById("totalAreaOutput").value,
            volume: document.getElementById("totalVolumeOutput").value,
            subsampleID: document.getElementById("subsampleIDSelect").value,
            naturalUnitID: naturalUnitID[0].maxID + 1
        }

        

        for (var i = 0; i < mult; i++){
            //Insert measurement into db
            var result = await knex('measures').insert(measure);
            console.log(result);
            refreshMeasureTable();
        }
        

        if (document.getElementById("clearOnEnter").checked) {
            clearOutputs();
            clearCanvas();
        }
    }
}

//Calls main window to refresh the count table
function refreshMeasureTable() {
    ipcRenderer.send('refreshTable', "measures");
}

/************************************************************
        AUTOMATIC MODE FUNCTIONS 
*************************************************************/


//Calls area calc function depending on shape base
function calcArea(obj) {
    var type = obj.type;
    console.log(type);
    if (type === "rect") {
        return rectArea(obj);
    }
    else if (type === "circle") {
        return circleArea(obj);
    }
    else if (type === "triangle") {
        return triangleArea(obj);
    }
    else if (type === "line") {
        return 0;
    }
    else if (type === "ellipse") {
        return ellipseArea(obj);
    }
}

//Calc volume depending on shape
function calcVolume(obj){
    var type = obj.type;
    var colour = obj.stroke;
    //3D Ellipse
    if (type === "ellipse" && colour === "blue") {
        return ellipsoidVolume(obj);
    }
    //Cylinder
    else if (type === "ellipse" && colour === "red") {
        return cylinderVolume(obj);
    }
    //Cone
    else if (type === "ellipse" && colour === "green") {
        return coneVolume(obj);
    }
    //Pyramid
    else if (type === "rect" && colour === "blue") {
        return pyramidVolume(obj);
    }
    //Cuboid
    else if (type === "rect" && colour === "red") {
        return cuboidVolume(obj);
    }
    //Tetradron
    else if (type === "triangle" && colour === "blue") {
        return tetrahedronVolume(obj);
    }
    //Prism
    else if (type === "triangle" && colour === "red") {
        return prismVolume(obj);
    }

}

//Calc Area of Rectangle
function rectArea(rect) {
    console.log("rect");
    console.log(rect);
    //Slight measuring issue with rect.width = inside perimeter while line.width = outside
    var area = rect.width * rect.height * Math.pow(calibrationRatio, 2);
    document.getElementById("lengthOutput").value = (rect.width * calibrationRatio).toFixed(2);
    document.getElementById("widthOutput").value = (rect.height * calibrationRatio).toFixed(2);
    document.getElementById("areaOutput").value = area.toFixed(2);
    return area;
}
//Calc Area of Circle
function circleArea(circ) {
    console.log("circle");
    var area = Math.PI * Math.pow(circ.radius, 2) * Math.pow(calibrationRatio, 2);
    document.getElementById("lengthOutput").value = (circ.width * calibrationRatio).toFixed(2);
    document.getElementById("widthOutput").value = (circ.height * calibrationRatio).toFixed(2);
    document.getElementById("areaOutput").value = area.toFixed(2);
    return area;
}
//Calc Area of Triangle
function triangleArea(tri) {
    var area = tri.width * tri.height / 2 * Math.pow(calibrationRatio, 2);
    document.getElementById("lengthOutput").value = (tri.width * calibrationRatio).toFixed(2);
    document.getElementById("widthOutput").value = (tri.height * calibrationRatio).toFixed(2);
    document.getElementById("areaOutput").value = area.toFixed(2);
    return area;
}
//Calc Area of Ellipse
function ellipseArea(el) {
    var area = el.rx * el.ry * Math.PI * Math.pow(calibrationRatio, 2);
    document.getElementById("lengthOutput").value = (el.width * calibrationRatio).toFixed(2);
    document.getElementById("widthOutput").value = (el.height * calibrationRatio).toFixed(2);
    document.getElementById("areaOutput").value = area.toFixed(2);
    return area;
}
//Calc Volume of 3D Ellipse beware of rx being depth
function ellipsoidVolume(el){
    var volume = 4/3 * el.rx * el.rx * el.ry * Math.PI * Math.pow(calibrationRatio, 2);
    document.getElementById("volumeOutput").value = volume.toFixed(2);
    return volume;
}
//Calc Volume of Cylinder
async function cylinderVolume(el){
    var depth = await getDepth();
    console.log(typeof depth)
    console.log(depth)
    var volume = depth * el.rx * el.ry * Math.PI * Math.pow(calibrationRatio, 2);
    document.getElementById("volumeOutput").value = volume.toFixed(2);
    return volume;
}
//Calc Volume of Cone
async function coneVolume(el){
    var depth = await getDepth();
    var volume = 1/3 * depth * el.rx * el.ry * Math.PI * Math.pow(calibrationRatio, 2);
    document.getElementById("volumeOutput").value = volume.toFixed(2);
    return volume;
}
//Calc Volume of Cuboid
async function cuboidVolume(rect){
    var depth = await getDepth();
    var volume = depth * rect.width * rect.height * Math.pow(calibrationRatio, 2);
    document.getElementById("volumeOutput").value = volume.toFixed(2);
    return volume;
}
//Calc Volume of Pyramid
async function pyramidVolume(rect){
    var depth = await getDepth();
    var volume = 1/3 * depth * rect.width * rect.height * Math.pow(calibrationRatio, 2);
    document.getElementById("volumeOutput").value = volume.toFixed(2);
    return volume;
}
//Calc Volume of Tetrahedron
async function tetrahedronVolume(tri){
    var depth = await getDepth();
    var volume = depth * tri.width * tri.height / (6*Math.sqrt(2)) * Math.pow(calibrationRatio, 2);
    document.getElementById("volumeOutput").value = volume.toFixed(2);
    return volume;
}
//Calc Volume of Prism
async function prismVolume(tri){
    var depth = await getDepth();
    var volume = depth * tri.width * tri.height / 2 * Math.pow(calibrationRatio, 2);
    document.getElementById("volumeOutput").value = volume.toFixed(2);
    return volume;
}

function drawLine() {
    var line = new fabric.Line([100, 100, 200, 100], {
        left: 100,
        top: 100,
        stroke: 'red',
        fill: 'red',
        strokeWidth: 5,
        width: 100,
    });
    //Get's rid of resizing boxes
    line.setControlsVisibility({
        bl: false,
        br: false,
        tl: false,
        tr: false,
        mt: false,
        mb: false,
    });

    canvas.add(line);
}

function drawRect(colour) {
    var rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: colour,
        strokeWidth: 3,
        width: 100,
        height: 100,
    });
    canvas.add(rect);
}

function drawTriangle(colour) {
    var triangle = new fabric.Triangle({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: colour,
        strokeWidth: 3,
        width: 100,
        height: 100,
    });
    canvas.add(triangle);
}
function drawEllipse(colour) {
    var ellipse = new fabric.Ellipse({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: colour,
        strokeWidth: 3,
        rx: 100,
        ry: 50,
    });
    canvas.add(ellipse);
}
function drawCircle(colour) {
    var circle = new fabric.Circle({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: colour,
        strokeWidth: 3,
        radius: 100
    });
    canvas.add(circle);
}

//Draw controller 
function draw() {
    var shape = getShape();
    // shape = "Line";
    if (shape === "Line") {
        drawLine();
    }
    else if (shape === "Triangle") {
        drawTriangle('red');
    }
    else if (shape === "Rectangle") {
        drawRect('red');
    }
    else if (shape === "Ellipse") {
        drawEllipse('red');
    }
    else if (shape === "Circle") {
        drawCircle('red');
    }
    else if (shape === "Ellipsoid") {
        drawEllipse('blue');
    }
    else if (shape === "Cylinder") {
        drawEllipse('red');
    }
    else if (shape === "Cone") {
        drawEllipse('green');
    }
    else if (shape === "Cuboid") {
        drawRect('red');
    }
    else if (shape === "Pyramid") {
        drawRect('blue');
    }
    else if (shape === "Tetrahedron") {
        drawTriangle('blue');
    }
    else if (shape === "Prism") {
        drawTriangle('red');
    }
    changeView();
    calcTotalLength();
    calcTotalWidth();
    calcTotalArea();
    //Select newly created 
    canvas.setActiveObject(canvas.item(canvas.getObjects().length - 1));
}

/************************************************************
        MANUAL MODE FUNCTIONS 
*************************************************************/

function manualMode() {
    var lengthLine = new fabric.Line([100, 100, 200, 100], {
        id: 'lengthLine',
        left: 100,
        top: 100,
        stroke: 'red',
        fill: 'red',
        strokeWidth: 5,
        width: 100,
    });
    var widthLine = new fabric.Line([100, 100, 200, 100], {
        id: 'widthLine',
        left: 100,
        top: 100,
        stroke: 'blue',
        fill: 'blue',
        strokeWidth: 5,
        width: 100,
        angle: 90,
    });
    //Get's rid of resizing boxes
    lengthLine.setControlsVisibility({
        bl: false,
        br: false,
        tl: false,
        tr: false,
        mt: false,
        mb: false,
    });
    widthLine.setControlsVisibility({
        bl: false,
        br: false,
        tl: false,
        tr: false,
        mt: false,
        mb: false,
    });
    canvas.add(lengthLine);
    canvas.add(widthLine);
}

async function manualModeOutput() {
    var lengthLine;
    var widthLine;

    await canvas.getObjects().forEach(function (o) {
        if (o.id === "lengthLine") {
            lengthLine = o.width;
        }
        else if (o.id === "widthLine") {
            widthLine = o.width;
        }
    });

    var realLength = Number(calibrationRatio) * Number(lengthLine);
    document.getElementById("lengthOutput").value = realLength.toFixed(2);
    var realWidth = Number(calibrationRatio) * Number(widthLine);
    document.getElementById("widthOutput").value = realWidth.toFixed(2);

    var shape = document.getElementById("shapeSelectManual").value;
    var area;

    if (shape === "Rectangle") {
        //Slight measuring issue with rect.width = inside perimeter while line.width = outside
        area = lengthLine * widthLine * Math.pow(calibrationRatio, 2);
    }
    else if (shape === "Triangle") {
        area = lengthLine * widthLine / 2 * Math.pow(calibrationRatio, 2);
    }
    else if (shape === "Ellipse") {
        area = lengthLine / 2 * widthLine / 2 * Math.PI * Math.pow(calibrationRatio, 2);
    }
    else {
        area = 0;
    }
    document.getElementById("areaOutput").value = area.toFixed(2);
    document.getElementById("totalAreaOutput").value = area.toFixed(2);
}

function changeView() {
    var setting = getSettings();


    //If LengthOnly is checked
    if (setting.lengthOnly) {
        mode = "lengthOnly";
    }
    else if (setting.manual) {
        mode = "manual";
        if (setting.customFormula) {
            mode = "manual-custom";
        }
    }
    else {
        mode = "automatic";
    }

    if(setting.manualDepth) {
        document.querySelector('#manualDepthInput').style.display = 'initial';
        document.querySelector('#manualDepthInputLbl').style.display = 'initial';
    }
    else {
        document.querySelector('#manualDepthInput').style.display = 'none';
        document.querySelector('#manualDepthInputLbl').style.display = 'none';
    }

    if(setting.naturalUnit) {
        document.querySelector('#naturalUnitMultiplierInput').style.display = 'initial';
        document.querySelector('#naturalUnitMultiplierInputLbl').style.display = 'initial';
    }
    else {
        document.querySelector('#naturalUnitMultiplierInput').style.display = 'none';
        document.querySelector('#naturalUnitMultiplierInputLbl').style.display = 'none';
    }

    console.log(mode);
    
    //Display all values
    if (mode === "automatic") {
        console.log(canvas.getObjects().size);
        console.log(canvas.getObjects().length);
        if (canvas.getObjects().length > 1) {
            document.querySelector('#totalLengthOutputLbl').style.display = 'initial';
            document.querySelector('#totalLengthOutput').style.display = 'initial';
            document.querySelector('#totalLengthOutputLbl2').style.display = 'initial';
            document.querySelector('#totalWidthOutputLbl').style.display = 'initial';
            document.querySelector('#totalWidthOutput').style.display = 'initial';
            document.querySelector('#totalWidthOutputLbl2').style.display = 'initial';
            document.querySelector('#totalAreaOutputLbl').style.display = 'initial';
            document.querySelector('#totalAreaOutput').style.display = 'initial';
            document.querySelector('#totalAreaOutputLbl2').style.display = 'initial';
            document.querySelector('#totalVolumeOutputLbl').style.display = 'initial';
            document.querySelector('#totalVolumeOutput').style.display = 'initial';
            document.querySelector('#totalVolumeOutputLbl2').style.display = 'initial';
        }
        else {
            document.querySelector('#totalLengthOutputLbl').style.display = 'none';
            document.querySelector('#totalLengthOutput').style.display = 'none';
            document.querySelector('#totalLengthOutputLbl2').style.display = 'none';
            document.querySelector('#totalWidthOutputLbl').style.display = 'none';
            document.querySelector('#totalWidthOutput').style.display = 'none';
            document.querySelector('#totalWidthOutputLbl2').style.display = 'none';
            document.querySelector('#totalAreaOutputLbl').style.display = 'none';
            document.querySelector('#totalAreaOutput').style.display = 'none';
            document.querySelector('#totalAreaOutputLbl2').style.display = 'none';
            document.querySelector('#totalVolumeOutputLbl').style.display = 'none';
            document.querySelector('#totalVolumeOutput').style.display = 'none';
            document.querySelector('#totalVolumeOutputLbl2').style.display = 'none';
        }
        document.querySelector('#areaOutputLbl').style.display = 'initial';
        document.querySelector('#areaOutput').style.display = 'initial';
        document.querySelector('#areaOutputLbl2').style.display = 'initial';
        document.querySelector('#volumeOutputLbl').style.display = 'initial';
        document.querySelector('#volumeOutput').style.display = 'initial';
        document.querySelector('#volumeOutputLbl2').style.display = 'initial';

        document.querySelector('#shapeSelect').disabled = false;
        document.querySelector('#setManual').disabled = false;
        document.querySelector('#customFormulaLbl').style.display = 'none';
        document.querySelector('#customFormula').style.display = 'none';
        document.querySelector('#customFormula').checked = false;
        document.querySelector('#draw-tool-bar').style.display = 'block';
        document.querySelector('#manual-tool-bar').style.display = 'none';
        document.querySelector('#manual-custom-tool-bar').style.display = 'none';
        document.querySelector('#clearBtn').style.display = 'initial';
        document.querySelector('#deleteObjectBtn').style.display = 'initial';
    }
    else if (mode === "manual" || mode === "manual-custom") {
        document.querySelector('#customFormulaLbl').style.display = 'initial';
        document.querySelector('#customFormula').style.display = 'initial';
        document.querySelector('#draw-tool-bar').style.display = 'none';
        document.querySelector('#clearBtn').style.display = 'none';
        document.querySelector('#deleteObjectBtn').style.display = 'none';
        manualMode();

        if (mode === "manual-custom") {
            document.querySelector('#manual-tool-bar').style.display = 'none';
            document.querySelector('#manual-custom-tool-bar').style.display = 'block';
        }
        else {
            document.querySelector('#manual-tool-bar').style.display = 'block';
            document.querySelector('#manual-custom-tool-bar').style.display = 'none';
        }
    }
    //Display only line option
    else if (mode === "lengthOnly") {
        document.querySelector('#areaOutputLbl').style.display = 'none';
        document.querySelector('#areaOutput').style.display = 'none';
        document.querySelector('#areaOutputLbl2').style.display = 'none';
        document.querySelector('#totalAreaOutputLbl').style.display = 'none';
        document.querySelector('#totalAreaOutput').style.display = 'none';
        document.querySelector('#totalAreaOutputLbl2').style.display = 'none';
        document.querySelector('#shapeSelect').selectedIndex = 0;
        document.querySelector('#shapeSelect').disabled = true;
        document.querySelector('#setManual').checked = false;
        document.querySelector('#setManual').disabled = true;
    }
}



//Calibrate and create shape for testing 
function devTest() {
    document.getElementById("knownDistanceTextBox").value = 10;
    drawLine();
    canvas.setActiveObject(canvas.item(0));
    pixelToDistanceRatio();
    drawRect();
    canvas.setActiveObject(canvas.item(0));
    document.getElementById("subsampleIDSelect").selectedIndex = 1;
    document.getElementById("speciesSelect").selectedIndex = 1;

}

/************************************************************
        CALIBRATION FUNCTIONS 
*************************************************************/

//Load Calibrations Dropdown
async function loadCalibrationSelect() {
    var result = await knex('calibrations').select("calibrationID", "calibrationName");
    console.log(result);

    //Clear options 
    removeOptions(document.getElementById("calibrationSelect"));

    var option;
    for (var i = 0; result[i] != null; i++) {
        option = document.createElement("option");
        option.text = result[i].calibrationName;
        option.id = result[i].calibrationID;
        document.getElementById("calibrationSelect").appendChild(option);
    }
}

//Display inputs for new calibration and draw measuring line
function newCalibration() {
    document.querySelector('#newCalibrationBtn').style.display = 'none';
    document.querySelector('#newCalibrationDiv').style.display = 'initial';
    clearCanvas();
    drawLine();
    canvas.setActiveObject(canvas.item(canvas.getObjects().length - 1));
    document.getElementById("knownDistanceTextBox").focus();
}

//Save new calibration into database, reload dropdown, clear canvas
async function saveCalibration() {
    document.querySelector('#newCalibrationBtn').style.display = 'initial';
    document.querySelector('#newCalibrationDiv').style.display = 'none';

    pixelToDistanceRatio();
    pdRatio = document.getElementById("pdRatio").value;

    name = document.getElementById("newCalibrationTextBox").value;
    var result = await knex('calibrations').insert({ calibrationName: name, pixelToDistanceRatio: pdRatio });
    loadCalibrationSelect();
    clearCanvas();
}

//Save new calibration into database, reload dropdown, clear canvas
async function calibrate() {
    document.querySelector('#newCalibrationBtn').style.display = 'initial';
    document.querySelector('#newCalibrationDiv').style.display = 'none';

    pixelToDistanceRatio();
    loadCalibrationSelect();
    clearCanvas();
}

//Cancel Calibration
function cancelCalibration() {
    document.querySelector('#newCalibrationBtn').style.display = 'initial';
    document.querySelector('#newCalibrationDiv').style.display = 'none';
    clearCanvas();
}

//Using dropdown, sets calibration setting
async function setCalibrationFromDB() {
    calibrationID = getCalibration();
    var result = await knex('calibrations').select('pixelToDistanceRatio').where('calibrationID', calibrationID);
    console.log(result[0].pixelToDistanceRatio);
    calibrationRatio = result[0].pixelToDistanceRatio;
    document.getElementById("pdRatio").value = calibrationRatio;
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

//Initialize
function init() {
    canvas = new fabric.Canvas('canvas');
    resizeCanvas();
    loadSubsampleIDs();
    loadSpeciesDropdown();
    loadCustomFormulas();
    loadCalibrationSelect()
    changeView();

    canvas.on('object:scaling', onObjectScaled);
    canvas.on('selection:cleared', unselect);
    canvas.on('selection:created', select);
    canvas.on('selection:updated', updated);
    document.getElementById("clearBtn").addEventListener('click', clearCanvas, false);
    document.getElementById("drawShapeBtn").addEventListener('click', draw, false);
    window.addEventListener('resize', resizeCanvas, false);
    document.getElementById("enterBtn").addEventListener('click', submit, false);
    document.getElementById("newCalibrationBtn").addEventListener('click', newCalibration, false);
    document.getElementById("saveCalibrationBtn").addEventListener('click', saveCalibration, false);
    document.getElementById("cancelCalibrationBtn").addEventListener('click', cancelCalibration, false);
    document.getElementById("calibrationSelect").addEventListener('change', setCalibrationFromDB, false);
    document.getElementById("calibrateBtn").addEventListener('click', calibrate, false);
    document.getElementById("pdRatio").innerHTML = "Need to Calibrate";
    document.getElementById("lengthOnly").addEventListener('click', changeView, false);
    document.getElementById("setManual").addEventListener('click', changeView, false);
    document.getElementById("customFormula").addEventListener('click', changeView, false);
    document.getElementById("setManualDepth").addEventListener('click', changeView, false);
    document.getElementById("setNaturalUnit").addEventListener('click', changeView, false);
    document.getElementById("lengthOnly").addEventListener('click', clearCanvas, false);
    document.getElementById("setManual").addEventListener('click', clearCanvas, false);
    document.getElementById("customFormula").addEventListener('click', clearCanvas, false);
    document.getElementById("setManualDepth").addEventListener('click', clearCanvas, false);

    document.getElementById("deleteObjectBtn").addEventListener('click', deleteObject, false);
    document.getElementById("shapeSelectManual").addEventListener('change', manualModeOutput, false);

    // document.getElementById("devBtn").addEventListener('click', devTest, false);
}

window.addEventListener('load', init, false);