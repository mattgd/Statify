var fs = require("fs");
var path = require('path'); 

/**
 * Reads in a local JSON file at the specified path.
 * @param {*} filePath The local path to the file.
 * @returns the JSON contents of the file.
 */
function readJsonFileSync(filePath) {
  var file = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(file);
}

module.exports = {
   /**
    * Gets a report JSON data file with the specified file name.
    * @param {*} fileName The name of the file.
    * @returns Chart.js base JSON data.
    */
   getReportJson: function(fileName) {
     var parentDir = path.dirname(fileName).split(path.sep).pop();
     var filePath = parentDir + '/reports/' + fileName;
     return readJsonFileSync(filePath);
   }
};