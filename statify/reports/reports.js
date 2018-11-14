const fs = require("fs");
const path = require('path'); 

/**
 * Reads in a local JSON file at the specified path.
 * @param {String} filePath The local path to the file.
 * @returns {Object} the JSON contents of the file.
 */
function readJsonFileSync(filePath) {
  const file = fs.readFileSync(filePath, 'utf8');
  return JSON.parse(file);
}

/**
 * Gets a report JSON data file with the specified file name.
 * @param {String} fileName The name of the file.
 * @returns {Object} Chart.js base JSON data.
 */
function getReportJson(fileName) {
  const parentDir = path.dirname(fileName).split(path.sep).pop();
  const filePath = parentDir + '/reports/' + fileName;
  return readJsonFileSync(filePath);
}

module.exports = {
  /**
   * Creates the artist popularity chart given top artists data
   * for a Spotify user.
   * @param {Array} topArtists A user's top artist data.
   * @returns {Object} a proper Chart.js JSON object for the artist
   * popularity chart.
   */
  createArtistPopChart: function(topArtists) {
    let artistPopChart = getReportJson('barChart.json');
    let labels = [];
    let data = [];

    // Setup title and axes labels
    artistPopChart.data.datasets[0].label = 'Popularity';
    artistPopChart.options.title.text = 'Popularity of Your Top Artists';

    for (var artist of topArtists) {
      labels.push(artist.name);
      data.push(artist.popularity);
    }
      
    artistPopChart.data.labels = labels;
    artistPopChart.data.datasets[0].data = data;

    return artistPopChart;
  },

  /**
   * Creates the artist followers chart given top artists data
   * for a Spotify user.
   * @param {Array} topArtists A user's top artist data.
   * @returns {Object} a proper Chart.js JSON object for the artist
   * followers chart.
   */
  createArtistFollowersChart: function(topArtists) {
    let artistFollowerChart = getReportJson('barChart.json');
    let labels = [];
    let data = [];

    // Setup title and axes labels
    artistFollowerChart.data.datasets[0].label = 'Followers';
    artistFollowerChart.options.title.text = 'Number of Followers of Your Top Artists';

    for (var artist of topArtists) {
      labels.push(artist.name);
      data.push(artist.followers);
    }
      
    artistFollowerChart.data.labels = labels;
    artistFollowerChart.data.datasets[0].data = data;

    return artistFollowerChart;
  },

  /**
   * Creates the track popularity chart given top tracks data
   * for a Spotify user.
   * @param {Array} topTracks A user's top track data.
   * @returns {Object} a proper Chart.js JSON object for the track
   * popularity chart.
   */
  createTrackPopChart: function(topTracks) {
    let trackPopChart = getReportJson('barChart.json');
    let labels = [];
    let data = [];

    // Setup type, title and axes labels
    trackPopChart.type = 'horizontalBar';
    trackPopChart.data.datasets[0].label = 'Popularity';
    trackPopChart.options.title.text = 'Popularity of Your Top Tracks';

    for (var track of topTracks) {
      labels.push(`${track.name} - ${track.artists[0].name}`);
      data.push(track.popularity);
    }
      
    trackPopChart.data.labels = labels;
    trackPopChart.data.datasets[0].data = data;

    return trackPopChart;
  }
};