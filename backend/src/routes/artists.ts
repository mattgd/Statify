import { spotifyApi } from '../app';
const artistsRouter = require('express').Router();
const artists = require('../helpers/artists');

/**
 * Renders a GET request to the main page.
 */
artistsRouter.get('/top', (req, resp, next) => {
  spotifyApi.getMyTopArtists()
  .then((data: any) => {
      // Format top artists data
      const topArtistsData = artists.parseTopArtists(data);
      resp.json(topArtistsData);
    }).catch((err: any) => {
      console.log(err);
      resp.status(500).json({ error: 'Failed to get top artists.' });
    });
});

module.exports = artistsRouter;
