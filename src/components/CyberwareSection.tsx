import React, { useState } from 'react';
import { Character, CyberwareItem, CyberwareCategory, RollResult, CYBERWARE_SLOT_TYPES, CyberwareSlotType } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { calculateHumanityStats } from '../utils/roleUtils';
import { initializeCyberware } from '../utils/rules';
import { TherapyModal } from './TherapyModal';
import { DATAPOOL_CYBERWARE } from '../data/datapoolCatalog';
import { cyberwareCapLoss, cyberwareDefinition, cyberwareHosts, cyberwareSlotLabel, cyberwareWarnings, isCyberwareInstalled, uninstallCyberware } from '../utils/cyberware';
import { CyberwareInstallModal } from './CyberwareInstallModal';
import { CyberwareCatalogBrowser } from './CyberwareCatalogBrowser';
import { useCatalogNotice } from './CatalogNotice';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Brain, 
  Zap, 
  ShieldAlert,
  Layers,
  ShoppingCart,
  Sparkles,
  RotateCcw,
  X
} from 'lucide-react';

interface CyberwareSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onOpenShop?: (category?: 'all' | 'weapons' | 'armor' | 'cyberware' | 'gear' | 'vehicles') => void;
  onAddRollResult?: (roll: RollResult) => void;
  lang: Language;
}

const CATEGORIES: CyberwareCategory[] = [
  'Neuralware',
  'Cyberoptics',
  'Cyberaudio',
  'Internal',
  'External',
  'Cyberlimb',
  'Borgware',
  'Fashionware'
];

