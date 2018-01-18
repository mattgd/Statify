var utils = require('./utils');

/**
 * Parses a Spotify Artist object and returns an Artist JSON object
 * with the Statify-useful information.
 * @param {object} artist The artist to parse.
 * @returns an Artist JSON object with the Statify-useful information.
 */
function parseArtist(artist) {
  return {
    followers: artist.followers.total,
    followers_str: utils.numberWithCommas(artist.followers.total),
    genres: artist.genres.slice(1, 6),
    images: artist.images,
    name: artist.name,
    popularity: artist.popularity,
    url: artist.external_urls.spotify
  }
}

module.exports = {
  /**
   * Parses basic artist data (only includes external_urls,
   * href, id, name, type, and uri) from the Spotify API into
   * a Statify usable JSON object.
   * @param {object} artist The basic artist data to parse.
   * @returns a Statify usable JSON artist object.
  */
  parseBasicArtist: function(artist) {
    return {
      name: artist.name,
      url: artist.external_urls.spotify
    }
  },

  /**
   * Parses artist data from the Spotify Web API returns a JSON
   * list of top artists for the user.
   * @param {object} data The artist data to parse.
   * @returns a JSON list of top artists for the user.
  */
  parseTopArtists: function (data) {
    var top_artists = [];

    artists = data.body.items;
    for (var i = 0; i < artists.length; i++) {
      top_artists.push(parseArtist(artists[i]));
    }

    return top_artists;
  }
};