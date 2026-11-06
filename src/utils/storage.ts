import { Character } from '../types/character';
import { createEmptyCharacter } from '../data/initialData';
import { calculateHumanityStats } from './roleUtils';
import { isCharacter, isCharacterCollection } from './characterValidation';
import { syncCyberwareWeapons } from './cyberware';
import { consolidateGrenadeWeapons } from './backpack';
import { maxHP } from './rules';

const CHARACTERS_STORAGE_KEY = 'cpr_characters_v1';
const ACTIVE_CHAR_ID_KEY = 'cpr_active_char_id_v1';
const THEME_STORAGE_KEY = 'cpr_theme_v1';
const SOUND_STORAGE_KEY = 'cpr_sound_enabled_v1';
const RECOVERY_STORAGE_KEY = 'cpr_characters_recovery_v1';
const PREVIOUS_STORAGE_KEY = 'cpr_characters_previous_v1';
let recoveredStorage = false;

/**
 * Repair safe, machine-editable legacy drift before validation. Structural
 * corruption is still rejected and preserved as a recovery copy; this only
 * clamps values that old versions allowed the UI to write (negative money,
 * spent/negative ammunition, SDP/SP below zero, duplicate generated ids).
 */
function clampInteger(value: unknown, min: number, max: number, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value)
    ? Math.min(max, Math.max(min, Math.trunc(value)))
    : fallback;
}

function uniqueListIds<T extends { id: string }>(items: T[], prefix: string): T[] {
  const seen = new Set<string>();
  return items.map((item) => {
    let id = typeof item.id === 'string' ? item.id : '';
    if (!id || seen.has(id)) {
      do {
        id = `${prefix}-${crypto.randomUUID()}`;
      } while (seen.has(id));
    }
    seen.add(id);
    return id === item.id ? item : { ...item, id };
  });
}

export function normalizeStoredCharacter(input: Character): Character {
  const hpMax = Math.max(0, maxHP(input));
  const character: Character = {
    ...input,
    roleRank: clampInteger(input.roleRank, 1, 10, 1),
    cashEb: clampInteger(input.cashEb, 0, Number.MAX_SAFE_INTEGER, 0),
    bankEb: clampInteger(input.bankEb, 0, Number.MAX_SAFE_INTEGER, 0),
    hpCurrent: clampInteger(input.hpCurrent, 0, hpMax, 0),
    stats: { ...input.stats },
    armor: {
      ...input.armor,
      head: { ...input.armor.head },
      body: { ...input.armor.body }
    }
  };
  if (input.armor.shield) character.armor.shield = { ...input.armor.shield };
  character.spareArmor = input.spareArmor?.map(armor => ({ ...armor }));
  character.weapons = input.weapons.map(weapon => {
    const magCapacity = clampInteger(weapon.magCapacity, 0, Number.MAX_SAFE_INTEGER, 0);
    return {
      ...weapon,
      magCapacity,
      currentAmmo: clampInteger(weapon.currentAmmo, 0, magCapacity, magCapacity)
    };
  });
  character.cyberware = input.cyberware.map(item => ({ ...item }));
  character.skills = input.skills.map(skill => ({ ...skill }));
  character.programs = input.programs.map(program => ({ ...program }));
  character.criticalInjuries = input.criticalInjuries.map(injury => ({ ...injury }));
  character.gear = input.gear.map(item => ({
    ...item,
    quantity: clampInteger(item.quantity, 0, Number.MAX_SAFE_INTEGER, 1)
  }));
  character.vehicles = input.vehicles?.map(vehicle => {
    const sdpMax = clampInteger(vehicle.sdpMax, 0, Number.MAX_SAFE_INTEGER, 1);
    return {
      ...vehicle,
      sdpMax,
      sdpCurrent: clampInteger(vehicle.sdpCurrent, 0, sdpMax, sdpMax),
      costEb: clampInteger(vehicle.costEb, 0, Number.MAX_SAFE_INTEGER, 0)
    };
  });

  const repairArmor = (armor: Character['armor']['head']): Character['armor']['head'] => {
    const spMax = clampInteger(armor.spMax, 0, Number.MAX_SAFE_INTEGER, 0);
    return { ...armor, spMax, spCurrent: clampInteger(armor.spCurrent, 0, spMax, spMax) };
  };
  character.armor.head = repairArmor(character.armor.head);
  character.armor.body = repairArmor(character.armor.body);
  if (character.armor.shield) character.armor.shield = repairArmor(character.armor.shield);
  character.spareArmor = character.spareArmor?.map(repairArmor);

  character.weapons = uniqueListIds(character.weapons, 'weapon');
  character.cyberware = uniqueListIds(character.cyberware, 'cyberware');
  character.skills = uniqueListIds(character.skills, 'skill');
  character.programs = uniqueListIds(character.programs, 'program');
  character.criticalInjuries = uniqueListIds(character.criticalInjuries, 'injury');
  character.gear = uniqueListIds(character.gear, 'gear');
  character.vehicles = character.vehicles ? uniqueListIds(character.vehicles, 'vehicle') : [];
  return character;
}

