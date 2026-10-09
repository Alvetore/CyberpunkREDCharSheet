import React, { useState } from 'react';
import { Character, GearItem } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { 
  Package, 
  Coins, 
  Home, 
  Plus, 
  Trash2, 
  CreditCard,
  Utensils,
  ShoppingCart
} from 'lucide-react';

interface GearSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onOpenShop?: (category?: 'all' | 'weapons' | 'armor' | 'cyberware' | 'gear' | 'vehicles') => void;
  lang: Language;
}

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
  onOpenShop,
  lang
}) => {
  const t = translations[lang];
  const [showAddModal, setShowAddModal] = useState(false);

  const [newItem, setNewItem] = useState<Partial<GearItem>>({
    name: lang === 'ru' ? 'Инструменты техника' : 'Tech Tool Kit',
    category: 'Tools',
    quantity: 1,
    costEb: 100,
    notes: ''
  });

  const handleAddItem = () => {
    sfx.playClick();
    const item: GearItem = {
      id: 'gear-' + Date.now(),
      name: newItem.name || (lang === 'ru' ? 'Предмет' : 'Item'),
      category: newItem.category || 'Gear',
      quantity: newItem.quantity || 1,
      costEb: newItem.costEb || 0,
      notes: newItem.notes || ''
    };

    onUpdateCharacter({
      ...character,
      gear: [...character.gear, item]
    });
    setShowAddModal(false);
  };

  const handleDeleteItem = (itemId: string) => {
    sfx.playClick();
    const updated = character.gear.filter((g) => g.id !== itemId);
    onUpdateCharacter({ ...character, gear: updated });
  };

  const handleAdjustQuantity = (itemId: string, delta: number) => {
    sfx.playClick();
    const updated = character.gear.map((g) => {
      if (g.id === itemId) {
        return { ...g, quantity: Math.max(0, g.quantity + delta) };
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
            <span className="text-xs text-zinc-400 font-mono">({character.gear.length})</span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {onOpenShop && (
              <button
                onClick={() => {
                  sfx.playClick();
                  onOpenShop('gear');
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-950/60 hover:bg-yellow-600 border border-yellow-700/80 text-yellow-300 hover:text-black font-bold text-xs uppercase tracking-wider rounded transition font-orbitron"
                title={lang === 'ru' ? "Купить снаряжение из каталога DataPool" : "Buy gear from DataPool catalog"}
              >
                <ShoppingCart size={14} className="text-yellow-400" />
                <span>{lang === 'ru' ? 'Каталог DataPool' : 'DataPool Catalog'}</span>
              </button>
            )}

            <button
              onClick={() => {
                sfx.playClick();
                setShowAddModal(true);
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
                  <td className="py-2 px-2 font-semibold text-zinc-200">{item.name}</td>
                  <td className="py-2 px-2 text-zinc-400">{item.category}</td>
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
                    {item.costEb} eb
                  </td>
                  <td className="py-2 px-2 text-zinc-400 italic">{item.notes}</td>
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
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-zinc-900 border-2 border-red-600 w-full max-w-md rounded-lg shadow-2xl p-4 space-y-4 max-h-[92dvh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-orbitron font-bold text-red-500 text-sm uppercase">
                {t.addGear}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.itemName}
                </label>
                <input
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
                    type="number"
                    value={newItem.costEb}
                    onChange={(e) => setNewItem({ ...newItem, costEb: parseInt(e.target.value, 10) || 0 })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.notes}
                </label>
                <input
                  type="text"
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-xs text-zinc-100"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded"
              >
                {lang === 'ru' ? 'Отмена' : 'Cancel'}
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase rounded"
              >
                {lang === 'ru' ? 'Добавить' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
