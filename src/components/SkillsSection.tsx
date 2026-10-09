import React, { useState } from 'react';
import { Character, Skill, SkillCategory, StatKey } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { CPR_SKILLS } from '../data/initialData';
import { sfx } from '../utils/audio';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Dices, 
  Trash2,
  SlidersHorizontal,
  ShieldAlert,
  HeartPulse,
  X,
  type LucideIcon,
  // Awareness
  Eye,
  Footprints,
  Focus,
  ScanEye,
  MessageSquareText,
  // Body
  Activity,
  Dumbbell,
  Ghost,
  Music,
  // Control
  Route,
  Car,
  Plane,
  Ship,
  // Education
  Briefcase,
  Calculator,
  FileText,
  Tent,
  Lightbulb,
  MapPin,
  PenTool,
  Fingerprint,
  Binary,
  FlaskConical,
  GraduationCap,
  PawPrint,
  Library,
  Swords,
  Languages,
  // Fighting
  Zap,
  Hand,
  ShieldCheck,
  Sword,
  // Performance
  Drama,
  Music2,
  // Ranged
  Flame,
  Crosshair,
  Target,
  ArrowUpRight,
  Bomb,
  // Social
  Coins,
  Shirt,
  HelpCircle,
  MessagesSquare,
  Compass,
  ScanFace,
  Scale,
  Megaphone,
  Sparkles,
  // Technique
  Lock,
  Palette,
  HandCoins,
  Cpu,
  Hammer,
  Wrench,
  Stethoscope,
  Bandage,
  Anchor,
  FileSignature,
  Camera,
  Terminal
} from 'lucide-react';

interface SkillsSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onRollSkill: (skill: Skill, effectiveBase: number) => void;
  lang: Language;
  dualTerms: boolean;
}

interface CategoryConfig {
  key: SkillCategory;
  translationKey: keyof typeof translations['ru'];
  col: 1 | 2;
}

const CATEGORY_MAP: CategoryConfig[] = [
  // Column 1 (Left Block: 31 skills in official sheet)
  { key: 'Awareness', translationKey: 'catAwareness', col: 1 },
  { key: 'Body', translationKey: 'catBody', col: 1 },
  { key: 'Control', translationKey: 'catControl', col: 1 },
  { key: 'Education', translationKey: 'catEducation', col: 1 },
  // Column 2 (Right Block: 35 skills in official sheet)
  { key: 'Fighting', translationKey: 'catFighting', col: 2 },
  { key: 'Performance', translationKey: 'catPerformance', col: 2 },
  { key: 'Ranged', translationKey: 'catRanged', col: 2 },
  { key: 'Social', translationKey: 'catSocial', col: 2 },
  { key: 'Technique', translationKey: 'catTechnique', col: 2 },
];

export const CATEGORY_ICON_MAP: Record<SkillCategory, LucideIcon> = {
  Awareness: Eye,
  Body: Activity,
  Control: Route,
  Education: GraduationCap,
  Fighting: Swords,
  Performance: Sparkles,
  Ranged: Crosshair,
  Social: MessagesSquare,
  Technique: Wrench,
};

