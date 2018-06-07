//NOT BEING USED, CAN DELETE

var fabric = require('fabric').fabric;

var Rectangle = (function () {
    function Rectangle(canvas) {
        var inst=this;
        this.canvas = canvas;
        this.className= 'Rectangle';
        this.isDrawing = false;
        this.bindEvents();
    }

	 Rectangle.prototype.bindEvents = function() {
    var inst = this;
    inst.canvas.on('mouse:down', function(o) {
      inst.onMouseDown(o);
    });
    inst.canvas.on('mouse:move', function(o) {
      inst.onMouseMove(o);
    });
    inst.canvas.on('mouse:up', function(o) {
      inst.onMouseUp(o);
    });
    inst.canvas.on('object:moving', function(o) {
      inst.disable();
    })
  }
    Rectangle.prototype.onMouseUp = function (o) {
      var inst = this;
      inst.disable();
    };

    Rectangle.prototype.onMouseMove = function (o) {
      var inst = this;
      

      if(!inst.isEnable()){ return; }
      console.log("mouse move rectangle");
      var pointer = inst.canvas.getPointer(o.e);
      var activeObj = inst.canvas.getActiveObject();

      activeObj.stroke= 'red',
      activeObj.strokeWidth= 5;
      activeObj.fill = 'transparent';

      if(origX > pointer.x){
          activeObj.set({ left: Math.abs(pointer.x) }); 
      }
      if(origY > pointer.y){
          activeObj.set({ top: Math.abs(pointer.y) });
      }

      activeObj.set({ width: Math.abs(origX - pointer.x) });
      activeObj.set({ height: Math.abs(origY - pointer.y) });

      activeObj.setCoords();
      inst.canvas.renderAll();

    };

    Rectangle.prototype.onMouseDown = function (o) {
      var inst = this;
      inst.enable();

      var pointer = inst.canvas.getPointer(o.e);
      origX = pointer.x;
      origY = pointer.y;

    	var rect = new fabric.Rect({
          left: origX,
          top: origY,
          originX: 'left',
          originY: 'top',
          width: pointer.x-origX,
          height: pointer.y-origY,
          angle: 0,
          transparentCorners: false,
          hasBorders: false,
          hasControls: false
      });

  	  inst.canvas.add(rect).setActiveObject(rect);
    };

    Rectangle.prototype.isEnable = function(){
      return this.isDrawing;
    }

    Rectangle.prototype.enable = function(){
      this.isDrawing = true;
    }

    Rectangle.prototype.disable = function(){
      this.isDrawing = false;
    }

    return Rectangle;
}());



var canvas = new fabric.Canvas('canvas');
var arrow = new Rectangle(canvas);






