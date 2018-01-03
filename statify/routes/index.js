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
 * Returns the number x with commas.
 * @param {String} num The number to convert.
 * @returns the number x with commas.
 */
function numberWithCommas(num) {
  var values = num.toString().split('.');
  return values[0].replace(/.(?=(?:.{3})+$)/g, '$&,') + ( values.length == 2 ? '.' + values[1] : '' )
}

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
 * Converts milliseconds to a minutes and seconds string value.
 * @param {integer} millis The time in milliseconds.
 * @returns the milliseconds represented as minutes and seconds.
 */
function millisToMinutesAndSeconds(millis) {
  var minutes = Math.floor(millis / 60000);
  var seconds = ((millis % 60000) / 1000).toFixed(0);
  return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}

/**
 * Parses a Spotify Track object and returns an Track JSON object
 * with the Statify-useful information.
 * @param {object} track The track to parse.
 * @returns an Track JSON object with the Statify-useful information.
 */
function parseTrack(track) {
  artists = [];
  for (var i = 0; i < track.artists.length; i++) {
    artists.push(parseBasicArtist(track.artists[i]));
  }

  return {
    album: {
      name: track.album.name,
      images: track.album.images,
      url: track.album.external_urls.spotify
    },
    artists: artists,
    duration: millisToMinutesAndSeconds(track.duration_ms),
    name: track.name,
    popularity: track.popularity,
    preview_url: track.preview_url,
    url: track.external_urls.spotify
  }
}

/**
 * Parses track data from the Spotify Web API returns a JSON
 * list of top tracks for the user.
 * @param {object} data The track data to parse.
 * @returns a JSON list of top tracks for the user.
 */
function parseTopTracks(data) {
  var top_tracks = [];

  tracks = data.body.items;
  for (var i = 0; i < tracks.length; i++) {
    top_tracks.push(parseTrack(tracks[i]));
  }
  
  return top_tracks;
}

/**
 * Parses basic artist data (only includes external_urls,
 * href, id, name, type, and uri) from the Spotify API into
 * a Statify usable JSON object.
 * @param {object} artist The basic artist data to parse.
 * @returns a Statify usable JSON artist object.
 */
function parseBasicArtist(artist) {
  return {
    name: artist.name,
    url: artist.external_urls.spotify
  }
}

/**
 * Parses a Spotify Artist object and returns an Artist JSON object
 * with the Statify-useful information.
 * @param {object} artist The artist to parse.
 * @returns an Artist JSON object with the Statify-useful information.
 */
function parseArtist(artist) {
  return {
    followers: numberWithCommas(artist.followers.total),
    genres: artist.genres,
    images: artist.images,
    name: artist.name,
    popularity: artist.popularity,
    url: artist.external_urls.spotify
  }
}

/**
 * Parses artist data from the Spotify Web API returns a JSON
 * list of top artists for the user.
 * @param {object} data The artist data to parse.
 * @returns a JSON list of top artists for the user.
 */
function parseTopArtists(data) {
  var top_artists = [];

  artists = data.body.items;
  for (var i = 0; i < artists.length; i++) {
    top_artists.push(parseArtist(artists[i]));
  }
  
  return top_artists;
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
    var results = {
      top_artists: top_artists
    }
    var promise = spotifyApi.authorizationCodeGrant(auth_code);
    promise.then(function(data) {
      // Set the access token to use it in later calls
      spotifyApi.setAccessToken(data.body['access_token']);
      spotifyApi.setRefreshToken(data.body['refresh_token']);
    }).then(function() {
      return spotifyApi.getMyTopArtists();
    }).then(function(data) {
      // Format top artists data
      results['top_artists'] = parseTopArtists(data);
    }).then(function() {
      return spotifyApi.getMyTopTracks();
    }).then(function(data) {
      // Format top tracks data
      results['top_tracks'] = parseTopTracks(data);

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
