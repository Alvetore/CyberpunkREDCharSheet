import React from 'react';
import { CatalogGearItem, DATAPOOL_GEAR } from '../data/datapoolCatalog';
import { GEAR_SECTIONS } from '../data/gearCatalog';
import { Language } from '../locales/i18n';
import { gearPrice } from '../utils/gear';
import { CatalogBrowser } from './CatalogBrowser';

interface Props {
  lang: Language;
  selectedId?: string;
  onSelect: (item: CatalogGearItem) => void;
}

export const GearCatalogBrowser: React.FC<Props> = ({ lang, selectedId, onSelect }) => <CatalogBrowser
  lang={lang}
  selectedId={selectedId}
  onSelect={id => { const item = DATAPOOL_GEAR.find(entry => entry.id === id); if (item) onSelect(item); }}
  groups={GEAR_SECTIONS.map(section => ({
    id: section.id,
    label: section[lang],
    items: DATAPOOL_GEAR.filter(item => item.section === section.id).map(item => ({
      id: item.id,
      name: item.name,
      description: item.notes,
      searchText: `${item.category} ${item.priceLabel}`,
      summary: <span className="block mt-1 text-xs text-amber-300">{gearPrice(item, lang)}</span>,
    })),
  }))}
/>;
