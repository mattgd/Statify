# Statify
Statify is a tool that uses the Spotify Web API to give statistics about a user's musical habits on Spotify. Currently, this includes information about a user's top artists and top tracks.

## Viewing the Application
1. Type `DEBUG=statify:* nodemon` in the `statify` directory to start the server.
2. Navigate to `localhost:3000` in your web browser.


## Creating the local_config
To run Statify, a file named `statify/local_config.js` must exist with the 
following contents:
```
const spotify = {
  clientId: '<spotify API client ID>',
  clientSecret: '<spotify API client secret>'
};

module.exports = { spotify };
``` 

## Contributing to Statify
Check out the [CONTRIBUTING.md](CONTRIBUTING.md) for more information on how you can contribute!