export const hasStorageRecovery = () => {
  try { return recoveredStorage || localStorage.getItem(RECOVERY_STORAGE_KEY) !== null; }
  catch { return recoveredStorage; }
};
export function exportStorageRecovery(): void {
  try {
    const raw = localStorage.getItem(RECOVERY_STORAGE_KEY) || localStorage.getItem(PREVIOUS_STORAGE_KEY);
    if (raw) downloadTextFile('CPR_Storage_Recovery.json', raw);
  } catch (err) {
    console.error('Failed to export storage recovery', err);
  }
}
export function clearStorageRecovery(): void {
  try {
    localStorage.removeItem(RECOVERY_STORAGE_KEY);
    recoveredStorage = false;
  } catch (err) { console.error('Failed to clear storage recovery', err); }
}
export function restorePreviousCharacters(): Character[] | null {
  try {
    for (const key of [RECOVERY_STORAGE_KEY, PREVIOUS_STORAGE_KEY]) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) continue;
      const normalized = parsed.map(normalizeStoredCharacter);
      if (isCharacterCollection(normalized)) return normalized;
    }
  } catch (err) {
    console.error('Failed to restore previous characters', err);
  }
  return null;
}

export type AppTheme = 'dark' | 'light';

export function getStoredSoundEnabled(): boolean {
  try { return localStorage.getItem(SOUND_STORAGE_KEY) !== 'false'; }
  catch { return true; }
}

export function saveStoredSoundEnabled(enabled: boolean): void {
  try { localStorage.setItem(SOUND_STORAGE_KEY, String(enabled)); }
  catch { /* Sound still works for this session if storage is unavailable. */ }
}

export function getStoredTheme(): AppTheme {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {}
  return 'dark';
}

export function saveStoredTheme(theme: AppTheme): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (err) {
    console.error('Failed to save theme to localStorage', err);
  }
}

export type UILayoutMode = 'auto' | 'mobile' | 'desktop';
const LAYOUT_MODE_KEY = 'cpr_layout_mode_v1';

export function getStoredLayoutMode(): UILayoutMode {
  try {
    const saved = localStorage.getItem(LAYOUT_MODE_KEY);
    if (saved === 'auto' || saved === 'mobile' || saved === 'desktop') return saved;
  } catch {}
  return 'auto';
}

export function saveStoredLayoutMode(mode: UILayoutMode): void {
  try {
    localStorage.setItem(LAYOUT_MODE_KEY, mode);
  } catch (err) {
    console.error('Failed to save layout mode to localStorage', err);
  }
}