export const CyberwareSection: React.FC<CyberwareSectionProps> = ({
  character,
  onUpdateCharacter,
  onOpenShop,
  onAddRollResult,
  lang
}) => {
  const t = translations[lang];
  const [showAddModal, setShowAddModal] = useState(false);
  const catalog = useCatalogNotice(lang);
  const [showTherapyModal, setShowTherapyModal] = useState(false);

  const [newItem, setNewItem] = useState<Partial<CyberwareItem>>({
    name: 'Neural Link',
    category: 'Neuralware',
    installLocation: 'Spine',
    humanityCost: 7,
    description: lang === 'ru' ? 'Основа для нервных имплантов' : 'Baseline neural interface foundation',
    installRule: DATAPOOL_CYBERWARE.find(item => item.name === 'Нейролинк')?.installRule,
  });

  const stats = calculateHumanityStats(character);

  const [itemToDelete, setItemToDelete] = useState<CyberwareItem | null>(null);
  const [installId, setInstallId] = useState<string | null>(null);
  const itemToInstall = character.cyberware.find(item => item.id === installId);
  const warnings = cyberwareWarnings(character, lang);
  const hosts = cyberwareHosts(character);

  const confirmDeleteItem = (mode: 'full' | 'cpr') => {
    if (!itemToDelete) return;
    sfx.playClick();
    const uninstalled = uninstallCyberware(character, itemToDelete.id);
    const updated = uninstalled.cyberware.filter((c) => c.id !== itemToDelete.id);
    const cost = isCyberwareInstalled(character, itemToDelete) ? itemToDelete.humanityLoss ?? itemToDelete.humanityCost : 0;
    const nextStats = calculateHumanityStats({ ...uninstalled, cyberware: updated });

    let newHumanity: number;
    if (mode === 'full') {
      // Full refund (undo adding / mistake): refund full humanityCost
      newHumanity = Math.min(nextStats.maxRecoverableHumanity, character.humanityCurrent + cost);
    } else {
      // CPR in-game removal rules: only refund permanent cap penalty (+2 standard, +4 borgware)
      newHumanity = Math.min(nextStats.maxRecoverableHumanity, character.humanityCurrent);
    }

    onUpdateCharacter({
      ...uninstalled,
      cyberware: updated,
      humanityCurrent: newHumanity
    });

    setItemToDelete(null);
  };

  const handleAddItem = (chooseSlots: boolean) => {
    sfx.playClick();
    const cost = newItem.humanityCost || 0;
    const item: CyberwareItem = cyberwareDefinition({
      ...newItem,
      id: 'cyb-' + crypto.randomUUID(),
      name: newItem.name || (lang === 'ru' ? 'Имплант' : 'Cyberware'),
      category: (newItem.category as CyberwareCategory) || 'Internal',
      installLocation: newItem.installLocation || (lang === 'ru' ? 'Тело' : 'Body'),
      humanityCost: cost,
      description: newItem.description || '',
      isInstalled: false,
    });

    const newCyberware = [...character.cyberware, initializeCyberware(item)];
    onUpdateCharacter({
      ...character,
      cyberware: newCyberware,
    });

    catalog.added(item.name);
    if (chooseSlots) setInstallId(item.id);
  };

  const handleApplyPreset = (preset: Partial<CyberwareItem>) => {
    setNewItem({ ...preset });
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Cpu size={18} className="text-cyan-400" />
          <h2 className="font-orbitron font-bold text-sm text-cyan-400 uppercase tracking-wider">
            {t.cyberwareTitle}
          </h2>
          <span className="text-xs text-zinc-400 font-mono">({character.cyberware.length})</span>
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <div className="bg-zinc-950 border border-red-900/60 px-3 py-1 rounded text-xs flex items-center gap-1.5" title={lang === 'ru' ? `Установка: -${stats.totalInstallationHL} HL. Постоянный штраф: -${stats.cyberwarePermanentLoss} HL` : `Total Install: -${stats.totalInstallationHL} HL. Permanent Cap Loss: -${stats.cyberwarePermanentLoss} HL`}>
            <span className="text-zinc-400 uppercase font-semibold text-[10px]">
              {lang === 'ru' ? 'Штраф порога:' : 'Cap Loss:'}
            </span>
            <span className="font-orbitron font-bold text-red-400">
              -{stats.cyberwarePermanentLoss} HL
            </span>
            <span className="text-[10px] text-zinc-500 font-mono">
              ({lang === 'ru' ? 'уст.' : 'inst.'} -{stats.totalInstallationHL})
            </span>
          </div>

          <div className="bg-zinc-950 border border-cyan-900/60 px-3 py-1 rounded text-xs flex items-center gap-1.5" title={lang === 'ru' ? `Текущая: ${stats.currentHumanity} / Порог с имплантами: ${stats.maxRecoverableHumanity} (База: ${stats.baseHumanityMax})` : `Current: ${stats.currentHumanity} / Cap: ${stats.maxRecoverableHumanity} (Base: ${stats.baseHumanityMax})`}>
            <Brain size={13} className="text-cyan-400" />
            <span className="text-zinc-400 uppercase font-semibold text-[10px]">
              {t.humanity}:
            </span>
            <span className="font-orbitron font-bold text-cyan-300">
              {stats.currentHumanity} / {stats.maxRecoverableHumanity}
            </span>
            <span className="text-[10px] text-zinc-400 font-mono">
              (EMP {stats.currentEmp})
            </span>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              setShowTherapyModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-950/70 hover:bg-cyan-800 border border-cyan-700/80 text-cyan-300 hover:text-white font-bold text-xs uppercase tracking-wider rounded transition font-orbitron"
            title={lang === 'ru' ? "Медицинская терапия человечности" : "Humanity psychological therapy"}
          >
            <Brain size={14} className="text-cyan-400" />
            <span>{lang === 'ru' ? 'Терапия' : 'Therapy'}</span>
          </button>

          {onOpenShop && (
            <button
              onClick={() => {
                sfx.playClick();
                onOpenShop('cyberware');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-950/60 hover:bg-yellow-600 border border-yellow-700/80 text-yellow-300 hover:text-black font-bold text-xs uppercase tracking-wider rounded transition font-orbitron"
              title={lang === 'ru' ? "Купить импланты из каталога DataPool" : "Buy cyberware from DataPool catalog"}
            >
              <ShoppingCart size={14} className="text-yellow-400" />
              <span>{lang === 'ru' ? 'Каталог DataPool' : 'DataPool Catalog'}</span>
            </button>
          )}

          <button
            onClick={() => {
              sfx.playClick();
              setShowAddModal(true);
              catalog.reset();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider rounded transition font-orbitron"
          >
            <Plus size={14} />
            <span>{t.addCyberware}</span>
          </button>
        </div>
      </div>

      <section className="bg-zinc-900 border border-zinc-800 rounded p-3 space-y-2">
        <h3 className="text-cyan-300 font-bold text-sm">{lang === 'ru' ? 'Слоты установки' : 'Installation slots'}</h3>
        <p className="text-xs text-zinc-400">{lang === 'ru' ? 'Покупка и установка разделены. Выберите конкретное основание для каждой опции. Снятые импланты не дают эффектов и не занимают слоты.' : 'Purchase and installation are separate. Assign each option to a specific host. Uninstalled inventory provides no effects and occupies no slots.'}</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">{hosts.map(host => <div key={host.id} className={`bg-zinc-950 rounded p-2 ${host.used > host.capacity ? 'text-red-300' : 'text-zinc-300'}`}><span>{host.name}</span><strong className="block text-cyan-300">{host.capacity === 0 ? (lang === 'ru' ? 'Особое крепление — см. описание' : 'Special mount — see description') : `${host.used} / ${host.capacity}`}</strong></div>)}</div>
        {warnings.length > 0 && <details className="text-xs text-amber-300"><summary>{lang === 'ru' ? `Проверьте размещение / условия (${warnings.length})` : `Review placement / conditions (${warnings.length})`}</summary><ul className="list-disc pl-4 space-y-1 mt-2">{warnings.map((warning,index) => <li key={index}>{warning}</li>)}</ul></details>}
      </section>

      {/* Cyberware Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {character.cyberware.map((item) => (
          <div
            key={item.id}
            className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-3 flex flex-col justify-between transition shadow-sm"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div>
                  <h3 className="font-orbitron font-bold text-xs text-white">
                    {item.name}
                  </h3>
                  <span className="text-[10px] text-cyan-300">{isCyberwareInstalled(character, item) ? (lang === 'ru' ? 'Установлен' : 'Installed') : (lang === 'ru' ? 'В инвентаре' : 'Inventory')}</span>
                  <div className="text-[10px] text-cyan-400 font-mono">
                    {item.category} • {item.installLocation}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-orbitron font-bold text-xs text-red-400 bg-zinc-950 px-2 py-0.5 rounded border border-red-950">
                    {item.humanityCostKnown === false ? 'HL —' : `-${item.humanityCost} HL`}
                  </span>
                  <button
                    onClick={() => {
                      sfx.playClick();
                      setItemToDelete(item);
                    }}
                    className="text-zinc-500 hover:text-red-400 p-0.5 transition"
                    title={lang === 'ru' ? "Удалить имплант" : "Delete cyberware"}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="text-xs text-zinc-300 mt-2 leading-relaxed">
                {item.description}
              </div>
              {cyberwareDefinition(item).installRule?.notes && <p className="text-xs text-amber-300 mt-2">{cyberwareDefinition(item).installRule?.notes}</p>}
              <div className="flex flex-wrap gap-2 mt-3 text-xs">
                <button onClick={() => setInstallId(item.id)} className="bg-cyan-900 px-2 py-1 rounded text-cyan-200">{isCyberwareInstalled(character,item) ? (lang === 'ru' ? 'Размещение / оружие' : 'Placement / weapon') : (lang === 'ru' ? 'Установить' : 'Install')}</button>
                {isCyberwareInstalled(character,item) && <button onClick={() => onUpdateCharacter(uninstallCyberware(character,item.id))} className="bg-zinc-800 px-2 py-1 rounded">{lang === 'ru' ? 'Снять в инвентарь' : 'Uninstall to inventory'}</button>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Cyberware Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div role="dialog" aria-modal="true" aria-label={lang === 'ru' ? 'Каталог киберимплантов' : 'Cyberware catalog'} className="bg-zinc-900 border-2 border-cyan-500 w-full max-w-4xl rounded-lg shadow-2xl p-4 sm:p-5 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-orbitron font-bold text-cyan-400 text-sm uppercase">
                {t.addCyberware}
              </h3>
              <button
                aria-label={lang === 'ru' ? 'Закрыть каталог' : 'Close catalog'}
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <CyberwareCatalogBrowser lang={lang} selectedId={newItem.catalogId ?? newItem.id} onSelect={handleApplyPreset} />

            <div className="border border-cyan-900 bg-cyan-950/20 rounded p-3 text-xs text-zinc-300 space-y-1">
              <p className="font-semibold text-cyan-200">{lang === 'ru' ? 'Выбран' : 'Selected'}: {newItem.name}</p>
              <p className="whitespace-pre-line max-h-24 overflow-y-auto">{newItem.description}</p>
            </div>

            <details className="space-y-3">
              <summary className="text-xs text-zinc-400 cursor-pointer">{lang === 'ru' ? 'Изменить параметры / свой имплант' : 'Edit parameters / custom cyberware'}</summary>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {lang === 'ru' ? 'Название импланта' : 'Cyberware Name'}
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {lang === 'ru' ? 'Категория' : 'Category'}
                </label>
                <select
                  value={newItem.category}
                  onChange={(e) => setNewItem({ ...newItem, category: e.target.value as CyberwareCategory })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-zinc-100 text-xs"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.installLocation || (lang === 'ru' ? 'Локация установки' : 'Install Location')}
                </label>
                <input
                  type="text"
                  value={newItem.installLocation}
                  onChange={(e) => setNewItem({ ...newItem, installLocation: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-xs"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.humanityCost || (lang === 'ru' ? 'Потеря человечности (HL)' : 'Humanity Loss (HL)')}
                </label>
                <input
                  type="number"
                  value={newItem.humanityCost}
                  onChange={(e) => setNewItem({ ...newItem, humanityCost: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                {lang === 'ru' ? 'Описание и системные правила' : 'Description & Rules'}
              </label>
              <textarea
                rows={3}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-xs"
              />
            </div>

            <details className="text-xs text-zinc-400"><summary>{lang === 'ru' ? 'Правила слотов (ручной имплант / домашние правила)' : 'Slot rules (custom / homebrew implant)'}</summary>
              <label className="block mt-2">{lang === 'ru' ? 'Тип основания' : 'Host type'} <select aria-label="Custom cyberware host type" value={newItem.installRule?.allowedHosts[0] ?? 'internal'} onChange={event => setNewItem({ ...newItem, catalogId: undefined, installRule: { ...newItem.installRule, allowedHosts: [event.target.value as CyberwareSlotType], slots: newItem.installRule?.slots ?? 1 } })} className="bg-zinc-950 border border-zinc-700 p-1">{CYBERWARE_SLOT_TYPES.map(type => <option key={type} value={type}>{cyberwareSlotLabel(type,lang)}</option>)}</select></label>
              <label className="block mt-2">{lang === 'ru' ? 'Занимает слотов' : 'Slots used'} <input aria-label="Custom cyberware slot cost" type="number" min="0" max="20" value={newItem.installRule?.slots ?? 1} onChange={event => setNewItem({ ...newItem, installRule: { allowedHosts: ['internal'], ...newItem.installRule, slots: Math.max(0, Math.min(20, Number(event.target.value) || 0)) } })} className="w-16 bg-zinc-950 border border-zinc-700 p-1" /></label>
            </details>

            </details>

            {catalog.notice}
            <div className="flex flex-wrap justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded font-semibold"
              >
                {lang === 'ru' ? 'Закрыть' : 'Close'}
              </button>
              <button
                onClick={() => handleAddItem(true)}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase rounded font-orbitron"
              >
                {lang === 'ru' ? 'Добавить и выбрать слоты' : 'Add and choose slots'}
              </button>
              <button onClick={() => handleAddItem(false)} className="px-3 py-1.5 rounded bg-zinc-800 text-zinc-100 text-xs font-bold">{lang === 'ru' ? 'Добавить в инвентарь' : 'Add to inventory'}</button>
            </div>
          </div>
        </div>
      )}

      {itemToInstall && <CyberwareInstallModal key={itemToInstall.id} character={character} item={itemToInstall} lang={lang} onUpdateCharacter={onUpdateCharacter} onClose={() => setInstallId(null)} />}

      {/* Therapy Modal */}
      <TherapyModal
        isOpen={showTherapyModal}
        onClose={() => setShowTherapyModal(false)}
        character={character}
        onUpdateCharacter={onUpdateCharacter}
        onAddRollResult={onAddRollResult}
        lang={lang}
      />

      {/* Delete / Uninstall Cyberware Confirmation Modal */}
      {itemToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150 no-print">
          <div className="bg-zinc-900 border border-zinc-700/80 rounded-xl w-full max-w-md shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2.5">
              <div className="flex items-center gap-2 text-red-400">
                <Trash2 size={18} />
                <h3 className="font-orbitron font-bold text-sm uppercase tracking-wider text-zinc-100">
                  {lang === 'ru' ? 'Удаление импланта' : 'Uninstall Cyberware'}
                </h3>
              </div>
              <button
                onClick={() => setItemToDelete(null)}
                className="text-zinc-400 hover:text-white p-1 rounded transition"
              >
                <X size={16} />
              </button>
            </div>

            <div className="bg-zinc-950 border border-zinc-800 rounded p-3 space-y-1">
              <div className="flex items-center justify-between font-bold text-xs text-white">
                <span>{itemToDelete.name}</span>
                <span className="text-red-400 font-mono">-{itemToDelete.humanityCost} HL</span>
              </div>
              <div className="text-[11px] text-zinc-400">
                {itemToDelete.category} • {itemToDelete.installLocation}
              </div>
            </div>

            <div className="text-xs text-zinc-300">
              {lang === 'ru'
                ? 'Зависимые опции будут сняты в инвентарь. Встроенное обычное оружие вернётся с остатком патронов. Удаляется только выбранная запись.'
                : 'Dependent options move to inventory. Embedded ordinary weapons return with remaining ammo. Only the selected record is deleted.'}
            </div>

            <div className="space-y-2">
              {/* Option 1: Full Refund */}
              <button
                onClick={() => confirmDeleteItem('full')}
                className="w-full text-left p-3 rounded-lg bg-zinc-950 hover:bg-emerald-950/40 border border-zinc-800 hover:border-emerald-600 transition group flex items-start gap-3"
              >
                <div className="p-2 rounded bg-emerald-950/60 border border-emerald-800 text-emerald-400 group-hover:scale-105 transition shrink-0 mt-0.5">
                  <RotateCcw size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-orbitron font-bold text-xs text-zinc-100 group-hover:text-emerald-300">
                      {lang === 'ru' ? 'Полный возврат' : 'Full Refund'}
                    </span>
                    <span className="font-mono font-bold text-xs text-emerald-400">
                      +{isCyberwareInstalled(character,itemToDelete) ? itemToDelete.humanityLoss ?? itemToDelete.humanityCost : 0} HL
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">
                    {lang === 'ru'
                      ? 'Отмена добавления (исправление ошибки). Полностью возвращает списанную человечность.'
                      : 'Undo addition / fix mistake. Fully returns all deducted Humanity.'}
                  </p>
                </div>
              </button>

              {/* Option 2: CPR Rules */}
              <button
                onClick={() => confirmDeleteItem('cpr')}
                className="w-full text-left p-3 rounded-lg bg-zinc-950 hover:bg-cyan-950/40 border border-zinc-800 hover:border-cyan-600 transition group flex items-start gap-3"
              >
                <div className="p-2 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-400 group-hover:scale-105 transition shrink-0 mt-0.5">
                  <Brain size={16} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-orbitron font-bold text-xs text-zinc-100 group-hover:text-cyan-300">
                      {lang === 'ru' ? 'По правилам Cyberpunk RED' : 'Official CPR Rules'}
                    </span>
                    <span className="font-mono font-bold text-xs text-cyan-400">
                      +{isCyberwareInstalled(character,itemToDelete) ? cyberwareCapLoss(itemToDelete) : 0} {lang === 'ru' ? 'к порогу' : 'cap'}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5 leading-tight">
                    {lang === 'ru'
                      ? 'Удаление не возвращает текущую Humanity. Восстановление — через терапию.'
                      : 'Removal does not refund current Humanity. Recover through Therapy.'}
                  </p>
                </div>
              </button>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setItemToDelete(null)}
                className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded font-semibold transition"
              >
                {lang === 'ru' ? 'Отмена (не удалять)' : 'Cancel (Keep)'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
