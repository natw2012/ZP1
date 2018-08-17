//Include modules
const $ = require('jquery');
window.$ = window.jQuery = require('jquery');
var Promise = require('bluebird');
Promise.promisifyAll(require("mysql/lib/Connection").prototype);
var photon = require('electron-photon');
const { ipcRenderer } = require('electron');
var dialog = require('electron').remote.dialog;
var fs = require('fs');
var stringify = require('csv-stringify');
var moment = require('moment');
var parse = require('csv-parse');
const settings = require('electron-settings');
const electron = require('electron');
const win = electron.remote.getCurrentWindow();
const chart = require('chart.js');
var sqlite3 = require('sqlite3');
var db = new sqlite3.Database('zp1.db');
var _ = require('underscore');
var knex = require('./js/config.js').connect();
var FileHound = require('filehound');

/************************************************************
        DASHBOARD 
*************************************************************/

var speciesCountChart = null;
var speciesMeasureChart = null;
var biomassSampleSumChart = null;
var sizeChart = null;
var barChart = null;
var radarChart = null;



//Refresh Dashboard
async function refreshDashboard() {
    await loadSampleIDs();
    await loadSubsampleIDs();
    loadDashboard();
    document.getElementById("sampleIDSelect").addEventListener('change', loadDashboard);
    window.addEventListener('resize', resizeCanvas, false);

}
//Load Sample IDs into select
async function loadSampleIDs() {

    //Clear options 
    removeOptions(document.getElementById("sampleIDSelect"));
    removeOptions(document.getElementById("sampleIDSelectCM"));

    var sampleIDs = await knex('samples').select('sampleID');
    var option;
    for (var i = 0; sampleIDs[i] != null; i++) {
        option = document.createElement("option");
        option.text = sampleIDs[i].sampleID;
        option.id = sampleIDs[i].sampleID;
        document.getElementById("sampleIDSelect").appendChild(option);
        document.getElementById("sampleIDSelectCM").appendChild(option);
    }

}
//Load Subsample IDs into select
async function loadSubsampleIDs() {

    var sampleID = getSampleID();
    //Clear options 
    removeOptions(document.getElementById("subsampleIDSelect"));

    var subsampleIDs = await knex('subsamples').select('subsampleID').where('sampleID', sampleID);
    var option;
    for (var i = 0; subsampleIDs[i] != null; i++) {
        option = document.createElement("option");
        option.text = subsampleIDs[i].subsampleID;
        option.id = subsampleIDs[i].subsampleID;
        document.getElementById("subsampleIDSelect").appendChild(option);
    }

}

//Get sample ID from dashboard dropdown
function getSampleID() {
    var e = document.getElementById("sampleIDSelect");
    if (e.options[e.selectedIndex]) {
        var text = e.options[e.selectedIndex].text;
        console.log(text);
        return text;
    }
    else {
        //When database has no samples, return -1
        console.log("Error in sampleID");
        return (-1);
    }
}

//Get sample ID from dashboard dropdown
function getSampleIDCounts() {
    var e = document.getElementById("sampleIDSelectCounts");
    if (e.options[e.selectedIndex]) {
        var text = e.options[e.selectedIndex].text;
        console.log(text);
        return text;
    }
    else {
        //When database has no samples, return -1
        console.log("Error in sampleID");
        return (-1);
    }
}

//Get subsample ID from dashboard dropdown
function getSubsampleID() {
    var e = document.getElementById("subsampleIDSelect");
    if (e.options[e.selectedIndex]) {
        var text = e.options[e.selectedIndex].text;
        console.log(text);
        return text;
    }
    else {
        //When database has no subsamples, return -1
        console.log("Error in subsampleID");
        return (-1);
    }
}

//Load sum of counts for dashboard
async function loadCountsSum() {
    var sampleID = getSampleID();
    var subsampleID = getSubsampleID();
    console.log(subsampleID);
    var total = 0;

    if (subsampleID === "All Subsamples") {
        var allSubsamples = await knex('subsamples').where('sampleID', sampleID);

        for (var i = 0; i < allSubsamples.length; i++) {
            var result = await knex.raw(`
                SELECT count1
                FROM (
                    SELECT COUNT(*) as count1 
                    FROM counts 
                    WHERE subsampleID = ?
                    GROUP BY speciesID) 
                `, allSubsamples[i].subsampleID);
            for (var j = 0; j < result.length; j++) {
                total += result[j].count1;
            }
        }
    }
    else {
        var result = await knex.raw(`
        SELECT count1
            FROM (
                SELECT COUNT(*) as count1 
                FROM counts 
                WHERE subsampleID = ?
                GROUP BY speciesID) 
        `, subsampleID);

        for (var i = 0; i < result.length; i++) {
            total += result[i].count1;
        }
    }

    document.getElementById("countsSum").innerHTML = total;

}

//Load sum of measures for dashboard
async function loadMeasuresSum() {
    var sampleID = getSampleID();
    var subsampleID = getSubsampleID();
    console.log(subsampleID);
    var total = 0;

    if (subsampleID === "All Subsamples") {
        var allSubsamples = await knex('subsamples').where('sampleID', sampleID);

        for (var i = 0; i < allSubsamples.length; i++) {
            var result = await knex.raw(`
                SELECT count1
                FROM (
                    SELECT COUNT(*) as count1 
                    FROM measures 
                    WHERE subsampleID = ?
                    GROUP BY speciesID) 
                `, allSubsamples[i].subsampleID);


            for (var j = 0; j < result.length; j++) {
                console.log(result[j].count1);
                total += result[j].count1;
            }
            console.log(total);
        }
    }
    else {
        var result = await knex.raw(`
        SELECT count1
            FROM (
                SELECT COUNT(*) as count1 
                FROM measures 
                WHERE subsampleID = ?
                GROUP BY speciesID) 
        `, subsampleID);

        for (var i = 0; i < result.length; i++) {
            total += result[i].count1;
        }
        console.log(total);
    }

    document.getElementById("measuresSum").innerHTML = total;
}

