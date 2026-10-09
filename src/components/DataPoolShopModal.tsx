import React, { useState, useMemo } from 'react';
import { Character, Weapon, ArmorItem, CyberwareItem, GearItem, Vehicle } from '../types/character';
import { Language } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { 
  DATAPOOL_WEAPONS, 
  DATAPOOL_ARMORS, 
  DATAPOOL_CYBERWARE, 
  DATAPOOL_GEAR,
  CatalogWeaponItem,
  CatalogArmorItem,
  CatalogCyberwareItem
} from '../data/datapoolCatalog';
import {
  DATAPOOL_ALL_VEHICLES,
  DATAPOOL_VEHICLE_UPGRADES,
  CatalogVehicleItem,
  CatalogVehicleUpgrade
} from '../data/datapoolVehicles';
import { 
  ShoppingCart, 
  X, 
  Search, 
  Crosshair, 
  Shield, 
  Cpu, 
  Package, 
  Coins, 
  Check, 
  ChevronDown, 
  ChevronUp,
  AlertCircle,
  ExternalLink,
  Plus,
  Minus,
  Sparkles,
  Car
} from 'lucide-react';

interface DataPoolShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  lang: Language;
  initialCategory?: 'all' | 'weapons' | 'armor' | 'cyberware' | 'gear' | 'vehicles';
}

type ShopTab = 'all' | 'weapons' | 'armor' | 'cyberware' | 'gear' | 'vehicles';

interface UnifiedShopItem {
  id: string;
  originalId: string;
  name: string;
  type: 'weapon' | 'armor' | 'cyberware' | 'gear' | 'vehicle' | 'vehicle_upgrade';
  categoryLabel: string;
  costEb: number;
  description: string;
  weaponData?: CatalogWeaponItem;
  armorData?: CatalogArmorItem;
  cyberwareData?: CatalogCyberwareItem;
  gearData?: GearItem;
  vehicleData?: CatalogVehicleItem;
  vehicleUpgradeData?: CatalogVehicleUpgrade;
}

