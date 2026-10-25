import React, { useState } from 'react';
import { Language } from '../locales/i18n';

export interface CatalogCard {
  id: string;
  name: string;
  description: string;
  searchText?: string;
  summary: React.ReactNode;
}

interface Props {
  lang: Language;
  groups: { id: string; label: string; items: CatalogCard[] }[];
  selectedId?: string;
  onSelect: (id: string) => void;
}

/** Shared navigation, search and card selection for gear and cyberware. */
export const CatalogBrowser: React.FC<Props> = ({ lang, groups, selectedId, onSelect }) => {
  const [activeSection, setActiveSection] = useState('all');
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase(lang);
  const filtered = groups.map(group => ({ ...group, total: group.items.length, items: group.items.filter(item =>
    `${item.name} ${item.description} ${item.searchText ?? ''} ${group.label}`.toLocaleLowerCase(lang).includes(normalizedQuery)) }));
  const visibleGroups = filtered.filter(group => (activeSection === 'all' || group.id === activeSection) && group.items.length);
  const resultCount = visibleGroups.reduce((total, group) => total + group.items.length, 0);
  const all = { id: 'all', label: lang === 'ru' ? 'Все разделы' : 'All sections', total: groups.reduce((total, group) => total + group.items.length, 0), items: filtered.flatMap(group => group.items) };

  return <div className="space-y-2">
    <label className="block text-xs text-zinc-300">
      {lang === 'ru' ? 'Поиск по каталогу' : 'Search catalog'}
      <input type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder={lang === 'ru' ? 'Название, описание или раздел...' : 'Name, description or section...'} className="block w-full mt-1 bg-zinc-950 border border-zinc-700 rounded p-2 text-sm text-zinc-100" />
    </label>
    <div className="grid sm:grid-cols-[190px_minmax(0,1fr)] gap-3">
      <nav aria-label={lang === 'ru' ? 'Разделы каталога' : 'Catalog sections'} className="flex sm:flex-col gap-1 overflow-x-auto sm:overflow-y-auto sm:max-h-[34dvh] pb-1">
        {[all, ...filtered].filter(group => group.total > 0).map(group => <button key={group.id} type="button" aria-pressed={activeSection === group.id} onClick={() => setActiveSection(group.id)} className={`shrink-0 text-left rounded px-2.5 py-2 text-xs flex items-center justify-between gap-2 border ${activeSection === group.id ? 'bg-cyan-950 text-cyan-200 border-cyan-600' : 'bg-zinc-950 text-zinc-300 border-zinc-800 hover:border-zinc-600'}`}>
          <span>{group.label}</span><span className="text-[10px] opacity-70">{normalizedQuery ? group.items.length : group.total}</span>
        </button>)}
      </nav>
      <div key={`${activeSection}:${normalizedQuery}`} role="region" aria-label={lang === 'ru' ? 'Предметы каталога' : 'Catalog items'} tabIndex={0} className="min-w-0 max-h-[34dvh] overflow-y-auto space-y-4 pr-1">
        <p role="status" className="text-xs text-zinc-400">{lang === 'ru' ? 'Найдено' : 'Found'}: {resultCount}</p>
        {visibleGroups.map(group => <section key={group.id} aria-label={group.label}>
          <h4 className="text-xs font-bold text-cyan-300 mb-2">{group.label} · {group.items.length}</h4>
          <div className="grid md:grid-cols-2 gap-2">
            {group.items.map(item => <button key={item.id} type="button" aria-pressed={selectedId === item.id} aria-label={`${lang === 'ru' ? 'Выбрать' : 'Select'}: ${item.name}`} onClick={() => onSelect(item.id)} className={`text-left rounded border p-3 min-w-0 transition focus-visible:outline-2 focus-visible:outline-cyan-400 ${selectedId === item.id ? 'bg-cyan-950/60 border-cyan-400' : 'bg-zinc-950 border-zinc-800 hover:border-cyan-700'}`}>
              <span className="block text-sm font-semibold text-zinc-100">{item.name}</span>
              {item.summary}
              <span className="mt-1 text-xs text-zinc-500 line-clamp-2">{item.description}</span>
            </button>)}
          </div>
        </section>)}
        {!resultCount && <p className="text-sm text-zinc-400 py-5">{lang === 'ru' ? 'Ничего не найдено. Измените запрос или выберите другой раздел.' : 'No matches. Change the query or choose another section.'}</p>}
      </div>
    </div>
  </div>;
};
