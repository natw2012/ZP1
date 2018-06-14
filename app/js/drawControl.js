var fabric = require('fabric').fabric;
var randomColor = require('randomcolor');

var calibrationRatio;
var pixelLength;
var realLength;
var speciesOption = [];

console.log(window.location.href );
var con = require('./js/config.js').localConnect();

//Should implement ability to choose colours in dashboard 
function random_rgba() {
    return randomColor(); //Random Color Library
}

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

function lengthOrArea(){
    var shape = getShape();

    console.log(shape);
    if(shape === 'Line'){
        document.querySelector('#lengthOutputLbl').style.display = 'initial';
        document.querySelector('#lengthOutput').style.display = 'initial';
        document.querySelector('#areaOutputLbl').style.display = 'none';
        document.querySelector('#areaOutput').style.display = 'none';
        
    }
    else{
        document.querySelector('#lengthOutputLbl').style.display = 'none';
        document.querySelector('#lengthOutput').style.display = 'none';
        document.querySelector('#areaOutputLbl').style.display = 'initial';
        document.querySelector('#areaOutput').style.display = 'initial';
    }
}

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

function onObjectScaled(e) {
    //Eliminates caching error during scaling
    fabric.Object.prototype.objectCaching = false;
    var shape = e.target;
    shape.width = shape.scaleX * shape.width;
    shape.height = shape.scaleY * shape.height;
    shape.radius = shape.radius * shape.scaleX;
    shape.rx = shape.rx * shape.scaleX;
    shape.ry = shape.ry * shape.scaleY;
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
    else if (shape.type === "ellipse"){
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
    else if(type === "ellipse") {
        return ellipseArea(obj);
    }

}

//Calc Area of Rectangle
function rectArea(rect) {
    //Slight measuring issue with rect.width = inside perimeter while line.width = outside
    var area = rect.width * rect.height * Math.pow(calibrationRatio, 2);
    document.getElementById("areaOutput").value = area.toFixed(2);
    return area;
}
//Calc Area of Circle
function circleArea(circ) {
    var area = Math.PI * Math.pow(circ.radius, 2) * Math.pow(calibrationRatio, 2);
    document.getElementById("areaOutput").value = area.toFixed(2);
    return area;
}
//Calc Area of Triangle
function triangleArea(tri) {
    var area = tri.width * tri.height / 2 * Math.pow(calibrationRatio, 2);
    document.getElementById("areaOutput").value = area.toFixed(2);
    return area;
}
//Calc Area of Ellipse
function ellipseArea(el) {
    console.log(el.rx,el.ry,Math.PI,Math.pow(calibrationRatio, 2));
    var area = el.rx * el.ry * Math.PI * Math.pow(calibrationRatio, 2);
    document.getElementById("areaOutput").value = area.toFixed(2);
    return area;
}

//Calculate the pixel to measurement ratio eg. cm/pix
function pixelToDistanceRatio() {
    calibrationRatio = Number(document.getElementById("calibrateTextBox").value) / canvas.getActiveObject().width;
    document.getElementById("pdRatio").value = calibrationRatio.toFixed(2);
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
    else if (shape === "Circle") {
        drawCircle();
    }
    else if (shape === "Rectangle") {
        drawRect();
    }
    else if (shape === "Ellipse") {
        drawEllipse();
    }
}

//Initialize
function init() {
    canvas = new fabric.Canvas('canvas');
    resizeCanvas();
    loadSpeciesDropdown();
    lengthOrArea()

    canvas.on('object:scaling', onObjectScaled);
    document.getElementById("clear").addEventListener('click', clearCanvas, false);
    document.getElementById("shapeSelect").addEventListener('change', lengthOrArea);
    document.getElementById("drawShapeBtn").addEventListener('click', draw, false);
    window.addEventListener('resize', resizeCanvas, false);
    document.getElementById("areaBtn").addEventListener('click', calcTotalArea, false);
    document.getElementById("calibrateBtn").addEventListener('click', pixelToDistanceRatio, false);
    document.getElementById("pdRatio").innerHTML = "Need to Calibrate";
}

window.addEventListener('load', init, false);