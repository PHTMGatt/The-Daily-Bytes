// Hub config for the Gaming (/dailybyte, home) and Tech (/tech) pages: chips, priority rows, copy.

export type Chip = [label: string, query: string];

export interface HubConfig {
  path: string;
  kicker: string;
  title: string;
  intro: string;
  placeholder: string;
  searchLabel: string;
  // The hub opens on one combined feed of everything in the "mine" row.
  defaultTopic: string;
  mineLabel: string;
  allLabel: string;
  mine: Chip[];
  topics: Chip[];
  priority: Array<{ label: string; query: string; copy: string }>;
  note: string;
  /** Badge shown when a story matches no chip. */
  fallbackTag: string;
}

export const HUBS: Record<'gaming' | 'tech', HubConfig> = {
  gaming: {
    path: '/dailybyte',
    kicker: 'GAMING',
    fallbackTag: 'Gaming',
    title: 'Your gaming pulse.',
    intro: 'Every game you play in one feed. Tap a game to zoom in, or search anything.',
    placeholder: 'Try Witcher 3, Crimson Desert, Apex...',
    searchLabel: 'Search gaming news',
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
    priority: [
      { label: 'Witcher 3', query: 'The Witcher 3', copy: 'CDPR updates, mods, visuals, and everything around the Continent.' },
      { label: 'Crimson Desert', query: 'Crimson Desert', copy: 'Pearl Abyss updates, patches, and Pywel news.' },
      { label: 'AC Black Flag', query: 'Assassins Creed Black Flag', copy: 'Black Flag Resynced, Kenway, and Ubisoft news.' },
      { label: 'Apex Legends', query: 'Apex Legends', copy: 'Seasons, ranked, legends, and Respawn updates.' },
      { label: 'Game Releases', query: 'video game releases', copy: 'What is launching and what just dropped.' },
    ],
    note: 'Your games load first. Pick one to focus, or tap All my games to see everything again.',
  },
  tech: {
    path: '/tech',
    kicker: 'TECH + PC HARDWARE',
    fallbackTag: 'Tech',
    title: 'Your gear and hardware pulse.',
    intro: 'Everything in your setup in one feed. Tap a part to zoom in, or search anything.',
    placeholder: 'Try RTX 5090, Dominator Titanium, Corsair...',
    searchLabel: 'Search tech and hardware news',
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
    priority: [
      { label: 'NVIDIA', query: 'NVIDIA GPU', copy: 'GeForce launches, drivers, DLSS, RTX hardware, and GPU moves.' },
      { label: 'GPU Prices', query: 'GPU prices', copy: 'Graphics card pricing, availability, market shifts, and new deals.' },
      { label: 'RAM + SSD', query: 'RAM SSD prices', copy: 'Memory, storage, DDR5, SSD pricing, and component market changes.' },
      { label: 'Corsair', query: 'Corsair', copy: 'Dominator, XENEON, cases, iCUE, and the rest of your build.' },
      { label: 'PC Hardware', query: 'PC hardware', copy: 'CPUs, cooling, cases, displays, builds, and enthusiast hardware.' },
    ],
    note: 'Your gear loads first. Pick a part to focus, or tap All my gear to see everything again.',
  },
};

/** Every chip from both hubs, games and gear first, for tagging stories outside a hub page. */
export const ALL_CHIPS: Chip[] = [
  ...HUBS.gaming.mine,
  ...HUBS.tech.mine,
  ...HUBS.gaming.topics,
  ...HUBS.tech.topics,
];
