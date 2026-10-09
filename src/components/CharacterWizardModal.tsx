import React, { useState } from 'react';
import { Character, StatKey, RoleType, Skill, Weapon, CyberwareItem } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { CPR_SKILLS, CPR_CRITICAL_INJURIES, CPR_LIFEPATH_TABLES, PRESET_PROGRAMS } from '../data/initialData';
import { CPR_ROLE_PACKAGES, RolePackage } from '../data/roleTemplates';
import { rollD10 } from '../utils/dice';
import { sfx } from '../utils/audio';
import { 
  Wand2, 
  X, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  ShieldCheck, 
  Crosshair, 
  Cpu, 
  Package, 
  Compass, 
  Heart, 
  Coins, 
  Brain,
  Sparkles,
  Dices,
  Zap,
  Sliders,
  Rat,
  UserCheck
} from 'lucide-react';

interface CharacterWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterCreated: (character: Character) => void;
  lang: Language;
}

export type CreationMethod = 'streetrat' | 'edgerunner' | 'pointbuy';

const STAT_KEYS: StatKey[] = ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'];
const TOTAL_STAT_POINTS = 62;
const TOTAL_SKILL_POINTS = 86;
const STARTING_BUDGET = 2550; // eb

// Shop for Point-Buy
const SHOP_WEAPONS: { name: string; category: Weapon['category']; damage: string; rof: number; cost: number; skillId: string; mag: number; ammo: string }[] = [
  { name: 'Medium Pistol (Militech Arms)', category: 'Medium Pistol', damage: '2d6', rof: 2, cost: 50, skillId: 'handgun', mag: 12, ammo: 'Medium Pistol' },
  { name: 'Heavy Pistol (Sternmeyer P-35)', category: 'Heavy Pistol', damage: '3d6', rof: 2, cost: 100, skillId: 'handgun', mag: 8, ammo: 'Heavy Pistol' },
  { name: 'Very Heavy Pistol (Malorian)', category: 'Very Heavy Pistol', damage: '4d6', rof: 1, cost: 100, skillId: 'handgun', mag: 8, ammo: 'Very Heavy Pistol' },
  { name: 'SMG (Federated Tech-9)', category: 'SMG', damage: '2d6', rof: 1, cost: 100, skillId: 'handgun', mag: 30, ammo: 'Medium Pistol' },
  { name: 'Shotgun (Rostovic DB-2)', category: 'Shotgun', damage: '5d6', rof: 1, cost: 500, skillId: 'shoulder_arms', mag: 4, ammo: 'Shotgun Shells' },
  { name: 'Assault Rifle (Militech Ronin)', category: 'Assault Rifle', damage: '5d6', rof: 1, cost: 500, skillId: 'shoulder_arms', mag: 30, ammo: 'Rifle Ammo' },
  { name: 'Very Heavy Melee (Katana)', category: 'Very Heavy Melee', damage: '4d6', rof: 1, cost: 100, skillId: 'melee_weapon', mag: 0, ammo: 'None' }
];

const SHOP_ARMOR = [
  { name: 'Light Armorjack Helmet (Голова)', loc: 'head' as const, sp: 11, penalty: 0, cost: 100 },
  { name: 'Light Armorjack Vest (Тело)', loc: 'body' as const, sp: 11, penalty: 0, cost: 100 },
  { name: 'Medium Armorjack Vest (Тело)', loc: 'body' as const, sp: 12, penalty: 0, cost: 100 },
  { name: 'Heavy Armorjack Vest (Тело)', loc: 'body' as const, sp: 13, penalty: -2, cost: 100 },
  { name: 'Bulletproof Shield (Щит)', loc: 'shield' as const, sp: 10, penalty: 0, cost: 100 }
];

const SHOP_CYBERWARE = [
  { name: 'Neural Link (Нейролинк)', cat: 'Neuralware' as const, loc: 'Spine', cost: 500, hl: 7, desc: 'Базовый нейроинтерфейс' },
  { name: 'Interface Plugs (Разъемы)', cat: 'Neuralware' as const, loc: 'Wrists', cost: 500, hl: 7, desc: 'Подключение к смартганам и деке (+2 к проверкам)' },
  { name: 'Sandevistan (Сандевистан)', cat: 'Neuralware' as const, loc: 'Spine', cost: 500, hl: 7, desc: '+3 к инициативе на 1 минуту' },
  { name: 'Cybereye (Киберглаз)', cat: 'Cyberoptics' as const, loc: 'Eye', cost: 100, hl: 7, desc: 'Искусственный глаз с 3 слотами' },
  { name: 'Targeting Scope (Прицел)', cat: 'Cyberoptics' as const, loc: 'Eye', cost: 500, hl: 3, desc: '+1 к прицельным выстрелам' },
  { name: 'Subdermal Armor (Подкожная броня)', cat: 'Internal' as const, loc: 'Torso', cost: 1000, hl: 14, desc: 'SP 11 на все тело без штрафа' },
  { name: 'Cyberarm (Киберрука)', cat: 'Cyberlimb' as const, loc: 'Arm', cost: 500, hl: 7, desc: 'Кибернетическая рука с 4 слотами' }
];

