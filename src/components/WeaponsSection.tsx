import React, { useState } from 'react';
import { Character, Weapon, WeaponCategory, MartialArtsStyle } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { CPR_RANGE_DISTANCES, CPR_RANGE_DV_TABLE } from '../data/initialData';
import { 
  getUnarmedDamage, 
  CPR_BODY_DAMAGE_SCALE, 
  CPR_MELEE_WEAPON_TIERS, 
  CPR_BRAWLING_MANEUVERS, 
  CPR_MARTIAL_ARTS_STYLES,
  CPR_UNIVERSAL_MARTIAL_ARTS_MOVES,
  MartialArtsMove
} from '../data/meleeRules';
import { sfx } from '../utils/audio';
import { 
  Crosshair, 
  Plus, 
  Trash2, 
  Flame, 
  RotateCcw, 
  Table, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ShoppingCart,
  Swords,
  Hand,
  ShieldCheck,
  Zap,
  Info,
  BookOpen,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

interface WeaponsSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onRollWeaponAttack: (weapon: Weapon, targetDv?: number, rangeStr?: string) => void;
  onRollWeaponDamage: (weapon: Weapon) => void;
  onRollCustomCheck?: (title: string, baseVal: number, targetDv?: number, modifiers?: { name: string; val: number }[]) => void;
  onRollCustomDamage?: (title: string, formula: string) => void;
  onOpenShop?: (category?: 'all' | 'weapons' | 'armor' | 'cyberware' | 'gear') => void;
  lang: Language;
}

type CombatSubTab = 'all' | 'ranged' | 'melee' | 'brawling' | 'martial_arts' | 'rules';

const WEAPON_PRESETS: Partial<Weapon>[] = [
  { name: 'Medium Pistol (Militech Arms)', category: 'Medium Pistol', damage: '2d6', standardRof: 2, magCapacity: 12, ammoType: 'Medium Pistol', concealable: true, skillId: 'handgun' },
  { name: 'Heavy Pistol (Sternmeyer P-35)', category: 'Heavy Pistol', damage: '3d6', standardRof: 2, magCapacity: 8, ammoType: 'Heavy Pistol', concealable: true, skillId: 'handgun' },
  { name: 'Very Heavy Pistol (Malorian Arms)', category: 'Very Heavy Pistol', damage: '4d6', standardRof: 1, magCapacity: 8, ammoType: 'Very Heavy Pistol', concealable: false, skillId: 'handgun' },
  { name: 'SMG (Federated Arms Tech-9)', category: 'SMG', damage: '2d6', standardRof: 1, magCapacity: 30, ammoType: 'Medium Pistol', concealable: true, skillId: 'handgun' },
  { name: 'Heavy SMG (Chadron Arasaka)', category: 'Heavy SMG', damage: '3d6', standardRof: 1, magCapacity: 40, ammoType: 'Heavy Pistol', concealable: false, skillId: 'handgun' },
  { name: 'Shotgun (Rostovic DB-2)', category: 'Shotgun', damage: '5d6', standardRof: 1, magCapacity: 4, ammoType: 'Shotgun Shells / Slugs', concealable: false, skillId: 'shoulder_arms' },
  { name: 'Assault Rifle (Militech Ronin)', category: 'Assault Rifle', damage: '5d6', standardRof: 1, magCapacity: 30, ammoType: 'Rifle Ammo', concealable: false, skillId: 'shoulder_arms' },
  { name: 'Sniper Rifle (Nomad Nomad-X)', category: 'Sniper Rifle', damage: '5d6', standardRof: 1, magCapacity: 4, ammoType: 'Rifle Ammo', concealable: false, skillId: 'shoulder_arms' },
  // Official Melee Tiers
  { name: 'Light Melee (Combat Knife / Brass Knuckles)', category: 'Light Melee', damage: '1d6', standardRof: 2, magCapacity: 0, ammoType: 'None', concealable: true, skillId: 'melee_weapon' },
  { name: 'Medium Melee (Baseball Bat / Machete)', category: 'Medium Melee', damage: '2d6', standardRof: 2, magCapacity: 0, ammoType: 'None', concealable: false, skillId: 'melee_weapon' },
  { name: 'Heavy Melee (Lead Pipe / Crowbar)', category: 'Heavy Melee', damage: '3d6', standardRof: 2, magCapacity: 0, ammoType: 'None', concealable: false, skillId: 'melee_weapon' },
  { name: 'Very Heavy Melee (Katana / Monokatana)', category: 'Very Heavy Melee', damage: '4d6', standardRof: 1, magCapacity: 0, ammoType: 'None', concealable: false, skillId: 'melee_weapon' }
];

