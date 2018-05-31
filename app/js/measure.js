var canvas,
    context,
    dragging = false,
    dragStartLocation,
    snapshot,
    calibrationRatio,
    pixelLength,
    realLength;

function pixelToDistanceRatio(){
    calibrationRatio = Number(pixelLength) / Number(document.getElementById("calibrateTextBox").value);
    console.log("ratio:",calibrationRatio);
    document.getElementById("pdRatio").innerHTML = calibrationRatio.toFixed(2);
}

function redraw(){
  context.strokeStyle = 'purple';
  context.lineWidth = 3;
  context.lineCap = 'round';
//   context.strokeRect(0,0,window.innerWidth,window.innerHeight) // Border
}
function resizeCanvas(){
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  redraw();
}

function clearCanvas(event){
  // canvas = document.getElementById("canvas");
  // context = canvas.getContext('2d');
  context.clearRect(0,0,canvas.width,canvas.height);
  console.log("Clear");
}

function lineLength(position){
  pixelLength = parseFloat(Math.hypot(position.x-dragStartLocation.x,position.y-dragStartLocation.y)).toFixed(2);
  realLength = Number(pixelLength) / Number(calibrationRatio);
  console.log(pixelLength, realLength);
  document.getElementById("lengthOutput").value = realLength;
}

function getCanvasCoordinates(event){
  var x = event.clientX - canvas.getBoundingClientRect().left,
      y = event.clientY - canvas.getBoundingClientRect().top;

  return {x: x, y: y};
}

function takeSnapshot(){
  snapshot = context.getImageData(0,0,canvas.width,canvas.height);
}

function restoreSnapshot(){
  context.putImageData(snapshot,0,0);
}

function drawLine(position){
  context.beginPath();
  context.moveTo(dragStartLocation.x, dragStartLocation.y);
  context.lineTo(position.x, position.y);
  context.stroke();
  lineLength(position);
}

function dragStart(event) {
  dragging = true;
  dragStartLocation = getCanvasCoordinates(event);
  takeSnapshot();
  console.log(getCanvasCoordinates(event));
}

function drag(event){
  var position;
  if(dragging === true){
    restoreSnapshot();
    position = getCanvasCoordinates(event);
    drawLine(position);
    // console.log(Math.hypot(getCanvasCoordinates(event)));
  }
}

function dragStop(event){
  dragging = false;
  restoreSnapshot();
  var position = getCanvasCoordinates(event);
  drawLine(position);
  console.log(getCanvasCoordinates(event));
}

function init() {
  canvas = document.getElementById("canvas");
  context = canvas.getContext('2d');
  resizeCanvas();

  canvas.addEventListener('mousedown', dragStart, false);
  canvas.addEventListener('mousemove', drag, false);
  canvas.addEventListener('mouseup', dragStop, false);
  document.getElementById("clear").addEventListener('click',clearCanvas, false);
  window.addEventListener('resize',resizeCanvas,false);
  document.getElementById("calibrateBtn").addEventListener('click',pixelToDistanceRatio,false);
  document.getElementById("pdRatio").innerHTML = "Need to Calibrate";
//   calibrationRatio = "Need to Calibrate";
}

window.addEventListener('load', init, false);
