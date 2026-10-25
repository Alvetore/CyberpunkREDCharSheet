import React from 'react';
import { CatalogBrowser } from './CatalogBrowser';
import { CatalogCyberwareItem, DATAPOOL_CYBERWARE } from '../data/datapoolCatalog';
import { Language } from '../locales/i18n';
import { cyberwareMounts, cyberwareSlotLabel } from '../utils/cyberware';

const SECTIONS = [
  { id: 'Fashionware', ru: 'Стилевые импланты', en: 'Fashionware' },
  { id: 'Neuralware', ru: 'Нейроимпланты', en: 'Neuralware' },
  { id: 'Cyberoptics', ru: 'Кибероптика', en: 'Cyberoptics' },
  { id: 'Cyberaudio', ru: 'Кибераудио', en: 'Cyberaudio' },
  { id: 'Internal', ru: 'Внутренние импланты', en: 'Internal cyberware' },
  { id: 'External', ru: 'Внешние импланты', en: 'External cyberware' },
  { id: 'arms', ru: 'Киберруки и опции', en: 'Cyberarms & options' },
  { id: 'legs', ru: 'Киберноги и опции', en: 'Cyberlegs & options' },
  { id: 'limbs', ru: 'Общие опции конечностей', en: 'Shared limb options' },
  { id: 'Borgware', ru: 'Боргирование', en: 'Borgware' },
  { id: 'chips', ru: 'Щепки', en: 'Chips' },
  { id: 'upgrades', ru: 'Улучшения EMK', en: 'EMK upgrades' },
];

function sectionId(item: CatalogCyberwareItem): string {
  if (item.kind === 'chip') return 'chips';
  if (item.kind === 'upgrade') return 'upgrades';
  if (item.borgware) return 'Borgware';
  if (item.category !== 'Cyberlimb') return item.category;
  const hosts = item.installRule?.allowedHosts ?? [];
  const arm = hosts.some(type => type === 'arm' || type === 'arm-site' || type === 'finger');
  const leg = hosts.some(type => type === 'leg' || type === 'leg-site');
  return arm && !leg ? 'arms' : leg && !arm ? 'legs' : 'limbs';
}

interface Props {
  lang: Language;
  selectedId?: string;
  onSelect: (item: CatalogCyberwareItem) => void;
}

export const CyberwareCatalogBrowser: React.FC<Props> = ({ lang, selectedId, onSelect }) => <CatalogBrowser
  lang={lang}
  selectedId={selectedId}
  onSelect={id => { const item = DATAPOOL_CYBERWARE.find(entry => entry.id === id); if (item) onSelect(item); }}
  groups={SECTIONS.map(section => ({
    id: section.id,
    label: section[lang],
    items: DATAPOOL_CYBERWARE.filter(item => sectionId(item) === section.id).map(item => ({
      id: item.id,
      name: item.name,
      description: item.description,
      searchText: `${item.sourceBook ?? ''} ${item.category}`,
      summary: <>
        <span className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs"><span className="text-amber-300">{item.costEb.toLocaleString(lang)} eb</span><span className="text-red-300">{item.humanityCostKnown === false ? 'HL —' : `${item.humanityCost} HL`}</span>{(item.weapon || item.weaponMount) && <span className="text-cyan-300">{lang === 'ru' ? 'Кибероружие' : 'Cyberweapon'}</span>}</span>
        <span className="block mt-2 text-[11px] text-zinc-400">{cyberwareMounts(item).map(mount => `${mount.allowedHosts.map(type => cyberwareSlotLabel(type, lang)).join(' / ')}: ${mount.slots} ${lang === 'ru' ? 'сл.' : 'slot(s)'}`).join(' + ')}</span>
      </>,
    })),
  }))}
/>;
