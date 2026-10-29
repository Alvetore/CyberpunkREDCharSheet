import { Character, CyberwareItem, CyberwareSlotType, Weapon } from '../types/character';
import { DATAPOOL_CYBERWARE } from '../data/datapoolCatalog';
import { gearCyberwareDevice, gearCyberwareHosts, gearForCyberwareHost } from './gearCyberware';

export interface CyberwareHost {
  id: string;
  name: string;
  type: CyberwareSlotType;
  capacity: number;
  used: number;
  ownerId?: string;
  gearId?: string;
}

const BODY_HOSTS: CyberwareHost[] = [
  { id: 'body:fashion', name: 'Fashionware', type: 'fashion', capacity: 7, used: 0 },
  { id: 'body:internal', name: 'Internal / Внутренние', type: 'internal', capacity: 7, used: 0 },
  { id: 'body:external', name: 'External / Внешние', type: 'external', capacity: 7, used: 0 },
  { id: 'body:neural', name: 'Neural foundation / Нервная система', type: 'neural-site', capacity: 1, used: 0 },
  { id: 'body:audio', name: 'Audio foundation / Слух', type: 'audio-site', capacity: 1, used: 0 },
  ...(['left','right'] as const).flatMap(side => (['arm','leg','eye'] as const).map(part => ({ id: `body:${side}-${part}`, name: `${part === 'eye' ? (side === 'left' ? 'Левый' : 'Правый') : (side === 'left' ? 'Левая' : 'Правая')} ${{arm:'рука',leg:'нога',eye:'глаз'}[part]} / ${side} ${part}`, type: `${part}-site` as CyberwareSlotType, capacity: 1, used: 0 }))),
];

export function cyberwareSlotLabel(type: CyberwareSlotType, lang: 'ru' | 'en'): string {
  const ru: Record<CyberwareSlotType,string> = { fashion:'Стилевые импланты',internal:'Внутренние импланты',external:'Внешние импланты','neural-site':'Нервная система','eye-site':'Глаз','audio-site':'Слух','arm-site':'Рука','leg-site':'Нога',neural:'Опции нейролинка',eye:'Опции киберглаза',audio:'Опции кибераудио',arm:'Опции киберруки',leg:'Опции киберноги',chip:'Разъём для щепки',finger:'Киберпальцы',gorilla:'Улучшения Руки Гориллы',mantis:'Улучшения Клинка Богомола',monowire:'Улучшения Моноструны',neuroport:'Опции Нейропорта' };
  return lang === 'ru' ? ru[type] : type.replace('-site',' foundation');
}

const legacyAliases: [RegExp, string][] = [
  [/neural link|нейролинк/i, 'Нейролинк'],
  [/interface plugs|разъемы интерфейса|разъёмы интерфейса/i, 'Личный порт'],
  [/^cybereye|киберглаз/i, 'Киберглаз'],
  [/cyberaudio suite|кибераудио/i, 'Комплекс Кибераудио'],
  [/^cyberarm|^киберрука/i, 'Киберрука'],
  [/^cyberleg|^кибернога/i, 'Кибернога'],
  [/targeting scope|прицельная сетка/i, 'Тактический прицел'],
  [/sandevistan|сандевистан/i, 'Сандевистан'],
  [/kerenzikov|керензиков/i, 'Керензиков'],
  [/subdermal armor|подкожная броня/i, 'Подкожная броня'],
  [/skinweave|тканекожа/i, 'Тканекожа'],
  [/grafted muscle|bone lace|мышечно.костный каркас/i, 'Искусственные мышцы и усиленные кости'],
  [/shift tacts/i, 'Изменчивые такты'],
];

export function cyberwareDefinition(item: CyberwareItem): CyberwareItem {
  const match = DATAPOOL_CYBERWARE.find(entry => entry.id === item.catalogId || entry.id === item.id || entry.name === item.name)
    ?? DATAPOOL_CYBERWARE.find(entry => entry.name === legacyAliases.find(([pattern]) => pattern.test(item.name))?.[1]);
  return match ? { ...match, ...item, catalogId: match.id, installRule: item.installRule ?? match.installRule, weapon: item.weapon ?? match.weapon } : item;
}

