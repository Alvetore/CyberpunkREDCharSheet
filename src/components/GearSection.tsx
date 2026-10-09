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
  onOpenShop?: (category?: 'all' | 'weapons' | 'armor' | 'cyberware' | 'gear') => void;
  lang: Language;
}

const LIFESTYLES = [
  'Kibble (Киббл — 100 eb/мес)',
  'Generic Prepak (Обычный полуфабрикат — 300 eb/мес)',
  'Good Prepak (Качественные полуфабрикаты — 600 eb/мес)',
  'Fresh Food (Настоящая свежая еда — 1500 eb/мес)'
];

const HOUSING_OPTIONS = [
  'Living on the Street (Улица / Ночлежка — 0 eb)',
  'Coffin Motel (Гроб-отель — 100 eb/мес)',
  'Cube Hotel (Куб-отель — 500 eb/мес)',
  'Cargo Container (Грузовой контейнер — 1000 eb/мес)',
  'Studio Apartment (Квартира-студия — 1500 eb/мес)',
  'Two-Bedroom Apartment (Двухкомнатная — 2500 eb/мес)',
  'Corporate Executive Suite (Корпоративный пентхаус — 10000 eb/мес)'
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
    name: 'Инструменты техника',
    category: 'Tools',
    quantity: 1,
    costEb: 100,
    notes: ''
  });

  const handleAddItem = () => {
    sfx.playClick();
    const item: GearItem = {
      id: 'gear-' + Date.now(),
      name: newItem.name || 'Предмет',
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
            value={character.lifestyle}
            onChange={(e) => onUpdateCharacter({ ...character, lifestyle: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100"
          >
            {LIFESTYLES.map((ls) => (
              <option key={ls} value={ls}>
                {ls}
              </option>
            ))}
          </select>
        </div>

        {/* Housing */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3">
          <div className="flex items-center gap-1.5 font-orbitron font-bold text-xs uppercase text-zinc-300 mb-1">
            <Home size={15} />
            <span>{t.housing}</span>
          </div>
          <select
            value={character.housing}
            onChange={(e) => onUpdateCharacter({ ...character, housing: e.target.value })}
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-xs text-zinc-100"
          >
            {HOUSING_OPTIONS.map((h) => (
              <option key={h} value={h}>
                {h}
              </option>
            ))}
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
                title="Купить снаряжение из каталога DataPool"
              >
                <ShoppingCart size={14} className="text-yellow-400" />
                <span>Каталог DataPool</span>
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

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase text-[10px]">
                <th className="py-2 px-2">{t.itemName}</th>
                <th className="py-2 px-2">Категория</th>
                <th className="py-2 px-2 text-center">{t.quantity}</th>
                <th className="py-2 px-2 text-right">{t.cost}</th>
                <th className="py-2 px-2">{t.notes}</th>
                <th className="py-2 px-2 text-right">Действия</th>
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
                        className="text-zinc-500 hover:text-white font-bold"
                      >
                        -
                      </button>
                      <span className="font-bold text-white min-w-[14px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => handleAdjustQuantity(item.id, 1)}
                        className="text-zinc-500 hover:text-white font-bold"
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
          <div className="bg-zinc-900 border-2 border-red-600 w-full max-w-md rounded-lg shadow-2xl p-4 space-y-4">
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
                    Категория
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
                Отмена
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase rounded"
              >
                Добавить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
