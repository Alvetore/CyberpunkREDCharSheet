import { Character, GearItem } from '../types/character';
import { Language } from '../locales/i18n';
import { gearCyberwareDevice } from './gearCyberware';

export function gearPrice(item: Pick<GearItem, 'costEb' | 'billingPeriod'>, lang: Language): string {
  const price = item.costEb === 0 ? (lang === 'ru' ? 'Бесплатно' : 'Free') : `${item.costEb.toLocaleString(lang)} eb`;
  return price + (item.billingPeriod === 'monthly' ? (lang === 'ru' ? ' / мес.' : ' / month') : '');
}

type GearError = 'name' | 'quantity' | 'price' | 'funds';
export function gearErrorMessage(error: GearError, lang: Language): string {
  const messages = {
    name: ['Укажите название предмета.', 'Enter an item name.'],
    quantity: ['Количество должно быть целым числом от 1 до 999.', 'Quantity must be a whole number from 1 to 999.'],
    price: ['Укажите корректную неотрицательную цену.', 'Enter a valid nonnegative price.'],
    funds: ['Недостаточно евродолларов!', 'Not enough Eurodollars!'],
  };
  return messages[error][lang === 'ru' ? 0 : 1];
}

/** Catalogue identity and unchanged properties allow stacking; edited/legacy rows stay intact. */
export function addGearToInventory(character: Character, template: GearItem, quantity: number, purchase: boolean): { character?: Character; error?: GearError } {
  if (!template.name.trim()) return { error: 'name' };
  if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999) return { error: 'quantity' };
  if (!Number.isFinite(template.costEb) || template.costEb < 0) return { error: 'price' };
  const total = template.costEb * quantity;
  if (!Number.isFinite(total)) return { error: 'price' };
  if (purchase && character.cashEb < total) return { error: 'funds' };
  if (gearCyberwareDevice(template)) return { character:{ ...character, cashEb:character.cashEb - (purchase ? total : 0), gear:[...character.gear,...Array.from({length:quantity},() => ({ ...template,id:'gear-' + crypto.randomUUID(),quantity:1,wornOn:undefined }))] } };
  const matching = template.catalogId && character.gear.find(item => item.catalogId === template.catalogId && item.name === template.name && item.category === template.category && item.notes === template.notes && item.costEb === template.costEb && item.billingPeriod === template.billingPeriod);
  const gear = matching
    ? character.gear.map(item => item.id === matching.id ? { ...item, quantity: item.quantity + quantity } : item)
    : [...character.gear, { ...template, id: 'gear-' + crypto.randomUUID(), quantity }];
  return { character: { ...character, gear, cashEb: character.cashEb - (purchase ? total : 0) } };
}
