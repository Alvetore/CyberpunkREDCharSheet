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

  const handleRepairArmor = (loc: 'head' | 'body' | 'shield', amount = 1) => {
    sfx.playClick();
    const current = character.armor[loc];
    if (!current) return;
    const updated = {
      ...current,
      spCurrent: Math.min(current.spMax, current.spCurrent + amount)
    };
    onUpdateCharacter({
      ...character,
      armor: { ...character.armor, [loc]: updated }
    });
  };

  const getSelectedPresetName = (armorItem?: ArmorItem) => {
    if (!armorItem) return '';
    // 1. Exact match
    const exact = PRESET_ARMOR_OPTIONS.find((p) => p.name === armorItem.name);
    if (exact) return exact.name;

    // 2. Partial match
    const nameLower = armorItem.name.toLowerCase();
    const partial = PRESET_ARMOR_OPTIONS.find(
      (p) =>
        nameLower.includes(p.name.toLowerCase()) ||
        p.name.toLowerCase().includes(nameLower)
    );
    if (partial) return partial.name;

    // 3. Keyword + SP match
    const spMatch = PRESET_ARMOR_OPTIONS.find((p) => {
      if (p.sp !== armorItem.spMax) return false;
      if (nameLower.includes('leather') || nameLower.includes('кож')) return p.name.includes('Leather') || p.name.includes('Кожа');
      if (nameLower.includes('kevlar') || nameLower.includes('кевлар')) return p.name.includes('Kevlar') || p.name.includes('Кевлар');
      if (nameLower.includes('light') || nameLower.includes('легк') || nameLower.includes('лёгк')) return p.name.includes('Light');
      if (nameLower.includes('medium') || nameLower.includes('средн')) return p.name.includes('Medium');
      if (nameLower.includes('heavy') || nameLower.includes('тяж')) return p.name.includes('Heavy');
      if (nameLower.includes('flak') || nameLower.includes('осколоч')) return p.name.includes('Flak');
      if (nameLower.includes('metalgear') || nameLower.includes('металгир')) return p.name.includes('Metalgear');
      return true;
    });
    if (spMatch) return spMatch.name;

    // 4. Fallback match by SP
    const pureSp = PRESET_ARMOR_OPTIONS.find((p) => p.sp === armorItem.spMax && !p.name.includes('щит') && !p.name.includes('Shield'));
    if (pureSp) return pureSp.name;

    return armorItem.name;
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

        <div className={`grid grid-cols-1 ${character.armor.shield ? 'lg:grid-cols-3 md:grid-cols-2' : 'md:grid-cols-2'} gap-3`}>
          {/* Head Armor Card */}
          {(() => {
            const headPresetSelected = getSelectedPresetName(character.armor.head);
            return (
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
                  value={headPresetSelected}
                  onChange={(e) => handleApplyArmorPreset('head', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1.5 text-zinc-200 focus:border-red-500 focus:outline-none"
                >
                  {!PRESET_ARMOR_OPTIONS.some((p) => p.name === headPresetSelected) && (
                    <option value={headPresetSelected}>
                      {character.armor.head.name} ({lang === 'ru' ? 'ОС' : 'SP'} {character.armor.head.spMax})
                    </option>
                  )}
                  {PRESET_ARMOR_OPTIONS.filter((p) => !p.name.includes('щит') && !p.name.includes('Shield')).map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({lang === 'ru' ? 'ОС' : 'SP'} {p.sp}{p.penalty < 0 ? (lang === 'ru' ? `, Штраф ${p.penalty}` : `, Penalty ${p.penalty}`) : ''})
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
                <div className="flex items-center justify-between gap-1.5 pt-1 text-xs">
                  <button
                    onClick={() => handleAblateArmor('head', 1)}
                    disabled={character.armor.head.spCurrent <= 0}
                    className="flex-1 py-1.5 min-h-[34px] sm:min-h-[28px] bg-zinc-900 hover:bg-red-950 disabled:opacity-30 border border-zinc-800 text-red-300 rounded font-semibold transition flex items-center justify-center active:scale-95"
                    title={lang === 'ru' ? 'Снизить ОС на 1 при пробитии уроном' : 'Ablate SP by 1'}
                  >
                    -1 {lang === 'ru' ? 'ОС' : 'SP'}
                  </button>
                  <button
                    onClick={() => handleRepairArmor('head', 1)}
                    disabled={character.armor.head.spCurrent >= character.armor.head.spMax}
                    className="flex-1 py-1.5 min-h-[34px] sm:min-h-[28px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800 text-emerald-300 rounded font-semibold transition flex items-center justify-center active:scale-95"
                    title={lang === 'ru' ? 'Починить 1 пункт ОС' : 'Repair 1 SP point'}
                  >
                    +1 {lang === 'ru' ? 'ОС' : 'SP'}
                  </button>
                  <button
                    onClick={() => handleRestoreArmor('head')}
                    disabled={character.armor.head.spCurrent >= character.armor.head.spMax}
                    className="px-2.5 py-1.5 min-h-[34px] sm:min-h-[28px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800 text-zinc-300 rounded font-semibold transition flex items-center justify-center gap-1 active:scale-95"
                    title={t.armorRestore}
                  >
                    <RotateCcw size={12} />
                    <span className="hidden sm:inline">{lang === 'ru' ? 'Все' : 'All'}</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Body Armor Card */}
          {(() => {
            const bodyPresetSelected = getSelectedPresetName(character.armor.body);
            return (
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
                  value={bodyPresetSelected}
                  onChange={(e) => handleApplyArmorPreset('body', e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded px-2 py-1.5 text-zinc-200 focus:border-red-500 focus:outline-none"
                >
                  {!PRESET_ARMOR_OPTIONS.some((p) => p.name === bodyPresetSelected) && (
                    <option value={bodyPresetSelected}>
                      {character.armor.body.name} ({lang === 'ru' ? 'ОС' : 'SP'} {character.armor.body.spMax})
                    </option>
                  )}
                  {PRESET_ARMOR_OPTIONS.filter((p) => !p.name.includes('щит') && !p.name.includes('Shield')).map((p) => (
                    <option key={p.name} value={p.name}>
                      {p.name} ({lang === 'ru' ? 'ОС' : 'SP'} {p.sp}{p.penalty < 0 ? (lang === 'ru' ? `, Штраф ${p.penalty}` : `, Penalty ${p.penalty}`) : ''})
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
                <div className="flex items-center justify-between gap-1.5 pt-1 text-xs">
                  <button
                    onClick={() => handleAblateArmor('body', 1)}
                    disabled={character.armor.body.spCurrent <= 0}
                    className="flex-1 py-1.5 min-h-[34px] sm:min-h-[28px] bg-zinc-900 hover:bg-red-950 disabled:opacity-30 border border-zinc-800 text-red-300 rounded font-semibold transition flex items-center justify-center active:scale-95"
                    title={lang === 'ru' ? 'Снизить ОС на 1 при пробитии уроном' : 'Ablate SP by 1'}
                  >
                    -1 {lang === 'ru' ? 'ОС' : 'SP'}
                  </button>
                  <button
                    onClick={() => handleRepairArmor('body', 1)}
                    disabled={character.armor.body.spCurrent >= character.armor.body.spMax}
                    className="flex-1 py-1.5 min-h-[34px] sm:min-h-[28px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800 text-emerald-300 rounded font-semibold transition flex items-center justify-center active:scale-95"
                    title={lang === 'ru' ? 'Починить 1 пункт ОС' : 'Repair 1 SP point'}
                  >
                    +1 {lang === 'ru' ? 'ОС' : 'SP'}
                  </button>
                  <button
                    onClick={() => handleRestoreArmor('body')}
                    disabled={character.armor.body.spCurrent >= character.armor.body.spMax}
                    className="px-2.5 py-1.5 min-h-[34px] sm:min-h-[28px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800 text-zinc-300 rounded font-semibold transition flex items-center justify-center gap-1 active:scale-95"
                    title={t.armorRestore}
                  >
                    <RotateCcw size={12} />
                    <span className="hidden sm:inline">{lang === 'ru' ? 'Все' : 'All'}</span>
                  </button>
                </div>
              </div>
            );
          })()}

          {/* Shield Card (if equipped) */}
          {character.armor.shield && (
            <div className="bg-zinc-950 border border-yellow-800/80 rounded-lg p-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div>
                  <span className="font-orbitron font-bold text-xs text-yellow-400 uppercase block">
                    {t.shieldArmor || 'Щит (ПЗ)'}
                  </span>
                  <span className="text-[11px] text-zinc-400">{character.armor.shield.name}</span>
                </div>
                <div className="text-right">
                  <span className="font-orbitron font-black text-2xl text-yellow-400">
                    {character.armor.shield.spCurrent}
                    <span className="text-zinc-600 text-sm"> / {character.armor.shield.spMax}</span>
                  </span>
                </div>
              </div>

              {/* Shield Bar */}
              <div className="w-full bg-zinc-900 h-2 rounded-full overflow-hidden border border-zinc-800">
                <div
                  className="h-full bg-yellow-500 transition-all"
                  style={{
                    width: `${Math.round((character.armor.shield.spCurrent / Math.max(1, character.armor.shield.spMax)) * 100)}%`
                  }}
                />
              </div>

              {/* Shield Controls */}
              <div className="flex items-center justify-between gap-1.5 pt-1 text-xs">
                <button
                  onClick={() => handleAblateArmor('shield', 1)}
                  disabled={character.armor.shield.spCurrent <= 0}
                  className="flex-1 py-1.5 min-h-[34px] sm:min-h-[28px] bg-zinc-900 hover:bg-yellow-950 disabled:opacity-30 border border-zinc-800 text-yellow-300 rounded font-semibold transition flex items-center justify-center active:scale-95"
                >
                  -1 HP
                </button>
                <button
                  onClick={() => handleRepairArmor('shield', 1)}
                  disabled={character.armor.shield.spCurrent >= character.armor.shield.spMax}
                  className="flex-1 py-1.5 min-h-[34px] sm:min-h-[28px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800 text-emerald-300 rounded font-semibold transition flex items-center justify-center active:scale-95"
                >
                  +1 HP
                </button>
                <button
                  onClick={() => handleRestoreArmor('shield')}
                  disabled={character.armor.shield.spCurrent >= character.armor.shield.spMax}
                  className="px-2.5 py-1.5 min-h-[34px] sm:min-h-[28px] bg-zinc-900 hover:bg-zinc-800 disabled:opacity-30 border border-zinc-800 text-zinc-300 rounded font-semibold transition flex items-center justify-center gap-1 active:scale-95"
                >
                  <RotateCcw size={12} />
                  <span className="hidden sm:inline">{lang === 'ru' ? 'Все' : 'All'}</span>
                </button>
              </div>
            </div>
          )}
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

          <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
            <button
              onClick={() => handleRollRandomInjury('head')}
              className="flex-1 sm:flex-none px-3 py-1.5 min-h-[34px] bg-zinc-800 hover:bg-red-950 border border-zinc-700 text-red-400 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition"
            >
              <Dices size={13} />
              <span>{lang === 'ru' ? 'В Голову (2d6)' : 'Head (2d6)'}</span>
            </button>
            <button
              onClick={() => handleRollRandomInjury('body')}
              className="flex-1 sm:flex-none px-3 py-1.5 min-h-[34px] bg-zinc-800 hover:bg-red-950 border border-zinc-700 text-red-400 text-xs font-semibold rounded flex items-center justify-center gap-1.5 transition"
            >
              <Dices size={13} />
              <span>{lang === 'ru' ? 'В Тело (2d6)' : 'Body (2d6)'}</span>
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
                <div className="flex flex-col gap-1 text-[10px] text-zinc-400 mt-1.5 pt-1.5 border-t border-zinc-800/80">
                  {inj.quickFixDv > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-zinc-400 font-semibold">{lang === 'ru' ? 'Быстрая помощь:' : 'Quick Fix:'}</span>
                      <span className="text-yellow-400 font-mono">
                        {lang === 'ru' 
                          ? (inj.quickFixTextRu || `СЛ ${inj.quickFixDv}`) 
                          : (inj.quickFixTextEn || `DV ${inj.quickFixDv}`)}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-zinc-400 font-semibold">{lang === 'ru' ? 'Лечение:' : 'Treatment:'}</span>
                    <span className="text-cyan-400 font-mono">
                      {lang === 'ru' 
                        ? (inj.treatmentTextRu || `СЛ ${inj.treatmentDv}`) 
                        : (inj.treatmentTextEn || `DV ${inj.treatmentDv}`)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
