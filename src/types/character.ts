export type StatKey = 
  | 'INT' 
  | 'REF' 
  | 'DEX' 
  | 'TECH' 
  | 'COOL' 
  | 'WILL' 
  | 'LUCK' 
  | 'MOVE' 
  | 'BODY' 
  | 'EMP';

export type RoleType = 
  | 'Solo' 
  | 'Netrunner' 
  | 'Tech' 
  | 'Medtech' 
  | 'Rockerboy' 
  | 'Media' 
  | 'Lawman' 
  | 'Exec' 
  | 'Fixer' 
  | 'Nomad';

export type SkillCategory = 
  | 'Awareness' 
  | 'Body' 
  | 'Control' 
  | 'Education' 
  | 'Fighting' 
  | 'Performance' 
  | 'Ranged' 
  | 'Social' 
  | 'Technique';

export interface Skill {
  id: string;
  nameRu: string;
  nameEn: string;
  stat: StatKey;
  level: number;
  category: SkillCategory;
  multiplier: 1 | 2; // 1x or 2x IP cost
  isCustom?: boolean;
}

export type WeaponCategory = 
  | 'Medium Pistol'
  | 'Heavy Pistol'
  | 'Very Heavy Pistol'
  | 'SMG'
  | 'Heavy SMG'
  | 'Shotgun'
  | 'Assault Rifle'
  | 'Sniper Rifle'
  | 'Bow'
  | 'Crossbow'
  | 'Grenade Launcher'
  | 'Rocket Launcher'
  | 'Light Melee'
  | 'Medium Melee'
  | 'Heavy Melee'
  | 'Very Heavy Melee'
  | 'Exotic';

export type MartialArtsStyle =
  | 'Aikido'
  | 'Karate'
  | 'Judo'
  | 'Taekwondo'
  | 'ArasakaTe'
  | 'Escrima'
  | 'Boxing'
  | 'Capoeira'
  | 'ChoyLiFut'
  | 'DrunkenBoxing'
  | 'GunFu'
  | 'JiuJitsu'
  | 'Kendo'
  | 'KravMaga'
  | 'KungFu'
  | 'Kyudo'
  | 'MilitechKnife'
  | 'MuayThai'
  | 'YukonMultiArmed'
  | 'FpaBorg'
  | 'PencakSilat'
  | 'SovietSystema'
  | 'Sumo'
  | 'TaiChi'
  | 'PoliceDefensiveTactics'
  | 'StrikeBoxing'
  | 'Wrestling';

export interface Weapon {
  id: string;
  name: string;
  category: WeaponCategory;
  damage: string; // e.g. "3d6", "4d6", "5d6"
  standardRof: number;
  magCapacity: number;
  currentAmmo: number;
  ammoType: string;
  concealable: boolean;
  notes: string;
  quality?: 'Poor' | 'Standard' | 'Excellent';
  skillId?: string; // e.g. 'handgun', 'shoulder_arms', etc.
}

export interface ArmorItem {
  id: string;
  name: string;
  location: 'head' | 'body' | 'shield';
  spMax: number;
  spCurrent: number;
  penalty: number; // REF/DEX/MOVE penalty, e.g. 0, -2, -4
  notes?: string;
}

export type CyberwareCategory = 
  | 'Fashionware'
  | 'Neuralware'
  | 'Cyberoptics'
  | 'Cyberaudio'
  | 'Internal'
  | 'External'
  | 'Cyberlimb'
  | 'Borgware';

export interface CyberwareItem {
  id: string;
  name: string;
  category: CyberwareCategory;
  installLocation: string;
  humanityCost: number;
  humanityLoss?: number;
  description: string;
}

export type ProgramCategory = 'Booster' | 'Defender' | 'Attacker' | 'Black ICE';

export interface ProgramItem {
  id: string;
  name: string;
  category: ProgramCategory;
  atkBonus: number;
  defBonus: number;
  rezMax: number;
  rezCurrent: number;
  effect: string;
  isInstalled: boolean;
}

export interface Cyberdeck {
  name: string;
  hardwareSlotsMax: number;
  hardwareSlotsUsed: number;
  programSlotsMax: number;
  installedHardware: string[];
}

