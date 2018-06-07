//NOT BEING USED, CAN DELETE

var dragging = false,
    dragStartLocation,
    snapshot,
    calibrationRatio,
    pixelLength,
    realLength;

var width = window.innerWidth;
var height = window.innerHeight;

var stage = new Konva.Stage({
    container: 'container',
    width: width,
    height: height
});

var layer = new Konva.Layer();
stage.add(layer);

function drawRect(position) {
    var rect = new Konva.Rect({
        x: dragStartLocation.x,
        y: dragStartLocation.y,
        width: position.x - dragStartLocation.x,
        height: position.y - dragStartLocation.y,
        fill: '',
        stroke: 'green',
        strokewidth: 4,
        name: 'rect',
        draggable: true
    })
    layer.add(rect);
    layer.draw();
}

//Snapshot
function takeSnapshot() {
    snapshot = getLayer();
    // stage.clear();
}

//Restore snapshot
function restoreSnapshot() {
    layer.clear();
    // stage.clear();
}

// stage.on('dblclick', function (e) {
//     var position = {
//         x: stage.getPointerPosition().x,
//         y: stage.getPointerPosition().y
//     }

//     drawRect(position);
//     console.log("Test");
// })

function dragStart(event) {
    dragging = true;
    dragStartLocation = {
        x: stage.getPointerPosition().x,
        y: stage.getPointerPosition().y
    }
    takeSnapshot();
    // console.log(getCanvasCoordinates(event));
}

//Draw line as user drags
function drag(event) {
    var position;
    if (dragging === true) {
        restoreSnapshot();
        position = {
            x: stage.getPointerPosition().x,
            y: stage.getPointerPosition().y
        }
        drawRect(position);
        // drawRect(position, getShape());
    }
}

//Complete line as user releases mouse click
function dragStop(event) {
    dragging = false;
    restoreSnapshot();
    var position = {
        x: stage.getPointerPosition().x,
        y: stage.getPointerPosition().y
    }
    drawRect(position);
    // drawRect(position, getShape());
    // console.log(getShape(), getCanvasCoordinates(event));
}

//Initialize
function init() {



    // resizeCanvas();

    stage.on('mousedown', function (e) { dragStart() })
    stage.on('mousemove', function (e) { drag() })
    stage.on('mouseup', function (e) { dragStop() })

    stage.on('click', function (e) {
        // if click on empty area - remove all transformers
        if (e.target === stage) {
            stage.find('Transformer').destroy();
            layer.draw();
            return;
        }
        // do nothing if clicked NOT on our rectangles
        if (!e.target.hasName('rect')) {
            return;
        }
        // remove old transformers
        // TODO: we can skip it if current rect is already selected
        stage.find('Transformer').destroy();

        // create new transformer
        var tr = new Konva.Transformer();
        layer.add(tr);
        tr.attachTo(e.target);
        layer.draw();
    })

    // document.getElementById("clear").addEventListener('click', clearCanvas, false);

    // window.addEventListener('resize', resizeCanvas, false);

    // document.getElementById("calibrateBtn").addEventListener('click', pixelToDistanceRatio, false);
    document.getElementById("pdRatio").innerHTML = "Need to Calibrate";
}

window.addEventListener('load', init, false);