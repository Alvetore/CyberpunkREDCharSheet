import { Character } from '../types/character';
import { createEmptyCharacter } from '../data/initialData';

const isRecord = (value: unknown): value is Record<string, unknown> => value !== null && typeof value === 'object' && !Array.isArray(value);
const finite = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);
const nonnegative = (value: unknown) => finite(value) && value >= 0;
function optionalFields(value: Record<string, unknown>, validators: Record<string, (value: unknown) => boolean>): boolean {
  return Object.entries(validators).every(([key, validate]) => value[key] === undefined || validate(value[key]));
}
const text = (value: unknown) => typeof value === 'string';
const boolean = (value: unknown) => typeof value === 'boolean';
const quality = (value: unknown) => ['Poor','Standard','Excellent'].includes(value as string);
const penetration = (value: unknown) => ['none','half','ignore'].includes(value as string);
function validWeaponOptions(value: Record<string, unknown>): boolean {
  return optionalFields(value, { category:text, skillId:text, quality, standardRof:nonnegative, magCapacity:nonnegative, ammoType:text, armorPenetration:penetration, canCrit:boolean, bodyRequirement:nonnegative, autofireLimit:nonnegative });
}
function matches(value: unknown, template: unknown): boolean {
  if (typeof template === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (typeof template === 'string' || typeof template === 'boolean') return typeof value === typeof template;
  if (Array.isArray(template)) return Array.isArray(value) && (template.length === 0 || value.every(item => matches(item, template[0])));
  if (isRecord(template)) return isRecord(value) && Object.entries(template).every(([key, sample]) => matches(value[key], sample));
  return true;
}

export function isCharacter(value: unknown): value is Character {
  if (!isRecord(value)) return false;
  const template = createEmptyCharacter('Validation');
  const { avatarUrl: _avatar, ...required } = template;
  for (const key of ['vehicles','martialArtsStyle','legacyMartialArtsStyle','martialArtsLevels','automaticCyberwareEffects','soloSpotWeaknessUsed','soloDamageDeflectionUsed']) delete (required as unknown as Record<string, unknown>)[key];
  delete required.cyberdeck.slotsMax;
  // Lists have explicit element templates even when the starting character has none.
  const listTemplates = {
    weapons: { id:'', name:'', category:'', damage:'', standardRof:0, magCapacity:0, currentAmmo:0, ammoType:'', concealable:false, notes:'' },
    cyberware: { id:'', name:'', category:'', installLocation:'', humanityCost:0, description:'' },
    skills: { id:'', nameRu:'', nameEn:'', stat:'', level:0, category:'', multiplier:0 },
    programs: { id:'', name:'', category:'', atkBonus:0, defBonus:0, rezMax:0, rezCurrent:0, effect:'', isInstalled:false },
    criticalInjuries: { id:'', nameRu:'', nameEn:'', location:'', rollNumber:0, effectRu:'', effectEn:'', quickFixDv:0, treatmentDv:0, isActive:false },
    gear: { id:'', name:'', category:'', quantity:0, costEb:0, notes:'' },
  };
  for (const key of Object.keys(listTemplates) as (keyof typeof listTemplates)[]) {
    (required as unknown as Record<string, unknown>)[key] = [listTemplates[key]];
  }
  if (!matches(value, required)) return false;
  const character = value as unknown as Character;
  const roles = ['Solo','Netrunner','Tech','Medtech','Rockerboy','Media','Lawman','Exec','Fixer','Nomad'];
  if (!character.id || !character.name.trim() || !roles.includes(character.role)) return false;
  if (!Object.values(character.stats).every(n => Number.isInteger(n) && n >= 0 && n <= 30)) return false;
  if (!character.skills.every(skill => Object.hasOwn(template.stats, skill.stat) && Number.isInteger(skill.level) && skill.level >= 0 && skill.level <= 10 && [1,2].includes(skill.multiplier))) return false;
  for (const weapon of character.weapons) {
    if (weapon.profileAmmo !== undefined && (!isRecord(weapon.profileAmmo) || !Object.values(weapon.profileAmmo).every(n => nonnegative(n) && Number.isInteger(n)))) return false;
    const data = weapon as unknown as Record<string, unknown>;
    if (!validWeaponOptions(data) || !optionalFields(data, { sourceUrl:text, selectedProfile:n => Number.isInteger(n) && (n as number) >= 0 })) return false;
    if (weapon.damageProfiles !== undefined && (!Array.isArray(weapon.damageProfiles) || weapon.damageProfiles.length > 100 || !weapon.damageProfiles.every(profile => isRecord(profile) && text(profile.name) && text(profile.damage) && validWeaponOptions(profile)))) return false;
    if (weapon.selectedProfile !== undefined && weapon.selectedProfile >= Math.max(1, weapon.damageProfiles?.length ?? 0)) return false;
  }
  if (!character.programs.every(program => optionalFields(program as unknown as Record<string,unknown>, { isActive:boolean, perception:nonnegative, speed:nonnegative }))) return false;
  if (!character.cyberware.every(item => optionalFields(item as unknown as Record<string,unknown>, { humanityLoss:finite, armorSpCurrent:sp => isRecord(sp) && nonnegative(sp.head) && nonnegative(sp.body) }))) return false;
  if (value.martialArtsLevels !== undefined && (!isRecord(value.martialArtsLevels) || !Object.values(value.martialArtsLevels).every(n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 10))) return false;
  if (!['automaticCyberwareEffects','soloSpotWeaknessUsed','soloDamageDeflectionUsed'].every(key => value[key] === undefined || typeof value[key] === 'boolean')) return false;
  if (!optionalFields(value, { avatarUrl:text, martialArtsStyle:text, legacyMartialArtsStyle:text })) return false;
  if (character.cyberdeck.slotsMax !== undefined && (!Number.isInteger(character.cyberdeck.slotsMax) || character.cyberdeck.slotsMax < 1)) return false;
  if (!['hpMaxManual','humanityMaxManual'].every(key => value[key] === undefined || (typeof value[key] === 'number' && Number.isFinite(value[key]) && (value[key] as number) >= 0))) return false;
  if (character.armor.shield && !matches(character.armor.shield, {id:'',name:'',location:'',spMax:0,spCurrent:0,penalty:0})) return false;
  if (value.vehicles !== undefined && (!Array.isArray(value.vehicles) || !value.vehicles.every(item => matches(item, {id:'',name:'',model:'',category:'',sdpMax:0,sdpCurrent:0,seats:typeof (item as Record<string,unknown>)?.seats === 'number' ? 0 : '',speedCombat:'',speedNarrative:'',costEb:0,notes:''})))) return false;
  if (character.vehicles?.some(vehicle => !optionalFields(vehicle as unknown as Record<string,unknown>, { armorSp:nonnegative, nomadRankReq:nonnegative, upgrades:upgrades => Array.isArray(upgrades) && upgrades.every(text) }))) return false;
  return true;
}

export function isCharacterCollection(value: unknown): value is Character[] {
  return Array.isArray(value) && value.length > 0 && value.every(isCharacter) && new Set(value.map(item => item.id)).size === value.length;
}
