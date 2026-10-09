import React, { useState } from 'react';
import { Character, StatKey, RoleType, Skill, Weapon, CyberwareItem, ArmorItem } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { CPR_SKILLS, CPR_CRITICAL_INJURIES, CPR_LIFEPATH_TABLES, PRESET_PROGRAMS } from '../data/initialData';
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
  Sparkles
} from 'lucide-react';

interface CharacterWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCharacterCreated: (character: Character) => void;
  lang: Language;
}

const STAT_KEYS: StatKey[] = ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'];
const TOTAL_STAT_POINTS = 62;
const TOTAL_SKILL_POINTS = 86;
const STARTING_BUDGET = 2550; // eb

const ROLE_INFO: Record<RoleType, { nameRu: string; descRu: string; keySkill: string }> = {
  Solo: { nameRu: 'Соло', descRu: 'Наемный убийца, телохранитель, штурмовик.', keySkill: 'Combat Awareness (Боевое чутье)' },
  Netrunner: { nameRu: 'Нетраннер', descRu: 'Киберхакер, взломщик сетей и архитектур.', keySkill: 'Interface (Интерфейс)' },
  Tech: { nameRu: 'Техник', descRu: 'Инженер, изобретатель, оружейный мастер.', keySkill: 'Maker (Творец)' },
  Medtech: { nameRu: 'Медтех', descRu: 'Полевой хирург, фармацевт, спасатель.', keySkill: 'Medicine (Медицина)' },
  Rockerboy: { nameRu: 'Рокербой', descRu: 'Музыкант, бунтарь, лидер мнений.', keySkill: 'Charismatic Impact (Харизматическое влияние)' },
  Media: { nameRu: 'Медиа', descRu: 'Журналист-расследователь, репортер правды.', keySkill: 'Credibility (Достоверность)' },
  Lawman: { nameRu: 'Законник', descRu: 'Офицер полиции, маршал, детектив.', keySkill: 'Backup (Подкрепление)' },
  Exec: { nameRu: 'Корпорат', descRu: 'Руководитель мегакорпорации с ресурсами компании.', keySkill: 'Teamwork (Командная работа)' },
  Fixer: { nameRu: 'Фиксер', descRu: 'Брокер черного рынка, торговец контактами.', keySkill: 'Operator (Оператор)' },
  Nomad: { nameRu: 'Номад', descRu: 'Кочевник пустошей, мастер вождения и караванов.', keySkill: 'Moto (Мото)' }
};

