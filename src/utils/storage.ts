import { Character } from '../types/character';
import { createEmptyCharacter } from '../data/initialData';
import { calculateHumanityStats } from './roleUtils';
import { isCharacter, isCharacterCollection } from './characterValidation';
import { syncCyberwareWeapons } from './cyberware';

const CHARACTERS_STORAGE_KEY = 'cpr_characters_v1';
const ACTIVE_CHAR_ID_KEY = 'cpr_active_char_id_v1';
const THEME_STORAGE_KEY = 'cpr_theme_v1';
const SOUND_STORAGE_KEY = 'cpr_sound_enabled_v1';
const RECOVERY_STORAGE_KEY = 'cpr_characters_recovery_v1';
const PREVIOUS_STORAGE_KEY = 'cpr_characters_previous_v1';
let recoveredStorage = false;
export const hasStorageRecovery = () => {
  try { return recoveredStorage || localStorage.getItem(RECOVERY_STORAGE_KEY) !== null || localStorage.getItem(PREVIOUS_STORAGE_KEY) !== null; }
  catch { return recoveredStorage; }
};
export function exportStorageRecovery(): void {
  const raw = localStorage.getItem(RECOVERY_STORAGE_KEY) || localStorage.getItem(PREVIOUS_STORAGE_KEY);
  if (raw) downloadTextFile('CPR_Storage_Recovery.json', raw);
}
export function restorePreviousCharacters(): Character[] | null {
  try {
    const raw = localStorage.getItem(PREVIOUS_STORAGE_KEY) || localStorage.getItem(RECOVERY_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (isCharacterCollection(parsed)) return parsed;
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

export function loadStoredCharacters(): Character[] {
  try {
    const raw = localStorage.getItem(CHARACTERS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (isCharacterCollection(parsed)) {
        return parsed.map((char: Character) => {
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