export const DataPoolShopModal: React.FC<DataPoolShopModalProps> = ({
  isOpen,
  onClose,
  character,
  onUpdateCharacter,
  lang,
  initialCategory = 'all'
}) => {
  const [activeTab, setActiveTab] = useState<ShopTab>(initialCategory);
  const [vehicleSubFilter, setVehicleSubFilter] = useState<'all' | 'Ground' | 'Sea' | 'Air' | 'Bicycle' | 'upgrades'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc'>('default');
  const [isFreeMode, setIsFreeMode] = useState(false);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);
  const [purchaseSuccessMessage, setPurchaseSuccessMessage] = useState<string | null>(null);

  // Normalize all items into a unified list
  const allItems: UnifiedShopItem[] = useMemo(() => {
    const list: UnifiedShopItem[] = [];

    // Weapons
    DATAPOOL_WEAPONS.forEach((w) => {
      list.push({
        id: 'shop-' + w.id,
        originalId: w.id,
        name: w.name,
        type: 'weapon',
        categoryLabel: lang === 'ru' ? `Оружие (${w.category})` : `Weapon (${w.category})`,
        costEb: w.costEb,
        description: w.notes,
        weaponData: w
      });
    });

    // Armors
    DATAPOOL_ARMORS.forEach((a) => {
      list.push({
        id: 'shop-' + a.id,
        originalId: a.id,
        name: a.name,
        type: 'armor',
        categoryLabel: a.location === 'shield' ? (lang === 'ru' ? 'Щит' : 'Shield') : a.location === 'head' ? (lang === 'ru' ? 'Шлем' : 'Helmet') : (lang === 'ru' ? 'Броня' : 'Armor'),
        costEb: a.costEb,
        description: a.notes || (lang === 'ru' ? `ОС: ${a.spMax}, Штраф: ${a.penalty}` : `SP: ${a.spMax}, Penalty: ${a.penalty}`),
        armorData: a
      });
    });

    // Cyberware
    DATAPOOL_CYBERWARE.forEach((c) => {
      list.push({
        id: 'shop-' + c.id,
        originalId: c.id,
        name: c.name,
        type: 'cyberware',
        categoryLabel: lang === 'ru' ? `Имплант (${c.category})` : `Cyberware (${c.category})`,
        costEb: c.costEb,
        description: c.description,
        cyberwareData: c
      });
    });

    // Gear
    DATAPOOL_GEAR.forEach((g) => {
      list.push({
        id: 'shop-' + g.id,
        originalId: g.id,
        name: g.name,
        type: 'gear',
        categoryLabel: g.category === 'Consumable' ? (lang === 'ru' ? 'Расходник' : 'Consumable') : (lang === 'ru' ? 'Снаряжение' : 'Gear'),
        costEb: g.costEb,
        description: g.notes,
        gearData: g
      });
    });

    // Vehicles
    DATAPOOL_ALL_VEHICLES.forEach((v) => {
      const catRu = v.category === 'Ground' ? 'Наземный' : v.category === 'Sea' ? 'Водный' : v.category === 'Air' ? 'Воздушный' : 'Велосипед';
      list.push({
        id: 'shop-' + v.id,
        originalId: v.id,
        name: lang === 'ru' ? v.name : (v.nameEn || v.name),
        type: 'vehicle',
        categoryLabel: lang === 'ru' ? `Транспорт (${catRu})` : `Vehicle (${v.category})`,
        costEb: v.costEb,
        description: lang === 'ru' ? v.descriptionRu : (v.descriptionEn || v.descriptionRu),
        vehicleData: v
      });
    });

    // Vehicle Upgrades
    DATAPOOL_VEHICLE_UPGRADES.forEach((u) => {
      list.push({
        id: 'shop-' + u.id,
        originalId: u.id,
        name: lang === 'ru' ? u.nameRu : u.nameEn,
        type: 'vehicle_upgrade',
        categoryLabel: lang === 'ru' ? 'Модернизация ТС' : 'Vehicle Upgrade',
        costEb: u.costEb,
        description: lang === 'ru'
          ? `${u.descriptionRu} (Подходит: ${u.applicableCategory}, Ранг: ${u.nomadRank})`
          : `${u.descriptionEn} (Applicable: ${u.applicableCategory}, Rank: ${u.nomadRank})`,
        vehicleUpgradeData: u
      });
    });

    return list;
  }, [lang]);

  // Filtered and sorted items
  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      // Category filter
      if (activeTab === 'weapons' && item.type !== 'weapon') return false;
      if (activeTab === 'armor' && item.type !== 'armor') return false;
      if (activeTab === 'cyberware' && item.type !== 'cyberware') return false;
      if (activeTab === 'gear' && item.type !== 'gear') return false;
      if (activeTab === 'vehicles') {
        if (item.type !== 'vehicle' && item.type !== 'vehicle_upgrade') return false;
        if (vehicleSubFilter === 'upgrades' && item.type !== 'vehicle_upgrade') return false;
        if (vehicleSubFilter !== 'all' && vehicleSubFilter !== 'upgrades') {
          if (item.type !== 'vehicle' || item.vehicleData?.category !== vehicleSubFilter) return false;
        }
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesDesc = item.description.toLowerCase().includes(q);
        const matchesCat = item.categoryLabel.toLowerCase().includes(q);
        if (!matchesName && !matchesDesc && !matchesCat) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price_asc') return a.costEb - b.costEb;
      if (sortBy === 'price_desc') return b.costEb - a.costEb;
      return 0;
    });
  }, [allItems, activeTab, vehicleSubFilter, searchQuery, sortBy]);

  if (!isOpen) return null;

  const handleAdjustCash = (delta: number) => {
    sfx.playClick();
    const updatedCash = Math.max(0, character.cashEb + delta);
    onUpdateCharacter({ ...character, cashEb: updatedCash });
  };

  const handleBuyItem = (item: UnifiedShopItem) => {
    const finalPrice = isFreeMode ? 0 : item.costEb;

    if (!isFreeMode && character.cashEb < item.costEb) {
      alert(lang === 'ru' ? 'Недостаточно евродолларов!' : 'Not enough Eurodollars!');
      return;
    }

    sfx.playCritSuccess();

    const updatedChar = { ...character };
    updatedChar.cashEb = Math.max(0, character.cashEb - finalPrice);

    if (item.type === 'weapon' && item.weaponData) {
      const newWeap: Weapon = {
        id: 'weap-dp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: item.weaponData.name,
        category: item.weaponData.category,
        damage: item.weaponData.damage,
        standardRof: item.weaponData.standardRof,
        magCapacity: item.weaponData.magCapacity,
        currentAmmo: item.weaponData.magCapacity,
        ammoType: item.weaponData.ammoType,
        concealable: item.weaponData.concealable,
        notes: item.weaponData.notes,
        skillId: item.weaponData.skillId
      };
      updatedChar.weapons = [...updatedChar.weapons, newWeap];
    } else if (item.type === 'armor' && item.armorData) {
      const newArmor: ArmorItem = {
        id: 'armor-dp-' + Date.now(),
        name: item.armorData.name,
        location: item.armorData.location,
        spMax: item.armorData.spMax,
        spCurrent: item.armorData.spMax,
        penalty: item.armorData.penalty,
        notes: item.armorData.notes
      };

      if (newArmor.location === 'head') {
        updatedChar.armor = { ...updatedChar.armor, head: newArmor };
      } else if (newArmor.location === 'body') {
        updatedChar.armor = { ...updatedChar.armor, body: newArmor };
      } else if (newArmor.location === 'shield') {
        updatedChar.armor = { ...updatedChar.armor, shield: newArmor };
      }
    } else if (item.type === 'cyberware' && item.cyberwareData) {
      const newCyber: CyberwareItem = {
        id: 'cyber-dp-' + Date.now(),
        name: item.cyberwareData.name,
        category: item.cyberwareData.category,
        installLocation: item.cyberwareData.installLocation,
        humanityCost: item.cyberwareData.humanityCost,
        humanityLoss: item.cyberwareData.humanityCost,
        description: item.cyberwareData.description
      };
      updatedChar.cyberware = [...updatedChar.cyberware, newCyber];

      // Deduct Humanity Loss if any
      if (newCyber.humanityCost > 0) {
        updatedChar.humanityCurrent = Math.max(0, updatedChar.humanityCurrent - newCyber.humanityCost);
      }
    } else if (item.type === 'gear' && item.gearData) {
      // Check if gear with same name exists
      const existingIdx = updatedChar.gear.findIndex((g) => g.name.toLowerCase() === item.name.toLowerCase());
      if (existingIdx >= 0) {
        const copyGear = [...updatedChar.gear];
        copyGear[existingIdx] = {
          ...copyGear[existingIdx],
          quantity: copyGear[existingIdx].quantity + 1
        };
        updatedChar.gear = copyGear;
      } else {
        const newGear: GearItem = {
          id: 'gear-dp-' + Date.now(),
          name: item.gearData.name,
          category: item.gearData.category,
          quantity: 1,
          costEb: item.gearData.costEb,
          notes: item.gearData.notes
        };
        updatedChar.gear = [...updatedChar.gear, newGear];
      }
    } else if (item.type === 'vehicle' && item.vehicleData) {
      const newVeh: Vehicle = {
        id: 'veh-dp-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
        name: item.vehicleData.name,
        model: item.vehicleData.name,
        category: item.vehicleData.category,
        sdpMax: item.vehicleData.sdpMax,
        sdpCurrent: item.vehicleData.sdpMax,
        armorSp: item.vehicleData.armorSp,
        seats: item.vehicleData.seats,
        speedCombat: item.vehicleData.speedCombat,
        speedNarrative: item.vehicleData.speedNarrative,
        costEb: item.vehicleData.costEb,
        notes: lang === 'ru' ? item.vehicleData.descriptionRu : (item.vehicleData.descriptionEn || item.vehicleData.descriptionRu),
        nomadRankReq: item.vehicleData.nomadRankReq,
        upgrades: []
      };
      updatedChar.vehicles = [...(updatedChar.vehicles || []), newVeh];
    } else if (item.type === 'vehicle_upgrade' && item.vehicleUpgradeData) {
      const upgTitle = lang === 'ru' ? item.vehicleUpgradeData.nameRu : item.vehicleUpgradeData.nameEn;
      if (updatedChar.vehicles && updatedChar.vehicles.length > 0) {
        // Install on first vehicle
        const updatedVehicles = [...updatedChar.vehicles];
        const existingUpg = updatedVehicles[0].upgrades || [];
        updatedVehicles[0] = {
          ...updatedVehicles[0],
          upgrades: [...existingUpg, upgTitle]
        };
        updatedChar.vehicles = updatedVehicles;
      } else {
        // Add to gear
        const newGear: GearItem = {
          id: 'gear-vehupg-' + Date.now(),
          name: upgTitle,
          category: lang === 'ru' ? 'Модернизация ТС' : 'Vehicle Upgrade',
          quantity: 1,
          costEb: item.vehicleUpgradeData.costEb,
          notes: lang === 'ru' ? item.vehicleUpgradeData.descriptionRu : item.vehicleUpgradeData.descriptionEn
        };
        updatedChar.gear = [...updatedChar.gear, newGear];
      }
    }

    onUpdateCharacter(updatedChar);

    setPurchaseSuccessMessage(
      lang === 'ru'
        ? `Куплено: "${item.name}" (-${finalPrice} eb)`
        : `Purchased: "${item.name}" (-${finalPrice} eb)`
    );

    setTimeout(() => {
      setPurchaseSuccessMessage(null);
    }, 2800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-zinc-900 border border-red-900/80 rounded-xl w-full max-w-4xl max-h-[94dvh] sm:max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-zinc-950 px-4 py-3 border-b border-zinc-800 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-red-950/60 border border-red-600 rounded text-red-500">
              <ShoppingCart size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-orbitron font-bold text-base sm:text-lg text-red-500 uppercase tracking-wider">
                  {lang === 'ru' ? 'Рынок Найт-Сити · DataPool' : 'Night Market · DataPool'}
                </h2>
                <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded font-mono">
                  {lang === 'ru' ? '500+ предметов' : '500+ items'}
                </span>
              </div>
              <span className="text-[11px] text-zinc-400">
                {lang === 'ru'
                  ? 'Каталог снаряжения, оружия, брони и имплантов из датапула CPR'
                  : 'Official catalog of gear, weapons, armor and implants'}
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="text-zinc-400 hover:text-white p-1.5 rounded-lg hover:bg-zinc-800 transition min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        </div>

        {/* Currency & Quick Tools Bar */}
        <div className="bg-zinc-950/80 px-4 py-2.5 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Character Balance */}
          <div className="flex items-center gap-2 flex-wrap">
            <Coins size={16} className="text-yellow-400" />
            <span className="text-zinc-400 font-semibold">{lang === 'ru' ? 'Баланс персонажа:' : 'Cash balance:'}</span>
            <span className="font-orbitron font-bold text-yellow-400 text-sm">
              {character.cashEb} eb
            </span>

            {/* Quick cash adjust */}
            <div className="flex items-center gap-1 ml-1 sm:ml-2">
              <button
                onClick={() => handleAdjustCash(100)}
                className="px-2 py-1 min-h-[28px] min-w-[38px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 font-mono flex items-center justify-center transition"
                title="+100 eb"
              >
                +100
              </button>
              <button
                onClick={() => handleAdjustCash(500)}
                className="px-2 py-1 min-h-[28px] min-w-[38px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 font-mono flex items-center justify-center transition"
                title="+500 eb"
              >
                +500
              </button>
              <button
                onClick={() => handleAdjustCash(-100)}
                disabled={character.cashEb < 100}
                className="px-2 py-1 min-h-[28px] min-w-[38px] bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded text-[10px] text-zinc-300 font-mono disabled:opacity-30 flex items-center justify-center transition"
                title="-100 eb"
              >
                -100
              </button>
            </div>
          </div>

          {/* GM Mode toggle */}
          <label className="flex items-center gap-2 cursor-pointer text-zinc-300 select-none">
            <input
              type="checkbox"
              checked={isFreeMode}
              onChange={(e) => {
                sfx.playClick();
                setIsFreeMode(e.target.checked);
              }}
              className="accent-red-500 rounded cursor-pointer"
            />
            <span className="text-[11px] text-zinc-400">
              {lang === 'ru' ? 'Режим ГМ (бесплатная выдача)' : 'GM Mode (Free add)'}
            </span>
          </label>
        </div>

        {/* Purchase Notification Banner */}
        {purchaseSuccessMessage && (
          <div className="bg-emerald-950 border-b border-emerald-800 px-4 py-2 flex items-center gap-2 text-xs text-emerald-300 animate-fade-in">
            <Check size={14} className="text-emerald-400 shrink-0" />
            <span className="font-semibold">{purchaseSuccessMessage}</span>
          </div>
        )}

        {/* Search & Tabs Controls */}
        <div className="p-3 sm:p-4 bg-zinc-900 border-b border-zinc-800 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Box */}
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder={lang === 'ru' ? 'Поиск по названию или описанию...' : 'Search items...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg pl-8 pr-8 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-red-500 min-h-[38px]"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Sort Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500 min-h-[38px]"
            >
              <option value="default">{lang === 'ru' ? 'Сортировка: По умолчанию' : 'Sort: Default'}</option>
              <option value="price_asc">{lang === 'ru' ? 'Сначала дешевые' : 'Price: Low to High'}</option>
              <option value="price_desc">{lang === 'ru' ? 'Сначала дорогие' : 'Price: High to Low'}</option>
            </select>
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 text-xs overflow-x-auto touch-pan-x scrollbar-none pb-1 -mb-1">
            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab('all');
              }}
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 shrink-0 min-h-[36px] ${
                activeTab === 'all'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <span>{lang === 'ru' ? 'Все товары' : 'All'}</span>
              <span className="text-[10px] opacity-75">({allItems.length})</span>
            </button>

            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab('weapons');
              }}
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 shrink-0 min-h-[36px] ${
                activeTab === 'weapons'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Crosshair size={13} />
              <span>{lang === 'ru' ? 'Оружие' : 'Weapons'}</span>
              <span className="text-[10px] opacity-75">({DATAPOOL_WEAPONS.length})</span>
            </button>

            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab('armor');
              }}
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 shrink-0 min-h-[36px] ${
                activeTab === 'armor'
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Shield size={13} />
              <span>{lang === 'ru' ? 'Броня и щиты' : 'Armor & Shields'}</span>
              <span className="text-[10px] opacity-75">({DATAPOOL_ARMORS.length})</span>
            </button>

            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab('cyberware');
              }}
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 shrink-0 min-h-[36px] ${
                activeTab === 'cyberware'
                  ? 'bg-cyan-600 text-white shadow-md'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Cpu size={13} />
              <span>{lang === 'ru' ? 'Киберимпланты' : 'Cyberware'}</span>
              <span className="text-[10px] opacity-75">({DATAPOOL_CYBERWARE.length})</span>
            </button>

            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab('gear');
              }}
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 shrink-0 min-h-[36px] ${
                activeTab === 'gear'
                  ? 'bg-yellow-600 text-black shadow-md'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Package size={13} />
              <span>{lang === 'ru' ? 'Снаряжение' : 'Gear & Items'}</span>
              <span className="text-[10px] opacity-75">({DATAPOOL_GEAR.length})</span>
            </button>

            <button
              onClick={() => {
                sfx.playClick();
                setActiveTab('vehicles');
              }}
              className={`px-3 py-1.5 rounded font-bold transition flex items-center gap-1.5 shrink-0 min-h-[36px] ${
                activeTab === 'vehicles'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
              }`}
            >
              <Car size={13} />
              <span>{lang === 'ru' ? 'Транспорт' : 'Vehicles'}</span>
              <span className="text-[10px] opacity-75">({DATAPOOL_ALL_VEHICLES.length + DATAPOOL_VEHICLE_UPGRADES.length})</span>
            </button>
          </div>

          {/* Sub-filters for Vehicles */}
          {activeTab === 'vehicles' && (
            <div className="flex items-center gap-1.5 overflow-x-auto touch-pan-x scrollbar-none pt-1">
              <span className="text-[11px] text-zinc-400 font-semibold shrink-0">
                {lang === 'ru' ? 'Категория:' : 'Type:'}
              </span>
              {[
                { key: 'all', labelRu: 'Все', labelEn: 'All' },
                { key: 'Ground', labelRu: 'Наземный', labelEn: 'Ground' },
                { key: 'Sea', labelRu: 'Водный', labelEn: 'Sea' },
                { key: 'Air', labelRu: 'Воздушный', labelEn: 'Air' },
                { key: 'Bicycle', labelRu: 'Велосипеды', labelEn: 'Bicycles' },
                { key: 'upgrades', labelRu: 'Модернизации', labelEn: 'Upgrades' },
              ].map((sub) => (
                <button
                  key={sub.key}
                  onClick={() => {
                    sfx.playClick();
                    setVehicleSubFilter(sub.key as any);
                  }}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold transition shrink-0 ${
                    vehicleSubFilter === sub.key
                      ? 'bg-amber-500 text-black font-bold shadow'
                      : 'bg-zinc-950 text-zinc-400 hover:text-zinc-200 border border-zinc-800'
                  }`}
                >
                  {lang === 'ru' ? sub.labelRu : sub.labelEn}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Items List Content */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 text-zinc-500 space-y-2">
              <Package size={36} className="mx-auto text-zinc-600" />
              <p className="text-sm">
                {lang === 'ru' ? 'Товаров по данному запросу не найдено' : 'No items found matching query'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {filteredItems.map((item) => {
                const canAfford = isFreeMode || character.cashEb >= item.costEb;
                const isExpanded = expandedItemId === item.id;

                return (
                  <div
                    key={item.id}
                    className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-lg p-3 flex flex-col justify-between transition group"
                  >
                    <div>
                      {/* Item Title & Cost Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-xs sm:text-sm text-zinc-100 group-hover:text-red-400 transition">
                              {item.name}
                            </span>
                            <span className="text-[10px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-400">
                              {item.categoryLabel}
                            </span>
                          </div>
                        </div>

                        {/* Price Badge */}
                        <div className="text-right shrink-0">
                          <span
                            className={`font-orbitron font-bold text-xs px-2 py-0.5 rounded ${
                              canAfford
                                ? 'bg-yellow-950 text-yellow-400 border border-yellow-800/80'
                                : 'bg-red-950 text-red-400 border border-red-800/80'
                            }`}
                          >
                            {isFreeMode ? (lang === 'ru' ? '0 eb (ГМ)' : '0 eb (GM)') : `${item.costEb} eb`}
                          </span>
                        </div>
                      </div>

                      {/* Technical Specs Tags */}
                      <div className="flex flex-wrap items-center gap-1.5 my-2 font-mono text-[11px]">
                        {/* Weapon specs */}
                        {item.type === 'weapon' && item.weaponData && (
                          <>
                            <span className="bg-red-950/60 text-red-300 border border-red-800 px-1.5 py-0.5 rounded">
                              {lang === 'ru' ? 'Урон:' : 'DMG:'} <strong>{item.weaponData.damage}</strong>
                            </span>
                            <span className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-1.5 py-0.5 rounded">
                              ROF: <strong>{item.weaponData.standardRof}</strong>
                            </span>
                            {item.weaponData.magCapacity > 0 && (
                              <span className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-1.5 py-0.5 rounded">
                                {lang === 'ru' ? 'Маг:' : 'Mag:'} <strong>{item.weaponData.magCapacity}</strong>
                              </span>
                            )}
                            <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
                              {item.weaponData.ammoType}
                            </span>
                          </>
                        )}

                        {/* Armor specs */}
                        {item.type === 'armor' && item.armorData && (
                          <>
                            <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
                              {lang === 'ru' ? 'ОС:' : 'SP:'} <strong>{item.armorData.spMax}</strong>
                            </span>
                            {item.armorData.penalty !== 0 && (
                              <span className="bg-red-950 text-red-300 border border-red-800 px-1.5 py-0.5 rounded">
                                {lang === 'ru' ? 'Штраф:' : 'Pen:'} <strong>{item.armorData.penalty}</strong>
                              </span>
                            )}
                            <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
                              {item.armorData.location === 'shield' ? (lang === 'ru' ? 'Щит (HP)' : 'Shield (HP)') : item.armorData.location === 'head' ? (lang === 'ru' ? 'Голова' : 'Head') : (lang === 'ru' ? 'Тело' : 'Body')}
                            </span>
                          </>
                        )}

                        {/* Cyberware specs */}
                        {item.type === 'cyberware' && item.cyberwareData && (
                          <>
                            <span className="bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">
                              {lang === 'ru' ? 'Потеря ПЧ:' : 'HL:'} <strong>{item.cyberwareData.humanityCostFormula || item.cyberwareData.humanityCost}</strong>
                            </span>
                            <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
                              {item.cyberwareData.installLocation}
                            </span>
                          </>
                        )}

                        {/* Vehicle specs */}
                        {item.type === 'vehicle' && item.vehicleData && (
                          <>
                            <span className="bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                              {lang === 'ru' ? 'ПЗТ:' : 'SDP:'} <strong>{item.vehicleData.sdpMax}</strong>
                            </span>
                            <span className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-1.5 py-0.5 rounded">
                              {lang === 'ru' ? 'Мест:' : 'Seats:'} <strong>{item.vehicleData.seats}</strong>
                            </span>
                            <span className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-1.5 py-0.5 rounded">
                              {item.vehicleData.speedCombat}
                            </span>
                            <span className="bg-zinc-900 text-zinc-400 border border-zinc-800 px-1.5 py-0.5 rounded">
                              {item.vehicleData.speedNarrative}
                            </span>
                            {item.vehicleData.armorSp !== undefined && item.vehicleData.armorSp > 0 && (
                              <span className="bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
                                {lang === 'ru' ? 'ОС:' : 'SP:'} <strong>{item.vehicleData.armorSp}</strong>
                              </span>
                            )}
                            {item.vehicleData.nomadRankReq !== undefined && item.vehicleData.nomadRankReq > 0 && (
                              <span className="bg-purple-950 text-purple-300 border border-purple-800 px-1.5 py-0.5 rounded">
                                {lang === 'ru' ? `Кочевник ${item.vehicleData.nomadRankReq}` : `Nomad ${item.vehicleData.nomadRankReq}`}
                              </span>
                            )}
                          </>
                        )}

                        {/* Vehicle Upgrade specs */}
                        {item.type === 'vehicle_upgrade' && item.vehicleUpgradeData && (
                          <>
                            <span className="bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.5 rounded">
                              {lang === 'ru' ? `Кочевник ${item.vehicleUpgradeData.nomadRank}` : `Nomad ${item.vehicleUpgradeData.nomadRank}`}
                            </span>
                            <span className="bg-zinc-900 text-zinc-300 border border-zinc-800 px-1.5 py-0.5 rounded">
                              {item.vehicleUpgradeData.applicableCategory}
                            </span>
                          </>
                        )}
                      </div>

                      {/* Description */}
                      {item.description && (
                        <div className="text-[11px] text-zinc-400 my-1.5 leading-relaxed">
                          <p className={isExpanded ? '' : 'line-clamp-2'}>
                            {item.description}
                          </p>
                          {item.description.length > 90 && (
                            <button
                              onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                              className="text-red-400 hover:text-red-300 text-[10px] mt-0.5 flex items-center gap-0.5 font-semibold"
                            >
                              {isExpanded ? (
                                <>
                                  <span>{lang === 'ru' ? 'Свернуть' : 'Collapse'}</span>
                                  <ChevronUp size={12} />
                                </>
                              ) : (
                                <>
                                  <span>{lang === 'ru' ? 'Подробнее' : 'Details'}</span>
                                  <ChevronDown size={12} />
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Buy Action Button */}
                    <div className="pt-2 border-t border-zinc-900 flex items-center justify-between gap-2 mt-2">
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {item.type === 'cyberware' && item.cyberwareData?.humanityCost ? `-${item.cyberwareData.humanityCost} ${lang === 'ru' ? 'Человечности' : 'Humanity'}` : ''}
                      </span>

                      <button
                        onClick={() => handleBuyItem(item)}
                        disabled={!canAfford}
                        className={`flex items-center gap-1.5 px-3.5 py-1.5 min-h-[36px] rounded text-xs font-bold font-orbitron uppercase tracking-wider transition ${
                          canAfford
                            ? 'bg-red-600 hover:bg-red-500 text-white shadow'
                            : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                        }`}
                      >
                        <ShoppingCart size={13} />
                        <span>{lang === 'ru' ? 'Купить' : 'Buy'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-zinc-950 px-4 py-2.5 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div className="flex items-center gap-1 text-[11px]">
            <span>{lang === 'ru' ? `Показано: ${filteredItems.length} товаров` : `Showing: ${filteredItems.length} items`}</span>
            <span className="text-zinc-600">•</span>
            <a
              href="https://alec-leon.github.io/data-pool/"
              target="_blank"
              rel="noreferrer"
              className="text-red-400 hover:underline flex items-center gap-1"
            >
              <span>DataPool CPR</span>
              <ExternalLink size={11} />
            </a>
          </div>

          <button
            onClick={() => {
              sfx.playClick();
              onClose();
            }}
            className="px-4 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded font-bold transition"
          >
            {lang === 'ru' ? 'Закрыть' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
