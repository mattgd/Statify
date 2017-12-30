# Contributing to Deduplify

If you'd like to contribute to the project (that'd be awesome!), take a look at the guide below.

1. Fork the project.
2. Make sure you have [Node.js](https://nodejs.org/en/download/) installed.
3. Run `npm install` in the `statify` directory to retrieve all of the dependencies.
4. Head over to the [Spotify Web API Applications](https://developer.spotify.com/my-applications/#!/applications) page and create a new application for this project.
   This will allow you to generate client keys.
5. Create `local_config.js` in the `statify` directory with the following contents:
```
// Place all local variables that you would
// not like to get synced to Git in this file.
var config = {};

config.spotify = {};
config.spotify.clientId = "<your Spotify application Client ID>";
config.spotify.clientSecret = "<your Spotify application Client secret>";

// Place any new configuration nodes here

module.exports = config;
```
6. Begin coding! Feel free to check out any [outstanding issues](https://github.com/mattgd/Deduplify/issues), or open an issue to discuss a new feature you think should be added.
   All suggestions are welcome!
