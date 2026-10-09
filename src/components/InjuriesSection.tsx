import React, { useState } from 'react';
import { Character, ArmorItem } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { PRESET_ARMOR_OPTIONS } from '../data/initialData';
import { rollD6 } from '../utils/dice';
import { sfx } from '../utils/audio';
import { 
  ShieldAlert, 
  ShieldCheck, 
  HeartCrack, 
  RotateCcw, 
  Dices, 
  Flame, 
  Activity,
  CheckSquare,
  Square
} from 'lucide-react';

interface InjuriesSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onOpenDamageCalc: () => void;
  lang: Language;
}

export const InjuriesSection: React.FC<InjuriesSectionProps> = ({
  character,
  onUpdateCharacter,
  onOpenDamageCalc,
  lang
}) => {
  const t = translations[lang];
  const [injuryTab, setInjuryTab] = useState<'head' | 'body'>('head');

  // Armor ablation / restore
  const handleAblateArmor = (loc: 'head' | 'body' | 'shield', amount: number) => {
    sfx.playClick();
    const current = character.armor[loc];
    if (!current) return;
    const updated = {
      ...current,
      spCurrent: Math.max(0, current.spCurrent - amount)
    };
    onUpdateCharacter({
      ...character,
      armor: { ...character.armor, [loc]: updated }
    });
  };

  const handleRestoreArmor = (loc: 'head' | 'body' | 'shield') => {
    sfx.playClick();
    const current = character.armor[loc];
    if (!current) return;
    const updated = {
      ...current,
      spCurrent: current.spMax
    };
    onUpdateCharacter({
      ...character,
      armor: { ...character.armor, [loc]: updated }
    });
  };

  const handleApplyArmorPreset = (loc: 'head' | 'body', presetName: string) => {
    const preset = PRESET_ARMOR_OPTIONS.find((p) => p.name === presetName);
    if (!preset) return;
    sfx.playClick();
    const updated: ArmorItem = {
      ...character.armor[loc],
      name: preset.name,
      spMax: preset.sp,
      spCurrent: preset.sp,
      penalty: preset.penalty
    };
    onUpdateCharacter({
      ...character,
      armor: { ...character.armor, [loc]: updated }
    });
  };

  // Toggle Critical Injury
  const handleToggleInjury = (injuryId: string) => {
    sfx.playClick();
    const updated = character.criticalInjuries.map((inj) => {
      if (inj.id === injuryId) {
        return { ...inj, isActive: !inj.isActive };
      }
      return inj;
    });
    onUpdateCharacter({ ...character, criticalInjuries: updated });
  };

  // Roll Random 2d6 Injury
  const handleRollRandomInjury = (loc: 'head' | 'body') => {
    sfx.playDiceRoll();
    const d1 = rollD6();
    const d2 = rollD6();
    const rollTotal = d1 + d2;

    const matched = character.criticalInjuries.find(
      (inj) => inj.location === loc && inj.rollNumber === rollTotal
    );

    if (matched) {
      setTimeout(() => sfx.playCritFailure(), 200);
      const updated = character.criticalInjuries.map((inj) => {
        if (inj.id === matched.id) {
          return { ...inj, isActive: true };
        }
        return inj;
      });
      onUpdateCharacter({ ...character, criticalInjuries: updated });
    }
  };

  const headInjuries = character.criticalInjuries.filter((i) => i.location === 'head');
  const bodyInjuries = character.criticalInjuries.filter((i) => i.location === 'body');
  const activeInjuries = character.criticalInjuries.filter((i) => i.isActive);

  return (
    <div className="space-y-4">
      {/* Armor Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md">
        <div className="flex flex-wrap items-center justify-between mb-3 border-b border-zinc-800 pb-2 gap-2">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-red-500" />
            <h2 className="font-orbitron font-bold text-sm text-red-500 uppercase tracking-wider">
              {t.armorTitle}
            </h2>
          </div>

          <div className="flex items-center gap-2">
            {(character.armor.head.penalty < 0 || character.armor.body.penalty < 0) && (
              <span className="text-xs text-amber-400 font-bold hidden sm:inline">
                {lang === 'ru' ? 'Штраф брони:' : 'Armor penalty:'} {Math.min(character.armor.head.penalty, character.armor.body.penalty)}
              </span>
            )}

            <button
              onClick={() => {
                sfx.playClick();
                onOpenDamageCalc();
              }}
              className="flex items-center gap-1.5 px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition shadow-md shadow-red-950"
            >
              <HeartCrack size={14} />
              <span>{lang === 'ru' ? 'Расчет урона и абляции' : 'Damage & Ablation Calc'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {/* Head Armor Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-orbitron font-bold text-xs text-zinc-100 uppercase block">
                  {t.headArmor}
                </span>
                <span className="text-[11px] text-zinc-400">{character.armor.head.name}</span>
              </div>
              <div className="text-right">
                <span className="font-orbitron font-black text-2xl text-red-400">
                  {character.armor.head.spCurrent}
                  <span className="text-zinc-600 text-sm"> / {character.armor.head.spMax}</span>
                </span>
              </div>
            </div>

            {/* Presets dropdown */}
            <select
              value={character.armor.head.name}
              onChange={(e) => handleApplyArmorPreset('head', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1 text-zinc-200"
            >
              {PRESET_ARMOR_OPTIONS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} (SP {p.sp}{p.penalty < 0 ? (lang === 'ru' ? `, Штраф ${p.penalty}` : `, Penalty ${p.penalty}`) : ''})
                </option>
              ))}
            </select>

            {/* SP Bar */}
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-red-600 transition-all"
                style={{
                  width: `${Math.round((character.armor.head.spCurrent / Math.max(1, character.armor.head.spMax)) * 100)}%`
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <button
                onClick={() => handleAblateArmor('head', 1)}
                className="flex-1 py-1 bg-zinc-900 hover:bg-red-950 border border-zinc-800 text-red-300 rounded font-semibold transition"
              >
                {t.armorAblate}
              </button>
              <button
                onClick={() => handleRestoreArmor('head')}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded font-semibold transition flex items-center gap-1"
                title={t.armorRestore}
              >
                <RotateCcw size={12} />
                <span>{lang === 'ru' ? 'Восстановить' : 'Restore'}</span>
              </button>
            </div>
          </div>

          {/* Body Armor Card */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-orbitron font-bold text-xs text-zinc-100 uppercase block">
                  {t.bodyArmor}
                </span>
                <span className="text-[11px] text-zinc-400">{character.armor.body.name}</span>
              </div>
              <div className="text-right">
                <span className="font-orbitron font-black text-2xl text-red-400">
                  {character.armor.body.spCurrent}
                  <span className="text-zinc-600 text-sm"> / {character.armor.body.spMax}</span>
                </span>
              </div>
            </div>

            {/* Presets dropdown */}
            <select
              value={character.armor.body.name}
              onChange={(e) => handleApplyArmorPreset('body', e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1 text-zinc-200"
            >
              {PRESET_ARMOR_OPTIONS.map((p) => (
                <option key={p.name} value={p.name}>
                  {p.name} (SP {p.sp}{p.penalty < 0 ? (lang === 'ru' ? `, Штраф ${p.penalty}` : `, Penalty ${p.penalty}`) : ''})
                </option>
              ))}
            </select>

            {/* SP Bar */}
            <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
              <div
                className="h-full bg-red-600 transition-all"
                style={{
                  width: `${Math.round((character.armor.body.spCurrent / Math.max(1, character.armor.body.spMax)) * 100)}%`
                }}
              />
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between gap-2 pt-1 text-xs">
              <button
                onClick={() => handleAblateArmor('body', 1)}
                className="flex-1 py-1 bg-zinc-900 hover:bg-red-950 border border-zinc-800 text-red-300 rounded font-semibold transition"
              >
                {t.armorAblate}
              </button>
              <button
                onClick={() => handleRestoreArmor('body')}
                className="px-2.5 py-1 bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 rounded font-semibold transition flex items-center gap-1"
                title={t.armorRestore}
              >
                <RotateCcw size={12} />
                <span>{lang === 'ru' ? 'Восстановить' : 'Restore'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Critical Injuries Section */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <HeartCrack size={18} className="text-red-500" />
            <h2 className="font-orbitron font-bold text-sm text-red-500 uppercase tracking-wider">
              {t.criticalInjuriesTitle}
            </h2>
            {activeInjuries.length > 0 && (
              <span className="px-2 py-0.5 bg-red-950 text-red-400 border border-red-800 text-xs font-bold rounded-full animate-pulse">
                {lang === 'ru' ? 'Активных:' : 'Active:'} {activeInjuries.length}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleRollRandomInjury('head')}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-red-950 border border-zinc-700 text-red-400 text-xs font-semibold rounded flex items-center gap-1 transition"
            >
              <Dices size={13} />
              <span>{lang === 'ru' ? 'Случайная в Голову (2d6)' : 'Random Head (2d6)'}</span>
            </button>
            <button
              onClick={() => handleRollRandomInjury('body')}
              className="px-2.5 py-1 bg-zinc-800 hover:bg-red-950 border border-zinc-700 text-red-400 text-xs font-semibold rounded flex items-center gap-1 transition"
            >
              <Dices size={13} />
              <span>{lang === 'ru' ? 'Случайная в Тело (2d6)' : 'Random Body (2d6)'}</span>
            </button>
          </div>
        </div>

        {/* Tab switcher: Head vs Body */}
        <div className="flex border-b border-zinc-800 text-xs font-orbitron font-semibold uppercase">
          <button
            onClick={() => {
              sfx.playClick();
              setInjuryTab('head');
            }}
            className={`py-2 px-4 transition ${
              injuryTab === 'head'
                ? 'text-red-500 border-b-2 border-red-500 bg-red-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.headInjuries} ({headInjuries.filter((i) => i.isActive).length} {lang === 'ru' ? 'активных' : 'active'})
          </button>
          <button
            onClick={() => {
              sfx.playClick();
              setInjuryTab('body');
            }}
            className={`py-2 px-4 transition ${
              injuryTab === 'body'
                ? 'text-red-500 border-b-2 border-red-500 bg-red-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.bodyInjuries} ({bodyInjuries.filter((i) => i.isActive).length} {lang === 'ru' ? 'активных' : 'active'})
          </button>
        </div>

        {/* Injuries List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {(injuryTab === 'head' ? headInjuries : bodyInjuries).map((inj) => (
            <div
              key={inj.id}
              onClick={() => handleToggleInjury(inj.id)}
              className={`border rounded-lg p-2.5 cursor-pointer transition flex items-start gap-2.5 ${
                inj.isActive
                  ? 'bg-red-950/40 border-red-600 shadow-md shadow-red-950/50'
                  : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="pt-0.5 text-zinc-400">
                {inj.isActive ? (
                  <CheckSquare size={16} className="text-red-500" />
                ) : (
                  <Square size={16} />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1">
                  <span className={`font-orbitron font-bold text-xs ${inj.isActive ? 'text-red-400' : 'text-zinc-200'}`}>
                    {lang === 'ru' ? inj.nameRu : inj.nameEn}
                  </span>
                  <span className="font-mono text-[10px] text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded">
                    {lang === 'ru' ? 'Бросок:' : 'Roll:'} {inj.rollNumber}
                  </span>
                </div>

                <div className="text-[11px] text-zinc-300 mt-1 leading-relaxed">
                  {lang === 'ru' ? inj.effectRu : inj.effectEn}
                </div>

                {/* Medical treatment DVs */}
                <div className="flex items-center gap-3 text-[10px] text-zinc-400 mt-1.5 pt-1.5 border-t border-zinc-850">
                  {inj.quickFixDv > 0 && (
                    <span>
                      {lang === 'ru' ? 'Быстрое лечение:' : 'Quick Fix:'} <strong className="text-yellow-400 font-mono">DV {inj.quickFixDv}</strong>
                    </span>
                  )}
                  <span>
                    {lang === 'ru' ? 'Операция / Лечение:' : 'Treatment:'} <strong className="text-cyan-400 font-mono">DV {inj.treatmentDv}</strong>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
