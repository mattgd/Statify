var artists = require('./artists');
var utils = require('./utils');

/**
* Parses a Spotify Track object and returns an Track JSON object
* with the Statify-useful information.
* @param {object} track The track to parse.
* @returns an Track JSON object with the Statify-useful information.
*/
function parseTrack(track) {
  trackArtists = [];
  for (var i = 0; i < track.artists.length; i++) {
    trackArtists.push(artists.parseBasicArtist(track.artists[i]));
  }

  return {
    album: {
      name: track.album.name,
      images: track.album.images,
      url: track.album.external_urls.spotify
    },
    artists: trackArtists,
    duration: utils.millisToMinutesAndSeconds(track.duration_ms),
    name: track.name,
    popularity: track.popularity,
    preview_url: track.preview_url,
    url: track.external_urls.spotify
  }
}

module.exports = {
  /**
   * Returns an Array of tracks with the track name,
   * album and album image URL, and an Array of artists.
   * @param {Array} tracks The tracks to parse.
   * @returns an Array of tracks with the track name,
   * album and album image URL, and an Array of artists.
   */
  parseTracks: function(tracks) {
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

      // Create new parsed track JSON object and add it to the parsedTracks Array.
      parsedTracks.push(
        {
          name: track.name,
          album: album,
          artists: artists
        }
      );
    }

    return parsedTracks;
  },

  /**
   * Parses track data from the Spotify Web API returns a JSON
   * list of top tracks for the user.
   * @param {object} data The track data to parse.
   * @returns a JSON list of top tracks for the user.
   */
  parseTopTracks: function(data) {
    var top_tracks = [];

    tracks = data.body.items;
    for (var i = 0; i < tracks.length; i++) {
      top_tracks.push(parseTrack(tracks[i]));
    }
    
    return top_tracks;
  }
};