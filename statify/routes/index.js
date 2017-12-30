var express = require('express');
var router = express.Router();
const request = require('request');
var https = require("https");
var localConfig = require('../local_config');
var SpotifyWebApi = require('spotify-web-api-node');
var url = require('url');

/**
 * getJSON:  REST get request returning JSON object(s)
 * @param options: http options object
 * @param callback: callback to pass the results JSON object(s) back
 */
exports.getJSON = function(options, onResult)
{
    console.log("rest::getJSON");

    var port = options.port == 443 ? https : http;
    var req = port.request(options, function(res)
    {
        var output = '';
        console.log(options.host + ':' + res.statusCode);
        res.setEncoding('utf8');

        res.on('data', function (chunk) {
            output += chunk;
        });

        res.on('end', function() {
            var obj = JSON.parse(output);
            onResult(res.statusCode, obj);
        });
    });

    req.on('error', function(err) {
        //res.send('error: ' + err.message);
    });

    req.end();
};

var spotifyApi = new SpotifyWebApi({
  clientId : localConfig.spotify.clientId,
  clientSecret : localConfig.spotify.clientSecret,
  redirectUri : '/'
});

// Get access token
spotifyApi.clientCredentialsGrant()
  .then(function(data) {
    //console.log('The access token expires in ' + data.body['expires_in']);
    //console.log('The access token is ' + data.body['access_token']);

    // Save the access token so that it's used in future calls
    spotifyApi.setAccessToken(data.body['access_token']);
  }, function(err) {
    console.log('Something went wrong when retrieving an access token', err.message);
  });

/**
 * Returns true if the line matches a Spotify track URL,
 * and false otherwise.
 * @param {string} line The line to match to a Spotify track URL.
 * @returns true if the line matches a Spotify track URL,
 * and false otherwise.
 */
var isSpotifyLink = function(line) {
  return line.match(/https:\/\/open.spotify.com\/track\/[a-zA-Z0-9]{21,22}$/);
};

/**
 * Gets the track ID from an open.spotify.com URL
 * and returns it.
 * @param {string} spotifyLink The open.spotify.com URL for a track.
 * @returns Spotify track ID
 */
var getTrackId = function(spotifyLink) {
  var match = /[^/]+(?=\/$|$)/;
  return match.exec(spotifyLink)[0];
};

/**
 * Returns an Array of track IDs that were duplicates in trackIds.
 * This Array contains a unique set of IDs, which were duplicates.
 * @param {Array} trackIds The track IDs to find duplicares of.
 * @returns an Array of the duplicate track IDs.
 */
var getDuplicateTracks = function(trackIds) {
  var sortedTracks = trackIds.slice().sort();
  var duplicates = [];
  
  for (var i = 0; i < trackIds.length - 1; i++) {
    if (sortedTracks[i + 1] == sortedTracks[i]) {
      duplicates.push(sortedTracks[i]);
    }
  }

  return getUniqueTracks(duplicates);
};

/**
 * Returns an Array of unique track IDs from trackIds
 * @param {Array} trackIds The trackIds to deduplicate.
 * @returns an Array of unique track IDs from trackIds
 */
var getUniqueTracks = function(trackIds) {
  return trackIds.reduce(function(accum, current) {
    if (accum.indexOf(current) < 0) {
        accum.push(current);
    }

    return accum;
  }, []);
};

/**
 * Returns an Array of tracks with the track name,
 * album and album image URL, and an Array of artists.
 * @param {Array} tracks The tracks to parse.
 * @returns an Array of tracks with the track name,
 * album and album image URL, and an Array of artists.
 */
var parseTracks = function(tracks) {
  parsedTracks = [];

  // Parse the tracks for use in the view
  for (var i = 0, len = tracks.length; i < len; i++) {
    track = tracks[i];

    album = {
      name: track.album.name,
      image: track.album.images[0].url
    };

    artists = [];
    for (var j = 0, artistsLen = track.artists.length; j < artistsLen; j++) {
      artist = track.artists[j];
      artists.push(artist.name);
    }

    // Create new parsed track JSON object and
    // add it to the parsedTracks Array
    parsedTracks.push(
      {
        name: track.name,
        album: album,
        artists: artists
      }
    );
  }

  return parsedTracks;
};

/**
 * Returns an Array of open.spotify.com/track URLs from
 * and Array of Spotify track IDs.
 * @param {Array} tracks The track IDs to convert.
 * @returns an Array of open.spotify.com/track URLs from
 * and Array of Spotify track IDs.
 */
var createExternalUrls = function(tracks) {
  for (var i = 0, len = tracks.length; i < len; i++) {
    tracks[i] = "https://open.spotify.com/track/" + tracks[i];
  }

  return tracks;
}

/**
 * Renders a GET request to the main page.
 */
router.get('/', function(req, resp, next) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var auth_code = query.code;

  // Have an authorization code, get an access token
  if (auth_code != null) {
    // Retrieve an access token and a refresh token
    spotifyApi.authorizationCodeGrant(auth_code)
      .then(function(data) {
        console.log('The token expires in ' + data.body['expires_in']);
        console.log('The access token is ' + data.body['access_token']);
        console.log('The refresh token is ' + data.body['refresh_token']);

        // Set the access token to use it in later calls
        spotifyApi.setAccessToken(data.body['access_token']);
        spotifyApi.setRefreshToken(data.body['refresh_token']);

        spotifyApi.getMe()
          .then(function(data) {
            console.log('Some information about the authenticated user', data.body);
          }, function(err) {
            console.log('Something went wrong getting user data:', err);
          });
      }, function(err) {
        console.log('Something went wrong with gaining authorization code grant:', err);
      });
  } else {
    console.log("No code!");
  }
  
  resp.render('index', { title: 'Statify' });
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
