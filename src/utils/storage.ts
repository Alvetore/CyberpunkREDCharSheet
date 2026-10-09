import { Character } from '../types/character';
import { createEmptyCharacter } from '../data/initialData';

const CHARACTERS_STORAGE_KEY = 'cpr_characters_v1';
const ACTIVE_CHAR_ID_KEY = 'cpr_active_char_id_v1';
const THEME_STORAGE_KEY = 'cpr_theme_v1';

export type AppTheme = 'dark' | 'light';

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
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Failed to load characters from localStorage', err);
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
  saveCharactersToStorage(chars);
  return chars;
}

export function saveCharactersToStorage(characters: Character[]): void {
  try {
    localStorage.setItem(CHARACTERS_STORAGE_KEY, JSON.stringify(characters));
  } catch (err) {
    console.error('Failed to save characters to localStorage', err);
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
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
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
    const data = JSON.parse(jsonText);
    return data;
  } catch (err) {
    console.error('Invalid JSON file', err);
    return null;
  }
}