// Market items for procurement step
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
  { name: 'Neural Link (Нейролинк)', cat: 'Neuralware' as const, loc: 'Spine', cost: 500, hl: 7, desc: 'Базовый интерфейс имплантов' },
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

  // Step 1: Identity & Role
  const [name, setName] = useState('Новый бегущий');
  const [handle, setHandle] = useState('Street-Ghost');
  const [role, setRole] = useState<RoleType>('Solo');

  // Step 2: Stats (62 points)
  const [stats, setStats] = useState<Record<StatKey, number>>({
    INT: 6, REF: 7, DEX: 6, TECH: 5, COOL: 6, WILL: 6, LUCK: 6, MOVE: 6, BODY: 7, EMP: 7
  });

  // Step 3: Skills (86 points)
  const [skills, setSkills] = useState<Skill[]>(() => {
    return CPR_SKILLS.map((s) => {
      // Core mandatory skills minimums
      const mandatory: Record<string, number> = {
        athletics: 2, brawling: 2, concentration: 2, conversation: 2,
        education: 2, evasion: 2, first_aid: 2, human_perception: 2,
        language_streetslang: 4, local_expert: 2, perception: 2,
        persuasion: 2, stealth: 2
      };
      return {
        ...s,
        level: mandatory[s.id] || 0
      };
    });
  });

  // Step 4: Shop selections
  const [selectedWeapons, setSelectedWeapons] = useState<typeof SHOP_WEAPONS>([]);
  const [selectedArmor, setSelectedArmor] = useState<typeof SHOP_ARMOR>([]);
  const [selectedCyberware, setSelectedCyberware] = useState<typeof SHOP_CYBERWARE>([]);

  // Step 5: Lifepath
  const [lifepathData, setLifepathData] = useState({
    culturalOrigin: 'Северная Америка (Английский, Streetslang)',
    personality: 'Холодный профессионал с ледяным взглядом',
    clothingStyle: 'Милитари / Тактика (Tactical)',
    valueMost: 'Собственная свобода и честь',
    enemies: 'Корпоративная служба безопасности'
  });

  if (!isOpen) return null;

  // Stat point calculations
  const statsSpent = Object.values(stats).reduce((a, b) => a + b, 0);
  const statsRemaining = TOTAL_STAT_POINTS - statsSpent;

  // Skill point calculations (accounting for x2 skills!)
  const skillsSpent = skills.reduce((acc, s) => acc + (s.level * s.multiplier), 0);
  const skillsRemaining = TOTAL_SKILL_POINTS - skillsSpent;

  // Budget calculations
  const weaponsCost = selectedWeapons.reduce((acc, w) => acc + w.cost, 0);
  const armorCost = selectedArmor.reduce((acc, a) => acc + a.cost, 0);
  const cyberwareCost = selectedCyberware.reduce((acc, c) => acc + c.cost, 0);
  const totalCost = weaponsCost + armorCost + cyberwareCost;
  const budgetRemaining = STARTING_BUDGET - totalCost;

  // Humanity calculation
  const totalHL = selectedCyberware.reduce((acc, c) => acc + c.hl, 0);
  const baseHumanity = stats.EMP * 10;
  const currentHumanity = Math.max(0, baseHumanity - totalHL);
  const currentEmp = Math.floor(currentHumanity / 10);

  // HP
  const hpMax = 10 + 5 * Math.ceil((stats.BODY + stats.WILL) / 2);

  const handleStatAdjust = (key: StatKey, delta: number) => {
    sfx.playClick();
    const current = stats[key];
    const newVal = Math.max(2, Math.min(8, current + delta)); // CPR creation rules: 2 to 8
    setStats({ ...stats, [key]: newVal });
  };

  const handleSkillLevelAdjust = (skillId: string, delta: number) => {
    sfx.playClick();
    setSkills((prev) =>
      prev.map((s) => {
        if (s.id === skillId) {
          const newVal = Math.max(0, Math.min(6, s.level + delta)); // Max 6 at character creation!
          return { ...s, level: newVal };
        }
        return s;
      })
    );
  };

  const handleApplyRoleSkillPreset = () => {
    sfx.playClick();
    // Intelligent presets depending on role
    setSkills((prev) =>
      prev.map((s) => {
        let lvl = s.level;
        if (role === 'Solo') {
          if (s.id === 'handgun') lvl = 6;
          if (s.id === 'shoulder_arms') lvl = 6;
          if (s.id === 'brawling') lvl = 4;
          if (s.id === 'evasion') lvl = 6;
          if (s.id === 'tactics') lvl = 4;
          if (s.id === 'perception') lvl = 5;
        } else if (role === 'Netrunner') {
          if (s.id === 'cybertech') lvl = 6;
          if (s.id === 'electronics_security') lvl = 4; // x2
          if (s.id === 'cryptography') lvl = 5;
          if (s.id === 'handgun') lvl = 4;
          if (s.id === 'library_search') lvl = 5;
          if (s.id === 'perception') lvl = 4;
        } else if (role === 'Tech') {
          if (s.id === 'basic_tech') lvl = 6;
          if (s.id === 'cybertech') lvl = 6;
          if (s.id === 'weaponstech') lvl = 5;
          if (s.id === 'electronics_security') lvl = 3; // x2
          if (s.id === 'handgun') lvl = 4;
        } else if (role === 'Medtech') {
          if (s.id === 'paramedic') lvl = 4; // x2
          if (s.id === 'first_aid') lvl = 6;
          if (s.id === 'cybertech') lvl = 5;
          if (s.id === 'science') lvl = 4;
          if (s.id === 'handgun') lvl = 4;
        }
        return { ...s, level: Math.min(6, lvl) };
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

    // Compile Weapons
    const finalWeapons: Weapon[] = selectedWeapons.map((w, idx) => ({
      id: 'weap-wiz-' + idx + '-' + Date.now(),
      name: w.name,
      category: w.category,
      damage: w.damage,
      standardRof: w.rof,
      magCapacity: w.mag,
      currentAmmo: w.mag,
      ammoType: w.ammo,
      concealable: w.category.includes('Pistol'),
      notes: 'Стартовое снаряжение',
      skillId: w.skillId
    }));

    // If no weapons purchased, give standard heavy pistol
    if (finalWeapons.length === 0) {
      finalWeapons.push({
        id: 'weap-def-1',
        name: 'Heavy Pistol',
        category: 'Heavy Pistol',
        damage: '3d6',
        standardRof: 2,
        magCapacity: 8,
        currentAmmo: 8,
        ammoType: 'Heavy Pistol Ammo',
        concealable: true,
        notes: 'Стандартный пистолет',
        skillId: 'handgun'
      });
    }

    // Compile Armor
    const headArmorItem = selectedArmor.find((a) => a.loc === 'head');
    const bodyArmorItem = selectedArmor.find((a) => a.loc === 'body');

    const finalArmor = {
      head: {
        id: 'armor-head-' + Date.now(),
        name: headArmorItem ? headArmorItem.name : 'Light Armorjack Helmet',
        location: 'head' as const,
        spMax: headArmorItem ? headArmorItem.sp : 11,
        spCurrent: headArmorItem ? headArmorItem.sp : 11,
        penalty: headArmorItem ? headArmorItem.penalty : 0
      },
      body: {
        id: 'armor-body-' + Date.now(),
        name: bodyArmorItem ? bodyArmorItem.name : 'Light Armorjack Vest',
        location: 'body' as const,
        spMax: bodyArmorItem ? bodyArmorItem.sp : 11,
        spCurrent: bodyArmorItem ? bodyArmorItem.sp : 11,
        penalty: bodyArmorItem ? bodyArmorItem.penalty : 0
      }
    };

    // Compile Cyberware
    const finalCyberware: CyberwareItem[] = selectedCyberware.map((c, idx) => ({
      id: 'cyb-wiz-' + idx + '-' + Date.now(),
      name: c.name,
      category: c.cat,
      installLocation: c.loc,
      humanityCost: c.hl,
      description: c.desc
    }));

    const newCharacter: Character = {
      id: 'char-' + Date.now(),
      name,
      handle,
      role,
      roleRank: 4, // Starts at rank 4 in CPR
      notes: `Создан через официальный конструктор персонажей (Point-Buy Edgerunner).`,
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
        name: role === 'Netrunner' ? 'Novatech Cyberdeck' : 'Standard Pocket Agent',
        hardwareSlotsMax: 3,
        hardwareSlotsUsed: 1,
        programSlotsMax: 5,
        installedHardware: ['Standard Deck Interface']
      },
      programs: role === 'Netrunner' ? [...PRESET_PROGRAMS] : [],
      gear: [
        { id: 'g-1', name: 'Agent (Смартфон/ИИ)', category: 'Electronics', quantity: 1, costEb: 100, notes: 'Личный коммуникатор' },
        { id: 'g-2', name: 'Патроны (Стандартная пачка)', category: 'Ammo', quantity: 50, costEb: 50, notes: '50 патронов' }
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
      cashEb: Math.max(0, budgetRemaining),
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
              Конструктор персонажа Cyberpunk RED (Point-Buy)
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
            { step: 1, title: '1. Роль' },
            { step: 2, title: '2. Характеристики (62)' },
            { step: 3, title: '3. Навыки (86)' },
            { step: 4, title: '4. Экипировка (2550 eb)' },
            { step: 5, title: '5. Жизненный путь' },
            { step: 6, title: '6. Итог' },
          ].map((tab) => (
            <button
              key={tab.step}
              onClick={() => {
                sfx.playClick();
                setCurrentStep(tab.step);
              }}
              className={`flex-1 py-2.5 px-3 whitespace-nowrap text-center transition ${
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

        {/* Wizard Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* STEP 1: Role & Identity */}
          {currentStep === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    Позывной (Handle / Streetname)
                  </label>
                  <input
                    type="text"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                    className="w-full bg-zinc-950 border border-red-900/60 rounded px-3 py-1.5 text-red-200 font-bold text-sm focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-2">
                  Выберите Роль (Класс) персонажа
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {(Object.keys(ROLE_INFO) as RoleType[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => {
                        sfx.playClick();
                        setRole(r);
                      }}
                      className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                        role === r
                          ? 'bg-red-950/40 border-red-500 shadow-md shadow-red-950'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
                      }`}
                    >
                      <div>
                        <div className="font-orbitron font-bold text-sm text-zinc-100">
                          {r}
                        </div>
                        <div className="text-[11px] text-zinc-400 mt-1">
                          {ROLE_INFO[r].nameRu}
                        </div>
                      </div>
                      <div className="text-[9px] text-yellow-400 font-semibold mt-2">
                        {ROLE_INFO[r].keySkill}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-300">
                <span className="font-bold text-yellow-400 block mb-1">
                  Выбрана роль: {role} ({ROLE_INFO[role].nameRu})
                </span>
                {ROLE_INFO[role].descRu} На старте способность роли получает 4-й ранг.
              </div>
            </div>
          )}

          {/* STEP 2: Stats Allocation (62 Points) */}
          {currentStep === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase block">
                    Очки характеристик по правилам CPR
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Стандартный лимит: 62 очка. Диапазон значения: от 2 до 8.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase font-semibold text-zinc-400">Осталось очков:</span>
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

              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                {STAT_KEYS.map((k) => (
                  <div
                    key={k}
                    className="bg-zinc-950 border border-zinc-800 rounded p-2.5 text-center flex flex-col justify-between"
                  >
                    <div>
                      <span className="font-orbitron font-black text-base text-red-500 block">
                        {k}
                      </span>
                      <span className="text-[10px] text-zinc-400 block truncate">{t[k]}</span>
                    </div>

                    <div className="font-orbitron font-black text-2xl text-white my-1.5">
                      {stats[k]}
                    </div>

                    <div className="flex items-center justify-center gap-1.5 pt-1 border-t border-zinc-900">
                      <button
                        onClick={() => handleStatAdjust(k, -1)}
                        disabled={stats[k] <= 2}
                        className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded text-xs font-bold"
                      >
                        -
                      </button>
                      <button
                        onClick={() => handleStatAdjust(k, 1)}
                        disabled={stats[k] >= 8 || statsRemaining <= 0}
                        className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded text-xs font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>

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

          {/* STEP 3: Skills Allocation (86 Points) */}
          {currentStep === 3 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase block">
                    Очки навыков по правилам CPR
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Всего 86 очков (включая обязательные базовые). Максимальный ранг: 6. Навыки (x2) стоят 2 очка.
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleApplyRoleSkillPreset}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-yellow-400 border border-zinc-700 rounded text-xs font-bold"
                  >
                    Заполнить по роли {role}
                  </button>

                  <div className="flex items-center gap-1.5 ml-2">
                    <span className="text-xs uppercase font-semibold text-zinc-400">Осталось:</span>
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
                </div>
              </div>

              {/* Skills List */}
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
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Equipment & Cyberware Procurement (2550 eb) */}
          {currentStep === 4 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 p-3 rounded-lg border border-zinc-800">
                <div>
                  <span className="text-xs font-semibold text-zinc-400 uppercase block">
                    Стартовый бюджет бегущего: 2,550 eb
                  </span>
                  <span className="text-[11px] text-zinc-500">
                    Оставшиеся средства перейдут в наличные деньги (Cash eb).
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block uppercase">Потеря Человечности:</span>
                    <span className="font-orbitron font-bold text-sm text-red-400">-{totalHL} HL (EMP: {currentEmp})</span>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block uppercase">Остаток бюджета:</span>
                    <span
                      className={`font-orbitron font-black text-xl ${
                        budgetRemaining >= 0 ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {budgetRemaining} eb
                    </span>
                  </div>
                </div>
              </div>

              {/* Weapons Shop */}
              <div>
                <span className="text-xs font-orbitron font-bold text-red-400 uppercase block mb-1.5">
                  1. Оружие
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {SHOP_WEAPONS.map((w) => {
                    const isSelected = selectedWeapons.some((sw) => sw.name === w.name);
                    return (
                      <div
                        key={w.name}
                        onClick={() => {
                          sfx.playClick();
                          if (isSelected) {
                            setSelectedWeapons(selectedWeapons.filter((sw) => sw.name !== w.name));
                          } else {
                            setSelectedWeapons([...selectedWeapons, w]);
                          }
                        }}
                        className={`p-2.5 rounded border cursor-pointer text-xs transition flex justify-between items-center ${
                          isSelected
                            ? 'bg-red-950/40 border-red-500 text-white'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
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

              {/* Armor Shop */}
              <div>
                <span className="text-xs font-orbitron font-bold text-yellow-400 uppercase block mb-1.5">
                  2. Броня
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {SHOP_ARMOR.map((a) => {
                    const isSelected = selectedArmor.some((sa) => sa.name === a.name);
                    return (
                      <div
                        key={a.name}
                        onClick={() => {
                          sfx.playClick();
                          if (isSelected) {
                            setSelectedArmor(selectedArmor.filter((sa) => sa.name !== a.name));
                          } else {
                            setSelectedArmor([...selectedArmor, a]);
                          }
                        }}
                        className={`p-2.5 rounded border cursor-pointer text-xs transition flex justify-between items-center ${
                          isSelected
                            ? 'bg-yellow-950/40 border-yellow-500 text-white'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
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

              {/* Cyberware Shop */}
              <div>
                <span className="text-xs font-orbitron font-bold text-cyan-400 uppercase block mb-1.5">
                  3. Киберимпланты (Humanity Loss & eb)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SHOP_CYBERWARE.map((c) => {
                    const isSelected = selectedCyberware.some((sc) => sc.name === c.name);
                    return (
                      <div
                        key={c.name}
                        onClick={() => {
                          sfx.playClick();
                          if (isSelected) {
                            setSelectedCyberware(selectedCyberware.filter((sc) => sc.name !== c.name));
                          } else {
                            setSelectedCyberware([...selectedCyberware, c]);
                          }
                        }}
                        className={`p-2.5 rounded border cursor-pointer text-xs transition flex justify-between items-center ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500 text-white'
                            : 'bg-zinc-950 border-zinc-800 text-zinc-300 hover:border-zinc-700'
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
                  <label className="text-zinc-400 uppercase font-semibold block mb-1">
                    Культурное происхождение
                  </label>
                  <input
                    type="text"
                    value={lifepathData.culturalOrigin}
                    onChange={(e) => setLifepathData({ ...lifepathData, culturalOrigin: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 uppercase font-semibold block mb-1">
                    Характер
                  </label>
                  <input
                    type="text"
                    value={lifepathData.personality}
                    onChange={(e) => setLifepathData({ ...lifepathData, personality: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 uppercase font-semibold block mb-1">
                    Стиль одежды
                  </label>
                  <input
                    type="text"
                    value={lifepathData.clothingStyle}
                    onChange={(e) => setLifepathData({ ...lifepathData, clothingStyle: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 uppercase font-semibold block mb-1">
                    Главная ценность
                  </label>
                  <input
                    type="text"
                    value={lifepathData.valueMost}
                    onChange={(e) => setLifepathData({ ...lifepathData, valueMost: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-red-400 uppercase font-semibold block mb-1">
                    Главный враг
                  </label>
                  <input
                    type="text"
                    value={lifepathData.enemies}
                    onChange={(e) => setLifepathData({ ...lifepathData, enemies: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100"
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
                      {role} (Ранг 4)
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-orbitron font-black text-xl text-emerald-400">
                      {Math.max(0, budgetRemaining)} eb
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
                    <span className="text-zinc-500 block">Куплено оружия</span>
                    <span className="font-orbitron font-bold text-zinc-200">{selectedWeapons.length || 1} шт.</span>
                  </div>
                  <div className="bg-zinc-900 p-2 rounded">
                    <span className="text-zinc-500 block">Импланты</span>
                    <span className="font-orbitron font-bold text-cyan-300">{selectedCyberware.length} шт.</span>
                  </div>
                </div>

                <div className="text-xs text-zinc-400 italic">
                  Персонаж полностью проверен и соответствует правилам создания Edgerunner книги правил Cyberpunk RED.
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