export const SKILL_ICON_MAP: Record<string, LucideIcon> = {
  // Awareness
  perception: Eye,
  tracking: Footprints,
  concentration: Focus,
  conceal_reveal: ScanEye,
  lip_reading: MessageSquareText,

  // Body
  contortionist: Activity,
  athletics: Dumbbell,
  endurance: HeartPulse,
  stealth: Ghost,
  resist_torture: ShieldAlert,
  dance: Music,

  // Control
  riding: Route,
  drive_land: Car,
  pilot_air: Plane,
  pilot_sea: Ship,

  // Education
  gamble: Dices,
  business: Briefcase,
  accounting: Calculator,
  bureaucracy: FileText,
  wilderness_survival: Tent,
  deduction: Lightbulb,
  local_expert: MapPin,
  composition: PenTool,
  criminology: Fingerprint,
  cryptography: Binary,
  science: FlaskConical,
  education: GraduationCap,
  animal_handling: PawPrint,
  library_search: Library,
  tactics: Swords,
  language_streetslang: Languages,

  // Fighting
  martial_arts: Zap,
  brawling: Hand,
  evasion: ShieldCheck,
  melee_weapon: Sword,

  // Performance
  acting: Drama,
  play_instrument: Music2,

  // Ranged
  autofire: Flame,
  shoulder_arms: Crosshair,
  handgun: Target,
  archery: ArrowUpRight,
  heavy_weapons: Bomb,

  // Social
  bribery: Coins,
  wardrobe_style: Shirt,
  interrogation: HelpCircle,
  conversation: MessagesSquare,
  streetwise: Compass,
  human_perception: ScanFace,
  trading: Scale,
  persuasion: Megaphone,
  personal_grooming: Sparkles,

  // Technique
  air_vehicle_tech: Plane,
  land_vehicle_tech: Car,
  pick_lock: Lock,
  demolitions: Bomb,
  paint_draw_sculpt: Palette,
  pick_pocket: HandCoins,
  cybertech: Cpu,
  weaponstech: Hammer,
  basic_tech: Wrench,
  paramedic: Stethoscope,
  first_aid: Bandage,
  sea_vehicle_tech: Anchor,
  forgery: FileSignature,
  photography_film: Camera,
  electronics_security: Terminal,
};

const STAT_DISPLAY_RU: Record<StatKey, string> = {
  INT: 'ИНТ',
  REF: 'РЕФ',
  DEX: 'ЛВК',
  TECH: 'ТЕХ',
  COOL: 'КРУТ',
  WILL: 'ВОЛЯ',
  LUCK: 'УДЧ',
  MOVE: 'СКО',
  BODY: 'ТЕЛО',
  EMP: 'ЭМП',
};

