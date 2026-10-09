import React, { useState } from 'react';
import { Character, Weapon, WeaponCategory } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { CPR_RANGE_DISTANCES, CPR_RANGE_DV_TABLE } from '../data/initialData';
import { sfx } from '../utils/audio';
import { 
  Crosshair, 
  Plus, 
  Trash2, 
  Flame, 
  RotateCcw, 
  Table, 
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  ShoppingCart
} from 'lucide-react';

interface WeaponsSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onRollWeaponAttack: (weapon: Weapon, targetDv?: number, rangeStr?: string) => void;
  onRollWeaponDamage: (weapon: Weapon) => void;
  onOpenShop?: (category?: 'all' | 'weapons' | 'armor' | 'cyberware' | 'gear') => void;
  lang: Language;
}

const WEAPON_PRESETS: Partial<Weapon>[] = [
  { name: 'Medium Pistol (Militech Arms)', category: 'Medium Pistol', damage: '2d6', standardRof: 2, magCapacity: 12, ammoType: 'Medium Pistol', concealable: true, skillId: 'handgun' },
  { name: 'Heavy Pistol (Sternmeyer P-35)', category: 'Heavy Pistol', damage: '3d6', standardRof: 2, magCapacity: 8, ammoType: 'Heavy Pistol', concealable: true, skillId: 'handgun' },
  { name: 'Very Heavy Pistol (Malorian Arms)', category: 'Very Heavy Pistol', damage: '4d6', standardRof: 1, magCapacity: 8, ammoType: 'Very Heavy Pistol', concealable: false, skillId: 'handgun' },
  { name: 'SMG (Federated Arms Tech-9)', category: 'SMG', damage: '2d6', standardRof: 1, magCapacity: 30, ammoType: 'Medium Pistol', concealable: true, skillId: 'handgun' },
  { name: 'Heavy SMG (Chadron Arasaka)', category: 'Heavy SMG', damage: '3d6', standardRof: 1, magCapacity: 40, ammoType: 'Heavy Pistol', concealable: false, skillId: 'handgun' },
  { name: 'Shotgun (Rostovic DB-2)', category: 'Shotgun', damage: '5d6', standardRof: 1, magCapacity: 4, ammoType: 'Shotgun Shells / Slugs', concealable: false, skillId: 'shoulder_arms' },
  { name: 'Assault Rifle (Militech Ronin)', category: 'Assault Rifle', damage: '5d6', standardRof: 1, magCapacity: 30, ammoType: 'Rifle Ammo', concealable: false, skillId: 'shoulder_arms' },
  { name: 'Sniper Rifle (Nomad Nomad-X)', category: 'Sniper Rifle', damage: '5d6', standardRof: 1, magCapacity: 4, ammoType: 'Rifle Ammo', concealable: false, skillId: 'shoulder_arms' },
  { name: 'Heavy Melee (Machete / Crowbar)', category: 'Heavy Melee', damage: '3d6', standardRof: 2, magCapacity: 0, ammoType: 'None', concealable: false, skillId: 'melee_weapon' },
  { name: 'Very Heavy Melee (Katana / Monokatana)', category: 'Very Heavy Melee', damage: '4d6', standardRof: 1, magCapacity: 0, ammoType: 'None', concealable: false, skillId: 'melee_weapon' }
];

