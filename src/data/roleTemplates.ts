import { RoleType, StatKey, Weapon, ArmorItem, CyberwareItem, GearItem } from '../types/character';

export interface RoleStatOption {
  rollRange: string; // e.g. "1-2", "3-4", "5-6", "7-8", "9-10"
  stats: Record<StatKey, number>;
}

export interface RolePackage {
  role: RoleType;
  nameRu: string;
  descRu: string;
  statTable: RoleStatOption[];
  streetratSkills: Record<string, number>; // Full 86 points allocated
  edgerunnerCareerSkills: Record<string, number>; // Core career skills allocated, leaving ~20-26 points
  equipment: {
    weapons: { name: string; category: Weapon['category']; damage: string; rof: number; mag: number; ammo: string; skillId: string }[];
    armor: { head: { name: string; sp: number; penalty: number }; body: { name: string; sp: number; penalty: number } };
    cyberware: { name: string; category: CyberwareItem['category']; loc: string; hl: number; desc: string }[];
    gear: { name: string; category: string; quantity: number; notes: string }[];
    pocketCashEb: number;
  };
}

export const CPR_ROLE_PACKAGES: Record<RoleType, RolePackage> = {
  Solo: {
    role: 'Solo',
    nameRu: 'Соло',
    descRu: 'Профессиональный наемник, телохранитель и штурмовик.',
    statTable: [
      { rollRange: '1-2', stats: { INT: 6, REF: 8, DEX: 7, TECH: 4, COOL: 6, WILL: 7, LUCK: 6, MOVE: 6, BODY: 7, EMP: 5 } },
      { rollRange: '3-4', stats: { INT: 5, REF: 8, DEX: 8, TECH: 3, COOL: 7, WILL: 6, LUCK: 5, MOVE: 7, BODY: 8, EMP: 5 } },
      { rollRange: '5-6', stats: { INT: 6, REF: 8, DEX: 6, TECH: 5, COOL: 6, WILL: 6, LUCK: 7, MOVE: 6, BODY: 7, EMP: 5 } },
      { rollRange: '7-8', stats: { INT: 7, REF: 8, DEX: 7, TECH: 3, COOL: 6, WILL: 6, LUCK: 6, MOVE: 7, BODY: 6, EMP: 6 } },
      { rollRange: '9-10', stats: { INT: 5, REF: 8, DEX: 7, TECH: 4, COOL: 7, WILL: 7, LUCK: 6, MOVE: 6, BODY: 8, EMP: 4 } },
    ],
    streetratSkills: {
      athletics: 6, brawling: 4, concentration: 4, conversation: 2, education: 2,
      evasion: 6, first_aid: 4, human_perception: 2, language_streetslang: 4,
      local_expert: 2, perception: 6, persuasion: 2, stealth: 6,
      handgun: 6, shoulder_arms: 6, melee_weapon: 6, tactics: 6, autofire: 4, resist_torture: 4
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2,
      evasion: 6, first_aid: 2, human_perception: 2, language_streetslang: 4,
      local_expert: 2, perception: 5, persuasion: 2, stealth: 2,
      handgun: 5, shoulder_arms: 5, tactics: 3
    },
    equipment: {
      weapons: [
        { name: 'Very Heavy Pistol (Sternmeyer)', category: 'Very Heavy Pistol', damage: '4d6', rof: 1, mag: 8, ammo: 'Very Heavy Pistol', skillId: 'handgun' },
        { name: 'Assault Rifle (Militech Ronin)', category: 'Assault Rifle', damage: '5d6', rof: 1, mag: 30, ammo: 'Rifle Ammo', skillId: 'shoulder_arms' }
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack Vest', sp: 11, penalty: 0 }
      },
      cyberware: [
        { name: 'Neural Link', category: 'Neuralware', loc: 'Spine', hl: 7, desc: 'Базовый нейроинтерфейс' },
        { name: 'Kerenzikov', category: 'Neuralware', loc: 'Spine', hl: 14, desc: '+2 к инициативе' }
      ],
      gear: [
        { name: 'Agent', category: 'Electronics', quantity: 1, notes: 'Смартфон' },
        { name: 'Very Heavy Pistol Ammo', category: 'Ammo', quantity: 50, notes: 'Патроны' },
        { name: 'Rifle Ammo', category: 'Ammo', quantity: 60, notes: 'Патроны' }
      ],
      pocketCashEb: 250
    }
  },

  Netrunner: {
    role: 'Netrunner',
    nameRu: 'Нетраннер',
    descRu: 'Киберхакер, взломщик компьютерных сетей и систем безопасности.',
    statTable: [
      { rollRange: '1-2', stats: { INT: 8, REF: 7, DEX: 6, TECH: 7, COOL: 6, WILL: 6, LUCK: 6, MOVE: 5, BODY: 5, EMP: 6 } },
      { rollRange: '3-4', stats: { INT: 8, REF: 6, DEX: 7, TECH: 8, COOL: 5, WILL: 6, LUCK: 7, MOVE: 6, BODY: 4, EMP: 5 } },
      { rollRange: '5-6', stats: { INT: 7, REF: 7, DEX: 6, TECH: 8, COOL: 6, WILL: 7, LUCK: 5, MOVE: 6, BODY: 5, EMP: 5 } },
      { rollRange: '7-8', stats: { INT: 8, REF: 8, DEX: 5, TECH: 7, COOL: 5, WILL: 6, LUCK: 6, MOVE: 6, BODY: 5, EMP: 6 } },
      { rollRange: '9-10', stats: { INT: 8, REF: 7, DEX: 7, TECH: 6, COOL: 6, WILL: 6, LUCK: 6, MOVE: 5, BODY: 6, EMP: 5 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 2, concentration: 6, conversation: 2, education: 6,
      evasion: 6, first_aid: 2, human_perception: 2, language_streetslang: 4,
      local_expert: 2, perception: 6, persuasion: 2, stealth: 6,
      cybertech: 6, electronics_security: 4, cryptography: 6, library_search: 6,
      basic_tech: 6, handgun: 6
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 3, conversation: 2, education: 2,
      evasion: 3, first_aid: 2, human_perception: 2, language_streetslang: 4,
      local_expert: 2, perception: 4, persuasion: 2, stealth: 2,
      cybertech: 5, electronics_security: 3, cryptography: 4, library_search: 4, handgun: 4
    },
    equipment: {
      weapons: [
        { name: 'Heavy Pistol (Federated)', category: 'Heavy Pistol', damage: '3d6', rof: 2, mag: 8, ammo: 'Heavy Pistol', skillId: 'handgun' }
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack Vest', sp: 11, penalty: 0 }
      },
      cyberware: [
        { name: 'Neural Link', category: 'Neuralware', loc: 'Spine', hl: 7, desc: 'Базовый нейроинтерфейс' },
        { name: 'Interface Plugs', category: 'Neuralware', loc: 'Wrists', hl: 7, desc: 'Прямое подключение к кибердеке' }
      ],
      gear: [
        { name: 'Kirama Cyberdeck', category: 'Cyberdeck', quantity: 1, notes: 'Дека с программами' },
        { name: 'Virtuality Goggles', category: 'Gear', quantity: 1, notes: 'Очки виртуальности' },
        { name: 'Heavy Pistol Ammo', category: 'Ammo', quantity: 50, notes: 'Патроны' }
      ],
      pocketCashEb: 200
    }
  },

  Tech: {
    role: 'Tech',
    nameRu: 'Техник',
    descRu: 'Мастер механики, модификаций, электроники и создания снаряжения.',
    statTable: [
      { rollRange: '1-2', stats: { INT: 7, REF: 6, DEX: 6, TECH: 8, COOL: 6, WILL: 6, LUCK: 6, MOVE: 6, BODY: 6, EMP: 5 } },
      { rollRange: '3-4', stats: { INT: 8, REF: 5, DEX: 7, TECH: 8, COOL: 5, WILL: 5, LUCK: 7, MOVE: 6, BODY: 6, EMP: 5 } },
      { rollRange: '5-6', stats: { INT: 6, REF: 7, DEX: 6, TECH: 8, COOL: 6, WILL: 7, LUCK: 6, MOVE: 5, BODY: 6, EMP: 5 } },
      { rollRange: '7-8', stats: { INT: 7, REF: 6, DEX: 6, TECH: 8, COOL: 5, WILL: 7, LUCK: 5, MOVE: 7, BODY: 6, EMP: 5 } },
      { rollRange: '9-10', stats: { INT: 6, REF: 6, DEX: 7, TECH: 8, COOL: 6, WILL: 6, LUCK: 6, MOVE: 6, BODY: 6, EMP: 5 } },
    ],
    streetratSkills: {
      athletics: 5, brawling: 3, concentration: 4, conversation: 2, education: 4,
      evasion: 4, first_aid: 4, human_perception: 2, language_streetslang: 4,
      local_expert: 2, perception: 5, persuasion: 2, stealth: 5,
      basic_tech: 6, cybertech: 6, weaponstech: 6, electronics_security: 5,
      land_vehicle_tech: 6, shoulder_arms: 6
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2,
      evasion: 3, first_aid: 2, human_perception: 2, language_streetslang: 4,
      local_expert: 2, perception: 4, persuasion: 2, stealth: 2,
      basic_tech: 5, cybertech: 5, weaponstech: 5, shoulder_arms: 4
    },
    equipment: {
      weapons: [
        { name: 'Shotgun (Rostovic)', category: 'Shotgun', damage: '5d6', rof: 1, mag: 4, ammo: 'Shotgun Shells', skillId: 'shoulder_arms' },
        { name: 'Heavy Pistol', category: 'Heavy Pistol', damage: '3d6', rof: 2, mag: 8, ammo: 'Heavy Pistol', skillId: 'handgun' }
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack Vest', sp: 11, penalty: 0 }
      },
      cyberware: [
        { name: 'Neural Link', category: 'Neuralware', loc: 'Spine', hl: 7, desc: 'Базовый нейроинтерфейс' },
        { name: 'Interface Plugs', category: 'Neuralware', loc: 'Wrists', hl: 7, desc: 'Разъемы подключения' }
      ],
      gear: [
        { name: 'Tech Tool Kit', category: 'Tools', quantity: 1, notes: 'Инструменты техника' },
        { name: 'Agent', category: 'Electronics', quantity: 1, notes: 'Смартфон' }
      ],
      pocketCashEb: 300
    }
  },

  Medtech: {
    role: 'Medtech',
    nameRu: 'Медтех',
    descRu: 'Полевой хирург, создатель медикаментов и спасатель жизней.',
    statTable: [
      { rollRange: '1-2', stats: { INT: 7, REF: 6, DEX: 6, TECH: 7, COOL: 6, WILL: 7, LUCK: 5, MOVE: 6, BODY: 6, EMP: 6 } },
      { rollRange: '3-4', stats: { INT: 8, REF: 6, DEX: 6, TECH: 6, COOL: 5, WILL: 6, LUCK: 6, MOVE: 6, BODY: 5, EMP: 8 } },
      { rollRange: '5-6', stats: { INT: 6, REF: 7, DEX: 6, TECH: 7, COOL: 6, WILL: 6, LUCK: 6, MOVE: 6, BODY: 6, EMP: 6 } },
      { rollRange: '7-8', stats: { INT: 7, REF: 6, DEX: 7, TECH: 6, COOL: 6, WILL: 6, LUCK: 6, MOVE: 5, BODY: 6, EMP: 7 } },
      { rollRange: '9-10', stats: { INT: 8, REF: 5, DEX: 6, TECH: 7, COOL: 6, WILL: 6, LUCK: 6, MOVE: 6, BODY: 5, EMP: 7 } },
    ],
    streetratSkills: {
      athletics: 4, brawling: 3, concentration: 4, conversation: 4, education: 5,
      evasion: 4, first_aid: 6, human_perception: 5, language_streetslang: 4,
      local_expert: 2, perception: 6, persuasion: 3, stealth: 2,
      paramedic: 6, cybertech: 5, science: 6, basic_tech: 6, handgun: 5
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 3, education: 3,
      evasion: 3, first_aid: 5, human_perception: 4, language_streetslang: 4,
      local_expert: 2, perception: 4, persuasion: 2, stealth: 2,
      paramedic: 4, cybertech: 4, handgun: 4
    },
    equipment: {
      weapons: [
        { name: 'Heavy Pistol (Sternmeyer)', category: 'Heavy Pistol', damage: '3d6', rof: 2, mag: 8, ammo: 'Heavy Pistol', skillId: 'handgun' }
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack Vest', sp: 11, penalty: 0 }
      },
      cyberware: [
        { name: 'Neural Link', category: 'Neuralware', loc: 'Spine', hl: 7, desc: 'Базовый нейроинтерфейс' },
        { name: 'Cybereye (Medical Scanner)', category: 'Cyberoptics', loc: 'Head', hl: 7, desc: 'Диагностический сканер' }
      ],
      gear: [
        { name: 'Medtech Bag', category: 'Medical', quantity: 1, notes: 'Сумка полевого врача' },
        { name: 'Speedheal', category: 'Drugs', quantity: 2, notes: '2 дозы быстроисцелина' },
        { name: 'Cryopump', category: 'Medical', quantity: 1, notes: 'Криопомпа стабилизации' }
      ],
      pocketCashEb: 250
    }
  },

  Rockerboy: {
    role: 'Rockerboy',
    nameRu: 'Рокербой',
    descRu: 'Харизматичный музыкант, мятежник и лидер уличного протеста.',
    statTable: [
      { rollRange: '1-2', stats: { INT: 6, REF: 7, DEX: 6, TECH: 3, COOL: 8, WILL: 7, LUCK: 7, MOVE: 6, BODY: 4, EMP: 8 } },
      { rollRange: '3-4', stats: { INT: 7, REF: 6, DEX: 7, TECH: 4, COOL: 7, WILL: 6, LUCK: 8, MOVE: 5, BODY: 5, EMP: 7 } },
      { rollRange: '5-6', stats: { INT: 5, REF: 8, DEX: 6, TECH: 3, COOL: 8, WILL: 6, LUCK: 6, MOVE: 7, BODY: 6, EMP: 7 } },
      { rollRange: '7-8', stats: { INT: 6, REF: 6, DEX: 8, TECH: 4, COOL: 8, WILL: 7, LUCK: 7, MOVE: 6, BODY: 3, EMP: 7 } },
      { rollRange: '9-10', stats: { INT: 7, REF: 7, DEX: 7, TECH: 2, COOL: 8, WILL: 6, LUCK: 7, MOVE: 6, BODY: 5, EMP: 7 } },
    ],
    streetratSkills: {
      athletics: 5, brawling: 4, concentration: 3, conversation: 5, education: 3,
      evasion: 5, first_aid: 2, human_perception: 6, language_streetslang: 4,
      local_expert: 4, perception: 5, persuasion: 6, stealth: 4,
      play_instrument: 6, composition: 6, wardrobe_style: 6, streetwise: 6, handgun: 6
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 4, education: 2,
      evasion: 4, first_aid: 2, human_perception: 4, language_streetslang: 4,
      local_expert: 3, perception: 4, persuasion: 5, stealth: 2,
      play_instrument: 5, composition: 4, streetwise: 4, handgun: 4
    },
    equipment: {
      weapons: [
        { name: 'Very Heavy Pistol', category: 'Very Heavy Pistol', damage: '4d6', rof: 1, mag: 8, ammo: 'Very Heavy Pistol', skillId: 'handgun' },
        { name: 'Heavy Melee (Guitar/Bat)', category: 'Heavy Melee', damage: '3d6', rof: 2, mag: 0, ammo: 'None', skillId: 'melee_weapon' }
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack Vest', sp: 11, penalty: 0 }
      },
      cyberware: [
        { name: 'Chemskin', category: 'Fashionware', loc: 'Skin', hl: 0, desc: 'Цветная кожа со свечением' },
        { name: 'Techhair', category: 'Fashionware', loc: 'Head', hl: 0, desc: 'Светящиеся волосы' }
      ],
      gear: [
        { name: 'Electric Guitar & Mini-Amp', category: 'Gear', quantity: 1, notes: 'Инструмент' },
        { name: 'Agent', category: 'Electronics', quantity: 1, notes: 'Смартфон' }
      ],
      pocketCashEb: 400
    }
  },

  Media: {
    role: 'Media',
    nameRu: 'Медиа',
    descRu: 'Журналист-расследователь, искатель правды и влиятельный репортер.',
    statTable: [
      { rollRange: '1-2', stats: { INT: 7, REF: 6, DEX: 6, TECH: 4, COOL: 8, WILL: 7, LUCK: 6, MOVE: 6, BODY: 5, EMP: 7 } },
      { rollRange: '3-4', stats: { INT: 8, REF: 6, DEX: 6, TECH: 3, COOL: 7, WILL: 7, LUCK: 7, MOVE: 6, BODY: 4, EMP: 8 } },
      { rollRange: '5-6', stats: { INT: 7, REF: 7, DEX: 6, TECH: 4, COOL: 7, WILL: 6, LUCK: 6, MOVE: 6, BODY: 6, EMP: 7 } },
      { rollRange: '7-8', stats: { INT: 8, REF: 6, DEX: 7, TECH: 4, COOL: 8, WILL: 6, LUCK: 6, MOVE: 5, BODY: 5, EMP: 7 } },
      { rollRange: '9-10', stats: { INT: 7, REF: 6, DEX: 6, TECH: 5, COOL: 8, WILL: 6, LUCK: 7, MOVE: 6, BODY: 5, EMP: 6 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 2, concentration: 4, conversation: 6, education: 5,
      evasion: 4, first_aid: 2, human_perception: 6, language_streetslang: 4,
      local_expert: 5, perception: 6, persuasion: 6, stealth: 6,
      criminology: 6, deduction: 6, photography_film: 5, library_search: 5, handgun: 6
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 5, education: 4,
      evasion: 3, first_aid: 2, human_perception: 5, language_streetslang: 4,
      local_expert: 4, perception: 5, persuasion: 5, stealth: 2,
      deduction: 4, library_search: 4, handgun: 4
    },
    equipment: {
      weapons: [
        { name: 'Heavy Pistol', category: 'Heavy Pistol', damage: '3d6', rof: 2, mag: 8, ammo: 'Heavy Pistol', skillId: 'handgun' }
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack Vest', sp: 11, penalty: 0 }
      },
      cyberware: [
        { name: 'Cybereye (MicroVideo)', category: 'Cyberoptics', loc: 'Head', hl: 7, desc: 'Запись видео напрямую на чип' }
      ],
      gear: [
        { name: 'Video Cam & Audio Recorder', category: 'Electronics', quantity: 1, notes: 'Проф. аппаратура' },
        { name: 'Agent', category: 'Electronics', quantity: 1, notes: 'Смартфон' }
      ],
      pocketCashEb: 300
    }
  },

  Lawman: {
    role: 'Lawman',
    nameRu: 'Законник',
    descRu: 'Офицер полиции, патрульный Комбат-зоны, способный вызвать подкрепление.',
    statTable: [
      { rollRange: '1-2', stats: { INT: 6, REF: 7, DEX: 7, TECH: 4, COOL: 7, WILL: 6, LUCK: 6, MOVE: 6, BODY: 7, EMP: 6 } },
      { rollRange: '3-4', stats: { INT: 5, REF: 8, DEX: 7, TECH: 3, COOL: 7, WILL: 7, LUCK: 5, MOVE: 6, BODY: 8, EMP: 6 } },
      { rollRange: '5-6', stats: { INT: 7, REF: 7, DEX: 6, TECH: 4, COOL: 6, WILL: 6, LUCK: 6, MOVE: 6, BODY: 7, EMP: 7 } },
      { rollRange: '7-8', stats: { INT: 6, REF: 8, DEX: 6, TECH: 4, COOL: 7, WILL: 6, LUCK: 6, MOVE: 7, BODY: 7, EMP: 5 } },
      { rollRange: '9-10', stats: { INT: 6, REF: 7, DEX: 7, TECH: 4, COOL: 8, WILL: 6, LUCK: 6, MOVE: 6, BODY: 6, EMP: 6 } },
    ],
    streetratSkills: {
      athletics: 4, brawling: 5, concentration: 3, conversation: 4, education: 3,
      evasion: 5, first_aid: 3, human_perception: 5, language_streetslang: 4,
      local_expert: 4, perception: 5, persuasion: 4, stealth: 3,
      handgun: 6, shoulder_arms: 6, criminology: 6, deduction: 6, interrogation: 5, drive_land: 5
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 3, concentration: 2, conversation: 3, education: 2,
      evasion: 4, first_aid: 2, human_perception: 4, language_streetslang: 4,
      local_expert: 3, perception: 4, persuasion: 3, stealth: 2,
      handgun: 5, criminology: 4, interrogation: 4, drive_land: 4
    },
    equipment: {
      weapons: [
        { name: 'Heavy Pistol (Police Issue)', category: 'Heavy Pistol', damage: '3d6', rof: 2, mag: 8, ammo: 'Heavy Pistol', skillId: 'handgun' },
        { name: 'Shotgun (Rostovic)', category: 'Shotgun', damage: '5d6', rof: 1, mag: 4, ammo: 'Shotgun Shells', skillId: 'shoulder_arms' }
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Heavy Armorjack Vest', sp: 13, penalty: -2 }
      },
      cyberware: [
        { name: 'Subdermal Pocket', category: 'Internal', loc: 'Body', hl: 3, desc: 'Потайной карман под кожей' }
      ],
      gear: [
        { name: 'Handcuffs x2', category: 'Gear', quantity: 2, notes: 'Наручники' },
        { name: 'Police Radio', category: 'Electronics', quantity: 1, notes: 'Связь с диспетчером' },
        { name: 'Agent', category: 'Electronics', quantity: 1, notes: 'Смартфон' }
      ],
      pocketCashEb: 200
    }
  },

  Exec: {
    role: 'Exec',
    nameRu: 'Корпорат',
    descRu: 'Менеджер высшего звена мегакорпорации, защищенный корпоративным бюджетом.',
    statTable: [
      { rollRange: '1-2', stats: { INT: 7, REF: 6, DEX: 6, TECH: 3, COOL: 8, WILL: 6, LUCK: 7, MOVE: 6, BODY: 5, EMP: 8 } },
      { rollRange: '3-4', stats: { INT: 8, REF: 6, DEX: 6, TECH: 4, COOL: 8, WILL: 6, LUCK: 6, MOVE: 5, BODY: 5, EMP: 8 } },
      { rollRange: '5-6', stats: { INT: 7, REF: 7, DEX: 6, TECH: 3, COOL: 8, WILL: 7, LUCK: 6, MOVE: 6, BODY: 5, EMP: 7 } },
      { rollRange: '7-8', stats: { INT: 8, REF: 6, DEX: 7, TECH: 2, COOL: 8, WILL: 6, LUCK: 7, MOVE: 6, BODY: 4, EMP: 8 } },
      { rollRange: '9-10', stats: { INT: 7, REF: 6, DEX: 6, TECH: 4, COOL: 8, WILL: 7, LUCK: 6, MOVE: 6, BODY: 5, EMP: 7 } },
    ],
    streetratSkills: {
      athletics: 3, brawling: 3, concentration: 4, conversation: 6, education: 5,
      evasion: 4, first_aid: 2, human_perception: 6, language_streetslang: 4,
      local_expert: 3, perception: 5, persuasion: 6, stealth: 2,
      business: 6, bureaucracy: 5, accounting: 6, personal_grooming: 5, wardrobe_style: 5, handgun: 6
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 5, education: 4,
      evasion: 3, first_aid: 2, human_perception: 5, language_streetslang: 4,
      local_expert: 2, perception: 4, persuasion: 5, stealth: 2,
      business: 5, bureaucracy: 4, personal_grooming: 4, wardrobe_style: 4, handgun: 4
    },
    equipment: {
      weapons: [
        { name: 'Very Heavy Pistol (Militech)', category: 'Very Heavy Pistol', damage: '4d6', rof: 1, mag: 8, ammo: 'Very Heavy Pistol', skillId: 'handgun' }
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack Vest (Business Cut)', sp: 11, penalty: 0 }
      },
      cyberware: [
        { name: 'Neural Link', category: 'Neuralware', loc: 'Spine', hl: 7, desc: 'Базовый нейроинтерфейс' },
        { name: 'Internal Agent', category: 'Internal', loc: 'Brain', hl: 7, desc: 'Встроенный коммуникатор в мозг' }
      ],
      gear: [
        { name: 'Business Wardrobe', category: 'Fashion', quantity: 1, notes: 'Деловой костюм люкс' },
        { name: 'Company Trauma Team Silver Card', category: 'Medical', quantity: 1, notes: 'Страховка Травмы' }
      ],
      pocketCashEb: 500
    }
  },

  Fixer: {
    role: 'Fixer',
    nameRu: 'Фиксер',
    descRu: 'Брокер подполья, связной между заказчиками и наемниками, торговец связями.',
    statTable: [
      { rollRange: '1-2', stats: { INT: 7, REF: 6, DEX: 6, TECH: 4, COOL: 8, WILL: 6, LUCK: 7, MOVE: 6, BODY: 5, EMP: 7 } },
      { rollRange: '3-4', stats: { INT: 8, REF: 6, DEX: 6, TECH: 3, COOL: 8, WILL: 6, LUCK: 8, MOVE: 5, BODY: 5, EMP: 7 } },
      { rollRange: '5-6', stats: { INT: 6, REF: 7, DEX: 7, TECH: 4, COOL: 8, WILL: 6, LUCK: 6, MOVE: 6, BODY: 5, EMP: 7 } },
      { rollRange: '7-8', stats: { INT: 7, REF: 6, DEX: 6, TECH: 5, COOL: 8, WILL: 6, LUCK: 7, MOVE: 6, BODY: 5, EMP: 6 } },
      { rollRange: '9-10', stats: { INT: 7, REF: 6, DEX: 7, TECH: 3, COOL: 8, WILL: 7, LUCK: 6, MOVE: 6, BODY: 4, EMP: 8 } },
    ],
    streetratSkills: {
      athletics: 2, brawling: 3, concentration: 3, conversation: 6, education: 4,
      evasion: 4, first_aid: 2, human_perception: 6, language_streetslang: 5,
      local_expert: 5, perception: 5, persuasion: 6, stealth: 5,
      streetwise: 6, trading: 6, bribery: 6, forgery: 6, handgun: 6
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 5, education: 3,
      evasion: 3, first_aid: 2, human_perception: 5, language_streetslang: 4,
      local_expert: 4, perception: 4, persuasion: 5, stealth: 2,
      streetwise: 5, trading: 5, bribery: 4, handgun: 4
    },
    equipment: {
      weapons: [
        { name: 'Very Heavy Pistol (Sternmeyer)', category: 'Very Heavy Pistol', damage: '4d6', rof: 1, mag: 8, ammo: 'Very Heavy Pistol', skillId: 'handgun' }
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack Vest', sp: 11, penalty: 0 }
      },
      cyberware: [
        { name: 'Neural Link', category: 'Neuralware', loc: 'Spine', hl: 7, desc: 'Базовый нейроинтерфейс' },
        { name: 'Subdermal Pocket', category: 'Internal', loc: 'Arm', hl: 3, desc: 'Скрытый тайник' }
      ],
      gear: [
        { name: 'Agent', category: 'Electronics', quantity: 2, notes: 'Основной и чистый телефон' },
        { name: 'Flashy Clothes', category: 'Fashion', quantity: 1, notes: 'Стильный наряд' }
      ],
      pocketCashEb: 500
    }
  },

  Nomad: {
    role: 'Nomad',
    nameRu: 'Номад',
    descRu: 'Воин пустошей, мастер вождения и верный член семейного клана.',
    statTable: [
      { rollRange: '1-2', stats: { INT: 6, REF: 7, DEX: 7, TECH: 6, COOL: 6, WILL: 6, LUCK: 6, MOVE: 7, BODY: 7, EMP: 4 } },
      { rollRange: '3-4', stats: { INT: 5, REF: 8, DEX: 7, TECH: 5, COOL: 6, WILL: 6, LUCK: 6, MOVE: 7, BODY: 8, EMP: 4 } },
      { rollRange: '5-6', stats: { INT: 6, REF: 7, DEX: 6, TECH: 7, COOL: 6, WILL: 6, LUCK: 6, MOVE: 7, BODY: 7, EMP: 4 } },
      { rollRange: '7-8', stats: { INT: 6, REF: 8, DEX: 7, TECH: 6, COOL: 5, WILL: 6, LUCK: 6, MOVE: 8, BODY: 6, EMP: 4 } },
      { rollRange: '9-10', stats: { INT: 5, REF: 7, DEX: 7, TECH: 6, COOL: 6, WILL: 7, LUCK: 6, MOVE: 6, BODY: 8, EMP: 4 } },
    ],
    streetratSkills: {
      athletics: 6, brawling: 6, concentration: 3, conversation: 4, education: 2,
      evasion: 5, first_aid: 3, human_perception: 2, language_streetslang: 4,
      local_expert: 2, perception: 5, persuasion: 2, stealth: 6,
      drive_land: 6, land_vehicle_tech: 6, wilderness_survival: 6, shoulder_arms: 6, basic_tech: 6, handgun: 6
    },
    edgerunnerCareerSkills: {
      athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2,
      evasion: 4, first_aid: 2, human_perception: 2, language_streetslang: 4,
      local_expert: 2, perception: 4, persuasion: 2, stealth: 3,
      drive_land: 5, land_vehicle_tech: 4, wilderness_survival: 4, shoulder_arms: 5
    },
    equipment: {
      weapons: [
        { name: 'Assault Rifle (Nomad-Modified)', category: 'Assault Rifle', damage: '5d6', rof: 1, mag: 30, ammo: 'Rifle Ammo', skillId: 'shoulder_arms' },
        { name: 'Heavy Pistol', category: 'Heavy Pistol', damage: '3d6', rof: 2, mag: 8, ammo: 'Heavy Pistol', skillId: 'handgun' }
      ],
      armor: {
        head: { name: 'Light Armorjack Helmet', sp: 11, penalty: 0 },
        body: { name: 'Light Armorjack Vest', sp: 11, penalty: 0 }
      },
      cyberware: [
        { name: 'Neural Link', category: 'Neuralware', loc: 'Spine', hl: 7, desc: 'Базовый нейроинтерфейс' },
        { name: 'Interface Plugs', category: 'Neuralware', loc: 'Wrists', hl: 7, desc: 'Прямое подключение к автомобилю (+2 к вождению)' }
      ],
      gear: [
        { name: 'Family Combat Vehicle (Bike or Car)', category: 'Vehicle', quantity: 1, notes: 'Кланный транспорт Moto' },
        { name: 'Survival Camping Gear', category: 'Survival', quantity: 1, notes: 'Палатка, фильтр, спальник' }
      ],
      pocketCashEb: 200
    }
  }
};
