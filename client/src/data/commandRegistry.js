/**
 * Command Registry — Central registry of all slash commands for the command palette.
 *
 * Each command has:
 *   - id: unique identifier
 *   - name: display name
 *   - keywords: array of slash-trigger aliases (matched when user types /xxx)
 *   - description: brief description shown in palette
 *   - route: the React Router path to navigate to
 *   - category: grouping category
 *   - icon: lucide-react icon name (string) for rendering
 */

const commandRegistry = [
  // ── Main ──
  {
    id: 'dashboard',
    name: 'Dashboard',
    keywords: ['dashboard', 'home', 'overview', 'main', 'dash'],
    description: 'View your farm overview and quick stats',
    route: '/dashboard',
    category: 'Main',
    icon: 'Home',
  },
  {
    id: 'fields',
    name: 'My Fields',
    keywords: ['fields', 'my-fields', 'field-list', 'field', 'farms', 'plots'],
    description: 'View and manage all your farm fields',
    route: '/field-list',
    category: 'Main',
    icon: 'MapPin',
  },
  {
    id: 'create-field',
    name: 'Create Field',
    keywords: ['create-field', 'new-field', 'add-field', 'create', 'new', 'add'],
    description: 'Create a new farm field on the map',
    route: '/create-field',
    category: 'Main',
    icon: 'PlusCircle',
  },
  {
    id: 'crop-management',
    name: 'Crop Management',
    keywords: ['crop-management', 'crop', 'crops', 'manage-crops', 'crop-planning', 'planting'],
    description: 'Manage your crops, planning, and schedules',
    route: '/crop-management',
    category: 'Main',
    icon: 'Sprout',
  },
  {
    id: 'financial-aid',
    name: 'Financial Aid',
    keywords: ['financial-aid', 'financial', 'finance', 'aid', 'loans', 'subsidies', 'schemes', 'money', 'loan', 'bank'],
    description: 'Explore government schemes, loans, and subsidies',
    route: '/financial-aid',
    category: 'Main',
    icon: 'HandCoins',
  },
  {
    id: 'market-price',
    name: 'Market Prices',
    keywords: ['market-price', 'market', 'prices', 'price', 'mandi', 'rates', 'sell', 'trading'],
    description: 'Check current crop market prices and trends',
    route: '/market-price',
    category: 'Main',
    icon: 'TrendingUp',
  },
  {
    id: 'plant-disease',
    name: 'Plant Disease Detection',
    keywords: ['plant-disease', 'disease', 'detection', 'plant', 'pest', 'diagnosis', 'scan', 'identify', 'sick'],
    description: 'Detect and diagnose plant diseases with AI',
    route: '/plant-disease-detection',
    category: 'Main',
    icon: 'Search',
  },
  {
    id: 'ai-assistant',
    name: 'AI Assistant',
    keywords: ['ai-assistant', 'ai', 'assistant', 'chat', 'ask', 'help', 'bot', 'farmmate'],
    description: 'Chat with Farmmate AI for farming advice',
    route: '/ai-assistant',
    category: 'Main',
    icon: 'Bot',
  },

  // ── Climate Analysis ──
  {
    id: 'weather',
    name: 'Weather Forecast',
    keywords: ['weather', 'forecast', 'climate', 'temperature', 'humidity', 'wind', 'temp'],
    description: 'View detailed weather forecasts for your area',
    route: '/climate',
    category: 'Climate Analysis',
    icon: 'CloudSun',
  },
  {
    id: 'vegetation',
    name: 'Vegetation & Crop Health',
    keywords: ['vegetation', 'ndvi', 'crop-health', 'greenness', 'health', 'veg', 'green', 'evi'],
    description: 'Analyze vegetation indices and crop health (NDVI)',
    route: '/vegetation',
    category: 'Climate Analysis',
    icon: 'Leaf',
  },
  {
    id: 'water-irrigation',
    name: 'Water Irrigation Analysis',
    keywords: ['water-irrigation', 'water', 'irrigation-analysis', 'ndwi', 'moisture'],
    description: 'Analyze water irrigation patterns and moisture data',
    route: '/water',
    category: 'Climate Analysis',
    icon: 'CloudRain',
  },
  {
    id: 'fire',
    name: 'Fire Info',
    keywords: ['fire', 'fire-info', 'burn', 'wildfire', 'hotspot', 'thermal'],
    description: 'Monitor fire activity and thermal hotspots',
    route: '/fire',
    category: 'Climate Analysis',
    icon: 'Flame',
  },
  {
    id: 'rainfall',
    name: 'Rainfall & Monsoon',
    keywords: ['rainfall', 'rain', 'monsoon', 'precipitation', 'drizzle', 'downpour'],
    description: 'Track rainfall patterns and monsoon data',
    route: '/rainfall',
    category: 'Climate Analysis',
    icon: 'CloudDrizzle',
  },
  {
    id: 'soil',
    name: 'Soil Info',
    keywords: ['soil', 'soil-info', 'land', 'terrain', 'earth', 'ph', 'nutrient'],
    description: 'Analyze soil health, nutrients, and composition',
    route: '/soil',
    category: 'Climate Analysis',
    icon: 'Layers',
  },

  // ── Irrigation ──
  {
    id: 'water-management',
    name: 'Water Management',
    keywords: ['water-management', 'water-mgmt', 'irrigation', 'watering', 'pump'],
    description: 'Manage water resources and irrigation systems',
    route: '/water-management',
    category: 'Irrigation',
    icon: 'Droplet',
  },
  {
    id: 'irrigation-schedule',
    name: 'Schedule & Control',
    keywords: ['irrigation-schedule', 'schedule', 'control', 'automate', 'timer', 'iot'],
    description: 'Set up irrigation schedules and controls',
    route: '/irrigation',
    category: 'Irrigation',
    icon: 'CalendarClock',
  },

  // ── Trader ──
  {
    id: 'trader-dashboard',
    name: 'Trader Dashboard',
    keywords: ['trader', 'trader-dashboard', 'trading', 'buyer', 'merchant'],
    description: 'Switch to the trader dashboard view',
    route: '/trader/dashboard',
    category: 'Trader',
    icon: 'TrendingUp',
  },
  {
    id: 'trader-market',
    name: 'Trader Market Price',
    keywords: ['trader-market', 'trader-price', 'wholesale', 'bulk'],
    description: 'View market prices from trader perspective',
    route: '/trader/market-price',
    category: 'Trader',
    icon: 'TrendingUp',
  },
  {
    id: 'trader-events',
    name: 'Event Management',
    keywords: ['events', 'event-management', 'event', 'expo', 'fair', 'mela'],
    description: 'Manage agricultural events and expos',
    route: '/trader/event-management',
    category: 'Trader',
    icon: 'CalendarClock',
  },
  {
    id: 'trader-connections',
    name: 'Connections',
    keywords: ['connections', 'connect', 'network', 'farmers', 'contacts'],
    description: 'Manage your farmer and trader connections',
    route: '/trader/connections',
    category: 'Trader',
    icon: 'Users',
  },

  // ── Other ──
  {
    id: 'settings',
    name: 'Settings',
    keywords: ['settings', 'profile', 'account', 'preferences', 'config'],
    description: 'Manage your account and preferences',
    route: '/profile',
    category: 'Other',
    icon: 'Settings',
  },
  {
    id: 'reports',
    name: 'Reports',
    keywords: ['reports', 'report', 'analytics', 'summary', 'export'],
    description: 'View and export farm reports',
    route: '/reports',
    category: 'Other',
    icon: 'FileText',
  },
];

