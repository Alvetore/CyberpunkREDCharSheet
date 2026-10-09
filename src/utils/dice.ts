import { RollResult } from '../types/character';
import { sfx } from './audio';
import confetti from 'canvas-confetti';

export function rollD10(): number {
  return Math.floor(Math.random() * 10) + 1;
}

export function rollD6(): number {
  return Math.floor(Math.random() * 6) + 1;
}

export interface RollCheckOptions {
  title: string;
  type?: RollResult['type'];
  baseVal: number; // Stat + Skill
  luckSpent?: number;
  modifiers?: { name: string; val: number }[];
  targetDv?: number;
}

export function executeCyberpunkCheck(options: RollCheckOptions): RollResult {
  sfx.playDiceRoll();

  const firstDie = rollD10();
  let d10Total = firstDie;
  let isCritSuccess = false;
  let isCritFail = false;
  const explodedD10s: number[] = [];
  let critFailD10: number | undefined;

  if (firstDie === 10) {
    isCritSuccess = true;
    const secondDie = rollD10();
    explodedD10s.push(secondDie);
    d10Total += secondDie;
    setTimeout(() => {
      sfx.playCritSuccess();
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#e11d48', '#facc15', '#06b6d4']
        });
      } catch {
        // ignore if confetti unavailable
      }
    }, 150);
  } else if (firstDie === 1) {
    isCritFail = true;
    const penaltyDie = rollD10();
    critFailD10 = penaltyDie;
    d10Total -= penaltyDie;
    setTimeout(() => {
      sfx.playCritFailure();
    }, 150);
  }

  const luck = options.luckSpent || 0;
  const modSum = (options.modifiers || []).reduce((acc, m) => acc + m.val, 0);

  const total = d10Total + options.baseVal + luck + modSum;

  let isSuccess: boolean | undefined = undefined;
  let margin: number | undefined = undefined;

  if (options.targetDv !== undefined && options.targetDv !== null) {
    // In CPR, you must MEET or BEAT the DV (Total >= DV)
    isSuccess = total >= options.targetDv;
    margin = total - options.targetDv;
  }

  let summary = `1d10(${firstDie})`;
  if (isCritSuccess) {
    summary += ` + Крит(+${explodedD10s[0]})`;
  } else if (isCritFail && critFailD10) {
    summary += ` - Провал(-${critFailD10})`;
  }
  summary += ` + База(${options.baseVal})`;
  if (luck > 0) summary += ` + Удача(${luck})`;
  if (modSum !== 0) {
    summary += ` ${modSum > 0 ? '+' : ''}${modSum}(мод.)`;
  }
  summary += ` = ${total}`;

  return {
    id: 'roll-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
    title: options.title,
    type: options.type || 'skill',
    d10Result: firstDie,
    explodedD10s,
    critFailD10,
    diceTotal: d10Total,
    baseVal: options.baseVal,
    modifiers: options.modifiers,
    luckSpent: luck,
    total,
    targetDv: options.targetDv,
    isSuccess,
    margin,
    isCritSuccess,
    isCritFail,
    summary
  };
}

export function executeDamageRoll(title: string, formula: string): RollResult {
  sfx.playDiceRoll();

  // Parse formula like "3d6", "4d6+2", "5d6"
  const match = formula.match(/^(\d+)d6(?:\+(\d+))?$/i);
  const numDice = match ? parseInt(match[1], 10) : 3;
  const flatBonus = match && match[2] ? parseInt(match[2], 10) : 0;

  const diceResults: number[] = [];
  let sixCount = 0;
  let sum = 0;

  for (let i = 0; i < numDice; i++) {
    const val = rollD6();
    diceResults.push(val);
    sum += val;
    if (val === 6) sixCount++;
  }

  // CPR Rule: If two or more sixes are rolled on damage, deals Critical Injury (+5 bonus dmg)
  const isCritInjury = sixCount >= 2;
  const bonusDamage = isCritInjury ? 5 : 0;
  const total = sum + flatBonus + bonusDamage;

  if (isCritInjury) {
    setTimeout(() => {
      sfx.playCritSuccess();
    }, 120);
  }

  let summary = `[${diceResults.join(', ')}] = ${sum}`;
  if (flatBonus > 0) summary += ` + ${flatBonus}`;
  if (isCritInjury) summary += ` + 5 (КРИТ. ТРАВМА!)`;
  summary += ` = ${total}`;

  return {
    id: 'roll-dmg-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: Date.now(),
    title: `${title} (${formula})`,
    type: 'damage',
    damageDice: diceResults,
    isCritInjury,
    bonusDamage,
    total,
    summary
  };
}

export function executeDeathSave(bodyStat: number, penalty: number): RollResult {
  sfx.playDiceRoll();

  const die = rollD10();
  const effectiveRoll = die + penalty;
  // CPR Rule: Roll 1d10 + penalties. If roll >= BODY, character fails. Must roll < BODY!
  const isSuccess = effectiveRoll < bodyStat;

  if (isSuccess) {
    setTimeout(() => sfx.playCritSuccess(), 100);
  } else {
    setTimeout(() => sfx.playCritFailure(), 100);
  }

  const summary = `1d10(${die}) + Штраф(${penalty}) = ${effectiveRoll} vs BODY(${bodyStat})`;

  return {
    id: 'roll-ds-' + Date.now(),
    timestamp: Date.now(),
    title: 'Спасбросок от смерти (Death Save)',
    type: 'death_save',
    d10Result: die,
    total: effectiveRoll,
    targetDv: bodyStat,
    isSuccess,
    summary
  };
}
