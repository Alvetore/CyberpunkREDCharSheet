import { Character, CYBERWARE_SLOT_TYPES } from '../types/character';
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
  return optionalFields(value, { category:text, skillId:text, quality, standardRof:nonnegative, magCapacity:nonnegative, ammoType:text, armorPenetration:penetration, canCrit:boolean, bodyRequirement:nonnegative, autofireLimit:nonnegative, attackRequiresRoll:boolean, sourceCyberwareId:text });
}
const slotNumber = (value: unknown) => nonnegative(value) && Number.isInteger(value) && (value as number) <= 1000;
const hostType = (value: unknown) => CYBERWARE_SLOT_TYPES.includes(value as typeof CYBERWARE_SLOT_TYPES[number]);
const hostTypes = (value: unknown) => Array.isArray(value) && value.length > 0 && value.length <= CYBERWARE_SLOT_TYPES.length && value.every(hostType);
const textArray = (value: unknown) => Array.isArray(value) && value.length <= 30 && value.every(text);
const mount = (value: unknown) => isRecord(value) && hostTypes(value.allowedHosts) && slotNumber(value.slots);
function validInstallRule(value: unknown): boolean {
  if (isRecord(value) && Array.isArray(value.provides)) {
    const keys = value.provides.map(pool => isRecord(pool) ? pool.key ?? pool.type : undefined);
    if (new Set(keys).size !== keys.length) return false;
  }
  return mount(value) && isRecord(value) && optionalFields(value, {
    hostCount:n => Number.isInteger(n) && (n as number) >= 1 && (n as number) <= 4,
    additionalMounts:items => Array.isArray(items) && items.length <= 8 && items.every(mount),
    provides:items => Array.isArray(items) && items.length <= 12 && items.every(pool => isRecord(pool) && hostType(pool.type) && slotNumber(pool.capacity) && optionalFields(pool,{key:text})),
    paired:boolean,maxInstances:slotNumber,requires:textArray,requiresSameHost:textArray,bodyRequirement:slotNumber,muscleGrafts:slotNumber,exclusiveGroup:text,repeatHumanityFree:boolean,notes:text,
  });
}
function validWeapon(value: unknown): boolean {
  if (!isRecord(value) || !matches(value,{name:'',category:'',damage:'',standardRof:0,magCapacity:0,ammoType:'',concealable:false,notes:''}) || !validWeaponOptions(value)) return false;
  if (!optionalFields(value,{sourceUrl:text,catalogId:text,costEb:nonnegative,isEquipped:boolean,consumable:boolean,selectedProfile:n => Number.isInteger(n) && (n as number) >= 0})) return false;
  if (value.damageProfiles !== undefined && (!Array.isArray(value.damageProfiles) || value.damageProfiles.length > 100 || !value.damageProfiles.every(profile => isRecord(profile) && text(profile.name) && text(profile.damage) && validWeaponOptions(profile)))) return false;
  if (value.selectedProfile !== undefined && (value.selectedProfile as number) >= Math.max(1, (value.damageProfiles as unknown[] | undefined)?.length ?? 0)) return false;
  return value.profileAmmo === undefined || (isRecord(value.profileAmmo) && Object.values(value.profileAmmo).every(n => nonnegative(n) && Number.isInteger(n)));
}
function matches(value: unknown, template: unknown): boolean {
  if (typeof template === 'number') return typeof value === 'number' && Number.isFinite(value);
  if (typeof template === 'string' || typeof template === 'boolean') return typeof value === typeof template;
  if (Array.isArray(template)) return Array.isArray(value) && (template.length === 0 || value.every(item => matches(item, template[0])));
  if (isRecord(template)) return isRecord(value) && Object.entries(template).every(([key, sample]) => matches(value[key], sample));
  return true;
}

function validArmor(value: unknown): boolean {
  // Keep the existing finite-number contract for SP/penalty, including legacy
  // manually edited values. Backpack metadata must not reinterpret old armor.
  return isRecord(value) && matches(value, {id:'',name:'',location:'',spMax:0,spCurrent:0,penalty:0})
    && typeof value.id === 'string' && value.id.trim().length > 0
    && ['head','body','shield'].includes(value.location as string)
    && optionalFields(value, {catalogId:text,sourceUrl:text,costEb:nonnegative,notes:text});
}

