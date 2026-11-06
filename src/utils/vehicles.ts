import { Character, Vehicle } from '../types/character';
import { DATAPOOL_VEHICLE_UPGRADES, type CatalogVehicleItem, type CatalogVehicleUpgrade } from '../data/datapoolVehicles';
import { Language } from '../locales/i18n';

export const VEHICLE_SECTIONS = [
  { id: 'Ground', ru: 'Наземный транспорт', en: 'Ground vehicles' },
  { id: 'Sea', ru: 'Водный транспорт', en: 'Watercraft' },
  { id: 'Air', ru: 'Воздушный транспорт', en: 'Aircraft' },
  { id: 'Bicycle', ru: 'Велосипеды', en: 'Bicycles' },
] as const;

export function vehicleFromCatalog(item: CatalogVehicleItem, lang: Language): Vehicle {
  return {
    id: '', catalogId: item.id, sourceUrl: item.sourceUrl, priceLabel: item.priceLabel, nomadRankLabel: item.nomadRankLabel,
    name: lang === 'ru' ? item.name : item.nameEn || item.name,
    model: item.name, category: item.category, bodyType: item.typeLabelRu, sdpMax: item.sdpMax, sdpCurrent: item.sdpMax,
    armorSp: item.armorSp ?? 0, seats: item.seats, speedCombat: item.speedCombat, speedNarrative: item.speedNarrative,
    costEb: item.costEb, notes: lang === 'ru' ? item.descriptionRu : item.descriptionEn || item.descriptionRu,
    nomadRankReq: item.nomadRankReq ?? 0, upgrades: [],
  };
}

type VehicleError = 'name' | 'stats' | 'price' | 'funds';
export function vehicleErrorMessage(error: VehicleError, lang: Language): string {
  const messages = {
    name: ['Укажите название транспорта.', 'Enter a vehicle name.'],
    stats: ['Проверьте параметры: ПЗТ и места должны быть положительными, броня — неотрицательной, ранг — от 0 до 10.', 'Check the stats: positive SDP and seats, nonnegative armor, rank from 0 to 10.'],
    price: ['Укажите корректную неотрицательную цену.', 'Enter a valid nonnegative price.'],
    funds: ['Недостаточно евродолларов!', 'Not enough Eurodollars!'],
  };
  return messages[error][lang === 'ru' ? 0 : 1];
}

/** Every vehicle is a separate owned instance; existing damage, upgrades and custom fields stay intact. */
export function addVehicleToGarage(character: Character, template: Vehicle, purchase: boolean): { character?: Character; error?: VehicleError } {
  if (!template.name.trim()) return { error: 'name' };
  if (!Number.isFinite(template.costEb) || template.costEb < 0) return { error: 'price' };
  const seats = typeof template.seats === 'number' ? template.seats : template.seats.trim();
  const numericSeats = typeof seats === 'number' || /^-?\d+(?:\.\d+)?$/.test(seats);
  const validSeats = numericSeats ? Number.isInteger(Number(seats)) && Number(seats) > 0 : !!seats;
  if (!VEHICLE_SECTIONS.some(section => section.id === template.category) || !Number.isInteger(template.sdpMax) || template.sdpMax < 1 || !validSeats || !Number.isFinite(template.armorSp ?? 0) || (template.armorSp ?? 0) < 0 || !Number.isInteger(template.nomadRankReq ?? 0) || (template.nomadRankReq ?? 0) < 0 || (template.nomadRankReq ?? 0) > 10) return { error: 'stats' };
  if (purchase && character.cashEb < template.costEb) return { error: 'funds' };
  const vehicle = { ...template, id: 'veh-' + crypto.randomUUID(), name: template.name.trim(), model: template.model.trim() || template.name.trim(), sdpCurrent: template.sdpMax, upgrades: [...(template.upgrades ?? [])] };
  return { character: { ...character, cashEb: character.cashEb - (purchase ? template.costEb : 0), vehicles: [...(character.vehicles ?? []), vehicle] } };
}

