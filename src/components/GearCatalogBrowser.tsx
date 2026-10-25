import React from 'react';
import { CatalogGearItem, DATAPOOL_GEAR, DATAPOOL_WEAPONS, DATAPOOL_ARMORS, DATAPOOL_CYBERWARE } from '../data/datapoolCatalog';
import { DATAPOOL_GEAR_SECTIONS as GEAR_SECTIONS } from '../data/datapoolCatalog';
import { Language } from '../locales/i18n';
import { gearPrice } from '../utils/gear';
import { CatalogBrowser } from './CatalogBrowser';
import { BackpackEquipment, equipmentCatalogEntry } from '../utils/backpack';

interface Props {
  lang: Language;
  selectedId?: string;
  onSelect: (item: CatalogGearItem, equipment?: BackpackEquipment) => void;
}

export const GearCatalogBrowser: React.FC<Props> = ({ lang, selectedId, onSelect }) => {
  const equipment: BackpackEquipment[] = [
    ...DATAPOOL_WEAPONS.map(item => ({ kind: 'weapon' as const, item })),
    ...DATAPOOL_ARMORS.map(item => ({ kind: 'armor' as const, item })),
    ...DATAPOOL_CYBERWARE.map(item => ({ kind: 'cyberware' as const, item })),
  ];
  const extraSections = [
    { id: 'weapons', label: lang === 'ru' ? 'Оружие' : 'Weapons', accepts: (item: BackpackEquipment) => item.kind === 'weapon' && item.item.category !== 'Thrown Grenade' },
    { id: 'grenades', label: lang === 'ru' ? 'Гранаты' : 'Grenades', accepts: (item: BackpackEquipment) => item.kind === 'weapon' && item.item.category === 'Thrown Grenade' },
    { id: 'armor', label: lang === 'ru' ? 'Броня и щиты' : 'Armor & shields', accepts: (item: BackpackEquipment) => item.kind === 'armor' },
    { id: 'cyberware', label: lang === 'ru' ? 'Киберимпланты' : 'Cyberware', accepts: (item: BackpackEquipment) => item.kind === 'cyberware' },
  ];
  return <CatalogBrowser
  lang={lang}
  selectedId={selectedId}
  onSelect={id => { const item = DATAPOOL_GEAR.find(entry => entry.id === id); if (item) onSelect(item); else { const found = equipment.find(entry => entry.item.id === id); if (found) onSelect(equipmentCatalogEntry(found), found); } }}
  groups={[...GEAR_SECTIONS.map(section => ({
    id: section.id,
    label: section[lang],
    items: DATAPOOL_GEAR.filter(item => item.section === section.id).map(item => ({
      id: item.id,
      name: item.name,
      description: item.notes,
      searchText: `${item.category} ${item.priceLabel}`,
      summary: <span className="block mt-1 text-xs text-amber-300">{gearPrice(item, lang)}</span>,
    })),
  })), ...extraSections.map(section => ({ id: section.id, label: section.label, items: equipment.filter(section.accepts).map(entry => ({ id: entry.item.id, name: entry.item.name, description: entry.kind === 'cyberware' ? entry.item.description : entry.item.notes ?? '', searchText: entry.kind === 'armor' ? entry.item.location : entry.item.category, summary: <span className="block mt-1 text-xs text-amber-300">{entry.item.costEb.toLocaleString(lang)} eb · {lang === 'ru' ? 'В рюкзак, без использования' : 'Store in backpack, inactive'}</span> })) }))]}
/>;
};
