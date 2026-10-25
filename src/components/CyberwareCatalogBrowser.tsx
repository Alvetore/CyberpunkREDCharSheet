import React, { useState } from 'react';
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

export const CyberwareCatalogBrowser: React.FC<Props> = ({ lang, selectedId, onSelect }) => {
  const [activeSection, setActiveSection] = useState('all');
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase(lang);
  const groups = SECTIONS.map(section => {
    const entries = DATAPOOL_CYBERWARE.filter(item => sectionId(item) === section.id);
    const label = section[lang];
    return { ...section, label, total: entries.length, items: entries.filter(item =>
      `${item.name} ${item.description} ${item.sourceBook ?? ''} ${label} ${item.category}`.toLocaleLowerCase(lang).includes(normalizedQuery)) };
  });
  const visibleGroups = groups.filter(group => (activeSection === 'all' || group.id === activeSection) && group.items.length);
  const resultCount = visibleGroups.reduce((total, group) => total + group.items.length, 0);

  return <div className="space-y-2">
    <label className="block text-xs text-zinc-300">
      {lang === 'ru' ? 'Поиск по каталогу' : 'Search catalog'}
      <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={lang === 'ru' ? 'Название, описание или книга...' : 'Name, description or book...'} className="block w-full mt-1 bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-zinc-100" />
    </label>
    <div className="grid sm:grid-cols-[190px_minmax(0,1fr)] gap-3">
      <nav aria-label={lang === 'ru' ? 'Разделы имплантов' : 'Cyberware sections'} className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto sm:max-h-[42dvh] pb-1">
        {[{ id: 'all', label: lang === 'ru' ? 'Все разделы' : 'All sections', total: DATAPOOL_CYBERWARE.length, items: groups.flatMap(group => group.items) }, ...groups].filter(group => group.total > 0).map(group =>
          <button key={group.id} type="button" aria-pressed={activeSection === group.id} onClick={() => setActiveSection(group.id)} className={`shrink-0 text-left rounded px-2.5 py-2 text-xs flex items-center justify-between gap-2 border ${activeSection === group.id ? 'bg-cyan-950 text-cyan-200 border-cyan-600' : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-600'}`}>
            <span>{group.label}</span><span className="text-[10px] opacity-70">{normalizedQuery ? group.items.length : group.total}</span>
          </button>)}
      </nav>
      <div role="region" aria-label={lang === 'ru' ? 'Импланты каталога' : 'Catalog cyberware'} tabIndex={0} className="min-w-0 max-h-[42dvh] overflow-y-auto space-y-4 pr-1">
        <p role="status" className="text-xs text-zinc-400">{lang === 'ru' ? 'Найдено' : 'Found'}: {resultCount}</p>
        {visibleGroups.map(group => <section key={group.id} aria-label={group.label}>
          <h4 className="text-xs font-bold text-cyan-300 mb-2">{group.label} · {group.items.length}</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {group.items.map(item => <button key={item.id} type="button" aria-pressed={selectedId === item.id} aria-label={`${lang === 'ru' ? 'Выбрать' : 'Select'}: ${item.name}`} onClick={() => onSelect(item)} className={`text-left rounded border p-3 min-w-0 transition focus-visible:outline-2 focus-visible:outline-cyan-400 ${selectedId === item.id ? 'bg-cyan-950/60 border-cyan-400' : 'bg-zinc-950 border-zinc-800 hover:border-cyan-700'}`}>
              <span className="block text-sm font-semibold text-zinc-100">{item.name}</span>
              <span className="flex flex-wrap gap-x-3 gap-y-1 mt-1 text-xs"><span className="text-amber-300">{item.costEb.toLocaleString(lang)} eb</span><span className="text-red-300">{item.humanityCostKnown === false ? 'HL —' : `${item.humanityCost} HL`}</span>{(item.weapon || item.weaponMount) && <span className="text-cyan-300">{lang === 'ru' ? 'Кибероружие' : 'Cyberweapon'}</span>}</span>
              <span className="block mt-2 text-[11px] text-zinc-400">{cyberwareMounts(item).map(mount => `${mount.allowedHosts.map(type => cyberwareSlotLabel(type, lang)).join(' / ')}: ${mount.slots} ${lang === 'ru' ? 'сл.' : 'slot(s)'}`).join(' + ')}</span>
              <span className="mt-1 text-xs text-zinc-500 line-clamp-2">{item.description}</span>
            </button>)}
          </div>
        </section>)}
        {!resultCount && <p className="text-sm text-zinc-400 py-5">{lang === 'ru' ? 'Ничего не найдено. Измените запрос или выберите другой раздел.' : 'No matches. Change the query or choose another section.'}</p>}
      </div>
    </div>
  </div>;
};
