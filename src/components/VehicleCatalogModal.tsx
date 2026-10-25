import React, { useState } from 'react';
import { Character, Vehicle, VehicleCategory } from '../types/character';
import { Language } from '../locales/i18n';
import { addVehicleToGarage, vehicleErrorMessage, vehicleFromCatalog, VEHICLE_SECTIONS } from '../utils/vehicles';
import { VehicleCatalogBrowser } from './VehicleCatalogBrowser';
import { useCatalogNotice } from './CatalogNotice';

interface Props {
  character: Character;
  lang: Language;
  onUpdateCharacter: (character: Character) => void;
  onClose: () => void;
}

export const VehicleCatalogModal: React.FC<Props> = ({ character, lang, onUpdateCharacter, onClose }) => {
  const [vehicle, setVehicle] = useState<Vehicle>({ id: '', name: '', model: '', category: 'Ground', sdpMax: 50, sdpCurrent: 50, armorSp: 0, seats: 4, speedCombat: '20 СКО', speedNarrative: '160 км/ч', costEb: 0, notes: '', nomadRankReq: 0, upgrades: [] });
  const [error, setError] = useState('');
  const catalog = useCatalogNotice(lang);
  const add = (purchase: boolean) => {
    const result = addVehicleToGarage(character, vehicle, purchase);
    if (!result.character) { setError(vehicleErrorMessage(result.error!, lang)); return; }
    onUpdateCharacter(result.character);
    setError('');
    catalog.added(vehicle.name);
  };

  return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm no-print">
    <section role="dialog" aria-modal="true" aria-label={lang === 'ru' ? 'Каталог транспорта' : 'Vehicle catalog'} className="bg-zinc-900 border-2 border-cyan-500 w-full max-w-4xl rounded-lg shadow-2xl p-4 sm:p-5 space-y-4 max-h-[92dvh] overflow-y-auto">
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800 pb-2">
        <h3 className="font-orbitron font-bold text-cyan-400 text-sm uppercase">{lang === 'ru' ? 'Каталог транспорта' : 'Vehicle catalog'}</h3>
        <button aria-label={lang === 'ru' ? 'Закрыть каталог' : 'Close catalog'} onClick={onClose} className="text-zinc-400 hover:text-white p-1">✕</button>
      </div>
      <VehicleCatalogBrowser lang={lang} selectedId={vehicle.catalogId} onSelect={item => { setVehicle(vehicleFromCatalog(item, lang)); setError(''); }} />
      <div className="border border-cyan-900 bg-cyan-950/20 rounded p-3 text-xs text-zinc-300 space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-cyan-200">{vehicle.name ? `${lang === 'ru' ? 'Выбран' : 'Selected'}: ${vehicle.name}` : (lang === 'ru' ? 'Выберите транспорт' : 'Choose a vehicle')}</p>{vehicle.name && <span className="text-amber-300">{vehicle.costEb.toLocaleString(lang)} eb</span>}</div>
        <p className="whitespace-pre-line max-h-24 overflow-y-auto">{vehicle.notes || (lang === 'ru' ? 'Выберите карточку из каталога или введите свой транспорт ниже.' : 'Choose a catalog card or enter a custom vehicle below.')}</p>
        {vehicle.sourceUrl && <a href={vehicle.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-cyan-400 underline">Data Pool ↗</a>}
      </div>
      <details className="space-y-3">
        <summary className="text-xs text-zinc-400 cursor-pointer">{lang === 'ru' ? 'Изменить параметры / свой транспорт' : 'Edit parameters / custom vehicle'}</summary>
        <div className="grid sm:grid-cols-2 gap-3 text-xs text-zinc-300">
          {([
            ['name', lang === 'ru' ? 'Название транспорта' : 'Vehicle name'],
            ['model', lang === 'ru' ? 'Модель' : 'Model'],
            ['speedCombat', lang === 'ru' ? 'Скорость в бою' : 'Combat speed'],
            ['speedNarrative', lang === 'ru' ? 'Скорость вне боя' : 'Narrative speed'],
          ] as const).map(([key, label]) => <label key={key}>{label}<input aria-label={label} value={vehicle[key]} onChange={event => setVehicle({ ...vehicle, [key]: event.target.value })} className="block w-full mt-1 bg-zinc-950 border border-zinc-700 p-2 rounded text-zinc-100" /></label>)}
          <label>{lang === 'ru' ? 'Категория' : 'Category'}<select aria-label={lang === 'ru' ? 'Категория транспорта' : 'Vehicle category'} value={vehicle.category} onChange={event => setVehicle({ ...vehicle, category: event.target.value as VehicleCategory })} className="block w-full mt-1 bg-zinc-950 border border-zinc-700 p-2 rounded">{VEHICLE_SECTIONS.map(section => <option key={section.id} value={section.id}>{section[lang]}</option>)}</select></label>
          <label>{lang === 'ru' ? 'Места (число или описание)' : 'Seats (number or description)'}<input aria-label={lang === 'ru' ? 'Места' : 'Seats'} value={vehicle.seats} onChange={event => setVehicle({ ...vehicle, seats: event.target.value })} className="block w-full mt-1 bg-zinc-950 border border-zinc-700 p-2 rounded" /></label>
          {([
            ['sdpMax', lang === 'ru' ? 'Прочность ПЗТ' : 'SDP maximum', 1],
            ['armorSp', lang === 'ru' ? 'Броня SP' : 'Armor SP', 0],
            ['costEb', lang === 'ru' ? 'Цена eb' : 'Price eb', 0],
            ['nomadRankReq', lang === 'ru' ? 'Ранг Мото' : 'Moto rank', 0],
          ] as const).map(([key, label, min]) => <label key={key}>{label}<input aria-label={label} type="number" min={min} max={key === 'nomadRankReq' ? 10 : undefined} value={vehicle[key] ?? 0} onChange={event => setVehicle({ ...vehicle, [key]: Number(event.target.value) })} className="block w-full mt-1 bg-zinc-950 border border-zinc-700 p-2 rounded" /></label>)}
        </div>
        <label className="block text-xs text-zinc-300">{lang === 'ru' ? 'Описание и особенности' : 'Description & notes'}<textarea aria-label={lang === 'ru' ? 'Описание транспорта' : 'Vehicle description'} rows={4} value={vehicle.notes} onChange={event => setVehicle({ ...vehicle, notes: event.target.value })} className="block w-full mt-1 bg-zinc-950 border border-zinc-700 p-2 rounded" /></label>
      </details>
      <div className="flex flex-wrap justify-between gap-2 text-xs text-zinc-300"><span>{lang === 'ru' ? 'Стоимость' : 'Price'}: {vehicle.costEb.toLocaleString(lang)} eb</span><span>{lang === 'ru' ? 'Наличные' : 'Cash'}: {character.cashEb.toLocaleString(lang)} eb</span></div>
      <p className="text-[11px] text-zinc-500">{lang === 'ru' ? 'Уже имеющийся транспорт добавляется без списания eb. Покупка оплачивается из наличных. Ранг Мото относится к доступу через семью Кочевника.' : 'Adding an owned vehicle does not charge eb. Purchases use cash. Moto rank refers to Nomad family access.'}</p>
      {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
      {catalog.notice}
      <div className="flex flex-wrap justify-end gap-2 pt-2">
        <button onClick={onClose} className="px-3 py-2 rounded bg-zinc-800 text-zinc-300 text-xs">{lang === 'ru' ? 'Закрыть' : 'Close'}</button>
        <button onClick={() => add(false)} className="px-3 py-2 rounded bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs">{lang === 'ru' ? 'Добавить без покупки' : 'Add owned vehicle'}</button>
        <button onClick={() => add(true)} className="px-4 py-2 rounded bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs">{lang === 'ru' ? 'Купить' : 'Buy'}</button>
      </div>
    </section>
  </div>;
};
