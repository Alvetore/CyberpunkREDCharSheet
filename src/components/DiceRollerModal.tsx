import React, { useState } from 'react';
import { Character, RollResult } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { executeCyberpunkCheck, executeDamageRoll, executeDeathSave } from '../utils/dice';
import { sfx } from '../utils/audio';
import { X, Dices, ShieldAlert, Sparkles, Flame, History, Trash2 } from 'lucide-react';

interface DiceRollerModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  lang: Language;
  rollHistory: RollResult[];
  onAddRollResult: (res: RollResult) => void;
  onClearHistory: () => void;
}

export const DiceRollerModal: React.FC<DiceRollerModalProps> = ({
  isOpen,
  onClose,
  character,
  onUpdateCharacter,
  lang,
  rollHistory,
  onAddRollResult,
  onClearHistory
}) => {
  const t = translations[lang];

  // Roll form states
  const [checkTitle, setCheckTitle] = useState('Проверка навыка / характеристики');
  const [baseVal, setBaseVal] = useState<number>(10);
  const [luckSpent, setLuckSpent] = useState<number>(0);
  const [situationalMod, setSituationalMod] = useState<number>(0);
  const [targetDv, setTargetDv] = useState<string>('15');

  // Damage form states
  const [damageFormula, setDamageFormula] = useState('3d6');
  const [damageTitle, setDamageTitle] = useState('Урон оружия');

  // Active tab inside roller: 'check' | 'damage' | 'history'
  const [activeTab, setActiveTab] = useState<'check' | 'damage' | 'history'>('check');

  if (!isOpen) return null;

  const handleRollCheck = () => {
    const dvNumber = targetDv.trim() === '' ? undefined : parseInt(targetDv, 10);
    const modifiers = situationalMod !== 0 ? [{ name: 'Модификатор', val: situationalMod }] : [];

    // Seriously / Mortally Wounded automatic penalty check
    const hpMax = 10 + 5 * Math.ceil((character.stats.BODY + character.stats.WILL) / 2);
    const seriouslyWoundedThreshold = Math.ceil(hpMax / 2);
    if (character.hpCurrent <= 0) {
      modifiers.push({ name: 'Смертельно ранен', val: -4 });
    } else if (character.hpCurrent <= seriouslyWoundedThreshold) {
      modifiers.push({ name: 'Тяжело ранен', val: -2 });
    }

    const result = executeCyberpunkCheck({
      title: checkTitle,
      baseVal: baseVal,
      luckSpent: luckSpent,
      modifiers,
      targetDv: isNaN(dvNumber as number) ? undefined : dvNumber
    });

    // Deduct luck if spent
    if (luckSpent > 0 && character.luckCurrent >= luckSpent) {
      onUpdateCharacter({
        ...character,
        luckCurrent: character.luckCurrent - luckSpent
      });
      setLuckSpent(0);
    }

    onAddRollResult(result);
  };

  const handleRollDamage = () => {
    const result = executeDamageRoll(damageTitle, damageFormula);
    onAddRollResult(result);
  };

  const handleRollDeathSave = () => {
    const result = executeDeathSave(character.stats.BODY, character.deathSavePenalties);
    onAddRollResult(result);
  };

  const latestRoll = rollHistory[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-zinc-900 border-2 border-red-600 w-full max-w-2xl rounded-lg shadow-2xl shadow-red-950/80 flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-red-800">
          <div className="flex items-center gap-2 text-red-500 font-orbitron font-bold">
            <Dices size={20} className="animate-spin-slow" />
            <span className="tracking-wider uppercase">{t.diceRollerTitle}</span>
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

        {/* Tab buttons */}
        <div className="flex border-b border-zinc-800 bg-zinc-950/60 text-xs font-orbitron font-semibold uppercase">
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('check');
            }}
            className={`flex-1 py-2.5 text-center transition ${
              activeTab === 'check'
                ? 'text-red-500 border-b-2 border-red-500 bg-red-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            1d10 {t.rollSkill}
          </button>
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('damage');
            }}
            className={`flex-1 py-2.5 text-center transition ${
              activeTab === 'damage'
                ? 'text-red-500 border-b-2 border-red-500 bg-red-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Nd6 {t.damage}
          </button>
          <button
            onClick={() => {
              sfx.playClick();
              setActiveTab('history');
            }}
            className={`flex-1 py-2.5 text-center transition flex items-center justify-center gap-1.5 ${
              activeTab === 'history'
                ? 'text-red-500 border-b-2 border-red-500 bg-red-950/20'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <History size={14} />
            {t.rollHistory} ({rollHistory.length})
          </button>
        </div>

        {/* Body content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Latest Roll Banner */}
          {latestRoll && activeTab !== 'history' && (
            <div
              className={`p-3 rounded-lg border text-sm transition-all ${
                latestRoll.isCritSuccess
                  ? 'bg-yellow-950/30 border-yellow-500 text-yellow-300'
                  : latestRoll.isCritFail
                  ? 'bg-red-950/40 border-red-500 text-red-300'
                  : latestRoll.isCritInjury
                  ? 'bg-amber-950/40 border-amber-500 text-amber-300'
                  : latestRoll.isSuccess === true
                  ? 'bg-emerald-950/30 border-emerald-500 text-emerald-300'
                  : latestRoll.isSuccess === false
                  ? 'bg-zinc-800 border-red-900 text-zinc-300'
                  : 'bg-zinc-800/80 border-zinc-700 text-zinc-200'
              }`}
            >
              <div className="flex items-center justify-between font-orbitron font-bold">
                <span className="truncate">{latestRoll.title}</span>
                <span className="text-xl sm:text-2xl text-white font-black ml-2">
                  {latestRoll.total}
                </span>
              </div>
              <div className="text-xs font-mono mt-1 opacity-90">{latestRoll.summary}</div>
              {latestRoll.isCritSuccess && (
                <div className="flex items-center gap-1 text-xs font-bold text-yellow-400 mt-1 uppercase">
                  <Sparkles size={14} /> {t.critSuccessNotice}
                </div>
              )}
              {latestRoll.isCritFail && (
                <div className="flex items-center gap-1 text-xs font-bold text-red-400 mt-1 uppercase">
                  <ShieldAlert size={14} /> {t.critFailNotice}
                </div>
              )}
              {latestRoll.isCritInjury && (
                <div className="flex items-center gap-1 text-xs font-bold text-amber-400 mt-1 uppercase">
                  <Flame size={14} /> {t.critInjuryNotice}
                </div>
              )}
              {latestRoll.isSuccess !== undefined && (
                <div
                  className={`text-xs font-bold mt-1 uppercase ${
                    latestRoll.isSuccess ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  {latestRoll.isSuccess ? t.success : t.failure}
                  {latestRoll.margin !== undefined && (
                    <span className="ml-1">
                      (Margin: {latestRoll.margin >= 0 ? `+${latestRoll.margin}` : latestRoll.margin})
                    </span>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 1: 1d10 Check */}
          {activeTab === 'check' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  Название броска
                </label>
                <input
                  type="text"
                  value={checkTitle}
                  onChange={(e) => setCheckTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {/* Base Value */}
                <div>
                  <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                    {t.skillBase} (Stat + Skill)
                  </label>
                  <input
                    type="number"
                    value={baseVal}
                    onChange={(e) => setBaseVal(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-zinc-100 font-bold text-center focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Target DV */}
                <div>
                  <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                    {t.targetDv}
                  </label>
                  <input
                    type="number"
                    value={targetDv}
                    placeholder="DV"
                    onChange={(e) => setTargetDv(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-zinc-100 font-bold text-center focus:border-red-500 focus:outline-none"
                  />
                </div>

                {/* Spend Luck */}
                <div>
                  <label className="text-xs text-yellow-400 uppercase font-semibold block mb-1">
                    {t.luckPoints} (Доступно: {character.luckCurrent})
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={character.luckCurrent}
                    value={luckSpent}
                    onChange={(e) => setLuckSpent(Math.max(0, parseInt(e.target.value, 10) || 0))}
                    className="w-full bg-zinc-800 border border-yellow-700/60 rounded px-3 py-1.5 text-yellow-300 font-bold text-center focus:border-yellow-400 focus:outline-none"
                  />
                </div>

                {/* Situational Modifier */}
                <div>
                  <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                    {t.situationalMod}
                  </label>
                  <input
                    type="number"
                    value={situationalMod}
                    onChange={(e) => setSituationalMod(parseInt(e.target.value, 10) || 0)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-zinc-100 font-bold text-center focus:border-red-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Quick DV Presets */}
              <div className="flex items-center gap-1.5 flex-wrap text-xs text-zinc-400">
                <span className="font-semibold uppercase text-zinc-500">Пресеты DV:</span>
                {[9, 13, 15, 17, 21, 24, 29].map((dv) => (
                  <button
                    key={dv}
                    type="button"
                    onClick={() => setTargetDv(dv.toString())}
                    className="px-2 py-0.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-zinc-300 font-mono transition"
                  >
                    DV {dv}
                  </button>
                ))}
              </div>

              {/* Action buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleRollCheck}
                  className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-sm tracking-wider uppercase rounded shadow-lg shadow-red-950 transition flex items-center justify-center gap-2"
                >
                  <Dices size={18} />
                  БРОСИТЬ 1D10
                </button>

                <button
                  onClick={handleRollDeathSave}
                  className="w-full py-2.5 bg-zinc-800 hover:bg-red-950 border border-red-700 text-red-400 hover:text-white font-orbitron font-bold text-xs tracking-wider uppercase rounded transition flex items-center justify-center gap-2"
                >
                  <ShieldAlert size={16} />
                  {t.rollDeathSave} (BODY {character.stats.BODY})
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: Nd6 Damage */}
          {activeTab === 'damage' && (
            <div className="space-y-4">
              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  Название источника урона
                </label>
                <input
                  type="text"
                  value={damageTitle}
                  onChange={(e) => setDamageTitle(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  Формула урона
                </label>
                <input
                  type="text"
                  value={damageFormula}
                  onChange={(e) => setDamageFormula(e.target.value)}
                  placeholder="e.g. 3d6, 4d6, 5d6"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded px-3 py-1.5 text-zinc-100 font-bold text-center text-lg focus:border-red-500 focus:outline-none"
                />
              </div>

              {/* Quick damage presets */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-semibold uppercase text-zinc-500">Пресеты:</span>
                {['1d6', '2d6', '3d6', '4d6', '5d6', '6d6', '8d6'].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setDamageFormula(preset)}
                    className="px-2.5 py-1 bg-zinc-800 hover:bg-red-900 border border-zinc-700 rounded text-zinc-200 font-mono font-bold transition"
                  >
                    {preset}
                  </button>
                ))}
              </div>

              <div className="p-3 bg-zinc-950/80 border border-zinc-800 rounded text-xs text-zinc-400">
                <span className="text-yellow-400 font-bold block mb-1">
                  Правило Cyberpunk RED (Критическое ранение):
                </span>
                Если при броске урона выпадают как минимум две шестёрки (6, 6), цель получает дополнительно +5 урона напрямую в ОЗ и критическую травму!
              </div>

              <button
                onClick={handleRollDamage}
                className="w-full py-2.5 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-sm tracking-wider uppercase rounded shadow-lg shadow-red-950 transition flex items-center justify-center gap-2"
              >
                <Flame size={18} />
                {t.rollDamage} ({damageFormula})
              </button>
            </div>
          )}

          {/* TAB 3: Roll History */}
          {activeTab === 'history' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400 pb-2 border-b border-zinc-800">
                <span>Всего бросков: {rollHistory.length}</span>
                {rollHistory.length > 0 && (
                  <button
                    onClick={() => {
                      sfx.playClick();
                      onClearHistory();
                    }}
                    className="flex items-center gap-1 text-red-400 hover:text-red-300 transition"
                  >
                    <Trash2 size={14} />
                    {t.clearHistory}
                  </button>
                )}
              </div>

              {rollHistory.length === 0 ? (
                <div className="text-center py-8 text-zinc-500 text-sm">
                  История бросков пуста
                </div>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {rollHistory.map((roll) => (
                    <div
                      key={roll.id}
                      className="p-2.5 bg-zinc-950 border border-zinc-800 rounded hover:border-zinc-700 transition text-xs font-mono"
                    >
                      <div className="flex items-center justify-between font-orbitron font-bold text-zinc-200">
                        <span className="truncate">{roll.title}</span>
                        <span className="text-base font-black text-white ml-2">{roll.total}</span>
                      </div>
                      <div className="text-zinc-400 mt-1">{roll.summary}</div>
                      <div className="flex items-center gap-2 mt-1">
                        {roll.isCritSuccess && (
                          <span className="text-yellow-400 font-bold uppercase">Крит (+10)</span>
                        )}
                        {roll.isCritFail && (
                          <span className="text-red-400 font-bold uppercase">Провал (-1)</span>
                        )}
                        {roll.isCritInjury && (
                          <span className="text-amber-400 font-bold uppercase">+5 Крит. травма</span>
                        )}
                        {roll.isSuccess !== undefined && (
                          <span className={roll.isSuccess ? 'text-emerald-400' : 'text-red-400'}>
                            {roll.isSuccess ? 'УСПЕХ' : 'ПРОВАЛ'} (DV {roll.targetDv})
                          </span>
                        )}
                        <span className="text-zinc-600 text-[10px] ml-auto">
                          {new Date(roll.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