export const SkillsSection: React.FC<SkillsSectionProps> = ({
  character,
  onUpdateCharacter,
  onRollSkill,
  lang,
  dualTerms
}) => {
  const t = translations[lang];
  const [selectedCategory, setSelectedCategory] = useState<'all' | SkillCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddCustom, setShowAddCustom] = useState(false);

  // New custom skill inputs
  const [customNameRu, setCustomNameRu] = useState('');
  const [customNameEn, setCustomNameEn] = useState('');
  const [customStat, setCustomStat] = useState<StatKey>('INT');
  const [customCategory, setCustomCategory] = useState<SkillCategory>('Education');
  const [customMultiplier, setCustomMultiplier] = useState<1 | 2>(1);

  // Wound penalties
  const hpMax = character.hpMaxManual || (10 + 5 * Math.ceil((character.stats.BODY + character.stats.WILL) / 2));
  const seriouslyWoundedThreshold = Math.ceil(hpMax / 2);
  const woundPenalty = character.hpCurrent <= 0 ? -4 : character.hpCurrent <= seriouslyWoundedThreshold ? -2 : 0;

  // Armor penalty (applies to REF and DEX)
  const armorPenalty = Math.min(character.armor.head.penalty || 0, character.armor.body.penalty || 0);

  const handleLevelChange = (skillId: string, delta: number) => {
    sfx.playClick();
    const updated = character.skills.map((s) => {
      if (s.id === skillId) {
        return { ...s, level: Math.max(0, Math.min(10, s.level + delta)) };
      }
      return s;
    });
    onUpdateCharacter({ ...character, skills: updated });
  };

  const handleAddCustomSkill = () => {
    if (!customNameRu.trim() && !customNameEn.trim()) return;
    sfx.playClick();
    const newSkill: Skill = {
      id: 'custom-' + Date.now(),
      nameRu: customNameRu.trim() || customNameEn.trim(),
      nameEn: customNameEn.trim() || customNameRu.trim(),
      stat: customStat,
      level: 0,
      category: customCategory,
      multiplier: customMultiplier,
      isCustom: true
    };
    onUpdateCharacter({
      ...character,
      skills: [...character.skills, newSkill]
    });
    setCustomNameRu('');
    setCustomNameEn('');
    setShowAddCustom(false);
  };

  const handleDeleteCustomSkill = (skillId: string) => {
    sfx.playClick();
    const updated = character.skills.filter((s) => s.id !== skillId);
    onUpdateCharacter({ ...character, skills: updated });
  };

  // Helper to get canonical name and details for a skill
  const getSkillDetails = (skill: Skill) => {
    const canonical = CPR_SKILLS.find((c) => c.id === skill.id);
    const nameRu = canonical ? canonical.nameRu : skill.nameRu;
    const nameEn = canonical ? canonical.nameEn : skill.nameEn;
    const multiplier = canonical ? canonical.multiplier : (skill.multiplier || 1);

    const statVal = character.stats[skill.stat] || 0;
    const isPenalizedByArmor = (skill.stat === 'REF' || skill.stat === 'DEX') && armorPenalty < 0;
    const effectiveStat = statVal + (isPenalizedByArmor ? armorPenalty : 0);
    const effectiveBase = effectiveStat + skill.level + woundPenalty;

    return {
      nameRu,
      nameEn,
      multiplier,
      statVal,
      isPenalizedByArmor,
      effectiveStat,
      effectiveBase,
    };
  };

  // Check if a skill matches search query
  const matchesSearch = (skill: Skill) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.trim().toLowerCase();
    const { nameRu, nameEn } = getSkillDetails(skill);
    const statRu = STAT_DISPLAY_RU[skill.stat]?.toLowerCase() || '';
    return (
      nameRu.toLowerCase().includes(query) ||
      nameEn.toLowerCase().includes(query) ||
      skill.stat.toLowerCase().includes(query) ||
      statRu.includes(query)
    );
  };

  // Render an individual category table
  const renderCategoryTable = (catConfig: CategoryConfig) => {
    const categoryTitle = (t[catConfig.translationKey] as string) || catConfig.key;
    const CategoryIcon = CATEGORY_ICON_MAP[catConfig.key] || BookOpen;
    
    // Filter and sort skills belonging to this category
    const skillsInCat = character.skills.filter((s) => s.category === catConfig.key);
    
    // Sort to match official sheet order (canonical order from CPR_SKILLS)
    const sortedSkills = [...skillsInCat].sort((a, b) => {
      const idxA = CPR_SKILLS.findIndex((cs) => cs.id === a.id);
      const idxB = CPR_SKILLS.findIndex((cs) => cs.id === b.id);
      if (idxA !== -1 && idxB !== -1) return idxA - idxB;
      if (idxA !== -1) return -1;
      if (idxB !== -1) return 1;
      return a.nameRu.localeCompare(b.nameRu);
    });

    const visibleSkills = sortedSkills.filter(matchesSearch);

    // If searching and this category has no matches, omit it
    if (searchQuery.trim() && visibleSkills.length === 0) {
      return null;
    }

    return (
      <div 
        key={catConfig.key}
        className="border border-red-700/80 rounded-md overflow-hidden bg-zinc-900/95 shadow-md flex flex-col"
      >
        {/* Category Header */}
        <div className="flex items-center justify-between bg-zinc-950 px-3 py-2 border-b border-red-700/80">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-1.5 h-3.5 bg-red-600 rounded-xs shrink-0" />
            <CategoryIcon size={14} className="text-red-500 shrink-0" />
            <h3 className="font-orbitron font-bold text-xs sm:text-sm text-red-500 uppercase tracking-wider truncate">
              {categoryTitle}
            </h3>
            <span className="text-[10px] text-zinc-500 font-mono shrink-0">
              ({visibleSkills.length})
            </span>
          </div>

          {/* Table Column Labels */}
          <div className="flex items-center text-[11px] font-mono font-bold text-zinc-400 shrink-0 select-none">
            <span className="w-16 sm:w-20 text-center tracking-wide">{t.skillColLevel || 'УР'}</span>
            <span className="w-9 sm:w-10 text-center tracking-wide">{t.skillColStat || 'ХАР'}</span>
            <span className="w-11 sm:w-12 text-center text-red-400 tracking-wide">{t.skillColBase || 'ОСН'}</span>
          </div>
        </div>

        {/* Skill Rows */}
        <div className="divide-y divide-zinc-800/60">
          {visibleSkills.length === 0 ? (
            <div className="px-3 py-2 text-center text-xs text-zinc-500 italic">
              {lang === 'ru' ? 'Нет навыков' : 'No skills'}
            </div>
          ) : (
            visibleSkills.map((skill) => {
              const {
                nameRu,
                nameEn,
                multiplier,
                statVal,
                isPenalizedByArmor,
                effectiveStat,
                effectiveBase
              } = getSkillDetails(skill);

              const SkillIcon = SKILL_ICON_MAP[skill.id] || CATEGORY_ICON_MAP[skill.category] || BookOpen;

              return (
                <div
                  key={skill.id}
                  className="flex items-center justify-between px-2.5 sm:px-3 py-1.5 hover:bg-zinc-800/40 transition group"
                >
                  {/* Left: Skill icon + Skill title + stat badge + dual term */}
                  <div className="min-w-0 flex-1 pr-2 flex items-center gap-2">
                    <div className="w-5 h-5 rounded flex items-center justify-center bg-zinc-950/70 border border-zinc-800/80 group-hover:border-red-900/60 group-hover:bg-red-950/20 shrink-0 transition">
                      <SkillIcon size={12} className="text-red-400/80 group-hover:text-red-300 shrink-0 transition" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center flex-wrap gap-x-1.5 gap-y-0.5">
                        <span className={`text-xs transition ${
                          skill.level > 0 ? 'font-bold text-zinc-100 group-hover:text-red-300' : 'font-medium text-zinc-300 group-hover:text-zinc-100'
                        }`}>
                          {lang === 'ru' ? nameRu : nameEn}
                        </span>

                        {multiplier === 2 && (
                          <span
                            className="text-[9px] font-bold text-red-400 bg-red-950/80 border border-red-800 px-1 py-0.2 rounded shrink-0 cursor-help"
                            title={t.x2Notice}
                          >
                            (х2)
                          </span>
                        )}

                        <span className="text-[10px] font-mono font-bold text-amber-500/90 shrink-0">
                          ({lang === 'ru' ? STAT_DISPLAY_RU[skill.stat] : skill.stat})
                        </span>

                        {skill.isCustom && (
                          <button
                            onClick={() => handleDeleteCustomSkill(skill.id)}
                            className="text-zinc-600 hover:text-red-400 p-0.5 transition"
                            title={lang === 'ru' ? 'Удалить навык' : 'Delete skill'}
                          >
                            <Trash2 size={11} />
                          </button>
                        )}
                      </div>

                      {dualTerms && (
                        <div className="text-[10px] text-zinc-500 truncate leading-tight mt-0.5">
                          {lang === 'ru' ? nameEn : nameRu}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Stepper (УР), Stat (ХАР), Roll Button (ОСН) */}
                  <div className="flex items-center shrink-0">
                    {/* Stepper (УР) */}
                    <div
                      className="w-16 sm:w-20 flex items-center justify-center gap-0.5"
                      title={
                        skill.level < 10
                          ? lang === 'ru'
                            ? `След. уровень: ${(skill.level + 1) * 20 * multiplier} IP`
                            : `Next rank: ${(skill.level + 1) * 20 * multiplier} IP`
                          : (lang === 'ru' ? 'Макс. ранг (10)' : 'Max Rank (10)')
                      }
                    >
                      <button
                        onClick={() => handleLevelChange(skill.id, -1)}
                        disabled={skill.level <= 0}
                        className="w-5 h-6 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-400 hover:bg-zinc-800 rounded text-xs font-bold transition active:scale-95 touch-manipulation"
                      >
                        -
                      </button>
                      <span className={`w-5 min-w-[20px] text-center font-orbitron font-bold text-xs ${
                        skill.level > 0 ? 'text-zinc-100' : 'text-zinc-500'
                      }`}>
                        {skill.level}
                      </span>
                      <button
                        onClick={() => handleLevelChange(skill.id, 1)}
                        disabled={skill.level >= 10}
                        className="w-5 h-6 flex items-center justify-center text-zinc-400 hover:text-white disabled:opacity-20 disabled:hover:text-zinc-400 hover:bg-zinc-800 rounded text-xs font-bold transition active:scale-95 touch-manipulation"
                      >
                        +
                      </button>
                    </div>

                    {/* Stat (ХАР) */}
                    <div className="w-9 sm:w-10 text-center font-mono font-bold text-xs select-none">
                      {isPenalizedByArmor ? (
                        <span className="text-amber-400 cursor-help" title={`База ${statVal} + Штраф брони ${armorPenalty}`}>
                          {effectiveStat}
                        </span>
                      ) : (
                        <span className="text-zinc-300">
                          {statVal}
                        </span>
                      )}
                    </div>

                    {/* Roll Base (ОСН) */}
                    <div className="w-11 sm:w-12 flex items-center justify-center">
                      <button
                        onClick={() => onRollSkill(skill, effectiveBase)}
                        title={`${lang === 'ru' ? 'Бросить' : 'Roll'} ${lang === 'ru' ? nameRu : nameEn}: 1d10 + ${effectiveBase}`}
                        className={`w-full py-1 min-h-[26px] flex items-center justify-center gap-0.5 rounded font-mono font-bold text-xs border transition active:scale-95 select-none ${
                          effectiveBase >= 14
                            ? 'bg-red-950/70 hover:bg-red-600 hover:text-white border-red-700 text-red-200 shadow-xs'
                            : 'bg-zinc-950 hover:bg-red-900/60 hover:text-white border-zinc-800 hover:border-red-700 text-zinc-200'
                        }`}
                      >
                        <Dices size={11} className="text-red-400 shrink-0 hidden sm:inline" />
                        <span>{effectiveBase}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    );
  };

  // Group categories into Column 1 & Column 2
  const col1Categories = CATEGORY_MAP.filter((c) => c.col === 1);
  const col2Categories = CATEGORY_MAP.filter((c) => c.col === 2);

  // Filtered categories when a specific one is selected
  const activeCategoryConfig = selectedCategory === 'all' 
    ? null 
    : CATEGORY_MAP.find((c) => c.key === selectedCategory);

  return (
    <div className="space-y-4">
      {/* Top Filter & Search Controls */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BookOpen size={18} className="text-red-500" />
            <h2 className="font-orbitron font-bold text-sm text-red-500 uppercase tracking-wider">
              {t.skillsTitle}
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              ({character.skills.length})
            </span>
          </div>

          <div className="flex items-center gap-2 flex-1 max-w-sm ml-auto">
            <div className="relative w-full">
              <Search size={14} className="absolute left-2.5 top-2.5 text-zinc-500" />
              <input
                type="text"
                placeholder={t.searchSkills}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:border-red-500 focus:outline-none"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-2 text-zinc-500 hover:text-zinc-200"
                >
                  <X size={13} />
                </button>
              )}
            </div>

            <button
              onClick={() => {
                sfx.playClick();
                setShowAddCustom(!showAddCustom);
              }}
              title={t.addCustomSkill}
              className={`px-2.5 py-1.5 border rounded text-xs font-semibold flex items-center gap-1 transition ${
                showAddCustom
                  ? 'bg-red-600 text-white border-red-500'
                  : 'bg-zinc-800 hover:bg-red-600/80 text-zinc-200 hover:text-white border-zinc-700'
              }`}
            >
              <Plus size={14} />
              <span className="hidden sm:inline">{lang === 'ru' ? 'Свой' : 'Custom'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x scrollbar-none pb-1 text-xs -mx-1 px-1">
          <SlidersHorizontal size={14} className="text-zinc-500 shrink-0 mr-1" />
          <button
            onClick={() => {
              sfx.playClick();
              setSelectedCategory('all');
            }}
            className={`px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition text-[11px] font-semibold min-h-[30px] flex items-center justify-center gap-1.5 ${
              selectedCategory === 'all'
                ? 'bg-red-600 text-white shadow-sm shadow-red-950'
                : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
            }`}
          >
            <BookOpen size={12} className="shrink-0" />
            <span>{t.allCategories}</span>
          </button>
          {CATEGORY_MAP.map((cat) => {
            const CatIcon = CATEGORY_ICON_MAP[cat.key];
            return (
              <button
                key={cat.key}
                onClick={() => {
                  sfx.playClick();
                  setSelectedCategory(cat.key);
                }}
                className={`px-3 py-1.5 rounded-full whitespace-nowrap shrink-0 transition text-[11px] font-semibold min-h-[30px] flex items-center justify-center gap-1.5 ${
                  selectedCategory === cat.key
                    ? 'bg-red-600 text-white shadow-sm shadow-red-950'
                    : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
                }`}
              >
                {CatIcon && <CatIcon size={12} className="shrink-0" />}
                <span>{t[cat.translationKey] as string}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Warnings & Modifiers notices */}
      {(woundPenalty < 0 || armorPenalty < 0) && (
        <div className="flex flex-wrap gap-2 text-xs">
          {woundPenalty < 0 && (
            <div className="bg-red-950/50 border border-red-800 rounded px-2.5 py-1 text-red-300 flex items-center gap-1.5">
              <HeartPulse size={13} className="text-red-400" />
              <span>
                {lang === 'ru' 
                  ? `Штраф ранений: ${woundPenalty} ко всем навыкам` 
                  : `Wound penalty: ${woundPenalty} to all skills`}
              </span>
            </div>
          )}
          {armorPenalty < 0 && (
            <div className="bg-amber-950/40 border border-amber-800 rounded px-2.5 py-1 text-amber-300 flex items-center gap-1.5">
              <ShieldAlert size={13} className="text-amber-400" />
              <span>
                {lang === 'ru' 
                  ? `Штраф брони: ${armorPenalty} к навыкам РЕФ и ЛВК` 
                  : `Armor penalty: ${armorPenalty} to REF & DEX skills`}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Add Custom Skill Form */}
      {showAddCustom && (
        <div className="bg-zinc-900 border border-red-800/80 rounded-lg p-3 sm:p-4 shadow-lg space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <span className="font-orbitron font-bold text-xs uppercase text-red-400">
              {t.addCustomSkill}
            </span>
            <button
              onClick={() => setShowAddCustom(false)}
              className="text-zinc-500 hover:text-zinc-200"
            >
              <X size={14} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5">
            <input
              type="text"
              placeholder={lang === 'ru' ? "Название (RU)" : "Name (RU)"}
              value={customNameRu}
              onChange={(e) => setCustomNameRu(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
            />
            <input
              type="text"
              placeholder="Name (EN)"
              value={customNameEn}
              onChange={(e) => setCustomNameEn(e.target.value)}
              className="bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
            />
            <select
              value={customStat}
              onChange={(e) => setCustomStat(e.target.value as StatKey)}
              className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100"
            >
              {(['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'] as StatKey[]).map((st) => (
                <option key={st} value={st}>
                  {lang === 'ru' ? 'Хар-ка:' : 'Stat:'} {st} ({STAT_DISPLAY_RU[st]})
                </option>
              ))}
            </select>
            <select
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value as SkillCategory)}
              className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100"
            >
              {CATEGORY_MAP.map((cat) => (
                <option key={cat.key} value={cat.key}>
                  {t[cat.translationKey] as string}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <select
                value={customMultiplier}
                onChange={(e) => setCustomMultiplier(parseInt(e.target.value, 10) as 1 | 2)}
                className="bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100 flex-1"
              >
                <option value={1}>1x IP</option>
                <option value={2}>2x IP</option>
              </select>
              <button
                onClick={handleAddCustomSkill}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase rounded transition"
              >
                {lang === 'ru' ? 'Создать' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skills Display */}
      {selectedCategory === 'all' ? (
        /* Official CPR Sheet Two-Column Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          {/* Column 1: Awareness, Body, Control, Education */}
          <div className="space-y-4">
            {col1Categories.map((cat) => renderCategoryTable(cat))}
          </div>

          {/* Column 2: Fighting, Performance, Ranged, Social, Technique */}
          <div className="space-y-4">
            {col2Categories.map((cat) => renderCategoryTable(cat))}
          </div>
        </div>
      ) : (
        /* Focused Single Category View */
        <div className="max-w-4xl mx-auto">
          {activeCategoryConfig && renderCategoryTable(activeCategoryConfig)}
        </div>
      )}
    </div>
  );
};
