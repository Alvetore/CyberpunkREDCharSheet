import React, { useEffect, useState } from 'react';
import { Character } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { calculateHumanityStats } from '../utils/roleUtils';
import { RollResult } from '../types/character';
import { 
  X, 
  Brain, 
  Sparkles, 
  HeartHandshake, 
  Dices, 
  ShieldAlert, 
  Coins, 
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';

interface TherapyModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onAddRollResult?: (roll: RollResult) => void;
  lang: Language;
}

export const TherapyModal: React.FC<TherapyModalProps> = ({
  isOpen,
  onClose,
  character,
  onUpdateCharacter,
  onAddRollResult,
  lang
}) => {

  const stats = calculateHumanityStats(character);
  const [deductCost, setDeductCost] = useState(true);
  const [lastTherapyResult, setLastTherapyResult] = useState<{
    type: 'standard' | 'extreme' | 'manual';
    recovered: number;
    diceRolls: number[];
    oldHumanity: number;
    newHumanity: number;
    cost: number;
  } | null>(null);

  const [manualInput, setManualInput] = useState(stats.currentHumanity.toString());
  useEffect(() => {
    if (isOpen) { setManualInput(String(character.humanityCurrent)); setLastTherapyResult(null); }
  }, [isOpen, character.id]);

  if (!isOpen) return null;

  const rollDice = (count: number): number[] => {
    const rolls: number[] = [];
    for (let i = 0; i < count; i++) {
      rolls.push(Math.floor(Math.random() * 6) + 1);
    }
    return rolls;
  };

  const executeTherapy = (diceCount: number, costEb: number, therapyNameRu: string, therapyNameEn: string) => {
    sfx.playDiceRoll();
    const rolls = rollDice(diceCount);
    const sum = rolls.reduce((a, b) => a + b, 0);

    const oldHumanity = character.humanityCurrent;
    const targetHumanity = Math.min(stats.maxRecoverableHumanity, oldHumanity + sum);
    const actualRecovered = targetHumanity - oldHumanity;

    let updatedCash = character.cashEb;
    let updatedBank = character.bankEb;
    let costPaid = 0;

    if (deductCost && costEb > 0) {
      if (updatedCash >= costEb) {
        updatedCash -= costEb;
        costPaid = costEb;
      } else if (updatedCash + updatedBank >= costEb) {
        const remainder = costEb - updatedCash;
        updatedCash = 0;
        updatedBank -= remainder;
        costPaid = costEb;
      }
    }

    onUpdateCharacter({
      ...character,
      humanityCurrent: targetHumanity,
      cashEb: updatedCash,
      bankEb: updatedBank
    });

    setLastTherapyResult({
      type: diceCount === 2 ? 'standard' : 'extreme',
      recovered: actualRecovered,
      diceRolls: rolls,
      oldHumanity,
      newHumanity: targetHumanity,
      cost: costPaid
    });

    if (onAddRollResult) {
      onAddRollResult({
        id: 'therapy-' + Date.now(),
        title: lang === 'ru' 
          ? `Терапия: ${therapyNameRu} (+${actualRecovered} HL)` 
          : `Therapy: ${therapyNameEn} (+${actualRecovered} HL)`,
        type: 'custom',
        total: sum,
        damageDice: rolls,
        summary: `[${rolls.join(' + ')}] = +${actualRecovered} HL`,
        timestamp: Date.now()
      });
    }
  };

  const handleSetMaxHumanity = () => {
    sfx.playClick();
    const oldHumanity = character.humanityCurrent;
    const targetHumanity = stats.maxRecoverableHumanity;
    const recovered = targetHumanity - oldHumanity;

    onUpdateCharacter({
      ...character,
      humanityCurrent: targetHumanity
    });

    setLastTherapyResult({
      type: 'manual',
      recovered,
      diceRolls: [],
      oldHumanity,
      newHumanity: targetHumanity,
      cost: 0
    });
  };

  const handleManualSave = () => {
    sfx.playClick();
    const parsed = parseInt(manualInput, 10);
    if (isNaN(parsed)) return;
    const clamped = Math.min(stats.maxRecoverableHumanity, parsed);

    onUpdateCharacter({
      ...character,
      humanityCurrent: clamped
    });

    setLastTherapyResult({
      type: 'manual',
      recovered: clamped - character.humanityCurrent,
      diceRolls: [],
      oldHumanity: character.humanityCurrent,
      newHumanity: clamped,
      cost: 0
    });
  };

  const totalFunds = character.cashEb + character.bankEb;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl w-full max-w-xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-zinc-800 bg-zinc-950/70">
          <div className="flex items-center gap-2">
            <Brain size={20} className="text-cyan-400" />
            <h2 className="font-orbitron font-bold text-sm sm:text-base text-zinc-100 uppercase tracking-wider">
              {lang === 'ru' ? 'Медицинская терапия человечности' : 'Humanity Therapy & Psychological Recovery'}
            </h2>
          </div>
          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="text-zinc-400 hover:text-white p-1 rounded transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs">
          {/* Rules Explanation Alert */}
          <div className="bg-cyan-950/30 border border-cyan-800/60 rounded-lg p-3 text-cyan-200/90 leading-relaxed space-y-1">
            <div className="font-bold font-orbitron flex items-center gap-1.5 text-cyan-300">
              <Sparkles size={14} />
              <span>{lang === 'ru' ? 'Правила терапии (Corebook стр. 229)' : 'Therapy Rules (Corebook p. 229)'}</span>
            </div>
            <p className="text-[11px] text-zinc-300">
              {lang === 'ru'
                ? 'Терапия позволяет восстановить человечность, утраченную от пережитых травм и киберимплантов. Каждый установленный киберимплант снижает максимум человечности на 2 (боргирование — на 4). Терапия восстанавливает человечность вплоть до этого предела.'
                : 'Therapy allows you to recover Humanity lost from psychological trauma and cyberware installation. Each installed cyberware lowers max Humanity by 2 (borgware by 4). Therapy restores Humanity up to this cap.'}
            </p>
          </div>

          {/* Current Status Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
              <div className="text-[10px] text-zinc-400 font-semibold uppercase">{lang === 'ru' ? 'Текущая' : 'Current'}</div>
              <div className="text-lg font-orbitron font-black text-cyan-400">{stats.currentHumanity}</div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
              <div className="text-[10px] text-zinc-400 font-semibold uppercase">{lang === 'ru' ? 'Порог (с имплантами)' : 'Max Cap (Chrome)'}</div>
              <div className="text-lg font-orbitron font-black text-emerald-400">{stats.maxRecoverableHumanity}</div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
              <div className="text-[10px] text-zinc-400 font-semibold uppercase">{lang === 'ru' ? 'Постоянный штраф' : 'Permanent Loss'}</div>
              <div className="text-lg font-orbitron font-black text-red-400">-{stats.cyberwarePermanentLoss}</div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
              <div className="text-[10px] text-zinc-400 font-semibold uppercase">{lang === 'ru' ? 'Текущий ЭМП' : 'Current EMP'}</div>
              <div className="text-lg font-orbitron font-black text-amber-400">{stats.currentEmp} / {character.stats.EMP}</div>
            </div>
          </div>

          {/* Money & Deduct checkbox */}
          <div className="flex items-center justify-between bg-zinc-950/60 border border-zinc-800 rounded p-2.5">
            <div className="flex items-center gap-1.5 text-zinc-300">
              <Coins size={14} className="text-amber-400" />
              <span>{lang === 'ru' ? 'Средства персонажа:' : 'Character Funds:'}</span>
              <span className="font-mono font-bold text-amber-300">{totalFunds} eb</span>
              <span className="text-[10px] text-zinc-500">({character.cashEb} наличные / {character.bankEb} банк)</span>
            </div>
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-zinc-300 select-none">
              <input
                type="checkbox"
                checked={deductCost}
                onChange={(e) => setDeductCost(e.target.checked)}
                className="rounded border-zinc-700 bg-zinc-800 text-cyan-500 focus:ring-0"
              />
              <span>{lang === 'ru' ? 'Списывать стоимость' : 'Deduct cost'}</span>
            </label>
          </div>

          {/* Latest Result Banner */}
          {lastTherapyResult && (
            <div className="bg-emerald-950/40 border border-emerald-700/80 rounded-lg p-3 text-emerald-200 animate-in fade-in">
              <div className="flex items-center justify-between font-orbitron font-bold">
                <span className="flex items-center gap-1 text-emerald-400">
                  <CheckCircle size={14} />
                  {lang === 'ru' ? 'Сеанс терапии завершён!' : 'Therapy Session Completed!'}
                </span>
                <span className="text-base text-white">
                  {lastTherapyResult.oldHumanity} <ArrowRight size={12} className="inline mx-1 text-emerald-400" /> {lastTherapyResult.newHumanity}
                </span>
              </div>
              <div className="text-[11px] text-zinc-300 mt-1">
                {lang === 'ru' ? 'Восстановлено человечности:' : 'Humanity Recovered:'}{' '}
                <strong className="text-emerald-300">+{lastTherapyResult.recovered} HL</strong>
                {lastTherapyResult.diceRolls.length > 0 && (
                  <span className="ml-1 text-zinc-400">
                    (бросок: [{lastTherapyResult.diceRolls.join(' + ')}])
                  </span>
                )}
                {lastTherapyResult.cost > 0 && (
                  <span className="ml-2 text-amber-400">
                    ({lang === 'ru' ? 'оплачено' : 'paid'} {lastTherapyResult.cost} eb)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Therapy Options */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Standard Therapy */}
            <div className="bg-zinc-950 border border-zinc-800 hover:border-cyan-800/60 rounded-lg p-3 flex flex-col justify-between transition">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-orbitron font-bold text-sm text-cyan-400">
                    {lang === 'ru' ? 'Стандартная терапия' : 'Standard Therapy'}
                  </h3>
                  <span className="font-mono font-bold text-amber-400 text-xs">500 eb</span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                  {lang === 'ru'
                    ? '1 неделя сеансов психотерапии и лёгкого нейроперепрограммирования. Восстанавливает 2d6 человечности.'
                    : '1 week of intensive therapy and mild brain reprogramming. Restores 2d6 Humanity.'}
                </p>
                <div className="text-[10px] text-zinc-500 font-mono mb-3">
                  {lang === 'ru' ? 'Требование: Медтех СЛ15' : 'Requirement: Medtech DV15'}
                </div>
              </div>
              <button
                onClick={() => executeTherapy(2, 500, 'Стандартная (2d6)', 'Standard (2d6)')}
                disabled={!stats.canRestore}
                className="w-full py-2 bg-cyan-950/80 hover:bg-cyan-800 disabled:opacity-30 disabled:hover:bg-cyan-950/80 border border-cyan-700/80 text-cyan-200 hover:text-white rounded font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <Dices size={14} className="text-cyan-400" />
                <span>{lang === 'ru' ? 'Пройти курс (2d6)' : 'Undergo (2d6)'}</span>
              </button>
            </div>

            {/* Extreme Therapy */}
            <div className="bg-zinc-950 border border-zinc-800 hover:border-emerald-800/60 rounded-lg p-3 flex flex-col justify-between transition">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-orbitron font-bold text-sm text-emerald-400">
                    {lang === 'ru' ? 'Экстремальная терапия' : 'Extreme Therapy'}
                  </h3>
                  <span className="font-mono font-bold text-amber-400 text-xs">1 000 eb</span>
                </div>
                <p className="text-[11px] text-zinc-400 mb-2 leading-relaxed">
                  {lang === 'ru'
                    ? '1 неделя глубокого нейроперепрограммирования и терапевтического брейнданса. Восстанавливает 4d6 человечности.'
                    : '1 week of deep neural reprogramming and therapeutic braindance. Restores 4d6 Humanity.'}
                </p>
                <div className="text-[10px] text-zinc-500 font-mono mb-3">
                  {lang === 'ru' ? 'Требование: Медтех СЛ17' : 'Requirement: Medtech DV17'}
                </div>
              </div>
              <button
                onClick={() => executeTherapy(4, 1000, 'Экстремальная (4d6)', 'Extreme (4d6)')}
                disabled={!stats.canRestore}
                className="w-full py-2 bg-emerald-950/80 hover:bg-emerald-800 disabled:opacity-30 disabled:hover:bg-emerald-950/80 border border-emerald-700/80 text-emerald-200 hover:text-white rounded font-orbitron font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition active:scale-95 shadow-xs"
              >
                <Dices size={14} className="text-emerald-400" />
                <span>{lang === 'ru' ? 'Пройти курс (4d6)' : 'Undergo (4d6)'}</span>
              </button>
            </div>
          </div>

          {/* Quick Manual Adjusters / Reset */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-lg p-3 space-y-2">
            <div className="font-semibold text-zinc-300 flex items-center justify-between">
              <span>{lang === 'ru' ? 'Ручная корректировка человечности' : 'Manual Humanity Override'}</span>
              <button
                onClick={handleSetMaxHumanity}
                disabled={!stats.canRestore}
                className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 text-[10px] text-zinc-200 rounded font-bold transition"
              >
                {lang === 'ru' ? `Восстановить до максимума (${stats.maxRecoverableHumanity})` : `Restore to Cap (${stats.maxRecoverableHumanity})`}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                max={stats.maxRecoverableHumanity}
                value={manualInput}
                onChange={(e) => setManualInput(e.target.value)}
                className="w-24 bg-zinc-900 border border-zinc-700 rounded px-2.5 py-1 text-center font-orbitron font-bold text-sm text-cyan-400"
              />
              <button
                onClick={handleManualSave}
                className="px-3 py-1 bg-zinc-800 hover:bg-cyan-900 border border-zinc-700 hover:border-cyan-700 text-zinc-200 hover:text-white rounded font-bold text-xs transition"
              >
                {lang === 'ru' ? 'Установить значение' : 'Set Value'}
              </button>
              <span className="text-[11px] text-zinc-500">
                {lang === 'ru' ? `(максимум с имплантами: ${stats.maxRecoverableHumanity})` : `(max with chrome: ${stats.maxRecoverableHumanity})`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-5 py-2.5 border-t border-zinc-800 bg-zinc-950/70 flex justify-end">
          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded text-xs font-semibold transition"
          >
            {lang === 'ru' ? 'Закрыть' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
