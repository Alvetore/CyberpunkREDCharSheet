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

export type VehicleUpgradeCategoryRule =
  | 'any'
  | 'all-except-moto-hydro-gyro'
  | 'ground-sea'
  | 'ground-sea-except-moto-hydro'
  | 'ground'
  | 'motorcycles'
  | 'cars'
  | 'living-quarters';

export interface CatalogVehicleUpgrade {
  id: string;
  nameRu: string;
  nameEn: string;
  nomadRank: number;
  costEb: number;
  descriptionRu: string;
  descriptionEn: string;
  applicableCategory: string;
  /** Structured compatibility rule; applicableCategory is the display label. */
  categoryRule: VehicleUpgradeCategoryRule;
  /** Another upgrade that must already be installed (by catalog id). */
  requiresUpgradeId?: string;
  /** Body types that additionally need requiresUpgradeId. */
  requiresUpgradeForBodyTypes?: string[];
  /** Core p.163 allows repeat installation only where the entry says so. */
  repeatable?: boolean;
}

// Core pp.163-165 and Interface p.365: ranks, prices and vehicle categories.
export const DATAPOOL_VEHICLE_UPGRADES: CatalogVehicleUpgrade[] = [
  {
    "id": "upg-armored-chassis",
    "nameRu": "Бронированное шасси (Armored Chassis)",
    "nameEn": "Armored Chassis",
    "nomadRank": 5,
    "costEb": 5000,
    "descriptionRu": "Бронирует транспорт до ОС 13. Не влияет на стёкла.",
    "descriptionEn": "Armors the vehicle up to SP 13. Does not affect windows.",
    "applicableCategory": "Любой транспорт",
    "categoryRule": "any"
  },
  {
    "id": "upg-bulletproof-glass",
    "nameRu": "Пуленепробиваемое стекло (Bulletproof Glass)",
    "nameEn": "Bulletproof Glass",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Все окна считаются укрытием: тонкое стекло имеет 15 ПЗ. Повторная установка делает его толстым (30 ПЗ). Каждое окно получает урон отдельно.",
    "descriptionEn": "All windows count as cover: thin glass has 15 HP. Installing it again makes it thick (30 HP). Each window takes damage separately.",
    "applicableCategory": "Любой транспорт",
    "categoryRule": "any",
    "repeatable": true
  },
  {
    "id": "upg-comms-center",
    "nameRu": "Коммуникационный центр (Communications Center)",
    "nameEn": "Communications Center",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Сенсорная консоль со встроенным агентом и хранилищем: 6 раций, 6 шифраторов/дешифраторов, радиосканер/плеер, трекер с 6 маячками и диктофон.",
    "descriptionEn": "Touch console with a built-in agent and storage: 6 radios, 6 scramblers/decryptors, radio scanner/player, tracker with 6 beacons and a recorder.",
    "applicableCategory": "Любой транспорт",
    "categoryRule": "any"
  },
  {
    "id": "upg-nos",
    "nameRu": "Система закиси азота NOS (Nitrous Boost)",
    "nameEn": "NOS System",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Позволяет потратить действие, чтобы получить дополнительное действие перемещения при управлении. Каждый баллон используется раз в день; дополнительная установка добавляет баллон.",
    "descriptionEn": "Spend an Action to gain an extra Move Action while driving. Each canister works once per day; installing it again adds another canister.",
    "applicableCategory": "Любой транспорт",
    "categoryRule": "any",
    "repeatable": true
  },
  {
    "id": "upg-mounted-flamethrower",
    "nameRu": "Встроенный огнемёт (Mounted Flamethrower)",
    "nameEn": "Mounted Flamethrower",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Огнемёт снаружи спереди, сбоку или сзади. Водитель стреляет действием; нельзя перезаряжать в движении. Можно установить несколько раз.",
    "descriptionEn": "Exterior flamethrower front, side or rear. The driver fires it with an Action; it cannot reload while moving. Can be installed several times.",
    "applicableCategory": "Любой транспорт",
    "categoryRule": "any",
    "repeatable": true
  },
  {
    "id": "upg-mounted-smg",
    "nameRu": "Встроенный пулемёт (Mounted Machine Gun)",
    "nameEn": "Mounted Machine Gun",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Штурмовая винтовка на 30 патронов спереди снаружи, только автоматический огонь. Водитель стреляет действием; нельзя перезаряжать в движении. Можно установить несколько раз.",
    "descriptionEn": "Front-mounted 30-round assault rifle, autofire only. The driver fires it with an Action; it cannot reload while moving. Can be installed several times.",
    "applicableCategory": "Любой транспорт",
    "categoryRule": "any",
    "repeatable": true
  },
  {
    "id": "upg-seat-module",
    "nameRu": "Модуль сидений (Seat Module)",
    "nameEn": "Seat Module",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Добавляет два посадочных места; место можно оснастить катапультой. Можно устанавливать несколько раз, кроме мотоциклов, гидроциклов и гирокоптеров.",
    "descriptionEn": "Adds two seats; a seat can be fitted with an ejection system. Can be installed several times, except on motorcycles, hydrocycles and gyrocopters.",
    "applicableCategory": "Любой кроме мотоциклов, гидроциклов и гирокоптеров",
    "categoryRule": "all-except-moto-hydro-gyro",
    "repeatable": true
  },
  {
    "id": "upg-security-system",
    "nameRu": "Модуль безопасности (Security Module)",
    "nameEn": "Security Module",
    "nomadRank": 5,
    "costEb": 5000,
    "descriptionRu": "Биометрические замки с электрошоком при взломе и активный камуфляж: неподвижный транспорт обнаруживается только проверкой Восприятия СЛ17.",
    "descriptionEn": "Biometric locks with a shock on tampering and active camouflage: a stationary vehicle is found only with a DV 17 Perception check.",
    "applicableCategory": "Любой транспорт",
    "categoryRule": "any"
  },
  {
    "id": "upg-smuggle-compartment",
    "nameRu": "Модуль контрабанды (Smuggling Module)",
    "nameEn": "Smuggling Module",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Две скрытые кобуры для водителя и пассажира и крупный тайник. Обнаружение только проверкой Скрыть/Обнаружить предмет СЛ17. Можно устанавливать несколько раз.",
    "descriptionEn": "Two concealed holsters for the driver and a passenger plus a large hidden compartment. Found only with a DV 17 Conceal/Reveal Object check. Can be installed several times.",
    "applicableCategory": "Любой кроме мотоциклов, гидроциклов и гирокоптеров",
    "categoryRule": "all-except-moto-hydro-gyro",
    "repeatable": true
  },
  {
    "id": "upg-reinforced-chassis",
    "nameRu": "Тяжёлое шасси (Heavy Chassis)",
    "nameEn": "Heavy Chassis",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Добавляет +20 ПСП и позволяет буксировать до 10 тонн. Обязательное требование для тяжёлого вооружения.",
    "descriptionEn": "Adds +20 SDP and allows towing up to 10 tons. Required for heavy weapon upgrades.",
    "applicableCategory": "Любой кроме мотоциклов, гидроциклов и гирокоптеров",
    "categoryRule": "all-except-moto-hydro-gyro"
  },
  {
    "id": "upg-rocket-pod",
    "nameRu": "Встроенная ракетница (Mounted Rocket Pod)",
    "nameEn": "Mounted Rocket Pod",
    "nomadRank": 5,
    "costEb": 5000,
    "descriptionRu": "Ракетница с барабаном на 3 ракеты спереди снаружи. Водитель стреляет действием; нельзя перезаряжать в движении. Требует тяжёлое шасси. Можно установить несколько раз.",
    "descriptionEn": "Front-mounted 3-rocket pod. The driver fires it with an Action; it cannot reload while moving. Requires Heavy Chassis. Can be installed several times.",
    "applicableCategory": "Любой кроме мотоциклов, гидроциклов и гирокоптеров",
    "categoryRule": "all-except-moto-hydro-gyro",
    "requiresUpgradeId": "upg-reinforced-chassis",
    "repeatable": true
  },
  {
    "id": "upg-heavy-mount",
    "nameRu": "Крепление для тяжёлого оружия (Heavy Weapon Mount)",
    "nameEn": "Heavy Weapon Mount",
    "nomadRank": 5,
    "costEb": 5000,
    "descriptionRu": "Поворотная турель вместо одного сиденья для любого двуручного дальнобойного оружия. Пассажир стреляет и перезаряжает в движении. Требует тяжёлое шасси. Первое оружие предоставляет семья.",
    "descriptionEn": "Pivoting turret replacing one seat for any two-handed ranged weapon. A passenger fires and reloads while moving. Requires Heavy Chassis. The family provides the first weapon.",
    "applicableCategory": "Любой кроме мотоциклов, гидроциклов и гирокоптеров",
    "categoryRule": "all-except-moto-hydro-gyro",
    "requiresUpgradeId": "upg-reinforced-chassis",
    "repeatable": true
  },
  {
    "id": "upg-mounted-melee",
    "nameRu": "Встроенное холодное оружие (Mounted Melee Weapon)",
    "nameEn": "Mounted Melee Weapon",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Очень тяжёлое холодное оружие снаружи спереди, сбоку или сзади. Водитель атакует действием; оружие нельзя снять. Можно установить несколько раз.",
    "descriptionEn": "Very heavy melee weapon mounted outside front, side or rear. The driver attacks with an Action; the weapon cannot be removed. Can be installed several times.",
    "applicableCategory": "Весь наземный и морской транспорт",
    "categoryRule": "ground-sea",
    "repeatable": true
  },
  {
    "id": "upg-air-cushion",
    "nameRu": "Воздушная подушка (Air Cushion)",
    "nameEn": "Air Cushion",
    "nomadRank": 5,
    "costEb": 5000,
    "descriptionRu": "Вентиляторы в нижней части позволяют наземному транспорту двигаться по воде со скоростью круизного катера.",
    "descriptionEn": "Fans under the hull let a ground vehicle travel over water at cruising-boat speed.",
    "applicableCategory": "Весь наземный транспорт",
    "categoryRule": "ground"
  },
  {
    "id": "upg-av4-engine",
    "nameRu": "Двигатель от AV-4 (AV-4 Engine)",
    "nameEn": "AV-4 Engine",
    "nomadRank": 7,
    "costEb": 5000,
    "descriptionRu": "Турбовентиляторный двигатель с векторной тягой позволяет летать. В воздухе транспорт считается AV-4 и управляется навыком пилотирования.",
    "descriptionEn": "A vectored-thrust turbofan lets the vehicle fly. In the air it counts as an AV-4 and is piloted with the Pilot skill.",
    "applicableCategory": "Весь наземный транспорт",
    "categoryRule": "ground"
  },
  {
    "id": "upg-combat-ram",
    "nameRu": "Боевой таран (Combat Ram)",
    "nameEn": "Combat Ram",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "При таране передней частью транспорт не получает урона, а экипаж не получает хлыстовую травму шеи. С ускорением NOS урон тарана +2d6.",
    "descriptionEn": "When ramming with the front, the vehicle takes no damage and the crew avoids whiplash. With NOS active, ram damage increases by 2d6.",
    "applicableCategory": "Весь наземный и морской транспорт, кроме мотоциклов и гидроциклов",
    "categoryRule": "ground-sea-except-moto-hydro"
  },
  {
    "id": "upg-interface-control",
    "nameRu": "Улучшенная интеграция с интерфейсным разъёмом",
    "nameEn": "Improved Interface Plug Integration",
    "nomadRank": 5,
    "costEb": 5000,
    "descriptionRu": "При управлении мотоциклом через интерфейсный разъём и РЕФ 8+ можно уклоняться от атак, как пешком; защита распространяется и на пассажира.",
    "descriptionEn": "When driving a motorcycle through an interface plug with REF 8+, you can dodge attacks as if on foot; the chosen defense also protects the passenger.",
    "applicableCategory": "Все мотоциклы",
    "categoryRule": "motorcycles"
  },
  {
    "id": "upg-spike-strip",
    "nameRu": "Развёртываемая полоса с шипами",
    "nameEn": "Deployable Spike Strip",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Разворачивается водителем действием. Преследователь на шинах проходит Вождение СЛ17 или получает 4d6 по уязвимой точке. Запасная лента стоит 10 eb.",
    "descriptionEn": "Deployed by the driver with an Action. A pursuing wheeled vehicle must pass a DV 17 Drive check or take 4d6 to a weak point. A spare strip costs 10 eb.",
    "applicableCategory": "Все автомобили",
    "categoryRule": "cars"
  },
  {
    "id": "upg-living-quarters",
    "nameRu": "Жилой отсек (Living Quarters)",
    "nameEn": "Living Quarters",
    "nomadRank": 1,
    "costEb": 1000,
    "descriptionRu": "Спальное место, туалет, душ и небольшая кухня; для круизного катера, яхты или аэрозепа добавляет помещение. Для автомобиля и спорткара требует тяжёлое шасси.",
    "descriptionEn": "A bunk, toilet, shower and small kitchen; adds a room to a cruise boat, yacht or aerozep. Cars and sportscars require Heavy Chassis.",
    "applicableCategory": "Автомобили, AV-4, круизные катера, яхты, аэрозепы",
    "categoryRule": "living-quarters",
    "requiresUpgradeId": "upg-reinforced-chassis",
    "requiresUpgradeForBodyTypes": ["car", "sportscar"]
  }
];

export const DATAPOOL_ALL_VEHICLES = VEHICLE_CATALOG;
export const DATAPOOL_GROUND_VEHICLES = VEHICLE_CATALOG.filter(item => item.category === 'Ground');
export const DATAPOOL_SEA_VEHICLES = VEHICLE_CATALOG.filter(item => item.category === 'Sea');
export const DATAPOOL_AIR_VEHICLES = VEHICLE_CATALOG.filter(item => item.category === 'Air');
export const DATAPOOL_BICYCLES = VEHICLE_CATALOG.filter(item => item.category === 'Bicycle');
