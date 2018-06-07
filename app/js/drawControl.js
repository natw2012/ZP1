var fabric = require('fabric').fabric;
var rect = require("./js/drawRect"); //Path makes no sense, consider making custom module
var lin = require("./js/drawLine");

var calibrationRatio;
var pixelLength;
var realLength;

//Clear Canvas
function clearCanvas(event) {
    canvas.clear();
}

//Resize canvas to fit adjusted window
function resizeCanvas() {
    canvas.setWidth(window.innerWidth);
    canvas.setHeight(window.innerHeight);
    canvas.renderAll();
}

function onObjectScaled(e) {
    //Eliminates caching error during scaling
    fabric.Object.prototype.objectCaching = false;
    var shape = e.target;
    shape.width = shape.scaleX * shape.width;
    shape.height = shape.scaleY * shape.height;
    shape.radius = shape.radius * shape.scaleX;
    shape.scaleX = 1;
    shape.scaleY = 1;
    
    //probably redundant can do line vs everything else
    if (shape.type === "rect") {
        calcArea(shape);
    }
    else if (shape.type === "line") {
        lineLength(shape);
    }
    else if (shape.type === "circle") {
        calcArea(shape);
    }
    else if (shape.type === "triangle") {
        calcArea(shape);
    }
}

function calcTotalArea(){
    var totalArea = 0;
    var objects = canvas.getObjects();
    objects.forEach(object=>{
        totalArea = totalArea + calcArea(object);
    });
    document.getElementById("area").innerHTML = totalArea.toFixed(2);
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
    else if(type === "line"){
        return 0;
    }

}

//Calc Area of Rectangle
function rectArea(rect) {
    //Slight measuring issue with rect.width = inside perimeter while line.width = outside
    var area = rect.width * rect.height * Math.pow(calibrationRatio, 2);
    document.getElementById("area").innerHTML = area.toFixed(2);
    return area;
}
//Calc Area of Circle
function circleArea(circ) {
    var area = Math.PI * Math.pow(circ.radius, 2) * Math.pow(calibrationRatio, 2);
    document.getElementById("area").innerHTML = area.toFixed(2);
    return area;
}
//Calc Area of Triangle
function triangleArea(tri) {
    var area = tri.width * tri.height / 2 * Math.pow(calibrationRatio, 2);
    document.getElementById("area").innerHTML = area.toFixed(2);
    return area;
}

//Calculate the pixel to measurement ratio eg. cm/pix
function pixelToDistanceRatio() {
    calibrationRatio = Number(document.getElementById("calibrateTextBox").value) / canvas.getActiveObject().width;
    document.getElementById("pdRatio").innerHTML = calibrationRatio.toFixed(2);
    clearCanvas();
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

function drawLine() {
    var line = new fabric.Line([100, 100, 200, 100], {
        left: 100,
        top: 100,
        stroke: 'red',
        fill: 'red',
        strokeWidth: 3,
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

function drawCircle() {
    var circle = new fabric.Circle({
        left: 100,
        top: 100,
        fill: 'transparent',
        stroke: 'red',
        strokeWidth: 3,
        radius: 50,
    });
    canvas.add(circle);
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
    else if (shape === "Circle") {
        drawCircle();
    }
    else if (shape === "Rectangle") {
        drawRect();
    }
}

//Initialize
function init() {
    canvas = new fabric.Canvas('canvas');
    resizeCanvas();

    canvas.on('object:scaling', onObjectScaled);
    document.getElementById("clear").addEventListener('click', clearCanvas, false);

    document.getElementById("drawShapeBtn").addEventListener('click', draw, false);
    window.addEventListener('resize', resizeCanvas, false);
    document.getElementById("areaBtn").addEventListener('click', calcTotalArea, false);

    document.getElementById("calibrateBtn").addEventListener('click', pixelToDistanceRatio, false);
    document.getElementById("pdRatio").innerHTML = "Need to Calibrate";
}

window.addEventListener('load', init, false);