import React from 'react';
import { CatalogVehicleItem, DATAPOOL_ALL_VEHICLES } from '../data/datapoolVehicles';
import { Language } from '../locales/i18n';
import { VEHICLE_SECTIONS } from '../utils/vehicles';
import { CatalogBrowser } from './CatalogBrowser';

interface Props {
  lang: Language;
  selectedId?: string;
  onSelect: (item: CatalogVehicleItem) => void;
}

export const VehicleCatalogBrowser: React.FC<Props> = ({ lang, selectedId, onSelect }) => <CatalogBrowser
  lang={lang}
  selectedId={selectedId}
  onSelect={id => { const item = DATAPOOL_ALL_VEHICLES.find(entry => entry.id === id); if (item) onSelect(item); }}
  groups={VEHICLE_SECTIONS.map(section => ({
    id: section.id,
    label: section[lang],
    items: DATAPOOL_ALL_VEHICLES.filter(item => item.category === section.id).map(item => ({
      id: item.id,
      name: lang === 'ru' ? item.name : item.nameEn || item.name,
      description: lang === 'ru' ? item.descriptionRu : item.descriptionEn || item.descriptionRu,
      searchText: `${item.name} ${item.nameEn} ${item.typeLabelRu} ${item.typeLabelEn}`,
      summary: <>
        <span className="block mt-1 text-xs font-semibold text-amber-300">{item.costEb.toLocaleString(lang)} eb</span>
        <span className="flex flex-wrap gap-x-3 gap-y-1 my-2 text-[11px] text-cyan-200"><span>{lang === 'ru' ? 'ПЗТ' : 'SDP'} {item.sdpMax}</span><span>{lang === 'ru' ? 'Мест' : 'Seats'}: {item.seats}</span>{item.nomadRankLabel && <span>{lang === 'ru' ? 'Ранг Мото' : 'Moto rank'}: {item.nomadRankLabel}</span>}</span>
        <span className="block text-[11px] text-zinc-400 whitespace-pre-line">{item.speedCombat} · {item.speedNarrative}</span>
      </>,
    })),
  }))}
/>;
