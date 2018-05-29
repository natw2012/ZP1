function createAddLakeWindow() {
    const remote = require('electron').remote;
    const BrowserWindow = remote.BrowserWindow;
    const url = require('url')
    const path = require('path')
    //Create new window
    addWindow = new BrowserWindow({
        show: false,
        transparent: false,
        width: 600,
        height: 600,
        resizable: true,
        movable: true,
        frame: true,
    });
    // addWindow.openDevTools();
    //Load html into window
    addWindow.loadURL(url.format({
        pathname: path.join(__dirname, 'addLake.html'),
        protocol: 'file:',
        slashes: true
    }))
    //Garbage collection handle
    addWindow.on('ready-to-show', function () {
        addWindow.show();
        addWindow.focus();
    })
    addWindow.on('close', function () {
        addWindow = null;
    });
}