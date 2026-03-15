export interface Game {
  id: string;
  title: string;
  description: string;
  thumbnail: string;
  genre: string;
  color: string;
}

export interface Avatar {
  skinColor: string;
  shirtColor: string;
  pantsColor: string;
  hatType: 'none' | 'cap' | 'crown' | 'headphones';
  isHeadless?: boolean;
  isKorblox?: boolean;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  photoURL: string;
  totalCoins: number;
  robux: number;
  inventory: string[];
  avatar?: Avatar;
}

export interface Score {
  userId: string;
  gameId: string;
  score: number;
  updatedAt: string;
}

export interface MarketplaceItem {
  id: string;
  name: string;
  description: string;
  price: number;
  type: 'bundle' | 'accessory';
  thumbnail: string;
}

export const MARKETPLACE_ITEMS: MarketplaceItem[] = [
  {
    id: 'headless-horseman',
    name: 'Headless Horseman',
    description: 'The legendary headless bundle. Lose your head, gain some style.',
    price: 31000,
    type: 'bundle',
    thumbnail: 'https://picsum.photos/seed/headless/200/200'
  },
  {
    id: 'korblox-deathspeaker',
    name: 'Korblox Deathspeaker',
    description: 'The mighty Korblox warrior. Features the iconic floating leg.',
    price: 17000,
    type: 'bundle',
    thumbnail: 'https://picsum.photos/seed/korblox/200/200'
  },
  {
    id: 'valkyrie-helm',
    name: 'Valkyrie Helm',
    description: 'A classic accessory for the most elite players.',
    price: 50000,
    type: 'accessory',
    thumbnail: 'https://picsum.photos/seed/valk/200/200'
  },
  {
    id: 'dominus-empyreus',
    name: 'Dominus Empyreus',
    description: 'The ultimate status symbol.',
    price: 250000,
    type: 'accessory',
    thumbnail: 'https://picsum.photos/seed/dominus/200/200'
  }
];
export const GAMES: Game[] = [
  {
    id: 'speed-run',
    title: 'Speed Run',
    description: 'Race against time in this fast-paced platformer!',
    thumbnail: 'https://picsum.photos/seed/speed/400/300',
    genre: 'Platformer',
    color: 'bg-blue-500'
  },
  {
    id: 'clicker-tycoon',
    title: 'Clicker Tycoon',
    description: 'Click your way to riches and build your empire.',
    thumbnail: 'https://picsum.photos/seed/click/400/300',
    genre: 'Tycoon',
    color: 'bg-green-500'
  },
  {
    id: 'dodge-ball',
    title: 'Dodge Ball',
    description: 'Survive the falling balls as long as you can!',
    thumbnail: 'https://picsum.photos/seed/dodge/400/300',
    genre: 'Survival',
    color: 'bg-red-500'
  }
];
