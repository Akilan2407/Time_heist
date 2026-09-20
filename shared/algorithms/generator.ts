import { Room, Heist, Guard, GuardPatrolWaypoint } from '../types.js';

interface RoomTemplate {
  name: string;
  description: string;
  securityLevel: 'Low' | 'Medium' | 'High' | 'Extreme';
  icon: string;
  baseValue: number; // in $k
  baseTime: number;  // in seconds
}

const ROOM_TEMPLATES: RoomTemplate[] = [
  {
    name: 'Laser Grid Chamber',
    description: 'Bypass sweeping infrared security beams guarding high-value bearer bonds.',
    securityLevel: 'High',
    icon: 'laser',
    baseValue: 80,
    baseTime: 12
  },
  {
    name: 'Diamond Deposit Safe',
    description: 'Drill through reinforced titanium alloy door protecting rare cut diamonds.',
    securityLevel: 'Extreme',
    icon: 'diamond',
    baseValue: 120,
    baseTime: 16
  },
  {
    name: 'Quantum Server Mainframe',
    description: 'Hack the encrypted cold-storage wallet holding cryptographic private keys.',
    securityLevel: 'Extreme',
    icon: 'server',
    baseValue: 150,
    baseTime: 18
  },
  {
    name: 'Ancient Artifact Reliquary',
    description: 'Disable magnetic pressure plates under a priceless centuries-old golden chalice.',
    securityLevel: 'High',
    icon: 'relic',
    baseValue: 95,
    baseTime: 13
  },
  {
    name: 'Gold Bullion Reserves',
    description: 'Melt security lock and load stacks of heavy 24k gold bullion bars.',
    securityLevel: 'Medium',
    icon: 'gold',
    baseValue: 70,
    baseTime: 10
  },
  {
    name: 'Biometric Locker Hub',
    description: 'Spoof optical retinal scanners to unlock billionaire safety deposit boxes.',
    securityLevel: 'High',
    icon: 'fingerprint',
    baseValue: 85,
    baseTime: 11
  },
  {
    name: 'Prototype Blueprints Stash',
    description: 'Download classified aerospace defense schematics from an air-gapped terminal.',
    securityLevel: 'Medium',
    icon: 'cpu',
    baseValue: 60,
    baseTime: 8
  },
  {
    name: 'Crown Jewels Display',
    description: 'Cut soundlessly through acoustic-vibration sensor glass housing royal gems.',
    securityLevel: 'Extreme',
    icon: 'gem',
    baseValue: 140,
    baseTime: 17
  },
  {
    name: 'Executive Black Box',
    description: 'Override thermal lock to extract insider ledger USB drives.',
    securityLevel: 'Low',
    icon: 'key',
    baseValue: 40,
    baseTime: 5
  },
  {
    name: 'Rare Art Gallery',
    description: 'Disarm frame motion alarms and detach museum masterpiece canvas.',
    securityLevel: 'Medium',
    icon: 'art',
    baseValue: 75,
    baseTime: 9
  },
  {
    name: 'Neural Network Core',
    description: 'Siphon experimental proprietary AI weight matrices into flash drive.',
    securityLevel: 'Extreme',
    icon: 'brain',
    baseValue: 130,
    baseTime: 15
  },
  {
    name: 'Petty Cash & Safe Deposit',
    description: 'Fast combination crack on local manager safe box.',
    securityLevel: 'Low',
    icon: 'cash',
    baseValue: 30,
    baseTime: 4
  },
  {
    name: 'Swiss Numbered Box',
    description: 'Electromagnetic pulse lock-cracker on numbered offshore account seals.',
    securityLevel: 'High',
    icon: 'shield',
    baseValue: 90,
    baseTime: 11
  },
  {
    name: 'Surveillance Hub & Evidence',
    description: 'Wipe camera records and loot confiscated covert cash crates.',
    securityLevel: 'Low',
    icon: 'camera',
    baseValue: 35,
    baseTime: 5
  },
  {
    name: 'Exotic Gem Cache',
    description: 'Thermite burn on reinforced carbon-fiber showcase.',
    securityLevel: 'Medium',
    icon: 'sparkles',
    baseValue: 65,
    baseTime: 8
  },
  {
    name: 'Titanium Master Vault',
    description: 'The central hyper-secure vault containing the ultimate jackpot.',
    securityLevel: 'Extreme',
    icon: 'vault',
    baseValue: 200,
    baseTime: 22
  }
];

