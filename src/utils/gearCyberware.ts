import type { Character, CyberwareSlotType, GearItem } from '../types/character';

// Core pp.342/360 and the matching Data Pool equipment descriptions.
const DEVICES = [
  { id:'cat-gear-95', name:'Умные очки', sites:['eyes'], pools:[{type:'eye',capacity:2}], paired:true },
  { id:'cat-gear-96', name:'Умные уши', sites:['ears'], pools:[{type:'audio',capacity:2}] },
  { id:'cat-gear-9', name:'Боевая перчатка', sites:['left-arm','right-arm'], pools:[{type:'arm',capacity:3}] },
  { id:'cat-gear-83', name:'Смарт-Перчатка Xtra-DEX от Dynalar', sites:['left-arm','right-arm'], pools:[{type:'arm',capacity:2},{type:'finger',capacity:5}], needsPlugs:true },
  { id:'cat-gear-84', name:'Смарт-Перчатка CyberDude', sites:['left-arm','right-arm'], pools:[{type:'arm',capacity:2}], fingerless:true },
] as const;

export function gearCyberwareDevice(item: GearItem) {
  return DEVICES.find(device => device.id === item.catalogId || (!item.catalogId && device.name === item.name));
}

export function gearCyberwareHosts(character: Character) {
  return character.gear.filter(item => item.quantity > 0).flatMap(item => {
    const device = gearCyberwareDevice(item);
    return device?.pools.map(pool => ({ id:`${item.id}:gear:${pool.type}`, name:`${item.name} · ${pool.type}`, type:pool.type as CyberwareSlotType, capacity:pool.capacity, used:0, gearId:item.id })) ?? [];
  });
}

export function gearForCyberwareHost(character: Character, target?: string) {
  const host = gearCyberwareHosts(character).find(host => host.id === target);
  return host ? character.gear.find(item => item.id === host.gearId) : undefined;
}

export function wearCyberwareGear(character: Character, id: string, site: GearItem['wornOn']): Character {
  const item = character.gear.find(item => item.id === id);
  const device = item && gearCyberwareDevice(item);
  if (!item || !device || (site && (item.quantity <= 0 || !(device.sites as readonly string[]).includes(site)))) return character;
  const gear = character.gear.map(gear => gear.id === id ? {...gear,quantity:site ? 1 : gear.quantity,wornOn:site} : site && gear.wornOn === site ? {...gear,wornOn:undefined} : gear);
  if (site && item.quantity > 1) gear.push({...item,id:'gear-' + crypto.randomUUID(),quantity:item.quantity-1,wornOn:undefined});
  return { ...character, gear };
}
