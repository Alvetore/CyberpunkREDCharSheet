import { VehicleCategory } from '../types/character';
import { VEHICLE_CATALOG } from './vehicleCatalog';

export interface CatalogVehicleItem {
  id: string;
  catalogId: string;
  sourceUrl: string;
  priceLabel: string;
  nomadRankLabel?: string;
  name: string;
  nameEn: string;
  category: VehicleCategory;
  typeLabelRu: string;
  typeLabelEn: string;
  sdpMax: number;
  armorSp?: number;
  seats: number | string;
  speedCombat: string;
  speedNarrative: string;
  costEb: number;
  descriptionRu: string;
  descriptionEn: string;
  nomadRankReq?: number;
}

export interface CatalogVehicleUpgrade {
  id: string;
  nameRu: string;
  nameEn: string;
  nomadRank: number;
  costEb: number;
  descriptionRu: string;
  descriptionEn: string;
  applicableCategory: string;
}

export const DATAPOOL_VEHICLE_UPGRADES: CatalogVehicleUpgrade[] = [
  {
    "id": "upg-bulletproof-glass",
    "nameRu": "Пуленепробиваемое стекло (Bulletproof Glass)",
    "nameEn": "Bulletproof Glass",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Бронированные стекла для всех окон транспорта. Стекла имеют 15 ПСП и защищают находящихся внутри от выстрелов снаружи.",
    "descriptionEn": "Armored windows for all vehicle openings. Glass has 15 SDP protecting occupants from small-arms fire.",
    "applicableCategory": "Любой транспорт"
  },
  {
    "id": "upg-reinforced-chassis",
    "nameRu": "Усиленное шасси (Reinforced Chassis)",
    "nameEn": "Reinforced Chassis",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Добавляет транспорту +20 ПСП. Позволяет буксировать до 10 тонн груза. Необходимо для установки тяжёлого вооружения.",
    "descriptionEn": "Adds +20 SDP to vehicle. Allows towing up to 10 tons. Prerequisite for heavy weapon mounts.",
    "applicableCategory": "Любой наземный и водный"
  },
  {
    "id": "upg-nos",
    "nameRu": "Система закиси азота NOS (Nitrous Boost)",
    "nameEn": "NOS System",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Позволяет один раз за бой удвоить скорость транспорта на 1 раунд.",
    "descriptionEn": "Allows doubling vehicle speed for 1 round once per combat engagement.",
    "applicableCategory": "Сухопутный и водный"
  },
  {
    "id": "upg-mounted-smg",
    "nameRu": "Встроенный автомат (Mounted Assault Rifle)",
    "nameEn": "Mounted Assault Rifle",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Штурмовая винтовка на 30 патронов спереди транспорта, управляемая водителем (стреляет очередью).",
    "descriptionEn": "Front-mounted 30-round assault rifle operated by driver using an Action (autofire only).",
    "applicableCategory": "Сухопутный"
  },
  {
    "id": "upg-mounted-flamethrower",
    "nameRu": "Встроенный огнемёт (Mounted Flamethrower)",
    "nameEn": "Mounted Flamethrower",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Устанавливается с любой стороны транспорта. Наносит урон огнём по площади (конус 4 клетки).",
    "descriptionEn": "Mounted on any side of the vehicle. Deals area fire damage in a cone.",
    "applicableCategory": "Любой кроме мотоциклов"
  },
  {
    "id": "upg-heavy-mount",
    "nameRu": "Крепление для тяжёлого оружия (Heavy Weapon Mount)",
    "nameEn": "Heavy Weapon Mount",
    "nomadRank": 5,
    "costEb": 5000,
    "descriptionRu": "Вращающаяся турель для установки станкового пулемета, ракетницы, рельсотрона или гранатомета на крыше или борту.",
    "descriptionEn": "Pivoting 360-degree turret for mounting heavy machine guns, rocket pods, or grenade launchers.",
    "applicableCategory": "Требуется Усиленное шасси"
  },
  {
    "id": "upg-rocket-pod",
    "nameRu": "Встроенный ракетный блок (Mounted Rocket Pod)",
    "nameEn": "Mounted Rocket Pod",
    "nomadRank": 5,
    "costEb": 5000,
    "descriptionRu": "Ракетная установка на 3 ракеты спереди транспорта. Требует усиленное шасси.",
    "descriptionEn": "3-rocket pod mounted forward. Operated by driver. Requires Reinforced Chassis.",
    "applicableCategory": "Требуется Усиленное шасси"
  },
  {
    "id": "upg-security-system",
    "nameRu": "Охранная биометрическая система и камуфляж",
    "nameEn": "Biometric Security & Active Camo",
    "nomadRank": 5,
    "costEb": 5000,
    "descriptionRu": "ДНК/биометрические замки (удар шоком при взломе) и функция активной оптической маскировки в неподвижном состоянии (Внимательность СЛ17).",
    "descriptionEn": "DNA/biometric shock locks plus active optical camouflage projection when stationary (Perception DV 17).",
    "applicableCategory": "Любой транспорт"
  },
  {
    "id": "upg-smuggle-compartment",
    "nameRu": "Тайник для контрабанды и скрытые кобуры",
    "nameEn": "Smuggling Compartment & Concealed Holsters",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Две скрытые кобуры для быстрого доставания оружия и потайной герметичный отсек для нелегальных грузов (СЛ17 поиска).",
    "descriptionEn": "Two concealed holsters for rapid draw and a hidden compartment for contraband (Search DV 17).",
    "applicableCategory": "Любой кроме мотоциклов"
  },
  {
    "id": "upg-sealed-hull",
    "nameRu": "Герметичный корпус (NBC / Gas Sealed Hull)",
    "nameEn": "Hermetically Sealed Hull",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Герметизирует салон. Защищает пассажиров от токсичных газов, кислотных дождей и биоатак.",
    "descriptionEn": "Air-tight environmental seal protecting passengers from toxic gases, chemical plumes, and acid rain.",
    "applicableCategory": "Любой кроме мотоциклов"
  },
  {
    "id": "upg-living-quarters",
    "nameRu": "Жилой отсек (Living Quarters)",
    "nameEn": "Living Quarters",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Оборудует салон спальным местом, кухонным модулем и хранилищем. Заменяет аренду жилья!",
    "descriptionEn": "Equips interior with sleeping bunk, mini-galley, and storage. Counts as housing lifestyle!",
    "applicableCategory": "Фургоны, катера, автобусы, тягачи"
  },
  {
    "id": "upg-interface-control",
    "nameRu": "Интерфейсный разъём управления (Interface Plug Drive)",
    "nameEn": "Interface Plug Drive Integration",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Прямое нейроуправление транспортом через штекеры интерфейса водителя (+2 ко всем проверкам вождения).",
    "descriptionEn": "Direct neural link control through Interface Plugs (+2 to all Drive/Pilot checks).",
    "applicableCategory": "Любой транспорт"
  }
];

export const DATAPOOL_ALL_VEHICLES = VEHICLE_CATALOG;
export const DATAPOOL_GROUND_VEHICLES = VEHICLE_CATALOG.filter(item => item.category === 'Ground');
export const DATAPOOL_SEA_VEHICLES = VEHICLE_CATALOG.filter(item => item.category === 'Sea');
export const DATAPOOL_AIR_VEHICLES = VEHICLE_CATALOG.filter(item => item.category === 'Air');
export const DATAPOOL_BICYCLES = VEHICLE_CATALOG.filter(item => item.category === 'Bicycle');
