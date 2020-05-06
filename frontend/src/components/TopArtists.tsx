import React from 'react';
import useFetch from 'react-fetch-hook';
// import { ButtonBack, ButtonNext, CarouselProvider, Slider, Slide } from 'pure-react-carousel';
import Carousel from '@brainhubeu/react-carousel';
import '@brainhubeu/react-carousel/lib/style.css';

import { TOP_ARTISTS_ENDPOINT } from '../utils/apiUtils';
import ArtistCard from './ArtistCard';
import { Icon } from 'semantic-ui-react';

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
        <Carousel
          arrowLeft={<Icon className="big" name="arrow alternate circle left" />}
          arrowRight={<Icon className="big" name="arrow alternate circle right" />}
          addArrowClickHandler
          slidesPerPage={5}
          slidesPerScroll={1}
          offset={50}
          itemWidth={250}
          clickToChange
          centered
        >
          {data?.map((artist: Artist) => <ArtistCard key={artist.url} artist={artist} />)}
        </Carousel>
        
        {/* <table className="data" cellPadding="0" cellSpacing="0">
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
        </table> */}
      </div>
    );
  }
};

export default TopArtists;