export type VehicleBodyType =
  | 'motorcycle' | 'hydrocycle' | 'gyrocopter' | 'helicopter' | 'av4' | 'aerozep'
  | 'yacht' | 'cruise' | 'watercraft' | 'van' | 'bus' | 'truck' | 'sportscar'
  | 'car' | 'bicycle' | 'aircraft';

/** Resolve the book body type from the catalog label, model name or category. */
export function vehicleBodyType(vehicle: Vehicle): VehicleBodyType {
  const text = `${vehicle.bodyType ?? ''} ${vehicle.name} ${vehicle.model}`.toLowerCase();
  if (/гидроцикл|hydrocycle|jet\s*ski|jet-ski/.test(text)) return 'hydrocycle';
  if (/гирокоптер|gyrocopter|autogyro|gyroplane/.test(text)) return 'gyrocopter';
  if (/вертол[её]т|helicopter/.test(text)) return 'helicopter';
  if (/аэрозеп|aerozep|adzep/.test(text)) return 'aerozep';
  if (/av-?4|аэродайн|aerodyne/.test(text)) return 'av4';
  if (/мотоцикл|motorcycle|motorbike|superbike|киберцикл|cybercycle|трайк|trike/.test(text)) return 'motorcycle';
  if (/яхт|yacht/.test(text)) return 'yacht';
  if (/круизн\w*\s+катер|cruise\w*\s+boat/.test(text)) return 'cruise';
  if (/катер|лодк|boat|ship|vessel|submarine|submersible/.test(text)) return 'watercraft';
  if (/фургон|van\b|camper|\brv\b|ambunaught/.test(text)) return 'van';
  if (/автобус|\bbus\b/.test(text)) return 'bus';
  if (/тягач|truck|lorry|trailer/.test(text)) return 'truck';
  if (/спорткар|sportscar|sports\s+car|суперкар|supercar/.test(text)) return 'sportscar';
  if (vehicle.category === 'Bicycle') return 'bicycle';
  if (vehicle.category === 'Sea') return 'watercraft';
  if (vehicle.category === 'Air') return 'aircraft';
  return 'car';
}

export function vehicleUpgradeName(upgrade: CatalogVehicleUpgrade, lang: Language): string {
  return lang === 'ru' ? upgrade.nameRu : upgrade.nameEn;
}

export function vehicleHasUpgrade(vehicle: Vehicle, upgradeId: string): boolean {
  const upgrade = DATAPOOL_VEHICLE_UPGRADES.find(item => item.id === upgradeId);
  if (!upgrade) return false;
  // Keep recognizing the old catalog label for the heavy chassis prerequisite.
  const aliases = upgradeId === 'upg-reinforced-chassis'
    ? ['Усиленное шасси', 'Reinforced Chassis']
    : [];
  return (vehicle.upgrades ?? []).some(name =>
    name === upgrade.nameRu || name === upgrade.nameEn ||
    name.includes(upgrade.nameRu) || name.includes(upgrade.nameEn) ||
    aliases.some(alias => name.includes(alias))
  );
}

export type VehicleUpgradeCompatibility = 'ok' | 'category' | 'prerequisite';

