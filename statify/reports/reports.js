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

/**
 * Gets a report JSON data file with the specified file name.
 * @param {*} fileName The name of the file.
 * @returns Chart.js base JSON data.
 */
function getReportJson(fileName) {
  var parentDir = path.dirname(fileName).split(path.sep).pop();
  var filePath = parentDir + '/reports/' + fileName;
  return readJsonFileSync(filePath);
}

module.exports = {
  /**
   * Creates the artist popularity chart given top artists data
   * for a Spotify user.
   * @param topArtists A user's top artist data.
   * @returns a proper Chart.js JSON object for the artist
   * popularity chart.
   */
  createArtistPopChart: function(topArtists) {
    var artistPopChart = getReportJson('barChart.json');
    var labels = new Array();
    var data = new Array();

    // Setup title and axes labels
    artistPopChart["data"]["datasets"][0]["label"] = "Popularity";
    artistPopChart["options"]["title"]["text"] = "Popularity of Your Top Artists";

    for (var i = 0; i < topArtists.length; i++) {
      var artist = topArtists[i];

      labels.push(artist.name);
      data.push(artist.popularity);
    }
      
    artistPopChart.data.labels = labels;
    artistPopChart.data.datasets[0]["data"] = data;

    return artistPopChart;
  },

  /**
   * Creates the artist followers chart given top artists data
   * for a Spotify user.
   * @param topArtists A user's top artist data.
   * @returns a proper Chart.js JSON object for the artist
   * followers chart.
   */
  createArtistFollowersChart: function(topArtists) {
    var artistFollowerChart = getReportJson('barChart.json');
    var labels = new Array();
    var data = new Array();

    // Setup title and axes labels
    artistFollowerChart["data"]["datasets"][0]["label"] = "Followers";
    artistFollowerChart["options"]["title"]["text"] = "Number of Followers of Your Top Artists";

    for (var i = 0; i < topArtists.length; i++) {
      var artist = topArtists[i];

      labels.push(artist.name);
      data.push(artist.followers);
    }
      
    artistFollowerChart.data.labels = labels;
    artistFollowerChart.data.datasets[0]["data"] = data;

    return artistFollowerChart;
  },

  /**
   * Creates the track popularity chart given top tracks data
   * for a Spotify user.
   * @param topTracks A user's top track data.
   * @returns a proper Chart.js JSON object for the track
   * popularity chart.
   */
  createTrackPopChart: function(topTracks) {
    var trackPopChart = getReportJson('barChart.json');
    var labels = new Array();
    var data = new Array();

    // Setup type, title and axes labels
    trackPopChart["type"] = "horizontalBar";
    trackPopChart["data"]["datasets"][0]["label"] = "Popularity";
    trackPopChart["options"]["title"]["text"] = "Popularity of Your Top Tracks";

    for (var i = 0; i < topTracks.length; i++) {
      var track = topTracks[i];

      labels.push(track.name + " - " + track.artists[0].name);
      data.push(track.popularity);
    }
      
    trackPopChart.data.labels = labels;
    trackPopChart.data.datasets[0]["data"] = data;

    return trackPopChart;
  }
};