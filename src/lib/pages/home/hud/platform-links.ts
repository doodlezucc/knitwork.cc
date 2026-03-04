export enum Platform {
	Spotify,
	YouTubeMusic,
	AppleMusic,
	Tidal,
	Bandcamp
}

interface Brand {
	color: string;
	name: string;
	logoUrl: string;
}

export const Brands: Record<Platform, Brand> = {
	[Platform.Spotify]: {
		name: 'Spotify',
		color: '#1ed760',
		logoUrl: '/logos/spotify.svg'
	},
	[Platform.YouTubeMusic]: {
		name: 'YouTube Music',
		color: '#ff0033',
		logoUrl: '/logos/youtube-music.png'
	},
	[Platform.AppleMusic]: {
		name: 'Apple Music',
		color: '#fa3f57',
		logoUrl: '/logos/apple-music.svg'
	},
	[Platform.Tidal]: {
		name: 'TIDAL',
		color: '#000000',
		logoUrl: '/logos/tidal.png'
	},
	[Platform.Bandcamp]: {
		name: 'Bandcamp',
		color: '#61929c',
		logoUrl: '/logos/bandcamp.png'
	}
};

export const EeyoreLinks = {
	[Platform.Spotify]: 'https://open.spotify.com/album/16n0EowUpk9CcX3b2SX0je',
	[Platform.YouTubeMusic]:
		'https://music.youtube.com/playlist?list=OLAK5uy_kVKpii8ye_HUFAaJaRHHngjwGx2afijPs',
	[Platform.AppleMusic]: 'https://music.apple.com/us/album/eeyore-ep/1882097433',
	[Platform.Tidal]: 'https://tidal.com/album/503949653',
	[Platform.Bandcamp]: 'https://knitwork.bandcamp.com/album/eeyore'
} satisfies Record<Platform, string>;
