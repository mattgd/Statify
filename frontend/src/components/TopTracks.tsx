import React from 'react';
import useFetch from 'react-fetch-hook';
import { TOP_TRACKS_ENDPOINT } from '../utils/apiUtils';

const TopTracks: React.FC = () => {
  const { isLoading, data } = useFetch<Track[]>(TOP_TRACKS_ENDPOINT, {
    credentials: 'include'
  });

  if (isLoading) {
    return null;
  } else {
    return (
      <div className="top-tracks">
        <h2>Your Top Tracks</h2>
        <table className="data" cellPadding="0" cellSpacing="0">
          <thead>
            <tr>
              <td>Rank</td>
              <td className="art">Album Art</td>
              <td>Track</td>
              <td>Artist</td>
              <td>Popularity Rating</td>
              <td>Duration</td>
            </tr>
          </thead>
          <tbody>
            {data?.map((track: Track, idx: number) => (
            <tr key={track.url}>
              <td className="rank">{idx + 1}</td>
              <td className="art">
                <a href={track.url} rel="noopener noreferrer" target="_blank">
                  <img src={track.album.images[0].url} alt={track.name} />
                </a>
              </td>
              <td>
                <a href={track.url} rel="noopener noreferrer" target="_blank">{track.name}</a>
              </td>
              <td>
                {track.artists.map((artist: BasicArtist) => (
                  <a key={artist.url} href={artist.url} rel="noopener noreferrer" target="_blank">{artist.name}</a>
                ))}
              </td>
              <td>
                {track.popularity}
                <p className="dim">/100</p>
              </td>
              <td>
                <i>{track.duration}</i>
              </td>
            </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
}

export default TopTracks;
