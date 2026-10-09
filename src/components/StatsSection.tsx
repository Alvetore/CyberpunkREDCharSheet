import React from 'react';
import { Character, StatKey, RoleType } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { 
  Heart, 
  Brain, 
  ShieldAlert, 
  Sparkles, 
  RotateCcw, 
  Dices, 
  Flame, 
  Skull,
  Zap,
  HeartCrack
} from 'lucide-react';

interface StatsSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onRollStat: (statKey: StatKey, statVal: number) => void;
  onRollInitiative: () => void;
  onRollDeathSave: () => void;
  onOpenDamageCalc: () => void;
  lang: Language;
}

const STAT_ORDER: StatKey[] = ['INT', 'REF', 'DEX', 'TECH', 'COOL', 'WILL', 'LUCK', 'MOVE', 'BODY', 'EMP'];

const ROLES: RoleType[] = [
  'Solo',
  'Netrunner',
  'Tech',
  'Medtech',
  'Rockerboy',
  'Media',
  'Lawman',
  'Exec',
  'Fixer',
  'Nomad'
];

export const StatsSection: React.FC<StatsSectionProps> = ({
  character,
  onUpdateCharacter,
  onRollStat,
  onRollInitiative,
  onRollDeathSave,
  onOpenDamageCalc,
  lang
}) => {
  const t = translations[lang];

  // Derived formulas
  const hpMax = character.hpMaxManual || (10 + 5 * Math.ceil((character.stats.BODY + character.stats.WILL) / 2));
  const seriouslyWoundedThreshold = Math.ceil(hpMax / 2);

  // Humanity
  const humanityMax = character.humanityMaxManual || (character.stats.EMP * 10);
  const currentEmp = Math.max(0, Math.floor(character.humanityCurrent / 10));

  // Armor penalty
  const armorPenalty = Math.min(
    character.armor.head.penalty || 0,
    character.armor.body.penalty || 0
  );

  // Wound state
  const isMortallyWounded = character.hpCurrent <= 0;
  const isSeriouslyWounded = !isMortallyWounded && character.hpCurrent <= seriouslyWoundedThreshold;

  const handleStatChange = (key: StatKey, delta: number) => {
    sfx.playClick();
    const current = character.stats[key];
    const newVal = Math.max(1, Math.min(10, current + delta));
    const updatedStats = { ...character.stats, [key]: newVal };

    // Auto update luck max if luck changed
    const luckCurrent = key === 'LUCK' ? Math.min(character.luckCurrent, newVal) : character.luckCurrent;

    onUpdateCharacter({
      ...character,
      stats: updatedStats,
      luckCurrent
    });
  };

  const handleHpChange = (delta: number) => {
    sfx.playClick();
    const newHp = Math.max(0, Math.min(hpMax, character.hpCurrent + delta));
    onUpdateCharacter({
      ...character,
      hpCurrent: newHp
    });
  };

  const handleHumanityChange = (delta: number) => {
    sfx.playClick();
    const newHumanity = Math.max(0, Math.min(humanityMax, character.humanityCurrent + delta));
    onUpdateCharacter({
      ...character,
      humanityCurrent: newHumanity
    });
  };

  const hpPercent = Math.max(0, Math.min(100, Math.round((character.hpCurrent / hpMax) * 100)));
  const humanityPercent = Math.max(0, Math.min(100, Math.round((character.humanityCurrent / humanityMax) * 100)));

  return (
    <div className="space-y-4">
      {/* Character Identity Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end">
          {/* Name */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
              {t.name}
            </label>
            <input
              type="text"
              value={character.name}
              onChange={(e) => onUpdateCharacter({ ...character, name: e.target.value })}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded px-3 py-1.5 text-zinc-100 font-bold text-sm focus:outline-none"
            />
          </div>

          {/* Handle */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-red-400 block mb-1">
              {t.handle}
            </label>
            <input
              type="text"
              value={character.handle}
              onChange={(e) => onUpdateCharacter({ ...character, handle: e.target.value })}
              className="w-full bg-zinc-950 border border-red-900/60 focus:border-red-500 rounded px-3 py-1.5 text-red-200 font-bold text-sm focus:outline-none"
            />
          </div>

          {/* Role */}
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
              {t.role}
            </label>
            <select
              value={character.role}
              onChange={(e) => onUpdateCharacter({ ...character, role: e.target.value as RoleType })}
              className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded px-3 py-1.5 text-zinc-100 font-bold text-sm focus:outline-none"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {/* Role Rank & Initiative */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 block mb-1">
                {t.roleRank}
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={character.roleRank}
                onChange={(e) => onUpdateCharacter({ ...character, roleRank: parseInt(e.target.value, 10) || 1 })}
                className="w-full bg-zinc-950 border border-zinc-800 focus:border-red-500 rounded px-2.5 py-1.5 text-zinc-100 font-bold text-sm text-center focus:outline-none"
              />
            </div>

            <div className="flex-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-yellow-400 block mb-1">
                {t.initiative}
              </label>
              <button
                type="button"
                onClick={onRollInitiative}
                className="w-full bg-zinc-950 hover:bg-yellow-950/40 border border-yellow-700/60 text-yellow-300 font-bold text-sm py-1.5 rounded flex items-center justify-center gap-1 transition"
                title={`${t.rollInitiative}: REF (${character.stats.REF}) + 1d10`}
              >
                <Zap size={13} />
                <span>{character.stats.REF + armorPenalty}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Vital Stats Cards: HP, Humanity, Luck, Death Save */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* HP CARD */}
        <div
          className={`bg-zinc-900 border rounded-lg p-3 sm:p-3.5 relative overflow-hidden transition-all ${
            isMortallyWounded
              ? 'border-red-600 bg-red-950/30 ring-1 ring-red-500'
              : isSeriouslyWounded
              ? 'border-amber-500 bg-amber-950/20'
              : 'border-zinc-800'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs uppercase text-red-400">
              <Heart size={15} />
              <span>{t.hp}</span>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              {lang === 'ru' ? 'Порог:' : 'Threshold:'} {seriouslyWoundedThreshold}
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="font-orbitron font-black text-2xl text-white">
              {character.hpCurrent}
              <span className="text-zinc-500 text-sm font-semibold"> / {hpMax}</span>
            </span>

            {/* Status indicator */}
            {isMortallyWounded ? (
              <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[10px] tracking-wider uppercase rounded flex items-center gap-1 animate-pulse">
                <Skull size={12} /> {t.mortallyWounded}
              </span>
            ) : isSeriouslyWounded ? (
              <span className="px-2 py-0.5 bg-amber-600 text-black font-black text-[10px] tracking-wider uppercase rounded flex items-center gap-1">
                <ShieldAlert size={12} /> {t.seriouslyWounded}
              </span>
            ) : (
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800 font-bold text-[10px] uppercase rounded">
                {lang === 'ru' ? 'Норма' : 'Normal'}
              </span>
            )}
          </div>

          {/* HP Bar */}
          <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800 mb-2">
            <div
              className={`h-full transition-all ${
                isMortallyWounded
                  ? 'bg-red-600'
                  : isSeriouslyWounded
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${hpPercent}%` }}
            />
          </div>

          {/* Quick HP adjusters */}
          <div className="flex items-center justify-between gap-1 text-xs">
            <button
              onClick={() => handleHpChange(-5)}
              className="flex-1 py-1.5 sm:py-0.5 min-h-[32px] sm:min-h-[26px] bg-zinc-800 hover:bg-red-900 border border-zinc-700 text-red-300 rounded font-mono font-bold text-center"
            >
              -5
            </button>
            <button
              onClick={() => handleHpChange(-1)}
              className="flex-1 py-1.5 sm:py-0.5 min-h-[32px] sm:min-h-[26px] bg-zinc-800 hover:bg-red-900 border border-zinc-700 text-red-300 rounded font-mono font-bold text-center"
            >
              -1
            </button>
            <button
              onClick={() => handleHpChange(1)}
              className="flex-1 py-1.5 sm:py-0.5 min-h-[32px] sm:min-h-[26px] bg-zinc-800 hover:bg-emerald-900 border border-zinc-700 text-emerald-300 rounded font-mono font-bold text-center"
            >
              +1
            </button>
            <button
              onClick={() => handleHpChange(5)}
              className="flex-1 py-1.5 sm:py-0.5 min-h-[32px] sm:min-h-[26px] bg-zinc-800 hover:bg-emerald-900 border border-zinc-700 text-emerald-300 rounded font-mono font-bold text-center"
            >
              +5
            </button>
          </div>

          {isSeriouslyWounded && (
            <div className="mt-2 text-[10px] text-amber-400 font-semibold text-center">
              {t.seriouslyWoundedEffect}
            </div>
          )}
          {isMortallyWounded && (
            <div className="mt-2 text-[10px] text-red-400 font-bold text-center">
              {t.mortallyWoundedEffect}
            </div>
          )}

          {/* Damage Calculator button */}
          <div className="pt-2 mt-2 border-t border-zinc-800">
            <button
              onClick={() => {
                sfx.playClick();
                onOpenDamageCalc();
              }}
              className="w-full py-1.5 sm:py-1 min-h-[34px] bg-red-950/60 hover:bg-red-800 border border-red-700/80 text-red-300 hover:text-white rounded text-[11px] font-bold font-orbitron uppercase tracking-wider flex items-center justify-center gap-1.5 transition shadow-sm"
            >
              <HeartCrack size={13} />
              <span>{lang === 'ru' ? 'Расчет урона и абляции' : 'Damage & Ablation Calc'}</span>
            </button>
          </div>
        </div>

        {/* HUMANITY CARD */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs uppercase text-cyan-400">
              <Brain size={15} />
              <span>{t.humanity}</span>
            </div>
            <span className="font-orbitron font-black text-xs text-cyan-300">
              EMP: {currentEmp} <span className="text-zinc-500 font-normal">/ {character.stats.EMP}</span>
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="font-orbitron font-black text-2xl text-white">
              {character.humanityCurrent}
              <span className="text-zinc-500 text-sm font-semibold"> / {humanityMax}</span>
            </span>
            <span className="text-xs text-zinc-400 font-mono">
              {humanityPercent}%
            </span>
          </div>

          {/* Humanity Bar */}
          <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800 mb-2">
            <div
              className="h-full bg-cyan-500 transition-all"
              style={{ width: `${humanityPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between gap-1 text-xs">
            <button
              onClick={() => handleHumanityChange(-5)}
              className="flex-1 py-1.5 sm:py-0.5 min-h-[32px] sm:min-h-[26px] bg-zinc-800 hover:bg-cyan-900 border border-zinc-700 text-cyan-300 rounded font-mono font-bold text-center"
            >
              -5
            </button>
            <button
              onClick={() => handleHumanityChange(-1)}
              className="flex-1 py-1.5 sm:py-0.5 min-h-[32px] sm:min-h-[26px] bg-zinc-800 hover:bg-cyan-900 border border-zinc-700 text-cyan-300 rounded font-mono font-bold text-center"
            >
              -1
            </button>
            <button
              onClick={() => handleHumanityChange(1)}
              className="flex-1 py-1.5 sm:py-0.5 min-h-[32px] sm:min-h-[26px] bg-zinc-800 hover:bg-cyan-900 border border-zinc-700 text-cyan-300 rounded font-mono font-bold text-center"
            >
              +1
            </button>
            <button
              onClick={() => handleHumanityChange(5)}
              className="flex-1 py-1.5 sm:py-0.5 min-h-[32px] sm:min-h-[26px] bg-zinc-800 hover:bg-cyan-900 border border-zinc-700 text-cyan-300 rounded font-mono font-bold text-center"
            >
              +5
            </button>
          </div>
        </div>

        {/* LUCK POINTS CARD */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs uppercase text-yellow-400">
              <Sparkles size={15} />
              <span>{t.luckPoints}</span>
            </div>
            <button
              onClick={() => {
                sfx.playClick();
                onUpdateCharacter({ ...character, luckCurrent: character.stats.LUCK });
              }}
              className="text-xs text-zinc-400 hover:text-yellow-400 flex items-center gap-1 transition min-h-[24px]"
              title={t.resetLuck}
            >
              <RotateCcw size={12} />
              <span>{lang === 'ru' ? 'Сброс' : 'Reset'}</span>
            </button>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="font-orbitron font-black text-2xl text-yellow-300">
              {character.luckCurrent}
              <span className="text-zinc-500 text-sm font-semibold"> / {character.stats.LUCK}</span>
            </span>
          </div>

          <div className="w-full bg-zinc-950 h-2.5 rounded-full overflow-hidden border border-zinc-800 mb-2">
            <div
              className="h-full bg-yellow-400 transition-all"
              style={{
                width: `${Math.round((character.luckCurrent / Math.max(1, character.stats.LUCK)) * 100)}%`
              }}
            />
          </div>

          <div className="flex items-center justify-between gap-1 text-xs">
            <button
              disabled={character.luckCurrent <= 0}
              onClick={() => {
                sfx.playClick();
                onUpdateCharacter({ ...character, luckCurrent: Math.max(0, character.luckCurrent - 1) });
              }}
              className="flex-1 py-1.5 sm:py-0.5 min-h-[34px] bg-zinc-800 hover:bg-yellow-900 border border-zinc-700 text-yellow-300 rounded font-bold transition disabled:opacity-40"
            >
              {lang === 'ru' ? '-1 Потратить' : '-1 Spend'}
            </button>
            <button
              disabled={character.luckCurrent >= character.stats.LUCK}
              onClick={() => {
                sfx.playClick();
                onUpdateCharacter({
                  ...character,
                  luckCurrent: Math.min(character.stats.LUCK, character.luckCurrent + 1)
                });
              }}
              className="flex-1 py-1.5 sm:py-0.5 min-h-[34px] bg-zinc-800 hover:bg-yellow-900 border border-zinc-700 text-yellow-300 rounded font-bold transition disabled:opacity-40"
            >
              {lang === 'ru' ? '+1 Добавить' : '+1 Add'}
            </button>
          </div>
        </div>

        {/* DEATH SAVE CARD */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-3.5">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs uppercase text-red-500">
              <Skull size={15} />
              <span>{t.deathSave}</span>
            </div>
            <span className="font-mono text-xs text-zinc-400">
              {lang === 'ru' ? 'Штраф: +' : 'Penalty: +'}{character.deathSavePenalties}
            </span>
          </div>

          <div className="flex items-baseline justify-between mb-2">
            <span className="font-orbitron font-black text-2xl text-white">
              {character.stats.BODY}
              <span className="text-red-400 text-sm font-semibold">
                {character.deathSavePenalties > 0 ? ` (+${character.deathSavePenalties})` : ''}
              </span>
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => {
                  sfx.playClick();
                  onUpdateCharacter({
                    ...character,
                    deathSavePenalties: Math.max(0, character.deathSavePenalties - 1)
                  });
                }}
                className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-zinc-300 flex items-center justify-center font-bold text-sm"
              >
                -
              </button>
              <button
                onClick={() => {
                  sfx.playClick();
                  onUpdateCharacter({
                    ...character,
                    deathSavePenalties: character.deathSavePenalties + 1
                  });
                }}
                className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-red-900 rounded text-red-300 flex items-center justify-center font-bold text-sm"
              >
                +
              </button>
            </div>
          </div>

          <button
            onClick={onRollDeathSave}
            className="w-full py-2 sm:py-1.5 min-h-[36px] bg-red-900/60 hover:bg-red-800 border border-red-700 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 shadow-sm"
          >
            <Dices size={14} />
            {t.rollDeathSave}
          </button>
        </div>
      </div>

      {/* 10 Core Stats Grid */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4">
        <div className="flex items-center justify-between mb-3 border-b border-zinc-800 pb-2">
          <h2 className="font-orbitron font-bold text-sm text-red-500 uppercase tracking-wider flex items-center gap-2">
            <Flame size={16} />
            {t.statsTitle}
          </h2>
          {armorPenalty < 0 && (
            <span className="text-xs text-red-400 font-semibold">
              {t.armorPenaltyNotice}: {armorPenalty}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 gap-2">
          {STAT_ORDER.map((statKey) => {
            const rawVal = character.stats[statKey];
            const isPenalized = (statKey === 'REF' || statKey === 'DEX' || statKey === 'MOVE') && armorPenalty < 0;
            const effectiveVal = isPenalized ? Math.max(1, rawVal + armorPenalty) : rawVal;

            return (
              <div
                key={statKey}
                className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded p-2 text-center flex flex-col justify-between group transition"
              >
                <div>
                  <div className="font-orbitron font-extrabold text-sm text-red-500 tracking-wider">
                    {statKey}
                  </div>
                  <div className="text-[10px] text-zinc-400 truncate" title={t[statKey]}>
                    {t[statKey]}
                  </div>
                </div>

                <div className="my-2">
                  <span className={`font-orbitron font-black text-2xl ${isPenalized ? 'text-amber-400' : 'text-white'}`}>
                    {effectiveVal}
                  </span>
                  {isPenalized && (
                    <div className="text-[10px] text-amber-500 font-mono font-bold">
                      ({rawVal}{armorPenalty})
                    </div>
                  )}
                </div>

                {/* +/- Controls & Roll button */}
                <div className="flex items-center justify-center gap-1 pt-1 border-t border-zinc-900">
                  <button
                    onClick={() => handleStatChange(statKey, -1)}
                    className="w-7 h-7 sm:w-5 sm:h-5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded text-sm sm:text-xs font-bold transition flex items-center justify-center"
                  >
                    -
                  </button>
                  <button
                    onClick={() => onRollStat(statKey, effectiveVal)}
                    title={lang === 'ru' ? `Бросок ${statKey} (1d10 + ${effectiveVal})` : `Roll ${statKey} (1d10 + ${effectiveVal})`}
                    className="flex-1 py-1 sm:py-0.5 min-h-[28px] bg-zinc-900 hover:bg-red-950 text-zinc-300 hover:text-red-400 rounded text-[11px] font-bold font-mono transition flex items-center justify-center"
                  >
                    1d10
                  </button>
                  <button
                    onClick={() => handleStatChange(statKey, 1)}
                    className="w-7 h-7 sm:w-5 sm:h-5 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded text-sm sm:text-xs font-bold transition flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
