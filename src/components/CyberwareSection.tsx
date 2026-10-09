import React, { useState } from 'react';
import { Character, CyberwareItem, CyberwareCategory } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { 
  Cpu, 
  Plus, 
  Trash2, 
  Brain, 
  Zap, 
  ShieldAlert,
  Layers
} from 'lucide-react';

interface CyberwareSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  lang: Language;
}

const CYBERWARE_PRESETS: Partial<CyberwareItem>[] = [
  { name: 'Neural Link (Нейролинк)', category: 'Neuralware', installLocation: 'Spine/Brain', humanityCost: 7, description: 'Базовая шина для киберимплантов и разъемов.' },
  { name: 'Interface Plugs (Разъемы интерфейса)', category: 'Neuralware', installLocation: 'Wrists', humanityCost: 7, description: 'Штекеры прямого подключения к смартганам и деке.' },
  { name: 'Sandevistan (Сандевистан)', category: 'Neuralware', installLocation: 'Spine', humanityCost: 7, description: '+3 к инициативе при активации на 1 минуту.' },
  { name: 'Kerenzikov (Керензиков)', category: 'Neuralware', installLocation: 'Spine', humanityCost: 14, description: 'Постоянный бонус +2 к инициативе.' },
  { name: 'Cybereye (Киберглаз)', category: 'Cyberoptics', installLocation: 'Head', humanityCost: 7, description: 'Кибернетический глаз с 3 слотами опций.' },
  { name: 'Targeting Scope (Прицельная сетка)', category: 'Cyberoptics', installLocation: 'Cybereye', humanityCost: 3, description: '+1 к проверкам прицельной стрельбы (Aimed Shots).' },
  { name: 'Cyberaudio Suite (Кибераудио)', category: 'Cyberaudio', installLocation: 'Head', humanityCost: 7, description: 'Аудиосистема с 3 слотами модификаций.' },
  { name: 'Subdermal Armor (Подкожная броня)', category: 'Internal', installLocation: 'Body', humanityCost: 14, description: 'Подкожная защита: дает SP 11 на тело и голову без штрафа!' },
  { name: 'Cyberarm (Киберрука)', category: 'Cyberlimb', installLocation: 'Left/Right Arm', humanityCost: 7, description: 'Киберпротез руки с 4 слотами для оружия и инструментов.' },
  { name: 'Grafted Muscle and Bone Lace (Мышечно-костный каркас)', category: 'Internal', installLocation: 'Skeleton', humanityCost: 14, description: '+2 к характеристике BODY (ОЗ и спасбросок от смерти возрастают).' }
];

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
  lang
}) => {
  const t = translations[lang];
  const [showAddModal, setShowAddModal] = useState(false);

  const [newItem, setNewItem] = useState<Partial<CyberwareItem>>({
    name: 'Neural Link',
    category: 'Neuralware',
    installLocation: 'Spine',
    humanityCost: 7,
    description: 'Основа для нервных имплантов'
  });

  const totalHumanityLoss = character.cyberware.reduce((acc, c) => acc + (c.humanityCost || 0), 0);

  const handleDeleteItem = (itemId: string) => {
    sfx.playClick();
    const itemToDelete = character.cyberware.find((c) => c.id === itemId);
    const updated = character.cyberware.filter((c) => c.id !== itemId);

    // Refund humanity if appropriate
    let newHumanity = character.humanityCurrent;
    if (itemToDelete) {
      newHumanity = Math.min(
        character.stats.EMP * 10,
        character.humanityCurrent + itemToDelete.humanityCost
      );
    }

    onUpdateCharacter({
      ...character,
      cyberware: updated,
      humanityCurrent: newHumanity
    });
  };

  const handleAddItem = () => {
    sfx.playClick();
    const item: CyberwareItem = {
      id: 'cyb-' + Date.now(),
      name: newItem.name || 'Имплант',
      category: (newItem.category as CyberwareCategory) || 'Internal',
      installLocation: newItem.installLocation || 'Тело',
      humanityCost: newItem.humanityCost || 0,
      description: newItem.description || ''
    };

    // Deduct humanity
    const newHumanity = Math.max(0, character.humanityCurrent - item.humanityCost);

    onUpdateCharacter({
      ...character,
      cyberware: [...character.cyberware, item],
      humanityCurrent: newHumanity
    });

    setShowAddModal(false);
  };

  const handleApplyPreset = (preset: Partial<CyberwareItem>) => {
    setNewItem({
      ...newItem,
      ...preset
    });
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

        <div className="flex items-center gap-3">
          <div className="bg-zinc-950 border border-zinc-800 px-3 py-1 rounded text-xs">
            <span className="text-zinc-400 uppercase font-semibold text-[10px] mr-1.5">
              {t.totalHumanityLoss}
            </span>
            <span className="font-orbitron font-bold text-red-400">
              {totalHumanityLoss} HL
            </span>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-black font-bold text-xs uppercase tracking-wider rounded transition font-orbitron"
          >
            <Plus size={14} />
            <span>{t.addCyberware}</span>
          </button>
        </div>
      </div>

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
                  <div className="text-[10px] text-cyan-400 font-mono">
                    {item.category} • {item.installLocation}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-orbitron font-bold text-xs text-red-400 bg-zinc-950 px-2 py-0.5 rounded border border-red-950">
                    -{item.humanityCost} HL
                  </span>
                  <button
                    onClick={() => handleDeleteItem(item.id)}
                    className="text-zinc-500 hover:text-red-400 p-0.5 transition"
                    title="Удалить имплант"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              <div className="text-xs text-zinc-300 mt-2 leading-relaxed">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Cyberware Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-zinc-900 border-2 border-cyan-500 w-full max-w-lg rounded-lg shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-orbitron font-bold text-cyan-400 text-sm uppercase">
                {t.addCyberware}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Presets */}
            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                Каталог распространенных имплантов
              </label>
              <select
                onChange={(e) => {
                  const preset = CYBERWARE_PRESETS.find((p) => p.name === e.target.value);
                  if (preset) handleApplyPreset(preset);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-xs"
              >
                <option value="">Выберите из каталога...</option>
                {CYBERWARE_PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.category}, {p.humanityCost} HL)
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  Название импланта
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
                  Категория
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
                  Локация установки
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
                  Потеря человечности (HL)
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
                Описание и системные правила
              </label>
              <textarea
                rows={3}
                value={newItem.description}
                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-xs"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs rounded font-semibold"
              >
                Отмена
              </button>
              <button
                onClick={handleAddItem}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs uppercase rounded font-orbitron"
              >
                Установить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