/**
 * Fuzzy-match a query against a command.
 * Returns a score (higher = better match) or 0 if no match.
 *
 * Matching strategy:
 *   1. Exact keyword match → highest score (100)
 *   2. Keyword starts with query → high score (80)
 *   3. Keyword contains query → medium score (60)
 *   4. Name starts with query → medium score (50)
 *   5. Name contains query → lower score (40)
 *   6. Description contains query → lowest score (20)
 *   7. Category matches → bonus score (10)
 */
export function matchCommand(command, query) {
  if (!query) return 100; // show all when empty

  const q = query.toLowerCase().trim();
  if (!q) return 100;

  let bestScore = 0;

  // Check keywords
  for (const kw of command.keywords) {
    const kwLower = kw.toLowerCase();
    if (kwLower === q) {
      bestScore = Math.max(bestScore, 100); // exact match
    } else if (kwLower.startsWith(q)) {
      bestScore = Math.max(bestScore, 80); // prefix match
    } else if (kwLower.includes(q)) {
      bestScore = Math.max(bestScore, 60); // contains
    }
  }

  // Check name
  const nameLower = command.name.toLowerCase();
  if (nameLower === q) {
    bestScore = Math.max(bestScore, 95);
  } else if (nameLower.startsWith(q)) {
    bestScore = Math.max(bestScore, 50);
  } else if (nameLower.includes(q)) {
    bestScore = Math.max(bestScore, 40);
  }

  // Check individual words in the name
  const nameWords = nameLower.split(/\s+/);
  for (const word of nameWords) {
    if (word.startsWith(q)) {
      bestScore = Math.max(bestScore, 55);
    }
  }

  // Check description
  const descLower = command.description.toLowerCase();
  if (descLower.includes(q)) {
    bestScore = Math.max(bestScore, 20);
  }

  // Category bonus
  if (command.category.toLowerCase().includes(q)) {
    bestScore = Math.max(bestScore, 15);
  }

  return bestScore;
}

/**
 * Search commands with a query string.
 * Returns matched commands sorted by relevance score (best first).
 */
export function searchCommands(query) {
  const q = query.replace(/^\//, '').trim(); // strip leading /

  const results = commandRegistry
    .map(cmd => ({ ...cmd, score: matchCommand(cmd, q) }))
    .filter(cmd => cmd.score > 0)
    .sort((a, b) => b.score - a.score);

  return results;
}

/**
 * Get commands grouped by category
 */
export function getGroupedCommands(query) {
  const results = searchCommands(query);
  const groups = {};
  const categoryOrder = ['Main', 'Climate Analysis', 'Irrigation', 'Trader', 'Other'];

  for (const cmd of results) {
    if (!groups[cmd.category]) {
      groups[cmd.category] = [];
    }
    groups[cmd.category].push(cmd);
  }

  // Return as ordered array of { category, commands }
  return categoryOrder
    .filter(cat => groups[cat]?.length > 0)
    .map(cat => ({ category: cat, commands: groups[cat] }));
}

/**
 * Highlight matching text in a string
 */
export function highlightMatch(text, query) {
  if (!query) return [{ text, highlight: false }];

  const q = query.replace(/^\//, '').trim().toLowerCase();
  if (!q) return [{ text, highlight: false }];

  const idx = text.toLowerCase().indexOf(q);
  if (idx === -1) return [{ text, highlight: false }];

  return [
    { text: text.slice(0, idx), highlight: false },
    { text: text.slice(idx, idx + q.length), highlight: true },
    { text: text.slice(idx + q.length), highlight: false },
  ].filter(part => part.text.length > 0);
}

export default commandRegistry;