function getActiveStyle(styleName, object) {
    object = object || canvas.getActiveObject();
    if (!object) return '';
  
    return (object.getSelectionStyles && object.isEditing)
      ? (object.getSelectionStyles()[styleName] || '')
      : (object[styleName] || '');
  };
  
  function setActiveStyle(styleName, value, object) {
    object = object || canvas.getActiveObject();
    if (!object) return;
  
    if (object.setSelectionStyles && object.isEditing) {
      var style = { };
      style[styleName] = value;
      object.setSelectionStyles(style);
      object.setCoords();
    }
    else {
      object.set(styleName, value);
    }
  
    object.setCoords();
    canvas.renderAll();
  };
  
  function getActiveProp(name) {
    var object = canvas.getActiveObject();
    if (!object) return '';
  
    return object[name] || '';
  }
  
  function setActiveProp(name, value) {
    var object = canvas.getActiveObject();
    if (!object) return;
    object.set(name, value).setCoords();
    canvas.renderAll();
  }
  
  function addAccessors($scope) {
  
    $scope.getStroke = function() {
      return getActiveStyle('stroke');
    };
    $scope.setStroke = function(value) {
      setActiveStyle('stroke', value);
    };
  
    $scope.getStrokeWidth = function() {
      return getActiveStyle('strokeWidth');
    };
    $scope.setStrokeWidth = function(value) {
      setActiveStyle('strokeWidth', parseInt(value, 10));
    };

  
    $scope.getLineHeight = function() {
      return getActiveStyle('lineHeight');
    };
    $scope.setLineHeight = function(value) {
      setActiveStyle('lineHeight', parseFloat(value, 10));
    };
  
    $scope.getCanvasBgColor = function() {
      return canvas.backgroundColor;
    };
    $scope.setCanvasBgColor = function(value) {
      canvas.backgroundColor = value;
      canvas.renderAll();
    };
  
    $scope.addRect = function() {
      var coord = getRandomLeftTop();
  
      canvas.add(new fabric.Rect({
        left: coord.left,
        top: coord.top,
        fill: '#' + getRandomColor(),
        width: 50,
        height: 50,
        opacity: 0.8
      }));
    };
  
    $scope.addCircle = function() {
      var coord = getRandomLeftTop();
  
      canvas.add(new fabric.Circle({
        left: coord.left,
        top: coord.top,
        fill: '#' + getRandomColor(),
        radius: 50,
        opacity: 0.8
      }));
    };
  
    $scope.addTriangle = function() {
      var coord = getRandomLeftTop();
  
      canvas.add(new fabric.Triangle({
        left: coord.left,
        top: coord.top,
        fill: '#' + getRandomColor(),
        width: 50,
        height: 50,
        opacity: 0.8
      }));
    };
  
    $scope.addLine = function() {
      var coord = getRandomLeftTop();
  
      canvas.add(new fabric.Line([ 50, 100, 200, 200], {
        left: coord.left,
        top: coord.top,
        stroke: '#' + getRandomColor()
      }));
    };
  
    $scope.addPolygon = function() {
      var coord = getRandomLeftTop();
  
      this.canvas.add(new fabric.Polygon([
        {x: 185, y: 0},
        {x: 250, y: 100},
        {x: 385, y: 170},
        {x: 0, y: 245} ], {
          left: coord.left,
          top: coord.top,
          fill: '#' + getRandomColor()
        }));
    };

  
  
    function initCustomization() {
      if (typeof Cufon !== 'undefined' && Cufon.fonts.delicious) {
        Cufon.fonts.delicious.offsetLeft = 75;
        Cufon.fonts.delicious.offsetTop = 25;
      }
  
      if (/(iPhone|iPod|iPad)/i.test(navigator.userAgent)) {
        fabric.Object.prototype.cornerSize = 30;
      }
  
      fabric.Object.prototype.transparentCorners = false;
  
      if (document.location.search.indexOf('guidelines') > -1) {
        initCenteringGuidelines(canvas);
        initAligningGuidelines(canvas);
      }
    }
  
    initCustomization();

  
 
  
  
  function watchCanvas($scope) {
  
    function updateScope() {
      $scope.$$phase || $scope.$digest();
      canvas.renderAll();
    }
  
    canvas
      .on('object:selected', updateScope)
      .on('path:created', updateScope)
      .on('selection:cleared', updateScope);
  }
  
  kitchensink.controller('CanvasControls', function($scope) {
  
    $scope.canvas = canvas;
    $scope.getActiveStyle = getActiveStyle;
  
    addAccessors($scope);
    watchCanvas($scope);
  });
  

  <!DOCTYPE html>
<html lang="en" ng-app="kitchensink">
  <head>
    <meta charset="utf-8">

    <title>Kitchensink | Fabric.js Demos</title>

    <link rel="stylesheet" href="../css/master.css">
    <link rel="stylesheet" href="../css/prism.css">
    <style>
      pre { margin-left: 15px !important }
    </style>

    <!--[if lt IE 9]>
      <script src="../lib/excanvas.js"></script>
    <![endif]-->

    <script src="../lib/prism.js"></script>
    <script>
      (function() {
        var fabricUrl = '../lib/fabric.js';
        if (document.location.search.indexOf('load_fabric_from=') > -1) {
          var match = document.location.search.match(/load_fabric_from=([^&]*)/);
          if (match && match[1]) {
            fabricUrl = match[1];
          }
        }
        document.write('<script src="' + fabricUrl + '"><\/script>');
      })();
    </script>
    <script src="../js/master.js"></script>

    <script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.2.6/angular.min.js"></script>
  </head>
  <body>
    <ul id="header">
  <li><a href="http://fabricjs.com/">Home</a></li>
  <li><a href="http://fabricjs.com/demos">Demos</a></li>
  <li><a href="http://fabricjs.com/articles">Tutorial</a></li>
  <li><a href="http://fabricjs.com/docs">Docs</a></li>
  <li><a href="http://fabricjs.com/build">Custom Build</a></li>
  <li><a href="http://fabricjs.com/help">Support</a></li>
  <li><a href="http://fabricjs.com/test">Tests/Benchmarks</a></li>
  <li><a href="http://fabricjs.com/team">Team</a></li>
  <li class="github secondary">
    <a class="github-button" href="https://github.com/fabricjs/fabric.js" data-size="large" data-show-count="true" aria-label="Star fabricjs/fabric.js on GitHub">Star</a>
  </li>
  <li class="twitter secondary">
    <a href="https://twitter.com/fabricjs" class="twitter-follow-button" data-show-count="true">Follow @fabricjs</a>
  </li>
</ul>
<script async defer src="https://buttons.github.io/buttons.js"></script>
<script>
(function() {

  if (document.location.hostname === 'localhost') {
    var links = document.getElementById('header').getElementsByTagName('a');
    for (var i = 0, len = links.length; i < len; i++) {
      // very retarted fix but fuck it
      links[i].href = links[i].href.replace('fabricjs.com', 'localhost:4000');
    }
  }
  else {
    !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0];if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src="//platform.twitter.com/widgets.js";fjs.parentNode.insertBefore(js,fjs);}}(document,"script","twitter-wjs");
  }
})();
</script>


    <div id="bd-wrapper" ng-controller="CanvasControls">
      <h2><span>Fabric.js demos</span> &middot; Kitchensink</h2>

      <!--[if IE]><script src="../lib/fonts/Delicious.font.js"></script><![endif]-->

