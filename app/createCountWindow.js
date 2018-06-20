//Handle create count window
function createCountWindow(){
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;
    const url = require('url')
    const path = require('path')

    //Create new window
    countWindow = new BrowserWindow({
      show: false,
      transparent:true,
      width:600,
      height:600,
      resizable:true,
      movable:true,
      frame:false,
      transparent:true
    });
    
    // countWindow.openDevTools();
    //Load html into window
    countWindow.loadURL(url.format({
      pathname:path.join(__dirname,'countWindow.html'),
      protocol:'file:',
      slashes: true
    }))
    //Garbage collection handle
    countWindow.on('ready-to-show',function(){
        countWindow.show();
        countWindow.focus();
    })
    countWindow.on('closed', function(){
        countWindow = null;
    });
  }
