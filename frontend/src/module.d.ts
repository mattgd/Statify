interface SpotifyArtist {
  name: string,
  followers: {
    total: number
  },
  genres: string[],
  images: [{ url: string }],
  popularity: number,
  external_urls: {
    spotify: string
  }
}

interface SpotifyAlbum {
  name: string,
  images: [{ url: string }],
  external_urls: {
    spotify: string
  }
}

interface SpotifyTrack {
  album: SpotifyAlbum,
  artists: Artist[],
  duration_ms: number,
  name: string,
  popularity: number,
  preview_url: string,
  external_urls: {
    spotify: string
  }
}

interface BasicArtist {
  name: string,
  url: string
}

interface Artist extends BasicArtist {
  followers: number,
  followers_str: string,
  genres: string[],
  images: [{ url: string }],
  popularity: number
}

interface Album {
  name: string,
  images: [{ url: string }],
  url: string
}

interface Track {
  album: Album,
  artists: BasicArtist[],
  duration: string,
  name: string,
  popularity: number,
  preview_url: string,
  url: string
}
