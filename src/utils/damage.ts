import { Character, CriticalInjury } from '../types/character';
import { effectiveSP, rollNewInjury } from './rules';
import { functionalCyberware } from './cyberware';

export interface DamageOptions {
  location: 'head' | 'body';
  attackType: 'ranged' | 'melee' | 'ap' | 'brawling' | 'direct';
  rawDamage: number;
  critical: boolean;
  hasShield: boolean;
  shieldHp: number;
}

export function resolveDamage(character: Character, options: DamageOptions, die: () => number) {
  const { location, attackType } = options;
  const rawDamage = Math.max(0, options.rawDamage);
  const blockedByShield = options.hasShield && options.shieldHp > 0 && attackType !== 'direct';
  const shieldDamageTaken = blockedByShield ? Math.min(options.shieldHp, rawDamage) : 0;
  const remainingShieldHp = Math.max(0, options.shieldHp - shieldDamageTaken);
  const damageToArmor = blockedByShield ? 0 : rawDamage;
  const currentSp = effectiveSP(character, location);
  const effectiveSp = attackType === 'direct' ? 0 : attackType === 'melee' ? Math.ceil(currentSp / 2) : currentSp;
  const isPenetrated = damageToArmor > effectiveSp;
  const penetratingDamage = Math.max(0, damageToArmor - effectiveSp);
  const fracturedSkull = character.criticalInjuries.some(item => item.isActive && item.location === 'head' && item.rollNumber === 9);
  const headshotMultiplier = location === 'head' && attackType !== 'direct' ? (fracturedSkull ? 3 : 2) : 1;
  const mortalHit = character.hpCurrent <= 0 && !blockedByShield && isPenetrated;
  const isCritInjury = !blockedByShield && ((attackType !== 'direct' && options.critical) || mortalHit);
  const critBonusDamage = isCritInjury ? 5 : 0;
  const ablationAmount = isPenetrated && attackType !== 'direct' ? (attackType === 'ap' ? 2 : 1) : 0;
  const deflection = character.role === 'Solo' && !character.soloDamageDeflectionUsed && attackType !== 'direct' && !blockedByShield ? Math.floor(character.roleAbilities.solo.damageAbsorb / 2) : 0;
  const finalHpDamage = Math.max(0, penetratingDamage * headshotMultiplier - deflection) + critBonusDamage;
  const rolledInjury: CriticalInjury | undefined = isCritInjury ? rollNewInjury(character.criticalInjuries, location, die) : undefined;
  return {
    rawDamage, isCritInjury, critBonusDamage, totalDamageBeforeArmor: rawDamage,
    shieldDamageTaken, shieldDestroyed: blockedByShield && remainingShieldHp === 0, remainingShieldHp,
    effectiveSp, isPenetrated, penetratingDamage, headshotMultiplier, finalHpDamage,
    ablationAmount, newSp: Math.max(0, character.armor[location].spCurrent - ablationAmount),
    newHp: Math.max(0, character.hpCurrent - finalHpDamage), rolledInjury, mortalHit,
    deflectionUsed: deflection > 0 && penetratingDamage > 0,
    characterId: character.id, snapshot: JSON.stringify(character), location,
  };
}

export function applyDamage(character: Character, result: ReturnType<typeof resolveDamage>): Character | null {
  if (result.characterId !== character.id || result.snapshot !== JSON.stringify(character)) return null;
  return {
    ...character,
    hpCurrent: result.newHp,
    deathSavePenalties: character.deathSavePenalties + (result.mortalHit ? 1 : 0),
    soloDamageDeflectionUsed: character.soloDamageDeflectionUsed || result.deflectionUsed,
    armor: {
      ...character.armor,
      [result.location]: { ...character.armor[result.location], spCurrent: result.newSp },
      ...(character.armor.shield && result.shieldDamageTaken > 0 ? { shield: { ...character.armor.shield, spCurrent: result.remainingShieldHp } } : {}),
    },
    cyberware: character.cyberware.map(item => character.automaticCyberwareEffects && functionalCyberware(character).some(active => active.id === item.id) && item.armorSpCurrent !== undefined ? { ...item, armorSpCurrent: { ...item.armorSpCurrent, [result.location]: Math.max(0, item.armorSpCurrent[result.location] - result.ablationAmount) } } : item),
    criticalInjuries: character.criticalInjuries.map(item => item.id === result.rolledInjury?.id ? { ...item, isActive: true } : item),
  };
}
