var mysql = require('mysql');

var con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: null,
  database: "ZP1"
});

function addLake() {
  // connect to mysql
  con.connect(function (err) {
    // in case of error
    if (err) {
      console.log(err.code);
      console.log(err.fatal);
    }
  });

  var codeInput = document.getElementById("lakeCode").value;
  var nameInput = document.getElementById("lakeName").value;
    
  console.log(codeInput, nameInput);

  var sql = "INSERT INTO lakes SET lakeCode = ?, lakeName = ?";
  con.query(sql, [codeInput,nameInput] , function (err, result) {
    if (err) throw err;
    console.log("1 record inserted");
  });

}


var x = document.getElementById("addLakeBtn");
x.addEventListener("click", addLake);

