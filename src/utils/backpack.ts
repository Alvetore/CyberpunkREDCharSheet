import { ArmorItem, Character, CyberwareItem, GearItem, Weapon } from '../types/character';
import { CatalogArmorItem, CatalogCyberwareItem, CatalogGearItem, CatalogWeaponItem } from '../data/datapoolCatalog';
import { initializeCyberware, isCyberwareInstalled } from './cyberware';
import { Language } from '../locales/i18n';

export type BackpackEquipment = { kind: 'weapon'; item: CatalogWeaponItem } | { kind: 'armor'; item: CatalogArmorItem } | { kind: 'cyberware'; item: CatalogCyberwareItem };

export function isGrenadeWeapon(weapon: Pick<Weapon, 'category'> & Partial<Pick<Weapon, 'ammoType' | 'consumable'>>): boolean {
  return weapon.category === 'Thrown Grenade' || (weapon.ammoType === 'Grenade' && weapon.category !== 'Grenade Launcher' && weapon.consumable === true);
}

export function isSameGrenadeType(
  w1: Pick<Weapon, 'name' | 'category'> & Partial<Pick<Weapon, 'id' | 'catalogId' | 'ammoType' | 'consumable'>>,
  w2: Pick<Weapon, 'name' | 'category'> & Partial<Pick<Weapon, 'id' | 'catalogId' | 'ammoType' | 'consumable'>>
): boolean {
  if (!isGrenadeWeapon(w1) || !isGrenadeWeapon(w2)) return false;
  if (w1.catalogId && w2.catalogId) return w1.catalogId === w2.catalogId;
  if (w1.id && w2.id && w1.id === w2.id) return true;
  if (w1.catalogId && w2.id && w1.catalogId === w2.id) return true;
  if (w2.catalogId && w1.id && w2.catalogId === w1.id) return true;
  return w1.name.trim().toLowerCase() === w2.name.trim().toLowerCase();
}

export function consolidateGrenadeWeapons(weapons: Weapon[]): Weapon[] {
  const result: Weapon[] = [];
  for (const weapon of weapons) {
    if (!isGrenadeWeapon(weapon) || weapon.sourceCyberwareId) {
      result.push(weapon);
      continue;
    }
    const isEquipped = weapon.isEquipped !== false;
    const existingIndex = result.findIndex(
      w => (w.isEquipped !== false) === isEquipped && !w.sourceCyberwareId && isSameGrenadeType(w, weapon)
    );
    if (existingIndex >= 0) {
      const existing = result[existingIndex];
      const addedAmmo = weapon.currentAmmo ?? weapon.magCapacity ?? 1;
      const addedCap = weapon.magCapacity || addedAmmo || 1;
      const newAmmo = existing.currentAmmo + addedAmmo;
      const newCap = existing.currentAmmo === 0
        ? addedCap
        : Math.max(existing.magCapacity + addedCap, newAmmo);

      result[existingIndex] = {
        ...existing,
        currentAmmo: newAmmo,
        magCapacity: newCap
      };
    } else {
      result.push(weapon);
    }
  }
  return result;
}

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
  if (equipment.kind === 'weapon') {
    if (isGrenadeWeapon(equipment.item)) {
      const existingInBackpack = character.weapons.find(
        w => w.isEquipped === false && !w.sourceCyberwareId && isSameGrenadeType(w, equipment.item)
      );
      if (existingInBackpack) {
        const addedAmmo = quantity * (equipment.item.currentAmmo || 1);
        const addedCapacity = quantity * (equipment.item.magCapacity || 1);
        const newAmmo = existingInBackpack.currentAmmo + addedAmmo;
        const newCap = existingInBackpack.currentAmmo === 0
          ? addedCapacity
          : Math.max(existingInBackpack.magCapacity + addedCapacity, newAmmo);

        updated.weapons = character.weapons.map(w =>
          w.id === existingInBackpack.id ? { ...w, currentAmmo: newAmmo, magCapacity: newCap } : w
        );
      } else {
        const singleRecord: Weapon = {
          ...equipment.item,
          id: `weapon-` + crypto.randomUUID(),
          catalogId: equipment.item.id,
          sourceUrl: draft.sourceUrl ?? equipmentCatalogEntry(equipment).sourceUrl,
          name: draft.name,
          costEb: draft.costEb,
          notes: draft.notes,
          currentAmmo: quantity * (equipment.item.currentAmmo || 1),
          magCapacity: quantity * (equipment.item.magCapacity || 1),
          isEquipped: false
        } as Weapon;
        updated.weapons = [...character.weapons, singleRecord];
      }
    } else {
      updated.weapons = [...character.weapons, ...records.map(record => ({ ...record, notes: draft.notes, currentAmmo: equipment.item.currentAmmo, isEquipped: false } as Weapon))];
    }
  }
  if (equipment.kind === 'armor') updated.spareArmor = [...(character.spareArmor ?? []), ...records.map(record => ({ ...record, notes: draft.notes, spCurrent: equipment.item.spMax } as ArmorItem))];
  if (equipment.kind === 'cyberware') updated.cyberware = [...character.cyberware, ...records.map(record => initializeCyberware({ ...record, description: draft.notes, isInstalled: false, installedIn: undefined } as CyberwareItem))];
  return { character: updated };
}

export function setWeaponEquipped(character: Character, id: string, equipped: boolean): Character {
  const target = character.weapons.find(weapon => weapon.id === id && !weapon.sourceCyberwareId);
  if (!target) return character;

  if (isGrenadeWeapon(target)) {
    if (equipped) {
      const existingEquipped = character.weapons.find(
        w => w.id !== id && w.isEquipped !== false && !w.sourceCyberwareId && isSameGrenadeType(w, target)
      );
      if (existingEquipped) {
        const addedAmmo = target.currentAmmo ?? target.magCapacity ?? 1;
        const addedCapacity = target.magCapacity || addedAmmo || 1;
        const newAmmo = existingEquipped.currentAmmo + addedAmmo;
        const newCap = existingEquipped.currentAmmo === 0
          ? addedCapacity
          : Math.max(existingEquipped.magCapacity + addedCapacity, newAmmo);

        return {
          ...character,
          weapons: character.weapons
            .filter(w => w.id !== id)
            .map(w => w.id === existingEquipped.id ? { ...w, currentAmmo: newAmmo, magCapacity: newCap } : w)
        };
      }
    } else {
      const existingInBackpack = character.weapons.find(
        w => w.id !== id && w.isEquipped === false && !w.sourceCyberwareId && isSameGrenadeType(w, target)
      );
      if (existingInBackpack) {
        const addedAmmo = target.currentAmmo ?? target.magCapacity ?? 1;
        const addedCapacity = target.magCapacity || addedAmmo || 1;
        const newAmmo = existingInBackpack.currentAmmo + addedAmmo;
        const newCap = existingInBackpack.currentAmmo === 0
          ? addedCapacity
          : Math.max(existingInBackpack.magCapacity + addedCapacity, newAmmo);

        return {
          ...character,
          weapons: character.weapons
            .filter(w => w.id !== id)
            .map(w => w.id === existingInBackpack.id ? { ...w, currentAmmo: newAmmo, magCapacity: newCap } : w)
        };
      }
    }
  }

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
