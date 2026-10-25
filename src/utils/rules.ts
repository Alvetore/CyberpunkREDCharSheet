import { Character, CriticalInjury, ProgramItem, StatKey, Weapon } from '../types/character';
import { calculateHumanityStats, getRoleSkillBonus } from './roleUtils';
import { cyberwareBody, functionalCyberware } from './cyberware';
export { initializeCyberware } from './cyberware';

export function armorPenalty(character: Character): number {
  const heavySubdermal = character.automaticCyberwareEffects && cyberwareBody(character) < 14 && functionalCyberware(character).some(item => /heavy subdermal|тяжелая подкожная|тяжёлая подкожная/i.test(item.name));
  return Math.min(0, character.armor.head.penalty, character.armor.body.penalty, heavySubdermal ? -2 : 0);
}

export function effectiveStat(character: Character, key: StatKey): number {
  let value = key === 'EMP' ? calculateHumanityStats(character).currentEmp : character.stats[key];
  value += character.statMods[key] || 0;
  if (key === 'BODY') value = cyberwareBody(character);
  if (key === 'REF' || key === 'DEX' || key === 'MOVE') value = Math.max(0, value + armorPenalty(character));
  if (key === 'MOVE') {
    if (character.hpCurrent <= 0) value -= 6;
    for (const injury of character.criticalInjuries.filter(item => item.isActive && item.location === 'body')) {
      if (injury.rollNumber === 4) value -= 2;
      if (injury.rollNumber === 8) value -= 4;
      if (injury.rollNumber === 12) value -= 6;
    }
    if (character.hpCurrent <= 0 || character.criticalInjuries.some(item => item.isActive && item.location === 'body' && [4, 8, 12].includes(item.rollNumber))) value = Math.max(1, value);
  }
  return value;
}

export function maxHP(character: Character): number {
  return character.hpMaxManual ?? (10 + 5 * Math.ceil((effectiveStat(character, 'BODY') + effectiveStat(character, 'WILL')) / 2));
}

export function woundPenalty(character: Character): number {
  return character.hpCurrent <= 0 ? -4 : character.hpCurrent < Math.ceil(maxHP(character) / 2) ? -2 : 0;
}

export function injuryActionPenalty(character: Character): number {
  return character.criticalInjuries.filter(injury => injury.isActive && injury.location === 'head' && [3, 5].includes(injury.rollNumber)).length * -2;
}

export function injuryDeathPenalty(character: Character): number {
  return character.criticalInjuries.filter(injury => injury.isActive && (injury.location === 'head' ? [2, 3, 4, 8, 9, 11, 12] : [2, 3, 4, 10, 12]).includes(injury.rollNumber)).length;
}

export function skillBase(character: Character, skillId: string): number {
  const skill = character.skills.find(item => item.id === skillId);
  if (!skill) return 0;
  const level = skillId === 'martial_arts' ? martialArtsLevel(character) : skill.level;
  let penalty = woundPenalty(character) + injuryActionPenalty(character);
  if (['brawling', 'melee_weapon', 'martial_arts'].includes(skillId) && character.criticalInjuries.some(item => item.isActive && item.location === 'body' && item.rollNumber === 9)) penalty -= 2;
  return effectiveStat(character, skill.stat) + level + getRoleSkillBonus(character, skillId).bonus + penalty;
}

export function martialArtsLevel(character: Character): number {
  const style = character.martialArtsStyle || 'Karate';
  return character.martialArtsLevels?.[style] ?? (style === (character.legacyMartialArtsStyle || 'Karate') ? character.skills.find(skill => skill.id === 'martial_arts')?.level || 0 : 0);
}

export function weaponAttackBase(character: Character, weapon: Weapon): number {
  const skill = character.skills.find(item => item.id === weapon.skillId);
  const key = skill?.stat ?? (weapon.category.includes('Melee') ? 'DEX' : 'REF');
  let base = skill ? skillBase(character, skill.id) : effectiveStat(character, key) + woundPenalty(character) + injuryActionPenalty(character);
  base += soloPrecisionBonus(character);
  if (weapon.quality === 'Excellent') base += 1;
  if (!weapon.category.includes('Melee') && !['brawling', 'martial_arts'].includes(weapon.skillId || '') && character.criticalInjuries.some(item => item.isActive && item.location === 'head' && [2, 4].includes(item.rollNumber))) base -= 4;
  return base;
}