<script src="../lib/jquery.js"></script>
<script src="../lib/bootstrap.js"></script>
<script src="../js/paster.js"></script>

<link rel="stylesheet" href="../css/bootstrap.css">
<link rel="stylesheet" href="../css/kitchensink.css">

<link href='http://fonts.googleapis.com/css?family=Plaster' rel='stylesheet' type='text/css'>
<link href='http://fonts.googleapis.com/css?family=Engagement' rel='stylesheet' type='text/css'>

<div style="position:relative;width:804px;float:left;" id="canvas-wrapper">
  <canvas id="canvas" width="800" height="600"></canvas>
</div>

<div id="commands" ng-click="maybeLoadShape($event)">

  <ul class="nav nav-tabs">
    <li><a href="#simple-shapes" data-toggle="tab">Simple</a></li>
    <li><a href="#object" data-toggle="tab">Object</a></li>
    <li class="active"><a href="#canvastab" data-toggle="tab">Canvas</a></li>
    <li><a href="#load-svg-pane" data-toggle="tab">Load SVG</a></li>
    <li><a href="#execute-code" data-toggle="tab">Execute</a></li>
    <li><a href="#json-inout" data-toggle="tab">JSON</a></li>
  </ul>

  <div class="tab-content">
    <div class="tab-pane" id="object">
      <div class="object-controls" object-buttons-enabled="getSelected()">
        <label for="color">Fill / Stroke / Background:</label>
        <input type="color" style="width:40px" bind-value-to="fill" class="btn-object-action">
        <input type="color" style="width:40px" bind-value-to="stroke" class="btn-object-action">
        <input type="color" value="" id="text-bg-color" size="10" class="btn-object-action" bind-value-to="bgColor"><br />
        <label for="opacity">Opacity:</label>
        <input value="100" type="range" bind-value-to="opacity" class="btn-object-action"><br />
        <label for="opacity">Stroke width:</label>
        <input value="1" min="0" max="30" type="range" bind-value-to="strokeWidth" class="btn-object-action"><br />
        <div id="text-wrapper" ng-show="getText()">
          <div id="text-controls">
            <p>Text specific controls</p>
            <textarea bind-value-to="text" rows="3" columns="80"></textarea><br />
            <label for="font-family" style="display:inline-block">Font family:</label>
            <select id="font-family" class="btn-object-action" bind-value-to="fontFamily">
              <option value="arial">Arial</option>
              <option value="helvetica" selected>Helvetica</option>
              <option value="myriad pro">Myriad Pro</option>
              <option value="delicious">Delicious</option>
              <option value="verdana">Verdana</option>
              <option value="georgia">Georgia</option>
              <option value="courier">Courier</option>
              <option value="comic sans ms">Comic Sans MS</option>
              <option value="impact">Impact</option>
              <option value="monaco">Monaco</option>
              <option value="optima">Optima</option>
              <option value="hoefler text">Hoefler Text</option>
              <option value="plaster">Plaster</option>
              <option value="engagement">Engagement</option>
            </select>
            <br>
            <label for="text-align" style="display:inline-block">Text align:</label>
            <select id="text-align" class="btn-object-action" bind-value-to="textAlign">
              <option>Left</option>
              <option>Center</option>
              <option>Right</option>
              <option>Justify</option>
              <option>Justify-left</option>
              <option>Justify-right</option>
              <option>Justify-center</option>
            </select>
            <div>
              <label for="text-lines-bg-color">Background text color:</label>
              <input type="color" value="" id="text-lines-bg-color" size="10" class="btn-object-action"
                bind-value-to="textBgColor">
            </div>
            <div>
              <label for="text-font-size">Font size:</label>
              <input type="range" value="" min="1" max="120" step="1" id="text-font-size" class="btn-object-action"
                bind-value-to="fontSize">
            </div>
            <div>
              <label for="text-line-height">Line height:</label>
              <input type="range" value="" min="0" max="10" step="0.1" id="text-line-height" class="btn-object-action"
                bind-value-to="lineHeight">
            </div>
            <div>
              <label for="text-char-spacing">Char spacing:</label>
              <input type="range" value="" min="-200" max="800" step="10" id="text-char-spacing" class="btn-object-action" bind-value-to="charSpacing">
            </div>
            <button type="button" class="btn btn-object-action"
              ng-click="toggleBold()"
              ng-class="{'btn-inverse': isBold()}">
              Bold
            </button>
            <button type="button" class="btn btn-object-action" id="text-cmd-italic"
              ng-click="toggleItalic()"
              ng-class="{'btn-inverse': isItalic()}">
              Italic
            </button>
            <button type="button" class="btn btn-object-action" id="text-cmd-underline"
              ng-click="toggleUnderline()"
              ng-class="{'btn-inverse': isUnderline()}">
              Underline
            </button>
            <button type="button" class="btn btn-object-action" id="text-cmd-linethrough"
              ng-click="toggleLinethrough()"
              ng-class="{'btn-inverse': isLinethrough()}">
              Linethrough
            </button>
            <button type="button" class="btn btn-object-action" id="text-cmd-overline"
              ng-click="toggleOverline()"
              ng-class="{'btn-inverse': isOverline()}">
              Overline
            </button>
            <br />
            <button type="button" class="btn btn-object-action" id="text-cmd-superscript"
              ng-click="setSuperScript()">
              Superscript
            </button>
            <button type="button" class="btn btn-object-action" id="text-cmd-subscript"
              ng-click="setSubScript()">
              Subscript
            </button>
          </div>
        </div>
        <div style="margin-top:10px;">
          <button class="btn btn-lock btn-object-action"
            ng-click="setHorizontalLock(!getHorizontalLock())"
            ng-class="{'btn-inverse': getHorizontalLock()}">
            {[ getHorizontalLock() ? 'Unlock horizontal movement' : 'Lock horizontal movement' ]}
          </button>
          <button class="btn btn-lock btn-object-action"
            ng-click="setVerticalLock(!getVerticalLock())"
            ng-class="{'btn-inverse': getVerticalLock()}">
            {[ getVerticalLock() ? 'Unlock vertical movement' : 'Lock vertical movement' ]}
          </button>
          <br>
          <button class="btn btn-lock btn-object-action"
            ng-click="setScaleLockX(!getScaleLockX())"
            ng-class="{'btn-inverse': getScaleLockX()}">
            {[ getScaleLockX() ? 'Unlock horizontal scaling' : 'Lock horizontal scaling' ]}
          </button>
          <button class="btn btn-lock btn-object-action"
            ng-click="setScaleLockY(!getScaleLockY())"
            ng-class="{'btn-inverse': getScaleLockY()}">
            {[ getScaleLockY() ? 'Unlock vertical scaling' : 'Lock vertical scaling' ]}
          </button>
          <button class="btn btn-lock btn-object-action"
            ng-click="setRotationLock(!getRotationLock())"
            ng-class="{'btn-inverse': getRotationLock()}">
            {[ getRotationLock() ? 'Unlock rotation' : 'Lock rotation' ]}
          </button>
          <br>
          <button class="btn btn-lock btn-object-action"
            ng-click="setLockScalingFlip(!getLockScalingFlip())"
            ng-class="{'btn-inverse': getLockScalingFlip()}">
            {[ getLockScalingFlip() ? 'Unlock scaling flip' : 'Lock scaling flip' ]}
          </button>
        </div>

        <div style="margin-top:10px">
          <p>
            <span style="margin-right: 10px">Origin X: </span>
            <label>
              Left
              <input type="radio" name="origin-x" class="origin-x btn-object-action" value="left"
                bind-value-to="originX">
            </label>
            <label>
              Center
              <input type="radio" name="origin-x" class="origin-x btn-object-action" value="center"
                bind-value-to="originX">
            </label>
            <label>
              Right
              <input type="radio" name="origin-x" class="origin-x btn-object-action" value="right"
                bind-value-to="originX">
            </label>
          </p>
          <p>
            <span style="margin-right: 10px">Origin Y: </span>
            <label>
              Top
              <input type="radio" name="origin-y" class="origin-y btn-object-action" value="top"
                bind-value-to="originY">
            </label>
            <label>
              Center
              <input type="radio" name="origin-y" class="origin-y btn-object-action" value="center"
                bind-value-to="originY">
            </label>
            <label>
              Bottom
              <input type="radio" name="origin-y" class="origin-y btn-object-action" value="bottom"
                bind-value-to="originY">
            </label>
          </p>
          <p>
            <label>
              Cache:
              <input type="checkbox" name="object-caching" class="btn-object-action"
                bind-value-to="objectCaching">
            </label>
            <label>
              No scaling cache:
              <input type="checkbox" name="no-scale-cache" class="btn-object-action"
                bind-value-to="noScaleCache">
            </label><br />
            <label>
              Controls:
              <input type="checkbox" name="has-controls" class="btn-object-action"
                bind-value-to="hasControls">
            </label>
            <label>
              Trasparent corners:
              <input type="checkbox" name="transparent-corners" class="btn-object-action"
                bind-value-to="transparentCorners">
            </label>
            <label>
              Borders:
              <input type="checkbox" name="has-borders" class="btn-object-action"
                bind-value-to="hasBorders">
            </label>
          </p>
        </div>

        <div style="margin-top:10px;">
          <button id="send-backwards" class="btn btn-object-action"
            ng-click="sendBackwards()">Send backwards</button>
          <button id="send-to-back" class="btn btn-object-action"
            ng-click="sendToBack()">Send to back</button>
        </div>

        <div style="margin-top:4px;">
          <button id="bring-forward" class="btn btn-object-action"
            ng-click="bringForward()">Bring forwards</button>
          <button id="bring-to-front" class="btn btn-object-action"
            ng-click="bringToFront()">Bring to front</button>
        </div>

        <div style="margin-top:10px;">
          <button id="gradientify" class="btn btn-object-action" ng-click="gradientify()">
            Gradientify
          </button>
          <button id="shadowify" class="btn btn-object-action" ng-click="shadowify()">
            Shadowify
          </button>
          <button id="patternify" class="btn btn-object-action" ng-click="patternify()">
            Patternify
          </button>
          <button id="clip" class="btn btn-object-action" ng-click="clip()">
            Clip
          </button>
          <button id="play" class="btn btn-object-action" ng-click="play()">
            Play
          </button>
        </div>
        <div id="cacheInspector">
        </div>
      </div>
    </div>

    <div class="tab-pane" id="simple-shapes">
      <p>Add <strong>simple shapes</strong> to canvas:</p>
      <p>
        <button type="button" class="btn rect" ng-click="addRect()">Rectangle</button>
        <button type="button" class="btn circle" ng-click="addCircle()">Circle</button>
        <button type="button" class="btn triangle" ng-click="addTriangle()">Triangle</button>
        <button type="button" class="btn line" ng-click="addLine()">Line</button>
        <button type="button" class="btn polygon" ng-click="addPolygon()">Polygon</button>
      </p>

      <p>
        <button class="btn" ng-click="addText()">Add text</button>
        <button class="btn" ng-click="addIText()">Add Itext</button>
        <button class="btn" ng-click="addTextbox()">Add textbox</button>
      </p>

      <p>Add <strong>images</strong> to canvas:</p>
      <p>
        <button type="button" class="btn image1" ng-click="addImage1()">Image 1 (pug)</button>
        <button type="button" class="btn image2" ng-click="addImage2()">Image 2 (google)</button>
        <button type="button" class="btn image3" ng-click="addImage3()">Image 3 (printio)</button>
        <button type="button" class="btn image4" ng-click="addImage4()">Bunny video</button>
      </p>

      <p>Add <strong>gradient-based shapes</strong> to canvas:</p>

      <p>
        <button class="btn shape" id="shape74">Gradient 1</button>
        <button class="btn shape" id="shape66">Gradient 2</button>
        <button class="btn shape" id="shape75">Gradient 3</button>
        <button class="btn shape" id="shape148">Gradient 4</button>
      </p>

      <p>Add <strong>arcs</strong> and misc to canvas:</p>

      <p>
        <button class="btn shape" id="shape104">Arc(s) 1</button>
        <button class="btn shape" id="shape105">Arc(s) 2</button>
        <button class="btn shape" id="shape106">Arc(s) 3</button>
        <button class="btn shape" id="shape107">Arc(s) 4</button>
      </p>
      <p>
        <button class="btn shape" id="shape103">Transformed paths</button>
      </p>
      <p>Add <strong>SVG shapes</strong> to canvas:</p>
      <ul class="svg-shapes">
        <li><button class="btn btn-small shape" id="shape25"><strong>36</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape36"><strong>41</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape58"><strong>54</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape59"><strong>57</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape8"><strong>65</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape151">Lighthouse (<strong>78</strong> paths)</button></li>
        <li><button class="btn btn-small shape" id="shape17"><strong>87</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape2"><strong>90</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape69">HTML5 logo (<strong>96</strong> paths)</button></li>
        <li><button class="btn btn-small shape" id="shape115"><strong>124</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape47"><strong>133</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape51"><strong>141</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape141"><strong>244</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape109"><strong>153</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape146"><strong>160</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape50"><strong>167</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape99"><strong>174</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape142"><strong>180</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape112"><strong>183</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape132"><strong>191</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape63"><strong>202</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape133"><strong>223</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape64"><strong>224</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape14"><strong>226</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape108"><strong>236</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape62"><strong>237</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape139"><strong>239</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape140"><strong>246</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape113"><strong>278</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape145"><strong>264</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape98"><strong>280</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape144"><strong>308</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape57"><strong>321</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape128"><strong>341</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape123"><strong>359</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape90"><strong>363</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape120"><strong>395</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape138"><strong>401</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape9"><strong>404</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape45"><strong>404</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape65"><strong>444</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape1"><strong>448</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape93"><strong>464</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape131"><strong>476</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape122"><strong>513</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape91"><strong>562</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape38"><strong>563</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape119"><strong>600</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape135"><strong>651</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape96"><strong>674</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape125"><strong>676</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape126"><strong>696</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape94"><strong>710</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape129"><strong>756</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape121"><strong>756</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape37"><strong>758</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape10"><strong>778</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape101"><strong>832</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape134"><strong>834</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape143"><strong>838</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape147"><strong>841</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape102"><strong>850</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape43"><strong>936</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape136"><strong>975</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape110"><strong>1004</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape7"><strong>1018</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape95"><strong>1066</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape97"><strong>1126</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape118"><strong>1173</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape116"><strong>1196</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape3"><strong>1197</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape26"><strong>1215</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape114"><strong>1269</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape77"><strong>1424</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape32"><strong>1515</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape13"><strong>1652</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape130"><strong>1800</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape71"><strong>1868</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape76"><strong>1944</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape53"><strong>1948</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape21"><strong>1972</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape5"><strong>2208</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape40"><strong>2394</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape55"><strong>2499</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape4"><strong>2742</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape29"><strong>3103</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape30"><strong>3566</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape61"><strong>3685</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape6"><strong>3921</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape23"><strong>4418</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape42"><strong>4583</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape31"><strong>4768</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape15"><strong>8325</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape22"><strong>9663</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape41"><strong>12361</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape67"><strong>12604</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape24"><strong>12866</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape27"><strong>13905</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape49"><strong>14174</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape33"><strong>17059</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape20"><strong>19035</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape35"><strong>19271</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape44"><strong>22375</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape72"><strong>29303</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape48"><strong>41787</strong> paths</button></li>
        <li><button class="btn btn-small shape" id="shape171">Yellow car</button></li>

        <!--
          some elements are positioned incorrectly
          <li><button class="shape" id="shape137"><strong>xxx</strong> paths</button></li> -->

        <!--
          wrong position of ellipses
          <li><button class="shape" id="shape127"><strong>xxx</strong> paths</button></li> -->

        <!--
          bezier curve doesn't seem to be rendered correctly
          <li><button class="shape" id="shape117"><strong>xxx</strong> paths</button></li> -->

        <!-- <li><button class="shape" id="shape111"><strong>18229</strong> paths</button></li> -->
      </ul>
    </div>

    <div class="tab-pane active" id="canvastab">
      <div id="global-controls">
        <p id="complexity">
          Canvas complexity (number of paths):
          <strong>{[ canvas.complexity() ]}</strong>
        </p>
        <p>
          Rasterize canvas to
          <button class="btn btn-success" id="rasterize" ng-click="rasterize()">
            Image
          </button>
          <button class="btn btn-success" id="rasterize" ng-click="rasterize3x()">
            Image 3X multiplied
          </button>
          <button class="btn btn-success" id="rasterize-svg" ng-click="rasterizeSVG()">
            SVG
          </button>
          <button class="btn btn-success" id="rasterize-json" ng-click="rasterizeJSON()">
            JSON
          </button>
        </p>
        <p>
          <button class="btn btn-danger clear" ng-click="confirmClear()">Clear canvas</button>
          <button class="btn btn-object-action" id="remove-selected"
            ng-click="removeSelected()">
            Remove selected object/group
          </button>
        </p>
        <p>
          <label for="canvas-background-picker">Canvas background:</label>
          <input type="color" bind-value-to="canvasBgColor">
        </p>
        <p>
          <label>
            Enable HIDPI (retina) scaling:
            <input type="checkbox" name="enable-retina" bind-value-to="enableRetinaScaling">
          </label>
          <label>
            Skip offscreen rendering:
            <input type="checkbox" name="enable-retina" bind-value-to="skipOffscreen">
          </label>
          <br />
          <label>
            Preserve stacking:
            <input type="checkbox" name="preserve-object-stacking" bind-value-to="preserveObjectStacking">
          </label>
          <label>
            Controls above overlay:
            <input type="checkbox" name="controls-abobe-overlay" bind-value-to="controlsAboveOverlay">
          </label>
        </p>
      </div>
      <div style="margin-top:10px;" id="drawing-mode-wrapper">

        <button id="drawing-mode" class="btn btn-info"
          ng-click="setFreeDrawingMode(!getFreeDrawingMode())"
          ng-class="{'btn-inverse': getFreeDrawingMode()}">
          {[ getFreeDrawingMode() ? 'Exit free drawing mode' : 'Enter free drawing mode' ]}
        </button>

        <div id="drawing-mode-options" ng-show="getFreeDrawingMode()">
          <label for="drawing-mode-selector">Mode:</label>
          <select id="drawing-mode-selector" bind-value-to="drawingMode">
            <option>Pencil</option>
            <option>Circle</option>
            <option>Spray</option>
            <option>Pattern</option>

            <option>hline</option>
            <option>vline</option>
            <option>square</option>
            <option>diamond</option>
            <option>texture</option>
          </select>
          <br>
          <label for="drawing-line-width">Line width:</label>
          <input type="range" value="30" min="0" max="150" bind-value-to="drawingLineWidth">
          <br>
          <label for="drawing-color">Line color:</label>
          <input type="color" value="#005E7A" bind-value-to="drawingLineColor">
          <br>
          <label for="drawing-shadow-width">Line shadow width:</label>
          <input type="range" value="0" min="0" max="50" bind-value-to="drawingLineShadowWidth">
        </div>
      </div>
    </div>

    <div class="tab-pane" id="load-svg-pane">
      <textarea id="svg-console" bind-value-to="consoleSVG">
      </textarea>
      <button type="button" class="btn btn-info" ng-click="loadSVG()">
        Load as Group
      </button>
      <button type="button" class="btn" ng-click="loadSVGWithoutGrouping()">
        Load without grouping
      </button>
    </div>

    <div class="tab-pane" id="execute-code">
        <textarea id="canvas-console" bind-value-to="console">
        </textarea>
        <button type="button" class="btn btn-info" ng-click="execute()">Execute</button>
    </div>

    <div class="tab-pane" id="json-inout">
      <textarea id="json-console" bind-value-to="consoleJSON">
      </textarea>
      <button type="button" class="btn btn-info" ng-click="loadJSON()">
        Load
      </button>
      <button type="button" class="btn btn-info" ng-click="saveJSON()">
        Save
      </button>
    </div>

  </div>