export const CharacterWizardModal: React.FC<CharacterWizardModalProps> = ({
  isOpen,
  onClose,
  onCharacterCreated,
  lang
}) => {
  const t = translations[lang];
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Method & Role
  const [method, setMethod] = useState<CreationMethod>('streetrat');
  const [name, setName] = useState('Новый бегущий');
  const [handle, setHandle] = useState('Street-Ghost');
  const [role, setRole] = useState<RoleType>('Solo');

  // Streetrat & Edgerunner 1d10 Stat Roll state
  const [rolledStatIndex, setRolledStatIndex] = useState<number>(0);
  const [rolledD10Value, setRolledD10Value] = useState<number | null>(null);

  // Stats state
  const [stats, setStats] = useState<Record<StatKey, number>>({ ...CPR_ROLE_PACKAGES.Solo.statTable[0].stats });

  // Skills state
  const [skills, setSkills] = useState<Skill[]>(() => {
    const rolePkg = CPR_ROLE_PACKAGES.Solo;
    return CPR_SKILLS.map((s) => ({
      ...s,
      level: rolePkg.streetratSkills[s.id] || 0
    }));
  });

  // Shop selections (for Point-Buy)
  const [selectedWeapons, setSelectedWeapons] = useState<typeof SHOP_WEAPONS>([]);
  const [selectedArmor, setSelectedArmor] = useState<typeof SHOP_ARMOR>([]);
  const [selectedCyberware, setSelectedCyberware] = useState<typeof SHOP_CYBERWARE>([]);

  // Lifepath state
  const [lifepathData, setLifepathData] = useState({
    culturalOrigin: 'Северная Америка (Английский, Streetslang)',
    personality: 'Холодный профессионал с ледяным взглядом',
    clothingStyle: 'Милитари / Тактика (Tactical)',
    valueMost: 'Собственная свобода и честь',
    enemies: 'Корпоративная служба безопасности'
  });

  if (!isOpen) return null;

  const rolePackage: RolePackage = CPR_ROLE_PACKAGES[role];

  // Update presets when role changes in Streetrat/Edgerunner mode
  const handleSelectRole = (newRole: RoleType) => {
    sfx.playClick();
    setRole(newRole);
    const pkg = CPR_ROLE_PACKAGES[newRole];

    if (method === 'streetrat') {
      setStats({ ...pkg.statTable[rolledStatIndex].stats });
      setSkills(CPR_SKILLS.map((s) => ({ ...s, level: pkg.streetratSkills[s.id] || 0 })));
    } else if (method === 'edgerunner') {
      setStats({ ...pkg.statTable[rolledStatIndex].stats });
      setSkills(CPR_SKILLS.map((s) => ({ ...s, level: pkg.edgerunnerCareerSkills[s.id] || 0 })));
    }
  };

  const handleSelectMethod = (newMethod: CreationMethod) => {
    sfx.playClick();
    setMethod(newMethod);
    const pkg = CPR_ROLE_PACKAGES[role];

    if (newMethod === 'streetrat') {
      setStats({ ...pkg.statTable[rolledStatIndex].stats });
      setSkills(CPR_SKILLS.map((s) => ({ ...s, level: pkg.streetratSkills[s.id] || 0 })));
    } else if (newMethod === 'edgerunner') {
      setStats({ ...pkg.statTable[rolledStatIndex].stats });
      setSkills(CPR_SKILLS.map((s) => ({ ...s, level: pkg.edgerunnerCareerSkills[s.id] || 0 })));
    } else {
      // Point Buy: default 6s
      setStats({ INT: 6, REF: 7, DEX: 6, TECH: 5, COOL: 6, WILL: 6, LUCK: 6, MOVE: 6, BODY: 7, EMP: 7 });
      const mandatory: Record<string, number> = {
        athletics: 2, brawling: 2, concentration: 2, conversation: 2, education: 2,
        evasion: 2, first_aid: 2, human_perception: 2, language_streetslang: 4,
        local_expert: 2, perception: 2, persuasion: 2, stealth: 2
      };
      setSkills(CPR_SKILLS.map((s) => ({ ...s, level: mandatory[s.id] || 0 })));
    }
  };

  // Roll 1d10 on Role's Stat Table
  const handleRollRoleStat = () => {
    sfx.playDiceRoll();
    const die = rollD10();
    setRolledD10Value(die);
    // Determine row (1-2 => 0, 3-4 => 1, 5-6 => 2, 7-8 => 3, 9-10 => 4)
    const index = Math.min(4, Math.floor((die - 1) / 2));
    setRolledStatIndex(index);
    setStats({ ...rolePackage.statTable[index].stats });
  };

  // Calculations for Point-Buy
  const statsSpent = Object.values(stats).reduce((a, b) => a + b, 0);
  const statsRemaining = TOTAL_STAT_POINTS - statsSpent;

  const skillsSpent = skills.reduce((acc, s) => acc + (s.level * s.multiplier), 0);
  const skillsRemaining = TOTAL_SKILL_POINTS - skillsSpent;

  const weaponsCost = selectedWeapons.reduce((acc, w) => acc + w.cost, 0);
  const armorCost = selectedArmor.reduce((acc, a) => acc + a.cost, 0);
  const cyberwareCost = selectedCyberware.reduce((acc, c) => acc + c.cost, 0);
  const totalCost = weaponsCost + armorCost + cyberwareCost;
  const budgetRemaining = STARTING_BUDGET - totalCost;

  // Total HL & Humanity
  let totalHL = 0;
  if (method === 'pointbuy') {
    totalHL = selectedCyberware.reduce((acc, c) => acc + c.hl, 0);
  } else {
    totalHL = rolePackage.equipment.cyberware.reduce((acc, c) => acc + c.hl, 0);
  }

  const baseHumanity = stats.EMP * 10;
  const currentHumanity = Math.max(0, baseHumanity - totalHL);
  const currentEmp = Math.floor(currentHumanity / 10);
  const hpMax = 10 + 5 * Math.ceil((stats.BODY + stats.WILL) / 2);

  const handleStatAdjust = (key: StatKey, delta: number) => {
    sfx.playClick();
    const current = stats[key];
    const newVal = Math.max(2, Math.min(8, current + delta));
    setStats({ ...stats, [key]: newVal });
  };

  const handleSkillLevelAdjust = (skillId: string, delta: number) => {
    sfx.playClick();
    setSkills((prev) =>
      prev.map((s) => {
        if (s.id === skillId) {
          const newVal = Math.max(0, Math.min(6, s.level + delta));
          return { ...s, level: newVal };
        }
        return s;
      })
    );
  };

  const handleRandomizeLifepath = () => {
    sfx.playDiceRoll();
    const origins = CPR_LIFEPATH_TABLES.culturalOrigins;
    const origin = origins[Math.floor(Math.random() * origins.length)];
    const personality = CPR_LIFEPATH_TABLES.personalities[Math.floor(Math.random() * CPR_LIFEPATH_TABLES.personalities.length)];
    const style = CPR_LIFEPATH_TABLES.clothingStyles[Math.floor(Math.random() * CPR_LIFEPATH_TABLES.clothingStyles.length)];
    const values = CPR_LIFEPATH_TABLES.valueMost[Math.floor(Math.random() * CPR_LIFEPATH_TABLES.valueMost.length)];

    setLifepathData({
      culturalOrigin: `${origin.origin} (${origin.languages})`,
      personality,
      clothingStyle: style,
      valueMost: values,
      enemies: 'Корпоративный наемник или лидер уличной банды'
    });
  };

  const handleCompleteCreation = () => {
    sfx.playCritSuccess();

    let finalWeapons: Weapon[] = [];
    let finalArmor = {
      head: { id: 'armor-h-' + Date.now(), name: 'Light Armorjack Helmet', location: 'head' as const, spMax: 11, spCurrent: 11, penalty: 0 },
      body: { id: 'armor-b-' + Date.now(), name: 'Light Armorjack Vest', location: 'body' as const, spMax: 11, spCurrent: 11, penalty: 0 }
    };
    let finalCyberware: CyberwareItem[] = [];
    let startingCash = 0;

    if (method === 'pointbuy') {
      finalWeapons = selectedWeapons.map((w, idx) => ({
        id: 'weap-wiz-' + idx + '-' + Date.now(),
        name: w.name,
        category: w.category,
        damage: w.damage,
        standardRof: w.rof,
        magCapacity: w.mag,
        currentAmmo: w.mag,
        ammoType: w.ammo,
        concealable: w.category.includes('Pistol'),
        notes: 'Стартовое оружие',
        skillId: w.skillId
      }));

      const hArmor = selectedArmor.find((a) => a.loc === 'head');
      const bArmor = selectedArmor.find((a) => a.loc === 'body');
      if (hArmor) finalArmor.head = { id: 'h-1', name: hArmor.name, location: 'head', spMax: hArmor.sp, spCurrent: hArmor.sp, penalty: hArmor.penalty };
      if (bArmor) finalArmor.body = { id: 'b-1', name: bArmor.name, location: 'body', spMax: bArmor.sp, spCurrent: bArmor.sp, penalty: bArmor.penalty };

      finalCyberware = selectedCyberware.map((c, idx) => ({
        id: 'cyb-wiz-' + idx + '-' + Date.now(),
        name: c.name,
        category: c.cat,
        installLocation: c.loc,
        humanityCost: c.hl,
        description: c.desc
      }));

      startingCash = Math.max(0, budgetRemaining);
    } else {
      // Streetrat or Edgerunner package
      finalWeapons = rolePackage.equipment.weapons.map((w, idx) => ({
        id: 'weap-pkg-' + idx + '-' + Date.now(),
        name: w.name,
        category: w.category,
        damage: w.damage,
        standardRof: w.rof,
        magCapacity: w.mag,
        currentAmmo: w.mag,
        ammoType: w.ammo,
        concealable: w.category.includes('Pistol'),
        notes: 'Классовый набор ' + role,
        skillId: w.skillId
      }));

      finalArmor = {
        head: { id: 'h-pkg', name: rolePackage.equipment.armor.head.name, location: 'head', spMax: rolePackage.equipment.armor.head.sp, spCurrent: rolePackage.equipment.armor.head.sp, penalty: rolePackage.equipment.armor.head.penalty },
        body: { id: 'b-pkg', name: rolePackage.equipment.armor.body.name, location: 'body', spMax: rolePackage.equipment.armor.body.sp, spCurrent: rolePackage.equipment.armor.body.sp, penalty: rolePackage.equipment.armor.body.penalty }
      };

      finalCyberware = rolePackage.equipment.cyberware.map((c, idx) => ({
        id: 'cyb-pkg-' + idx + '-' + Date.now(),
        name: c.name,
        category: c.category,
        installLocation: c.loc,
        humanityCost: c.hl,
        description: c.desc
      }));

      startingCash = rolePackage.equipment.pocketCashEb;
    }

    const newCharacter: Character = {
      id: 'char-' + Date.now(),
      name,
      handle,
      role,
      roleRank: 4,
      notes: `Создан методом: ${method === 'streetrat' ? 'Уличная шпана (Streetrats)' : method === 'edgerunner' ? 'Бегущий по краю (Edgerunners)' : 'Полный конструктор (Point-Buy)'}.`,
      stats: { ...stats },
      statMods: { INT: 0, REF: 0, DEX: 0, TECH: 0, COOL: 0, WILL: 0, LUCK: 0, MOVE: 0, BODY: 0, EMP: 0 },
      hpCurrent: hpMax,
      humanityCurrent: currentHumanity,
      luckCurrent: stats.LUCK,
      deathSavePenalties: 0,
      armor: finalArmor,
      skills: [...skills],
      weapons: finalWeapons,
      cyberware: finalCyberware,
      criticalInjuries: CPR_CRITICAL_INJURIES.map((inj) => ({
        ...inj,
        id: 'inj-' + inj.location + '-' + inj.rollNumber,
        isActive: false
      })),
      cyberdeck: {
        name: role === 'Netrunner' ? 'Novatech Cyberdeck' : 'Pocket Agent',
        hardwareSlotsMax: 3,
        hardwareSlotsUsed: 1,
        programSlotsMax: 5,
        installedHardware: ['Standard Interface']
      },
      programs: role === 'Netrunner' ? [...PRESET_PROGRAMS] : [],
      gear: [
        { id: 'g-1', name: 'Agent (Смартфон)', category: 'Electronics', quantity: 1, costEb: 100, notes: 'Связь и сеть' },
        { id: 'g-2', name: 'Патроны', category: 'Ammo', quantity: 50, costEb: 50, notes: '50 шт.' }
      ],
      lifepath: {
        ...lifepathData,
        languages: 'Streetslang, English',
        hairstyle: 'Неоновый ирокез',
        affectation: 'Зеркальные очки даже ночью',
        feelingsAboutPeople: 'Верю только напарникам по банде',
        valuedPerson: 'Старший наставник',
        valuedPossession: 'Отцовский пистолет',
        familyBackground: 'Уличные бродяги Night City',
        childhoodEnv: 'В Комбат-зоне среди перестрелок',
        familyCrisis: 'Родители пропали в Войне Корпораций',
        lifeGoals: 'Стать легендой Посмертия',
        friends: 'Фиксер из Маленького Китая',
        tragicLoveAffairs: 'Любовь прервана предательством',
        roleLifepathNotes: `Специализация роли: ${role}`
      },
      roleAbilities: {
        solo: { threatDetection: 1, initiativeReaction: 1, precisionAttack: 1, spotWeakness: 1, damageAbsorb: 0 },
        netrunner: { interfaceRank: 4 },
        tech: { makerRank: 4, fieldExpertise: 2, upgrade: 1, fabrication: 1, invention: 0 },
        medtech: { medicineRank: 4, surgery: 2, medicalTech: 1, pharmaceuticals: 1, speedhealDoses: 2, cryopumpDoses: 1 },
        generic: { rank: 4, details: `Способность роли ${role} ранга 4.` }
      },
      cashEb: startingCash,
      bankEb: 0,
      lifestyle: 'Good Prepak (600 eb/мес)',
      housing: 'Cargo Container (1000 eb/мес)',
      rentDueEb: 1000,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    onCharacterCreated(newCharacter);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-zinc-900 border-2 border-red-600 w-full max-w-4xl rounded-lg shadow-2xl shadow-red-950 flex flex-col max-h-[92vh] overflow-hidden">
        {/* Wizard Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-red-800">
          <div className="flex items-center gap-2 text-red-500 font-orbitron font-bold">
            <Wand2 size={20} className="animate-pulse" />
            <span className="tracking-wider uppercase text-sm sm:text-base">
              Конструктор персонажа Cyberpunk RED (Все 3 метода правил)
            </span>
          </div>
          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="text-zinc-400 hover:text-white p-1 hover:bg-zinc-800 rounded transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Wizard Stepper Tabs */}
        <div className="flex items-center border-b border-zinc-800 bg-zinc-950/70 overflow-x-auto text-xs font-orbitron font-semibold uppercase">
          {[
            { step: 1, title: '1. Метод и Роль' },
            { step: 2, title: method === 'pointbuy' ? '2. Характеристики (62)' : '2. Бросок характеристик' },
            { step: 3, title: method === 'streetrat' ? '3. Готовые навыки' : '3. Навыки (86)' },
            { step: 4, title: method === 'pointbuy' ? '4. Закупка (2550 eb)' : '4. Экипировка роли' },
            { step: 5, title: '5. Жизненный путь' },
            { step: 6, title: '6. Финал' },
          ].map((tab) => (
            <button
              key={tab.step}
              onClick={() => {
                sfx.playClick();
                setCurrentStep(tab.step);
              }}
              className={`flex-1 py-2.5 px-2.5 whitespace-nowrap text-center transition ${
                currentStep === tab.step
                  ? 'text-red-500 border-b-2 border-red-500 bg-red-950/20'
                  : currentStep > tab.step
                  ? 'text-zinc-200'
                  : 'text-zinc-500'
              }`}
            >
              {tab.title}
            </button>
          ))}
        </div>

        {/* Wizard Content Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: Method & Role Selection */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              {/* Method Cards */}
              <div>
                <label className="text-xs text-yellow-400 uppercase font-semibold block mb-2">
                  Выберите официальный метод генерации персонажа:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Method 1: Streetrats */}
                  <div
                    onClick={() => handleSelectMethod('streetrat')}
                    className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                      method === 'streetrat'
                        ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950 ring-1 ring-red-500'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-orbitron font-bold text-sm text-white mb-1">
                        <Rat size={16} className="text-red-400" />
                        <span>Уличная шпана (Streetrats)</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 leading-relaxed">
                        <strong>Быстрый старт:</strong> характеристики броском 1d10 по таблице роли, полностью готовый набор навыков и экипировки. Готов за 1 минуту!
                      </div>
                    </div>
                    <span className="text-[10px] text-yellow-400 font-bold uppercase mt-2">
                      Рекомендуется новичкам
                    </span>
                  </div>

                  {/* Method 2: Edgerunners */}
                  <div
                    onClick={() => handleSelectMethod('edgerunner')}
                    className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                      method === 'edgerunner'
                        ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950 ring-1 ring-red-500'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-orbitron font-bold text-sm text-white mb-1">
                        <Zap size={16} className="text-yellow-400" />
                        <span>Бегущий по краю (Edgerunners)</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 leading-relaxed">
                        <strong>Полу-кастомизация:</strong> таблица характеристик + карьерные навыки роли с пулом свободных очков для тонкой настройки.
                      </div>
                    </div>
                    <span className="text-[10px] text-yellow-400 font-bold uppercase mt-2">
                      Идеальный баланс
                    </span>
                  </div>

                  {/* Method 3: Point-Buy */}
                  <div
                    onClick={() => handleSelectMethod('pointbuy')}
                    className={`p-3.5 rounded-lg border cursor-pointer transition flex flex-col justify-between ${
                      method === 'pointbuy'
                        ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950 ring-1 ring-red-500'
                        : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-orbitron font-bold text-sm text-white mb-1">
                        <Sliders size={16} className="text-cyan-400" />
                        <span>Полный конструктор (Point-Buy)</span>
                      </div>
                      <div className="text-[11px] text-zinc-300 leading-relaxed">
                        <strong>Полная свобода:</strong> 62 очка характеристик (2-8), 86 очков навыков, свободная закупка на 2,550 eb.
                      </div>
                    </div>
                    <span className="text-[10px] text-cyan-400 font-bold uppercase mt-2">
                      Для опытных игроков
                    </span>
                  </div>
                </div>
              </div>

              {/* Names */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                    Имя персонажа
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-zinc-100 font-bold text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs text-red-400 uppercase font-semibold block mb-1">
                    Позывной (Streetname)
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full bg-zinc-950 border border-red-900/60 rounded px-3 py-1.5 text-red-200 font-bold text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-2">
                  Выберите Роль (Класс) персонажа
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(Object.keys(CPR_ROLE_PACKAGES) as RoleType[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => handleSelectRole(r)}
                      className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                        role === r
                          ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="font-orbitron font-bold text-sm text-zinc-100">{r}</div>
                        <div className="text-[11px] text-zinc-400 mt-1">{CPR_ROLE_PACKAGES[r].nameRu}</div>
                      </div>
                      <div className="text-[9px] text-yellow-400 font-semibold mt-2">Ранг 4</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300">
                <span className="font-bold text-yellow-400 block mb-1">
                  Выбрана роль: {role} ({rolePackage.nameRu})
                </span>
                {rolePackage.descRu}
              </div>
            </div>
          )}

          {/* STEP 2: Stats (Table Roll or Point-Buy) */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              {method !== 'pointbuy' ? (
                /* Streetrat / Edgerunner: 1d10 Role Stat Table */
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <div>
                      <span className="text-xs font-semibold text-yellow-400 uppercase block">
                        Официальная таблица характеристик роли {role} (CPR Core Book)
                      </span>
                      <span className="text-[11px] text-zinc-500">
                        Бросьте 1d10 или выберите строку вручную.
                      </span>
                    </div>

                    <button
                      onClick={handleRollRoleStat}
                      className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded flex items-center gap-2 shadow-md shadow-red-950 transition"
                    >
                      <Dices size={16} />
                      БРОСИТЬ 1D10 {rolledD10Value ? `(Выпало: ${rolledD10Value})` : ''}
                    </button>
                  </div>

                  {/* Table of rows */}
                  <div className="space-y-2">
                    {rolePackage.statTable.map((opt, idx) => (
                      <div
                        key={idx}
                        onClick={() => {
                          sfx.playClick();
                          setRolledStatIndex(idx);
                          setStats({ ...opt.stats });
                        }}
                        className={`p-2.5 rounded-lg border cursor-pointer text-xs transition flex flex-wrap items-center justify-between gap-2 ${
                          rolledStatIndex === idx
                            ? 'bg-red-950/40 border-red-500 ring-1 ring-red-500'
                            : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-[70px]">
                          <span className="font-orbitron font-bold text-yellow-400">
                            [{opt.rollRange}]
                          </span>
                          {rolledStatIndex === idx && <Check size={14} className="text-emerald-400" />}
                        </div>

                        <div className="flex flex-wrap gap-2 font-mono">
                          {STAT_KEYS.map((k) => (
                            <span key={k} className="text-zinc-300">
                              <span className="text-zinc-500 text-[10px]">{k}:</span>{' '}
                              <strong className={opt.stats[k] >= 7 ? 'text-yellow-400' : 'text-white'}>
                                {opt.stats[k]}
                              </strong>
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Point-Buy: 62 Points Allocation */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <div>
                      <span className="text-xs font-semibold text-zinc-400 uppercase block">
                        Point-Buy: 62 очка характеристик (Диапазон: 2 - 8)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs uppercase font-semibold text-zinc-400">Осталось:</span>
                      <span
                        className={`font-orbitron font-black text-xl px-2.5 py-0.5 rounded ${
                          statsRemaining === 0
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : statsRemaining < 0
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                        }`}
                      >
                        {statsRemaining}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                    {STAT_KEYS.map((k) => (
                      <div key={k} className="bg-zinc-950 border border-zinc-800 rounded p-2.5 text-center flex flex-col justify-between">
                        <div>
                          <span className="font-orbitron font-black text-base text-red-500 block">{k}</span>
                          <span className="text-[10px] text-zinc-400 block truncate">{t[k]}</span>
                        </div>
                        <div className="font-orbitron font-black text-2xl text-white my-1.5">{stats[k]}</div>
                        <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-zinc-900">
                          <button onClick={() => handleStatAdjust(k, -1)} disabled={stats[k] <= 2} className="w-6 h-6 bg-zinc-800 rounded font-bold">-</button>
                          <button onClick={() => handleStatAdjust(k, 1)} disabled={stats[k] >= 8 || statsRemaining <= 0} className="w-6 h-6 bg-zinc-800 rounded font-bold">+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Derived Preview */}
              <div className="grid grid-cols-3 gap-2 text-center text-xs bg-zinc-950 p-2.5 rounded border border-zinc-800">
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase block">Очки здоровья (HP)</span>
                  <span className="font-orbitron font-bold text-base text-red-400">{hpMax} HP</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase block">Человечность / EMP</span>
                  <span className="font-orbitron font-bold text-base text-cyan-400">{baseHumanity} / {stats.EMP}</span>
                </div>
                <div>
                  <span className="text-zinc-500 text-[10px] uppercase block">Спасбросок (BODY)</span>
                  <span className="font-orbitron font-bold text-base text-yellow-400">{stats.BODY}</span>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Skills (Streetrat Fixed, Edgerunner Career + Free, or Point-Buy) */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase block">
                    {method === 'streetrat'
                      ? `Готовый пакет навыков роли ${role} (86 очков распределено)`
                      : method === 'edgerunner'
                      ? `Карьерные навыки роли ${role} + распределение свободных очков`
                      : 'Полное распределение 86 очков навыков'}
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Максимальный ранг: 6. Навыки (x2) стоят 2 очка.
                  </span>
                </div>

                {method !== 'streetrat' && (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs uppercase font-semibold text-zinc-400">Осталось очков:</span>
                    <span
                      className={`font-orbitron font-black text-xl px-2.5 py-0.5 rounded ${
                        skillsRemaining === 0
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : skillsRemaining < 0
                          ? 'bg-red-950 text-red-400 border border-red-800'
                          : 'bg-yellow-950 text-yellow-400 border border-yellow-800'
                      }`}
                    >
                      {skillsRemaining}
                    </span>
                  </div>
                )}
              </div>

              {/* Skills Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-[380px] overflow-y-auto pr-1">
                {skills.map((s) => {
                  const statVal = stats[s.stat];
                  const totalBase = statVal + s.level;

                  return (
                    <div
                      key={s.id}
                      className="bg-zinc-950 border border-zinc-800 rounded p-2 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 mr-2">
                        <div className="flex items-center gap-1">
                          <span className="font-semibold text-zinc-200 truncate">{s.nameRu}</span>
                          {s.multiplier === 2 && (
                            <span className="text-[9px] bg-red-950 text-red-400 px-1 rounded font-bold">x2</span>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {s.stat} ({statVal}) • Итог: {totalBase}
                        </span>
                      </div>

                      {method === 'streetrat' ? (
                        <span className="font-orbitron font-bold text-xs text-yellow-400 bg-zinc-900 px-2 py-0.5 rounded">
                          Ур. {s.level}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800">
                          <button
                            onClick={() => handleSkillLevelAdjust(s.id, -1)}
                            disabled={s.level <= 0}
                            className="w-4 text-center font-bold text-zinc-400 hover:text-white disabled:opacity-30"
                          >
                            -
                          </button>
                          <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">
                            {s.level}
                          </span>
                          <button
                            onClick={() => handleSkillLevelAdjust(s.id, 1)}
                            disabled={s.level >= 6 || skillsRemaining < s.multiplier}
                            className="w-4 text-center font-bold text-zinc-400 hover:text-white disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Equipment & Cyberware */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              {method !== 'pointbuy' ? (
                /* Streetrat & Edgerunner: Preset Role Equipment Package */
                <div className="space-y-3">
                  <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <span className="text-xs font-semibold text-yellow-400 uppercase block">
                      Классовый стартовый набор экипировки роли {role} (CPR Core Book)
                    </span>
                    <span className="text-[11px] text-zinc-400">
                      Включает оружие, броню, импланты и карманные деньги ({rolePackage.equipment.pocketCashEb} eb).
                    </span>
                  </div>

                  {/* Weapons Package */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded p-3 space-y-2">
                    <span className="text-xs font-orbitron font-bold text-red-400 uppercase block">
                      Оружие:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {rolePackage.equipment.weapons.map((w, i) => (
                        <div key={i} className="p-2 bg-zinc-900 rounded border border-zinc-800">
                          <div className="font-bold text-white">{w.name}</div>
                          <div className="text-[10px] text-zinc-400">{w.damage} • ROF {w.rof} • Магазин: {w.mag}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Armor Package */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded p-3 space-y-2">
                    <span className="text-xs font-orbitron font-bold text-yellow-400 uppercase block">
                      Броня:
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                        <div className="font-bold text-white">{rolePackage.equipment.armor.head.name}</div>
                        <div className="text-[10px] text-zinc-400">Голова • SP {rolePackage.equipment.armor.head.sp}</div>
                      </div>
                      <div className="p-2 bg-zinc-900 rounded border border-zinc-800">
                        <div className="font-bold text-white">{rolePackage.equipment.armor.body.name}</div>
                        <div className="text-[10px] text-zinc-400">Тело • SP {rolePackage.equipment.armor.body.sp}</div>
                      </div>
                    </div>
                  </div>

                  {/* Cyberware Package */}
                  <div className="bg-zinc-950 border border-zinc-800 rounded p-3 space-y-2">
                    <span className="text-xs font-orbitron font-bold text-cyan-400 uppercase block">
                      Киберимпланты (-{totalHL} HL):
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {rolePackage.equipment.cyberware.map((c, i) => (
                        <div key={i} className="p-2 bg-zinc-900 rounded border border-zinc-800">
                          <div className="font-bold text-white">{c.name}</div>
                          <div className="text-[10px] text-zinc-400">{c.desc} • {c.hl} HL</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                /* Point-Buy Shop */
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                    <div>
                      <span className="text-xs font-semibold text-zinc-400 uppercase block">Стартовый бюджет: 2,550 eb</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block uppercase">Потеря Человечности:</span>
                        <span className="font-orbitron font-bold text-sm text-red-400">-{totalHL} HL</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-zinc-400 block uppercase">Остаток бюджета:</span>
                        <span className={`font-orbitron font-black text-xl ${budgetRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {budgetRemaining} eb
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Weapons */}
                  <div>
                    <span className="text-xs font-orbitron font-bold text-red-400 uppercase block mb-1">1. Оружие</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {SHOP_WEAPONS.map((w) => {
                        const isSelected = selectedWeapons.some((sw) => sw.name === w.name);
                        return (
                          <div
                            key={w.name}
                            onClick={() => {
                              sfx.playClick();
                              setSelectedWeapons(isSelected ? selectedWeapons.filter((sw) => sw.name !== w.name) : [...selectedWeapons, w]);
                            }}
                            className={`p-2.5 rounded border cursor-pointer text-xs transition flex justify-between items-center ${
                              isSelected ? 'bg-red-950/40 border-red-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                            }`}
                          >
                            <div>
                              <div className="font-bold">{w.name}</div>
                              <div className="text-[10px] text-zinc-400">{w.damage} • ROF {w.rof}</div>
                            </div>
                            <span className="font-mono font-bold text-emerald-400">{w.cost} eb</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Armor */}
                  <div>
                    <span className="text-xs font-orbitron font-bold text-yellow-400 uppercase block mb-1">2. Броня</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                      {SHOP_ARMOR.map((a) => {
                        const isSelected = selectedArmor.some((sa) => sa.name === a.name);
                        return (
                          <div
                            key={a.name}
                            onClick={() => {
                              sfx.playClick();
                              setSelectedArmor(isSelected ? selectedArmor.filter((sa) => sa.name !== a.name) : [...selectedArmor, a]);
                            }}
                            className={`p-2.5 rounded border cursor-pointer text-xs transition flex justify-between items-center ${
                              isSelected ? 'bg-yellow-950/40 border-yellow-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                            }`}
                          >
                            <div>
                              <div className="font-bold">{a.name}</div>
                              <div className="text-[10px] text-zinc-400">SP {a.sp}</div>
                            </div>
                            <span className="font-mono font-bold text-emerald-400">{a.cost} eb</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Cyberware */}
                  <div>
                    <span className="text-xs font-orbitron font-bold text-cyan-400 uppercase block mb-1">3. Киберимпланты</span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {SHOP_CYBERWARE.map((c) => {
                        const isSelected = selectedCyberware.some((sc) => sc.name === c.name);
                        return (
                          <div
                            key={c.name}
                            onClick={() => {
                              sfx.playClick();
                              setSelectedCyberware(isSelected ? selectedCyberware.filter((sc) => sc.name !== c.name) : [...selectedCyberware, c]);
                            }}
                            className={`p-2.5 rounded border cursor-pointer text-xs transition flex justify-between items-center ${
                              isSelected ? 'bg-cyan-950/40 border-cyan-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-300'
                            }`}
                          >
                            <div>
                              <div className="font-bold">{c.name}</div>
                              <div className="text-[10px] text-zinc-400">{c.desc} • {c.hl} HL</div>
                            </div>
                            <span className="font-mono font-bold text-emerald-400">{c.cost} eb</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* STEP 5: Lifepath */}
          {currentStep === 5 && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <span className="text-xs font-orbitron font-bold text-yellow-400 uppercase">
                  Жизненный путь и предыстория
                </span>
                <button
                  onClick={handleRandomizeLifepath}
                  className="px-3 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-bold font-orbitron uppercase rounded flex items-center gap-1.5"
                >
                  <Sparkles size={13} />
                  Случайная предыстория
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-zinc-400 uppercase font-semibold block mb-1">Культурное происхождение</label>
                  <input
                    type="text"
                    value={lifepathData.culturalOrigin}
                    onChange={(e) => setLifepathData({ ...lifepathData, culturalOrigin: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase font-semibold block mb-1">Характер</label>
                  <input
                    type="text"
                    value={lifepathData.personality}
                    onChange={(e) => setLifepathData({ ...lifepathData, personality: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase font-semibold block mb-1">Стиль одежды</label>
                  <input
                    type="text"
                    value={lifepathData.clothingStyle}
                    onChange={(e) => setLifepathData({ ...lifepathData, clothingStyle: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>
                <div>
                  <label className="text-zinc-400 uppercase font-semibold block mb-1">Главная ценность</label>
                  <input
                    type="text"
                    value={lifepathData.valueMost}
                    onChange={(e) => setLifepathData({ ...lifepathData, valueMost: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-red-400 uppercase font-semibold block mb-1">Главный враг</label>
                  <input
                    type="text"
                    value={lifepathData.enemies}
                    onChange={(e) => setLifepathData({ ...lifepathData, enemies: e.target.value })}
                    className="w-full bg-zinc-950 border border-red-900/60 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: Review & Finalize */}
          {currentStep === 6 && (
            <div className="space-y-4 animate-fade-in">
              <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                  <div>
                    <h3 className="font-orbitron font-black text-lg text-white">
                      {name} <span className="text-red-500 font-bold">«{handle}»</span>
                    </h3>
                    <span className="text-xs text-yellow-400 font-bold uppercase">
                      {role} (Ранг 4) • Метод: {method === 'streetrat' ? 'Уличная шпана (Streetrats)' : method === 'edgerunner' ? 'Бегущий по краю (Edgerunners)' : 'Полный конструктор (Point-Buy)'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-orbitron font-black text-xl text-emerald-400">
                      {method === 'pointbuy' ? Math.max(0, budgetRemaining) : rolePackage.equipment.pocketCashEb} eb
                    </span>
                    <span className="text-[10px] text-zinc-500 block">Наличные</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="bg-zinc-900 p-2 rounded">
                    <span className="text-zinc-500 block">Здоровье (HP)</span>
                    <span className="font-orbitron font-bold text-red-400">{hpMax} HP</span>
                  </div>
                  <div className="bg-zinc-900 p-2 rounded">
                    <span className="text-zinc-500 block">Человечность / EMP</span>
                    <span className="font-orbitron font-bold text-cyan-400">{currentHumanity} / {currentEmp}</span>
                  </div>
                  <div className="bg-zinc-900 p-2 rounded">
                    <span className="text-zinc-500 block">Оружие</span>
                    <span className="font-orbitron font-bold text-zinc-200">
                      {method === 'pointbuy' ? selectedWeapons.length || 1 : rolePackage.equipment.weapons.length} шт.
                    </span>
                  </div>
                  <div className="bg-zinc-900 p-2 rounded">
                    <span className="text-zinc-500 block">Импланты</span>
                    <span className="font-orbitron font-bold text-cyan-300">
                      {method === 'pointbuy' ? selectedCyberware.length : rolePackage.equipment.cyberware.length} шт.
                    </span>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 italic">
                  Персонаж полностью проверен и соответствует официальным правилам книги правил Cyberpunk RED.
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Wizard Footer Controls */}
        <div className="px-4 py-3 bg-zinc-950 border-t border-zinc-850 flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              sfx.playClick();
              setCurrentStep(Math.max(1, currentStep - 1));
            }}
            disabled={currentStep === 1}
            className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-zinc-200 text-xs font-semibold rounded flex items-center gap-1 transition"
          >
            <ChevronLeft size={16} />
            Назад
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={() => {
                sfx.playClick();
                setCurrentStep(Math.min(6, currentStep + 1));
              }}
              className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded flex items-center gap-1 transition shadow-md shadow-red-950"
            >
              Далее
              <ChevronRight size={16} />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleCompleteCreation}
              className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-orbitron font-black text-xs uppercase tracking-wider rounded flex items-center gap-1.5 transition shadow-lg shadow-emerald-950"
            >
              <Check size={16} />
              СОЗДАТЬ ПЕРСОНАЖА
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