export function cyberwareMounts(item: CyberwareItem): { allowedHosts: CyberwareSlotType[]; slots: number }[] {
  const rule = cyberwareDefinition(item).installRule;
  if (!rule) return [];
  return [...Array.from({ length: rule.hostCount ?? 1 }, () => ({ allowedHosts: rule.allowedHosts, slots: rule.slots })), ...(rule.additionalMounts ?? [])];
}

function ownsHost(item: CyberwareItem, target: string): boolean {
  return (cyberwareDefinition(item).installRule?.provides ?? []).some(pool => target === `${item.id}:${pool.key ?? pool.type}`);
}

function providesPrerequisite(item: CyberwareItem, catalogId: string): boolean {
  const definition = cyberwareDefinition(item);
  return definition.catalogId === catalogId || (catalogId === 'cat-cyber-12' && !!definition.installRule?.provides?.some(pool => pool.type === 'neural')) || (catalogId === 'cat-cyber-33' && definition.catalogId === 'cat-cyber-160');
}

export function isCyberwareInstalled(character: Character, item: CyberwareItem, seen = new Set<string>()): boolean {
  if (item.isInstalled === false || seen.has(item.id)) return false;
  // Legacy records retain their previous behavior until the player assigns them.
  const visited = new Set(seen).add(item.id);
  if (cyberwareDefinition(item).installRule?.requires?.some(id => !character.cyberware.some(other => other.id !== item.id && providesPrerequisite(other,id) && isCyberwareInstalled(character,other,visited)))) return false;
  if (cyberwareDefinition(item).installRule?.requiresSameHost?.some(id => !character.cyberware.some(other => other.id !== item.id && providesPrerequisite(other,id) && other.installedIn?.[0] === item.installedIn?.[0] && isCyberwareInstalled(character,other,visited)))) return false;
  if (!item.installedIn?.length) return true;
  const mounts = cyberwareMounts(item);
  if (mounts.length !== item.installedIn.length || new Set(item.installedIn).size !== item.installedIn.length) return false;
  return item.installedIn.every((target,index) => {
    const body = BODY_HOSTS.find(host => host.id === target);
    if (body) return mounts[index].allowedHosts.includes(body.type);
    const gearHost = gearCyberwareHosts(character).find(host => host.id === target);
    if (gearHost) return mounts[index].allowedHosts.includes(gearHost.type);
    const parent = character.cyberware.find(candidate => ownsHost(candidate,target));
    const pool = parent && cyberwareDefinition(parent).installRule?.provides?.find(pool => target === `${parent.id}:${pool.key ?? pool.type}`);
    return !!parent && !!pool && mounts[index].allowedHosts.includes(pool.type) && isCyberwareInstalled(character, parent, visited);
  });
}

export function installedCyberware(character: Character): CyberwareItem[] {
  return character.cyberware.filter(item => isCyberwareInstalled(character, item)).map(cyberwareDefinition);
}

export function pairedCyberwareReady(character: Character, item: CyberwareItem): boolean {
  const definition = cyberwareDefinition(item);
  if (!definition.installRule?.paired) return true;
  const gear = gearForCyberwareHost(character, item.installedIn?.[0]);
  const device = gear && gearCyberwareDevice(gear);
  if (device && 'paired' in device && device.paired) return true;
  if (!item.installedIn?.length) return true;
  return installedCyberware(character).some(other => other.id !== item.id && !isExternalCyberware(character,other) && !isExternalCyberware(character,item) && (definition.catalogId ? other.catalogId === definition.catalogId : other.name === definition.name) && other.installedIn?.[0] && other.installedIn[0] !== item.installedIn![0]);
}

export function functionalCyberware(character: Character): CyberwareItem[] {
  const available = (item: CyberwareItem, seen = new Set<string>(), original = item): boolean => {
    if (seen.has(item.id)) return false;
    const visited = new Set(seen).add(item.id);
    return (item.installedIn ?? []).every(target => {
      const gear = gearForCyberwareHost(character,target);
      if (gear) {
        const device = gearCyberwareDevice(gear)!;
        if (!gear.wornOn || !(device.sites as readonly string[]).includes(gear.wornOn)) return false;
        if ('needsPlugs' in device && device.needsPlugs && !installedCyberware(character).some(entry => providesPrerequisite(entry,'cat-cyber-16') && !isExternalCyberware(character,entry))) return false;
        return true;
      }
      const parent = character.cyberware.find(parent => ownsHost(parent,target));
      if (parent && !available(parent,visited,original)) return false;
      const side = target.match(/^body:(left|right)-arm$/)?.[1];
      if (!side) return true;
      const glove = character.gear.find(gear => gear.quantity > 0 && gear.wornOn === `${side}-arm` && gearCyberwareDevice(gear));
      if (!glove) return true;
      const device = gearCyberwareDevice(glove)!;
      // The fingerless CyberDude leaves finger implants usable.
      const definition = cyberwareDefinition(original);
      return 'fingerless' in device && !!device.fingerless && (definition.installRule?.allowedHosts.includes('finger') || ['cat-cyber-113','cat-cyber-114','cat-cyber-116','cat-cyber-134'].includes(definition.catalogId ?? ''));
    });
  };
  return installedCyberware(character).filter(item => pairedCyberwareReady(character, item) && available(item));
}