export const WeaponsSection: React.FC<WeaponsSectionProps> = ({
  character,
  onUpdateCharacter,
  onRollWeaponAttack,
  onRollWeaponDamage,
  onOpenShop,
  lang
}) => {
  const t = translations[lang];
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRangeMatrix, setShowRangeMatrix] = useState(false);

  // New weapon state
  const [newWeapon, setNewWeapon] = useState<Partial<Weapon>>({
    name: 'Heavy Pistol',
    category: 'Heavy Pistol',
    damage: '3d6',
    standardRof: 2,
    magCapacity: 8,
    currentAmmo: 8,
    ammoType: 'Heavy Pistol Ammo',
    concealable: true,
    notes: 'Стандартный пистолет',
    skillId: 'handgun'
  });

  const handleFireSingle = (weaponId: string) => {
    sfx.playGunshot();
    const updated = character.weapons.map((w) => {
      if (w.id === weaponId && w.currentAmmo > 0) {
        return { ...w, currentAmmo: w.currentAmmo - 1 };
      }
      return w;
    });
    onUpdateCharacter({ ...character, weapons: updated });
  };

  const handleFireAutofire = (weaponId: string) => {
    sfx.playGunshot();
    const updated = character.weapons.map((w) => {
      if (w.id === weaponId && w.currentAmmo >= 10) {
        return { ...w, currentAmmo: w.currentAmmo - 10 };
      }
      return w;
    });
    onUpdateCharacter({ ...character, weapons: updated });
  };

  const handleReload = (weaponId: string) => {
    sfx.playReload();
    const updated = character.weapons.map((w) => {
      if (w.id === weaponId) {
        return { ...w, currentAmmo: w.magCapacity };
      }
      return w;
    });
    onUpdateCharacter({ ...character, weapons: updated });
  };

  const handleDeleteWeapon = (weaponId: string) => {
    sfx.playClick();
    const updated = character.weapons.filter((w) => w.id !== weaponId);
    onUpdateCharacter({ ...character, weapons: updated });
  };

  const handleAddWeapon = () => {
    sfx.playClick();
    const weapon: Weapon = {
      id: 'weap-' + Date.now(),
      name: newWeapon.name || 'Оружие',
      category: (newWeapon.category as WeaponCategory) || 'Heavy Pistol',
      damage: newWeapon.damage || '3d6',
      standardRof: newWeapon.standardRof || 1,
      magCapacity: newWeapon.magCapacity || 8,
      currentAmmo: newWeapon.currentAmmo ?? newWeapon.magCapacity ?? 8,
      ammoType: newWeapon.ammoType || 'Standard',
      concealable: newWeapon.concealable ?? false,
      notes: newWeapon.notes || '',
      skillId: newWeapon.skillId || 'handgun'
    };

    onUpdateCharacter({
      ...character,
      weapons: [...character.weapons, weapon]
    });
    setShowAddModal(false);
  };

  const handleApplyPreset = (preset: Partial<Weapon>) => {
    setNewWeapon({
      ...newWeapon,
      ...preset,
      currentAmmo: preset.magCapacity || 0
    });
  };

  return (
    <div className="space-y-4">
      {/* Weapons Header & Action bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 flex flex-wrap items-center justify-between gap-3 shadow-md">
        <div className="flex items-center gap-2">
          <Crosshair size={18} className="text-red-500" />
          <h2 className="font-orbitron font-bold text-sm text-red-500 uppercase tracking-wider">
            {t.weaponsTitle}
          </h2>
          <span className="text-xs text-zinc-400 font-mono">({character.weapons.length})</span>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {onOpenShop && (
            <button
              onClick={() => {
                sfx.playClick();
                onOpenShop('weapons');
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-950/60 hover:bg-yellow-600 border border-yellow-700/80 text-yellow-300 hover:text-black font-bold text-xs uppercase tracking-wider rounded transition font-orbitron"
              title="Купить оружие из каталога DataPool"
            >
              <ShoppingCart size={14} className="text-yellow-400" />
              <span>Каталог DataPool</span>
            </button>
          )}

          <button
            onClick={() => {
              sfx.playClick();
              setShowRangeMatrix(!showRangeMatrix);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 rounded text-xs font-semibold transition"
          >
            <Table size={14} />
            <span>{t.rangeDvMatrix}</span>
            {showRangeMatrix ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>

          <button
            onClick={() => {
              sfx.playClick();
              setShowAddModal(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase tracking-wider rounded transition font-orbitron"
          >
            <Plus size={14} />
            <span>{t.addWeapon}</span>
          </button>
        </div>
      </div>

      {/* Range DV Interactive Table Collapsible */}
      {showRangeMatrix && (
        <div className="bg-zinc-900 border border-red-800/60 rounded-lg p-3 sm:p-4 shadow-xl overflow-x-auto">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-orbitron font-bold text-yellow-400 uppercase">
              Официальная таблица сложностей стрельбы (Cyberpunk RED Range DV Table)
            </span>
            <span className="text-[11px] text-zinc-400">
              * Кликните на ячейку с DV для мгновенного броска атаки
            </span>
          </div>

          <table className="w-full text-xs text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-400 font-mono text-[11px]">
                <th className="py-2 px-2">Категория оружия</th>
                {CPR_RANGE_DISTANCES.map((dist) => (
                  <th key={dist} className="py-2 px-1 text-center font-bold text-zinc-300">
                    {dist}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CPR_RANGE_DV_TABLE.map((row) => (
                <tr key={row.category} className="border-b border-zinc-800/50 hover:bg-zinc-800/40">
                  <td className="py-2 px-2 font-semibold text-zinc-200">{row.nameRu}</td>
                  {row.dvs.map((dv, idx) => (
                    <td key={idx} className="py-1 px-1 text-center">
                      {dv !== null ? (
                        <button
                          onClick={() => {
                            // Find matching weapon or default attack
                            const matchedWeapon = character.weapons.find((w) =>
                              w.category.toLowerCase().includes(row.category.toLowerCase().split(' ')[0])
                            ) || character.weapons[0];
                            if (matchedWeapon) {
                              onRollWeaponAttack(matchedWeapon, dv, CPR_RANGE_DISTANCES[idx]);
                            }
                          }}
                          title={`Бросить атаку против DV ${dv} на дистанции ${CPR_RANGE_DISTANCES[idx]}`}
                          className="px-2 py-1 bg-zinc-800 hover:bg-red-600 hover:text-white border border-zinc-700 hover:border-red-500 rounded font-mono font-bold text-zinc-200 transition text-[11px]"
                        >
                          {dv}
                        </button>
                      ) : (
                        <span className="text-zinc-600 font-mono">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Weapons Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {character.weapons.map((weapon) => {
          const isMelee = weapon.magCapacity === 0;
          const isOutOfAmmo = !isMelee && weapon.currentAmmo <= 0;

          return (
            <div
              key={weapon.id}
              className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-lg p-3 sm:p-4 transition flex flex-col justify-between shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <h3 className="font-orbitron font-bold text-sm text-zinc-100 flex items-center gap-1.5">
                      {weapon.name}
                      {weapon.concealable && (
                        <span className="text-[10px] bg-zinc-800 text-zinc-400 px-1.5 py-0.2 rounded font-sans">
                          Скрытое
                        </span>
                      )}
                    </h3>
                    <div className="text-xs text-red-400 font-semibold">{weapon.category}</div>
                  </div>

                  <button
                    onClick={() => handleDeleteWeapon(weapon.id)}
                    className="text-zinc-500 hover:text-red-400 p-1 transition"
                    title="Удалить оружие"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>

                {/* Weapon Stats Badge */}
                <div className="grid grid-cols-3 gap-2 my-2.5 text-center bg-zinc-950 p-2 rounded border border-zinc-850">
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">{t.damage}</span>
                    <span className="font-orbitron font-extrabold text-sm text-yellow-400">
                      {weapon.damage}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">{t.rof}</span>
                    <span className="font-orbitron font-extrabold text-sm text-zinc-200">
                      ROF {weapon.standardRof}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase text-zinc-500 block">{t.ammo}</span>
                    <span className={`font-orbitron font-extrabold text-sm ${isOutOfAmmo ? 'text-red-500 font-black animate-pulse' : 'text-zinc-200'}`}>
                      {isMelee ? 'Ближний бой' : `${weapon.currentAmmo} / ${weapon.magCapacity}`}
                    </span>
                  </div>
                </div>

                {weapon.notes && (
                  <div className="text-xs text-zinc-400 mb-2 italic">
                    {weapon.notes}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                {!isMelee && (
                  <div className="flex items-center gap-1.5">
                    <button
                      disabled={weapon.currentAmmo <= 0}
                      onClick={() => handleFireSingle(weapon.id)}
                      className="flex-1 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-200 text-xs font-semibold rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      {t.fireSingle}
                    </button>
                    {weapon.magCapacity >= 10 && (
                      <button
                        disabled={weapon.currentAmmo < 10}
                        onClick={() => handleFireAutofire(weapon.id)}
                        className="flex-1 py-1 bg-zinc-800 hover:bg-red-950 border border-zinc-700 text-red-300 text-xs font-semibold rounded transition disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        {t.fireAutofire}
                      </button>
                    )}
                    <button
                      onClick={() => handleReload(weapon.id)}
                      className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-zinc-300 text-xs font-semibold rounded transition flex items-center gap-1"
                      title={t.reload}
                    >
                      <RotateCcw size={13} />
                      <span>{t.reload}</span>
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => onRollWeaponAttack(weapon)}
                    className="py-1.5 bg-red-600 hover:bg-red-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Crosshair size={14} />
                    {t.rollAttack}
                  </button>

                  <button
                    onClick={() => onRollWeaponDamage(weapon)}
                    className="py-1.5 bg-zinc-800 hover:bg-yellow-950/60 border border-yellow-700/60 text-yellow-300 font-orbitron font-bold text-xs uppercase tracking-wider rounded transition flex items-center justify-center gap-1.5"
                  >
                    <Flame size={14} />
                    {t.rollDamage} ({weapon.damage})
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Weapon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in no-print">
          <div className="bg-zinc-900 border-2 border-red-600 w-full max-w-lg rounded-lg shadow-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
              <h3 className="font-orbitron font-bold text-red-500 text-sm uppercase">
                {t.addWeapon}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Presets dropdown */}
            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                Быстрый шаблон оружия
              </label>
              <select
                onChange={(e) => {
                  const preset = WEAPON_PRESETS.find((p) => p.name === e.target.value);
                  if (preset) handleApplyPreset(preset);
                }}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
              >
                <option value="">Выберите шаблон...</option>
                {WEAPON_PRESETS.map((p) => (
                  <option key={p.name} value={p.name}>
                    {p.name} ({p.damage}, ROF {p.standardRof})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.weaponName}
                </label>
                <input
                  type="text"
                  value={newWeapon.name}
                  onChange={(e) => setNewWeapon({ ...newWeapon, name: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.weaponType}
                </label>
                <input
                  type="text"
                  value={newWeapon.category}
                  onChange={(e) => setNewWeapon({ ...newWeapon, category: e.target.value as WeaponCategory })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.damage} (e.g. 3d6)
                </label>
                <input
                  type="text"
                  value={newWeapon.damage}
                  onChange={(e) => setNewWeapon({ ...newWeapon, damage: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.rof} (1 или 2)
                </label>
                <input
                  type="number"
                  min="1"
                  max="2"
                  value={newWeapon.standardRof}
                  onChange={(e) => setNewWeapon({ ...newWeapon, standardRof: parseInt(e.target.value, 10) || 1 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  {t.magCapacity}
                </label>
                <input
                  type="number"
                  value={newWeapon.magCapacity}
                  onChange={(e) => setNewWeapon({ ...newWeapon, magCapacity: parseInt(e.target.value, 10) || 0 })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                  Тип патронов
                </label>
                <input
                  type="text"
                  value={newWeapon.ammoType}
                  onChange={(e) => setNewWeapon({ ...newWeapon, ammoType: e.target.value })}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="text-xs text-zinc-400 uppercase font-semibold block mb-1">
                {t.notes}
              </label>
              <input
                type="text"
                value={newWeapon.notes}
                onChange={(e) => setNewWeapon({ ...newWeapon, notes: e.target.value })}
                className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1.5 text-zinc-100 text-sm focus:border-red-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded"
              >
                Отмена
              </button>
              <button
                onClick={handleAddWeapon}
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
