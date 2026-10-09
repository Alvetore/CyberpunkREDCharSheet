import React, { useState, useMemo } from 'react';
import { Character, Vehicle, VehicleCategory, StatKey } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { DATAPOOL_VEHICLE_UPGRADES, CatalogVehicleUpgrade } from '../data/datapoolVehicles';
import { 
  Car, 
  Wrench, 
  Plus, 
  Trash2, 
  ShoppingCart, 
  Shield, 
  Gauge, 
  Users, 
  Dices, 
  Flame, 
  AlertTriangle, 
  Check, 
  X, 
  ChevronDown, 
  ChevronUp,
  Cpu,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

interface VehiclesSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  onRollCustomCheck: (title: string, baseVal: number, dv?: number) => void;
  onRollCustomDamage: (title: string, formula: string) => void;
  onOpenShop?: (category?: 'all' | 'weapons' | 'armor' | 'cyberware' | 'gear' | 'vehicles') => void;
  lang: Language;
}

export const VehiclesSection: React.FC<VehiclesSectionProps> = ({
  character,
  onUpdateCharacter,
  onRollCustomCheck,
  onRollCustomDamage,
  onOpenShop,
  lang
}) => {
  const t = translations[lang];
  const vehicles = character.vehicles || [];

  const [categoryFilter, setCategoryFilter] = useState<'all' | VehicleCategory>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [upgradeTargetVehId, setUpgradeTargetVehId] = useState<string | null>(null);
  const [selectedUpgradeId, setSelectedUpgradeId] = useState<string>('');
  const [customUpgradeText, setCustomUpgradeText] = useState<string>('');

  // Form for custom vehicle
  const [newVehicle, setNewVehicle] = useState<Partial<Vehicle>>({
    name: lang === 'ru' ? 'Свой транспорт' : 'Custom Vehicle',
    model: '',
    category: 'Ground',
    sdpMax: 50,
    sdpCurrent: 50,
    armorSp: 0,
    seats: 4,
    speedCombat: '20 СКО',
    speedNarrative: '160 км/ч',
    costEb: 30000,
    notes: '',
    nomadRankReq: 0
  });

  // Calculate fleet stats
  const totalFleetCost = useMemo(() => {
    return vehicles.reduce((sum, v) => sum + (v.costEb || 0), 0);
  }, [vehicles]);

  const totalMaxSdp = useMemo(() => {
    return vehicles.reduce((sum, v) => sum + (v.sdpMax || 0), 0);
  }, [vehicles]);

  const totalCurrentSdp = useMemo(() => {
    return vehicles.reduce((sum, v) => sum + (v.sdpCurrent || 0), 0);
  }, [vehicles]);

  // Filtered vehicles
  const filteredVehicles = useMemo(() => {
    if (categoryFilter === 'all') return vehicles;
    return vehicles.filter((v) => v.category === categoryFilter);
  }, [vehicles, categoryFilter]);

  // General wound penalty of character
  const hpMax = character.hpMaxManual || (10 + 5 * Math.ceil((character.stats.BODY + character.stats.WILL) / 2));
  const seriouslyWoundedThreshold = Math.ceil(hpMax / 2);
  const woundPenalty = character.hpCurrent <= 0 ? -4 : character.hpCurrent <= seriouslyWoundedThreshold ? -2 : 0;
  const armorPenalty = Math.min(character.armor.head.penalty || 0, character.armor.body.penalty || 0);

  // Handlers for Vehicle Management
  const handleAddCustomVehicle = () => {
    sfx.playClick();
    const veh: Vehicle = {
      id: 'veh-custom-' + Date.now(),
      name: newVehicle.name?.trim() || (lang === 'ru' ? 'Кастомный транспорт' : 'Custom Vehicle'),
      model: newVehicle.model?.trim() || newVehicle.name?.trim() || '',
      category: newVehicle.category || 'Ground',
      sdpMax: Number(newVehicle.sdpMax) || 35,
      sdpCurrent: Number(newVehicle.sdpMax) || 35,
      armorSp: Number(newVehicle.armorSp) || 0,
      seats: newVehicle.seats || 2,
      speedCombat: newVehicle.speedCombat || '20 СКО',
      speedNarrative: newVehicle.speedNarrative || '160 км/ч',
      costEb: Number(newVehicle.costEb) || 0,
      notes: newVehicle.notes || '',
      nomadRankReq: Number(newVehicle.nomadRankReq) || 0,
      upgrades: []
    };

    onUpdateCharacter({
      ...character,
      vehicles: [...vehicles, veh]
    });

    setShowAddModal(false);
  };

  const handleDeleteVehicle = (vehId: string) => {
    const veh = vehicles.find((v) => v.id === vehId);
    if (!veh) return;
    const confirmMsg = lang === 'ru' 
      ? `Удалить транспорт "${veh.name}" из гаража?`
      : `Remove vehicle "${veh.name}" from garage?`;
    if (window.confirm(confirmMsg)) {
      sfx.playClick();
      onUpdateCharacter({
        ...character,
        vehicles: vehicles.filter((v) => v.id !== vehId)
      });
    }
  };

  const handleAdjustSdp = (vehId: string, delta: number) => {
    sfx.playClick();
    const updated = vehicles.map((v) => {
      if (v.id === vehId) {
        const next = Math.max(0, Math.min(v.sdpMax, v.sdpCurrent + delta));
        return { ...v, sdpCurrent: next };
      }
      return v;
    });
    onUpdateCharacter({ ...character, vehicles: updated });
  };

  const handleFullRepair = (vehId: string) => {
    sfx.playCritSuccess();
    const updated = vehicles.map((v) => {
      if (v.id === vehId) {
        return { ...v, sdpCurrent: v.sdpMax };
      }
      return v;
    });
    onUpdateCharacter({ ...character, vehicles: updated });
  };

  // Upgrades management
  const handleAddUpgradeToVehicle = () => {
    if (!upgradeTargetVehId) return;
    sfx.playClick();

    let upgradeNameToAdd = '';
    if (selectedUpgradeId === 'custom') {
      upgradeNameToAdd = customUpgradeText.trim();
    } else if (selectedUpgradeId) {
      const match = DATAPOOL_VEHICLE_UPGRADES.find((u) => u.id === selectedUpgradeId);
      if (match) {
        upgradeNameToAdd = lang === 'ru' ? match.nameRu : match.nameEn;
      }
    }

    if (!upgradeNameToAdd) return;

    const updated = vehicles.map((v) => {
      if (v.id === upgradeTargetVehId) {
        const currentUpg = v.upgrades || [];
        return { ...v, upgrades: [...currentUpg, upgradeNameToAdd] };
      }
      return v;
    });

    onUpdateCharacter({ ...character, vehicles: updated });
    setUpgradeTargetVehId(null);
    setSelectedUpgradeId('');
    setCustomUpgradeText('');
  };

  const handleRemoveUpgrade = (vehId: string, upgIdx: number) => {
    sfx.playClick();
    const updated = vehicles.map((v) => {
      if (v.id === vehId && v.upgrades) {
        const copy = [...v.upgrades];
        copy.splice(upgIdx, 1);
        return { ...v, upgrades: copy };
      }
      return v;
    });
    onUpdateCharacter({ ...character, vehicles: updated });
  };

  // Roll Checks for Vehicles
  const handleRollDriveCheck = (veh: Vehicle) => {
    // Determine driving skill
    let skillId = 'drive_land';
    let statKey: StatKey = 'REF';

    if (veh.category === 'Bicycle') {
      skillId = 'athletics';
      statKey = 'DEX';
    } else if (veh.category === 'Air') {
      skillId = 'pilot_air';
      statKey = 'REF';
    } else if (veh.category === 'Sea') {
      skillId = 'pilot_sea';
      statKey = 'REF';
    } else {
      skillId = 'drive_land';
      statKey = 'REF';
    }

    const skillObj = character.skills.find((s) => s.id === skillId);
    const skillLvl = skillObj ? skillObj.level : 0;
    const statVal = character.stats[statKey];

    // Penalties
    let sdpPenalty = 0;
    const isCriticalDamage = veh.sdpCurrent <= Math.floor(veh.sdpMax / 2);
    if (isCriticalDamage) {
      sdpPenalty = -2; // -2 to all driving checks if vehicle SDP <= 50%
    }

    // Neural link / interface plugs upgrade check
    let interfaceBonus = 0;
    const hasInterfaceUpgrade = veh.upgrades?.some((u) => 
      u.toLowerCase().includes('интерфейс') || u.toLowerCase().includes('interface')
    );
    const hasInterfacePlugs = character.cyberware.some((c) => 
      c.name.toLowerCase().includes('штекер') || 
      c.name.toLowerCase().includes('интерфейс') || 
      c.name.toLowerCase().includes('interface plug')
    );
    if (hasInterfaceUpgrade && hasInterfacePlugs) {
      interfaceBonus = 2; // +2 for direct neural drive link
    }

    const baseVal = statVal + skillLvl + armorPenalty + woundPenalty + sdpPenalty + interfaceBonus;

    const skillTitle = skillObj 
      ? (lang === 'ru' ? skillObj.nameRu : skillObj.nameEn)
      : (veh.category === 'Bicycle' ? (lang === 'ru' ? 'Атлетика' : 'Athletics') : (lang === 'ru' ? 'Вождение' : 'Drive'));

    const title = lang === 'ru'
      ? `Управление: ${veh.name} [${skillTitle} ${baseVal}]${sdpPenalty < 0 ? ' (Штраф ПЗТ -2)' : ''}${interfaceBonus > 0 ? ' (Нейросвязь +2)' : ''}`
      : `Drive: ${veh.name} [${skillTitle} ${baseVal}]${sdpPenalty < 0 ? ' (SDP Penalty -2)' : ''}${interfaceBonus > 0 ? ' (Neural Link +2)' : ''}`;

    onRollCustomCheck(title, baseVal);
  };

  const handleRollRamDamage = (veh: Vehicle) => {
    const isBike = veh.category === 'Bicycle';
    const formula = isBike ? '3d6' : '6d6';
    const title = lang === 'ru'
      ? `Таран: ${veh.name} (${formula} урона)`
      : `Ram: ${veh.name} (${formula} damage)`;

    onRollCustomDamage(title, formula);
  };

  const handleRollRepairCheck = (veh: Vehicle) => {
    let skillId = 'land_vehicle_tech';
    if (veh.category === 'Bicycle') skillId = 'basic_tech';
    else if (veh.category === 'Sea') skillId = 'sea_vehicle_tech';
    else if (veh.category === 'Air') skillId = 'air_vehicle_tech';

    const skillObj = character.skills.find((s) => s.id === skillId);
    const skillLvl = skillObj ? skillObj.level : 0;
    const baseVal = character.stats.TECH + skillLvl + woundPenalty;

    const skillTitle = skillObj
      ? (lang === 'ru' ? skillObj.nameRu : skillObj.nameEn)
      : (lang === 'ru' ? 'Техника транспорта' : 'Vehicle Tech');

    const title = lang === 'ru'
      ? `Ремонт: ${veh.name} [${skillTitle} База: ${baseVal}]`
      : `Repair: ${veh.name} [${skillTitle} Base: ${baseVal}]`;

    onRollCustomCheck(title, baseVal, 13); // Default CPR repair DV is 13-17
  };

  return (
    <div className="space-y-4">
      {/* Top Banner & Fleet Overview */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 sm:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-950/60 border border-amber-600 rounded text-amber-500">
                <Car size={22} />
              </div>
              <div>
                <h2 className="font-orbitron font-bold text-lg sm:text-xl text-amber-500 tracking-wider uppercase">
                  {t.vehiclesTitle}
                </h2>
                <p className="text-xs text-zinc-400">
                  {lang === 'ru'
                    ? 'Личный автопарк, катера, AV-аэрокары, мотоциклы и велосипеды. Прочность (ПЗТ), таран и улучшения.'
                    : 'Personal garage: groundcars, roadbikes, aerodynes, boats and bikes. Track SDP, ramming and upgrades.'}
                </p>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {onOpenShop && (
              <button
                onClick={() => {
                  sfx.playClick();
                  onOpenShop('vehicles');
                }}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-amber-600 hover:bg-amber-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition min-h-[38px]"
              >
                <ShoppingCart size={15} />
                <span>{lang === 'ru' ? 'Авторынок DataPool' : 'DataPool Dealership'}</span>
              </button>
            )}

            <button
              onClick={() => {
                sfx.playClick();
                setShowAddModal(true);
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-orbitron font-bold text-xs uppercase tracking-wider rounded-lg transition min-h-[38px]"
            >
              <Plus size={15} />
              <span>{t.addVehicle}</span>
            </button>
          </div>
        </div>

        {/* Fleet KPI Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-zinc-800 text-xs">
          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-2.5">
            <div className="text-zinc-500 text-[10px] uppercase font-semibold">
              {lang === 'ru' ? 'Транспортных средств' : 'Total Vehicles'}
            </div>
            <div className="font-orbitron font-bold text-amber-400 text-base sm:text-lg mt-0.5">
              {vehicles.length}
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-2.5">
            <div className="text-zinc-500 text-[10px] uppercase font-semibold">
              {lang === 'ru' ? 'Стоимость автопарка' : 'Total Fleet Value'}
            </div>
            <div className="font-orbitron font-bold text-yellow-400 text-base sm:text-lg mt-0.5">
              {totalFleetCost.toLocaleString()} eb
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-2.5">
            <div className="text-zinc-500 text-[10px] uppercase font-semibold">
              {lang === 'ru' ? 'Общий запас ПЗТ' : 'Total SDP Pool'}
            </div>
            <div className="font-orbitron font-bold text-emerald-400 text-base sm:text-lg mt-0.5">
              {totalCurrentSdp} / {totalMaxSdp}
            </div>
          </div>

          <div className="bg-zinc-950/80 border border-zinc-800/80 rounded-lg p-2.5">
            <div className="text-zinc-500 text-[10px] uppercase font-semibold">
              {lang === 'ru' ? 'Правило повреждения' : 'Damage Rule'}
            </div>
            <div className="text-zinc-300 text-[11px] font-mono mt-0.5 leading-snug">
              {lang === 'ru' ? '≤50% ПЗТ = -2 к проверкам' : '≤50% SDP = -2 checks'}
            </div>
          </div>
        </div>
      </div>

      {/* Category Filter Chips */}
      {vehicles.length > 0 && (
        <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x scrollbar-none pb-1">
          <span className="text-xs text-zinc-400 font-semibold shrink-0 mr-1">
            {lang === 'ru' ? 'Категория:' : 'Filter:'}
          </span>
          {[
            { key: 'all', labelRu: 'Все', labelEn: 'All', count: vehicles.length },
            { key: 'Ground', labelRu: 'Наземный', labelEn: 'Ground', count: vehicles.filter((v) => v.category === 'Ground').length },
            { key: 'Sea', labelRu: 'Водный', labelEn: 'Sea', count: vehicles.filter((v) => v.category === 'Sea').length },
            { key: 'Air', labelRu: 'Воздушный', labelEn: 'Air', count: vehicles.filter((v) => v.category === 'Air').length },
            { key: 'Bicycle', labelRu: 'Велосипеды', labelEn: 'Bicycles', count: vehicles.filter((v) => v.category === 'Bicycle').length },
          ].map((cat) => (
            <button
              key={cat.key}
              onClick={() => {
                sfx.playClick();
                setCategoryFilter(cat.key as any);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 flex items-center gap-1.5 min-h-[34px] ${
                categoryFilter === cat.key
                  ? 'bg-amber-600 text-white font-bold shadow'
                  : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <span>{lang === 'ru' ? cat.labelRu : cat.labelEn}</span>
              <span className="text-[10px] opacity-75">({cat.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Vehicles Cards List */}
      {filteredVehicles.length === 0 ? (
        <div className="bg-zinc-900/60 border border-zinc-800 border-dashed rounded-xl p-8 sm:p-12 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-zinc-800/80 text-zinc-500 mx-auto flex items-center justify-center">
            <Car size={32} />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="font-orbitron font-bold text-zinc-300 text-base">
              {lang === 'ru' ? 'В гараже пусто' : 'Garage is empty'}
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              {t.emptyGarage}
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            {onOpenShop && (
              <button
                onClick={() => {
                  sfx.playClick();
                  onOpenShop('vehicles');
                }}
                className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-orbitron font-bold text-xs uppercase tracking-wider rounded-lg shadow-md transition flex items-center gap-2 min-h-[38px]"
              >
                <ShoppingCart size={14} />
                <span>{lang === 'ru' ? 'Купить в DataPool (64 модели)' : 'Open DataPool Store'}</span>
              </button>
            )}
            <button
              onClick={() => {
                sfx.playClick();
                setShowAddModal(true);
              }}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-orbitron font-bold text-xs uppercase tracking-wider rounded-lg transition flex items-center gap-2 min-h-[38px]"
            >
              <Plus size={14} />
              <span>{t.addVehicle}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredVehicles.map((vehicle) => {
            const isCriticalDamage = vehicle.sdpCurrent <= Math.floor(vehicle.sdpMax / 2) && vehicle.sdpCurrent > 0;
            const isDestroyed = vehicle.sdpCurrent === 0;
            const sdpPercent = Math.round((vehicle.sdpCurrent / vehicle.sdpMax) * 100);

            // Category color accents
            const categoryBadgeColor = 
              vehicle.category === 'Air' ? 'bg-cyan-950 text-cyan-300 border-cyan-800' :
              vehicle.category === 'Sea' ? 'bg-blue-950 text-blue-300 border-blue-800' :
              vehicle.category === 'Bicycle' ? 'bg-emerald-950 text-emerald-300 border-emerald-800' :
              'bg-amber-950 text-amber-300 border-amber-800';

            const categoryName = 
              vehicle.category === 'Air' ? (lang === 'ru' ? 'Воздушный (AV / Вертолет)' : 'Air Vehicle') :
              vehicle.category === 'Sea' ? (lang === 'ru' ? 'Водный (Катер / Субмарина)' : 'Sea Vehicle') :
              vehicle.category === 'Bicycle' ? (lang === 'ru' ? 'Велосипед' : 'Bicycle') :
              (lang === 'ru' ? 'Наземный (Авто / Мото)' : 'Ground Vehicle');

            return (
              <div
                key={vehicle.id}
                className={`bg-zinc-900 border rounded-xl p-4 flex flex-col justify-between transition-all shadow-md ${
                  isDestroyed
                    ? 'border-red-900 bg-red-950/20'
                    : isCriticalDamage
                    ? 'border-amber-700/80 bg-amber-950/10'
                    : 'border-zinc-800 hover:border-zinc-700'
                }`}
              >
                <div className="space-y-3">
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1 flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${categoryBadgeColor}`}>
                          {categoryName}
                        </span>
                        {vehicle.nomadRankReq !== undefined && vehicle.nomadRankReq > 0 && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded border border-purple-800 bg-purple-950/80 text-purple-300">
                            {lang === 'ru' ? `Кочевник ${vehicle.nomadRankReq}+` : `Nomad ${vehicle.nomadRankReq}+`}
                          </span>
                        )}
                      </div>
                      <h3 className="font-orbitron font-bold text-base sm:text-lg text-zinc-100 truncate">
                        {vehicle.name}
                      </h3>
                      {vehicle.model && vehicle.model !== vehicle.name && (
                        <div className="text-xs text-zinc-400 font-mono">
                          {vehicle.model}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-orbitron font-bold text-xs text-yellow-400 bg-yellow-950/80 border border-yellow-800 px-2 py-1 rounded">
                        {vehicle.costEb.toLocaleString()} eb
                      </span>
                      <button
                        onClick={() => handleDeleteVehicle(vehicle.id)}
                        className="p-1.5 text-zinc-500 hover:text-red-400 rounded hover:bg-zinc-800 transition min-w-[32px] min-h-[32px] flex items-center justify-center"
                        title={lang === 'ru' ? 'Удалить из гаража' : 'Remove from garage'}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* SDP (Structural Damage Points) Health Bar & Controls */}
                  <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <Shield size={14} className={isDestroyed ? 'text-red-500' : isCriticalDamage ? 'text-amber-500' : 'text-emerald-400'} />
                        <span className="font-bold text-zinc-300">{t.sdp}</span>
                        <span className="text-zinc-500 text-[11px]">
                          ({sdpPercent}%)
                        </span>
                      </div>

                      <div className="flex items-center gap-1 font-orbitron font-bold text-sm">
                        <span className={isDestroyed ? 'text-red-500' : isCriticalDamage ? 'text-amber-400' : 'text-emerald-400'}>
                          {vehicle.sdpCurrent}
                        </span>
                        <span className="text-zinc-500">/</span>
                        <span className="text-zinc-400">{vehicle.sdpMax}</span>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full bg-zinc-900 rounded-full h-2.5 overflow-hidden border border-zinc-800">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isDestroyed
                            ? 'bg-red-600'
                            : isCriticalDamage
                            ? 'bg-amber-500'
                            : 'bg-emerald-500'
                        }`}
                        style={{ width: `${Math.max(0, Math.min(100, sdpPercent))}%` }}
                      />
                    </div>

                    {/* Status Alerts */}
                    {isDestroyed && (
                      <div className="flex items-center gap-1.5 text-xs text-red-400 bg-red-950/60 border border-red-800 rounded px-2 py-1 font-semibold">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>{lang === 'ru' ? 'ВЫВЕДЕНО ИЗ СТРОЯ / УНИЧТОЖЕНО (0 ПЗТ)' : 'DESTROYED / DISABLED (0 SDP)'}</span>
                      </div>
                    )}

                    {isCriticalDamage && (
                      <div className="flex items-center gap-1.5 text-xs text-amber-300 bg-amber-950/60 border border-amber-800 rounded px-2 py-1 font-semibold">
                        <AlertTriangle size={14} className="shrink-0" />
                        <span>{lang === 'ru' ? 'Критическое повреждение: -2 к проверкам управления!' : 'Critical damage: -2 to drive checks!'}</span>
                      </div>
                    )}

                    {/* SDP Adjustment Buttons */}
                    <div className="flex items-center justify-between gap-1 pt-1 flex-wrap">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleAdjustSdp(vehicle.id, -5)}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[11px] font-mono min-h-[28px] min-w-[32px] flex items-center justify-center transition"
                          title="-5 SDP"
                        >
                          -5
                        </button>
                        <button
                          onClick={() => handleAdjustSdp(vehicle.id, -1)}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[11px] font-mono min-h-[28px] min-w-[32px] flex items-center justify-center transition"
                          title="-1 SDP"
                        >
                          -1
                        </button>
                        <button
                          onClick={() => handleAdjustSdp(vehicle.id, +1)}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[11px] font-mono min-h-[28px] min-w-[32px] flex items-center justify-center transition"
                          title="+1 SDP"
                        >
                          +1
                        </button>
                        <button
                          onClick={() => handleAdjustSdp(vehicle.id, +5)}
                          className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-700 rounded text-[11px] font-mono min-h-[28px] min-w-[32px] flex items-center justify-center transition"
                          title="+5 SDP"
                        >
                          +5
                        </button>
                      </div>

                      <button
                        onClick={() => handleFullRepair(vehicle.id)}
                        disabled={vehicle.sdpCurrent >= vehicle.sdpMax}
                        className="px-2.5 py-1 bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 disabled:opacity-40 disabled:cursor-not-allowed rounded text-[11px] font-bold font-orbitron transition flex items-center gap-1 min-h-[28px]"
                        title={lang === 'ru' ? 'Восстановить ПЗТ до максимума' : 'Restore SDP to max'}
                      >
                        <Wrench size={12} />
                        <span>{t.restoreSdp}</span>
                      </button>
                    </div>
                  </div>

                  {/* Vehicle Characteristics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Users size={12} />
                        <span>{t.seats}</span>
                      </div>
                      <div className="font-bold text-zinc-200 mt-0.5">
                        {vehicle.seats}
                      </div>
                    </div>

                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Zap size={12} />
                        <span>{t.speedCombat}</span>
                      </div>
                      <div className="font-bold text-zinc-200 mt-0.5">
                        {vehicle.speedCombat}
                      </div>
                    </div>

                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Gauge size={12} />
                        <span>{t.speedNarrative}</span>
                      </div>
                      <div className="font-bold text-zinc-200 mt-0.5">
                        {vehicle.speedNarrative}
                      </div>
                    </div>

                    <div className="bg-zinc-950 p-2 rounded border border-zinc-800/80">
                      <div className="text-[10px] text-zinc-500 flex items-center gap-1">
                        <Shield size={12} />
                        <span>{lang === 'ru' ? 'Броня (SP)' : 'Armor (SP)'}</span>
                      </div>
                      <div className="font-bold text-zinc-200 mt-0.5">
                        {vehicle.armorSp !== undefined && vehicle.armorSp > 0 ? `${vehicle.armorSp} SP` : '0 SP'}
                      </div>
                    </div>
                  </div>

                  {/* Installed Upgrades */}
                  <div className="bg-zinc-950/70 border border-zinc-800/80 rounded-lg p-2.5 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-zinc-400 font-semibold">
                        <Layers size={13} className="text-amber-500" />
                        <span>{t.vehicleUpgrades}</span>
                        <span className="text-[10px] text-zinc-500">
                          ({vehicle.upgrades?.length || 0})
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          sfx.playClick();
                          setUpgradeTargetVehId(vehicle.id);
                          setSelectedUpgradeId(DATAPOOL_VEHICLE_UPGRADES[0]?.id || '');
                        }}
                        className="text-[11px] text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 transition"
                      >
                        <Plus size={12} />
                        <span>{lang === 'ru' ? 'Установить' : 'Install Upgrade'}</span>
                      </button>
                    </div>

                    {vehicle.upgrades && vehicle.upgrades.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5 pt-0.5">
                        {vehicle.upgrades.map((upg, idx) => (
                          <span
                            key={idx}
                            className="bg-zinc-900 text-zinc-300 border border-zinc-700/80 px-2 py-0.5 rounded text-[11px] flex items-center gap-1.5"
                          >
                            <span>{upg}</span>
                            <button
                              onClick={() => handleRemoveUpgrade(vehicle.id, idx)}
                              className="text-zinc-500 hover:text-red-400 transition"
                              title={lang === 'ru' ? 'Снять улучшение' : 'Remove upgrade'}
                            >
                              <X size={11} />
                            </button>
                          </span>
                        ))}
                      </div>
                    ) : (
                      <div className="text-[11px] text-zinc-500 italic">
                        {lang === 'ru' ? 'Модернизации не установлены' : 'No upgrades installed'}
                      </div>
                    )}
                  </div>

                  {/* Lore / Notes */}
                  {vehicle.notes && (
                    <div className="text-[11px] text-zinc-400 leading-relaxed bg-zinc-950/50 p-2.5 rounded border border-zinc-800/60">
                      {vehicle.notes}
                    </div>
                  )}
                </div>

                {/* Card Actions Footer: Quick Roll Buttons */}
                <div className="pt-3 border-t border-zinc-800/80 mt-3 grid grid-cols-3 gap-2">
                  {/* Drive Check */}
                  <button
                    onClick={() => handleRollDriveCheck(vehicle)}
                    disabled={isDestroyed}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 bg-amber-600 hover:bg-amber-500 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-orbitron font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-lg shadow transition min-h-[36px]"
                    title={lang === 'ru' ? 'Бросить проверку управления' : 'Roll drive check'}
                  >
                    <Dices size={14} />
                    <span>{t.rollDrive}</span>
                  </button>

                  {/* Ram Attack */}
                  <button
                    onClick={() => handleRollRamDamage(vehicle)}
                    disabled={isDestroyed}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 bg-red-700 hover:bg-red-600 disabled:bg-zinc-800 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-orbitron font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-lg shadow transition min-h-[36px]"
                    title={vehicle.category === 'Bicycle' ? 'Таран 3d6 урона' : 'Таран 6d6 урона'}
                  >
                    <Flame size={14} />
                    <span>{t.rollRam}</span>
                  </button>

                  {/* Tech Repair Check */}
                  <button
                    onClick={() => handleRollRepairCheck(vehicle)}
                    className="flex items-center justify-center gap-1.5 py-2 px-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 font-orbitron font-bold text-[11px] sm:text-xs uppercase tracking-wider rounded-lg shadow transition min-h-[36px]"
                    title={lang === 'ru' ? 'Проверка техники для ремонта' : 'Roll tech repair check'}
                  >
                    <Wrench size={14} />
                    <span>{lang === 'ru' ? 'Ремонт' : 'Repair'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upgrade Selector Modal */}
      {upgradeTargetVehId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-amber-800/80 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-500 font-orbitron font-bold text-sm sm:text-base">
                <Layers size={18} />
                <span>{lang === 'ru' ? 'Установить улучшение на транспорт' : 'Install Vehicle Upgrade'}</span>
              </div>
              <button
                onClick={() => setUpgradeTargetVehId(null)}
                className="text-zinc-400 hover:text-white p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  {lang === 'ru' ? 'Выберите официальное улучшение Кочевников / Мастерской:' : 'Select official upgrade:'}
                </label>
                <select
                  value={selectedUpgradeId}
                  onChange={(e) => setSelectedUpgradeId(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 min-h-[38px]"
                >
                  {DATAPOOL_VEHICLE_UPGRADES.map((u) => (
                    <option key={u.id} value={u.id}>
                      {lang === 'ru' ? u.nameRu : u.nameEn} ({u.costEb} eb, {lang === 'ru' ? `Ранг ${u.nomadRank}` : `Rank ${u.nomadRank}`})
                    </option>
                  ))}
                  <option value="custom">{lang === 'ru' ? '— Ввести своё название вручную —' : '— Enter custom name —'}</option>
                </select>
              </div>

              {selectedUpgradeId === 'custom' ? (
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    {lang === 'ru' ? 'Название и описание улучшения:' : 'Custom upgrade title:'}
                  </label>
                  <input
                    type="text"
                    value={customUpgradeText}
                    onChange={(e) => setCustomUpgradeText(e.target.value)}
                    placeholder={lang === 'ru' ? 'Например: Бронестекла IV класса (+5 SP)' : 'e.g. Heavy Plating (+5 SP)'}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 min-h-[38px]"
                  />
                </div>
              ) : (
                (() => {
                  const currentUpg = DATAPOOL_VEHICLE_UPGRADES.find((u) => u.id === selectedUpgradeId);
                  if (!currentUpg) return null;
                  return (
                    <div className="bg-zinc-950 p-3 rounded-lg border border-zinc-800 space-y-1.5 text-zinc-300">
                      <div className="font-semibold text-amber-400">
                        {lang === 'ru' ? currentUpg.nameRu : currentUpg.nameEn}
                      </div>
                      <div className="text-[11px] text-zinc-400 leading-relaxed">
                        {lang === 'ru' ? currentUpg.descriptionRu : currentUpg.descriptionEn}
                      </div>
                      <div className="flex items-center gap-2 pt-1 font-mono text-[10px] text-zinc-400">
                        <span>{lang === 'ru' ? `Подходит для: ${currentUpg.applicableCategory}` : `Applies to: ${currentUpg.applicableCategory}`}</span>
                        <span>•</span>
                        <span>{lang === 'ru' ? `Мин. ранг Кочевника: ${currentUpg.nomadRank}` : `Nomad: ${currentUpg.nomadRank}`}</span>
                      </div>
                    </div>
                  );
                })()
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setUpgradeTargetVehId(null)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-bold text-xs min-h-[36px]"
              >
                {t.close}
              </button>
              <button
                onClick={handleAddUpgradeToVehicle}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-orbitron font-bold text-xs uppercase tracking-wider min-h-[36px]"
              >
                {lang === 'ru' ? 'Установить' : 'Install'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Custom Vehicle Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-lg p-5 space-y-4 shadow-2xl max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div className="flex items-center gap-2 text-amber-500 font-orbitron font-bold text-base">
                <Car size={18} />
                <span>{t.addVehicle}</span>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-zinc-400 hover:text-white p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  {lang === 'ru' ? 'Название / Марка ТС:' : 'Vehicle Name:'}
                </label>
                <input
                  type="text"
                  value={newVehicle.name || ''}
                  onChange={(e) => setNewVehicle({ ...newVehicle, name: e.target.value })}
                  placeholder={lang === 'ru' ? 'Например: Quadra Turbo-R V-Tech' : 'e.g. Quadra Turbo-R'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 min-h-[38px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    {lang === 'ru' ? 'Категория:' : 'Category:'}
                  </label>
                  <select
                    value={newVehicle.category || 'Ground'}
                    onChange={(e) => setNewVehicle({ ...newVehicle, category: e.target.value as VehicleCategory })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 min-h-[38px]"
                  >
                    <option value="Ground">{lang === 'ru' ? 'Наземный (Авто/Мото)' : 'Ground'}</option>
                    <option value="Sea">{lang === 'ru' ? 'Водный (Катер/Лодка)' : 'Sea'}</option>
                    <option value="Air">{lang === 'ru' ? 'Воздушный (AV/Вертолет)' : 'Air'}</option>
                    <option value="Bicycle">{lang === 'ru' ? 'Велосипед' : 'Bicycle'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    {lang === 'ru' ? 'Прочность ПЗТ (SDP):' : 'SDP Max:'}
                  </label>
                  <input
                    type="number"
                    value={newVehicle.sdpMax || 50}
                    onChange={(e) => setNewVehicle({ ...newVehicle, sdpMax: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 min-h-[38px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    {t.seats}
                  </label>
                  <input
                    type="number"
                    value={newVehicle.seats || 4}
                    onChange={(e) => setNewVehicle({ ...newVehicle, seats: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 min-h-[38px]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    {lang === 'ru' ? 'Броня (SP):' : 'Armor SP:'}
                  </label>
                  <input
                    type="number"
                    value={newVehicle.armorSp || 0}
                    onChange={(e) => setNewVehicle({ ...newVehicle, armorSp: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 min-h-[38px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    {t.speedCombat}
                  </label>
                  <input
                    type="text"
                    value={newVehicle.speedCombat || '20 СКО'}
                    onChange={(e) => setNewVehicle({ ...newVehicle, speedCombat: e.target.value })}
                    placeholder="20 СКО"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 min-h-[38px]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    {t.speedNarrative}
                  </label>
                  <input
                    type="text"
                    value={newVehicle.speedNarrative || '160 км/ч'}
                    onChange={(e) => setNewVehicle({ ...newVehicle, speedNarrative: e.target.value })}
                    placeholder="160 км/ч"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 min-h-[38px]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    {lang === 'ru' ? 'Стоимость (eb):' : 'Cost (eb):'}
                  </label>
                  <input
                    type="number"
                    value={newVehicle.costEb || 0}
                    onChange={(e) => setNewVehicle({ ...newVehicle, costEb: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 min-h-[38px]"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 font-semibold mb-1">
                    {lang === 'ru' ? 'Ранг Кочевника:' : 'Nomad Rank Req:'}
                  </label>
                  <input
                    type="number"
                    value={newVehicle.nomadRankReq || 0}
                    onChange={(e) => setNewVehicle({ ...newVehicle, nomadRankReq: Number(e.target.value) })}
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500 min-h-[38px]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-zinc-400 font-semibold mb-1">
                  {lang === 'ru' ? 'Описание / Особенности:' : 'Notes:'}
                </label>
                <textarea
                  rows={2}
                  value={newVehicle.notes || ''}
                  onChange={(e) => setNewVehicle({ ...newVehicle, notes: e.target.value })}
                  placeholder={lang === 'ru' ? 'Особое оборудование, тайники, цвет...' : 'Special equipment, trunk stash...'}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-2.5 text-zinc-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded font-bold text-xs min-h-[36px]"
              >
                {t.close}
              </button>
              <button
                onClick={handleAddCustomVehicle}
                className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded font-orbitron font-bold text-xs uppercase tracking-wider min-h-[36px]"
              >
                {t.addVehicle}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default VehiclesSection;
