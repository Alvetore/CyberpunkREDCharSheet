import type { Character, RollResult } from '../types/character';
import { effectiveStat, injuryActionPenalty, skillBase, woundPenalty } from './rules';
import { executeCyberpunkCheck, rollD10, rollD6 } from './dice';

export const execTeamSize = (rank:number) => rank >= 9 ? 3 : rank >= 5 ? 2 : rank >= 3 ? 1 : 0;
export const mediaBelievability = (rank:number) => rank >= 10 ? 7 : rank >= 9 ? 6 : Math.floor((rank + 1) / 2) + 1;
export const fixerReach = (rank:number) => rank >= 10 ? '10,000+ eb (Супер-роскошь / Super Luxury)' : rank >= 9 ? '10,000 eb (Роскошь / Luxury)' : rank >= 7 ? '5,000 eb (Очень дорогие / Very Expensive)' : rank >= 5 ? '1,000 eb (Дорогие / Expensive)' : rank >= 3 ? '500 eb (Премиум / Premium)' : '20 eb (Повседневные / Everyday)';
export const medtechSkills = (character:Character) => ({
  surgery:Math.min(10,2*character.roleAbilities.medtech.surgery),
  medicalTech:Math.min(10,character.roleAbilities.medtech.medicalTech + character.roleAbilities.medtech.pharmaceuticals),
});

export function rollRoleSkill(character:Character, title:string, base:number, lang:'ru'|'en', dv?:number) {
  return executeCyberpunkCheck({title,baseVal:base,targetDv:dv,type:'custom',lang});
}

// These role abilities use a single die and their own comparison, without
// critical d10 expansion, STAT bonuses or Luck (Core pp.151–155).
function singleDieResult(title:string, die:number, threshold:number, success:boolean, summary:string):RollResult {
  return { id:crypto.randomUUID(),timestamp:Date.now(),title,type:'custom',diceTotal:die,total:die,targetDv:threshold,isSuccess:success,summary };
}
export function rollMediaStory(character:Character,easyEvidence:boolean,hardEvidence:number,lang:'ru'|'en'):RollResult {
  const threshold=mediaBelievability(character.roleRank)+(easyEvidence?1:0)+(hardEvidence>=4?2:0);
  const die=rollD10();
  return singleDieResult(lang==='ru'?'Медиа: убедительность публикации':'Media: story believability',die,threshold,die<=threshold,`1d10 (${die}) ≤ ${threshold}; ${lang==='ru'?'без Удачи и критических бросков':'no Luck or critical dice'}`);
}
export function rollLawmanBackup(character:Character,lang:'ru'|'en'):RollResult {
  const die=rollD10(), success=die<=character.roleRank;
  const eta=success?rollD6():0;
  const summary=`1d10 (${die}) ≤ ${character.roleRank}. `+(success ? (lang==='ru'?`Прибытие через ${eta} раундов.`:`Arrival in ${eta} rounds.`)+(eta===6?(lang==='ru'?' На 6 прибывает следующая группа подкрепления; на ранге 10 — две группы.':'On 6, the next higher backup tier arrives; at rank 10, two groups arrive.'):'') : (lang==='ru'?'Нет ответа; повторная попытка в следующий ход.':'No response; retry next turn.'));
  return singleDieResult(lang==='ru'?'Законник: подкрепление':'Lawman: Backup',die,character.roleRank,success,summary);
}
export function rollExecLoyalty(name:string,loyalty:number,lang:'ru'|'en'):RollResult {
  const die=rollD6();
  return singleDieResult(`${lang==='ru'?'Лояльность':'Loyalty'}: ${name}`,die,loyalty,die<loyalty,`1d6 (${die}) < ${loyalty}`);
}
export function roleTechnicalBase(character:Character, specialty:number):number {
  return effectiveStat(character,'TECH')+specialty+woundPenalty(character)+injuryActionPenalty(character);
}
export function charismaticImpactBase(character:Character):number {
  return character.roleRank+woundPenalty(character)+injuryActionPenalty(character);
}
export function fixerTradingBase(character:Character):number { return skillBase(character,'trading'); }
