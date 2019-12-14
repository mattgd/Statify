import React from 'react';
import useFetch from 'react-fetch-hook';
import { TOP_ARTISTS_ENDPOINT } from '../utils/apiUtils';

const TopArtists: React.FC = () => {
  const { isLoading, data } = useFetch<Artist[]>(TOP_ARTISTS_ENDPOINT, {
    credentials: 'include'
  });

  if (isLoading) {
    return null;
  } else {
    return (
      <div className="top-artists">
        <h2>Your Top Artists</h2>
        <table className="data" cellPadding="0" cellSpacing="0">
          <thead>
            <tr>
              <td>Rank</td>
              <td className="art">Art</td>
              <td>Artist</td>
              <td>Popularity Rating</td>
              <td>Followers</td>
              <td>Top Genres</td>
            </tr>
          </thead>
          <tbody>
            {data?.map((artist: Artist, idx: number) => (
            <tr key={artist.url}>
              <td className="rank">{idx + 1}</td>
              <td className="art">
                <a href={artist.url} rel="noopener noreferrer" target="_blank">
                  <img src={artist.images[0].url} alt={artist.name} />
                </a>
              </td>
              <td>
                <a href={artist.url} rel="noopener noreferrer" target="_blank">{artist.name}</a>
              </td>
              <td>
                {artist.popularity}
                <p className="dim">/100</p>
              </td>
              <td>
                <i>{artist.followers_str}</i>
              </td>
              <td>
                <ul className="genres">
                  {artist.genres.map(genre => <li key={genre}>{genre}</li>)}
                </ul>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
};

export default TopArtists;
