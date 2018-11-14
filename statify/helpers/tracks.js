var artistUtils = require('./artists');
var utils = require('./utils');

/**
* Parses a Spotify Track object and returns an Track JSON object
* with the Statify-useful information.
* @param {object} track The track to parse.
* @returns an Track JSON object with the Statify-useful information.
*/
function parseTrack(track) {
  let trackArtists = [];
  for (var artist of track.artists) {
    trackArtists.push(artistUtils.parseBasicArtist(artist));
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
    let parsedTracks = [];

    // Parse the tracks for use in the view
    for (var track in tracks) {
      album = {
        name: track.album.name,
        image: track.album.images[0].url
      };

      let artists = [];
      for (var artist in track.artists) {
        artists.push(artist.name);
      }

      // Create new parsed track JSON object and add it to the parsedTracks Array.
      parsedTracks.push(
        {
          name: track.name,
          album,
          artists
        }
      );
    }

    return parsedTracks;
  },

  /**
   * Parses track data from the Spotify Web API returns a JSON
   * list of top tracks for the user.
   * @param {Object} data The track data to parse.
   * @returns a JSON list of top tracks for the user.
   */
  parseTopTracks: function(data) {
    let tracks = data.body.items;
    let top_tracks = [];

    for (var track of tracks) {
      top_tracks.push(parseTrack(track));
    }
    
    return top_tracks;
  }
};