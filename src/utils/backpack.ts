import { ArmorItem, Character, CyberwareItem, GearItem, Weapon } from '../types/character';
import { CatalogArmorItem, CatalogCyberwareItem, CatalogGearItem, CatalogWeaponItem } from '../data/datapoolCatalog';
import { initializeCyberware, isCyberwareInstalled } from './cyberware';
import { Language } from '../locales/i18n';

export type BackpackEquipment = { kind: 'weapon'; item: CatalogWeaponItem } | { kind: 'armor'; item: CatalogArmorItem } | { kind: 'cyberware'; item: CatalogCyberwareItem };

export function equipmentCatalogEntry(equipment: BackpackEquipment): CatalogGearItem {
  const item = equipment.item;
  const notes = equipment.kind === 'cyberware' ? equipment.item.description : equipment.item.notes ?? '';
  const sourceUrl = item.sourceUrl ?? (equipment.kind === 'cyberware' ? 'https://alec-leon.github.io/data-pool/chrome/implants/' : `https://alec-leon.github.io/data-pool/equipment/${equipment.kind === 'weapon' ? 'weapons' : 'armor'}/`);
  return { id: item.id, catalogId: item.id, sourceKey: `backpack:${equipment.kind}:${item.id}`, sourceUrl, section: equipment.kind, name: item.name, category: equipment.kind, quantity: 1, costEb: item.costEb, priceLabel: `${item.costEb} eb`, notes };
}

/** Own the original typed record; storage never turns working equipment into text-only gear. */
export function addEquipmentToBackpack(character: Character, equipment: BackpackEquipment, draft: GearItem, quantity: number, purchase: boolean): { character?: Character; error?: 'name' | 'quantity' | 'price' | 'funds' } {
  if (!draft.name.trim()) return { error: 'name' };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) return { error: 'quantity' };
  const total = draft.costEb * quantity;
  if (!Number.isFinite(total) || draft.costEb < 0) return { error: 'price' };
  if (purchase && character.cashEb < total) return { error: 'funds' };
  const records = Array.from({ length: quantity }, () => ({ ...equipment.item, id: `${equipment.kind}-` + crypto.randomUUID(), catalogId: equipment.item.id, sourceUrl: draft.sourceUrl ?? equipmentCatalogEntry(equipment).sourceUrl, name: draft.name, costEb: draft.costEb }));
  const updated = { ...character, cashEb: character.cashEb - (purchase ? total : 0) };
  if (equipment.kind === 'weapon') updated.weapons = [...character.weapons, ...records.map(record => ({ ...record, notes: draft.notes, currentAmmo: equipment.item.currentAmmo, isEquipped: false } as Weapon))];
  if (equipment.kind === 'armor') updated.spareArmor = [...(character.spareArmor ?? []), ...records.map(record => ({ ...record, notes: draft.notes, spCurrent: equipment.item.spMax } as ArmorItem))];
  if (equipment.kind === 'cyberware') updated.cyberware = [...character.cyberware, ...records.map(record => initializeCyberware({ ...record, description: draft.notes, isInstalled: false, installedIn: undefined } as CyberwareItem))];
  return { character: updated };
}

export function setWeaponEquipped(character: Character, id: string, equipped: boolean): Character {
  return { ...character, weapons: character.weapons.map(weapon => weapon.id === id && !weapon.sourceCyberwareId ? { ...weapon, isEquipped: equipped } : weapon) };
}

export function stowArmor(character: Character, location: ArmorItem['location'], lang: Language): Character {
  const current = character.armor[location];
  if (!current || current.spMax <= 0) return character;
  const armor = { ...character.armor };
  if (location === 'shield') delete armor.shield;
  else armor[location] = { id: `empty-${location}-` + crypto.randomUUID(), name: lang === 'ru' ? 'Без брони' : 'No armor', location, spMax: 0, spCurrent: 0, penalty: 0 };
  return { ...character, armor, spareArmor: [...(character.spareArmor ?? []), current] };
}

export function equipBackpackArmor(character: Character, id: string, lang: Language): Character {
  const item = character.spareArmor?.find(armor => armor.id === id);
  if (!item) return character;
  const updated = stowArmor(character, item.location, lang);
  return { ...updated, spareArmor: updated.spareArmor?.filter(armor => armor.id !== id), armor: { ...updated.armor, [item.location]: item } };
}

export function backpackCyberware(character: Character): CyberwareItem[] {
  return character.cyberware.filter(item => !isCyberwareInstalled(character, item));
}
