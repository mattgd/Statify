import React from 'react';
import { Card, Icon, Image } from 'semantic-ui-react';

const ArtistCard: React.FC<{ artist: Artist }> = ({ artist }) => (
  <Card className="artist-card">
    <Image src={artist.images[0].url} wrapped ui={false} />
    <Card.Content>
      <Card.Header>
        <a href={artist.url} rel="noopener noreferrer" target="_blank">{artist.name}</a>
      </Card.Header>
      <Card.Description>
      {artist.followers_str} Followers
      </Card.Description>
    </Card.Content>
    <Card.Content extra>
      <Icon name="music" />Genres
      <ul className="genres">
        {artist.genres.map(genre => <li key={genre}>{genre}</li>)}
      </ul>
    </Card.Content>
  </Card>
);

export default ArtistCard;
