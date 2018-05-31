//Handle create measure window
function createMeasureWindow(){
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;
    const url = require('url')
    const path = require('path')

    //Create new window
    measureWindow = new BrowserWindow({
      show: false,
      transparent:true,
      width:600,
      height:600,
      resizable:true,
      movable:true,
      frame:false,
      transparent:true
    });
    
    // measureWindow.openDevTools();
    //Load html into window
    measureWindow.loadURL(url.format({
      pathname:path.join(__dirname,'videoOverlay.html'),
      protocol:'file:',
      slashes: true
    }))
    //Garbage collection handle
    measureWindow.on('ready-to-show',function(){
        measureWindow.show();
        measureWindow.focus();
    })
    measureWindow.on('close', function(){
        measureWindow = null;
    });
  }
