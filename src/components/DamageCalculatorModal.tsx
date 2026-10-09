import React, { useState } from 'react';
import { Character, CriticalInjury } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { rollD6, rollD10 } from '../utils/dice';
import { sfx } from '../utils/audio';
import { 
  ShieldAlert, 
  ShieldCheck, 
  HeartCrack, 
  Crosshair, 
  Flame, 
  RotateCcw, 
  CheckCircle2, 
  X, 
  Dices,
  Layers
} from 'lucide-react';

interface DamageCalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  lang: Language;
}

export type HitLocation = 'body' | 'head';
export type AttackType = 'ranged' | 'melee' | 'ap'; // ranged: normal; melee: half SP; ap: ablate 2 SP

export const DamageCalculatorModal: React.FC<DamageCalculatorModalProps> = ({
  isOpen,
  onClose,
  character,
  onUpdateCharacter,
  lang
}) => {
  const t = translations[lang];

  // Options
  const [hitLocation, setHitLocation] = useState<HitLocation>('body');
  const [attackType, setAttackType] = useState<AttackType>('ranged');
  const [hasShield, setHasShield] = useState<boolean>(false);
  const [shieldHp, setShieldHp] = useState<number>(10);

  // Damage input
  const [damageInputMode, setDamageInputMode] = useState<'dice' | 'manual'>('dice');
  const [diceFormula, setDiceFormula] = useState<string>('3d6');
  const [rolledDice, setRolledDice] = useState<number[]>([]);
  const [manualDamage, setManualDamage] = useState<number>(12);

  // Calculation Results
  const [isCalculated, setIsCalculated] = useState<boolean>(false);
  const [calcResult, setCalcResult] = useState<{
    rawDamage: number;
    isCritInjury: boolean;
    critBonusDamage: number;
    totalDamageBeforeArmor: number;
    shieldDamageTaken: number;
    shieldDestroyed: boolean;
    remainingShieldHp: number;
    effectiveSp: number;
    isPenetrated: boolean;
    penetratingDamage: number;
    headshotMultiplier: number;
    finalHpDamage: number;
    ablationAmount: number;
    newSp: number;
    newHp: number;
    rolledInjury?: CriticalInjury;
  } | null>(null);

  if (!isOpen) return null;

  const currentArmor = hitLocation === 'head' ? character.armor.head : character.armor.body;
  const currentSp = currentArmor.spCurrent;

  const handleRollAndCalculate = () => {
    sfx.playDiceRoll();

    let rawDamage = 0;
    let isCritInjury = false;
    let diceList: number[] = [];

    if (damageInputMode === 'dice') {
      const match = diceFormula.match(/^(\d+)d6(?:\+(\d+))?$/i);
      const numDice = match ? parseInt(match[1], 10) : 3;
      const flatBonus = match && match[2] ? parseInt(match[2], 10) : 0;

      let sixCount = 0;
      let sum = 0;
      for (let i = 0; i < numDice; i++) {
        const d = rollD6();
        diceList.push(d);
        sum += d;
        if (d === 6) sixCount++;
      }
      setRolledDice(diceList);
      rawDamage = sum + flatBonus;
      isCritInjury = sixCount >= 2;
    } else {
      rawDamage = Math.max(0, manualDamage);
      isCritInjury = false;
      setRolledDice([]);
    }

    // CPR rule: Crit injury deals +5 bonus damage directly
    const critBonusDamage = isCritInjury ? 5 : 0;
    const totalDamageBeforeArmor = rawDamage;

    // Shield calculation (Bulletproof shield absorbs damage first)
    let dmgAfterShield = totalDamageBeforeArmor;
    let shieldDamageTaken = 0;
    let shieldDestroyed = false;
    let remainingShieldHp = shieldHp;

    if (hasShield && shieldHp > 0) {
      shieldDamageTaken = Math.min(shieldHp, dmgAfterShield);
      remainingShieldHp = shieldHp - shieldDamageTaken;
      shieldDestroyed = remainingShieldHp <= 0;
      dmgAfterShield = Math.max(0, dmgAfterShield - shieldDamageTaken);
    }

    // Effective SP: Melee weapon / Martial Arts ignores half armor (SP / 2, round up in CPR)
    const effectiveSp = attackType === 'melee' 
      ? Math.ceil(currentSp / 2) 
      : currentSp;

    // Penetration check: damage must EXCEED SP
    const isPenetrated = dmgAfterShield > effectiveSp;

    let penetratingDamage = 0;
    let headshotMultiplier = 1;
    let finalHpDamage = 0;
    let ablationAmount = 0;

    if (isPenetrated) {
      penetratingDamage = dmgAfterShield - effectiveSp;

      // Headshot rule: penetrating damage is DOUBLED!
      if (hitLocation === 'head') {
        headshotMultiplier = 2;
      }
      
      finalHpDamage = penetratingDamage * headshotMultiplier + critBonusDamage;

      // Armor Ablation: standard -1 SP, AP ammo -2 SP
      ablationAmount = attackType === 'ap' ? 2 : 1;
    } else {
      // Not penetrated: 0 damage to HP, 0 ablation! (Except crit injury bonus? In CPR crit only triggers if penetrating or double sixes on damage)
      if (isCritInjury) {
        finalHpDamage = critBonusDamage; // bonus damage from crit trauma
      }
    }

    const newSp = Math.max(0, currentSp - ablationAmount);
    const newHp = Math.max(0, character.hpCurrent - finalHpDamage);

    // Roll random injury if 2+ sixes
    let rolledInjury: CriticalInjury | undefined = undefined;
    if (isCritInjury) {
      const d1 = rollD6();
      const d2 = rollD6();
      const rollNumber = d1 + d2;
      rolledInjury = character.criticalInjuries.find(
        (inj) => inj.location === hitLocation && inj.rollNumber === rollNumber
      );
    }

    setCalcResult({
      rawDamage,
      isCritInjury,
      critBonusDamage,
      totalDamageBeforeArmor,
      shieldDamageTaken,
      shieldDestroyed,
      remainingShieldHp,
      effectiveSp,
      isPenetrated,
      penetratingDamage,
      headshotMultiplier,
      finalHpDamage,
      ablationAmount,
      newSp,
      newHp,
      rolledInjury
    });

    setIsCalculated(true);

    if (isCritInjury) {
      setTimeout(() => sfx.playCritSuccess(), 100);
    }
  };

  const handleApplyDamageToCharacter = () => {
    if (!calcResult) return;
    sfx.playClick();

    // 1. Update Armor SP
    const updatedArmor = { ...character.armor };
    if (hitLocation === 'head') {
      updatedArmor.head = {
        ...updatedArmor.head,
        spCurrent: calcResult.newSp
      };
    } else {
      updatedArmor.body = {
        ...updatedArmor.body,
        spCurrent: calcResult.newSp
      };
    }

    // 2. Update Critical Injuries if rolled
    let updatedInjuries = character.criticalInjuries;
    if (calcResult.rolledInjury) {
      updatedInjuries = character.criticalInjuries.map((inj) => {
        if (inj.id === calcResult.rolledInjury?.id) {
          return { ...inj, isActive: true };
        }
        return inj;
      });
    }

    onUpdateCharacter({
      ...character,
      hpCurrent: calcResult.newHp,
      armor: updatedArmor,
      criticalInjuries: updatedInjuries
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm animate-fade-in no-print">
      <div className="bg-zinc-900 border-2 border-red-600 w-full max-w-xl rounded-lg shadow-2xl shadow-red-950 flex flex-col max-h-[94dvh] sm:max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-zinc-950 border-b border-red-800">
          <div className="flex items-center gap-2 text-red-500 font-orbitron font-bold">
            <HeartCrack size={20} className="animate-pulse" />
            <span className="tracking-wider uppercase text-sm sm:text-base">
              {lang === 'ru' ? 'Калькулятор урона и абляции брони (CPR)' : 'Damage & Armor Ablation Calculator (CPR)'}
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

        {/* Form Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 flex-1">
          {/* Location & Attack type selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Hit Location */}
            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                {lang === 'ru' ? 'Локация попадания' : 'Hit Location'}
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setHitLocation('body');
                    setIsCalculated(false);
                  }}
                  className={`py-2 px-3 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    hitLocation === 'body'
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <ShieldCheck size={14} />
                  <span>{lang === 'ru' ? 'Тело' : 'Body'} (SP {character.armor.body.spCurrent})</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    sfx.playClick();
                    setHitLocation('head');
                    setIsCalculated(false);
                  }}
                  className={`py-2 px-3 rounded text-xs font-bold transition flex items-center justify-center gap-1.5 border ${
                    hitLocation === 'head'
                      ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950'
                      : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <Crosshair size={14} />
                  <span>{lang === 'ru' ? 'Голова x2' : 'Head x2'} (SP {character.armor.head.spCurrent})</span>
                </button>
              </div>
            </div>

            {/* Attack Type */}
            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                {lang === 'ru' ? 'Тип атаки и боеприпасов' : 'Attack & Ammo Type'}
              </label>
              <select
                value={attackType}
                onChange={(e) => {
                  setAttackType(e.target.value as AttackType);
                  setIsCalculated(false);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-2 text-xs text-zinc-100 font-semibold focus:border-red-500 focus:outline-none"
              >
                <option value="ranged">
                  {lang === 'ru' ? 'Стандартная / Огнестрел (Абляция -1 SP)' : 'Standard / Ranged (Ablation -1 SP)'}
                </option>
                <option value="melee">
                  {lang === 'ru' ? 'Холодное оружие / Боевые искусства (Игнорирует 50% SP!)' : 'Melee / Martial Arts (Ignores 50% SP!)'}
                </option>
                <option value="ap">
                  {lang === 'ru' ? 'Бронебойные патроны (AP) (Абляция -2 SP!)' : 'Armor-Piercing (AP) (Ablation -2 SP!)'}
                </option>
              </select>
            </div>
          </div>

          {/* Shield option */}
          <div className="bg-zinc-950 border border-zinc-800 p-2.5 rounded-lg flex items-center justify-between text-xs">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={hasShield}
                onChange={(e) => {
                  setHasShield(e.target.checked);
                  setIsCalculated(false);
                }}
                className="w-4 h-4 rounded accent-red-600 bg-zinc-900 border-zinc-700"
              />
              <span className="font-semibold text-zinc-200">
                {lang === 'ru' ? 'Защитный щит (Bulletproof Shield)' : 'Bulletproof Shield'}
              </span>
            </label>

            {hasShield && (
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-400 text-[11px]">{lang === 'ru' ? 'HP щита:' : 'Shield HP:'}</span>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={shieldHp}
                  onChange={(e) => setShieldHp(parseInt(e.target.value, 10) || 0)}
                  className="w-14 bg-zinc-900 border border-zinc-700 rounded px-1.5 py-0.5 text-center font-bold text-yellow-400"
                />
              </div>
            )}
          </div>

          {/* Damage Input Options */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs text-zinc-400 uppercase font-semibold">
                {lang === 'ru' ? 'Входящий урон' : 'Incoming Damage'}
              </label>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setDamageInputMode('dice')}
                  className={`px-2 py-0.5 rounded font-semibold ${
                    damageInputMode === 'dice' ? 'bg-red-950 text-red-400 border border-red-800' : 'text-zinc-500'
                  }`}
                >
                  {lang === 'ru' ? 'Бросить Nd6' : 'Roll Nd6'}
                </button>
                <button
                  type="button"
                  onClick={() => setDamageInputMode('manual')}
                  className={`px-2 py-0.5 rounded font-semibold ${
                    damageInputMode === 'manual' ? 'bg-red-950 text-red-400 border border-red-800' : 'text-zinc-500'
                  }`}
                >
                  {lang === 'ru' ? 'Число урона' : 'Manual Flat'}
                </button>
              </div>
            </div>

            {damageInputMode === 'dice' ? (
              <div className="space-y-2">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <input
                    type="text"
                    value={diceFormula}
                    onChange={(e) => {
                      setDiceFormula(e.target.value);
                      setIsCalculated(false);
                    }}
                    placeholder="e.g. 3d6, 4d6, 5d6"
                    className="flex-1 bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-bold text-center text-sm focus:border-red-500 focus:outline-none font-mono min-h-[38px]"
                  />
                  <div className="flex flex-wrap gap-1.5 justify-center sm:justify-start">
                    {['2d6', '3d6', '4d6', '5d6'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setDiceFormula(preset);
                          setIsCalculated(false);
                        }}
                        className="px-2.5 py-1.5 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded text-xs text-zinc-200 font-mono font-bold min-h-[34px] min-w-[40px] flex items-center justify-center transition"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>

                {rolledDice.length > 0 && (
                  <div className="flex items-center gap-1.5 text-xs text-zinc-400 bg-zinc-950 p-2 rounded border border-zinc-850 overflow-x-auto">
                    <span className="shrink-0">{lang === 'ru' ? 'Выпало на кубиках:' : 'Rolled Dice:'}</span>
                    <div className="flex gap-1">
                      {rolledDice.map((d, i) => (
                        <span
                          key={i}
                          className={`w-6 h-6 rounded flex items-center justify-center font-bold font-mono text-xs ${
                            d === 6 ? 'bg-amber-600 text-black animate-pulse' : 'bg-zinc-800 text-zinc-200'
                          }`}
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <input
                type="number"
                min="0"
                value={manualDamage}
                onChange={(e) => {
                  setManualDamage(parseInt(e.target.value, 10) || 0);
                  setIsCalculated(false);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-2 text-zinc-100 font-bold text-center text-lg focus:border-red-500 focus:outline-none min-h-[42px]"
              />
            )}
          </div>

          {/* Calculate button */}
          <button
            type="button"
            onClick={handleRollAndCalculate}
            className="w-full py-2.5 min-h-[42px] bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-2 shadow-lg shadow-red-950"
          >
            <Dices size={16} />
            {lang === 'ru' ? 'РАССЧИТАТЬ УРОН И АБЛЯЦИЮ' : 'CALCULATE DAMAGE & ABLATION'}
          </button>

          {/* RESULTS CARD */}
          {isCalculated && calcResult && (
            <div className="bg-zinc-950 border border-red-800 rounded-lg p-3 sm:p-4 space-y-3 animate-fade-in">
              <div className="flex items-center justify-between border-b border-zinc-850 pb-2">
                <span className="font-orbitron font-bold text-xs uppercase text-yellow-400">
                  {lang === 'ru' ? 'Результат попадания' : 'Hit Result'} ({hitLocation === 'head' ? (lang === 'ru' ? 'Голова' : 'Head') : (lang === 'ru' ? 'Тело' : 'Body')})
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                    calcResult.isPenetrated
                      ? 'bg-red-600 text-white'
                      : 'bg-emerald-900 text-emerald-300'
                  }`}
                >
                  {calcResult.isPenetrated ? (lang === 'ru' ? 'БРОНЯ ПРОБИТА!' : 'ARMOR PENETRATED!') : (lang === 'ru' ? 'БРОНЯ ВЫДЕРЖАЛА!' : 'ARMOR DEFENDED!')}
                </span>
              </div>

              {/* Step-by-step breakdown */}
              <div className="space-y-1.5 text-xs text-zinc-300 font-mono">
                <div className="flex justify-between">
                  <span className="text-zinc-500">{lang === 'ru' ? 'Входящий урон:' : 'Incoming Damage:'}</span>
                  <span className="font-bold text-white">{calcResult.totalDamageBeforeArmor}</span>
                </div>

                {hasShield && (
                  <div className="flex justify-between text-yellow-400">
                    <span>{lang === 'ru' ? 'Поглощено щитом:' : 'Absorbed by Shield:'}</span>
                    <span>-{calcResult.shieldDamageTaken} HP ({calcResult.shieldDestroyed ? (lang === 'ru' ? 'Щит РАЗРУШЕН!' : 'Shield DESTROYED!') : (lang === 'ru' ? `Осталось ${calcResult.remainingShieldHp} HP` : `${calcResult.remainingShieldHp} HP remaining`)})</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-zinc-500">
                    {lang === 'ru' ? 'SP брони' : 'Armor SP'} ({currentArmor.name}):
                  </span>
                  <span className="font-bold text-zinc-200">
                    {currentSp} {attackType === 'melee' ? (lang === 'ru' ? `➔ ${calcResult.effectiveSp} (игнор 50%)` : `➔ ${calcResult.effectiveSp} (50% ignored)`) : ''}
                  </span>
                </div>

                {calcResult.isPenetrated ? (
                  <>
                    <div className="flex justify-between text-red-400">
                      <span>{lang === 'ru' ? 'Пробивающий урон:' : 'Penetrating Damage:'}</span>
                      <span>{calcResult.penetratingDamage}</span>
                    </div>

                    {calcResult.headshotMultiplier > 1 && (
                      <div className="flex justify-between text-amber-400 font-bold">
                        <span>{lang === 'ru' ? 'Множитель выстрела в голову:' : 'Headshot Multiplier:'}</span>
                        <span>x2 (+{calcResult.penetratingDamage} {lang === 'ru' ? 'доп.' : 'bonus'})</span>
                      </div>
                    )}

                    {calcResult.isCritInjury && (
                      <div className="flex justify-between text-amber-300 font-bold">
                        <span>{lang === 'ru' ? 'Критическое ранение (две 6):' : 'Critical Injury (two 6s):'}</span>
                        <span>{lang === 'ru' ? '+5 урона напрямую в ОЗ!' : '+5 damage directly to HP!'}</span>
                      </div>
                    )}

                    <div className="flex justify-between text-red-300">
                      <span>{lang === 'ru' ? 'Абляция брони' : 'Armor Ablation'} ({attackType === 'ap' ? (lang === 'ru' ? 'AP патроны' : 'AP ammo') : (lang === 'ru' ? 'стандарт' : 'standard')}):</span>
                      <span className="font-bold">-{calcResult.ablationAmount} SP ({currentSp} ➔ {calcResult.newSp})</span>
                    </div>
                  </>
                ) : (
                  <div className="text-emerald-400 text-[11px] pt-1">
                    {lang === 'ru' ? 'Броня полностью поглотила урон. Броня не повреждена (абляция 0 SP).' : 'Armor absorbed all damage. Armor takes no damage (0 SP ablation).'}
                  </div>
                )}
              </div>

              {/* Critical Injury Alert */}
              {calcResult.rolledInjury && (
                <div className="p-2.5 bg-red-950/60 border border-red-600 rounded text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-orbitron font-bold text-red-400 uppercase">
                    <Flame size={14} />
                    <span>{lang === 'ru' ? 'Получена критическая травма:' : 'Suffered Critical Injury:'} {lang === 'ru' ? calcResult.rolledInjury.nameRu : calcResult.rolledInjury.nameEn}!</span>
                  </div>
                  <div className="text-[11px] text-zinc-300">
                    {lang === 'ru' ? calcResult.rolledInjury.effectRu : calcResult.rolledInjury.effectEn}
                  </div>
                </div>
              )}

              {/* Final Summary Banner */}
              <div className="pt-2 border-t border-zinc-850 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] uppercase text-zinc-400 block font-semibold">
                    {lang === 'ru' ? 'Итоговый урон по ОЗ' : 'Final HP Damage'}
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="font-orbitron font-black text-2xl text-red-500">
                      -{calcResult.finalHpDamage} HP
                    </span>
                    <span className="text-zinc-500 text-xs">
                      ({character.hpCurrent} ➔ {calcResult.newHp})
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleApplyDamageToCharacter}
                  className="w-full sm:w-auto px-4 py-2.5 min-h-[42px] bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded shadow-md shadow-red-950 transition flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 size={16} />
                  {lang === 'ru' ? 'ПРИМЕНИТЬ К ПЕРСОНАЖУ' : 'APPLY TO CHARACTER'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