export function isExternalCyberware(character: Character, item: CyberwareItem, seen = new Set<string>()): boolean {
  if (seen.has(item.id)) return false;
  const target = item.installedIn?.[0];
  if (gearForCyberwareHost(character,target)) return true;
  const parent = character.cyberware.find(parent => !!target && ownsHost(parent,target));
  return !!parent && isExternalCyberware(character,parent,new Set(seen).add(item.id));
}

export function cyberwareBody(character: Character): number {
  let body = character.stats.BODY + (character.statMods.BODY || 0);
  if (!character.automaticCyberwareEffects) return body;
  const names = functionalCyberware(character).map(item => item.name.toLowerCase());
  const grafts = names.filter(name => /grafted muscle|bone lace|мышечно.кост|усиленные мышцы|искусственные мышцы/.test(name)).length;
  if (grafts) body = Math.max(body, Math.min(10, body + 2 * grafts));
  if (names.some(name => /linear frame.*(?:beta|β)|эндоскелет.*(?:бета|ß)/.test(name))) return 14;
  if (names.some(name => /linear frame.*(?:sigma|∑|Σ)|эндоскелет.*(?:сигма|∑)/.test(name))) return 12;
  return body;
}

export function cyberwareCapLoss(item: CyberwareItem, character?: Character): number {
  if (character && isExternalCyberware(character,item)) return 0;
  const definition = cyberwareDefinition(item);
  return definition.humanityCost <= 0 || definition.kind === 'upgrade' ? 0 : definition.borgware || definition.category === 'Borgware' ? 4 : 2;
}

export function cyberwareHumanityCap(character: Character): number {
  return Math.max(0, (character.humanityMaxManual ?? character.stats.EMP * 10) - installedCyberware(character).reduce((sum, item) => sum + cyberwareCapLoss(item,character), 0));
}

export function initializeCyberware<T extends CyberwareItem>(item: T): T {
  const name = item.name;
  const sp = /heavy subdermal|тяжелая подкожная|тяжёлая подкожная/i.test(name) ? 13 : /subdermal armor|подкожная броня/i.test(name) ? 11 : /skinweave|тканекожа/i.test(name) ? 7 : 0;
  return sp && !item.armorSpCurrent ? { ...item, armorSpCurrent: { head: sp, body: sp } } : item;
}

export function cyberwareHosts(character: Character, excludeItemId?: string): CyberwareHost[] {
  const hosts: CyberwareHost[] = [...BODY_HOSTS.map(host => ({ ...host })), ...gearCyberwareHosts(character)];
  for (const item of installedCyberware(character)) {
    for (const pool of item.installRule?.provides ?? []) {
      hosts.push({ id: `${item.id}:${pool.key ?? pool.type}`, name: `${item.name} · ${pool.key ?? pool.type}`, type: pool.type, capacity: pool.capacity, used: 0, ownerId: item.id });
    }
  }
  for (const item of installedCyberware(character).filter(entry => entry.id !== excludeItemId)) {
    const mounts = cyberwareMounts(item);
    item.installedIn?.forEach((target, index) => {
      const host = hosts.find(entry => entry.id === target);
      if (host) host.used += mounts[index]?.slots ?? 0;
    });
  }
  return hosts;
}

const failure = (ru: string, en: string, lang: 'ru' | 'en') => lang === 'ru' ? ru : en;

