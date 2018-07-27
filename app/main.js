const electron = require('electron');
const path = require('path');
const url = require('url');


const { app, ipcMain, dialog, BrowserWindow } = require('electron');

// Added electron-reload to refresh app on save

// Causes issues when packaging!!

// require("electron-reload")(__dirname, {
//   electron: require(`../node_modules/electron`)
// });

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;
let infoWindow;
let editWindow;
let addWindow;
let countWindow;
let measureWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({ width: 800, height: 600 });
  infoWindow = new BrowserWindow({ width: 300, height: 500, parent: mainWindow, modal: true, show: false });
  editWindow = new BrowserWindow({ width: 300, height: 500, parent: mainWindow, modal: true, show: false });
  addWindow = new BrowserWindow({ width: 300, height: 500, /*parent: mainWindow, modal: true,*/ show: false });
  countWindow = new BrowserWindow({ width: 1000, height: 650, show: false, transparent: true, frame: false });
  measureWindow = new BrowserWindow({ width: 1000, height: 650, show: false, transparent: true, frame: false });


  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  infoWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'html/infoWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  editWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'html/editWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  addWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'html/addWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  countWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'html/countWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  measureWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'html/measureWindow.html'),
    protocol: 'file:',
    slashes: true
  }));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
    if (process.platform !== 'darwin') {
      app.quit()
    }

  })

  infoWindow.on('close', function (e) {
    if (app.quitting) {
      infoWindow = null
    } else {
      e.preventDefault()
      infoWindow.hide()
    }
  });

  editWindow.on('close', function (e) {
    if (app.quitting) {
      editWindow = null
    } else {
      e.preventDefault()
      editWindow.hide()
    }
  });

  addWindow.on('close', function (e) {
    if (app.quitting) {
      addWindow = null
    } else {
      e.preventDefault()
      addWindow.hide()
    }
  });

  countWindow.on('close', function (e) {
    if (app.quitting) {
      countWindow = null
    } else {
      e.preventDefault()
      countWindow.hide()
    }
  });

  measureWindow.on('close', function (e) {
    if (app.quitting) {
      measureWindow = null
    } else {
      e.preventDefault()
      measureWindow.hide()
    }
  });

  mainWindow.webContents.on('crashed', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Main Window Crashed!",
    });
  })
  addWindow.webContents.on('crashed', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Add Window Crashed!",
    });
  })
  editWindow.webContents.on('crashed', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Edit Window Crashed!",
    });
  })
  infoWindow.webContents.on('crashed', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Info Window Crashed!",
    });
  })
  countWindow.webContents.on('crashed', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Count Window Crashed!",
    });
  })
  measureWindow.webContents.on('crashed', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Meaasure Window Crashed!",
    });
  })

  mainWindow.on('unresponsive', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Main Window Is Unresponsive!",
    });
  })
  addWindow.on('unresponsive', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Add Window Is Unresponsive!",
    });
  })
  editWindow.on('unresponsive', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Edit Window Is Unresponsive!",
    });
  })
  infoWindow.on('unresponsive', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Info Window Is Unresponsive!",
    });
  })
  countWindow.on('unresponsive', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Count Window Is Unresponsive!",
    });
  })
  measureWindow.on('unresponsive', function () { 
    dialog.showMessageBox({
      type: "error",
      title: "Error",
      message: "Sorry! Meaasure Window Is Unresponsive!",
    });
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

app.on('before-quit', function () {
  app.quitting = true;
})

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q

})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


ipcMain.on('refreshTable', function (e, table) {
  mainWindow.webContents.send('refreshTable', table);
})

//Display Error Message in Dialog
ipcMain.on('errorMessage', function (e, currWindow, err) {
  var win;
  switch (currWindow) {
    case 1:
      win = mainWindow;
      break;
    case 2:
      win = infoWindow;
      break;
    case 3:
      win = editWindow;
      break;
    case 4:
      win = addWindow;
      break;
    case 5:
      win = countWindow;
      break;
    case 6:
      win = measureWindow;
      break;
    }

  dialog.showMessageBox(win, {
    type: "error",
    title: "Error",
    message: err,
  });
})

//Displays Error messages for windows not defined in main, will change eventually
ipcMain.on('errorMessage2', function (e, err) {
  dialog.showMessageBox({
    type: "error",
    title: "Error",
    message: err,
  });
})

ipcMain.on('showInfoWindow', function (e, table, info) {
  infoWindow.reload((infoWindow.show()));
  console.log(info);
  infoWindow.webContents.on('did-finish-load', () => {
    infoWindow.webContents.send('loadInfo', table, info);
  })
})

ipcMain.on('showEditWindow', function (e, table, info) {
  editWindow.reload(editWindow.show());

  editWindow.webContents.on('did-finish-load', () => {
    editWindow.webContents.send('loadEdit', table, info);
  })

})

ipcMain.on('showAddWindow', function (e, table) {
  addWindow.reload((addWindow.show()));

  addWindow.webContents.on('did-finish-load', () => {
    addWindow.webContents.send('loadAdd', table);
  })
})

ipcMain.on('showCountWindow', function (e) {
  countWindow.show();
  countWindow.focus();

  // countWindow.webContents.on('did-finish-load', () => {
  //   countWindow.webContents.send('loadCount');
  // })
})

ipcMain.on('showMeasureWindow', function (e) {
  measureWindow.show();
  measureWindow.focus();

  // measureWindow.webContents.on('did-finish-load', () => {
  //   measureWindow.webContents.send('loadMeasure');
  // })
})

ipcMain.on('refreshOnDBChange', function (e) {
  mainWindow.reload();
  addWindow.reload();
  editWindow.reload();
  infoWindow.reload();
  countWindow.reload();
  measureWindow.reload();
})

process.on('uncaughtException', function () { 
  dialog.showMessageBox({
    type: "error",
    title: "Error",
    message: "Sorry! Uncaught Exception!",
  });
})