//Load chart of species counts
async function loadSpeciesCountChart() {
    var sampleID = getSampleID();
    var subsampleID = getSubsampleID();
    console.log(subsampleID);
    var numSpecies = [];

    if (subsampleID === "All Subsamples") {
        var allSubsamples = await knex('subsamples').where('sampleID', sampleID);

        for (var i = 0; i < allSubsamples.length; i++) {
            var result = await knex.raw(`
                SELECT speciesAbbrev, T1.speciesID, count1
                FROM (
                    SELECT counts.speciesID, COUNT(*) as count1 
                    FROM counts 
                    WHERE subsampleID = ?
                    GROUP BY speciesID) AS T1
                JOIN (
                    SELECT species.speciesID, speciesAbbrev 
                    FROM species) AS T2
                ON T1.speciesID = T2.speciesID
                `, allSubsamples[i].subsampleID);

            for (var j = 0; j < result.length; j++) {
                if (numSpecies.length > 0) {
                    for (var k = 0; k < numSpecies.length; k++) {
                        if (result[j].speciesID == numSpecies[k].speciesID) {
                            numSpecies[k].count1 += result[j].count1;
                            break;
                        }
                        else if (k + 1 === numSpecies.length) {
                            numSpecies.push(result[j]);
                            break;
                        }
                    }
                }
                else {
                    numSpecies.push(result[j]);
                }
            }
        }
    }
    else {
        numSpecies = await knex.raw(`
        SELECT speciesAbbrev, T1.speciesID, count1
        FROM (
            SELECT counts.speciesID, COUNT(*) as count1 
            FROM counts 
            WHERE subsampleID = ?
            GROUP BY speciesID) AS T1
        JOIN (
            SELECT species.speciesID, speciesAbbrev 
            FROM species) AS T2
        ON T1.speciesID = T2.speciesID
        `, subsampleID);
    }
    console.log(numSpecies);
    var str = JSON.parse(JSON.stringify(numSpecies));
    console.log(str);
    var labels = [];
    var data = [];
    for (var i = 0; i < numSpecies.length; i++) {
        console.log(numSpecies[i].speciesAbbrev);
        console.log(numSpecies[i].count1);
        data.push(numSpecies[i].count1)
        labels.push(numSpecies[i].speciesAbbrev);
    }

    console.log(labels, data);

    var ctx = document.getElementById("speciesCountChart").getContext('2d');

    if (speciesCountChart != null) {
        speciesCountChart.destroy();
        console.log("Destroyed");
    }
    speciesCountChart = new Chart(ctx, {
        type: 'doughnut',
        options: {
            title: {
                display: true,
                text: "# Species Counted In Sample",
            },
        },
        data: {
            labels: labels,
            datasets: [{
                label: 'Species',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        }
    })
}

//Load chart of species measures
async function loadSpeciesMeasureChart() {
    var sampleID = getSampleID();
    var subsampleID = getSubsampleID();
    console.log(subsampleID);
    var numSpecies = [];

    if (subsampleID === "All Subsamples") {
        var allSubsamples = await knex('subsamples').where('sampleID', sampleID);

        for (var i = 0; i < allSubsamples.length; i++) {
            var result = await knex.raw(`
                SELECT speciesAbbrev, T1.speciesID, count1
                FROM (
                    SELECT measures.speciesID, COUNT(*) as count1 
                    FROM measures 
                    WHERE subsampleID = ?
                    GROUP BY speciesID) AS T1
                JOIN (
                    SELECT species.speciesID, speciesAbbrev 
                    FROM species) AS T2
                ON T1.speciesID = T2.speciesID
                `, allSubsamples[i].subsampleID);

            for (var j = 0; j < result.length; j++) {
                if (numSpecies.length > 0) {
                    for (var k = 0; k < numSpecies.length; k++) {
                        if (result[j].speciesID == numSpecies[k].speciesID) {
                            numSpecies[k].count1 += result[j].count1;
                            break;
                        }
                        else if (k + 1 === numSpecies.length) {
                            numSpecies.push(result[j]);
                            break;
                        }
                    }
                }
                else {
                    numSpecies.push(result[j]);
                }
            }
        }
    }
    else {
        numSpecies = await knex.raw(`
            SELECT speciesAbbrev, T1.speciesID, count1
        FROM (
            SELECT measures.speciesID, COUNT(*) as count1 
            FROM measures 
            WHERE subsampleID = ?
            GROUP BY speciesID) AS T1
        JOIN (
            SELECT species.speciesID, speciesAbbrev 
            FROM species) AS T2
        ON T1.speciesID = T2.speciesID
        `, subsampleID);
    }

    console.log(numSpecies);

    var str = JSON.parse(JSON.stringify(numSpecies));
    console.log(str);
    var labels = [];
    var data = [];
    for (var i = 0; i < numSpecies.length; i++) {
        console.log(numSpecies[i].speciesAbbrev);
        console.log(numSpecies[i].count1);
        data.push(numSpecies[i].count1)
        labels.push(numSpecies[i].speciesAbbrev);
    }

    console.log(labels, data);

    var ctx = document.getElementById("speciesMeasureChart").getContext('2d');

    if (speciesMeasureChart != null) {
        speciesMeasureChart.destroy();
        console.log("Destroyed");
    }
    speciesMeasureChart = new Chart(ctx, {
        type: 'pie',
        options: {
            title: {
                display: true,
                text: "# Species Measured In Sample",
            },
        },
        data: {
            labels: labels,
            datasets: [{
                label: 'Species',
                data: data,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(54, 162, 235, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(153, 102, 255, 0.2)',
                    'rgba(255, 159, 64, 0.2)'
                ],
                borderColor: [
                    'rgba(255,99,132,1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(75, 192, 192, 1)',
                    'rgba(153, 102, 255, 1)',
                    'rgba(255, 159, 64, 1)'
                ],
                borderWidth: 1
            }]
        }
    })
}

//Load size chart
async function loadSizeChart() {

    var species = await knex.raw(`
    SELECT DISTINCT speciesID
    FROM measures
    `);
    var results = [];
    for (var i = 0; i < species[0].length; i++) {
        results.push(await knex.raw(`
        select speciesID, length
        FROM measures
        WHERE (length > 0) AND (speciesID = ?)
        `, species[0][i].speciesID));

    }
    console.log(result);
    var species1 = {
        labels: [],
        dataset: [],
    };
    var species2 = {
        labels: [],
        dataset: [],
    };

    // for (var i = 0; i < results[0][0].length; i++) {
    // species1.dataset.push(results[0][0][i].length);
    // species1.labels.push(results[0][0][i].species);
    // species2.dataset.push(results[1][0][i].length);
    // species2.labels.push(results[1][0][i].species);
    // }

    var ctx = document.getElementById("sizeChart").getContext('2d');

    if (sizeChart != null) {
        sizeChart.destroy();
    }
    sizeChart = new Chart(ctx, {
        type: 'scatter',
        // data: {
        // labels: species1.labels,
        // datasets: [{
        //     label: species1.labels[0],
        //     data: species1.dataset,
        //     backgroundColor: 'rgba(255, 99, 132, 0.2)',
        //     borderColor: 'rgba(255,99,132,1)',
        //     borderWidth: 1,
        //     lineTension: 0,
        // }, {
        //     label: species2.labels[0],
        //     data: species2.dataset,
        //     backgroundColor: 'rgba(54, 162, 235, 0.2)',
        //     borderColor: 'rgba(54, 162, 235, 1)',
        //     borderWidth: 1,
        //     lineTension: 0,
        // }]

        // }
        "data": {
            "labels": ["January", "February", "March", "April", "May", "June", "July"],
            "datasets": [{
                "label": "My First Dataset",
                "data": [65, 59, 80, 81, 56, 55, 40],
                "fill": false,
                "backgroundColor": ["rgba(255, 99, 132, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                    "rgba(255, 205, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(201, 203, 207, 0.2)"
                ],
                "borderColor": [
                    "rgb(255, 99, 132)",
                    "rgb(255, 159, 64)",
                    "rgb(255, 205, 86)",
                    "rgb(75, 192, 192)",
                    "rgb(54, 162, 235)",
                    "rgb(153, 102, 255)",
                    "rgb(201, 203, 207)"
                ],
                "borderWidth": 1
            }]
        },
        "options": {
            "scales": {
                "yAxes": [{
                    "ticks": {
                        "beginAtZero": true
                    }
                }
                ]
            }
        }
    })
}

//Load chart of biomass sample sums 
async function loadBiomassSampleSumChart() {

    var sampleID = getSampleID();
    var subsampleID = getSubsampleID();
    console.log(subsampleID);
    var numSpecies = [];

    if (subsampleID === "All Subsamples") {
        var allSubsamples = await knex('subsamples').where('sampleID', sampleID);

        for (var i = 0; i < allSubsamples.length; i++) {
            var result = await knex.raw(`
                SELECT speciesAbbrev, T1.speciesID, sum1
                FROM (
                    SELECT speciesID, SUM(volume) as sum1 
                    FROM measures 
                    WHERE subsampleID = ?
                    GROUP BY speciesID) AS T1
                JOIN (
                    SELECT species.speciesID, speciesAbbrev 
                    FROM species) AS T2
                ON T1.speciesID = T2.speciesID
                `, allSubsamples[i].subsampleID);

            for (var j = 0; j < result.length; j++) {
                if (numSpecies.length > 0) {
                    for (var k = 0; k < numSpecies.length; k++) {
                        if (result[j].speciesID == numSpecies[k].speciesID) {
                            numSpecies[k].sum1 += result[j].sum1;
                            break;
                        }
                        else if (k + 1 === numSpecies.length) {
                            numSpecies.push(result[j]);
                            break;
                        }
                    }
                }
                else {
                    numSpecies.push(result[j]);
                }
            }
        }
    }
    else {
        numSpecies = await knex.raw(`
        SELECT speciesAbbrev, T1.speciesID, sum1
        FROM (
            SELECT speciesID, SUM(volume) as sum1 
            FROM measures 
            WHERE subsampleID = ?
            GROUP BY speciesID) AS T1
        JOIN (
            SELECT species.speciesID, speciesAbbrev 
            FROM species) AS T2
        ON T1.speciesID = T2.speciesID
        `, subsampleID);
    }

    console.log(numSpecies);

    var str = JSON.parse(JSON.stringify(numSpecies));
    console.log(str);
    var labels = [];
    var data = [];
    for (var i = 0; i < numSpecies.length; i++) {
        console.log(numSpecies[i].speciesAbbrev);
        console.log(numSpecies[i].sum1);
        data.push(numSpecies[i].sum1)
        labels.push(numSpecies[i].speciesAbbrev);
    }

    console.log(labels, data);

    var ctx = document.getElementById("biomassSampleSumChart").getContext('2d');

    if (biomassSampleSumChart != null) {
        biomassSampleSumChart.destroy();
        console.log("Destroyed");
    }
    biomassSampleSumChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: "Dataset",
                data: data,
                fill: false,
                backgroundColor: ["rgba(255, 99, 132, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                    "rgba(255, 205, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(201, 203, 207, 0.2)"
                ],
                borderColor: [
                    "rgb(255, 99, 132)",
                    "rgb(255, 159, 64)",
                    "rgb(255, 205, 86)",
                    "rgb(75, 192, 192)",
                    "rgb(54, 162, 235)",
                    "rgb(153, 102, 255)",
                    "rgb(201, 203, 207)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            title: {
                display: true,
                text: "Biomass in Sample",
            },
            "scales": {
                "yAxes": [{
                    "ticks": {
                        "beginAtZero": true
                    }
                }
                ]
            }
        }
    });
}

//Bar chart for testing
async function loadBarChart() {
    var ctx = document.getElementById("barChart").getContext('2d');
    var data = [1, 2, 3, 4];
    var options = "";

    var species = await knex.raw(`
    SELECT DISTINCT speciesID
    FROM measures
    `);

    if (barChart != null) {
        barChart.destroy();
    }
    barChart = new Chart(ctx, {
        "type": "bar",
        "data": {
            "labels": ["January", "February", "March", "April", "May", "June", "July"],
            "datasets": [{
                "label": "My First Dataset",
                "data": [65, 59, 80, 81, 56, 55, 40],
                "fill": false,
                "backgroundColor": ["rgba(255, 99, 132, 0.2)",
                    "rgba(255, 159, 64, 0.2)",
                    "rgba(255, 205, 86, 0.2)",
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(153, 102, 255, 0.2)",
                    "rgba(201, 203, 207, 0.2)"
                ],
                "borderColor": [
                    "rgb(255, 99, 132)",
                    "rgb(255, 159, 64)",
                    "rgb(255, 205, 86)",
                    "rgb(75, 192, 192)",
                    "rgb(54, 162, 235)",
                    "rgb(153, 102, 255)",
                    "rgb(201, 203, 207)"
                ],
                "borderWidth": 1
            }]
        },
        "options": {
            "scales": {
                "yAxes": [{
                    "ticks": {
                        "beginAtZero": true
                    }
                }
                ]
            }
        }
    });
}

//Radar chart for testing
async function loadRadarChart() {
    var ctx = document.getElementById("radarChart").getContext('2d');
    var data = [1, 2, 3, 4];
    var options = "";

    if (radarChart != null) {
        radarChart.destroy();
    }
    radarChart = new Chart(ctx, { "type": "radar", "data": { "labels": ["Eating", "Drinking", "Sleeping", "Designing", "Coding", "Cycling", "Running"], "datasets": [{ "label": "My First Dataset", "data": [65, 59, 90, 81, 56, 55, 40], "fill": true, "backgroundColor": "rgba(255, 99, 132, 0.2)", "borderColor": "rgb(255, 99, 132)", "pointBackgroundColor": "rgb(255, 99, 132)", "pointBorderColor": "#fff", "pointHoverBackgroundColor": "#fff", "pointHoverBorderColor": "rgb(255, 99, 132)" }, { "label": "My Second Dataset", "data": [28, 48, 40, 19, 96, 27, 100], "fill": true, "backgroundColor": "rgba(54, 162, 235, 0.2)", "borderColor": "rgb(54, 162, 235)", "pointBackgroundColor": "rgb(54, 162, 235)", "pointBorderColor": "#fff", "pointHoverBackgroundColor": "#fff", "pointHoverBorderColor": "rgb(54, 162, 235)" }] }, "options": { "elements": { "line": { "tension": 0, "borderWidth": 3 } } } });
}

//Adjust canvas for window size changes
function resizeCanvas() {
    canvas = document.querySelectorAll("canvas");
    console.log(canvas);
    canvas.forEach(function (item, index) {
        console.log(item, index);
        item.style.width = '100%';
        item.style.height = '100%';
        item.width = item.offsetWidth;
        item.height = item.offsetHeight;
    })

    loadDashboard();
}


//Load all Dashboard components
function loadDashboard() {

    loadCountsSum();
    loadMeasuresSum();
    loadSpeciesCountChart();
    loadSpeciesMeasureChart();
    loadBiomassSampleSumChart();
    // loadSizeChart();
    // loadBarChart();
    // loadRadarChart();
}



/************************************************************
        TABLES 
*************************************************************/
//Import file to table using OS Dialog
function importData(table) {
    dialog.showOpenDialog({
        filters: [{ name: 'csv', extensions: ['csv'] }
        ]
    }, function (fileNames) {
        if (fileNames === undefined) return;

        var fileName = fileNames[0];

        fs.readFile(fileName, 'utf-8', function (err, data) {
            console.log(data);
            parse(data, async function (err, output) {
                console.log(output);

                for (var i = 0; i < output.length; i++) {
                    //Raw parameter binding
                    var result = await knex.raw('INSERT INTO ?? VALUES (' + output[i].map(_ => '?').join(',') + ')', [table, ...output[i]]);
                }
                // var result = await knex.raw('INSERT INTO ?? (' + header.map(_ => '?').join(',') + ') VALUES (' + output.map(_=> '?').join(',') + ')' , [table, header, output1]);
                // console.log(result);
                if (table === "species") {
                    loadSpecies(table);
                }
                else if (table === "groups") {
                    loadGroups(table);
                }
                else if (table === "counts") {
                    loadCounts(table);
                }
                else if (table === "measures") {
                    loadMeasures(table);
                }
                else if (table === "samples") {
                    loadSamples(table);
                }
                else if (table === "subsamples") {
                    loadSubsamples(table);
                }
                else if (table === "formulas") {
                    loadFormulas(table);
                }
                else if (table === "lakes") {
                    loadLakes(table);
                }
                else if (table === "gears") {
                    loadGears(table);
                }
                else if (table === "calibrations") {
                    loadCalibrations(table);
                }
                else {
                    ipcRenderer.send('errorMessage', win.id, "Error Importing");
                }
                //Callback issue again
                scrollTable();
                ipcRenderer.send('refreshCountAndMeasureDropdowns');
            })
        })
    })
}

//Includes Headers
//Exports a given table using OS Dialog
function exportData(table) {
    dialog.showSaveDialog({
        filters: [{ name: 'csv', extensions: ['csv'] }
        ]
    }, async function (fileName) {
        if (fileName === undefined) return;
        var result = await knex(table).columnInfo();
        console.log(result);
        var header = Object.keys(result);
        console.log(header)

        var sampleID = getSampleIDCounts();

        var result = await knex(table).select();
        console.log(result);

        stringify(result, function (err, output) {
            fs.writeFile(fileName, header + "\n" + output, function (err) {
                if (err === null) {

                    dialog.showMessageBox(win, {
                        message: "The file has been saved! :-)",
                        buttons: ["OK"]
                    });
                } else {
                    ipcRenderer.send('errorMessage', err);
                    dialog.showErrorBox("Error", err.message); //Not sure if this works
                }
            });
        });
    });
}

//Change to join counts/measures with samples by sampleID, species by speciesID, samples with lakes by lakeID and with gear by gearID
function exportJoinedData(cm, subsample, sample, lake, species, group, gear) {
    // table1 = counts/measures
    // table2 = subsamples
    // table3 = samples
    // table4 = lakes
    // table5 = species
    // table6 = groups
    // table7 = gears



    dialog.showSaveDialog({
        filters: [{ name: 'csv', extensions: ['csv'] }
        ]
    }, async function (fileName) {
        if (fileName === undefined) return;
        var sampleID = getSampleIDCounts();
        // var result = await knex.from(function(){
        //     this.select('*').from(cm)
        //     .leftJoin(subsample, cm + '.subsampleID', subsample + '.subsampleID')
        //     .leftJoin(sample, subsample + '.sampleID', sample + '.sampleID')
        //     .leftJoin(lake, sample + '.lakeID', lake + '.lakeID')
        //     .leftJoin(species, cm + '.speciesID', species + '.speciesID')
        //     .leftJoin(group, species + '.groupID', group + '.groupID')
        //     .leftJoin(gear, sample + '.gearID', gear + '.gearID')
        // })           
        //     .where('sampleID', sampleID);

        var result = await knex.from(
            (knex(cm).select('*')
            .leftJoin(subsample, cm + '.subsampleID', subsample + '.subsampleID').as('T2')
            .leftJoin(sample, subsample + '.sampleID', sample + '.sampleID').as('T3')
            .leftJoin(lake, sample + '.lakeID', lake + '.lakeID').as('T4')
            .leftJoin(species, cm + '.speciesID', species + '.speciesID').as('T5')
            .leftJoin(group, species + '.groupID', group + '.groupID').as('T6')
            .leftJoin(gear, sample + '.gearID', gear + '.gearID').as('T7')
            )
            .as('T1')
        )
        .select()
        .where('sampleID',sampleID);
        // console.log(subquery);


        // var result = await knex.raw(`SELECT * FROM ?? LEFT JOIN ?? ON ??.sampleID = ??.sampleID`,
        // [table1, table2, table1, table2]);
        console.log(result);
        var header = [];
        console.log(header)
        var fields = Object.keys(result[0]);
        console.log(fields);
        for (var i = 0; i < fields.length; i++) {
            console.log(fields[i]);
            //Sketchy way of doing it, should replace
            var flag = 0;
            for (var j = 0; j < header.length; j++) {
                if (fields[i] === header[j] || fields[i] === header[j] + ":1") {
                    flag = 1;
                }
            }
            if (flag === 0) {
                header.push(fields[i]);
            }

        }
        console.log(header);
        stringify(result, {
            formatters: {
                date: function (value) {
                    return moment(value).format('YYYY-MM-DD');
                }
            }
        }, function (err, output) {
            console.log(output);
            fs.writeFile(fileName, header + "\n" + output, function (err) {
                if (err === null) {

                    dialog.showMessageBox(win, {
                        message: "The file has been saved! :-)",
                        buttons: ["OK"]
                    });
                } else {
                    dialog.showErrorBox("Error", err.message); //Not sure if this works
                }
            });
        });
    });
}

function importCount() {
    importData("counts");
}

function importSpecies() {
    importData("species");
}

function importGroups() {
    importData("groups");
}

function importMeasure() {
    importData("measures");
}

function importSamples() {
    importData("samples");
}

function importFormulas() {
    importData("formulas");
}

function importLakes() {
    importData("lakes");
}

function importCalibrations() {
    importData("calibrations");
}

function exportCount() {
    exportData("counts");
}

function exportMeasure() {
    exportData("measures");
}

//Export MySql Count Table to csv file
function exportJoinedCount() {
    exportJoinedData("counts", "subsamples", "samples", "lakes", "species", "groups", "gears");
}

//Export MySql Measure Table to csv file
function exportJoinedMeasure() {
    exportJoinedData("measures", "subsamples", "samples", "lakes", "species", "groups", "gears");
}


//Receive call from another window
ipcRenderer.on('refreshTable', function (e, table) {
    console.log(table);
    if (table === "counts") {
        loadCounts(table, scrollTable);
    }
    else if (table === "measures") {
        loadMeasures(table, scrollTable);
    }
    else if (table === "lakes") {
        loadLakes(table, scrollTable);
    }
    else if (table === "species") {
        loadSpecies(table, scrollTable);
    }
    else if (table === "groups") {
        loadGroups(table, scrollTable);
    }
    else if (table === "samples") {
        loadSamples(table, scrollTable);
    }
    else if (table === "subsamples") {
        loadSubsamples(table, scrollTable);
    }
    else if (table === "gears") {
        loadGears(table, scrollTable);
    }
    else if (table === "calibrations") {
        loadCalibrations(table, scrollTable);
    }
    else {
        console.log("No table");
        return;
    }
});

//Scrolls table down to the bottom to see new inputted data
function scrollTable() {
    var tbl = document.getElementById('tableSection');
    tbl.scrollTop = tbl.scrollHeight;
    console.log(tbl, tbl.scrollTop, tbl.scrollHeight);
}

//Make the Edit Window
function makeEditWindow(btn, table) {

    var row = btn.parentNode.parentNode;
    var info = [];
    for (var i = 0; i < row.cells.length - 3; i++) {
        info.push(row.cells[i].innerHTML);
    }
    // var id = row.getElementsByClassName('code')[0].innerText;
    //maybe add a pause to reduce flashing
    ipcRenderer.send('showEditWindow', table, info);
}


//Load Info Browser Window 
function makeInfoWindow(btn, table) {
    var row = btn.parentNode.parentNode;
    var info = [];
    for (var i = 0; i < row.cells.length - 3; i++) {
        info.push(row.cells[i].innerHTML);
    }
    // var id = row.getElementsByClassName('code')[0].innerText;
    //maybe add a pause to reduce flashing
    ipcRenderer.send('showInfoWindow', table, info)
}

function showCountWindow() {
    ipcRenderer.send('showCountWindow');
}

function showMeasureWindow() {
    ipcRenderer.send('showMeasureWindow');
}

//Load Species page
function loadSpecies(table, callback) {
    var html = '<button class="btn btn-default" id="addSpeciesBtn" onclick="loadAddWindow(\'species\')">Add Species</button>';
    html += '<button class="btn btn-default" id="importSpecies" onclick="importSpecies()">Import Species List</button><br></br>';
    document.querySelector('#buttonSection').innerHTML = html;

    var exportHTML = '';
    document.querySelector('#exportSection').innerHTML = exportHTML;

    loadTable(table, callback);
}

//Load Groups page
function loadGroups(table, callback) {
    var html = '<button class="btn btn-default" id="addGroupBtn" onclick="loadAddWindow(\'groups\')">Add Group</button>';
    html += '<button class="btn btn-default" id="importGroups" onclick="importGroups()">Import Group List</button><br></br>';
    document.querySelector('#buttonSection').innerHTML = html;

    var exportHTML = '';
    document.querySelector('#exportSection').innerHTML = exportHTML;

    loadTable(table, callback);
}

//Load Count page
function loadCounts(table, callback) {
    var html = '<button class="btn btn-default" id="startCountBtn" onclick="showCountWindow()">Start Counting</button>';
    html += '<button class="btn btn-default" id="importCount" onclick="importCount()">Import Data</button><br></br>';


    document.querySelector('#buttonSection').innerHTML = html;

    var exportHTML = '<label id="sampleIDLblCM" for="sampleIDSelectCM">Sample ID:</label>';
    exportHTML += '<select id="sampleIDSelectCM">';
    exportHTML += '<option value="Select Sample ID">Select Sample ID</option>';
    exportHTML += '</select>';
    exportHTML += '<button class="btn btn-default" id="exportCountBtn" onclick="exportCount()">Export Data</button>';
    exportHTML += '<button class="btn btn-default" id="exportJoinedCountBtn" onclick="exportJoinedCount()">Export Joined Data</button>';
    
    loadSampleIDs();

    document.querySelector('#exportSection').innerHTML = exportHTML;

    loadTable(table, callback);

}

//Load Measures page
function loadMeasures(table, callback) {

    var html = '<button class="btn btn-default" id="startMeasureBtn" onclick="showMeasureWindow()">Start Measuring</button>';
    html += '<button class="btn btn-default" id="importMeasureBtn" onclick="importMeasure()">Import Data</button><br></br>';
    document.querySelector('#buttonSection').innerHTML = html;

    var exportHTML = '<label id="sampleIDLblCM" for="sampleIDSelectCM">Sample ID:</label>';
    exportHTML += '<select id="sampleIDSelectCM">';
    exportHTML += '<option value="Select Sample ID">Select Sample ID</option>';
    exportHTML += '</select>';
    exportHTML += '<button class="btn btn-default" id="exportMeasureBtn" onclick="exportMeasure()">Export Data</button>';
    exportHTML += '<button class="btn btn-default" id="exportJoinedMeasureBtn" onclick="exportJoinedMeasure()">Export Joined Data</button>';

    document.querySelector('#exportSection').innerHTML = exportHTML;

    loadSampleIDs();

    loadTable(table, callback);
}

//Load Formulas page
function loadFormulas(table, callback) {
    var html = '<button class="btn btn-default" id="addFormulaBtn" onclick="loadAddFormula(\'formula\')">Add Formula</button>';
    html += '<button class="btn btn-default" id="importFormulasBtn" onclick="importFormulas()">Import Formulas</button><br></br>';

    document.querySelector('#buttonSection').innerHTML = html;

    var exportHTML = '';
    document.querySelector('#exportSection').innerHTML = exportHTML;

    loadTable(table, callback);
}

//Load Lakes page
function loadLakes(table, callback) {
    var html = '<button class="btn btn-default" id="addLakeBtn" onclick="loadAddWindow(\'lakes\')">Add Lake</button>';
    html += '<button class="btn btn-default" id="importLakesBtn" onclick="importLakes()">Import Lakes</button><br></br>';

    document.querySelector('#buttonSection').innerHTML = html;

    var exportHTML = '';
    document.querySelector('#exportSection').innerHTML = exportHTML;

    loadTable(table, callback);
}

//Load Attributes page
function loadAttributes() {
    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/attributes.html" ></object>';
}

//Load Gear page
function loadGears(table, callback) {
    var html = '<button class="btn btn-default" id="addGearBtn" onclick="loadAddWindow(\'gears\')">Add Gear</button>';
    html += '<button class="btn btn-default" id="importGearsBtn" onclick="importGears()">Import Gears</button><br></br>';

    document.querySelector('#buttonSection').innerHTML = html;

    var exportHTML = '';
    document.querySelector('#exportSection').innerHTML = exportHTML;

    loadTable(table, callback);

    // document.getElementById("content").innerHTML = '<object type="text/html" data="html/gear.html" ></object>';
}

//Load Samples Page
function loadSamples(table, callback) {
    var html = '<button class="btn btn-default" id="addSampleBtn" onclick="loadAddWindow(\'samples\')">Add Sample</button>';
    html += '<button class="btn btn-default" id="importSamplesBtn" onclick="importSamples()">Import Samples</button><br></br>';

    document.querySelector('#buttonSection').innerHTML = html;

    var exportHTML = '';
    document.querySelector('#exportSection').innerHTML = exportHTML;

    loadTable(table, callback);
}

//Load Subsamples Page
function loadSubsamples(table, callback) {
    var html = '<button class="btn btn-default" id="addSubsampleBtn" onclick="loadAddWindow(\'subsamples\')">Add Subsample</button>';
    html += '<button class="btn btn-default" id="importSubsamplesBtn" onclick="importSubsamples()">Import Subsamples</button><br></br>';

    document.querySelector('#buttonSection').innerHTML = html;

    var exportHTML = '';
    document.querySelector('#exportSection').innerHTML = exportHTML;

    loadTable(table, callback);
}

//Load Calibrations Page
function loadCalibrations(table, callback) {
    var html = '<button class="btn btn-default" id="addCalibrationBtn" onclick="loadAddWindow(\'calibrations\')">Add Calibration</button>';
    html += '<button class="btn btn-default" id="importCalibrationsBtn" onclick="importCalibrations()">Import Calibrations</button><br></br>';

    document.querySelector('#buttonSection').innerHTML = html;

    var exportHTML = '';
    document.querySelector('#exportSection').innerHTML = exportHTML;

    loadTable(table, callback);
}

//Load Add Browser Window 
function loadAddWindow(table) {
    ipcRenderer.send('showAddWindow', table);
}

//Load Table function, used by several other functions
async function loadTable(table, callback) {

    try {
        var fields = await knex.raw('PRAGMA TABLE_INFO(??)', table);
        console.log(fields);
        var html = "";
        var headers = [];
        for (var i = 0; i < fields.length; i++) {
            headers.push(fields[i].name);
        }
        var result = await knex.raw('SELECT * FROM ??', table);
        console.log(result);

        //Build table headers
        html += '<thead>';
        for (var i = 0; i < headers.length; i++) {
            html += '<th>';
            html += headers[i].toUpperCase();
            html += '</th>';
        }
        for (var i = 0; i < 3; i++) {
            html += '<th>';
            html += 'ACTIONS';
            html += '</th>';
        }
        console.log(headers);
        html += '</thead>';

        result.forEach(function (row) {
            html += '<tr>';

            //Dynamically get row.property from header strings
            headers.forEach(function (header) {
                html += '<td>';
                html += row[header];
                html += '</td>';
            })
            html += '<td>';
            html += '<button type= "button" class="btn btn-default" value="Info" onclick="makeInfoWindow(this,\'' + table + '\')">Info</button>';
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="Edit" onclick="makeEditWindow(this,\'' + table + '\')">Edit</button>';
            html += '</td>';
            html += '<td>';
            html += '<button type="button" class="btn btn-default" value="' + row[headers[0]] + '" onclick="deleteRow(this,\'' + table + '\')">Delete</button>'; //Requires primary key to be 1st column
            html += '</td>';
            html += '</tr>';
            console.log(row);
        });

        //Inject html and build table contents
        document.querySelector('#table').innerHTML = html;

        // callback(rows);

        console.log("Query succesfully executed");
        typeof callback === 'function' && callback();
    } catch (err) {
        ipcRenderer.send('errorMessage', win, err.message);
    }
}

//Remove row from html table and from MySql database
function deleteRow(btn, table) {

    //Confirm delete
    dialog.showMessageBox(win, {
        type: "question",
        buttons: ['Yes', 'No'],
        defaultId: 0,
        message: "Are you sure you would like to delete?",

    }, async function (response) {
        if (response === 0) { //If user clicks yes
            var row = btn.parentNode.parentNode;
            var code = btn.value;

            row.parentNode.removeChild(row);
            var result = await knex.raw(`PRAGMA TABLE_INFO(??)`, table);
            console.log(result);
            //Find primary key column
            var primaryKey;
            for (var i = 0; i < result.length; i++) {
                if (result[i].pk === 1) {
                    primaryKey = result[i].name;
                }
            }
            console.log(primaryKey);

            //Remove from database
            var result = await knex.raw(`DELETE FROM ?? WHERE ?? = ?`, [table, primaryKey, code]);

            ipcRenderer.send('refreshCountAndMeasureDropdowns');
        }
    }
    );
}

/************************************************************
        SETTINGS 
*************************************************************/
function loadDBSettings() {
    var w = document.getElementById("DBSettings");
    // var x = document.getElementById("DBFile");
    // var y = document.getElementById("DBCreate");
    // var z = document.getElementById("DBDelete");

    w.style.display = "block";
    // x.style.display = "none";
    // y.style.display = "none";
    // z.style.display = "none";
}
//Load Select Database File Tab
// function loadDBFile() {
//     var w = document.getElementById("DBSettings");
//     var x = document.getElementById("DBFile");
//     var y = document.getElementById("DBCreate");
//     var z = document.getElementById("DBDelete");

//     w.style.display = "none";
//     x.style.display = "block";
//     y.style.display = "none";
//     z.style.display = "none";
// }
// //Load Create Database Tab
// function loadDBCreate() {
//     var w = document.getElementById("DBSettings");
//     var x = document.getElementById("DBFile");
//     var y = document.getElementById("DBCreate");
//     var z = document.getElementById("DBDelete");

//     w.style.display = "none";
//     x.style.display = "none";
//     y.style.display = "block";
//     z.style.display = "none";
// }
// //Load Delete Database Tab
// function loadDBDelete() {
//     var w = document.getElementById("DBSettings");
//     var x = document.getElementById("DBFile");
//     var y = document.getElementById("DBCreate");
//     var z = document.getElementById("DBDelete");

//     w.style.display = "none";
//     x.style.display = "none";
//     y.style.display = "none";
//     z.style.display = "block";

// }

//Save Database Setting
function setDB() {
    var dbDatabase = document.getElementById("dbDatabase").value;
    settings.set('database', {
        db: dbDatabase
    });
    dialog.showMessageBox(win, { message: "Set database as: " + dbDatabase });
    ipcRenderer.send('refreshOnDBChange');
}

//Load database from MySql Database into dropdown
function loadDBSelect() {
    //Clear options 
    // removeOptions(document.getElementById("deleteDatabaseSelect"));
    console.log(document.getElementById("dbDatabase"));

    console.log("test");
    // Perform a query
    // var $query = "SHOW DATABASES"
    // connection.query($query, function (err, result, fields) {
    //     if (err) {
    //         ipcRenderer.send('errorMessage', win.id, err.message);
    //         console.log("An error ocurred performing the query.");
    //         console.log(err);
    //         return;
    //     }
    //     var option;
    //     for (var i = 0; result[i] != null; i++) {
    //         option = document.createElement("option");
    //         option.text = result[i].Database;
    //         option.id = result[i].Database;
    //         document.getElementById("dbDatabase").appendChild(option);
    //         document.getElementById("deleteDatabaseSelect").appendChild(option.cloneNode(true));
    //     }
    //     console.log("Query succesfully executed");

    //     //Show saved database 
    //     var e = document.getElementById("dbDatabase");
    //     e.value = settings.get('database.db');
    // });

}

function selectDBFile() {
    dialog.showOpenDialog({
        filters: [{ name: 'db', extensions: ['db'] }
        ]
    }, function (fileNames) {
        if (fileNames === undefined) return;
        var filename = fileNames[0].replace(/^.*[\\\/]/, '')
        console.log(filename);
        settings.set('database', {
            db: filename
        });
        dialog.showMessageBox(win, { message: "Set database as: " + filename });
        ipcRenderer.send('refreshOnDBChange');
    })
}
//Clear options from select dropdown
function removeOptions(selectBox) {
    console.log(selectBox);
    if (selectBox) {
        for (var i = selectBox.options.length - 1; i > 0; i--) {
            selectBox.remove(i);
        }
    }

}

//New Database
async function createNewDatabase() {
    dialog.showSaveDialog({
        filters: [{ name: 'db', extensions: ['db'] }
        ]
    }, async function (fileName) {
        if (fileName === undefined) return;
        console.log(fileName);
        //empty content as parameter
        var content = "";
        fs.writeFile(fileName, content, function (err) {
            if (err) {
                console.log(err);
            }
        })
        var knex = require('knex')({
            client: 'sqlite3',
            connection: {
                filename: fileName
            },
            useNullAsDefault: true
        });

        var result = await knex.raw(`CREATE TABLE counts (countID INTEGER PRIMARY KEY AUTOINCREMENT, speciesID int(3), speciesType varchar(10), subsampleID varchar(5))`);
        var result = await knex.raw(`CREATE TABLE countTypes (countType varchar(10) PRIMARY KEY)`);
        var result = await knex('counttypes').insert([{ countType: 'Cell' }, { countType: 'Natural Units' }]);
        var result = await knex.raw(`CREATE TABLE lakes (lakeID INTEGER PRIMARY KEY AUTOINCREMENT, lakeName varchar(10))`);
        var result = await knex.raw(`CREATE TABLE measures (measureID INTEGER PRIMARY KEY AUTOINCREMENT, speciesID int(3), length float(10), width float(10), area float(10), volume float(10), subsampleID varchar(5))`);
        var result = await knex.raw(`CREATE TABLE species (speciesID int(3) PRIMARY KEY, speciesAbbrev varchar(8), speciesName varchar(20), depth int(11), groupID varchar(5))`);
        var result = await knex.raw(`CREATE TABLE groups (groupID varchar(5) PRIMARY KEY, groupName varchar(50))`);
        var result = await knex.raw(`CREATE TABLE samples (sampleID varchar(5) PRIMARY KEY, type varchar(5), lakeID int(4), sampleDate date, crewChief varchar(5), gearID int(3), stationID int(3), numTow int(3), towLength int(5), sampleVolume float(5))`);
        var result = await knex.raw(`CREATE TABLE subsamples (subsampleID varchar(5) PRIMARY KEY, sampleID varchar(5), subsampledate date, subsampleVolume float(5))`);
        var result = await knex.raw(`CREATE TABLE calibrations (calibrationID INTEGER PRIMARY KEY AUTOINCREMENT, calibrationName varchar(10), pixelToDistanceRatio float(25))`);
        var result = await knex.raw(`CREATE TABLE formulas (formulaID int(5) PRIMARY KEY, formulaName varchar(20))`);
        var result = await knex.raw(`CREATE TABLE gears (gearID int(3) PRIMARY KEY, gearType varchar(5), gearDesc varchar(25), meshSize int(4), diameter int(6), area int(6), volume int(6))`);


        //Set new database
        dialog.showMessageBox(win, {
            type: "question",
            buttons: ['Yes', 'No'],
            defaultId: 0,
            message: "Succesfully Created New Database. Would you like to use this database now?",

        }, function (response) {
            if (response === 0) { //If user clicks 'Yes'
                var filename = fileName.replace(/^.*[\\\/]/, '')
                settings.set('database', {
                    db: filename
                });
                dialog.showMessageBox(win, { message: "Set database as: " + filename });
                ipcRenderer.send('refreshOnDBChange');
            }
        }
        );
    })
}


//Delete database
function deleteDatabase() {

    dialog.showMessageBox(win, {
        type: "question",
        buttons: ['Yes', 'No'],
        defaultId: 0,
        message: "Are you sure you would like to delete this database?",

    }, function (response) {
        if (response === 0) { //If user clicks 'Yes'
            var db = document.getElementById("deleteDatabaseSelect").value;
            $query = "DROP DATABASE ??";
            connection.query($query, db, function (err, result, fields) {
                if (err) {
                    console.log(err);
                    ipcRenderer.send('errorMessage', win.id, err.message);
                }
                console.log("Query Succesfully executed");
            });
            loadDBSelect();
        }
    }
    );
}


/************************************************************
        INITIALIZE 
*************************************************************/
async function init() {



    try {
        //Load saved User Settings for Database Login
        // document.getElementById("dbUser").value = settings.get('userInfo.user');
        // document.getElementById("dbPassword").value = settings.get('userInfo.password');

        //Initial loadCount as default
        loadCounts('counts');

        //Currently getting non passive event listener warning
        loadDBSelect();

        await loadSampleIDs();
        loadDashboard();
        document.getElementById("sampleIDSelect").addEventListener('change', loadSubsampleIDs);
        document.getElementById("sampleIDSelect").addEventListener('change', loadDashboard);
        document.getElementById("subsampleIDSelect").addEventListener('change', loadDashboard);
        window.addEventListener('resize', resizeCanvas, false);
    }
    catch (err) {
        console.log("error");
        console.log(err.message);
        ipcRenderer.send('errorMessage', win.id, err.message);
    }



}

window.addEventListener('load', init, false);

//Should probably figure out where to put this
    // // Close the connection
    // connection.end(function () {
    //     console.log("close");
    //     // The connection has been closed
    // });
