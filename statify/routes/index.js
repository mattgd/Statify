var express = require('express');
var router = express.Router();
const request = require('request');
var https = require("https");
var localConfig = require('../local_config');
var SpotifyWebApi = require('spotify-web-api-node');
var url = require('url');

var credentials = {
  clientId : localConfig.spotify.clientId,
  clientSecret : localConfig.spotify.clientSecret,
  redirectUri : 'http://localhost:3000/'
};

var spotifyApi = new SpotifyWebApi(credentials);

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
 * Parses a Spotify Artist object and returns an Artist JSON object
 * with the Statify-useful information.
 * @param {object} artist The artist to parse.
 * @returns an Artist JSON object with the Statify-useful information.
 */
function parseArtist(artist) {
  return {
    followers: artist.followers.total,
    genres: artist.genres,
    images: artist.images,
    name: artist.name,
    popularity: artist.popularity,
    url: artist.external_urls.spotify
  }
}

function setSpotifyAccessToken(auth_code) {
  // Retrieve an access token and a refresh token
  spotifyApi.authorizationCodeGrant(auth_code)
    .then(function(data) {
      // Set the access token to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
      return true;
    }, function(err) {
      console.log('Something went wrong with gaining authorization code grant:', err);
      return false;
    });
}

function getTopArtists() {
  var top_artists = [];

  spotifyApi.getMyTopArtists()
    .then(function(data) {
      artists = data.body.items;
      for (var i = 0; i < artists.length; i++) {
        top_artists.push(parseArtist(artists[i]));
      }
      
      return top_artists;
    }, function(err) {
      console.log('Something went wrong getting user data:', err);
    });
}

/**
 * Renders a GET request to the main page.
 */
router.get('/', function(req, resp, next) {
  var url_parts = url.parse(req.url, true);
  var query = url_parts.query;
  var auth_code = query.code;
  var top_artists = [];

  // Have an authorization code, get an access token
  if (auth_code != null) {
    var promise = spotifyApi.authorizationCodeGrant(auth_code);
    promise.then(function(data) {
      // Set the access token to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);

      return getTopArtists();
    }).then(function() {
      return spotifyApi.getMyTopArtists();
    }).then(function(data) {
      var top_artists = [];

      artists = data.body.items;
      for (var i = 0; i < artists.length; i++) {
        artist = artists[i];

        parsed_artist = {
          followers: artist.followers.total,
          genres: artist.genres,
          images: artist.images,
          name: artist.name,
          popularity: artist.popularity,
          url: artist.external_urls.spotify
        }

        top_artists.push(parsed_artist);
      }
      
      // Format top artists data
      data = {
        top_artists: top_artists
      }

      resp.render(
        'index',
        {
          title: 'Statify',
          authorized: true,
          data: data
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