export function cyberwareInstallError(character: Character, item: CyberwareItem, targets: string[], lang: 'ru' | 'en' = 'ru'): string | null {
  const definition = cyberwareDefinition(item);
  const rule = definition.installRule;
  if (!rule) return failure('У импланта не заданы правила установки. Выберите запись каталога.', 'Choose a catalog implant with installation rules.', lang);
  const mounts = cyberwareMounts(definition);
  if (targets.length !== mounts.length || new Set(targets).size !== targets.length) return failure('Выберите отдельное место для каждого крепления.', 'Choose a distinct host for each mount.', lang);
  const hosts = cyberwareHosts(character, item.id);
  const installed = installedCyberware(character).filter(entry => entry.id !== item.id);
  for (let index = 0; index < mounts.length; index++) {
    const host = hosts.find(entry => entry.id === targets[index]);
    if (!host || host.ownerId === item.id || !mounts[index].allowedHosts.includes(host.type)) return failure('Несовместимое или неустановленное основание.', 'Incompatible or uninstalled foundation.', lang);
    if (host.capacity - host.used < mounts[index].slots) return failure('В выбранном месте не хватает слотов.', 'The selected host has insufficient slots.', lang);
    // A parent cannot be moved into its own descendant.
    const descendsFromItem = (id: string | undefined, seen = new Set<string>()): boolean => {
      if (!id || seen.has(id)) return false;
      if (id === item.id) return true;
      const parent = character.cyberware.find(entry => entry.id === id);
      return !!parent?.installedIn?.some(target => descendsFromItem(hosts.find(entry => entry.id === target)?.ownerId, new Set(seen).add(id)));
    };
    if (descendsFromItem(host.ownerId)) return failure('Нельзя установить имплант в собственную опцию.', 'An implant cannot be installed in its own descendant.', lang);
  }
  const same = installed.filter(entry => definition.catalogId ? entry.catalogId === definition.catalogId : entry.name === definition.name);
  if (rule.maxInstances !== undefined && same.length >= rule.maxInstances) return failure('Достигнут предел установок этого импланта.', 'Maximum installed copies reached.', lang);
  if (rule.exclusiveGroup && installed.some(entry => entry.installRule?.exclusiveGroup === rule.exclusiveGroup)) return failure('Уже установлен несовместимый имплант этой группы.', 'An incompatible implant in this group is already installed.', lang);
  if (rule.requires?.some(id => !installed.some(entry => providesPrerequisite(entry,id)))) return failure('Сначала установите необходимые импланты из описания.', 'Install the prerequisite implants first.', lang);
  if (rule.requiresSameHost?.some(id => !installed.some(entry => providesPrerequisite(entry,id) && entry.installedIn?.[0] === targets[0]))) return failure('Необходимая опция должна быть в том же основании.', 'The prerequisite option must occupy the same foundation.', lang);
  if (definition.kind === 'upgrade' && same.some(entry => entry.installedIn?.[0] === targets[0])) return failure('Это улучшение уже установлено на выбранном оружии.', 'This upgrade is already installed on the selected weapon.', lang);
  if (rule.bodyRequirement && cyberwareBody(character) < rule.bodyRequirement) return failure(`Требуется BODY ${rule.bodyRequirement}+.`, `Requires BODY ${rule.bodyRequirement}+.`, lang);
  if (rule.muscleGrafts && installed.filter(entry => /grafted muscle|bone lace|искусственные мышцы|мышечно.кост/i.test(entry.name)).length < rule.muscleGrafts) return failure('Не хватает установленных мышечно-костных усилений.', 'Not enough muscle/bone grafts installed.', lang);
  return null;
}

export function findCyberwarePlacement(character: Character, item: CyberwareItem): string[] | null {
  const mounts = cyberwareMounts(item);
  if (!mounts.length) return null;
  const hosts = cyberwareHosts(character, item.id);
  const choose = (index: number, targets: string[]): string[] | null => {
    if (index === mounts.length) return cyberwareInstallError(character, item, targets) ? null : targets;
    for (const host of hosts.filter(entry => entry.ownerId !== item.id && mounts[index].allowedHosts.includes(entry.type) && entry.capacity - entry.used >= mounts[index].slots && !targets.includes(entry.id))) {
      const result = choose(index + 1, [...targets, host.id]);
      if (result) return result;
    }
    return null;
  };
  return choose(0, []);
}

