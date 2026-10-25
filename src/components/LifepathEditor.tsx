import React from 'react';
import { Lifepath, LifepathEnemy } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { CPR_LIFEPATH_TABLES } from '../data/initialData';
import { sfx } from '../utils/audio';
import { emptyEnemy, enemyEntries, friendEntries, generateLifepath, loveAffairEntries, updateEnemies, updateRelationships } from '../utils/lifepath';
import { Dices, Plus, Sparkles, X } from 'lucide-react';

interface Props {
  value: Lifepath;
  onChange: (value: Lifepath) => void;
  lang: Language;
  idPrefix: string;
}
type TextField = Exclude<keyof Lifepath, 'friendEntries' | 'loveAffairEntries' | 'enemyEntries'>;
const padRows = <T,>(rows: T[], blank: () => T): T[] => Array.from({ length: Math.max(3, rows.length) }, (_, index) => rows[index] ?? blank());
const inputClass = 'w-full min-w-0 bg-zinc-950 text-zinc-100 text-xs leading-relaxed p-2 pr-6 resize-y outline-none focus:ring-1 focus:ring-inset focus:ring-cyan-500';

export const LifepathEditor: React.FC<Props> = ({ value, onChange, lang, idPrefix }) => {
  const t = translations[lang];
  const updateText = (key: TextField, text: string) => onChange({ ...value, [key]: text });
  // Row order follows the official sheet: two label/value pairs per row.
  const fields: { key: TextField; ru: string; en: string; options?: string[] }[] = [
    { key: 'culturalOrigin', ru: 'Культурные корни', en: 'Cultural origins' },
    { key: 'personality', ru: 'Личность', en: 'Personality', options: CPR_LIFEPATH_TABLES.personalities },
    { key: 'clothingStyle', ru: 'Одежда и личный стиль', en: 'Clothing & personal style', options: CPR_LIFEPATH_TABLES.clothingStyles },
    { key: 'hairstyle', ru: 'Причёска', en: 'Hairstyle', options: CPR_LIFEPATH_TABLES.hairstyles },
    { key: 'valueMost', ru: 'Главная ценность', en: 'Most valued thing', options: CPR_LIFEPATH_TABLES.valueMost },
    { key: 'feelingsAboutPeople', ru: 'Отношение к людям', en: 'Feelings about people', options: CPR_LIFEPATH_TABLES.feelingsAboutPeople },
    { key: 'valuedPerson', ru: 'Самый ценный человек', en: 'Most valued person' },
    { key: 'valuedPossession', ru: 'Самое ценное имущество', en: 'Most valued possession' },
    { key: 'familyBackground', ru: 'Семейная предыстория', en: 'Family background', options: CPR_LIFEPATH_TABLES.familyBackgrounds },
    { key: 'childhoodEnv', ru: 'Окружение в детстве', en: 'Childhood environment', options: CPR_LIFEPATH_TABLES.childhoodEnvs },
    { key: 'familyCrisis', ru: 'Семейный кризис', en: 'Family crisis', options: CPR_LIFEPATH_TABLES.familyCrises },
    { key: 'lifeGoals', ru: 'Жизненные цели', en: 'Life goals', options: CPR_LIFEPATH_TABLES.lifeGoals },
  ];
  const enemies = padRows(enemyEntries(value), emptyEnemy);
  const enemyColumns: { key: keyof LifepathEnemy; ru: string; en: string }[] = [
    { key: 'who', ru: 'Кто?', en: 'Who?' }, { key: 'why', ru: 'Почему?', en: 'Why?' },
    { key: 'resources', ru: 'Какие имеет ресурсы?', en: 'Their resources' }, { key: 'response', ru: 'Что ты сделаешь?', en: 'Your response' },
  ];

  const relationships = (kind: 'friendEntries' | 'loveAffairEntries') => {
    const isFriend = kind === 'friendEntries';
    const rows = padRows(isFriend ? friendEntries(value) : loveAffairEntries(value), () => '');
    const title = isFriend ? (lang === 'ru' ? 'Друзья' : 'Friends') : (lang === 'ru' ? 'Трагичный роман' : 'Tragic love affairs');
    const rowLabel = isFriend ? (lang === 'ru' ? 'Друг' : 'Friend') : (lang === 'ru' ? 'Трагичный роман' : 'Tragic love affair');
    return <section aria-label={title} className="min-w-0">
      <h3 className="bg-red-700/80 text-white font-semibold text-xs px-2 py-1.5">{title}</h3>
      <div className="space-y-2 mt-2">{rows.map((text, index) => <div key={index} className="relative border border-red-900/50">
        <label htmlFor={`${idPrefix}-${kind}-${index}`} className="sr-only">{rowLabel} {index + 1}</label>
        <textarea id={`${idPrefix}-${kind}-${index}`} rows={2} value={text} onChange={event => onChange(updateRelationships(value, kind, rows.map((row, i) => i === index ? event.target.value : row)))} className={`${inputClass} block min-h-[66px]`} />
        <button type="button" aria-label={`${lang === 'ru' ? 'Удалить строку' : 'Remove row'}: ${rowLabel} ${index + 1}`} onClick={() => onChange(updateRelationships(value, kind, rows.filter((_, i) => i !== index)))} className="absolute right-1 top-1 p-0.5 text-zinc-500 hover:text-red-400 no-print"><X size={12} /></button>
      </div>)}</div>
      <button type="button" disabled={rows.length >= 100} onClick={() => onChange(updateRelationships(value, kind, [...rows, '']))} className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400 hover:text-cyan-300 disabled:opacity-40 no-print"><Plus size={12} />{isFriend ? (lang === 'ru' ? 'Добавить друга' : 'Add friend') : (lang === 'ru' ? 'Добавить роман' : 'Add love affair')}</button>
    </section>;
  };

  return <div className="space-y-3">
    <section aria-label={lang === 'ru' ? 'Становление' : 'Lifepath'} className="rounded-lg border border-red-800/70 bg-zinc-900/60 overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-2 bg-red-950/70 border-b border-red-800/70">
        <h2 className="font-orbitron font-bold text-sm text-white bg-red-600 px-4 py-3 uppercase tracking-wide" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 70%, 92% 100%, 0 100%)' }}>{lang === 'ru' ? 'Становление' : 'Lifepath'}</h2>
        <button type="button" onClick={() => { sfx.playDiceRoll(); onChange(generateLifepath(value, lang)); }} className="m-2 px-3 py-1.5 flex items-center gap-2 text-xs text-zinc-300 hover:text-white rounded border border-red-900 hover:bg-red-900/50 no-print"><Sparkles size={13} />{t.generateRandomLifepath}</button>
      </header>
      <div className="p-3 grid xl:grid-cols-[1.3fr_1fr] gap-3 items-start">
        <div className="grid sm:grid-cols-2 gap-2.5">
          {fields.map(field => <div key={field.key} className="grid grid-cols-[minmax(90px,0.9fr)_minmax(0,1.2fr)] border border-red-900/60 min-h-[76px]">
            <div className="bg-zinc-900 p-2 flex flex-col justify-between gap-1">
              <label htmlFor={`${idPrefix}-${field.key}`} className="text-[11px] leading-snug font-semibold text-zinc-300">{field[lang]}</label>
              {(field.options || field.key === 'culturalOrigin') && <button type="button" aria-label={`${lang === 'ru' ? 'Случайно' : 'Randomize'}: ${field[lang]}`} onClick={() => {
                sfx.playDiceRoll();
                if (field.key === 'culturalOrigin') { const origin = CPR_LIFEPATH_TABLES.culturalOrigins[Math.floor(Math.random() * CPR_LIFEPATH_TABLES.culturalOrigins.length)]; onChange({ ...value, culturalOrigin: origin.origin, languages: origin.languages }); }
                else if (field.options) updateText(field.key, field.options[Math.floor(Math.random() * field.options.length)]);
              }} className="self-end text-zinc-600 hover:text-yellow-400 p-0.5 no-print"><Dices size={12} /></button>}
            </div>
            <textarea id={`${idPrefix}-${field.key}`} rows={2} value={value[field.key]} onChange={event => updateText(field.key, event.target.value)} className={`${inputClass} min-h-[74px] h-full pr-2`} />
          </div>)}
        </div>
        <div className="space-y-3 min-w-0">
          <div className="grid grid-cols-2 gap-2.5">{relationships('friendEntries')}{relationships('loveAffairEntries')}</div>
          <section aria-label={lang === 'ru' ? 'Враги' : 'Enemies'}>
            <h3 className="bg-red-700/80 text-white font-semibold text-xs px-2 py-1.5">{lang === 'ru' ? 'Враги' : 'Enemies'}</h3>
            <div className="overflow-x-auto touch-pan-x">
              <table className="w-full table-fixed min-w-[420px] border-separate border-spacing-1">
                <thead><tr>{enemyColumns.map(column => <th key={column.key} scope="col" className="text-[10px] font-semibold text-zinc-400 text-left py-1">{column[lang]}</th>)}</tr></thead>
                <tbody>{enemies.map((row, index) => <tr key={index}>{enemyColumns.map(column => <td key={column.key} className="relative border border-red-900/50 align-top">
                  <label htmlFor={`${idPrefix}-enemy-${index}-${column.key}`} className="sr-only">{lang === 'ru' ? 'Враг' : 'Enemy'} {index + 1}: {column[lang]}</label>
                  <textarea id={`${idPrefix}-enemy-${index}-${column.key}`} rows={2} value={row[column.key]} onChange={event => onChange(updateEnemies(value, enemies.map((enemy, i) => i === index ? { ...enemy, [column.key]: event.target.value } : enemy), lang))} className={`${inputClass} block min-h-[64px] ${column.key === 'who' ? '' : 'pr-2'}`} />
                  {column.key === 'who' && <button type="button" aria-label={`${lang === 'ru' ? 'Удалить врага' : 'Remove enemy'} ${index + 1}`} onClick={() => onChange(updateEnemies(value, enemies.filter((_, i) => i !== index), lang))} className="absolute top-1 right-1 text-zinc-500 hover:text-red-400 no-print"><X size={12} /></button>}
                </td>)}</tr>)}</tbody>
              </table>
            </div>
            <button type="button" disabled={enemies.length >= 100} onClick={() => onChange(updateEnemies(value, [...enemies, emptyEnemy()], lang))} className="mt-1 flex items-center gap-1 text-[10px] text-zinc-400 hover:text-cyan-300 disabled:opacity-40 no-print"><Plus size={12} />{lang === 'ru' ? 'Добавить врага' : 'Add enemy'}</button>
          </section>
        </div>
      </div>
    </section>
    <details className="rounded border border-zinc-800 bg-zinc-900/50 p-3">
      <summary className="text-xs text-zinc-400 cursor-pointer">{lang === 'ru' ? 'Дополнительно: языки, детали стиля и жизненный путь роли' : 'Additional: languages, affectations & role lifepath'}</summary>
      <div className="grid md:grid-cols-3 gap-3 mt-3">{([
        ['languages', lang === 'ru' ? 'Языки' : 'Languages'], ['affectation', lang === 'ru' ? 'Детали личного стиля' : 'Affectations'], ['roleLifepathNotes', lang === 'ru' ? 'Жизненный путь роли' : 'Role lifepath'],
      ] as const).map(([key, title]) => <label key={key} className="text-xs text-zinc-400">{title}<textarea id={`${idPrefix}-${key}`} rows={3} value={value[key]} onChange={event => updateText(key, event.target.value)} className={`${inputClass} block mt-1 rounded border border-zinc-800 pr-2`} /></label>)}</div>
    </details>
  </div>;
};
