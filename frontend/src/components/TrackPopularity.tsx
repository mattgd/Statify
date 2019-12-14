import React from 'react';
import { ResponsiveBar } from '@nivo/bar';
import { getAuthorizationHeaders, TOP_TRACKS_ENDPOINT } from '../utils/apiUtils';
import useFetch from 'react-fetch-hook';

const TrackPopularity: React.FC = () => {
  const { isLoading, data } = useFetch(TOP_TRACKS_ENDPOINT, {
    headers: getAuthorizationHeaders()
  });

  if (isLoading) {
    return null;
  } else {
    return (
      <ResponsiveBar
        data={data}
      />
    );
  }
};

export default TrackPopularity;
