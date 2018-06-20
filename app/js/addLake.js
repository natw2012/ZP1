var mysql = require('mysql');
const electron = require('electron');
const { ipcRenderer } = electron;

var connection = require('../js/config.js').localConnect();

function addLake() {
  // connect to mysql
  connection.connect(function (err) {
    // in case of error
    if (err) {
      console.log(err.code);
      console.log(err.fatal);
    }
  });

  var codeInput = document.getElementById("lakeCode").value;
  var nameInput = document.getElementById("lakeName").value;

  var sql = "INSERT INTO lakes SET lakeCode = ?, lakeName = ?";
  connection.query(sql, [codeInput,nameInput] , function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
    refreshLakeTable();
  });

}

function refreshLakeTable(){
  ipcRenderer.send('refreshTable',"lake");
}


var x = document.getElementById("addLakeBtn");
x.addEventListener("click", addLake);

