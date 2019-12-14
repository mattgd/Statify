import React from 'react';
import { Button } from 'semantic-ui-react';
import { navigate } from '@reach/router';
import SpotifyWebApi from 'spotify-web-api-node';

const APPLICATION_SCOPES = [
  'user-library-read', 'user-top-read',
  'user-read-recently-played', 'user-read-currently-playing'
];

const credentials = {
  clientId : process.env.REACT_APP_SPOTIFY_CLIENT_ID,
  redirectUri : 'http://localhost:3000/'
};

const Authorize = () => {
  /**
   * Redirects to the authorization page.
   */
  const authorizeApplication = () => {
    const state = 'some-state-of-my-choice'; // TODO: Change to hash of user cookie

    // Create the authorization URL
    var authorizeURL = new SpotifyWebApi(credentials).createAuthorizeURL(APPLICATION_SCOPES, state);
    navigate(authorizeURL);
  }

  return (
    <div className="hero">
      <header className="animated fadeInDown">
        <h1>Statify</h1>
        <p>
          Statistics about your musical habits on <a href="https://www.spotify.com/" target="_blank" rel="noopener noreferrer">Spotify</a>.
        </p>
        <div className="form-container">
          <Button
            content="Authorize Statify"
            color="green"
            onClick={authorizeApplication}
          />
        </div>
        <footer className="sticky-footer">
          <p>Statify is not affiliated with Spotify AB.</p>
        </footer>
      </header>
    </div>
  );
}

export default Authorize;
