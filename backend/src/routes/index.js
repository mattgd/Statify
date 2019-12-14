const express = require('express');
const router = express.Router();
const localConfig = require('../local_config');
const SpotifyWebApi = require('spotify-web-api-node');
const url = require('url');
const artists = require('../helpers/artists');
const tracks = require('../helpers/tracks');
const reports = require('../reports/reports');

const credentials = {
  clientId : localConfig.spotify.clientId,
  clientSecret : localConfig.spotify.clientSecret,
  redirectUri : 'http://localhost:3000/'
};

const spotifyApi = new SpotifyWebApi(credentials);

/**
 * Renders a GET request to the main page.
 */
router.get('/', function(req, resp, next) {
  const url_parts = url.parse(req.url, true);
  const query = url_parts.query;
  const auth_code = query.code;

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
  const scopes = [
    'user-library-read', 'user-top-read',
    'user-read-recently-played', 'user-read-currently-playing'
  ];
  const redirectUri = 'http://localhost:3000/';
  const clientId = localConfig.spotify.clientId;
  const state = 'some-state-of-my-choice'; // TODO: Change to hash of user cookie

  // Setting credentials can be done in the wrapper's constructor, or using the API object's setters.
  var spotifyApi = new SpotifyWebApi({ redirectUri, clientId });

  // Create the authorization URL
  var authorizeURL = spotifyApi.createAuthorizeURL(scopes, state);

  resp.writeHead(301, { Location: authorizeURL });
  resp.end();
});

module.exports = router;