export function mountableWeapons(character: Character, mount: 'melee' | 'ranged'): Weapon[] {
  return character.weapons.filter(weapon => !weapon.sourceCyberwareId &&
    (mount === 'melee' ? ['Light Melee','Medium Melee','Heavy Melee'].includes(weapon.category) : ['Medium Pistol','Heavy Pistol','Very Heavy Pistol','SMG','Heavy SMG'].includes(weapon.category)) &&
    !/Руки:\s*2|Hands:\s*2/i.test(weapon.notes));
}

export function installCyberware(character: Character, id: string, targets: string[], lang: 'ru' | 'en' = 'ru', embeddedWeaponId?: string): { character?: Character; error?: string } {
  const item = character.cyberware.find(entry => entry.id === id);
  if (!item) return { error: 'Implant not found' };
  const error = cyberwareInstallError(character, item, targets, lang);
  if (error) return { error };
  let definition = cyberwareDefinition(item);
  const alreadyInstalled = isCyberwareInstalled(character, item);
  let weapons = character.weapons;
  if (definition.weaponMount && (!alreadyInstalled || !definition.weapon)) {
    const embedded = mountableWeapons(character, definition.weaponMount).find(weapon => weapon.id === (embeddedWeaponId ?? item.embeddedWeaponId));
    if (!embedded) return { error: failure('Выберите имеющееся одноручное оружие для встраивания.', 'Choose an owned one-handed weapon to embed.', lang) };
    const { id: originalId, currentAmmo, ...template } = embedded;
    definition = { ...definition, weapon: { ...template, concealable: true }, embeddedWeaponId: originalId };
    weapons = [...weapons.filter(weapon => weapon.id !== originalId), { ...embedded, id: `cyberweapon:${item.id}`, sourceCyberwareId: item.id, currentAmmo }];
  }
  const external = isExternalCyberware(character,{...definition,installedIn:targets});
  const wasAlreadyInstalled = alreadyInstalled || item.isInstalled === true || item.hasBeenInstalled;
  const loss = external || (wasAlreadyInstalled && !isExternalCyberware(character,item)) || (definition.installRule?.repeatHumanityFree && item.hasBeenInstalled) ? 0 : item.humanityLoss ?? item.humanityCost;
  const installed = initializeCyberware({ ...definition, isInstalled: true, installedIn: targets, hasBeenInstalled: item.hasBeenInstalled || !external || item.isInstalled === true || alreadyInstalled });
  let updated = { ...character, weapons, cyberware: character.cyberware.map(entry => entry.id === id ? installed : entry) };
  updated = { ...updated, humanityCurrent: Math.min(cyberwareHumanityCap(updated), character.humanityCurrent - loss) };
  return { character: syncCyberwareWeapons(updated) };
}

export function uninstallCyberware(character: Character, id: string): Character {
  const removed = new Set([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const item of character.cyberware) {
      const dependent = item.installedIn?.some(target => character.cyberware.some(parent => removed.has(parent.id) && ownsHost(parent,target))) || cyberwareDefinition(item).installRule?.requires?.some(required => character.cyberware.some(other => removed.has(other.id) && providesPrerequisite(other,required)) && !character.cyberware.some(other => !removed.has(other.id) && isCyberwareInstalled(character,other) && providesPrerequisite(other,required)));
      if (!removed.has(item.id) && dependent && item.isInstalled !== false) { removed.add(item.id); changed = true; }
    }
  }
  const restored = character.weapons.flatMap(weapon => {
    if (!weapon.sourceCyberwareId || !removed.has(weapon.sourceCyberwareId)) return [];
    const item = character.cyberware.find(entry => entry.id === weapon.sourceCyberwareId);
    return item?.embeddedWeaponId && item.weapon ? [{ ...weapon, ...item.weapon, id: item.embeddedWeaponId, sourceCyberwareId: undefined, currentAmmo: weapon.currentAmmo, selectedProfile: weapon.selectedProfile, profileAmmo: weapon.profileAmmo }] : [];
  });
  return syncCyberwareWeapons({ ...character, weapons: [...character.weapons, ...restored], cyberware: character.cyberware.map(item => {
    if (!removed.has(item.id)) return item;
    const weapon = character.weapons.find(weapon => weapon.sourceCyberwareId === item.id);
    return { ...item, isInstalled: false, installedIn: undefined, weaponState: weapon ? weaponState(weapon) : item.weaponState };
  }) });
}