export interface GenerateHeistOptions {
  roomCount?: number;
  timeBudget?: number;
  difficulty?: 'Rookie' | 'Standard' | 'Mastermind' | 'Impossible';
  seed?: number;
}

export function generateHeist(options: GenerateHeistOptions = {}): Heist {
  const difficulty = options.difficulty || 'Standard';
  let roomCount = options.roomCount;
  let timeBudget = options.timeBudget;

  if (!roomCount || !timeBudget) {
    switch (difficulty) {
      case 'Rookie':
        roomCount = roomCount || 5;
        timeBudget = timeBudget || 25;
        break;
      case 'Standard':
        roomCount = roomCount || 8;
        timeBudget = timeBudget || 42;
        break;
      case 'Mastermind':
        roomCount = roomCount || 12;
        timeBudget = timeBudget || 60;
        break;
      case 'Impossible':
        roomCount = roomCount || 16;
        timeBudget = timeBudget || 80;
        break;
    }
  }

  // Shuffle templates
  const shuffledTemplates = [...ROOM_TEMPLATES].sort(() => 0.5 - Math.random());
  const selectedTemplates = shuffledTemplates.slice(0, Math.min(roomCount, ROOM_TEMPLATES.length));

  while (selectedTemplates.length < roomCount) {
    const idx = selectedTemplates.length + 1;
    selectedTemplates.push({
      name: `Vault Sector 0${idx}`,
      description: `High-value security sector with automated countermeasures.`,
      securityLevel: idx % 2 === 0 ? 'High' : 'Medium',
      icon: 'vault',
      baseValue: 50 + Math.floor(Math.random() * 80),
      baseTime: 6 + Math.floor(Math.random() * 12)
    });
  }

  const rooms: Room[] = selectedTemplates.map((template, i) => {
    const valVariance = 0.85 + Math.random() * 0.3;
    const timeVariance = 0.85 + Math.random() * 0.3;

    const value = Math.max(10, Math.round(template.baseValue * valVariance));
    const timeCost = Math.max(3, Math.round(template.baseTime * timeVariance));

    return {
      id: `room_${i + 1}`,
      name: template.name,
      description: template.description,
      securityLevel: template.securityLevel,
      icon: template.icon,
      value,
      timeCost,
      guarded: false
    };
  });

  // Generate 1-2 Guard Patrol Routes
  const guardCount = difficulty === 'Mastermind' || difficulty === 'Impossible' ? 2 : 1;
  const guards: Guard[] = [];

  // Guard 1: Patrols odd-indexed or high-value rooms
  const guard1Rooms = rooms.filter((_, i) => i % 2 === 0 || i === 0).slice(0, 3);
  if (guard1Rooms.length > 0) {
    guard1Rooms.forEach((r) => { r.guarded = true; });
    const route: GuardPatrolWaypoint[] = guard1Rooms.map((r) => ({
      roomId: r.id,
      stayDuration: 6 // 6 seconds inspection per room
    }));

    guards.push({
      id: 'guard_alpha',
      name: 'Sentry Drone Alpha',
      color: '#ef4444',
      patrolRoute: route,
      travelSpeed: 120
    });
  }

  // Guard 2 (if 2 guards requested): Patrols remaining rooms
  if (guardCount > 1 && rooms.length >= 4) {
    const guard2Rooms = rooms.filter((_, i) => i % 2 !== 0).slice(0, 3);
    guard2Rooms.forEach((r) => { r.guarded = true; });
    const route2: GuardPatrolWaypoint[] = guard2Rooms.map((r) => ({
      roomId: r.id,
      stayDuration: 7
    }));

    guards.push({
      id: 'guard_omega',
      name: 'Sentry Drone Omega',
      color: '#f59e0b',
      patrolRoute: route2,
      travelSpeed: 110
    });
  }

  const heistNames = [
    'Operation Midnight Mirage',
    'The Quantum Reserve Breach',
    'Apex Horizon Infiltration',
    'The Obsidian Depository Heist',
    'Cyberpunk Syndicate Raid',
    'The Federal Titanium Infiltration'
  ];

  const randomName = heistNames[Math.floor(Math.random() * heistNames.length)];

  return {
    id: `heist_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    name: randomName,
    difficulty,
    rooms,
    guards,
    timeBudget,
    createdAt: Date.now()
  };
}
