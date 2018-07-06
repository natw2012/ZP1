var fabric = require('fabric').fabric;
var randomColor = require('randomcolor');
const electron = require('electron');
const { ipcRenderer } = electron;


var calibrationRatio;
var pixelLength;
var realLength;
var speciesOption = [];

console.log(window.location.href);
var con = require('./js/config.js').localConnect();

//Should implement ability to choose colours in dashboard 
function random_rgba() {
    return randomColor(); //Random Color Library
}

function clearOutputs() {
    document.getElementById("lengthOutput").value = "";
    document.getElementById("widthOutput").value = "";
    document.getElementById("areaOutput").value = "";
    document.getElementById("totalAreaOutput").value = "";
}

//Clear Canvas
function clearCanvas(event) {
    canvas.clear();
    clearOutputs();
}

//Resize canvas to fit adjusted window
function resizeCanvas() {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
    canvas.renderAll();
}

//Load dropdown of species
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
                option.fill = random_rgba();
                speciesOption.push(option);
                document.getElementById("speciesSelect").appendChild(option);
            }

        });
    });
}

//Maintains scaling of shape borders while changing shape size
function onObjectScaled(e) {
    //Eliminates caching error during scaling
    fabric.Object.prototype.objectCaching = false;
    console.log(e); //Something here
    console.log(e.target);
    var shape = e.target;
    shape.width = shape.scaleX * shape.width;
    shape.height = shape.scaleY * shape.height;
    shape.radius = shape.radius * shape.scaleX;
    shape.rx = shape.rx * shape.scaleX;
    shape.ry = shape.ry * shape.scaleY;
    shape.scaleX = 1;
    shape.scaleY = 1;

    if (shape.type === "line") {
        lineLength(shape);
    }
    else {
        console.log(shape);
        calcArea(shape);
    }
    calcTotalArea();
}

//Calculate area of all objects on canvas
function calcTotalArea() {
    var totalArea = 0;
    var objects = canvas.getObjects();
    objects.forEach(object => {
        totalArea = totalArea + calcArea(object);
    });
    document.getElementById("totalAreaOutput").value = totalArea.toFixed(4);
}

