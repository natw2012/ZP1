// function createEditWindow(btn) {
//     const remote = require('electron').remote;
//     const BrowserWindow = remote.BrowserWindow;
//     const url = require('url')
//     const path = require('path')
//     //Create new window
//     editWindow = new BrowserWindow({
//         show: false,
//         transparent: false,
//         width: 300,
//         height: 500,
//         resizable: true,
//         movable: true,
//         frame: true,
//     });
//     // editWindow.openDevTools();
//     //Load html into window
//     editWindow.loadURL(url.format({
//         pathname: path.join(__dirname, 'html/editWindow.html'),
//         protocol: 'file:',
//         slashes: true
//     }))
//     //Garbage collection handle
//     editWindow.on('ready-to-show', function () {
//         editWindow.show();
//         editWindow.focus();
//     })
//     editWindow.on('close', function () {
//         addWindow = null;
//     });

//     editWindow.on('load', loadForm(btn));

    
// }