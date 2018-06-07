var canvas,
  context,
  dragging = false,
  dragStartLocation,
  snapshot,
  calibrationRatio,
  pixelLength,
  realLength;

function rectArea(position){
  console.log(position.x, dragStartLocation.x, position.y, dragStartLocation.y)
  var area = Math.abs(position.x - dragStartLocation.x) * Math.abs(position.y - dragStartLocation.y) * Math.pow(calibrationRatio,2);
  document.getElementById("area").innerHTML = area.toFixed(2);
}

function circleArea(position){
  var radius = Math.sqrt(Math.pow((dragStartLocation.x - position.x), 2) + Math.pow((dragStartLocation.y - position.y), 2));
  var area = Math.PI * Math.pow(radius*calibrationRatio,2);
  document.getElementById("area").innerHTML = area.toFixed(2);
}

function getShape() {
  var e = document.getElementById("shapeSelect");
  var text = e.options[e.selectedIndex].text;
  console.log(text);
  return text;
}

//Calculate the pixel to measurement ratio eg. cm/pix
function pixelToDistanceRatio() {
  calibrationRatio = Number(document.getElementById("calibrateTextBox").value) / Number(pixelLength);
  console.log("ratio:", calibrationRatio);
  document.getElementById("pdRatio").innerHTML = calibrationRatio.toFixed(2);
  clearCanvas();
}

//Redraws canvas after resizing
function redraw() {
  context.strokeStyle = 'purple';
  context.lineWidth = 3;
  context.lineCap = 'round';
}

//Resize canvas to fit adjusted window
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  redraw();
}

//Clear Canvas
function clearCanvas(event) {
  context.clearRect(0, 0, canvas.width, canvas.height);
  console.log("Clear");
}

//Find pixel length of beginning and end position of line, convert to real length by ratio and output
function lineLength(position) {
  pixelLength = parseFloat(Math.hypot(position.x - dragStartLocation.x, position.y - dragStartLocation.y));
  realLength = Number(calibrationRatio) * Number(pixelLength);
  console.log(pixelLength, realLength);
  document.getElementById("lengthOutput").value = realLength.toFixed(4);
}

//Get coordinates of canvas
function getCanvasCoordinates(event) {
  var x = event.clientX - canvas.getBoundingClientRect().left,
    y = event.clientY - canvas.getBoundingClientRect().top;

  return { x: x, y: y };
}

//Snapshot
function takeSnapshot() {
  snapshot = context.getImageData(0, 0, canvas.width, canvas.height);
}

//Restore snapshot
function restoreSnapshot() {
  context.putImageData(snapshot, 0, 0);
}

function drawLine(position) {
  context.beginPath();
  context.moveTo(dragStartLocation.x, dragStartLocation.y);
  context.lineTo(position.x, position.y);
  context.stroke();
  lineLength(position);
}

function drawCircle(position) {
  var radius = Math.sqrt(Math.pow((dragStartLocation.x - position.x), 2) + Math.pow((dragStartLocation.y - position.y), 2));
  context.beginPath();
  context.arc(dragStartLocation.x, dragStartLocation.y, radius, 0, 2 * Math.PI, false);
  context.stroke();
  circleArea(position);
}

function drawPolygon(position, sides, angle) {
  var coordinates = [],
    radius = Math.sqrt(Math.pow((dragStartLocation.x - position.x), 2) + Math.pow((dragStartLocation.y - position.y), 2)),
    index = 0;

  for (index = 0; index < sides; index++) {
    coordinates.push({ x: dragStartLocation.x + radius * Math.cos(angle), y: dragStartLocation.y - radius * Math.sin(angle) });
    angle += (2 * Math.PI) / sides;
  }

  context.beginPath();
  context.moveTo(coordinates[0].x, coordinates[0].y);
  for (index = 1; index < sides; index++) {
    context.lineTo(coordinates[index].x, coordinates[index].y);
  }

  context.closePath();

  context.stroke();
}

function drawRect(position){
  context.beginPath();
  context.moveTo(dragStartLocation.x, dragStartLocation.y);
  context.strokeRect(dragStartLocation.x,dragStartLocation.y,position.x-dragStartLocation.x,position.y-dragStartLocation.y);
  rectArea(position);
}

//Draw controller 
function draw(position, shape) {
  // shape = "Line";
  if (shape === "Line") {
    drawLine(position);
  }
  else if (shape === "Triangle") {
    drawPolygon(position, 3, Math.PI / 2)     //Add Rotate Functionality by playing with angle
  }
  else if (shape === "Circle") {
    drawCircle(position);
  }
  else if (shape === "Rectangle") {
    drawRect(position);
  }
  else if (shape === "Polygon")
    drawPolygon(position,8,Math.PI/4);

  // context.stroke();
}

//Coordinate of starting location
function dragStart(event) {
  dragging = true;
  dragStartLocation = getCanvasCoordinates(event);
  takeSnapshot();
  // console.log(getCanvasCoordinates(event));
}

//Draw line as user drags
function drag(event) {
  var position;
  if (dragging === true) {
    restoreSnapshot();
    position = getCanvasCoordinates(event);
    draw(position, getShape());
    // console.log(Math.hypot(getCanvasCoordinates(event)));
  }
}

//Complete line as user releases mouse click
function dragStop(event) {
  dragging = false;
  restoreSnapshot();
  var position = getCanvasCoordinates(event);
  draw(position, getShape());
  console.log(getShape(), getCanvasCoordinates(event));
}

//Initialize
function init() {
  canvas = document.getElementById("canvas");
  context = canvas.getContext('2d');
  resizeCanvas();

  canvas.addEventListener('mousedown', dragStart, false);
  canvas.addEventListener('mousemove', drag, false);
  canvas.addEventListener('mouseup', dragStop, false);

  document.getElementById("clear").addEventListener('click', clearCanvas, false);

  window.addEventListener('resize', resizeCanvas, false);

  document.getElementById("calibrateBtn").addEventListener('click', pixelToDistanceRatio, false);
  document.getElementById("pdRatio").innerHTML = "Need to Calibrate";
}

window.addEventListener('load', init, false);