//Calls area calc function depending on shape
function calcArea(obj) {
    var type = obj.type;

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

//Calc Area of Rectangle
function rectArea(rect) {
    console.log("rect");
    //Slight measuring issue with rect.width = inside perimeter while line.width = outside
    var area = rect.width * rect.height * Math.pow(calibrationRatio, 2);
    document.getElementById("lengthOutput").value = (rect.width * calibrationRatio).toFixed(4);
    document.getElementById("widthOutput").value = (rect.height * calibrationRatio).toFixed(4);
    document.getElementById("areaOutput").value = area.toFixed(4);
    return area;
}
//Calc Area of Circle
function circleArea(circ) {
    console.log("circle");
    var area = Math.PI * Math.pow(circ.radius, 2) * Math.pow(calibrationRatio, 2);
    document.getElementById("lengthOutput").value = (circ.width * calibrationRatio).toFixed(4);
    document.getElementById("widthOutput").value = (circ.height * calibrationRatio).toFixed(4);
    document.getElementById("areaOutput").value = area.toFixed(4);
    return area;
}
//Calc Area of Triangle
function triangleArea(tri) {
    var area = tri.width * tri.height / 2 * Math.pow(calibrationRatio, 2);
    document.getElementById("lengthOutput").value = (tri.width * calibrationRatio).toFixed(4);
    document.getElementById("widthOutput").value = (tri.height * calibrationRatio).toFixed(4);
    document.getElementById("areaOutput").value = area.toFixed(4);
    return area;
}
//Calc Area of Ellipse
function ellipseArea(el) {
    var area = el.rx * el.ry * Math.PI * Math.pow(calibrationRatio, 2);
    document.getElementById("lengthOutput").value = (el.width * calibrationRatio).toFixed(4);
    document.getElementById("widthOutput").value = (el.height * calibrationRatio).toFixed(4);
    document.getElementById("areaOutput").value = area.toFixed(4);
    return area;
}

//Calculate the pixel to measurement ratio eg. cm/pix
function pixelToDistanceRatio() {
    if (!document.getElementById("calibrateTextBox").value) {
        ipcRenderer.send('errorMessage2', "Please enter a known distance to calibrate");
    }
    else if (!canvas.getActiveObject()) {
        ipcRenderer.send('errorMessage2', "Please draw and select line object used to measure");
    }
    else {
        try {
            calibrationRatio = Number(document.getElementById("calibrateTextBox").value) / canvas.getActiveObject().width;
            document.getElementById("pdRatio").value = calibrationRatio.toFixed(4);
            clearCanvas();
            clearOutputs();
        }
        catch (err) {
            // ipcRenderer.send('errorMessage', err.message);
        }
    }


}

//Find pixel length of beginning and end position of line, convert to real length by ratio and output
function lineLength(line) {
    pixelLength = line.width;
    realLength = Number(calibrationRatio) * Number(pixelLength);
    console.log(pixelLength, realLength);
    document.getElementById("lengthOutput").value = realLength.toFixed(4);
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
    var text = e.options[e.selectedIndex].text;
    console.log(text);
    return text;
}

function getSettings() {
    var setting = {
        lengthOnly: document.getElementById("lengthOnly").checked,
        manual: document.getElementById("setManual").checked,
    }

    console.log(setting);
    return setting;

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

function drawRect() {
    var rect = new fabric.Rect({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: 'red',
        strokeWidth: 3,
        width: 100,
        height: 100,
    });
    canvas.add(rect);
}

function drawTriangle() {
    var triangle = new fabric.Triangle({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: 'red',
        strokeWidth: 3,
        width: 100,
        height: 100,
    });
    canvas.add(triangle);
}
function drawEllipse() {
    var ellipse = new fabric.Ellipse({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: 'red',
        strokeWidth: 3,
        rx: 100,
        ry: 50,
    });
    canvas.add(ellipse);
}
//Draw controller 
function draw() {
    var shape = getShape();
    // shape = "Line";
    if (shape === "Line") {
        drawLine();
    }
    else if (shape === "Triangle") {
        drawTriangle();
    }
    else if (shape === "Rectangle") {
        drawRect();
    }
    else if (shape === "Ellipse") {
        drawEllipse();
    }
    calcTotalArea();
    //Select newly created 
    canvas.setActiveObject(canvas.item(canvas.getObjects().length-1));
}

function unselect() {
    document.getElementById("lengthOutput").value = "";
    document.getElementById("widthOutput").value = "";
    document.getElementById("areaOutput").value = "";
}
function select(e) {
    console.log("TEst");
    console.log(e);
    onObjectScaled(e);
}

function submit() {
    var species = getSpecies();
    var e = document.getElementById("speciesSelect");

    //Must have proper input
    if (!calibrationRatio) {
        ipcRenderer.send('errorMessage2', "Please enter known distance to calibrate");
    }
    else if (!e.options[e.selectedIndex].value) {
        ipcRenderer.send('errorMessage2', "Must include species");
    }
    else if (!document.getElementById("lengthOutput").value) {
        ipcRenderer.send('errorMessage2', "Must draw shape");
    }
    else {
        //get species depth
        con.connect(function (err) {
            // in case of error
            if (err) {
                console.log(err.code);
                console.log(err.fatal);
            }
            var sql = "SELECT `depth` FROM `species` WHERE `name` = ?";
            con.query(sql, species, function (err, result, fields) {
                if (err) {
                    console.log(err.code);
                    console.log(err.fatal);
                }

                let measure = {
                    species: e.options[e.selectedIndex].value,
                    length: document.getElementById("lengthOutput").value,
                    width: document.getElementById("widthOutput").value,
                    area: document.getElementById("totalAreaOutput").value,
                    volume: document.getElementById("totalAreaOutput").value * result[0].depth,
                }

                con.connect(function (err) {
                    // in case of error
                    if (err) {
                        console.log(err.code);
                        console.log(err.fatal);
                    }
                    var sql = "INSERT INTO measures SET ?";
                    con.query(sql, measure, function (err, result, fields) {
                        if (err) throw err;
                        console.log(result);
                        refreshMeasureTable("measure");
                    });
                });
                if (document.getElementById("clearOnEnter").checked) {
                    clearOutputs();
                    clearCanvas();
                }

            });
        });
    }



}

//Calls main window to refresh the count table
function refreshMeasureTable() {
    ipcRenderer.send('refreshTable', "measure");
}

function changeView() {
    var setting = getSettings();

    var view;
    //If LengthOnly is checked
    if (setting.lengthOnly) {
        view = "lengthOnly";
    }
    else {
        view = "automatic";
    }

    //Display all values
    if (view === "automatic") {
        document.querySelector('#areaOutputLbl').style.display = 'initial';
        document.querySelector('#areaOutput').style.display = 'initial';
        document.querySelector('#areaOutputLbl2').style.display = 'initial';
        document.querySelector('#totalAreaOutputLbl').style.display = 'initial';
        document.querySelector('#totalAreaOutput').style.display = 'initial';
        document.querySelector('#totalAreaOutputLbl2').style.display = 'initial';
        document.querySelector('#shapeSelect').disabled = false;
    }
    // else if(view === "manual"){
    //     document.querySelector('#areaOutputLbl').style.display = 'initial';
    //     document.querySelector('#areaOutput').style.display = 'initial';
    //     document.querySelector('#shapeSelect').value = "Line";
    //     document.querySelector('#shapeSelect').attributes('readonly',false);
    // }
    //Display only line option
    else if (view === "lengthOnly") {
        clearCanvas();
        document.querySelector('#areaOutputLbl').style.display = 'none';
        document.querySelector('#areaOutput').style.display = 'none';
        document.querySelector('#areaOutputLbl2').style.display = 'none';
        document.querySelector('#totalAreaOutputLbl').style.display = 'none';
        document.querySelector('#totalAreaOutput').style.display = 'none';
        document.querySelector('#totalAreaOutputLbl2').style.display = 'none';
        document.querySelector('#shapeSelect').selectedIndex = 0;
        document.querySelector('#shapeSelect').disabled = true;
    }
}

function deleteObject() {
    canvas.remove(canvas.getActiveObject());
}

//Calibrate and create shape for testing 
function devTest() {
    document.getElementById("calibrateTextBox").value = 10;
    drawLine();
    canvas.setActiveObject(canvas.item(0));
    pixelToDistanceRatio();
    drawRect();
    canvas.setActiveObject(canvas.item(0));
    document.getElementById("speciesSelect").selectedIndex = 1;
}

//Initialize
function init() {
    canvas = new fabric.Canvas('canvas');
    resizeCanvas();
    loadSpeciesDropdown();

    canvas.on('object:scaling', onObjectScaled);
    canvas.on('selection:cleared', unselect);
    canvas.on('object:selected', select);
    document.getElementById("clearBtn").addEventListener('click', clearCanvas, false);
    document.getElementById("drawShapeBtn").addEventListener('click', draw, false);
    window.addEventListener('resize', resizeCanvas, false);
    document.getElementById("enterBtn").addEventListener('click', submit, false);
    document.getElementById("calibrateBtn").addEventListener('click', pixelToDistanceRatio, false);
    document.getElementById("pdRatio").innerHTML = "Need to Calibrate";
    document.getElementById("lengthOnly").addEventListener('click', changeView, false);
    document.getElementById("setManual").addEventListener('click', changeView, false);
    document.getElementById("deleteObjectBtn").addEventListener('click',deleteObject,false);

    document.getElementById("devBtn").addEventListener('click', devTest, false);
}

window.addEventListener('load', init, false);