var mysql = require('mysql');
const electron = require('electron');
const { ipcRenderer } = electron;

var connection = require('../js/config.js').localConnect();
function addSpecies() {

    var codeInput = document.getElementById("speciesCode").value;
    var abbrevInput = document.getElementById("speciesAbbrev").value;
    var nameInput = document.getElementById("speciesName").value;
    var depthInput = document.getElementById("speciesDepth").value;

    var sql = "INSERT INTO species SET code = ?, abbrev = ?, name = ?, depth = ?";
    connection.query(sql, [codeInput, abbrevInput, nameInput, depthInput], function (err, result) {
        if (err){
            ipcRenderer.send('errorMessage', err)
            console.log(err);
        }
        console.log("1 record inserted");
        refreshSpeciesTable()
    });
}

function refreshSpeciesTable() {
    ipcRenderer.send('refreshTable', "species");
}

var x = document.getElementById("addSpeciesBtn");
x.addEventListener("click", addSpecies);

