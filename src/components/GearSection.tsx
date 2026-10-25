import React, { useState } from 'react';
import { Character, GearItem } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { GearCatalogBrowser } from './GearCatalogBrowser';
import { AMMUNITION_CATALOG } from '../data/ammunitionCatalog';
import { gearCyberwareDevice, wearCyberwareGear } from '../utils/gearCyberware';
import { useCatalogNotice } from './CatalogNotice';
import { addEquipmentToBackpack, BackpackEquipment, backpackCyberware } from '../utils/backpack';
import { BackpackEquipmentSection } from './BackpackEquipmentSection';
import { addGearToInventory, gearErrorMessage, gearPrice } from '../utils/gear';
import { 
  Package, 
  Coins, 
  Home, 
  Plus, 
  Trash2, 
  CreditCard,
  Utensils
} from 'lucide-react';

interface GearSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  lang: Language;
}

const ammunitionIds = new Set(AMMUNITION_CATALOG.map(item => item.id));
const isPackAmmo = (item: Partial<GearItem>) => !!item.catalogId && ammunitionIds.has(item.catalogId);

const LIFESTYLES: { id: string; nameRu: string; nameEn: string }[] = [
  { id: 'kibble', nameRu: 'На киббле (100 eb/мес)', nameEn: 'Kibble (100 eb/mo)' },
  { id: 'generic_prepak', nameRu: 'На обычных полуфабрикатах (300 eb/мес)', nameEn: 'Generic Prepak (300 eb/mo)' },
  { id: 'good_prepak', nameRu: 'На хороших полуфабрикатах (600 eb/мес)', nameEn: 'Good Prepak (600 eb/mo)' },
  { id: 'fresh_food', nameRu: 'На свежей еде (1 500 eb/мес)', nameEn: 'Fresh Food (1,500 eb/mo)' }
];

const HOUSING_OPTIONS: { id: string; nameRu: string; nameEn: string }[] = [
  { id: 'street', nameRu: 'Жизнь на улице (0 eb)', nameEn: 'Living on the Street (0 eb)' },
  { id: 'vehicle', nameRu: 'Жизнь на улице в транспорте (0 eb)', nameEn: 'Living in your Vehicle (0 eb)' },
  { id: 'cube', nameRu: 'Куб-отель (500 eb/мес)', nameEn: 'Cube Hotel (500 eb/mo)' },
  { id: 'cargo', nameRu: 'Грузовой контейнер (1 000 eb/мес)', nameEn: 'Cargo Container (1,000 eb/mo)' },
  { id: 'studio', nameRu: 'Квартира-студия (1 500 eb/мес)', nameEn: 'Studio Apartment (1,500 eb/mo)' },
  { id: 'two_bed', nameRu: 'Двуспальная квартира (2 500 eb/мес)', nameEn: 'Two-Bedroom Apartment (2,500 eb/mo)' },
  { id: 'corp_conapt', nameRu: 'Корпоративный конапт (Корпорация)', nameEn: 'Corporate Conapt (Corporate)' },
  { id: 'upscale_conapt', nameRu: 'Улучшенный конапт (7 500 eb/мес)', nameEn: 'Upscale Conapt (7,500 eb/mo)' },
  { id: 'penthouse', nameRu: 'Роскошный пентхаус (15 000 eb/мес)', nameEn: 'Luxury Penthouse (15,000 eb/mo)' }
];

