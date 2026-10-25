import { RoleType, StatKey, Weapon, ArmorItem, CyberwareItem, GearItem } from '../types/character';

export interface RoleStatOption {
  rollRange: string; // Single 1d10 result, "1" through "10" (Core pp. 74-77)
  stats: Record<StatKey, number>;
}

export interface RolePackage {
  role: RoleType;
  nameRu: string;
  descRu: string;
  statTable: RoleStatOption[];
  streetratSkills: Record<string, number>; // Full 86 points allocated
  edgerunnerCareerSkills: Record<string, number>; // All 20 prescribed skills start at 2 (Core pp. 88-89)
  equipment: {
    weapons: { name: string; category: Weapon['category']; damage: string; rof: number; mag: number; ammo: string; skillId: string }[];
    armor: { head: { name: string; sp: number; penalty: number }; body: { name: string; sp: number; penalty: number } };
    cyberware: { name: string; category: CyberwareItem['category']; loc: string; hl: number; desc: string }[];
    gear: { name: string; category: string; quantity: number; notes: string }[];
    pocketCashEb: number;
  };
}

// Core pp. 74-77: role STAT tables; pp. 86-89: Streetrat and Edgerunner skills.
// Equipment: Core pp. 98, 103, 117; first listed alternative is selected.
// Medtech HL uses component costs (0 + 7 + 2 = 9); p. 117 prints an inconsistent total of 12.
export const CPR_ROLE_PACKAGES: Record<RoleType, RolePackage> = {
  Solo: {
    role: 'Solo',
    nameRu: 'Соло',
    descRu: 'Профессиональный наемник, телохранитель и штурмовик.',
    statTable: [
      { rollRange: '1', stats: { INT: 6, REF: 7, DEX: 7, TECH: 3, COOL: 8, WILL: 6, LUCK: 5, MOVE: 5, BODY: 6, EMP: 5 } },
      { rollRange: '2', stats: { INT: 7, REF: 8, DEX: 6, TECH: 3, COOL: 6, WILL: 6, LUCK: 7, MOVE: 5, BODY: 6, EMP: 6 } },
      { rollRange: '3', stats: { INT: 5, REF: 8, DEX: 7, TECH: 4, COOL: 7, WILL: 7, LUCK: 6, MOVE: 7, BODY: 8, EMP: 5 } },
      { rollRange: '4', stats: { INT: 5, REF: 8, DEX: 6, TECH: 4, COOL: 6, WILL: 7, LUCK: 6, MOVE: 5, BODY: 7, EMP: 6 } },
      { rollRange: '5', stats: { INT: 6, REF: 6, DEX: 7, TECH: 5, COOL: 7, WILL: 6, LUCK: 7, MOVE: 6, BODY: 8, EMP: 4 } },
      { rollRange: '6', stats: { INT: 7, REF: 7, DEX: 6, TECH: 5, COOL: 7, WILL: 6, LUCK: 6, MOVE: 7, BODY: 7, EMP: 5 } },
      { rollRange: '7', stats: { INT: 7, REF: 7, DEX: 6, TECH: 5, COOL: 6, WILL: 7, LUCK: 7, MOVE: 6, BODY: 6, EMP: 6 } },
      { rollRange: '8', stats: { INT: 7, REF: 8, DEX: 7, TECH: 5, COOL: 6, WILL: 6, LUCK: 5, MOVE: 6, BODY: 8, EMP: 4 } },
      { rollRange: '9', stats: { INT: 7, REF: 7, DEX: 6, TECH: 4, COOL: 6, WILL: 6, LUCK: 6, MOVE: 5, BODY: 6, EMP: 5 } },
      { rollRange: '10', stats: { INT: 6, REF: 6, DEX: 8, TECH: 5, COOL: 6, WILL: 6, LUCK: 5, MOVE: 6, BODY: 6, EMP: 5 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2, evasion: 6, first_aid: 6,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 6, persuasion: 2,
      stealth: 2, autofire: 6, handgun: 6, interrogation: 6, melee_weapon: 6, resist_torture: 6,
      shoulder_arms: 6, tactics: 6,
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2, evasion: 2, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, autofire: 2, handgun: 2, interrogation: 2, melee_weapon: 2, resist_torture: 2,
      shoulder_arms: 2, tactics: 2,
    },
    equipment: {
      weapons: [
        { name: 'Assault Rifle', category: 'Assault Rifle', damage: '5d6', rof: 1, mag: 25, ammo: 'Rifle Ammo', skillId: 'shoulder_arms' },
        { name: 'Very Heavy Pistol', category: 'Very Heavy Pistol', damage: '4d6', rof: 1, mag: 8, ammo: 'Very Heavy Pistol', skillId: 'handgun' },
        { name: 'Heavy Melee', category: 'Heavy Melee', damage: '3d6', rof: 2, mag: 0, ammo: 'None', skillId: 'melee_weapon' },
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack', sp: 11, penalty: 0 },
      },
      cyberware: [
        { name: 'Biomonitor', category: 'Fashionware', loc: 'Body', hl: 0, desc: 'Монитор жизненных функций (Core p. 111)' },
        { name: 'Neural Link', category: 'Neuralware', loc: 'Spine', hl: 7, desc: 'Основа нейроимплантов, 5 слотов (Core p. 112)' },
        { name: 'Sandevistan', category: 'Neuralware', loc: 'Spine', hl: 7, desc: 'Активация действием: +3 Initiative на 1 минуту; перезарядка 1 час (Core p. 112)' },
      ],
      gear: [
        { name: 'Very Heavy Pistol Ammo', category: 'Ammo', quantity: 30, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Rifle Ammo', category: 'Ammo', quantity: 70, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Agent', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Leisurewear: Footwear', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Jacket', category: 'Fashion', quantity: 3, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Mirrorshades', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Bottoms', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Top', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
      ],
      pocketCashEb: 500
    }
  },

  Netrunner: {
    role: 'Netrunner',
    nameRu: 'Нетраннер',
    descRu: 'Киберхакер, взломщик компьютерных сетей и систем безопасности.',
    statTable: [
      { rollRange: '1', stats: { INT: 5, REF: 8, DEX: 7, TECH: 7, COOL: 7, WILL: 4, LUCK: 8, MOVE: 7, BODY: 7, EMP: 4 } },
      { rollRange: '2', stats: { INT: 5, REF: 6, DEX: 7, TECH: 5, COOL: 8, WILL: 3, LUCK: 8, MOVE: 7, BODY: 5, EMP: 5 } },
      { rollRange: '3', stats: { INT: 5, REF: 6, DEX: 8, TECH: 6, COOL: 6, WILL: 4, LUCK: 7, MOVE: 6, BODY: 7, EMP: 4 } },
      { rollRange: '4', stats: { INT: 5, REF: 7, DEX: 7, TECH: 7, COOL: 7, WILL: 5, LUCK: 8, MOVE: 6, BODY: 5, EMP: 5 } },
      { rollRange: '5', stats: { INT: 5, REF: 8, DEX: 8, TECH: 5, COOL: 7, WILL: 3, LUCK: 7, MOVE: 5, BODY: 5, EMP: 6 } },
      { rollRange: '6', stats: { INT: 6, REF: 6, DEX: 6, TECH: 7, COOL: 8, WILL: 4, LUCK: 7, MOVE: 7, BODY: 6, EMP: 6 } },
      { rollRange: '7', stats: { INT: 6, REF: 6, DEX: 6, TECH: 7, COOL: 6, WILL: 5, LUCK: 7, MOVE: 7, BODY: 7, EMP: 6 } },
      { rollRange: '8', stats: { INT: 5, REF: 7, DEX: 8, TECH: 6, COOL: 8, WILL: 4, LUCK: 8, MOVE: 5, BODY: 7, EMP: 4 } },
      { rollRange: '9', stats: { INT: 7, REF: 6, DEX: 7, TECH: 7, COOL: 6, WILL: 3, LUCK: 6, MOVE: 5, BODY: 6, EMP: 5 } },
      { rollRange: '10', stats: { INT: 7, REF: 8, DEX: 6, TECH: 6, COOL: 6, WILL: 4, LUCK: 7, MOVE: 7, BODY: 5, EMP: 6 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 6, evasion: 6, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 6, basic_tech: 6, conceal_reveal: 6, cryptography: 6, cybertech: 6, electronics_security: 6,
      handgun: 6, library_search: 6,
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2, evasion: 2, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, basic_tech: 2, conceal_reveal: 2, cryptography: 2, cybertech: 2, electronics_security: 2,
      handgun: 2, library_search: 2,
    },
    equipment: {
      weapons: [
        { name: 'Very Heavy Pistol', category: 'Very Heavy Pistol', damage: '4d6', rof: 1, mag: 8, ammo: 'Very Heavy Pistol', skillId: 'handgun' },
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack', sp: 11, penalty: 0 },
      },
      cyberware: [
        { name: 'Neural Link', category: 'Neuralware', loc: 'Spine', hl: 7, desc: 'Основа нейроимплантов, 5 слотов (Core p. 112)' },
        { name: 'Interface Plugs', category: 'Neuralware', loc: 'Wrists', hl: 7, desc: 'Подключение к устройствам; требуется Neural Link (Core p. 112)' },
        { name: 'Shift Tacts', category: 'Fashionware', loc: 'Eyes', hl: 0, desc: 'Меняющие цвет контактные линзы (Core p. 111)' },
      ],
      gear: [
        { name: 'Very Heavy Pistol Ammo', category: 'Ammo', quantity: 30, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Agent', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Cyberdeck (7 slots)', category: 'Cyberdeck', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Virtuality Goggles', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Armor', category: 'Program', quantity: 1, notes: 'Core p. 103: стартовая программа' },
        { name: 'Sword', category: 'Program', quantity: 2, notes: 'Core p. 103: две копии стартовой программы' },
        { name: 'SeeYa', category: 'Program', quantity: 1, notes: 'Core p. 103: выбран SeeYa вместо Eraser' },
        { name: 'Worm', category: 'Program', quantity: 1, notes: 'Core p. 103: выбран Worm вместо Sword' },
        { name: 'Generic Chic: Top', category: 'Fashion', quantity: 10, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Footwear', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Jewelry', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Bottoms', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Urban Flash: Jacket', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
      ],
      pocketCashEb: 500
    }
  },

  Tech: {
    role: 'Tech',
    nameRu: 'Техник',
    descRu: 'Мастер механики, модификаций, электроники и создания снаряжения.',
    statTable: [
      { rollRange: '1', stats: { INT: 6, REF: 7, DEX: 7, TECH: 8, COOL: 4, WILL: 4, LUCK: 5, MOVE: 5, BODY: 7, EMP: 6 } },
      { rollRange: '2', stats: { INT: 7, REF: 6, DEX: 6, TECH: 7, COOL: 5, WILL: 3, LUCK: 7, MOVE: 7, BODY: 5, EMP: 5 } },
      { rollRange: '3', stats: { INT: 8, REF: 6, DEX: 5, TECH: 7, COOL: 5, WILL: 4, LUCK: 7, MOVE: 7, BODY: 5, EMP: 7 } },
      { rollRange: '4', stats: { INT: 7, REF: 8, DEX: 7, TECH: 8, COOL: 4, WILL: 4, LUCK: 6, MOVE: 5, BODY: 6, EMP: 7 } },
      { rollRange: '5', stats: { INT: 6, REF: 6, DEX: 7, TECH: 6, COOL: 4, WILL: 3, LUCK: 7, MOVE: 7, BODY: 6, EMP: 6 } },
      { rollRange: '6', stats: { INT: 8, REF: 7, DEX: 5, TECH: 6, COOL: 3, WILL: 3, LUCK: 7, MOVE: 6, BODY: 6, EMP: 7 } },
      { rollRange: '7', stats: { INT: 8, REF: 6, DEX: 7, TECH: 8, COOL: 4, WILL: 4, LUCK: 7, MOVE: 6, BODY: 7, EMP: 6 } },
      { rollRange: '8', stats: { INT: 8, REF: 8, DEX: 7, TECH: 8, COOL: 5, WILL: 4, LUCK: 6, MOVE: 5, BODY: 6, EMP: 6 } },
      { rollRange: '9', stats: { INT: 6, REF: 6, DEX: 7, TECH: 8, COOL: 3, WILL: 3, LUCK: 5, MOVE: 7, BODY: 7, EMP: 7 } },
      { rollRange: '10', stats: { INT: 8, REF: 8, DEX: 5, TECH: 6, COOL: 4, WILL: 4, LUCK: 6, MOVE: 5, BODY: 6, EMP: 6 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 6, evasion: 6, first_aid: 6,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, basic_tech: 6, cybertech: 6, electronics_security: 6, land_vehicle_tech: 6,
      shoulder_arms: 6, science: 6, weaponstech: 6,
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2, evasion: 2, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, basic_tech: 2, cybertech: 2, electronics_security: 2, land_vehicle_tech: 2,
      shoulder_arms: 2, science: 2, weaponstech: 2,
    },
    equipment: {
      weapons: [
        { name: 'Shotgun', category: 'Shotgun', damage: '5d6', rof: 1, mag: 4, ammo: 'Shotgun Shells', skillId: 'shoulder_arms' },
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack', sp: 11, penalty: 0 },
      },
      cyberware: [
        { name: 'Cybereye', category: 'Cyberoptics', loc: 'Eye', hl: 7, desc: 'Основа кибероптики, 3 слота (Core p. 112)' },
        { name: 'MicroOptics', category: 'Cyberoptics', loc: 'Eye', hl: 2, desc: 'Увеличение до 400×; требуется Cybereye (Core p. 112)' },
        { name: 'Subdermal Watch', category: 'Fashionware', loc: 'Wrist', hl: 0, desc: 'Подкожные часы (Core p. 111)' },
        { name: 'Tool Hand', category: 'Cyberlimb', loc: 'Hand', hl: 3, desc: 'Инструменты в пальцах; можно установить в обычную руку (Core p. 115)' },
      ],
      gear: [
        { name: 'Shotgun Shells', category: 'Ammo', quantity: 100, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Flashbang Grenade', category: 'Grenade', quantity: 1, notes: 'Core p. 98; правила боеприпасов p. 351' },
        { name: 'Agent', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Anti-Smog Breathing Mask', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Disposable Cell Phone', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Duct Tape', category: 'Gear', quantity: 5, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Flashlight', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Road Flare', category: 'Gear', quantity: 6, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Tech Bag', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Generic Chic: Bottoms', category: 'Fashion', quantity: 8, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Generic Chic: Top', category: 'Fashion', quantity: 10, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Footwear', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
      ],
      pocketCashEb: 500
    }
  },

  Medtech: {
    role: 'Medtech',
    nameRu: 'Медтех',
    descRu: 'Полевой хирург, создатель медикаментов и спасатель жизней.',
    statTable: [
      { rollRange: '1', stats: { INT: 7, REF: 5, DEX: 6, TECH: 7, COOL: 5, WILL: 3, LUCK: 8, MOVE: 5, BODY: 5, EMP: 7 } },
      { rollRange: '2', stats: { INT: 6, REF: 7, DEX: 7, TECH: 7, COOL: 4, WILL: 4, LUCK: 6, MOVE: 7, BODY: 7, EMP: 7 } },
      { rollRange: '3', stats: { INT: 6, REF: 5, DEX: 5, TECH: 8, COOL: 5, WILL: 3, LUCK: 8, MOVE: 5, BODY: 7, EMP: 8 } },
      { rollRange: '4', stats: { INT: 8, REF: 7, DEX: 6, TECH: 8, COOL: 3, WILL: 5, LUCK: 6, MOVE: 6, BODY: 5, EMP: 7 } },
      { rollRange: '5', stats: { INT: 6, REF: 7, DEX: 5, TECH: 7, COOL: 5, WILL: 5, LUCK: 8, MOVE: 7, BODY: 6, EMP: 8 } },
      { rollRange: '6', stats: { INT: 8, REF: 5, DEX: 5, TECH: 8, COOL: 5, WILL: 5, LUCK: 6, MOVE: 6, BODY: 5, EMP: 6 } },
      { rollRange: '7', stats: { INT: 8, REF: 6, DEX: 5, TECH: 8, COOL: 5, WILL: 4, LUCK: 8, MOVE: 5, BODY: 7, EMP: 7 } },
      { rollRange: '8', stats: { INT: 6, REF: 5, DEX: 7, TECH: 7, COOL: 3, WILL: 5, LUCK: 8, MOVE: 5, BODY: 5, EMP: 8 } },
      { rollRange: '9', stats: { INT: 6, REF: 6, DEX: 7, TECH: 7, COOL: 5, WILL: 4, LUCK: 6, MOVE: 6, BODY: 5, EMP: 6 } },
      { rollRange: '10', stats: { INT: 8, REF: 7, DEX: 6, TECH: 6, COOL: 3, WILL: 4, LUCK: 8, MOVE: 7, BODY: 6, EMP: 7 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 6, education: 6, evasion: 6, first_aid: 2,
      human_perception: 6, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, basic_tech: 6, cybertech: 4, deduction: 6, paramedic: 6, resist_torture: 4, science: 6,
      shoulder_arms: 6,
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2, evasion: 2, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, basic_tech: 2, cybertech: 2, deduction: 2, paramedic: 2, resist_torture: 2, science: 2,
      shoulder_arms: 2,
    },
    equipment: {
      weapons: [
        { name: 'Shotgun', category: 'Shotgun', damage: '5d6', rof: 1, mag: 4, ammo: 'Shotgun Shells', skillId: 'shoulder_arms' },
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack', sp: 11, penalty: 0 },
      },
      cyberware: [
        { name: 'Biomonitor', category: 'Fashionware', loc: 'Body', hl: 0, desc: 'Монитор жизненных функций (Core p. 111)' },
        { name: 'Cybereye', category: 'Cyberoptics', loc: 'Eye', hl: 7, desc: 'Основа кибероптики, 3 слота (Core p. 112)' },
        { name: 'Nasal Filters', category: 'Internal', loc: 'Head', hl: 2, desc: 'Иммунитет к ядовитым газам и испарениям (Core p. 114)' },
      ],
      gear: [
        { name: 'Shotgun Shells', category: 'Ammo', quantity: 100, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Incendiary Shotgun Shells', category: 'Ammo', quantity: 10, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Smoke Grenade', category: 'Grenade', quantity: 2, notes: 'Core p. 98; правила боеприпасов p. 351' },
        { name: 'Ballistic Shield', category: 'Shield', quantity: 1, notes: 'Core p. 98: щит, 10 HP (не SP); Core p. 183' },
        { name: 'Agent', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Airhypo', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Handcuffs', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Flashlight', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Generic Chic: Jacket', category: 'Fashion', quantity: 3, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Glow Paint', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Medtech Bag', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Leisurewear: Footwear', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Bottoms', category: 'Fashion', quantity: 3, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Top', category: 'Fashion', quantity: 5, notes: 'Core p. 103: стартовая одежда' },
      ],
      pocketCashEb: 500
    }
  },

  Rockerboy: {
    role: 'Rockerboy',
    nameRu: 'Рокербой',
    descRu: 'Харизматичный музыкант, мятежник и лидер уличного протеста.',
    statTable: [
      { rollRange: '1', stats: { INT: 7, REF: 6, DEX: 6, TECH: 5, COOL: 6, WILL: 8, LUCK: 7, MOVE: 7, BODY: 3, EMP: 8 } },
      { rollRange: '2', stats: { INT: 3, REF: 7, DEX: 7, TECH: 7, COOL: 7, WILL: 6, LUCK: 7, MOVE: 7, BODY: 5, EMP: 8 } },
      { rollRange: '3', stats: { INT: 4, REF: 5, DEX: 7, TECH: 7, COOL: 6, WILL: 6, LUCK: 7, MOVE: 7, BODY: 5, EMP: 8 } },
      { rollRange: '4', stats: { INT: 4, REF: 5, DEX: 7, TECH: 7, COOL: 6, WILL: 8, LUCK: 7, MOVE: 6, BODY: 3, EMP: 8 } },
      { rollRange: '5', stats: { INT: 3, REF: 7, DEX: 7, TECH: 7, COOL: 6, WILL: 8, LUCK: 6, MOVE: 5, BODY: 4, EMP: 7 } },
      { rollRange: '6', stats: { INT: 5, REF: 6, DEX: 7, TECH: 5, COOL: 7, WILL: 8, LUCK: 5, MOVE: 7, BODY: 3, EMP: 7 } },
      { rollRange: '7', stats: { INT: 5, REF: 6, DEX: 6, TECH: 7, COOL: 7, WILL: 8, LUCK: 7, MOVE: 6, BODY: 3, EMP: 6 } },
      { rollRange: '8', stats: { INT: 5, REF: 7, DEX: 7, TECH: 5, COOL: 6, WILL: 6, LUCK: 6, MOVE: 6, BODY: 4, EMP: 8 } },
      { rollRange: '9', stats: { INT: 3, REF: 5, DEX: 5, TECH: 6, COOL: 7, WILL: 8, LUCK: 7, MOVE: 5, BODY: 5, EMP: 7 } },
      { rollRange: '10', stats: { INT: 4, REF: 5, DEX: 6, TECH: 5, COOL: 8, WILL: 8, LUCK: 7, MOVE: 6, BODY: 4, EMP: 7 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 6, concentration: 2, conversation: 2, education: 2, evasion: 6, first_aid: 6,
      human_perception: 6, language_streetslang: 2, local_expert: 4, perception: 2, persuasion: 6,
      stealth: 2, composition: 6, handgun: 6, melee_weapon: 6, personal_grooming: 4, play_instrument: 6,
      streetwise: 6, wardrobe_style: 4,
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2, evasion: 2, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, composition: 2, handgun: 2, melee_weapon: 2, personal_grooming: 2, play_instrument: 2,
      streetwise: 2, wardrobe_style: 2,
    },
    equipment: {
      weapons: [
        { name: 'Very Heavy Pistol', category: 'Very Heavy Pistol', damage: '4d6', rof: 1, mag: 8, ammo: 'Very Heavy Pistol', skillId: 'handgun' },
        { name: 'Heavy Melee', category: 'Heavy Melee', damage: '3d6', rof: 2, mag: 0, ammo: 'None', skillId: 'melee_weapon' },
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack', sp: 11, penalty: 0 },
      },
      cyberware: [
        { name: 'Cyberaudio Suite', category: 'Cyberaudio', loc: 'Head', hl: 7, desc: 'Основа кибераудио, 3 слота (Core p. 113)' },
        { name: 'Audio Recorder', category: 'Cyberaudio', loc: 'Head', hl: 2, desc: 'Запись звука; требуется Cyberaudio Suite (Core p. 113)' },
        { name: 'Chemskin', category: 'Fashionware', loc: 'Skin', hl: 0, desc: 'В сочетании с Techhair: +2 Personal Grooming (Core p. 111)' },
        { name: 'Techhair', category: 'Fashionware', loc: 'Head', hl: 0, desc: 'В сочетании с Chemskin: +2 Personal Grooming (Core p. 111)' },
      ],
      gear: [
        { name: 'Very Heavy Pistol Ammo', category: 'Ammo', quantity: 50, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Teargas Grenade', category: 'Grenade', quantity: 2, notes: 'Core p. 98; правила боеприпасов p. 351' },
        { name: 'Agent', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Computer', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Electric Guitar', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Glow Paint', category: 'Gear', quantity: 5, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Pocket Amplifier', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Radio Scanner/Music Player', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Video Camera', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Generic Chic: Jacket', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Generic Chic: Jewelry', category: 'Fashion', quantity: 3, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Generic Chic: Top', category: 'Fashion', quantity: 4, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Jewelry', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Mirrorshades', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Footwear', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Urban Flash: Bottoms', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Urban Flash: Top', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
      ],
      pocketCashEb: 500
    }
  },

  Media: {
    role: 'Media',
    nameRu: 'Медиа',
    descRu: 'Журналист-расследователь, искатель правды и влиятельный репортер.',
    statTable: [
      { rollRange: '1', stats: { INT: 6, REF: 6, DEX: 5, TECH: 5, COOL: 8, WILL: 7, LUCK: 5, MOVE: 7, BODY: 5, EMP: 7 } },
      { rollRange: '2', stats: { INT: 8, REF: 7, DEX: 7, TECH: 3, COOL: 6, WILL: 6, LUCK: 6, MOVE: 5, BODY: 6, EMP: 8 } },
      { rollRange: '3', stats: { INT: 6, REF: 7, DEX: 7, TECH: 5, COOL: 6, WILL: 8, LUCK: 5, MOVE: 5, BODY: 5, EMP: 7 } },
      { rollRange: '4', stats: { INT: 6, REF: 5, DEX: 7, TECH: 5, COOL: 6, WILL: 7, LUCK: 5, MOVE: 5, BODY: 6, EMP: 6 } },
      { rollRange: '5', stats: { INT: 6, REF: 6, DEX: 7, TECH: 4, COOL: 8, WILL: 7, LUCK: 6, MOVE: 7, BODY: 5, EMP: 8 } },
      { rollRange: '6', stats: { INT: 7, REF: 5, DEX: 5, TECH: 4, COOL: 8, WILL: 7, LUCK: 6, MOVE: 7, BODY: 5, EMP: 8 } },
      { rollRange: '7', stats: { INT: 8, REF: 5, DEX: 6, TECH: 3, COOL: 7, WILL: 6, LUCK: 6, MOVE: 5, BODY: 6, EMP: 7 } },
      { rollRange: '8', stats: { INT: 6, REF: 5, DEX: 6, TECH: 5, COOL: 6, WILL: 8, LUCK: 6, MOVE: 6, BODY: 7, EMP: 8 } },
      { rollRange: '9', stats: { INT: 7, REF: 7, DEX: 5, TECH: 4, COOL: 6, WILL: 7, LUCK: 6, MOVE: 5, BODY: 6, EMP: 7 } },
      { rollRange: '10', stats: { INT: 7, REF: 6, DEX: 6, TECH: 3, COOL: 7, WILL: 6, LUCK: 7, MOVE: 6, BODY: 7, EMP: 6 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 6, education: 2, evasion: 6, first_aid: 2,
      human_perception: 6, language_streetslang: 2, local_expert: 6, perception: 6, persuasion: 6,
      stealth: 2, bribery: 6, composition: 6, deduction: 6, handgun: 6, library_search: 4, lip_reading: 4,
      photography_film: 4,
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2, evasion: 2, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, bribery: 2, composition: 2, deduction: 2, handgun: 2, library_search: 2, lip_reading: 2,
      photography_film: 2,
    },
    equipment: {
      weapons: [
        { name: 'Heavy Pistol', category: 'Heavy Pistol', damage: '3d6', rof: 2, mag: 8, ammo: 'Heavy Pistol', skillId: 'handgun' },
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack', sp: 11, penalty: 0 },
      },
      cyberware: [
        { name: 'Cyberaudio Suite', category: 'Cyberaudio', loc: 'Head', hl: 7, desc: 'Основа кибераудио, 3 слота (Core p. 113)' },
        { name: 'Amplified Hearing', category: 'Cyberaudio', loc: 'Head', hl: 3, desc: '+2 Perception при слуховом восприятии; требуется Cyberaudio Suite (Core p. 113)' },
        { name: 'Light Tattoo', category: 'Fashionware', loc: 'Skin', hl: 0, desc: 'Одна светотатуировка (Core p. 111)' },
      ],
      gear: [
        { name: 'Heavy Pistol Ammo', category: 'Ammo', quantity: 50, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Agent', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Audio Recorder', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Binoculars', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Disposable Cell Phone', category: 'Gear', quantity: 2, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Flashlight', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Computer', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Radio Scanner/Music Player', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Scrambler/Descrambler', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Video Camera', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Generic Chic: Footwear', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Generic Chic: Bottoms', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Generic Chic: Top', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Jacket', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Urban Flash: Mirrorshades', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
      ],
      pocketCashEb: 500
    }
  },

  Lawman: {
    role: 'Lawman',
    nameRu: 'Законник',
    descRu: 'Офицер полиции, патрульный Комбат-зоны, способный вызвать подкрепление.',
    statTable: [
      { rollRange: '1', stats: { INT: 5, REF: 6, DEX: 7, TECH: 5, COOL: 7, WILL: 8, LUCK: 5, MOVE: 6, BODY: 5, EMP: 6 } },
      { rollRange: '2', stats: { INT: 6, REF: 6, DEX: 6, TECH: 5, COOL: 6, WILL: 8, LUCK: 5, MOVE: 7, BODY: 5, EMP: 5 } },
      { rollRange: '3', stats: { INT: 5, REF: 7, DEX: 7, TECH: 7, COOL: 6, WILL: 7, LUCK: 5, MOVE: 5, BODY: 7, EMP: 6 } },
      { rollRange: '4', stats: { INT: 6, REF: 6, DEX: 7, TECH: 6, COOL: 6, WILL: 8, LUCK: 5, MOVE: 7, BODY: 7, EMP: 6 } },
      { rollRange: '5', stats: { INT: 6, REF: 6, DEX: 7, TECH: 6, COOL: 7, WILL: 7, LUCK: 6, MOVE: 5, BODY: 5, EMP: 6 } },
      { rollRange: '6', stats: { INT: 7, REF: 6, DEX: 5, TECH: 5, COOL: 7, WILL: 8, LUCK: 5, MOVE: 6, BODY: 7, EMP: 4 } },
      { rollRange: '7', stats: { INT: 7, REF: 8, DEX: 7, TECH: 5, COOL: 6, WILL: 8, LUCK: 7, MOVE: 6, BODY: 5, EMP: 4 } },
      { rollRange: '8', stats: { INT: 5, REF: 6, DEX: 6, TECH: 5, COOL: 6, WILL: 8, LUCK: 5, MOVE: 7, BODY: 6, EMP: 4 } },
      { rollRange: '9', stats: { INT: 7, REF: 7, DEX: 5, TECH: 5, COOL: 7, WILL: 7, LUCK: 6, MOVE: 5, BODY: 5, EMP: 6 } },
      { rollRange: '10', stats: { INT: 6, REF: 6, DEX: 5, TECH: 6, COOL: 8, WILL: 7, LUCK: 5, MOVE: 7, BODY: 6, EMP: 6 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 6, concentration: 2, conversation: 6, education: 2, evasion: 6, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, autofire: 6, criminology: 6, deduction: 6, handgun: 6, interrogation: 6,
      shoulder_arms: 6, tracking: 6,
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2, evasion: 2, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, autofire: 2, criminology: 2, deduction: 2, handgun: 2, interrogation: 2,
      shoulder_arms: 2, tracking: 2,
    },
    equipment: {
      weapons: [
        { name: 'Assault Rifle', category: 'Assault Rifle', damage: '5d6', rof: 1, mag: 25, ammo: 'Rifle Ammo', skillId: 'shoulder_arms' },
        { name: 'Heavy Pistol', category: 'Heavy Pistol', damage: '3d6', rof: 2, mag: 8, ammo: 'Heavy Pistol', skillId: 'handgun' },
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack', sp: 11, penalty: 0 },
      },
      cyberware: [
        { name: 'Hidden Holster', category: 'External', loc: 'Body', hl: 7, desc: 'Внутренняя кобура для скрываемого оружия (Core p. 114)' },
        { name: 'Subdermal Pocket', category: 'External', loc: 'Body', hl: 3, desc: 'Подкожный отсек (Core p. 114)' },
      ],
      gear: [
        { name: 'Rifle Ammo', category: 'Ammo', quantity: 100, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Heavy Pistol Ammo', category: 'Ammo', quantity: 30, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Ballistic Shield', category: 'Shield', quantity: 1, notes: 'Core p. 98: щит, 10 HP (не SP); Core p. 183' },
        { name: 'Agent', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Flashlight', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Handcuffs', category: 'Gear', quantity: 2, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Radio Communicator', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Road Flare', category: 'Gear', quantity: 10, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Generic Chic: Jacket', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Generic Chic: Bottoms', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Generic Chic: Top', category: 'Fashion', quantity: 3, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Footwear', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Jacket', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Bottoms', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Mirrorshades', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Top', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
      ],
      pocketCashEb: 500
    }
  },

  Exec: {
    role: 'Exec',
    nameRu: 'Менеджер',
    descRu: 'Менеджер высшего звена мегакорпорации, защищенный корпоративным бюджетом.',
    statTable: [
      { rollRange: '1', stats: { INT: 8, REF: 5, DEX: 5, TECH: 3, COOL: 8, WILL: 6, LUCK: 6, MOVE: 5, BODY: 5, EMP: 7 } },
      { rollRange: '2', stats: { INT: 8, REF: 6, DEX: 6, TECH: 4, COOL: 7, WILL: 6, LUCK: 7, MOVE: 7, BODY: 5, EMP: 7 } },
      { rollRange: '3', stats: { INT: 8, REF: 7, DEX: 6, TECH: 3, COOL: 8, WILL: 6, LUCK: 7, MOVE: 6, BODY: 4, EMP: 5 } },
      { rollRange: '4', stats: { INT: 8, REF: 5, DEX: 7, TECH: 5, COOL: 6, WILL: 5, LUCK: 6, MOVE: 5, BODY: 5, EMP: 7 } },
      { rollRange: '5', stats: { INT: 7, REF: 7, DEX: 6, TECH: 5, COOL: 8, WILL: 5, LUCK: 7, MOVE: 7, BODY: 5, EMP: 6 } },
      { rollRange: '6', stats: { INT: 5, REF: 7, DEX: 7, TECH: 3, COOL: 6, WILL: 7, LUCK: 6, MOVE: 5, BODY: 5, EMP: 7 } },
      { rollRange: '7', stats: { INT: 6, REF: 6, DEX: 7, TECH: 5, COOL: 8, WILL: 7, LUCK: 6, MOVE: 7, BODY: 4, EMP: 6 } },
      { rollRange: '8', stats: { INT: 6, REF: 7, DEX: 7, TECH: 3, COOL: 7, WILL: 5, LUCK: 7, MOVE: 5, BODY: 5, EMP: 7 } },
      { rollRange: '9', stats: { INT: 7, REF: 6, DEX: 7, TECH: 5, COOL: 7, WILL: 5, LUCK: 7, MOVE: 6, BODY: 5, EMP: 5 } },
      { rollRange: '10', stats: { INT: 7, REF: 7, DEX: 5, TECH: 5, COOL: 8, WILL: 6, LUCK: 6, MOVE: 7, BODY: 4, EMP: 7 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 6, education: 6, evasion: 6, first_aid: 2,
      human_perception: 6, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 6,
      stealth: 2, accounting: 6, bureaucracy: 6, business: 6, deduction: 6, handgun: 6, lip_reading: 6,
      personal_grooming: 4,
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2, evasion: 2, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, accounting: 2, bureaucracy: 2, business: 2, deduction: 2, handgun: 2, lip_reading: 2,
      personal_grooming: 2,
    },
    equipment: {
      weapons: [
        { name: 'Very Heavy Pistol', category: 'Very Heavy Pistol', damage: '4d6', rof: 1, mag: 8, ammo: 'Very Heavy Pistol', skillId: 'handgun' },
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack', sp: 11, penalty: 0 },
      },
      cyberware: [
        { name: 'Biomonitor', category: 'Fashionware', loc: 'Body', hl: 0, desc: 'Монитор жизненных функций (Core p. 111)' },
        { name: 'Cyberaudio Suite', category: 'Cyberaudio', loc: 'Head', hl: 7, desc: 'Основа кибераудио, 3 слота (Core p. 113)' },
        { name: 'Internal Agent', category: 'Cyberaudio', loc: 'Head', hl: 3, desc: 'Встроенный агент; требуется Cyberaudio Suite (Core p. 113)' },
        { name: 'Toxin Binders', category: 'Internal', loc: 'Body', hl: 2, desc: '+2 Resist Torture/Drugs (Core p. 114)' },
      ],
      gear: [
        { name: 'Very Heavy Pistol Ammo', category: 'Ammo', quantity: 50, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Radio Communicator', category: 'Gear', quantity: 4, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Scrambler/Descrambler', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Businesswear: Footwear', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Businesswear: Jacket', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Businesswear: Bottoms', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Businesswear: Mirrorshades', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Businesswear: Top', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Businesswear: Jewelry', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
      ],
      pocketCashEb: 500
    }
  },

  Fixer: {
    role: 'Fixer',
    nameRu: 'Фиксер',
    descRu: 'Брокер подполья, связной между заказчиками и наемниками, торговец связями.',
    statTable: [
      { rollRange: '1', stats: { INT: 8, REF: 5, DEX: 7, TECH: 4, COOL: 6, WILL: 5, LUCK: 8, MOVE: 5, BODY: 5, EMP: 8 } },
      { rollRange: '2', stats: { INT: 8, REF: 5, DEX: 5, TECH: 5, COOL: 6, WILL: 7, LUCK: 8, MOVE: 7, BODY: 5, EMP: 7 } },
      { rollRange: '3', stats: { INT: 6, REF: 6, DEX: 6, TECH: 4, COOL: 5, WILL: 6, LUCK: 8, MOVE: 6, BODY: 3, EMP: 8 } },
      { rollRange: '4', stats: { INT: 7, REF: 7, DEX: 5, TECH: 5, COOL: 7, WILL: 6, LUCK: 7, MOVE: 7, BODY: 5, EMP: 8 } },
      { rollRange: '5', stats: { INT: 8, REF: 6, DEX: 6, TECH: 3, COOL: 6, WILL: 5, LUCK: 8, MOVE: 7, BODY: 5, EMP: 6 } },
      { rollRange: '6', stats: { INT: 8, REF: 7, DEX: 5, TECH: 5, COOL: 6, WILL: 7, LUCK: 7, MOVE: 5, BODY: 3, EMP: 6 } },
      { rollRange: '7', stats: { INT: 8, REF: 6, DEX: 6, TECH: 5, COOL: 6, WILL: 5, LUCK: 6, MOVE: 7, BODY: 5, EMP: 8 } },
      { rollRange: '8', stats: { INT: 6, REF: 6, DEX: 7, TECH: 4, COOL: 7, WILL: 6, LUCK: 7, MOVE: 7, BODY: 4, EMP: 7 } },
      { rollRange: '9', stats: { INT: 8, REF: 7, DEX: 7, TECH: 5, COOL: 5, WILL: 5, LUCK: 7, MOVE: 6, BODY: 5, EMP: 7 } },
      { rollRange: '10', stats: { INT: 6, REF: 5, DEX: 6, TECH: 5, COOL: 5, WILL: 6, LUCK: 8, MOVE: 6, BODY: 4, EMP: 7 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 6, education: 2, evasion: 6, first_aid: 2,
      human_perception: 6, language_streetslang: 4, local_expert: 6, perception: 2, persuasion: 4,
      stealth: 2, bribery: 6, business: 6, forgery: 6, handgun: 6, pick_lock: 4, streetwise: 6, trading: 6,
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2, evasion: 2, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, bribery: 2, business: 2, forgery: 2, handgun: 2, pick_lock: 2, streetwise: 2, trading: 2,
    },
    equipment: {
      weapons: [
        { name: 'Heavy Pistol', category: 'Heavy Pistol', damage: '3d6', rof: 2, mag: 8, ammo: 'Heavy Pistol', skillId: 'handgun' },
        { name: 'Heavy Pistol', category: 'Heavy Pistol', damage: '3d6', rof: 2, mag: 8, ammo: 'Heavy Pistol', skillId: 'handgun' },
        { name: 'Light Melee', category: 'Light Melee', damage: '1d6', rof: 2, mag: 0, ammo: 'None', skillId: 'melee_weapon' },
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack', sp: 11, penalty: 0 },
      },
      cyberware: [
        { name: 'Cyberaudio Suite', category: 'Cyberaudio', loc: 'Head', hl: 7, desc: 'Основа кибераудио, 3 слота (Core p. 113)' },
        { name: 'Internal Agent', category: 'Cyberaudio', loc: 'Head', hl: 3, desc: 'Встроенный агент; требуется Cyberaudio Suite (Core p. 113)' },
        { name: 'Subdermal Pocket', category: 'External', loc: 'Body', hl: 3, desc: 'Подкожный отсек (Core p. 114)' },
        { name: 'Voice Stress Analyzer', category: 'Cyberaudio', loc: 'Head', hl: 3, desc: '+2 Human Perception и Interrogation; требуется Cyberaudio Suite (Core p. 113)' },
      ],
      gear: [
        { name: 'Heavy Pistol Ammo', category: 'Ammo', quantity: 100, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Agent', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Bug Detector', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Computer', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Disposable Cell Phone', category: 'Gear', quantity: 2, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Generic Chic: Contact Lenses', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Generic Chic: Jewelry', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Leisurewear: Mirrorshades', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Urban Flash: Footwear', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Urban Flash: Jacket', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Urban Flash: Bottoms', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Urban Flash: Top', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
      ],
      pocketCashEb: 500
    }
  },

  Nomad: {
    role: 'Nomad',
    nameRu: 'Номад',
    descRu: 'Воин пустошей, мастер вождения и верный член семейного клана.',
    statTable: [
      { rollRange: '1', stats: { INT: 6, REF: 6, DEX: 8, TECH: 3, COOL: 6, WILL: 7, LUCK: 6, MOVE: 6, BODY: 6, EMP: 4 } },
      { rollRange: '2', stats: { INT: 5, REF: 7, DEX: 6, TECH: 5, COOL: 8, WILL: 8, LUCK: 8, MOVE: 7, BODY: 5, EMP: 4 } },
      { rollRange: '3', stats: { INT: 5, REF: 8, DEX: 6, TECH: 3, COOL: 8, WILL: 7, LUCK: 6, MOVE: 5, BODY: 6, EMP: 5 } },
      { rollRange: '4', stats: { INT: 5, REF: 8, DEX: 7, TECH: 4, COOL: 8, WILL: 6, LUCK: 7, MOVE: 7, BODY: 7, EMP: 5 } },
      { rollRange: '5', stats: { INT: 6, REF: 6, DEX: 6, TECH: 3, COOL: 6, WILL: 7, LUCK: 6, MOVE: 7, BODY: 7, EMP: 4 } },
      { rollRange: '6', stats: { INT: 7, REF: 6, DEX: 8, TECH: 4, COOL: 6, WILL: 7, LUCK: 6, MOVE: 5, BODY: 6, EMP: 5 } },
      { rollRange: '7', stats: { INT: 6, REF: 7, DEX: 8, TECH: 4, COOL: 6, WILL: 6, LUCK: 7, MOVE: 5, BODY: 7, EMP: 5 } },
      { rollRange: '8', stats: { INT: 5, REF: 7, DEX: 8, TECH: 3, COOL: 8, WILL: 6, LUCK: 7, MOVE: 5, BODY: 5, EMP: 5 } },
      { rollRange: '9', stats: { INT: 6, REF: 7, DEX: 6, TECH: 4, COOL: 8, WILL: 6, LUCK: 6, MOVE: 6, BODY: 6, EMP: 6 } },
      { rollRange: '10', stats: { INT: 5, REF: 6, DEX: 7, TECH: 4, COOL: 7, WILL: 8, LUCK: 7, MOVE: 7, BODY: 7, EMP: 4 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 6, concentration: 2, conversation: 2, education: 2, evasion: 6, first_aid: 6,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 4, persuasion: 2,
      stealth: 6, animal_handling: 6, drive_land: 6, handgun: 6, melee_weapon: 6, tracking: 6, trading: 6,
      wilderness_survival: 6,
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2, evasion: 2, first_aid: 2,
      human_perception: 2, language_streetslang: 2, local_expert: 2, perception: 2, persuasion: 2,
      stealth: 2, animal_handling: 2, drive_land: 2, handgun: 2, melee_weapon: 2, tracking: 2, trading: 2,
      wilderness_survival: 2,
    },
    equipment: {
      weapons: [
        { name: 'Heavy Pistol', category: 'Heavy Pistol', damage: '3d6', rof: 2, mag: 8, ammo: 'Heavy Pistol', skillId: 'handgun' },
        { name: 'Heavy Melee', category: 'Heavy Melee', damage: '3d6', rof: 2, mag: 0, ammo: 'None', skillId: 'melee_weapon' },
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack', sp: 11, penalty: 0 },
      },
      cyberware: [
        { name: 'Neural Link', category: 'Neuralware', loc: 'Spine', hl: 7, desc: 'Основа нейроимплантов, 5 слотов (Core p. 112)' },
        { name: 'Interface Plugs', category: 'Neuralware', loc: 'Wrists', hl: 7, desc: 'Подключение к устройствам; требуется Neural Link (Core p. 112)' },
      ],
      gear: [
        { name: 'Heavy Pistol Ammo', category: 'Ammo', quantity: 100, notes: 'Core p. 98: общее количество патронов, включая заряженные' },
        { name: 'Agent', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Anti-Smog Breathing Mask', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Duct Tape', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Flashlight', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Grapple Gun', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Inflatable Bed & Sleep-bag', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Medtech Bag', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Radio Communicator', category: 'Gear', quantity: 2, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Rope (60 m)', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Techscanner', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Tent and Camping Equipment', category: 'Gear', quantity: 1, notes: 'Core p. 103: стартовый комплект' },
        { name: 'Bohemian: Jewelry', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Nomad Leathers: Top', category: 'Fashion', quantity: 4, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Nomad Leathers: Bottoms', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Nomad Leathers: Footwear', category: 'Fashion', quantity: 2, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Nomad Leathers: Jacket', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
        { name: 'Nomad Leathers: Hat', category: 'Fashion', quantity: 1, notes: 'Core p. 103: стартовая одежда' },
      ],
      pocketCashEb: 500
    }
  }
};