function weaponState(weapon: Weapon): NonNullable<CyberwareItem['weaponState']> {
  return { currentAmmo: weapon.currentAmmo, selectedProfile: weapon.selectedProfile, profileAmmo: weapon.profileAmmo };
}

/** Linked weapons persist their own ammo/profile state; the implant owns their definition. */
export function syncCyberwareWeapons(character: Character): Character {
  const active = functionalCyberware(character);
  const managedIds = new Set(character.cyberware.filter(item => !!cyberwareDefinition(item).weapon).map(item => item.id));
  // Unknown/orphan ownership is preserved for repair, never silently discarded on load.
  const weapons: Weapon[] = character.weapons.filter(weapon => !weapon.sourceCyberwareId || !managedIds.has(weapon.sourceCyberwareId));
  const cyberware = character.cyberware.map(item => {
    const previous = character.weapons.find(weapon => weapon.sourceCyberwareId === item.id);
    return previous && managedIds.has(item.id) ? { ...item, weaponState: weaponState(previous) } : item;
  });
  for (const item of active.filter(entry => entry.kind !== 'upgrade' && entry.weapon)) {
    const upgrades = active.filter(entry => entry.kind === 'upgrade' && entry.installedIn?.some(target => ownsHost(item,target)));
    const template = upgrades.reduce((weapon, upgrade) => ({ ...weapon, ...upgrade.weapon }), item.weapon!);
    const previous = character.weapons.find(weapon => weapon.sourceCyberwareId === item.id) ?? item.weaponState;
    weapons.push({ ...template, isEquipped: true, id: `cyberweapon:${item.id}`, sourceCyberwareId: item.id, name: item.name === template.name ? item.name : `${item.name} · ${template.name}`, notes: [template.notes, ...upgrades.map(upgrade => `${upgrade.name}: ${upgrade.description}`)].join('\n'), currentAmmo: Math.min(previous?.currentAmmo ?? template.magCapacity, template.magCapacity), selectedProfile: template.damageProfiles?.length && previous?.selectedProfile !== undefined ? Math.min(previous.selectedProfile, template.damageProfiles.length - 1) : undefined, profileAmmo: previous?.profileAmmo });
  }
  return { ...character, cyberware, weapons };
}

export function cyberwareWarnings(character: Character, lang: 'ru' | 'en'): string[] {
  const warnings: string[] = [];
  for (const weapon of character.weapons.filter(weapon => weapon.sourceCyberwareId && !character.cyberware.some(item => item.id === weapon.sourceCyberwareId && cyberwareDefinition(item).weapon))) warnings.push(`${weapon.name}: ` + failure('связь с имплантом не найдена. Оружие сохранено для ручной проверки.', 'implant ownership is unresolved. Weapon preserved for manual repair.', lang));
  for (const item of character.cyberware.filter(entry => entry.isInstalled !== false)) {
    const prefix = `${item.name}: `;
    if (!item.installedIn?.length) warnings.push(prefix + failure('старое сохранение — назначьте место установки; слоты пока не распределены.', 'legacy item — assign an installation host; slots are not allocated yet.', lang));
    else {
      const error = cyberwareInstallError(character, item, item.installedIn, lang);
      if (error) warnings.push(prefix + error);
    }
    if (!pairedCyberwareReady(character, item)) warnings.push(prefix + failure('для работы нужна вторая копия на другом основании.', 'a second copy on a different host is required to function.', lang));
  }
  return warnings;
}

/** New character packages only; existing saves are never rearranged automatically. */
export function placeStartingCyberware(character: Character): Character {
  let updated: Character = { ...character, cyberware: character.cyberware.map(item => ({ ...cyberwareDefinition(item), isInstalled: false, installedIn: undefined })) };
  const pending = new Set(updated.cyberware.map(item => item.id));
  for (let pass = 0; pass < character.cyberware.length; pass++) {
    let progress = false;
    for (const id of pending) {
      const item = updated.cyberware.find(entry => entry.id === id)!;
      const targets = findCyberwarePlacement(updated, item);
      if (!targets) continue;
      updated = { ...updated, cyberware: updated.cyberware.map(entry => entry.id === id ? initializeCyberware({ ...entry, isInstalled: true, installedIn: targets, hasBeenInstalled: true }) : entry) };
      pending.delete(id); progress = true;
    }
    if (!progress) break;
  }
  // Packages already deducted the installation HL when computing their starting Humanity.
  return syncCyberwareWeapons(updated);
}
