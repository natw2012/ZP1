//Config file for global knex module
//Eliminates repeating in every js file requiring Knex

const settings = require('electron-settings');
var sqlite3 = require('sqlite3').verbose();

var knex = function connect() {
    return knex = require('knex')({
        client: 'sqlite3',
        connection: {
            //Connects to database file saved in settings
            filename: settings.get('database.db') //"zp1.db" 
        },
        useNullAsDefault: true
    });
}

module.exports.connect = knex;

