import React, { useState } from 'react';
import { Character, Skill, SkillCategory, StatKey } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { 
  BookOpen, 
  Search, 
  Plus, 
  Dices, 
  Trash2,
  SlidersHorizontal
} from 'lucide-react';

interface SkillsSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onRollSkill: (skill: Skill, effectiveBase: number) => void;
  lang: Language;
  dualTerms: boolean;
}

const CATEGORIES: { key: 'all' | SkillCategory; labelRu: string; labelEn: string }[] = [
  { key: 'all', labelRu: 'Все', labelEn: 'All' },
  { key: 'Awareness', labelRu: 'Внимательность', labelEn: 'Awareness' },
  { key: 'Body', labelRu: 'Тело', labelEn: 'Body' },
  { key: 'Control', labelRu: 'Управление', labelEn: 'Control' },
  { key: 'Education', labelRu: 'Образование', labelEn: 'Education' },
  { key: 'Fighting', labelRu: 'Бой', labelEn: 'Fighting' },
  { key: 'Performance', labelRu: 'Выступление', labelEn: 'Performance' },
  { key: 'Ranged', labelRu: 'Стрельба', labelEn: 'Ranged' },
  { key: 'Social', labelRu: 'Общение', labelEn: 'Social' },
  { key: 'Technique', labelRu: 'Техника', labelEn: 'Technique' },
];

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

  // New custom skill
  const [customNameRu, setCustomNameRu] = useState('');
  const [customNameEn, setCustomNameEn] = useState('');
  const [customStat, setCustomStat] = useState<StatKey>('INT');
  const [customCategory, setCustomCategory] = useState<SkillCategory>('Education');
  const [customMultiplier, setCustomMultiplier] = useState<1 | 2>(1);

  // Wound penalties
  const hpMax = character.hpMaxManual || (10 + 5 * Math.ceil((character.stats.BODY + character.stats.WILL) / 2));
  const seriouslyWoundedThreshold = Math.ceil(hpMax / 2);
  const woundPenalty = character.hpCurrent <= 0 ? -4 : character.hpCurrent <= seriouslyWoundedThreshold ? -2 : 0;

  // Armor penalty
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

  // Filter skills
  const filteredSkills = character.skills.filter((skill) => {
    const matchesCategory = selectedCategory === 'all' || skill.category === selectedCategory;
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      skill.nameRu.toLowerCase().includes(query) ||
      skill.nameEn.toLowerCase().includes(query) ||
      skill.stat.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

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
              ({filteredSkills.length} / {character.skills.length})
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
                className="w-full pl-8 pr-3 py-1.5 bg-zinc-950 border border-zinc-800 rounded text-xs text-zinc-100 placeholder-zinc-500 focus:border-red-500 focus:outline-none"
              />
            </div>

            <button
              onClick={() => {
                sfx.playClick();
                setShowAddCustom(!showAddCustom);
              }}
              title={t.addCustomSkill}
              className="px-2.5 py-1.5 bg-zinc-800 hover:bg-red-600/80 text-zinc-200 hover:text-white border border-zinc-700 rounded text-xs font-semibold flex items-center gap-1 transition"
            >
              <Plus size={14} />
              <span className="hidden sm:inline">{lang === 'ru' ? 'Свой' : 'Custom'}</span>
            </button>
          </div>
        </div>

        {/* Category Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          <SlidersHorizontal size={14} className="text-zinc-500 shrink-0 mr-1" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                sfx.playClick();
                setSelectedCategory(cat.key);
              }}
              className={`px-2.5 py-1 rounded-full whitespace-nowrap transition text-[11px] font-semibold ${
                selectedCategory === cat.key
                  ? 'bg-red-600 text-white shadow-sm shadow-red-950'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-300'
              }`}
            >
              {lang === 'ru' ? cat.labelRu : cat.labelEn}
            </button>
          ))}
        </div>
      </div>

      {/* Add Custom Skill Form */}
      {showAddCustom && (
        <div className="bg-zinc-900 border border-red-800/80 rounded-lg p-3 sm:p-4 shadow-lg space-y-3">
          <span className="font-orbitron font-bold text-xs uppercase text-red-400 block">
            {t.addCustomSkill}
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
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
              {['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'].map((st) => (
                <option key={st} value={st}>
                  {lang === 'ru' ? 'Характеристика:' : 'Stat:'} {st}
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
                className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase rounded"
              >
                {lang === 'ru' ? 'Создать' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Skills Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-2.5">
        {filteredSkills.map((skill) => {
          const statVal = character.stats[skill.stat] || 0;
          const baseRaw = statVal + skill.level;

          // Apply armor penalty to REF and DEX skills
          const isPenalizedByArmor = (skill.stat === 'REF' || skill.stat === 'DEX') && armorPenalty < 0;
          const effectiveBase = baseRaw + (isPenalizedByArmor ? armorPenalty : 0) + woundPenalty;

          return (
            <div
              key={skill.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded p-2.5 flex items-center justify-between gap-2 transition group"
            >
              {/* Skill info */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-xs text-zinc-100 truncate">
                    {lang === 'ru' ? skill.nameRu : skill.nameEn}
                  </span>
                  {skill.multiplier === 2 && (
                    <span
                      className="text-[9px] bg-red-950 text-red-400 border border-red-800 px-1 rounded font-bold cursor-help"
                      title={lang === 'ru' ? 'Сложный навык: улучшение стоит x2 IP (40 IP за уровень)' : 'Difficult Skill: upgrade costs x2 IP (40 IP per level)'}
                    >
                      x2 IP
                    </span>
                  )}
                  {skill.isCustom && (
                    <button
                      onClick={() => handleDeleteCustomSkill(skill.id)}
                      className="text-zinc-600 hover:text-red-400 p-0.5 ml-auto"
                      title={lang === 'ru' ? "Удалить пользовательский навык" : "Delete custom skill"}
                    >
                      <Trash2 size={12} />
                    </button>
                  )}
                </div>

                {/* Subtitle with dual term and stat */}
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 mt-0.5">
                  <span className="font-mono font-bold text-yellow-500/90">{skill.stat} ({statVal})</span>
                  {dualTerms && (
                    <span className="text-zinc-500 truncate">
                      / {lang === 'ru' ? skill.nameEn : skill.nameRu}
                    </span>
                  )}
                </div>
              </div>

              {/* Skill Level adjuster & Total Base */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Level Controls */}
                <div
                  className="flex items-center gap-1 bg-zinc-950 border border-zinc-800 rounded px-1.5 py-0.5"
                  title={
                    skill.level < 10
                      ? lang === 'ru'
                        ? `След. уровень: ${(skill.level + 1) * 20 * skill.multiplier} IP`
                        : `Next level: ${(skill.level + 1) * 20 * skill.multiplier} IP`
                      : (lang === 'ru' ? 'Макс. ранг' : 'Max Rank')
                  }
                >
                  <button
                    onClick={() => handleLevelChange(skill.id, -1)}
                    className="text-zinc-500 hover:text-white font-bold text-xs w-4 text-center"
                  >
                    -
                  </button>
                  <span className="font-orbitron font-bold text-xs text-zinc-200 min-w-[16px] text-center">
                    {skill.level}
                  </span>
                  <button
                    onClick={() => handleLevelChange(skill.id, 1)}
                    className="text-zinc-500 hover:text-white font-bold text-xs w-4 text-center"
                  >
                    +
                  </button>
                </div>

                {/* Effective Base & Roll Button */}
                <button
                  onClick={() => onRollSkill(skill, effectiveBase)}
                  title={`Бросить ${lang === 'ru' ? skill.nameRu : skill.nameEn}: База (${effectiveBase}) + 1d10`}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-mono font-bold border transition ${
                    effectiveBase >= 14
                      ? 'bg-red-950/40 hover:bg-red-600 hover:text-white border-red-700 text-red-300'
                      : 'bg-zinc-950 hover:bg-zinc-800 border-zinc-800 text-zinc-200'
                  }`}
                >
                  <Dices size={13} className="text-red-500" />
                  <span>{effectiveBase}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
