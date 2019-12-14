const API_URL = 'http://localhost:5000';
const STATE_COOKIE_ENDPOINT = API_URL + '/api/v1/register';
const VALIDATE_COOKIE_ENDPOINT = API_URL + '/api/v1/verify-token';
export const SPOTIFY_STATE_KEY = 'spotify_auth_state';
export const TOP_TRACKS_ENDPOINT = API_URL + '/api/v1/tracks/top';
export const TOP_ARTISTS_ENDPOINT = API_URL + '/api/v1/artists/top';

export let getAuthorizationHeaders = () => ({
  Authorization: `${localStorage.getItem('token')?.toString()}`
});

export const getStateCookie = (authorizationCode: string) => 
  fetch(STATE_COOKIE_ENDPOINT, {
    method: 'POST',
    body: JSON.stringify({ authorizationCode }),
    headers: {
      'Content-Type': 'application/json'
    }
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    });

export const validateStateCookie = () => 
  fetch(VALIDATE_COOKIE_ENDPOINT, {
    method: 'POST',
    credentials: 'include'
  })
    .then(response => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    });