export interface CriticalInjury {
  id: string;
  nameRu: string;
  nameEn: string;
  location: 'head' | 'body';
  rollNumber: number;
  effectRu: string;
  effectEn: string;
  quickFixDv: number;
  treatmentDv: number;
  isActive: boolean;
}

export interface Lifepath {
  culturalOrigin: string;
  languages: string;
  personality: string;
  clothingStyle: string;
  hairstyle: string;
  affectation: string;
  valueMost: string;
  feelingsAboutPeople: string;
  valuedPerson: string;
  valuedPossession: string;
  familyBackground: string;
  childhoodEnv: string;
  familyCrisis: string;
  lifeGoals: string;
  friends: string;
  tragicLoveAffairs: string;
  enemies: string;
  roleLifepathNotes: string;
}

export interface GearItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  costEb: number;
  notes: string;
}

export type VehicleCategory = 'Ground' | 'Sea' | 'Air' | 'Bicycle';

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  category: VehicleCategory;
  sdpMax: number; // Structural Damage Points (ПЗТ)
  sdpCurrent: number;
  armorSp?: number; // Armor SP
  seats: number | string;
  speedCombat: string; // e.g. "20 СКО"
  speedNarrative: string; // e.g. "161 км/ч"
  costEb: number;
  notes: string;
  nomadRankReq?: number;
  upgrades?: string[];
}

export interface SoloAbility {
  threatDetection: number;
  initiativeReaction: number;
  precisionAttack: number;
  spotWeakness: number;
  damageAbsorb: number;
}

export interface NetrunnerAbility {
  interfaceRank: number;
}

export interface TechAbility {
  makerRank: number;
  fieldExpertise: number;
  upgrade: number;
  fabrication: number;
  invention: number;
}

export interface MedtechAbility {
  medicineRank: number;
  surgery: number;
  medicalTech: number;
  pharmaceuticals: number;
  speedhealDoses: number;
  cryopumpDoses: number;
}

export interface GenericRoleAbility {
  rank: number;
  details: string;
}

export interface RoleAbilities {
  solo: SoloAbility;
  netrunner: NetrunnerAbility;
  tech: TechAbility;
  medtech: MedtechAbility;
  generic: GenericRoleAbility;
}

export interface Character {
  id: string;
  name: string;
  handle: string; // Nickname / Handle in Night City
  role: RoleType;
  roleRank: number;
  avatarUrl?: string;
  notes: string;

  // Stats
  stats: Record<StatKey, number>;
  statMods: Record<StatKey, number>; // temporary bonuses/penalties

  // Health and Humanity
  hpCurrent: number;
  hpMaxManual?: number; // optional manual override
  humanityCurrent: number;
  humanityMaxManual?: number;
  luckCurrent: number;
  deathSavePenalties: number; // +1 every turn mortally wounded or failed death save

  // Armor
  armor: {
    head: ArmorItem;
    body: ArmorItem;
    shield?: ArmorItem;
  };

  // Lists
  skills: Skill[];
  weapons: Weapon[];
  cyberware: CyberwareItem[];
  criticalInjuries: CriticalInjury[];
  cyberdeck: Cyberdeck;
  programs: ProgramItem[];
  gear: GearItem[];
  vehicles?: Vehicle[];
  lifepath: Lifepath;
  roleAbilities: RoleAbilities;

  // Combat & Martial Arts
  martialArtsStyle?: MartialArtsStyle;

  // Economy & Lifestyle
  cashEb: number;
  bankEb: number;
  lifestyle: string;
  housing: string;
  rentDueEb: number;

  createdAt: number;
  updatedAt: number;
}

export interface RollResult {
  id: string;
  timestamp: number;
  title: string;
  type: 'skill' | 'stat' | 'attack' | 'damage' | 'death_save' | 'custom' | 'initiative' | 'net';
  d10Result?: number;
  explodedD10s?: number[];
  critFailD10?: number;
  diceTotal?: number;
  baseVal?: number;
  modifiers?: { name: string; val: number }[];
  luckSpent?: number;
  total: number;
  targetDv?: number;
  isSuccess?: boolean;
  margin?: number; // total - dv
  isCritSuccess?: boolean; // natural 10 on d10
  isCritFail?: boolean; // natural 1 on d10
  damageDice?: number[];
  isCritInjury?: boolean; // 2 or more sixes on damage dice
  bonusDamage?: number; // +5 for critical injury
  summary: string;
}
