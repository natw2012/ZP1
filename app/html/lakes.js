// var mysql = require('mysql');
// var bootstrap = require('bootstrap');

// function el(selector) {
//     return document.getElementById(selector);
// }

// el('action-btn').addEventListener('click', function(){
//     // Get the mysql service
//     getFirstTenRows(function(rows){
//         var html = '<th>Lake Code</th><th>Lake Name</th>';

//         rows.forEach(function(row){
//             html += '<tr>';
//             html += '<td>';
//             html += row.lakeCode;
//             html += '</td>';
//             html += '<td>';
//             html += row.lakeName;
//             html += '</td>';
//             html += '</tr>';
//             console.log(row);
//         });

//         document.querySelector('#table > tbody').innerHTML = html;
//     });
// },false);

// function getFirstTenRows(callback){
//     var mysql = require('mysql');

//     // Add the credentials to access your database
//     var connection = mysql.createConnection({
//         host     : 'localhost',
//         user     : 'root',
//         password : null,
//         database : 'ZP1'
//     });

//     // connect to mysql
//     connection.connect(function(err) {
//         // in case of error
//         if(err){
//             console.log(err.code);
//             console.log(err.fatal);
//         }
//     });

//     // Perform a query
//     $query = 'SELECT `lakeCode`,`lakeName` FROM `lakes` LIMIT 10';

//     connection.query($query, function(err, rows, fields) {
//         if(err){
//             console.log("An error ocurred performing the query.");
//             console.log(err);
//             return;
//         }

//         callback(rows);

//         console.log("Query succesfully executed");
//     });

//     // Close the connection
//     connection.end(function(){
//         // The connection has been closed
//     });
// }