export function isCharacter(value: unknown): value is Character {
  if (!isRecord(value)) return false;
  const template = createEmptyCharacter('Validation');
  const { avatarUrl: _avatar, reputation: _reputation, ...required } = template;
  for (const key of ['vehicles','spareArmor','martialArtsStyle','legacyMartialArtsStyle','martialArtsLevels','automaticCyberwareEffects','soloSpotWeaknessUsed','soloDamageDeflectionUsed']) delete (required as unknown as Record<string, unknown>)[key];
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
  if (value.reputation !== undefined && (!Number.isInteger(value.reputation) || (value.reputation as number) < 0 || (value.reputation as number) > 10)) return false;
  const relationships = (entries: unknown) => Array.isArray(entries) && entries.length <= 100 && entries.every(text);
  if (!optionalFields(character.lifepath as unknown as Record<string,unknown>, {
    friendEntries:relationships,loveAffairEntries:relationships,
    enemyEntries:entries => Array.isArray(entries) && entries.length <= 100 && entries.every(row => isRecord(row) && ['who','why','resources','response'].every(key => text(row[key]))),
  })) return false;
  if (!character.gear.every(item => optionalFields(item as unknown as Record<string,unknown>, { catalogId:text,sourceUrl:text,priceLabel:text,billingPeriod:period => period === 'monthly' }))) return false;
  if (character.cyberware.some(item => !item.id) || character.weapons.some(item => !item.id) || new Set(character.cyberware.map(item => item.id)).size !== character.cyberware.length || new Set(character.weapons.map(item => item.id)).size !== character.weapons.length) return false;
  const roles = ['Solo','Netrunner','Tech','Medtech','Rockerboy','Media','Lawman','Exec','Fixer','Nomad'];
  if (!character.id || !character.name.trim() || !roles.includes(character.role)) return false;
  if (!Object.values(character.stats).every(n => Number.isInteger(n) && n >= 0 && n <= 30)) return false;
  if (!character.skills.every(skill => Object.hasOwn(template.stats, skill.stat) && Number.isInteger(skill.level) && skill.level >= 0 && skill.level <= 10 && [1,2].includes(skill.multiplier))) return false;
  for (const weapon of character.weapons) {
    if (!validWeapon(weapon)) return false;
  }
  if (!character.programs.every(program => optionalFields(program as unknown as Record<string,unknown>, { isActive:boolean, perception:nonnegative, speed:nonnegative }))) return false;
  if (!character.cyberware.every(item => optionalFields(item as unknown as Record<string,unknown>, {
    humanityLoss:nonnegative, armorSpCurrent:sp => isRecord(sp) && nonnegative(sp.head) && nonnegative(sp.body),
    catalogId:text,costEb:nonnegative,sourceUrl:text,sourceBook:text,installationFacility:text,embeddedWeaponId:text,
    kind:kind => ['implant','chip','upgrade'].includes(kind as string),borgware:boolean,humanityCostKnown:boolean,isInstalled:boolean,hasBeenInstalled:boolean,
    installedIn:textArray,installRule:validInstallRule,weapon:validWeapon,weaponMount:mount => mount === 'melee' || mount === 'ranged',
    weaponState:state => isRecord(state) && nonnegative(state.currentAmmo) && optionalFields(state,{selectedProfile:n => nonnegative(n) && Number.isInteger(n),profileAmmo:ammo => isRecord(ammo) && Object.values(ammo).every(n => nonnegative(n) && Number.isInteger(n))}),
  }))) return false;
  if (value.martialArtsLevels !== undefined && (!isRecord(value.martialArtsLevels) || !Object.values(value.martialArtsLevels).every(n => typeof n === 'number' && Number.isInteger(n) && n >= 0 && n <= 10))) return false;
  if (!['automaticCyberwareEffects','soloSpotWeaknessUsed','soloDamageDeflectionUsed'].every(key => value[key] === undefined || typeof value[key] === 'boolean')) return false;
  if (!optionalFields(value, { avatarUrl:text, martialArtsStyle:text, legacyMartialArtsStyle:text })) return false;
  if (character.cyberdeck.slotsMax !== undefined && (!Number.isInteger(character.cyberdeck.slotsMax) || character.cyberdeck.slotsMax < 1)) return false;
  if (!['hpMaxManual','humanityMaxManual'].every(key => value[key] === undefined || (typeof value[key] === 'number' && Number.isFinite(value[key]) && (value[key] as number) >= 0))) return false;
  if (value.spareArmor !== undefined && (!Array.isArray(value.spareArmor) || !value.spareArmor.every(validArmor))) return false;
  const armor = [character.armor.head, character.armor.body, ...(character.armor.shield === undefined ? [] : [character.armor.shield]), ...(character.spareArmor ?? [])];
  if (!armor.every(validArmor) || new Set(armor.map(item => item.id)).size !== armor.length) return false;
  if (value.vehicles !== undefined && (!Array.isArray(value.vehicles) || !value.vehicles.every(item => matches(item, {id:'',name:'',model:'',category:'',sdpMax:0,sdpCurrent:0,seats:typeof (item as Record<string,unknown>)?.seats === 'number' ? 0 : '',speedCombat:'',speedNarrative:'',costEb:0,notes:''})))) return false;
  if (character.vehicles?.some(vehicle => !optionalFields(vehicle as unknown as Record<string,unknown>, { catalogId:text,sourceUrl:text,priceLabel:text,nomadRankLabel:text,armorSp:nonnegative, nomadRankReq:nonnegative, upgrades:upgrades => Array.isArray(upgrades) && upgrades.every(text) }))) return false;
  return true;
}

export function isCharacterCollection(value: unknown): value is Character[] {
  return Array.isArray(value) && value.length > 0 && value.every(isCharacter) && new Set(value.map(item => item.id)).size === value.length;
}