export function loadStoredCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(CHARACTERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const normalized = parsed.map(normalizeStoredCharacter);
        if (!isCharacterCollection(normalized)) throw new Error('Invalid character collection');
        return normalized.map((char: Character) => {
          const maxAllowed = calculateHumanityStats(char).maxRecoverableHumanity;
          let updated = { ...char, legacyMartialArtsStyle: char.legacyMartialArtsStyle || char.martialArtsStyle || 'Karate' as const };
          if (typeof char.humanityCurrent === 'number' && char.humanityCurrent > maxAllowed) {
            updated.humanityCurrent = maxAllowed;
          }
          if (updated.armor) {
            const headName = updated.armor.head?.name;
            const bodyName = updated.armor.body?.name;
            if (headName === 'Лёгкий арморджек (Шлем)' || headName === 'Light Armorjack Helmet') {
              updated.armor = { ...updated.armor, head: { ...updated.armor.head, name: 'Лёгкий арморджек (Light Armorjack)' } };
            }
            if (bodyName === 'Лёгкий арморджек (Жилет)' || bodyName === 'Light Armorjack Vest') {
              updated.armor = { ...updated.armor, body: { ...updated.armor.body, name: 'Лёгкий арморджек (Light Armorjack)' } };
            }
          }
          if (updated.weapons) {
            updated.weapons = consolidateGrenadeWeapons(updated.weapons);
          }
          return syncCyberwareWeapons(updated);
        });
      }
      throw new Error('Invalid character collection');
    }
  } catch (err) {
    console.error('Failed to load characters from localStorage', err);
    recoveredStorage = true;
  }

  // Fallback: create default starting characters
  const defaultChar = createEmptyCharacter('Вайпер (Viper)', 'Solo');
  const netrunnerChar = createEmptyCharacter('Сайфер (Cipher)', 'Netrunner');
  netrunnerChar.handle = 'Cipher';
  netrunnerChar.role = 'Netrunner';
  netrunnerChar.roleRank = 4;
  netrunnerChar.stats.INT = 8;
  netrunnerChar.stats.TECH = 7;
  const chars = [defaultChar, netrunnerChar];
  return chars;
}

export function saveCharactersToStorage(characters: Character[]): boolean {
  try {
    if (!isCharacterCollection(characters)) throw new Error('Refusing to save an invalid collection');
    const json = JSON.stringify(characters);
    const previous = localStorage.getItem(CHARACTERS_STORAGE_KEY);
    if (previous && previous !== json) {
      let valid = false;
      try { valid = isCharacterCollection(JSON.parse(previous)); } catch {}
      const backupKey = valid ? PREVIOUS_STORAGE_KEY : RECOVERY_STORAGE_KEY;
      // Keep the first damaged original intact across subsequent saves.
      if (valid || !localStorage.getItem(backupKey)) {
        localStorage.setItem(backupKey, previous);
        if (localStorage.getItem(backupKey) !== previous) throw new Error('Backup verification failed');
      }
    }
    localStorage.setItem(CHARACTERS_STORAGE_KEY, json);
    return true;
  } catch (err) {
    console.error('Failed to save characters to localStorage', err);
    return false;
  }
}

export function getActiveCharacterId(): string | null {
  try {
    return localStorage.getItem(ACTIVE_CHAR_ID_KEY);
  } catch {
    return null;
  }
}

export function setActiveCharacterId(id: string): void {
  try {
    localStorage.setItem(ACTIVE_CHAR_ID_KEY, id);
  } catch (err) {
    console.error('Failed to set active character ID', err);
  }
}

export function downloadJsonFile(filename: string, data: unknown): void {
  downloadTextFile(filename, JSON.stringify(data, null, 2));
}

function downloadTextFile(filename: string, text: string): void {
  const blob = new Blob([text], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportSingleCharacter(character: Character): void {
  const safeName = (character.handle || character.name || 'character').replace(/[^a-zA-Z0-9_-]/g, '_');
  downloadJsonFile(`CPR_${safeName}.json`, character);
}

export function exportAllCharacters(characters: Character[]): void {
  downloadJsonFile(`CPR_Characters_Backup_${new Date().toISOString().split('T')[0]}.json`, characters);
}

export function parseImportedJson(jsonText: string): Character | Character[] | null {
  try {
    if (jsonText.length > 5_000_000) return null;
    const data = JSON.parse(jsonText);
    return isCharacter(data) || isCharacterCollection(data) ? data : null;
  } catch (err) {
    console.error('Invalid JSON file', err);
    return null;
  }
}