</div>
<div style="min-width: 800px; width: 800px;" >
  rasterized canvas:<br />
  <img id="canvasRasterizer" /><br />
  svg canvas:<br />
  <div id="SVGRasterizer" style="display: inline-block" />
</div>
<!-- <script src="../../lib/centering_guidelines.js"></script>
<script src="../../lib/aligning_guidelines.js"></script> -->

<script src="../lib/font_definitions.js"></script>

<script>
  var kitchensink = { };
  var canvas = new fabric.Canvas('canvas');
</script>

<script src="../js/kitchensink/utils.js"></script>
<script src="../js/kitchensink/app_config.js"></script>
<script src="../js/kitchensink/controller.js"></script>

<script>

  (function() {
    function renderVieportBorders() {
      var ctx = canvas.getContext();

      ctx.save();

      ctx.fillStyle = 'rgba(0,0,0,0.1)';

      ctx.fillRect(
        canvas.viewportTransform[4],
        canvas.viewportTransform[5],
        canvas.getWidth() * canvas.getZoom(),
        canvas.getHeight() * canvas.getZoom());

      ctx.setLineDash([5, 5]);

      ctx.strokeRect(
        canvas.viewportTransform[4],
        canvas.viewportTransform[5],
        canvas.getWidth() * canvas.getZoom(),
        canvas.getHeight() * canvas.getZoom());

      ctx.restore();
    }
    canvas.on('object:selected', function(opt) {
        var target = opt.target;
        if (target._cacheCanvas) {

        }
    })


    canvas.on('mouse:wheel', function(opt) {
      var e = opt.e;
      if (!e.ctrlKey) {
        return;
      }
      var newZoom = canvas.getZoom() + e.deltaY / 300;
      canvas.zoomToPoint({ x: e.offsetX, y: e.offsetY }, newZoom);

      renderVieportBorders();
      e.preventDefault();
      return false;
    });

    var viewportLeft = 0,
        viewportTop = 0,
        mouseLeft,
        mouseTop,
        _drawSelection = canvas._drawSelection,
        isDown = false;

    canvas.on('mouse:down', function(options) {
      if (options.e.altKey) {
        isDown = true;

        viewportLeft = canvas.viewportTransform[4];
        viewportTop = canvas.viewportTransform[5];

        mouseLeft = options.e.x;
        mouseTop = options.e.y;
        _drawSelection = canvas._drawSelection;
        canvas._drawSelection = function(){ };
        renderVieportBorders();
      }
    });

    canvas.on('mouse:move', function(options) {
      if (options.e.altKey && isDown) {
        var currentMouseLeft = options.e.x;
        var currentMouseTop = options.e.y;

        var deltaLeft = currentMouseLeft - mouseLeft,
            deltaTop = currentMouseTop - mouseTop;

        canvas.viewportTransform[4] = viewportLeft + deltaLeft;
        canvas.viewportTransform[5] = viewportTop + deltaTop;

        canvas.renderAll();
        renderVieportBorders();
      }
    });

    canvas.on('mouse:up', function() {
      canvas._drawSelection = _drawSelection;
      isDown = false;
    });
  })();

</script>

    </div>

    <script>
      (function(){
        var mainScriptEl = document.getElementById('main');
        if (!mainScriptEl) return;
        var preEl = document.createElement('pre');
        var codeEl = document.createElement('code');
        codeEl.innerHTML = mainScriptEl.innerHTML;
        codeEl.className = 'language-javascript';
        preEl.appendChild(codeEl);
        document.getElementById('bd-wrapper').appendChild(preEl);
      })();
    </script>

    <script>
(function() {
  fabric.util.addListener(fabric.window, 'load', function() {
    var canvas = this.__canvas || this.canvas,
        canvases = this.__canvases || this.canvases;

    canvas && canvas.calcOffset && canvas.calcOffset();

    if (canvases && canvases.length) {
      for (var i = 0, len = canvases.length; i < len; i++) {
        canvases[i].calcOffset();
      }
    }
  });
})();
</script>


  </body>
</html>
