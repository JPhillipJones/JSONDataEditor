const dbT = document.getElementById('debugText');
const folderPath = "../Data/";
var theJSON;
var jsonPath;
var md = document.getElementsByClassName("modalContent")[0];
var mdb = document.getElementsByClassName("modalBackground")[0];
 
dbT.innerHTML = 'Starting App...';

const { log } = require('console');
const fs = require('fs');
const readJson = require('read-json-file');
const path = require('path');

var mainDiv = document.getElementById("dvMain");
mainDiv.style.width = window.screen.width + "px";

dbT.innerHTML = 'About to Read Files...';
let allfiles = fs.readdirSync(folderPath);

const EXTENSION = '.json';

const files = allfiles.filter(file => {
    return path.extname(file).toLowerCase() === EXTENSION;
});

const tablelist = document.getElementById('tablelist');

for(var i = 0,f; f= files[i]; i++)
{
    dbT.innerHTML = (i + 1) + ' Files Loaded';
    var fileListItem = document.createElement('li');
    var fileName = document.createTextNode(f);
    let fname = f;
    fileListItem.addEventListener("click", function() {
        jsonTableClicked(fname);

        var listItems = document.getElementsByTagName("li");

        for(var i = 0; i < listItems.length; i++) {
            listItems[i].style.backgroundColor = "white";
            listItems[i].style.color = "black";
        }
        this.style.backgroundColor = "black";
        this.style.color = "white";
    });
    fileListItem.appendChild(fileName);
    tablelist.appendChild(fileListItem);
}

function closeModal()
{
    md.style.display = "none";
    mdb.style.display = "none";
}

function openModal()
{
    md.style.display = "block";
    mdb.style.display = "block";
}
function saveChanges()
{

    var jsonToSave = JSON.parse(JSON.stringify(theJSON))
    
    for (var i = 0; i < jsonToSave.length; i++) {
        delete jsonToSave[i].EditorRowKey;
    }

    var jsonString = JSON.stringify(jsonToSave, null, 2);

    fs.writeFile(jsonPath, jsonString, (err) => {
        if (err) {
            console.log('Error writing file', err);
        } else {
            console.log('Successfully wrote file');
        }
    });
    //dbT.innerHTML = "Changes Saved!";
    openModal();
    var textBoxes = document.querySelectorAll("input");
        
    textBoxes.forEach(txt => {
    if(txt.type == "text")
        {
            txt.removeAttribute("style");
        }
    });
    document.getElementById("btnSave").style.display = "none";
}



async function readJSONFile(filename)
{
    
    jsonPath = folderPath + filename;

    let promise = new Promise((resolve, reject) => {
        fs.readFile(jsonPath, "utf8", (error, data) => {
            if (error) {
                console.log(error);
                resolve("failure");
            }
            theJSON = JSON.parse(data);
            resolve("success");
        });        
        
    });

    let result = await promise;

    loadResults();
    
}

function jsonTableClicked(filename)
{
    readJSONFile(filename);
}

function valueChanged(e)
{
    if(e)
    {
        var cnt = e.target.parentElement.parentElement.getElementsByTagName("input").length;
        var editorKey = parseInt(e.target.parentElement.parentElement.getElementsByTagName("input")[cnt-1].value);

        var col = e.target.parentElement.cellIndex;
        var colName = document.getElementById("columnsRow")
            .querySelectorAll("th")[col].innerText;
        for (var i = 0; i < theJSON.length; i++) {
            if (theJSON[i].EditorRowKey === editorKey) {
                theJSON[i][colName] = e.target.value;
                break;
            }
        }
        e.target.style.backgroundColor = "lightpink";
        document.getElementById("btnSave").style.display = "block";
    }
    
}

function addRowKeys()
{
    for (var i = 0; i < theJSON.length; i++) {
            var rowAttribute = {EditorRowKey:i};
            Object.assign(theJSON[i], rowAttribute);
            console.log(theJSON[i].EditorRowKey);
        }
}

function loadResults()
{
    addRowKeys();
    var headerRow = document.getElementById('columnsRow');
    headerRow.innerHTML = "";
    Object.keys(theJSON[0]).forEach(function(key) {
        var dataColumnHeader = document.createElement('th');
        if(key != "EditorRowKey"){ 
            dataColumnHeader.textContent = key;
            dataColumnHeader.addEventListener("click", (event) => {
                selectSortColumn(event);
            });
        }
        headerRow.appendChild(dataColumnHeader);
    });
    
    var results = document.getElementById('results');
    results.innerHTML = "";
    theJSON.forEach(function(row){
        var dataRow = document.createElement('tr');
        Object.keys(theJSON[0]).forEach(function(key) {
            var datafield = document.createElement('td');
            
            if(key != "EditorRowKey")
            {
                var datatextbox = document.createElement('input');
                datatextbox.type = "text";
                datatextbox.value = row[key];
                datatextbox.addEventListener("input", (event) => {
                    valueChanged(event);
                });
                datafield.appendChild(datatextbox);                
            }else{
                var datakeyfield = document.createElement('input');
                datakeyfield.type = "hidden";
                datakeyfield.value = row[key];
                datafield.appendChild(datakeyfield);
            }
            dataRow.appendChild(datafield);
        });
        results.appendChild(dataRow);
    });
    

}

function sortTableByColumn (tableId, columnNumber) {
    // Get the table element by its id
    var tableElement = document.getElementById (tableId);
    // Convert the table rows into an array
    var rows = Array.from (tableElement.rows);
    // Sort the array based on the value of the specified column
    rows.sort (function (a, b) {
        // Get the text content of the cells
        var aColText = a.cells[columnNumber].firstChild.value.trim();
        var bColText = b.cells[columnNumber].firstChild.value.trim();
        // Compare the text content using localeCompare
        return aColText.localeCompare (bColText);
    });
    // Append the sorted rows back to the table
    rows.forEach (function (row) {
        tableElement.appendChild (row);
    });
}

function selectSortColumn(e)
{
    var cnt = e.target.cellIndex;
    sortTableByColumn("results",cnt)
}