export function soloPrecisionBonus(character:Character):number {
  return character.role === 'Solo' ? Math.floor(character.roleAbilities.solo.precisionAttack / 3) : 0;
}

export function selectedWeaponProfile(weapon: Weapon): Weapon {
  const profile = weapon.damageProfiles?.[weapon.selectedProfile ?? 0];
  if (!profile) return weapon;
  const selected = { ...weapon, ...profile, name: weapon.name };
  const ammo = magazineKey(selected) === magazineKey(weapon) ? weapon.currentAmmo : weapon.profileAmmo?.[magazineKey(selected)] ?? 0;
  return { ...selected, currentAmmo: Math.max(0, Math.min(ammo, selected.magCapacity)) };
}

function magazineKey(weapon: Weapon): string {
  return JSON.stringify([weapon.ammoType, weapon.magCapacity]);
}

/** Mutates the selected magazine on the stored weapon, never on its display profile. */
export function updateWeaponAmmo(weapon: Weapon, change: number | 'reload'): Weapon {
  const selected = selectedWeaponProfile(weapon);
  if (selected.consumable && (change === 'reload' || change > 0)) return weapon;
  if (typeof change === 'number' && selected.currentAmmo + change < 0) return weapon;
  const currentAmmo = change === 'reload' ? selected.magCapacity : Math.max(0, Math.min(selected.magCapacity, selected.currentAmmo + change));
  return magazineKey(selected) === magazineKey(weapon)
    ? { ...weapon, currentAmmo }
    : { ...weapon, profileAmmo: { ...weapon.profileAmmo, [magazineKey(selected)]: currentAmmo } };
}

export function weaponPenetration(weapon: Weapon): 'none' | 'half' | 'ignore' {
  return weapon.armorPenetration ?? (weapon.skillId === 'melee_weapon' || weapon.skillId === 'martial_arts' || weapon.category.includes('Melee') ? 'half' : 'none');
}

export function initiativeBase(character: Character): number {
  const cyberBonus = character.automaticCyberwareEffects && functionalCyberware(character).some(item => /kerenzikov|керензиков/i.test(item.name)) ? 2 : 0;
  return effectiveStat(character, 'REF') + cyberBonus + (character.role === 'Solo' ? character.roleAbilities.solo.initiativeReaction : 0);
}

export function effectiveSP(character: Character, location: 'head' | 'body'): number {
  const armor = character.armor[location].spCurrent;
  if (!character.automaticCyberwareEffects) return armor;
  return Math.max(armor, ...functionalCyberware(character).map(item => item.armorSpCurrent?.[location] ?? 0));
}

export function programSlots(program: ProgramItem): number { return program.category === 'Black ICE' ? 2 : 1; }
export function usedDeckSlots(character: Character): number {
  if (character.cyberdeck.isOwned === false) return 0;
  return character.cyberdeck.hardwareSlotsUsed + character.programs.filter(item => item.isInstalled).reduce((sum, item) => sum + programSlots(item), 0);
}
export function deckCapacity(character: Character): number {
  if (character.cyberdeck.isOwned === false) return 0;
  return character.cyberdeck.slotsMax ?? character.cyberdeck.programSlotsMax + character.cyberdeck.hardwareSlotsMax;
}
export function netActionBase(character: Character, action: string, bonus = 0): number {
  const program = /pathfinder|следопыт/i.test(action) ? 'SeeYa' : /cloak|плащ/i.test(action) ? 'Eraser' : /backdoor|взлом/i.test(action) ? 'Worm' : '';
  const booster = character.programs.some(item => item.name === program && item.isInstalled && item.isActive && item.rezCurrent > 0) ? 2 : 0;
  return interfaceRank(character) + bonus + booster + woundPenalty(character) + injuryActionPenalty(character);
}

export function interfaceRank(character: Character): number {
  return character.role === 'Netrunner' ? character.roleRank : 0;
}

export function rollNewInjury(injuries: CriticalInjury[], location: 'head' | 'body', die: () => number): CriticalInjury | undefined {
  const available = injuries.filter(item => item.location === location && !item.isActive);
  if (!available.length) return undefined;
  for (let attempt = 0; attempt < 100; attempt++) {
    const roll = die() + die();
    const injury = available.find(item => item.rollNumber === roll);
    if (injury) return injury;
  }
  // A bounded fallback avoids hanging if an RNG or imported injury table is defective.
  return available[Math.min(available.length - 1, Math.floor((die() - 1) * available.length / 6))];
}
