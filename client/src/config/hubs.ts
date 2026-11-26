// Hub config for the Gaming (/dailybyte, home) and Tech (/tech) pages: chips and copy.

export type Chip = [label: string, query: string];

export interface HubConfig {
  path: string;
  title: string;
  // The hub opens on one combined feed of everything in the "mine" row.
  defaultTopic: string;
  mineLabel: string;
  allLabel: string;
  mine: Chip[];
  topics: Chip[];
  /** Badge shown when a story matches no chip. */
  fallbackTag: string;
}

export const HUBS: Record<'gaming' | 'tech', HubConfig> = {
  gaming: {
    path: '/dailybyte',
    fallbackTag: 'Gaming',
    title: 'Your gaming pulse.',
    defaultTopic: 'my games',
    mineLabel: 'My games',
    allLabel: 'All my games',
    // Bryen's own library: what he is playing now first, then the franchises he keeps coming back to.
    mine: [
      ['Witcher 3', 'The Witcher 3'],
      ['AC Black Flag', 'Assassins Creed Black Flag'],
      ['Crimson Desert', 'Crimson Desert'],
      ['AC Shadows', 'Assassins Creed Shadows'],
      ['Cyberpunk 2077', 'Cyberpunk 2077'],
      ['Elden Ring', 'Elden Ring'],
      ['Apex Legends', 'Apex Legends'],
      ['Black Ops', 'Call of Duty Black Ops'],
      ['Hitman', 'Hitman'],
      ['Batman Arkham', 'Batman Arkham'],
      ['Far Cry', 'Far Cry'],
      ['GTA 6', 'GTA 6'],
      ['ARK', 'ARK Survival'],
      ['Rocket League', 'Rocket League'],
      ['CS2', 'Counter Strike 2'],
      ['DOOM', 'DOOM'],
    ],
    topics: [
      ['Gaming', 'gaming'],
      ['Game Releases', 'video game releases'],
      ['Xbox', 'Xbox'],
      ['PlayStation', 'PlayStation'],
      ['Nintendo', 'Nintendo'],
      ['Steam', 'Steam'],
      ['Industry', 'game industry'],
      ['Esports', 'esports'],
    ],
  },
  tech: {
    path: '/tech',
    fallbackTag: 'Tech',
    title: 'Your gear and hardware pulse.',
    defaultTopic: 'my gear',
    mineLabel: 'My gear',
    allLabel: 'All my gear',
    // Bryen's build and desk: GPUs, CPU, memory, storage, brands and the gear around it.
    mine: [
      ['RTX 5090', 'RTX 5090'],
      ['RTX 5080', 'RTX 5080'],
      ['Ryzen 9950X3D', 'Ryzen 9 9950X3D'],
      ['Dominator Ti', 'Corsair Dominator Titanium'],
      ['RAM Prices', 'RAM prices'],
      ['9100 Pro SSD', 'Samsung 9100 Pro'],
      ['Corsair', 'Corsair'],
      ['XENEON EDGE', 'Corsair XENEON EDGE'],
      ['Razer', 'Razer'],
      ['ASUS ROG', 'ASUS ROG'],
      ['ROG OLED', 'ROG Swift OLED'],
      ['EK Cooling', 'EK water cooling'],
      ['Raspberry Pi', 'Raspberry Pi'],
      ['Elgato', 'Elgato Stream Deck'],
      ['NVIDIA Drivers', 'NVIDIA driver'],
      ['Logitech G', 'Logitech G'],
    ],
    topics: [
      ['NVIDIA', 'NVIDIA GPU'],
      ['AMD', 'AMD GPU'],
      ['Intel', 'Intel CPU'],
      ['GPU Prices', 'GPU prices'],
      ['RAM + SSD', 'RAM SSD prices'],
      ['PC Hardware', 'PC hardware'],
      ['CPUs', 'CPU'],
      ['Monitors', 'gaming monitor'],
      ['Handhelds', 'handheld PC'],
      ['VR', 'VR'],
      ['AI Chips', 'AI chips'],
      ['Next-gen Consoles', 'next gen consoles'],
    ],
  },
};

/** Every chip from both hubs, games and gear first, for tagging stories outside a hub page. */
export const ALL_CHIPS: Chip[] = [
  ...HUBS.gaming.mine,
  ...HUBS.tech.mine,
  ...HUBS.gaming.topics,
  ...HUBS.tech.topics,
];
