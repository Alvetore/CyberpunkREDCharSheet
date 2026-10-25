import { Character, Vehicle } from '../types/character';
import type { CatalogVehicleItem } from '../data/datapoolVehicles';
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
    model: item.name, category: item.category, sdpMax: item.sdpMax, sdpCurrent: item.sdpMax,
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
