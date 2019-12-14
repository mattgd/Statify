import React from 'react';
import { ResponsiveBar } from '@nivo/bar';

type ArtistPopularityProps = {
  topArtists: Artist[]
};

const ArtistPopularity: React.FC<ArtistPopularityProps> = ({ topArtists }) => {
  const artistPopularity = () => topArtists.map((artist: Artist) => ({
    artist: artist.name,
    popularity: artist.popularity
  }));


  return null;
  // if (artistPopularity.length) {
  //   return null;
  // } else {
  //   return (
  //     <ResponsiveBar
  //       data={artistPopularity}
  //     />
  //   );
  // }
};

export default ArtistPopularity;
