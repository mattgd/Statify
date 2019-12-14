import { spotifyApi } from '../app';
const tracksRouter = require('express').Router();
const tracks = require('../helpers/tracks');

/**
 * Returns the top tracks for the user.
 */
tracksRouter.get('/top', (req, resp, next) => {
  spotifyApi.getMyTopTracks()
  .then((data: any) => {
    const topTracksData = tracks.parseTopTracks(data);
    resp.json(topTracksData);
  }).catch((err: any) => {
    console.log(err);
    resp.status(500).json({ error: 'Could not get top tracks.' });
  });
});

module.exports = tracksRouter;
