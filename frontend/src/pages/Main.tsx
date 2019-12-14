import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from '@reach/router';
import queryString from 'query-string';
import { useCookies } from 'react-cookie';

import TopArtists from '../components/TopArtists';
// import ArtistPopularity from '../artists/ArtistPopularity';
import TopTracks from '../components/TopTracks';
import Authorize from '../components/Authorize';
import { getStateCookie, SPOTIFY_STATE_KEY, validateStateCookie } from '../utils/apiUtils';
import { Loader } from 'semantic-ui-react';
// import TrackPopularity from '../tracks/TrackPopularity';

const Main: React.FC<RouteComponentProps> = ({ location }) => {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isAuthorizing, setIsAuthorizing] = useState(false);
  const [cookies, setCookie, removeCookie] = useCookies([SPOTIFY_STATE_KEY]);
  
  useEffect(() => {
    const stateCookie = cookies[SPOTIFY_STATE_KEY];
    const authorizationCode = queryString.parse(location?.search ?? '').code?.toString();

    if (stateCookie) {
      validateStateCookie()
        .then(_ => {
          setIsAuthorized(true);
          setIsAuthorizing(false);
        })
        .catch(_ => {
          console.error('Invalid state cookie.');
          removeCookie(SPOTIFY_STATE_KEY);
          setIsAuthorized(false);
          setIsAuthorizing(false);
        });
    } else if (authorizationCode) {
      setIsAuthorizing(true);

      getStateCookie(authorizationCode)
        .then(result => {
          setCookie(SPOTIFY_STATE_KEY, result[SPOTIFY_STATE_KEY]);
          setIsAuthorized(true);
          setIsAuthorizing(false);
        })
        .catch(_ => {
          console.error('Failed to get state cookie.');
          setIsAuthorized(false);
          setIsAuthorizing(false);
        });
    } else {
      console.error('Failed to validate authorization code.');
      setIsAuthorized(false);
      setIsAuthorizing(false);
    }
  }, [location, cookies, setCookie, removeCookie]);

  return (
    <div className="main">
      {isAuthorized ?
      <>
        <div className="jumbotron">
          <header>
            <h1>Statify</h1>
            <p>Statistics about your musical habits on Spotify.</p>
          </header>
        </div>
        
        <div className="wrapper">
          <TopArtists />

          {/* <ArtistPopularity topArtists={[]} /> */}
          <TopTracks />
          {/* <TrackPopularity /> */}
          
          <footer>
            <p>Statify is not affiliated with Spotify AB.</p>
          </footer>
        </div>
      
      </>
      :
      (isAuthorizing ? <Loader /> : <Authorize />)
      }
    </div>
  );
};

export default Main;