export const WeaponsSection: React.FC<WeaponsSectionProps> = ({
  character,
  onUpdateCharacter,
  onRollWeaponAttack,
  onRollWeaponDamage,
  onRollCustomCheck,
  onRollCustomDamage,
  onOpenShop,
  lang
}) => {
  const t = translations[lang];
  const [combatSubTab, setCombatSubTab] = useState<CombatSubTab>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRangeMatrix, setShowRangeMatrix] = useState(false);
  const [isGrapplingTarget, setIsGrapplingTarget] = useState(false);

  // New weapon state
  const [newWeapon, setNewWeapon] = useState<Partial<Weapon>>({
    name: 'Heavy Pistol',
    category: 'Heavy Pistol',
    damage: '3d6',
    standardRof: 2,
    magCapacity: 8,
    currentAmmo: 8,
    ammoType: 'Heavy Pistol Ammo',
    concealable: true,
    notes: lang === 'ru' ? 'Стандартный пистолет' : 'Standard pistol',
    skillId: 'handgun'
  });

  // Calculate penalties for skills
  const armorPenalty = Math.min(character.armor.head.penalty || 0, character.armor.body.penalty || 0);
  const hpMax = 10 + 5 * Math.ceil((character.stats.BODY + character.stats.WILL) / 2);
  const woundPenalty = character.hpCurrent <= 0 ? -4 : character.hpCurrent <= Math.ceil(hpMax / 2) ? -2 : 0;

  // Unarmed calculations
  const unarmedDamage = getUnarmedDamage(character.stats.BODY);
  const brawlingSkill = character.skills.find((s) => s.id === 'brawling');
  const brawlingLvl = brawlingSkill?.level || 0;
  const brawlingBase = character.stats.DEX + brawlingLvl + armorPenalty + woundPenalty;

  // Martial Arts calculations
  const maSkill = character.skills.find((s) => s.id === 'martial_arts');
  const maLvl = maSkill?.level || 0;
  const maBase = character.stats.DEX + maLvl + armorPenalty + woundPenalty;
  const currentMaStyle: MartialArtsStyle = character.martialArtsStyle || 'Karate';
  const styleData = CPR_MARTIAL_ARTS_STYLES[currentMaStyle] || CPR_MARTIAL_ARTS_STYLES.Karate;

  // Counts
  const rangedWeapons = character.weapons.filter((w) => w.magCapacity > 0 && !w.category.includes('Melee'));
  const meleeWeapons = character.weapons.filter((w) => w.magCapacity === 0 || w.category.includes('Melee'));

  const handleFireSingle = (weaponId: string) => {
    sfx.playGunshot();
    const updated = character.weapons.map((w) => {
      if (w.id === weaponId && w.currentAmmo > 0) {
        return { ...w, currentAmmo: w.currentAmmo - 1 };
      }
      return w;
    });
    onUpdateCharacter({ ...character, weapons: updated });
  };

  const handleFireAutofire = (weaponId: string) => {
    sfx.playGunshot();
    const updated = character.weapons.map((w) => {
      if (w.id === weaponId && w.currentAmmo >= 10) {
        return { ...w, currentAmmo: w.currentAmmo - 10 };
      }
      return w;
    });
    onUpdateCharacter({ ...character, weapons: updated });
  };

  const handleReload = (weaponId: string) => {
    sfx.playReload();
    const updated = character.weapons.map((w) => {
      if (w.id === weaponId) {
        return { ...w, currentAmmo: w.magCapacity };
      }
      return w;
    });
    onUpdateCharacter({ ...character, weapons: updated });
  };

  const handleDeleteWeapon = (weaponId: string) => {
    sfx.playClick();
    const updated = character.weapons.filter((w) => w.id !== weaponId);
    onUpdateCharacter({ ...character, weapons: updated });
  };

  const handleAddWeapon = () => {
    sfx.playClick();
    const isMelee = (newWeapon.category || '').includes('Melee');
    const weapon: Weapon = {
      id: 'weap-' + Date.now(),
      name: newWeapon.name || (lang === 'ru' ? 'Оружие' : 'Weapon'),
      category: (newWeapon.category as WeaponCategory) || 'Heavy Pistol',
      damage: newWeapon.damage || (isMelee ? '2d6' : '3d6'),
      standardRof: newWeapon.standardRof || (newWeapon.category === 'Very Heavy Melee' ? 1 : 2),
      magCapacity: isMelee ? 0 : (newWeapon.magCapacity || 8),
      currentAmmo: isMelee ? 0 : (newWeapon.currentAmmo ?? newWeapon.magCapacity ?? 8),
      ammoType: isMelee ? 'None' : (newWeapon.ammoType || 'Standard'),
      concealable: newWeapon.concealable ?? false,
      notes: newWeapon.notes || '',
      skillId: newWeapon.skillId || (isMelee ? 'melee_weapon' : 'handgun')
    };

    onUpdateCharacter({
      ...character,
      weapons: [...character.weapons, weapon]
    });
    setShowAddModal(false);
  };

  const handleApplyPreset = (preset: Partial<Weapon>) => {
    setNewWeapon({
      ...newWeapon,
      ...preset,
      currentAmmo: preset.magCapacity || 0
    });
  };

  const handleSelectMaStyle = (style: MartialArtsStyle) => {
    sfx.playClick();
    onUpdateCharacter({
      ...character,
      martialArtsStyle: style
    });
  };

  const handleRollBrawlingStrikeAttack = () => {
    onRollCustomCheck?.(
      lang === 'ru' ? 'Рукопашная атака: Удар (Драка / Brawling) [Игнор 50% SP]' : 'Melee Attack: Brawling Strike [Half SP]',
      brawlingBase
    );
  };

  const handleRollBrawlingStrikeDamage = () => {
    onRollCustomDamage?.(
      lang === 'ru' ? `Урон безоружного удара (BODY ${character.stats.BODY}) [Игнор 50% SP]` : `Unarmed Strike Damage (BODY ${character.stats.BODY}) [Half SP]`,
      unarmedDamage
    );
  };

  const handleRollGrab = () => {
    onRollCustomCheck?.(
      lang === 'ru' ? 'Захват противника (Grab) [DEX + Мордобой vs Evasion/Brawling]' : 'Grapple Check (Grab) [DEX + Brawling vs Evasion/Brawling]',
      brawlingBase
    );
  };

  const handleRollChoke = () => {
    sfx.playCritSuccess();
    const title = lang === 'ru' 
      ? `Удушение (Choke): -${character.stats.BODY} урона прямо в ОЗ [ПОЛНЫЙ ИГНОР SP!]` 
      : `Choke: -${character.stats.BODY} damage directly to HP [IGNORES ALL SP!]`;
    onRollCustomCheck?.(title, character.stats.BODY);
  };

  const handleRollThrow = () => {
    onRollCustomDamage?.(
      lang === 'ru' ? `Бросок через себя (Throw): ${unarmedDamage} урона [Цель сбита с ног / Prone, Игнор 50% SP]` : `Throw Damage: ${unarmedDamage} [Target Prone, Half SP]`,
      unarmedDamage
    );
    setIsGrapplingTarget(false);
  };

  const handleRollMartialArtsStrike = () => {
    onRollCustomCheck?.(
      lang === 'ru' ? `Атака Боевых Искусств: ${styleData.nameRu} [Игнор 50% SP]` : `Martial Arts Strike: ${styleData.nameEn} [Half SP]`,
      maBase
    );
  };

  const handleRollMartialArtsDamage = () => {
    onRollCustomDamage?.(
      lang === 'ru' ? `Урон удара ${styleData.nameRu} (BODY ${character.stats.BODY}) [Игнор 50% SP]` : `Martial Arts Damage (${styleData.nameEn}) [Half SP]`,
      unarmedDamage
    );
  };

  const handleExecuteMaSpecialMove = (move: MartialArtsMove) => {
    sfx.playCritSuccess();

    if (move.id === 'kip_up') {
      onRollCustomCheck?.(
        lang === 'ru' ? 'Общий спецприём: Быстрый подъём (Kip Up) [СЛ13]' : 'Universal Move: Kip Up [DV 13]',
        maBase,
        13
      );
      return;
    }

    if (move.id === 'karate_bone_break') {
      onRollCustomDamage?.(
        lang === 'ru' ? 'Каратэ: Костедробительный удар (+5 Crit HP, Перелом)' : 'Karate: Bone Breaking Strike (+5 Crit HP)',
        unarmedDamage
      );
      return;
    }

    if (move.id === 'judo_counter_throw') {
      onRollCustomDamage?.(
        lang === 'ru' ? 'Дзюдо: Контрбросок (Враг сбит с ног / Prone!)' : 'Judo: Counter Throw (Target falls Prone!)',
        unarmedDamage
      );
      return;
    }

    if (move.id === 'taekwondo_pressure_point') {
      onRollCustomDamage?.(
        lang === 'ru' ? 'Тхэквондо: Удар по болевым точкам (+5 Crit HP, Травма)' : 'Taekwondo: Pressure Point Strike (+5 Crit HP)',
        unarmedDamage
      );
      return;
    }

    if (move.id === 'taekwondo_flying_kick') {
      onRollCustomDamage?.(
        lang === 'ru' ? 'Тхэквондо: Летящий удар (Сбит с ног / Prone!)' : 'Taekwondo: Flying Kick (Knocked Prone!)',
        unarmedDamage
      );
      return;
    }

    if (move.id === 'boxing_knockout') {
      onRollCustomCheck?.(
        lang === 'ru' ? 'Бокс: Нокаутирующий удар (-5 штраф в голову, Травма Челюсти)' : 'Boxing: Knockout Punch (-5 aimed head penalty)',
        maBase - 5,
        undefined,
        [{ name: 'Aimed Penalty', val: -5 }]
      );
      return;
    }

    if (move.id === 'borg_fist') {
      const dmg = character.humanityCurrent < 0 ? '6d6' : '5d6';
      onRollCustomDamage?.(
        lang === 'ru' ? `Панцерфауст: Кулак борга (${dmg} урона)` : `Panzerfaust: Borg Fist (${dmg} damage)`,
        dmg
      );
      return;
    }

    if (move.id === 'militech_knife_training') {
      onRollCustomDamage?.(
        lang === 'ru' ? 'Militech: Усиленный удар боевым ножом (4d6)' : 'Militech: Enhanced Combat Knife (4d6)',
        '4d6'
      );
      return;
    }

    if (move.id === 'wrestling_choke') {
      onRollCustomCheck?.(
        lang === 'ru' ? `Реслинг: Мгновенное удушение (-${character.stats.BODY} HP прямо в ОЗ [Игнор SP!])` : `Wrestling: Instant Choke (-${character.stats.BODY} direct HP [Ignores SP!])`,
        character.stats.BODY
      );
      return;
    }

    if (move.id === 'yukon_crack_skulls') {
      onRollCustomCheck?.(
        lang === 'ru' ? `Юкон: Стукни друг о друга (-${character.stats.BODY} HP целям в захвате)` : `Yukon: Crack Skulls (-${character.stats.BODY} direct HP)`,
        character.stats.BODY
      );
      return;
    }

    // Default handler for all checks (using targetDv when specified)
    const moveTitle = `${lang === 'ru' ? styleData.nameRu : styleData.nameEn}: ${lang === 'ru' ? move.nameRu : move.nameEn}${move.targetDv ? ` [СЛ${move.targetDv}]` : ''}`;
    onRollCustomCheck?.(moveTitle, maBase, move.targetDv);
  };

  // Filter weapons based on sub-tab
  const displayedWeapons = character.weapons.filter((w) => {
    if (combatSubTab === 'ranged') return w.magCapacity > 0 && !w.category.includes('Melee');
    if (combatSubTab === 'melee') return w.magCapacity === 0 || w.category.includes('Melee');
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Top Main Combat Header */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <Crosshair size={18} className="text-red-500" />
          <div>
            <h2 className="font-orbitron font-bold text-sm text-red-500 uppercase tracking-wider">
              {lang === 'ru' ? 'Оружие и Ближний бой' : 'Weapons & Melee Combat'}
            </h2>
            <span className="text-[11px] text-zinc-400 block">
              {lang === 'ru' ? 'Огнестрел, холодное оружие, рукопашные приёмы и боевые искусства' : 'Firearms, melee weapons, brawling & martial arts'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenShop && (
            <button
              onClick={() => {
                sfx.playClick();
                onOpenShop('weapons');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-950/60 hover:bg-yellow-600 border border-yellow-700/80 text-yellow-300 hover:text-black font-bold text-xs uppercase tracking-wider rounded transition font-orbitron min-h-[36px]"
              title={lang === 'ru' ? "Купить оружие из каталога DataPool" : "Buy weapons from DataPool catalog"}
            >
              <ShoppingCart size={14} className="text-yellow-400" />
              <span>{lang === 'ru' ? 'Каталог DataPool' : 'DataPool Shop'}</span>
            </button>
          )}

          <button
            onClick={() => {
              sfx.playClick();
              setShowRangeMatrix(!showRangeMatrix);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs font-semibold transition min-h-[36px]"
          >
            <Table size={14} />
            <span>{t.rangeDvMatrix}</span>
            {showRangeMatrix ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded transition font-orbitron min-h-[36px]"
          >
            <Plus size={14} />
            <span>{t.addWeapon}</span>
          </button>
        </div>
      </div>

      {/* Sub-Tabs: Firearms, Melee Weapons, Brawling, Martial Arts, Rules */}
      <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x scrollbar-none pb-1 text-xs font-orbitron font-semibold uppercase">
        <button
          onClick={() => {
            sfx.playClick();
            setCombatSubTab('all');
          }}
          className={`px-3 py-2 rounded transition shrink-0 min-h-[36px] flex items-center gap-1.5 ${
            combatSubTab === 'all'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <Crosshair size={13} />
          <span>{lang === 'ru' ? 'Все оружие' : 'All Weapons'}</span>
          <span className="text-[10px] opacity-75">({character.weapons.length})</span>
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setCombatSubTab('ranged');
          }}
          className={`px-3 py-2 rounded transition shrink-0 min-h-[36px] flex items-center gap-1.5 ${
            combatSubTab === 'ranged'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <span>{lang === 'ru' ? 'Огнестрел' : 'Ranged'}</span>
          <span className="text-[10px] opacity-75">({rangedWeapons.length})</span>
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setCombatSubTab('melee');
          }}
          className={`px-3 py-2 rounded transition shrink-0 min-h-[36px] flex items-center gap-1.5 ${
            combatSubTab === 'melee'
              ? 'bg-red-600 text-white shadow-md'
              : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
          }`}
        >
          <Swords size={13} />
          <span>{lang === 'ru' ? 'Холодное оружие' : 'Melee Weapons'}</span>
          <span className="text-[10px] opacity-75">({meleeWeapons.length})</span>
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setCombatSubTab('brawling');
          }}
          className={`px-3 py-2 rounded transition shrink-0 min-h-[36px] flex items-center gap-1.5 ${
            combatSubTab === 'brawling'
              ? 'bg-amber-600 text-black shadow-md font-bold'
              : 'bg-zinc-900 text-amber-400 hover:text-amber-300 border border-amber-900/50'
          }`}
        >
          <Hand size={13} />
          <span>{lang === 'ru' ? 'Драка (Мордобой)' : 'Brawling'}</span>
          <span className="text-[10px] opacity-90">({unarmedDamage})</span>
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setCombatSubTab('martial_arts');
          }}
          className={`px-3 py-2 rounded transition shrink-0 min-h-[36px] flex items-center gap-1.5 ${
            combatSubTab === 'martial_arts'
              ? 'bg-cyan-600 text-white shadow-md font-bold'
              : 'bg-zinc-900 text-cyan-400 hover:text-cyan-300 border border-cyan-900/50'
          }`}
        >
          <Zap size={13} />
          <span>{lang === 'ru' ? 'Боевые искусства' : 'Martial Arts'}</span>
          <span className="text-[10px] opacity-90">({currentMaStyle})</span>
        </button>

        <button
          onClick={() => {
            sfx.playClick();
            setCombatSubTab('rules');
          }}
          className={`px-3 py-2 rounded transition shrink-0 min-h-[36px] flex items-center gap-1.5 ${
            combatSubTab === 'rules'
              ? 'bg-yellow-600 text-black shadow-md font-bold'
              : 'bg-zinc-900 text-zinc-400 hover:text-yellow-400 border border-zinc-800'
          }`}
        >
          <BookOpen size={13} />
          <span>{lang === 'ru' ? 'Справочник правил CPR' : 'Melee Rules'}</span>
        </button>
      </div>

      {/* Range DV Interactive Table Collapsible */}
      {showRangeMatrix && (
        <div className="bg-zinc-900 border border-red-800/60 rounded-lg p-3 sm:p-4 shadow-xl space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-1.5 mb-1">
            <span className="text-xs font-orbitron font-bold text-yellow-400 uppercase">
              {lang === 'ru' ? 'Официальная таблица сложностей стрельбы (Cyberpunk RED Range DV Table)' : 'Cyberpunk RED Range DV Table'}
            </span>
            <span className="text-[10px] text-zinc-400">
              {lang === 'ru' ? '← Прокрутка по горизонтали • Кликните DV для атаки →' : '← Swipe horizontally • Click DV to roll attack →'}
            </span>
          </div>

          <div className="overflow-x-auto touch-pan-x -mx-2 px-2 sm:mx-0 sm:px-0">
            <table className="w-full text-xs text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px]">
                  <th className="py-2 px-2">{lang === 'ru' ? 'Категория оружия' : 'Weapon Category'}</th>
                  {CPR_RANGE_DISTANCES.map((dist) => (
                    <th key={dist} className="py-2 px-1 text-center font-bold text-zinc-300">
                      {dist}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CPR_RANGE_DV_TABLE.map((row) => (
                  <tr key={row.category} className="border-b border-zinc-800/50 hover:bg-zinc-800/40">
                    <td className="py-2 px-2 font-semibold text-zinc-200">{lang === 'ru' ? row.nameRu : row.category}</td>
                    {row.dvs.map((dv, idx) => (
                      <td key={idx} className="py-1 px-1 text-center">
                        {dv !== null ? (
                          <button
                            onClick={() => {
                              const matchedWeapon = character.weapons.find((w) =>
                                w.category.toLowerCase().includes(row.category.toLowerCase().split(' ')[0])
                              ) || character.weapons[0];
                              if (matchedWeapon) {
                                onRollWeaponAttack(matchedWeapon, dv, CPR_RANGE_DISTANCES[idx]);
                              }
                            }}
                            title={lang === 'ru' ? `Бросить атаку против DV ${dv} на дистанции ${CPR_RANGE_DISTANCES[idx]}` : `Roll attack vs DV ${dv} at range ${CPR_RANGE_DISTANCES[idx]}`}
                            className="px-2.5 py-1.5 min-h-[30px] min-w-[30px] bg-zinc-800 hover:bg-red-600 hover:text-white border border-zinc-700 hover:border-red-500 rounded font-mono font-bold text-zinc-200 transition text-xs inline-flex items-center justify-center"
                          >
                            {dv}
                          </button>
                        ) : (
                          <span className="text-zinc-600 font-mono">-</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SECTION 1: BRAWLING (Мордобой / Драка) */}
      {combatSubTab === 'brawling' && (
        <div className="space-y-3.5 animate-fade-in">
          {/* Main Unarmed Strike Banner */}
          <div className="bg-zinc-900 border-2 border-amber-600/80 rounded-xl p-3.5 sm:p-4 shadow-xl space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2 border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-950/60 border border-amber-600 rounded text-amber-400">
                  <Hand size={20} />
                </div>
                <div>
                  <h3 className="font-orbitron font-bold text-base text-amber-400 uppercase tracking-wider">
                    {lang === 'ru' ? 'Безоружная атака (Мордобой / Brawling)' : 'Unarmed Strike (Brawling)'}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span>{lang === 'ru' ? 'Навык:' : 'Skill:'} <strong>DEX ({character.stats.DEX}) + Мордобой ({brawlingLvl})</strong> = База <strong className="text-white font-mono">{brawlingBase}</strong></span>
                    <span>•</span>
                    <span className="text-amber-300 font-semibold">{t.halfSpNotice}</span>
                  </div>
                </div>
              </div>

              {/* Stats badges */}
              <div className="flex items-center gap-2">
                <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded text-center">
                  <span className="text-[10px] text-zinc-400 block uppercase font-mono">{lang === 'ru' ? 'Урон (BODY ' + character.stats.BODY + ')' : 'Damage (BODY ' + character.stats.BODY + ')'}</span>
                  <span className="font-orbitron font-black text-base text-yellow-400">{unarmedDamage}</span>
                </div>
                <div className="bg-zinc-950 border border-zinc-800 px-3 py-1.5 rounded text-center">
                  <span className="text-[10px] text-zinc-400 block uppercase font-mono">ROF</span>
                  <span className="font-orbitron font-black text-base text-zinc-200">2</span>
                </div>
              </div>
            </div>

            {/* Quick Action buttons for Strike */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleRollBrawlingStrikeAttack}
                className="py-2.5 px-4 min-h-[42px] bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2 shadow-md shadow-red-950"
              >
                <Crosshair size={16} />
                <span>{lang === 'ru' ? 'БРОСИТЬ АТАКУ КУЛАКОМ/НОГОЙ' : 'ROLL BRAWLING ATTACK'}</span>
                <span className="font-mono text-[11px] opacity-80">(1d10 + {brawlingBase})</span>
              </button>

              <button
                onClick={handleRollBrawlingStrikeDamage}
                className="py-2.5 px-4 min-h-[42px] bg-amber-600 hover:bg-amber-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2 shadow-md shadow-amber-950"
              >
                <Flame size={16} />
                <span>{lang === 'ru' ? 'БРОСИТЬ УРОН УДАРА' : 'ROLL STRIKE DAMAGE'}</span>
                <span className="font-mono text-[11px]">({unarmedDamage})</span>
              </button>
            </div>
          </div>

          {/* Interactive Brawling Maneuvers Grid */}
          <div className="space-y-2">
            <span className="text-xs font-orbitron font-bold text-yellow-400 uppercase block tracking-wider">
              {lang === 'ru' ? 'Официальные маневры рукопашного боя (CPR Core Rules)' : 'Official Brawling Maneuvers (CPR Core Rules)'}
            </span>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {/* Maneuver 1: Grab / Grapple */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between shadow-md space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-orbitron font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                      <Hand size={15} className="text-amber-400" />
                      {lang === 'ru' ? '1. Захват (Grab)' : '1. Grapple / Grab'}
                    </span>
                    <button
                      onClick={() => {
                        sfx.playClick();
                        setIsGrapplingTarget(!isGrapplingTarget);
                      }}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase transition ${
                        isGrapplingTarget
                          ? 'bg-red-600 text-white shadow'
                          : 'bg-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      {isGrapplingTarget ? (lang === 'ru' ? 'Захвачен ✓' : 'Grappled ✓') : (lang === 'ru' ? 'Не активен' : 'Inactive')}
                    </button>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {lang === 'ru'
                      ? 'Проверка DEX + Мордобой против DEX + Мордобой/Уклонение цели. При успехе цель не может двигаться сама и получает штраф -2 ко всем действиям.'
                      : 'DEX + Brawling vs target DEX + Brawling/Evasion. Target cannot move on their own and suffers -2 to all actions.'}
                  </p>
                </div>

                <button
                  onClick={handleRollGrab}
                  className="w-full py-2 min-h-[36px] bg-zinc-800 hover:bg-amber-950 border border-zinc-700 hover:border-amber-700 text-amber-300 text-xs font-bold font-orbitron uppercase rounded transition flex items-center justify-center gap-1.5"
                >
                  <Hand size={13} />
                  <span>{lang === 'ru' ? 'Проверка захвата' : 'Roll Grab Check'}</span>
                </button>
              </div>

              {/* Maneuver 2: Choke */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between shadow-md space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-orbitron font-bold text-sm text-red-400 flex items-center gap-1.5">
                      <ShieldAlert size={15} />
                      {lang === 'ru' ? '2. Удушение (Choke)' : '2. Choke'}
                    </span>
                    <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.2 rounded font-mono">
                      {lang === 'ru' ? 'Игнор SP!' : 'Bypasses SP!'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {lang === 'ru'
                      ? `Требует активного захвата. Наносит ${character.stats.BODY} урона (значение BODY) НАПРЯМУЮ в ОЗ без учёта брони. 3 хода подряд = потеря сознания.`
                      : `Requires target grappled. Deals ${character.stats.BODY} damage directly to target HP bypassing all armor! 3 turns = unconscious.`}
                  </p>
                </div>

                <button
                  onClick={handleRollChoke}
                  className="w-full py-2 min-h-[36px] bg-red-950/70 hover:bg-red-600 border border-red-800 text-red-200 hover:text-white text-xs font-bold font-orbitron uppercase rounded transition flex items-center justify-center gap-1.5 shadow"
                >
                  <Flame size={13} />
                  <span>{lang === 'ru' ? `Удушить (-${character.stats.BODY} HP в ОЗ)` : `Choke (-${character.stats.BODY} direct HP)`}</span>
                </button>
              </div>

              {/* Maneuver 3: Throw */}
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between shadow-md space-y-2.5">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-orbitron font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                      <RotateCcw size={15} className="text-yellow-400" />
                      {lang === 'ru' ? '3. Бросок (Throw)' : '3. Throw'}
                    </span>
                    <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-mono">
                      Prone
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed">
                    {lang === 'ru'
                      ? `Швыряет захваченную цель на землю: цель сбита с ног (Prone) и получает полный урон ${unarmedDamage}. Захват прекращается.`
                      : `Throws grappled target to ground: target falls Prone and takes full ${unarmedDamage} damage. Ends grapple.`}
                  </p>
                </div>

                <button
                  onClick={handleRollThrow}
                  className="w-full py-2 min-h-[36px] bg-zinc-800 hover:bg-yellow-950 border border-zinc-700 hover:border-yellow-700 text-yellow-300 text-xs font-bold font-orbitron uppercase rounded transition flex items-center justify-center gap-1.5"
                >
                  <RotateCcw size={13} />
                  <span>{lang === 'ru' ? 'Бросить цель о землю' : 'Throw to Ground'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: MARTIAL ARTS (Боевые искусства — 27 стилей DataPool) */}
      {combatSubTab === 'martial_arts' && (
        <div className="space-y-4 animate-fade-in">
          {/* Main Martial Arts Card */}
          <div className="bg-zinc-900 border-2 border-cyan-600/80 rounded-xl p-3.5 sm:p-4 shadow-xl space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-cyan-950/60 border border-cyan-600 rounded text-cyan-400">
                  <Zap size={22} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-orbitron font-bold text-base text-cyan-400 uppercase tracking-wider">
                      {lang === 'ru' ? 'Боевые искусства (Martial Arts x2)' : 'Martial Arts (x2 Skill)'}
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-cyan-950 text-cyan-300 border border-cyan-800">
                      27 {lang === 'ru' ? 'стилей' : 'styles'}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 mt-0.5">
                    <span>{lang === 'ru' ? 'Навык:' : 'Skill:'} <strong>DEX ({character.stats.DEX}) + БИ ({maLvl})</strong> = База <strong className="text-white font-mono">{maBase}</strong></span>
                    <span>•</span>
                    <span className="text-cyan-300 font-semibold">{t.halfSpNotice}</span>
                  </div>
                </div>
              </div>

              {/* Responsive Style Selector */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <label className="text-xs text-zinc-400 font-medium sm:hidden">
                  {lang === 'ru' ? 'Выбрать стиль боевых искусств:' : 'Select Martial Arts Style:'}
                </label>
                <div className="relative min-w-[240px]">
                  <select
                    value={currentMaStyle}
                    onChange={(e) => handleSelectMaStyle(e.target.value as MartialArtsStyle)}
                    className="w-full bg-zinc-950 border-2 border-cyan-600 hover:border-cyan-400 text-cyan-200 font-orbitron font-bold text-xs py-2 px-3 pr-8 rounded-lg appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-400 shadow-md transition"
                  >
                    <optgroup label={lang === 'ru' ? 'Книга правил (Corebook — 4 стиля)' : 'Corebook Styles (4)'}>
                      {(['Aikido', 'Karate', 'Judo', 'Taekwondo'] as MartialArtsStyle[]).map((st) => (
                        <option key={st} value={st} className="bg-zinc-900 text-zinc-100 font-sans">
                          {lang === 'ru' ? CPR_MARTIAL_ARTS_STYLES[st].nameRu : CPR_MARTIAL_ARTS_STYLES[st].nameEn}
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={lang === 'ru' ? '«Киберкулаки Ярости» (Cyberpunks of Fury — 23 стиля)' : 'Cyberpunks of Fury (23 styles)'}>
                      {(Object.keys(CPR_MARTIAL_ARTS_STYLES) as MartialArtsStyle[])
                        .filter((st) => !['Aikido', 'Karate', 'Judo', 'Taekwondo'].includes(st))
                        .map((st) => (
                          <option key={st} value={st} className="bg-zinc-900 text-zinc-100 font-sans">
                            {lang === 'ru' ? CPR_MARTIAL_ARTS_STYLES[st].nameRu : CPR_MARTIAL_ARTS_STYLES[st].nameEn}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-cyan-400">
                    <ChevronDown size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Style Description Banner */}
            <div className="p-3 bg-zinc-950 border border-cyan-900/60 rounded-lg text-xs text-zinc-300 flex items-start gap-2.5">
              <Info size={18} className="text-cyan-400 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <strong className="text-cyan-300 font-orbitron text-sm">
                    {lang === 'ru' ? styleData.nameRu : styleData.nameEn}
                  </strong>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${
                    styleData.category === 'Corebook'
                      ? 'bg-amber-950/70 text-amber-300 border-amber-800'
                      : 'bg-red-950/70 text-red-300 border-red-800'
                  }`}>
                    {styleData.source}
                  </span>
                </div>
                <p className="text-[11px] text-zinc-400 leading-relaxed">
                  {lang === 'ru' ? styleData.descriptionRu : styleData.descriptionEn}
                </p>
              </div>
            </div>

            {/* Attack & Damage Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={handleRollMartialArtsStrike}
                className="py-2.5 px-4 min-h-[42px] bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2 shadow-md shadow-red-950"
              >
                <Crosshair size={16} />
                <span>{lang === 'ru' ? `УДАР ${styleData.nameRu.toUpperCase()} (Атака)` : `MARTIAL ARTS STRIKE (${currentMaStyle})`}</span>
                <span className="font-mono text-[11px] opacity-80">(1d10 + {maBase})</span>
              </button>

              <button
                onClick={handleRollMartialArtsDamage}
                className="py-2.5 px-4 min-h-[42px] bg-cyan-600 hover:bg-cyan-500 text-black font-orbitron font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2 shadow-md shadow-cyan-950"
              >
                <Flame size={16} />
                <span>{lang === 'ru' ? 'БРОСИТЬ УРОН УДАРА' : 'ROLL STRIKE DAMAGE'}</span>
                <span className="font-mono text-[11px]">({unarmedDamage})</span>
              </button>
            </div>
          </div>

          {/* 2 Special Moves for the active style */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-orbitron font-bold text-yellow-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap size={14} />
                {lang === 'ru' ? `Уникальные приёмы стиля: ${styleData.nameRu}` : `Unique Style Moves: ${styleData.nameEn}`}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                2 {lang === 'ru' ? 'приёма' : 'moves'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {styleData.moves.map((move) => (
                <div
                  key={move.id}
                  className="bg-zinc-900 border border-zinc-800 hover:border-cyan-800/80 rounded-lg p-3.5 flex flex-col justify-between shadow-md space-y-2.5 transition"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 border-b border-zinc-800/60 pb-2">
                      <div>
                        <span className="font-orbitron font-bold text-sm text-cyan-300 block">
                          {lang === 'ru' ? move.nameRu : move.nameEn}
                        </span>
                        <span className="text-[10px] text-zinc-400 font-mono">
                          {lang === 'ru' ? move.checkRu : move.checkEn}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {move.targetDv && (
                          <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded font-mono font-bold">
                            СЛ {move.targetDv}
                          </span>
                        )}
                        {move.damageBonus && (
                          <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded font-mono font-bold">
                            {move.damageBonus}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-2.5 space-y-2 text-xs">
                      <div className="text-[11px] text-zinc-300 leading-snug">
                        <strong className="text-amber-400 font-mono">{lang === 'ru' ? 'Условие: ' : 'Requirement: '}</strong>
                        {lang === 'ru' ? move.requirementRu : move.requirementEn}
                      </div>

                      <div className="text-[11px] text-zinc-300 bg-zinc-950 p-2.5 rounded border border-zinc-850 leading-relaxed">
                        <strong className="text-cyan-400 block mb-0.5 font-orbitron text-[10px] tracking-wider uppercase">
                          {lang === 'ru' ? 'Эффект правила CPR:' : 'CPR Rule Effect:'}
                        </strong>
                        {lang === 'ru' ? move.effectRu : move.effectEn}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleExecuteMaSpecialMove(move)}
                    className="w-full py-2 min-h-[38px] bg-cyan-950/80 hover:bg-cyan-600 border border-cyan-700 text-cyan-200 hover:text-black text-xs font-bold font-orbitron uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <Zap size={14} />
                    <span>{lang === 'ru' ? 'ВЫПОЛНИТЬ ПРИЁМ' : 'PERFORM SPECIAL MOVE'}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Universal Special Move (Available to all styles) */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5 shadow-md space-y-2.5">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-800 pb-2">
              <div className="flex items-center gap-2">
                <RotateCcw size={16} className="text-yellow-400" />
                <span className="font-orbitron font-bold text-sm text-yellow-400 uppercase tracking-wider">
                  {lang === 'ru' ? 'Общий спецприём боевых искусств (CPR Universal Move)' : 'Universal Martial Arts Move'}
                </span>
              </div>
              <span className="text-[10px] bg-zinc-800 text-zinc-300 px-2 py-0.5 rounded font-mono font-bold">
                {lang === 'ru' ? 'Для всех 27 стилей' : 'All 27 Styles'}
              </span>
            </div>

            {CPR_UNIVERSAL_MARTIAL_ARTS_MOVES.map((move) => (
              <div key={move.id} className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
                <div className="md:col-span-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <strong className="text-white font-orbitron text-xs">
                      {lang === 'ru' ? move.nameRu : move.nameEn}
                    </strong>
                    <span className="text-[10px] bg-yellow-950 text-yellow-300 border border-yellow-800 px-1.5 py-0.2 rounded font-mono">
                      СЛ 13
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 leading-relaxed">
                    {lang === 'ru' ? move.effectRu : move.effectEn}
                  </p>
                </div>

                <div className="md:col-span-1">
                  <button
                    onClick={() => handleExecuteMaSpecialMove(move)}
                    className="w-full py-2.5 min-h-[40px] bg-yellow-950/80 hover:bg-yellow-500 border border-yellow-700 text-yellow-300 hover:text-black text-xs font-bold font-orbitron uppercase rounded transition flex items-center justify-center gap-1.5 shadow"
                  >
                    <RotateCcw size={14} />
                    <span>{lang === 'ru' ? 'БЫСТРЫЙ ПОДЪЁМ (СЛ13)' : 'ROLL KIP UP (DV 13)'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: CPR MELEE RULES REFERENCE */}
      {combatSubTab === 'rules' && (
        <div className="space-y-4 animate-fade-in text-xs">
          {/* Header Banner */}
          <div className="bg-zinc-900 border border-yellow-700/80 rounded-lg p-3.5 space-y-1">
            <h3 className="font-orbitron font-bold text-sm text-yellow-400 uppercase tracking-wider flex items-center gap-2">
              <BookOpen size={16} />
              {lang === 'ru' ? 'Справочник правил ближнего боя и боевых искусств (Cyberpunk RED Core Rules)' : 'Cyberpunk RED Melee Combat & Martial Arts Rules Reference'}
            </h3>
            <p className="text-zinc-400 text-[11px]">
              {lang === 'ru'
                ? 'Официальные правила ближнего боя книги правил Cyberpunk RED (стр. 167–170, 176–180).'
                : 'Official melee combat and martial arts rules from the Cyberpunk RED Core Rulebook (pp. 167–170, 176–180).'}
            </p>
          </div>

          {/* Golden Rules Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Rule 1: Half SP */}
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg space-y-1">
              <strong className="font-orbitron text-red-400 text-xs block">
                1. {t.rulesHalvingSp}
              </strong>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                {t.rulesHalvingSpDesc}
              </p>
            </div>

            {/* Rule 2: Evasion Defense */}
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg space-y-1">
              <strong className="font-orbitron text-yellow-400 text-xs block">
                2. {t.rulesEvasion}
              </strong>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                {t.rulesEvasionDesc}
              </p>
            </div>

            {/* Rule 3: DEX for Melee */}
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg space-y-1">
              <strong className="font-orbitron text-cyan-400 text-xs block">
                3. {t.rulesDexForMelee}
              </strong>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                {t.rulesDexForMeleeDesc}
              </p>
            </div>

            {/* Rule 4: Choke */}
            <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg space-y-1">
              <strong className="font-orbitron text-amber-400 text-xs block">
                4. {t.rulesBrawlingChoke}
              </strong>
              <p className="text-zinc-300 text-[11px] leading-relaxed">
                {t.rulesBrawlingChokeDesc}
              </p>
            </div>
          </div>

          {/* Table 1: BODY Damage Scale */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2">
            <span className="font-orbitron font-bold text-xs uppercase text-amber-400 block">
              {lang === 'ru' ? 'Шкала безоружного урона от показателя Телосложения (BODY)' : 'Unarmed Strike Damage Scale by BODY Stat'}
            </span>
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px]">
                    <th className="py-1.5 px-2">Показатель BODY</th>
                    <th className="py-1.5 px-2">Урон удара</th>
                    <th className="py-1.5 px-2">Описание силы</th>
                  </tr>
                </thead>
                <tbody>
                  {CPR_BODY_DAMAGE_SCALE.map((row) => (
                    <tr key={row.range} className="border-b border-zinc-800/40 hover:bg-zinc-800/30">
                      <td className="py-1.5 px-2 font-bold font-orbitron text-zinc-200">{row.range}</td>
                      <td className="py-1.5 px-2 font-black font-mono text-yellow-400">{row.damage}</td>
                      <td className="py-1.5 px-2 text-zinc-400">{lang === 'ru' ? row.descRu : row.descEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 2: Melee Weapons Tiers */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2">
            <span className="font-orbitron font-bold text-xs uppercase text-red-400 block">
              {lang === 'ru' ? 'Категории холодного оружия (Melee Weapon Tiers)' : 'Melee Weapon Tiers'}
            </span>
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px]">
                    <th className="py-1.5 px-2">Категория</th>
                    <th className="py-1.5 px-2">Урон</th>
                    <th className="py-1.5 px-2">ROF</th>
                    <th className="py-1.5 px-2">Хват</th>
                    <th className="py-1.5 px-2">Скрытность</th>
                    <th className="py-1.5 px-2">Примеры</th>
                  </tr>
                </thead>
                <tbody>
                  {CPR_MELEE_WEAPON_TIERS.map((tier) => (
                    <tr key={tier.category} className="border-b border-zinc-800/40 hover:bg-zinc-800/30">
                      <td className="py-1.5 px-2 font-bold text-zinc-200">{lang === 'ru' ? tier.nameRu : tier.nameEn}</td>
                      <td className="py-1.5 px-2 font-black font-mono text-yellow-400">{tier.damage}</td>
                      <td className="py-1.5 px-2 font-mono text-zinc-300">ROF {tier.rof}</td>
                      <td className="py-1.5 px-2 text-zinc-400">{tier.hands === 1 ? (lang === 'ru' ? '1 рука' : '1 Hand') : (lang === 'ru' ? '2 руки' : '2 Hands')}</td>
                      <td className="py-1.5 px-2 text-zinc-400">{tier.concealable ? (lang === 'ru' ? 'Да' : 'Yes') : (lang === 'ru' ? 'Нет' : 'No')}</td>
                      <td className="py-1.5 px-2 text-zinc-500 italic">{lang === 'ru' ? tier.examplesRu : tier.examplesEn}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table 3: 27 CPR Martial Arts Styles Catalog */}
          <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-orbitron font-bold text-xs uppercase text-cyan-400 block">
                {lang === 'ru' ? 'Каталог всех 27 стилей боевых искусств («Киберкулаки Ярости» & Corebook)' : 'Catalog of 27 Martial Arts Styles (Cyberpunks of Fury & Corebook)'}
              </span>
              <span className="text-[10px] text-zinc-400 font-mono bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                DataPool Reference
              </span>
            </div>
            <div className="overflow-x-auto touch-pan-x max-h-72 overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px]">
                    <th className="py-1.5 px-2">Стиль</th>
                    <th className="py-1.5 px-2">Источник</th>
                    <th className="py-1.5 px-2">Специальные приёмы стиля</th>
                  </tr>
                </thead>
                <tbody>
                  {(Object.keys(CPR_MARTIAL_ARTS_STYLES) as MartialArtsStyle[]).map((st) => {
                    const info = CPR_MARTIAL_ARTS_STYLES[st];
                    return (
                      <tr key={st} className="border-b border-zinc-800/40 hover:bg-zinc-800/30">
                        <td className="py-1.5 px-2 font-bold font-orbitron text-zinc-200">
                          {lang === 'ru' ? info.nameRu : info.nameEn}
                        </td>
                        <td className="py-1.5 px-2 font-mono text-[11px]">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                            info.category === 'Corebook' ? 'text-amber-400 bg-amber-950/60' : 'text-red-400 bg-red-950/60'
                          }`}>
                            {info.source}
                          </span>
                        </td>
                        <td className="py-1.5 px-2 text-zinc-300">
                          {info.moves.map((m) => lang === 'ru' ? m.nameRu : m.nameEn).join(' • ')}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: WEAPONS CARDS LIST (All, Ranged, or Melee) */}
      {(combatSubTab === 'all' || combatSubTab === 'ranged' || combatSubTab === 'melee') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {displayedWeapons.length === 0 ? (
            <div className="col-span-full text-center py-10 bg-zinc-900 border border-zinc-800 rounded-lg text-zinc-500 space-y-2">
              <Crosshair size={32} className="mx-auto text-zinc-600" />
              <p className="text-sm">
                {lang === 'ru' ? 'В данной категории нет оружия' : 'No weapons in this category'}
              </p>
            </div>
          ) : (
            displayedWeapons.map((weapon) => {
              const isMelee = weapon.magCapacity === 0 || weapon.category.includes('Melee');
              const isOutOfAmmo = !isMelee && weapon.currentAmmo <= 0;

              return (
                <div
                  key={weapon.id}
                  className={`bg-zinc-900 border ${
                    isMelee ? 'border-amber-900/60 hover:border-amber-700' : 'border-zinc-800 hover:border-zinc-700'
                  } rounded-lg p-3 sm:p-4 transition flex flex-col justify-between shadow-md`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <h3 className="font-orbitron font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                          {weapon.name}
                          {weapon.concealable && (
                            <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-sans">
                              {lang === 'ru' ? 'Скрытое' : 'Concealable'}
                            </span>
                          )}
                          {isMelee && (
                            <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded font-mono">
                              {lang === 'ru' ? 'Холодное' : 'Melee'}
                            </span>
                          )}
                        </h3>
                        <div className="text-xs text-red-400 font-semibold">{weapon.category}</div>
                      </div>

                      <button
                        onClick={() => handleDeleteWeapon(weapon.id)}
                        className="text-zinc-500 hover:text-red-400 p-1 transition"
                        title={lang === 'ru' ? 'Удалить оружие' : 'Delete weapon'}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>

                    {/* Weapon Stats Badge */}
                    <div className="grid grid-cols-3 gap-2 my-2.5 text-center bg-zinc-950 p-2 rounded border border-zinc-850">
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 block">{t.damage}</span>
                        <span className="font-orbitron font-extrabold text-sm text-yellow-400">
                          {weapon.damage}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 block">{t.rof}</span>
                        <span className="font-orbitron font-extrabold text-sm text-zinc-200">
                          ROF {weapon.standardRof}
                        </span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase text-zinc-500 block">{t.ammo}</span>
                        <span className={`font-orbitron font-extrabold text-sm ${isOutOfAmmo ? 'text-red-500 font-black animate-pulse' : 'text-zinc-200'}`}>
                          {isMelee ? (lang === 'ru' ? '50% SP' : 'Half SP') : `${weapon.currentAmmo} / ${weapon.magCapacity}`}
                        </span>
                      </div>
                    </div>

                    {isMelee && (
                      <div className="text-[11px] text-amber-400/90 mb-1.5 font-semibold flex items-center gap-1">
                        <Swords size={12} />
                        <span>{lang === 'ru' ? 'Игнорирует 50% SP брони цели (парируется DEX + Evasion)' : 'Ignores 50% target SP (opposed by DEX + Evasion)'}</span>
                      </div>
                    )}

                    {weapon.notes && (
                      <div className="text-xs text-zinc-400 mb-2 italic">
                        {weapon.notes}
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2 border-t border-zinc-800">
                    {!isMelee && (
                      <div className="flex items-center gap-1.5">
                        <button
                          disabled={weapon.currentAmmo <= 0}
                          onClick={() => handleFireSingle(weapon.id)}
                          className="flex-1 py-2 sm:py-1 min-h-[36px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold rounded transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                        >
                          {t.fireSingle}
                        </button>
                        {weapon.magCapacity >= 10 && (
                          <button
                            disabled={weapon.currentAmmo < 10}
                            onClick={() => handleFireAutofire(weapon.id)}
                            className="flex-1 py-2 sm:py-1 min-h-[36px] bg-zinc-800 hover:bg-red-950 border border-zinc-700 text-red-300 text-xs font-semibold rounded transition disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {t.fireAutofire}
                          </button>
                        )}
                        <button
                          onClick={() => handleReload(weapon.id)}
                          className="px-2.5 py-2 sm:py-1 min-h-[36px] bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-semibold rounded transition flex items-center justify-center gap-1"
                          title={t.reload}
                        >
                          <RotateCcw size={13} />
                          <span>{t.reload}</span>
                        </button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onRollWeaponAttack(weapon)}
                        className="py-2.5 sm:py-1.5 min-h-[38px] bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 shadow-sm"
                      >
                        <Crosshair size={14} />
                        {isMelee ? (lang === 'ru' ? 'Атака (DEX)' : 'Attack (DEX)') : t.rollAttack}
                      </button>

                      <button
                        onClick={() => onRollWeaponDamage(weapon)}
                        className="py-2.5 sm:py-1.5 min-h-[38px] bg-zinc-800 hover:bg-yellow-950/60 border border-yellow-700/60 text-yellow-300 font-orbitron font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5"
                      >
                        <Flame size={14} />
                        {t.rollDamage} ({weapon.damage})
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Add Weapon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-zinc-900 border-2 border-red-600 w-full max-w-lg rounded-lg shadow-2xl p-4 sm:p-5 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-orbitron font-bold text-red-500 text-sm uppercase">
                {t.addWeapon}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            {/* Presets dropdown */}
            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                {lang === 'ru' ? 'Быстрый шаблон оружия' : 'Quick Weapon Template'}
              </label>
              <select
                onChange={(e) => {
                  const preset = WEAPON_PRESETS.find((p) => p.name === e.target.value);
                  if (preset) handleApplyPreset(preset);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-2 text-zinc-100 text-sm focus:border-red-500 focus:outline-none min-h-[38px]"
              >
                <option value="">{lang === 'ru' ? 'Выберите шаблон...' : 'Select template...'}</option>
                {WEAPON_PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.damage}, ROF {p.standardRof})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.weaponName}
                </label>
                <input
                  type="text"
                  value={newWeapon.name}
                  onChange={(e) => setNewWeapon({ ...newWeapon, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none min-h-[36px]"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.weaponType}
                </label>
                <input
                  type="text"
                  value={newWeapon.category}
                  onChange={(e) => setNewWeapon({ ...newWeapon, category: e.target.value as WeaponCategory })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none min-h-[36px]"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.damage} (e.g. 3d6)
                </label>
                <input
                  type="text"
                  value={newWeapon.damage}
                  onChange={(e) => setNewWeapon({ ...newWeapon, damage: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none min-h-[36px]"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.rof} ({lang === 'ru' ? '1 или 2' : '1 or 2'})
                </label>
                <input
                  type="number"
                  min="1"
                  max="2"
                  value={newWeapon.standardRof}
                  onChange={(e) => setNewWeapon({ ...newWeapon, standardRof: parseInt(e.target.value, 10) || 1 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none min-h-[36px]"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.magCapacity} ({lang === 'ru' ? '0 для холодного' : '0 for melee'})
                </label>
                <input
                  type="number"
                  value={newWeapon.magCapacity}
                  onChange={(e) => setNewWeapon({ ...newWeapon, magCapacity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none min-h-[36px]"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {lang === 'ru' ? 'Тип патронов' : 'Ammo Type'}
                </label>
                <input
                  type="text"
                  value={newWeapon.ammoType}
                  onChange={(e) => setNewWeapon({ ...newWeapon, ammoType: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none min-h-[36px]"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                {t.notes}
              </label>
              <input
                type="text"
                value={newWeapon.notes}
                onChange={(e) => setNewWeapon({ ...newWeapon, notes: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none min-h-[36px]"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded min-h-[36px]"
              >
                {lang === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
              <button
                onClick={handleAddWeapon}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase rounded min-h-[36px]"
              >
                {lang === 'ru' ? 'Добавить' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
