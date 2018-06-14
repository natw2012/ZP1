var mysql = require('mysql');

console.log(window.location.href );
var connection = require('../js/config.js').localConnect();
function addSpecies() {
    
    var codeInput = document.getElementById("speciesCode").value;
    var abbrevInput = document.getElementById("speciesAbbrev").value;
    var nameInput = document.getElementById("speciesName").value;

    var sql = "INSERT INTO species SET code = ?, abbrev = ?, name = ?";
    connection.query(sql, [codeInput, abbrevInput, nameInput], function (err, result) {
        if (err) throw err;
        console.log("1 record inserted");
        setTimeout(function () {
        if (newState == -1) {
            alert('VIDEO HAS STOPPED');
        }
    }, 5000);
    });

    
}


var x = document.getElementById("addSpeciesBtn");
x.addEventListener("click", addSpecies);

