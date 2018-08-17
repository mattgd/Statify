var express = require('express');
var router = express.Router();
const request = require('request');
var https = require("https");
var localConfig = require('../local_config');
var SpotifyWebApi = require('spotify-web-api-node');
var url = require('url');
var artists = require('../helpers/artists');
var tracks = require('../helpers/tracks');
var reports = require('../reports/reports');

var credentials = {
  clientId : localConfig.spotify.clientId,
  clientSecret : localConfig.spotify.clientSecret,
  redirectUri : 'http://localhost:3000/'
};

var spotifyApi = new SpotifyWebApi(credentials);

/**
 * Renders a GET request to the main page.
 */
router.get('/', function(req, resp, next) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var auth_code = query.code;

  // Have an authorization code, get an access token
  if (auth_code != null) {
    var results = {
      top_artists: []
    }
    var promise = spotifyApi.authorizationCodeGrant(auth_code);
    promise.then(function(data) {
      // Set the access token to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

      //console.log(data.body['expires_in']);
    }).then(function() {
      return spotifyApi.getMyTopArtists();
    }).then(function(data) {
      // Format top artists data
      results['top_artists'] = artists.parseTopArtists(data);
    }).then(function() {
      return spotifyApi.getMyTopTracks();
    }).then(function(data) {
      // Format top tracks data
      results['top_tracks'] = tracks.parseTopTracks(data);

      var artistPopChart = reports.createArtistPopChart(results['top_artists']);
      var artistFollowersChart = reports.createArtistFollowersChart(results['top_artists']);
      var trackPopChart = reports.createTrackPopChart(results['top_tracks']);

      // Add artist popularity chart to results
      results['charts'] = {
        artist_popularity: JSON.stringify(artistPopChart),
        artist_followers: JSON.stringify(artistFollowersChart),
        track_popularity: JSON.stringify(trackPopChart)
      };

      resp.render(
        'index',
        {
          title: 'Statify',
          authorized: true,
          data: results
        }
      );
    }).catch(function(err) {
      console.log(err);
      resp.render(
        'index',
        {
          title: 'Statify',
          authorized: false
        }
      );
    });
  } else {
    resp.render(
      'index',
      {
        title: 'Statify',
        authorized: false
      }
    );
  }
});

/**
 * Renders a POST request to the authorization page.
 */
router.post('/authorize', function(req, resp) {
  var scopes = [
    'user-library-read', 'user-top-read',
    'user-read-recently-played', 'user-read-currently-playing'
  ];
  var redirectUri = 'http://localhost:3000/';
  var clientId = localConfig.spotify.clientId;
  var state = 'some-state-of-my-choice'; // TODO: Change to hash of user cookie

  // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
  var spotifyApi = new SpotifyWebApi({
    redirectUri : redirectUri,
    clientId : clientId
  });

  // Create the authorization URL
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  resp.writeHead(301,
    {
      Location: authorizeURL
    }
  );

  resp.end();
});

module.exports = router;