/** Core pp.163-165: category first, then the listed prerequisite. */
export function vehicleUpgradeCompatibility(
  upgrade: CatalogVehicleUpgrade,
  vehicle: Vehicle
): VehicleUpgradeCompatibility {
  const body = vehicleBodyType(vehicle);
  const category = vehicle.category;
  let compatible = false;
  switch (upgrade.categoryRule) {
    case 'any':
      compatible = true;
      break;
    case 'all-except-moto-hydro-gyro':
      compatible = !['motorcycle', 'hydrocycle', 'gyrocopter'].includes(body);
      break;
    case 'ground-sea':
      compatible = category === 'Ground' || category === 'Sea';
      break;
    case 'ground-sea-except-moto-hydro':
      compatible = (category === 'Ground' || category === 'Sea') && !['motorcycle', 'hydrocycle'].includes(body);
      break;
    case 'ground':
      compatible = category === 'Ground' && body !== 'bicycle';
      break;
    case 'motorcycles':
      compatible = body === 'motorcycle';
      break;
    case 'cars':
      compatible = ['car', 'sportscar', 'van', 'bus', 'truck'].includes(body);
      break;
    case 'living-quarters':
      compatible = ['car', 'sportscar', 'van', 'bus', 'truck', 'av4', 'aerozep', 'cruise', 'yacht'].includes(body);
      break;
  }
  if (!compatible) return 'category';
  if (upgrade.requiresUpgradeId) {
    const needsPrerequisite = !upgrade.requiresUpgradeForBodyTypes
      || upgrade.requiresUpgradeForBodyTypes.includes(body);
    if (needsPrerequisite && !vehicleHasUpgrade(vehicle, upgrade.requiresUpgradeId)) return 'prerequisite';
  }
  return 'ok';
}

export type VehicleUpgradeError = 'vehicle' | 'rank' | 'category' | 'prerequisite' | 'funds' | 'duplicate';
export function vehicleUpgradeErrorMessage(error: VehicleUpgradeError, lang: Language): string {
  const messages: Record<VehicleUpgradeError, [string, string]> = {
    vehicle: ['Выберите транспорт для установки улучшения.', 'Select a vehicle for the upgrade.'],
    rank: ['Недостаточный ранг Мото для этого улучшения.', 'Your Moto rank is too low for this upgrade.'],
    category: ['Это улучшение не подходит для данного типа транспорта.', 'This upgrade does not fit this vehicle type.'],
    prerequisite: ['Сначала установите требуемое улучшение (Тяжёлое шасси).', 'Install the required upgrade first (Heavy Chassis).'],
    funds: ['Недостаточно евродолларов для этого улучшения.', 'Not enough Eurodollars for this upgrade.'],
    duplicate: ['Это улучшение уже установлено, а повторная установка не предусмотрена.', 'This upgrade is already installed and cannot be repeated.'],
  };
  return messages[error][lang === 'ru' ? 0 : 1];
}

/** Upgrades the vehicle can legally receive now (rank, category, prerequisite, repeat rule). */
export function availableVehicleUpgrades(character: Character, vehicle: Vehicle): CatalogVehicleUpgrade[] {
  return DATAPOOL_VEHICLE_UPGRADES.filter(upgrade => {
    if (character.role === 'Nomad' && character.roleRank < upgrade.nomadRank) return false;
    if (vehicleUpgradeCompatibility(upgrade, vehicle) !== 'ok') return false;
    if (!upgrade.repeatable && vehicleHasUpgrade(vehicle, upgrade.id)) return false;
    return true;
  });
}

export function installVehicleUpgrade(
  character: Character,
  vehicleId: string,
  upgrade: CatalogVehicleUpgrade,
  purchase: boolean,
  lang: Language
): { character?: Character; error?: VehicleUpgradeError } {
  const vehicle = (character.vehicles ?? []).find(item => item.id === vehicleId);
  if (!vehicle) return { error: 'vehicle' };
  // The Moto rank gates the Nomad family motorpool; open-market buyers pay the book price.
  if (character.role === 'Nomad' && character.roleRank < upgrade.nomadRank) return { error: 'rank' };
  const compatibility = vehicleUpgradeCompatibility(upgrade, vehicle);
  if (compatibility !== 'ok') return { error: compatibility };
  if (!upgrade.repeatable && vehicleHasUpgrade(vehicle, upgrade.id)) return { error: 'duplicate' };
  if (purchase && character.cashEb < upgrade.costEb) return { error: 'funds' };
  const name = vehicleUpgradeName(upgrade, lang);
  return {
    character: {
      ...character,
      cashEb: character.cashEb - (purchase ? upgrade.costEb : 0),
      vehicles: (character.vehicles ?? []).map(item => item.id === vehicleId
        ? { ...item, upgrades: [...(item.upgrades ?? []), name] }
        : item)
    }
  };
}
