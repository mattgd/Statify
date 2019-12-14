import { numberWithCommas } from "./utils";

/**
 * Parses a Spotify Artist object and returns an Artist JSON object
 * with the Statify-useful information.
 * @param {Artist} artist The artist to parse.
 * @returns an Artist JSON object with the Statify-useful information.
 */
const parseArtist: (artist: SpotifyArtist) => Artist = (artist) => ({
  followers: artist.followers.total,
  followers_str: numberWithCommas(artist.followers.total),
  genres: artist.genres.slice(1, 6),
  images: artist.images,
  name: artist.name,
  popularity: artist.popularity,
  url: artist.external_urls.spotify
})

/**
* Parses basic artist data (only includes external_urls,
* href, id, name, type, and uri) from the Spotify API into
* a Statify usable JSON object.
* @param {Artist} artist The basic artist data to parse.
* @returns a Statify usable JSON artist object.
*/
export const parseBasicArtist: (artist: SpotifyArtist) => BasicArtist = (artist) => ({
  name: artist.name,
  url: artist.external_urls.spotify
});

// /**
//    * Parses artist data from the Spotify Web API returns a JSON
//    * list of top artists for the user.
//    * @param {object} data The artist data to parse.
//    * @returns a JSON list of top artists for the user.
//   */
// export const parseTopArtists = data => {
//   const artists = data.body.items;
//   let top_artists = [];

//   for (var artist of artists) {
//     top_artists.push(parseArtist(artist));
//   }

//   return top_artists;
// }