export const GearSection: React.FC<GearSectionProps> = ({
  character,
  onUpdateCharacter,
  lang
}) => {
  const t = translations[lang];
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState('');
  const catalog = useCatalogNotice(lang);
  const [selectedEquipment, setSelectedEquipment] = useState<BackpackEquipment | undefined>();
  const backpackCount = character.gear.length + character.weapons.filter(item => item.isEquipped === false).length + (character.spareArmor?.length ?? 0) + backpackCyberware(character).length;

  const [newItem, setNewItem] = useState<Partial<GearItem>>({
    name: '',
    category: 'Gear',
    quantity: 1,
    costEb: 0,
    notes: ''
  });

  const handleAddItem = (purchase = false) => {
    sfx.playClick();
    const item: GearItem = {
      ...newItem,
      id: '',
      name: newItem.name ?? '',
      category: newItem.category || 'Gear',
      quantity: newItem.quantity ?? 1,
      costEb: newItem.costEb ?? 0,
      notes: newItem.notes || ''
    };

    const result = selectedEquipment ? addEquipmentToBackpack(character, selectedEquipment, item, item.quantity, purchase) : addGearToInventory(character, item, item.quantity, purchase);
    if (!result.character) { setError(gearErrorMessage(result.error!, lang)); return; }
    onUpdateCharacter(result.character);
    setError('');
    catalog.added(item.name, item.quantity);
  };

  const handleDeleteItem = (itemId: string) => {
    sfx.playClick();
    const updated = character.gear.filter((g) => g.id !== itemId);
    onUpdateCharacter({ ...character, gear: updated });
  };

  const handleAdjustQuantity = (itemId: string, delta: number) => {
    sfx.playClick();
    const item = character.gear.find(item=>item.id===itemId);
    if (item && gearCyberwareDevice(item) && item.quantity>=1 && delta>0) {
      const result=addGearToInventory(character,item,1,false);
      if (result.character) onUpdateCharacter(result.character);
      return;
    }
    const updated = character.gear.map((g) => {
      if (g.id === itemId) {
        return { ...g, quantity: Math.max(0, g.quantity + delta), wornOn:g.quantity+delta<=0 ? undefined : g.wornOn };
      }
      return g;
    });
    onUpdateCharacter({ ...character, gear: updated });
  };

  return (
    <div className="space-y-4">
      {/* Economy & Lifestyle Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {/* Cash */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs uppercase text-emerald-400 mb-1">
            <Coins size={15} />
            <span>{t.cash}</span>
          </div>
          <input
            type="number"
            value={character.cashEb}
            onChange={(e) =>
              onUpdateCharacter({ ...character, cashEb: parseInt(e.target.value, 10) || 0 })
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-emerald-300 font-orbitron font-black text-xl focus:border-emerald-500 focus:outline-none"
          />
        </div>

        {/* Bank */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs uppercase text-cyan-400 mb-1">
            <CreditCard size={15} />
            <span>{t.bank}</span>
          </div>
          <input
            type="number"
            value={character.bankEb}
            onChange={(e) =>
              onUpdateCharacter({ ...character, bankEb: parseInt(e.target.value, 10) || 0 })
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-cyan-300 font-orbitron font-black text-xl focus:border-cyan-500 focus:outline-none"
          />
        </div>

        {/* Lifestyle */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs uppercase text-yellow-400 mb-1">
            <Utensils size={15} />
            <span>{t.lifestyle}</span>
          </div>
          <select
            value={(() => {
              const matched = LIFESTYLES.find(ls => ls.nameRu === character.lifestyle || ls.nameEn === character.lifestyle);
              return matched ? (lang === 'ru' ? matched.nameRu : matched.nameEn) : character.lifestyle;
            })()}
            onChange={(e) => onUpdateCharacter({ ...character, lifestyle: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100"
          >
            {character.lifestyle && !LIFESTYLES.some(ls => ls.nameRu === character.lifestyle || ls.nameEn === character.lifestyle) && (
              <option value={character.lifestyle}>{character.lifestyle}</option>
            )}
            {LIFESTYLES.map((ls) => {
              const val = lang === 'ru' ? ls.nameRu : ls.nameEn;
              return (
                <option key={ls.id} value={val}>
                  {val}
                </option>
              );
            })}
          </select>
        </div>

        {/* Housing */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs uppercase text-zinc-300 mb-1">
            <Home size={15} />
            <span>{t.housing}</span>
          </div>
          <select
            value={(() => {
              const matched = HOUSING_OPTIONS.find(h => h.nameRu === character.housing || h.nameEn === character.housing);
              return matched ? (lang === 'ru' ? matched.nameRu : matched.nameEn) : character.housing;
            })()}
            onChange={(e) => onUpdateCharacter({ ...character, housing: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100"
          >
            {character.housing && !HOUSING_OPTIONS.some(h => h.nameRu === character.housing || h.nameEn === character.housing) && (
              <option value={character.housing}>{character.housing}</option>
            )}
            {HOUSING_OPTIONS.map((h) => {
              const val = lang === 'ru' ? h.nameRu : h.nameEn;
              return (
                <option key={h.id} value={val}>
                  {val}
                </option>
              );
            })}
          </select>
        </div>
      </div>

      {/* Gear Inventory Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md space-y-3">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-red-500" />
            <h2 className="font-orbitron font-bold text-sm text-red-500 uppercase tracking-wider">
              {t.gearTitle}
            </h2>
            <span className="text-xs text-zinc-400 font-mono">({backpackCount})</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                sfx.playClick();
                setShowAddModal(true);
                catalog.reset();
                setError('');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition"
            >
              <Plus size={14} />
              <span>{t.addGear}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto touch-pan-x -mx-2 px-2 sm:mx-0 sm:px-0">
          <table className="w-full text-xs text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px]">
                <th className="py-2 px-2">{t.itemName}</th>
                <th className="py-2 px-2">{lang === 'ru' ? 'Категория' : 'Category'}</th>
                <th className="py-2 px-2 text-center">{t.quantity}</th>
                <th className="py-2 px-2 text-right">{t.cost}</th>
                <th className="py-2 px-2">{t.notes}</th>
                <th className="py-2 px-2 text-right">{lang === 'ru' ? 'Действия' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody>
              {character.gear.map((item) => (
                <tr key={item.id} className="border-b border-zinc-800/60 hover:bg-zinc-800/30">
                  <td className="py-2 px-2 font-semibold text-zinc-200">{item.name}
                    {gearCyberwareDevice(item) && <label className="block text-xs text-cyan-300 mt-2">{lang === 'ru' ? 'Ношение (надеть/снять — действие)' : 'Wear (equip/remove: Action)'}
                      <select aria-label={`${lang === 'ru' ? 'Ношение' : 'Wear'}: ${item.name}`} value={item.wornOn ?? ''} onChange={event => onUpdateCharacter(wearCyberwareGear(character,item.id,event.target.value as GearItem['wornOn'] || undefined))} className="block p-1 mt-1 bg-zinc-950 border border-cyan-900 rounded">
                        <option value="">{lang === 'ru' ? 'В рюкзаке' : 'Stored'}</option>
                        {gearCyberwareDevice(item)!.sites.map(site => <option key={site} value={site}>{lang === 'ru' ? ({eyes:'На глазах',ears:'На ушах','left-arm':'Левая рука','right-arm':'Правая рука'}[site]) : site}</option>)}
                      </select>
                      <span className="text-zinc-400">{lang === 'ru' ? 'Слоты доступны в разделе имплантов. Опции внешнего устройства не снижают Humanity.' : 'Mount options in Cyberware. External device options cause no Humanity loss.'}</span>
                    </label>}
                  </td>
                  <td className="py-2 px-2 text-zinc-400">{item.category === 'Ammunition' && lang === 'ru' ? 'Боеприпасы' : item.category}</td>
                  <td className="py-2 px-2 text-center">
                    <div className="inline-flex items-center gap-1.5 bg-zinc-950 px-2 py-0.5 rounded border border-zinc-800">
                      <button
                        onClick={() => handleAdjustQuantity(item.id, -1)}
                        className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white font-bold text-sm transition"
                      >
                        -
                      </button>
                      <span className="font-bold text-white min-w-[14px] text-center">
                        {item.quantity}
                        {isPackAmmo(item) && <span className="ml-1 text-[10px] text-zinc-500">{lang === 'ru' ? 'уп.' : 'packs'}</span>}
                      </span>
                      <button
                        onClick={() => handleAdjustQuantity(item.id, 1)}
                        className="w-6 h-6 flex items-center justify-center text-zinc-400 hover:text-white font-bold text-sm transition"
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="py-2 px-2 text-right font-mono font-bold text-emerald-400">
                    {gearPrice(item, lang)}
                  </td>
                  <td className="py-2 px-2 text-zinc-400 max-w-md">{item.notes.length > 160 ? <details><summary className="cursor-pointer">{item.notes.slice(0,100)}…</summary><p className="whitespace-pre-line mt-2">{item.notes}</p></details> : item.notes}</td>
                  <td className="py-2 px-2 text-right">
                    <button
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-zinc-500 hover:text-red-400 p-1"
                    >
                      <Trash2 size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Gear Modal */}
      <BackpackEquipmentSection character={character} lang={lang} onUpdateCharacter={onUpdateCharacter} />
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div role="dialog" aria-modal="true" aria-label={lang === 'ru' ? 'Каталог снаряжения' : 'Gear catalog'} className="bg-zinc-900 border-2 border-cyan-500 w-full max-w-4xl rounded-lg shadow-2xl p-4 sm:p-5 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-orbitron font-bold text-cyan-400 text-sm uppercase">
                {lang === 'ru' ? 'Каталог снаряжения' : 'Gear catalog'}
              </h3>
              <button
                aria-label={lang === 'ru' ? 'Закрыть каталог' : 'Close catalog'}
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <GearCatalogBrowser lang={lang} selectedId={newItem.catalogId} onSelect={(item, equipment) => { setNewItem({ ...item, quantity: newItem.quantity ?? 1 }); setSelectedEquipment(equipment); setError(''); }} />

            <div className="border border-cyan-900 bg-cyan-950/20 rounded p-3 text-xs text-zinc-300 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2"><p className="font-semibold text-cyan-200">{newItem.name ? `${lang === 'ru' ? 'Выбран' : 'Selected'}: ${newItem.name}` : (lang === 'ru' ? 'Выберите предмет' : 'Choose an item')}</p>{newItem.name && <span className="text-amber-300">{gearPrice({ costEb: newItem.costEb ?? 0, billingPeriod: newItem.billingPeriod }, lang)}</span>}</div>
              <p className="whitespace-pre-line max-h-24 overflow-y-auto">{newItem.notes || (lang === 'ru' ? 'Выберите карточку из каталога или заполните свой предмет ниже.' : 'Choose a catalog card or enter a custom item below.')}</p>
              {newItem.sourceUrl && <a href={newItem.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-block text-cyan-400 underline">Data Pool ↗</a>}
            </div>

            <details className="space-y-3">
              <summary className="text-xs text-zinc-400 cursor-pointer">{lang === 'ru' ? 'Изменить параметры / свой предмет' : 'Edit parameters / custom item'}</summary>
              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.itemName}
                </label>
                <input
                  aria-label={lang === 'ru' ? 'Название предмета' : 'Item name'}
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                    {lang === 'ru' ? 'Категория' : 'Category'}
                  </label>
                  <input
                    aria-label={lang === 'ru' ? 'Категория предмета' : 'Item category'}
                    disabled={!!selectedEquipment}
                    type="text"
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                    {t.cost} (eb)
                  </label>
                  <input
                    aria-label={lang === 'ru' ? 'Цена предмета' : 'Item price'}
                    type="number"
                    min="0"
                    value={newItem.costEb}
                    onChange={(e) => setNewItem({ ...newItem, costEb: Number(e.target.value), priceLabel: undefined })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.notes}
                </label>
                <textarea
                  aria-label={lang === 'ru' ? 'Описание предмета' : 'Item description'}
                  rows={4}
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                />
              </div>
            </details>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-300">
              <label>{isPackAmmo(newItem) ? (lang === 'ru' ? 'Количество упаковок' : 'Number of packs') : (lang === 'ru' ? 'Количество' : 'Quantity')} <input aria-label={lang === 'ru' ? 'Количество предметов' : 'Item quantity'} type="number" min="1" max="999" step="1" value={newItem.quantity ?? 1} onChange={event => { setNewItem({ ...newItem, quantity: Number(event.target.value) }); setError(''); }} className="ml-2 w-20 bg-zinc-950 border border-zinc-700 p-2 rounded" /></label>
              <span>{lang === 'ru' ? 'Итого' : 'Total'}: {((newItem.costEb ?? 0) * (newItem.quantity ?? 1)).toLocaleString(lang)} eb{newItem.billingPeriod === 'monthly' ? (lang === 'ru' ? ' за первый месяц' : ' for the first month') : ''} · {lang === 'ru' ? 'Наличные' : 'Cash'}: {character.cashEb.toLocaleString(lang)} eb</span>
            </div>
            {isPackAmmo(newItem) && <p className="text-xs text-amber-300">{lang === 'ru' ? 'Размер упаковки указан в названии. Ракеты — поштучно. Запасы и перезарядка учитываются вручную.' : 'Pack size is shown in the name. Rockets are individual rounds. Track reserve ammo and reloads manually.'}</p>}
            <p className="text-[11px] text-zinc-500">{lang === 'ru' ? 'Добавление без покупки не списывает eb. Покупка оплачивается из наличных; подписки — за первый месяц.' : 'Adding owned gear does not charge eb. Purchases use cash; subscriptions charge the first month.'}</p>
            {error && <p role="alert" className="text-xs text-red-300">{error}</p>}
            {catalog.notice}

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded"
              >
                {lang === 'ru' ? 'Закрыть' : 'Close'}
              </button>
              <button
                onClick={() => handleAddItem(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-xs rounded"
              >
                {lang === 'ru' ? 'Добавить без покупки' : 'Add owned gear'}
              </button>
              <button onClick={() => handleAddItem(true)} className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs rounded">{lang === 'ru' ? 'Купить' : 'Buy'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
