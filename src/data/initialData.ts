import { Skill, CriticalInjury, Weapon, ProgramItem, ArmorItem, Character } from '../types/character';

export const CPR_SKILLS: Omit<Skill, 'level'>[] = [
  // Awareness Skills
  { id: 'concentration', nameRu: 'Концентрация', nameEn: 'Concentration', stat: 'WILL', category: 'Awareness', multiplier: 1 },
  { id: 'conceal_reveal', nameRu: 'Маскировка/Поиск предметов', nameEn: 'Conceal/Reveal Object', stat: 'INT', category: 'Awareness', multiplier: 1 },
  { id: 'lip_reading', nameRu: 'Чтение по губам', nameEn: 'Lip Reading', stat: 'INT', category: 'Awareness', multiplier: 1 },
  { id: 'perception', nameRu: 'Восприятие', nameEn: 'Perception', stat: 'INT', category: 'Awareness', multiplier: 1 },
  { id: 'tracking', nameRu: 'Слежка/Выслеживание', nameEn: 'Tracking', stat: 'INT', category: 'Awareness', multiplier: 1 },

  // Body Skills
  { id: 'athletics', nameRu: 'Атлетика', nameEn: 'Athletics', stat: 'DEX', category: 'Body', multiplier: 1 },
  { id: 'contortionist', nameRu: 'Изворотливость/Акробатика', nameEn: 'Contortionist', stat: 'DEX', category: 'Body', multiplier: 1 },
  { id: 'dance', nameRu: 'Танцы', nameEn: 'Dance', stat: 'DEX', category: 'Body', multiplier: 1 },
  { id: 'endurance', nameRu: 'Выносливость', nameEn: 'Endurance', stat: 'WILL', category: 'Body', multiplier: 1 },
  { id: 'resist_torture', nameRu: 'Сопротивление пыткам/веществам', nameEn: 'Resist Torture/Drugs', stat: 'WILL', category: 'Body', multiplier: 1 },
  { id: 'stealth', nameRu: 'Скрытность', nameEn: 'Stealth', stat: 'DEX', category: 'Body', multiplier: 1 },

  // Control Skills
  { id: 'drive_land', nameRu: 'Вождение (наземный транспорт)', nameEn: 'Drive Land Vehicle', stat: 'REF', category: 'Control', multiplier: 1 },
  { id: 'pilot_air', nameRu: 'Пилотирование (воздушный)', nameEn: 'Pilot Air Vehicle', stat: 'REF', category: 'Control', multiplier: 2 },
  { id: 'pilot_sea', nameRu: 'Пилотирование (водный)', nameEn: 'Pilot Sea Vehicle', stat: 'REF', category: 'Control', multiplier: 1 },
  { id: 'riding', nameRu: 'Верховая езда', nameEn: 'Riding', stat: 'REF', category: 'Control', multiplier: 1 },

  // Education Skills
  { id: 'accounting', nameRu: 'Бухгалтерия', nameEn: 'Accounting', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'animal_handling', nameRu: 'Дрессировка животных', nameEn: 'Animal Handling', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'bureaucracy', nameRu: 'Бюрократия', nameEn: 'Bureaucracy', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'business', nameRu: 'Бизнес/Коммерция', nameEn: 'Business', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'composition', nameRu: 'Сочинение/Тексты', nameEn: 'Composition', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'criminology', nameRu: 'Криминалистика', nameEn: 'Criminology', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'cryptography', nameRu: 'Криптография', nameEn: 'Cryptography', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'deduction', nameRu: 'Дедукция', nameEn: 'Deduction', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'education', nameRu: 'Общее образование', nameEn: 'Education', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'gamble', nameRu: 'Азартные игры', nameEn: 'Gamble', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'language_streetslang', nameRu: 'Язык (Уличный сленг)', nameEn: 'Language (Streetslang)', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'library_search', nameRu: 'Поиск в базах данных', nameEn: 'Library Search', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'local_expert', nameRu: 'Местный эксперт (Свой район)', nameEn: 'Local Expert (Home District)', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'science', nameRu: 'Наука', nameEn: 'Science', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'tactics', nameRu: 'Тактика', nameEn: 'Tactics', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'wilderness_survival', nameRu: 'Выживание в пустошах', nameEn: 'Wilderness Survival', stat: 'INT', category: 'Education', multiplier: 1 },

  // Fighting Skills
  { id: 'brawling', nameRu: 'Мордобой (Драка)', nameEn: 'Brawling', stat: 'DEX', category: 'Fighting', multiplier: 1 },
  { id: 'evasion', nameRu: 'Уклонение', nameEn: 'Evasion', stat: 'DEX', category: 'Fighting', multiplier: 1 },
  { id: 'martial_arts', nameRu: 'Боевые искусства', nameEn: 'Martial Arts', stat: 'DEX', category: 'Fighting', multiplier: 2 },
  { id: 'melee_weapon', nameRu: 'Холодное оружие', nameEn: 'Melee Weapon', stat: 'DEX', category: 'Fighting', multiplier: 1 },

  // Performance Skills
  { id: 'acting', nameRu: 'Актерская игра', nameEn: 'Acting', stat: 'COOL', category: 'Performance', multiplier: 1 },
  { id: 'play_instrument', nameRu: 'Музыкальный инструмент', nameEn: 'Play Instrument', stat: 'TECH', category: 'Performance', multiplier: 1 },

  // Ranged Weapon Skills
  { id: 'archery', nameRu: 'Стрельба из лука/арбалета', nameEn: 'Archery', stat: 'REF', category: 'Ranged', multiplier: 1 },
  { id: 'autofire', nameRu: 'Стрельба очередями (Autofire)', nameEn: 'Autofire', stat: 'REF', category: 'Ranged', multiplier: 2 },
  { id: 'handgun', nameRu: 'Пистолеты (Короткоствол)', nameEn: 'Handgun', stat: 'REF', category: 'Ranged', multiplier: 1 },
  { id: 'heavy_weapons', nameRu: 'Тяжелое оружие', nameEn: 'Heavy Weapons', stat: 'REF', category: 'Ranged', multiplier: 2 },
  { id: 'shoulder_arms', nameRu: 'Длинноствольное оружие (Винтовки)', nameEn: 'Shoulder Arms', stat: 'REF', category: 'Ranged', multiplier: 1 },

  // Social Skills
  { id: 'bribery', nameRu: 'Подкуп/Взятки', nameEn: 'Bribery', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'conversation', nameRu: 'Беседа/Разговор', nameEn: 'Conversation', stat: 'EMP', category: 'Social', multiplier: 1 },
  { id: 'human_perception', nameRu: 'Проницательность', nameEn: 'Human Perception', stat: 'EMP', category: 'Social', multiplier: 1 },
  { id: 'interrogation', nameRu: 'Допрос', nameEn: 'Interrogation', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'persuasion', nameRu: 'Убеждение', nameEn: 'Persuasion', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'personal_grooming', nameRu: 'Личный уход', nameEn: 'Personal Grooming', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'streetwise', nameRu: 'Уличное чутье', nameEn: 'Streetwise', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'trading', nameRu: 'Торговля', nameEn: 'Trading', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'wardrobe_style', nameRu: 'Стиль и гардероб', nameEn: 'Wardrobe & Style', stat: 'COOL', category: 'Social', multiplier: 1 },

  // Technique Skills
  { id: 'air_vehicle_tech', nameRu: 'Техника: воздушный транспорт', nameEn: 'Air Vehicle Tech', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'basic_tech', nameRu: 'Базовая техника', nameEn: 'Basic Tech', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'cybertech', nameRu: 'Кибертехника', nameEn: 'Cybertech', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'demolitions', nameRu: 'Взрывное дело', nameEn: 'Demolitions', stat: 'TECH', category: 'Technique', multiplier: 2 },
  { id: 'electronics_security', nameRu: 'Электроника и безопасность', nameEn: 'Electronics/Security Tech', stat: 'TECH', category: 'Technique', multiplier: 2 },
  { id: 'first_aid', nameRu: 'Первая помощь', nameEn: 'First Aid', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'forgery', nameRu: 'Подделка документов', nameEn: 'Forgery', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'land_vehicle_tech', nameRu: 'Техника: наземный транспорт', nameEn: 'Land Vehicle Tech', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'paint_draw_sculpt', nameRu: 'Живопись/Скульптура', nameEn: 'Paint/Draw/Sculpt', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'paramedic', nameRu: 'Парамедик', nameEn: 'Paramedic', stat: 'TECH', category: 'Technique', multiplier: 2 },
  { id: 'photography_film', nameRu: 'Фото- и видеосъемка', nameEn: 'Photography/Film', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'pick_lock', nameRu: 'Взлом механических замков', nameEn: 'Pick Lock', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'pick_pocket', nameRu: 'Карманная кража', nameEn: 'Pick Pocket', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'sea_vehicle_tech', nameRu: 'Техника: водный транспорт', nameEn: 'Sea Vehicle Tech', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'weaponstech', nameRu: 'Оружейное дело', nameEn: 'Weaponstech', stat: 'TECH', category: 'Technique', multiplier: 1 },
];

export const CPR_CRITICAL_INJURIES: Omit<CriticalInjury, 'id' | 'isActive'>[] = [
  // Head Injuries (Roll 2d6)
  {
    rollNumber: 2,
    location: 'head',
    nameRu: 'Потеря глаза',
    nameEn: 'Lost Eye',
    effectRu: '-4 ко всем проверкам Стрельбы и Восприятия, требующим зрения. Если потеряны оба глаза — слепота.',
    effectEn: '-4 to all Ranged and sight-based Perception checks. Blinded if both lost.',
    quickFixDv: 0,
    treatmentDv: 17
  },
  {
    rollNumber: 3,
    location: 'head',
    nameRu: 'Травма мозга',
    nameEn: 'Brain Injury',
    effectRu: '-2 ко всем проверкам действий, требующим характеристику INT, TECH, или WILL.',
    effectEn: '-2 to all Actions involving INT, TECH, or WILL.',
    quickFixDv: 0,
    treatmentDv: 17
  },
  {
    rollNumber: 4,
    location: 'head',
    nameRu: 'Сотрясение мозга',
    nameEn: 'Concussion',
    effectRu: '-2 ко всем действиям персонажа.',
    effectEn: '-2 to all Actions.',
    quickFixDv: 13,
    treatmentDv: 15
  },
  {
    rollNumber: 5,
    location: 'head',
    nameRu: 'Перелом челюсти',
    nameEn: 'Broken Jaw',
    effectRu: '-4 ко всем проверкам, включающим разговорную речь.',
    effectEn: '-4 to all Actions involving speech.',
    quickFixDv: 13,
    treatmentDv: 15
  },
  {
    rollNumber: 6,
    location: 'head',
    nameRu: 'Инородное тело в черепе',
    nameEn: 'Foreign Object (Head)',
    effectRu: 'Получаете 1 прямой урон каждый раз, когда двигаетесь быстрее шага.',
    effectEn: 'Take 1 damage directly to HP whenever you move more than 4m on foot.',
    quickFixDv: 13,
    treatmentDv: 15
  },
  {
    rollNumber: 7,
    location: 'head',
    nameRu: 'Хлыстовая травма шеи',
    nameEn: 'Whiplash',
    effectRu: '-2 ко всем действиям персонажа до конца следующего раунда.',
    effectEn: '-2 to all Actions until the end of your next turn.',
    quickFixDv: 13,
    treatmentDv: 13
  },
  {
    rollNumber: 8,
    location: 'head',
    nameRu: 'Треснувший череп',
    nameEn: 'Cracked Skull',
    effectRu: 'Прицельные выстрелы в голову наносят множитель урона x3 вместо x2.',
    effectEn: 'Aimed Shots to the head multiply damage by 3 instead of 2.',
    quickFixDv: 0,
    treatmentDv: 15
  },
  {
    rollNumber: 9,
    location: 'head',
    nameRu: 'Повреждение лица',
    nameEn: 'Facial Disfigurement',
    effectRu: '-2 ко всем социальным проверкам, требующим привлекательности или первого впечатления.',
    effectEn: '-2 to Wardrobe & Style and Personal Grooming checks.',
    quickFixDv: 13,
    treatmentDv: 13
  },
  {
    rollNumber: 10,
    location: 'head',
    nameRu: 'Потеря уха',
    nameEn: 'Lost Ear',
    effectRu: '-4 ко всем проверкам Восприятия на слух. Если потеряны оба уха — глухота.',
    effectEn: '-4 to hearing-based Perception checks.',
    quickFixDv: 0,
    treatmentDv: 15
  },
  {
    rollNumber: 11,
    location: 'head',
    nameRu: 'Контузия / Оглушение',
    nameEn: 'Crushed Windpipe',
    effectRu: 'Невозможно говорить, персонаж задыхается (-2 к проверкам выносливости).',
    effectEn: 'Cannot speak, suffocating without assistance.',
    quickFixDv: 15,
    treatmentDv: 17
  },
  {
    rollNumber: 12,
    location: 'head',
    nameRu: 'Разрушение черепа',
    nameEn: 'Fractured Skull',
    effectRu: '-2 ко всем действиям персонажа. Повторное попадание в голову смертельно.',
    effectEn: '-2 to all Actions. Further head hits increase death risk.',
    quickFixDv: 15,
    treatmentDv: 17
  },

  // Body Injuries (Roll 2d6)
  {
    rollNumber: 2,
    location: 'body',
    nameRu: 'Оторванная/Разрушенная рука',
    nameEn: 'Dismembered Arm',
    effectRu: 'Рука потеряна. Нельзя использовать двуручное оружие и предметы этой рукой.',
    effectEn: 'Arm is lost. Two-handed items unusable with it.',
    quickFixDv: 0,
    treatmentDv: 17
  },
  {
    rollNumber: 3,
    location: 'body',
    nameRu: 'Оторванная/Разрушенная нога',
    nameEn: 'Dismembered Leg',
    effectRu: 'MOVE уменьшается до 1/3 (минимум 1). Нельзя уклоняться от атак.',
    effectEn: 'MOVE reduced by half (min 1). Cannot dodge ranged attacks.',
    quickFixDv: 0,
    treatmentDv: 17
  },
  {
    rollNumber: 4,
    location: 'body',
    nameRu: 'Перелом руки',
    nameEn: 'Broken Arm',
    effectRu: 'Рука недееспособна. Нельзя держать предметы или стрелять из нее.',
    effectEn: 'Arm is broken. Items in that hand are dropped.',
    quickFixDv: 13,
    treatmentDv: 15
  },
  {
    rollNumber: 5,
    location: 'body',
    nameRu: 'Перелом ноги',
    nameEn: 'Broken Leg',
    effectRu: 'MOVE уменьшается на 4 (минимум 1).',
    effectEn: 'MOVE reduced by 4 (minimum 1).',
    quickFixDv: 13,
    treatmentDv: 15
  },
  {
    rollNumber: 6,
    location: 'body',
    nameRu: 'Перелом ребер',
    nameEn: 'Broken Ribs',
    effectRu: '-2 к проверкам REF, DEX и MOVE при совершении активных движений.',
    effectEn: '-2 to REF, DEX, and MOVE checks when moving fast.',
    quickFixDv: 13,
    treatmentDv: 15
  },
  {
    rollNumber: 7,
    location: 'body',
    nameRu: 'Инородное тело в теле',
    nameEn: 'Foreign Object (Body)',
    effectRu: 'Получаете 1 прямой урон каждый раз, когда двигаетесь пешком дальше 4 м.',
    effectEn: 'Take 1 damage directly to HP if moving more than 4m on foot.',
    quickFixDv: 13,
    treatmentDv: 13
  },
  {
    rollNumber: 8,
    location: 'body',
    nameRu: 'Разрыв мышцы',
    nameEn: 'Torn Muscle',
    effectRu: '-2 ко всем рукопашным атакам и проверкам силы (Brawling, Melee, Athletics).',
    effectEn: '-2 to melee attacks and Strength-based checks.',
    quickFixDv: 13,
    treatmentDv: 13
  },
  {
    rollNumber: 9,
    location: 'body',
    nameRu: 'Травма позвоночника',
    nameEn: 'Spinal Injury',
    effectRu: 'В следующий ход персонаж не может совершать действия (только Move).',
    effectEn: 'Next turn, character can only take Move Action.',
    quickFixDv: 15,
    treatmentDv: 17
  },
  {
    rollNumber: 10,
    location: 'body',
    nameRu: 'Пробитое легкое',
    nameEn: 'Collapsed Lung',
    effectRu: 'MOVE уменьшается на 2. Персонаж начинает задыхаться при нагрузках.',
    effectEn: 'MOVE reduced by 2. Heavy breathing penalty.',
    quickFixDv: 15,
    treatmentDv: 17
  },
  {
    rollNumber: 11,
    location: 'body',
    nameRu: 'Внутреннее кровотечение',
    nameEn: 'Internal Bleeding',
    effectRu: 'Получаете 1 урон напрямую в HP в конце каждого своего хода, пока не перевязано.',
    effectEn: 'Take 1 direct HP damage at end of each turn until treated.',
    quickFixDv: 15,
    treatmentDv: 17
  },
  {
    rollNumber: 12,
    location: 'body',
    nameRu: 'Повреждение внутренних органов',
    nameEn: 'Critical Organ Damage',
    effectRu: 'Штраф -2 ко всем броскам. Спасбросок от смерти усложняется на +2.',
    effectEn: '-2 to all checks, Death Save penalties incremented.',
    quickFixDv: 15,
    treatmentDv: 17
  }
];

// Range DVs table from official CPR Core Rulebook p.173
export interface RangeDvEntry {
  category: string;
  nameRu: string;
  nameEn: string;
  dvs: (number | null)[]; // 8 ranges: 0-6m, 7-12m, 13-25m, 26-50m, 51-100m, 101-200m, 201-400m, 401-800m
}

export const CPR_RANGE_DISTANCES = [
  '0-6 m',
  '7-12 m',
  '13-25 m',
  '26-50 m',
  '51-100 m',
  '101-200 m',
  '201-400 m',
  '401-800 m'
];

export const CPR_RANGE_DV_TABLE: RangeDvEntry[] = [
  {
    category: 'Medium Pistol',
    nameRu: 'Пистолет (Medium Pistol)',
    nameEn: 'Medium Pistol',
    dvs: [13, 15, 20, 25, 30, 30, null, null]
  },
  {
    category: 'Heavy Pistol',
    nameRu: 'Тяжелый пистолет (Heavy Pistol)',
    nameEn: 'Heavy Pistol',
    dvs: [13, 15, 20, 25, 30, 30, null, null]
  },
  {
    category: 'Very Heavy Pistol',
    nameRu: 'Очень тяжелый пистолет (Very Heavy Pistol)',
    nameEn: 'Very Heavy Pistol',
    dvs: [13, 15, 20, 25, 30, 30, null, null]
  },
  {
    category: 'SMG',
    nameRu: 'Пистолет-пулемет (SMG)',
    nameEn: 'SMG',
    dvs: [15, 13, 15, 20, 25, 25, 30, null]
  },
  {
    category: 'Shotgun Slug',
    nameRu: 'Дробовик: Пуля (Shotgun Slug)',
    nameEn: 'Shotgun (Slug)',
    dvs: [13, 15, 20, 25, 30, 35, null, null]
  },
  {
    category: 'Shotgun Shell',
    nameRu: 'Дробовик: Дробь (Shotgun Shell - Конус 3x3м)',
    nameEn: 'Shotgun (Shell - 3x3m DV 13)',
    dvs: [13, null, null, null, null, null, null, null]
  },
  {
    category: 'Assault Rifle',
    nameRu: 'Штурмовая винтовка (Assault Rifle)',
    nameEn: 'Assault Rifle',
    dvs: [17, 16, 15, 13, 15, 20, 25, 30]
  },
  {
    category: 'Sniper Rifle',
    nameRu: 'Снайперская винтовка (Sniper Rifle)',
    nameEn: 'Sniper Rifle',
    dvs: [30, 25, 25, 20, 15, 16, 17, 20]
  },
  {
    category: 'Bow',
    nameRu: 'Лук / Арбалет (Bow / Crossbow)',
    nameEn: 'Bow & Crossbow',
    dvs: [15, 13, 15, 17, 20, 22, null, null]
  },
  {
    category: 'Grenade Launcher',
    nameRu: 'Гранатомет (Grenade Launcher)',
    nameEn: 'Grenade Launcher',
    dvs: [16, 15, 15, 17, 20, 22, 25, null]
  },
  {
    category: 'Rocket Launcher',
    nameRu: 'Ракетница (Rocket Launcher)',
    nameEn: 'Rocket Launcher',
    dvs: [17, 16, 15, 15, 20, 20, 25, 30]
  },
  {
    category: 'Autofire (SMG)',
    nameRu: 'Очередь SMG (Autofire)',
    nameEn: 'Autofire (SMG)',
    dvs: [20, 17, 20, 25, null, null, null, null]
  },
  {
    category: 'Autofire (Rifle)',
    nameRu: 'Очередь винтовки (Autofire Rifle)',
    nameEn: 'Autofire (Assault Rifle)',
    dvs: [22, 20, 17, 20, 25, null, null, null]
  }
];

export const PRESET_PROGRAMS: ProgramItem[] = [
  { id: 'prog-eraser', name: 'Eraser', category: 'Booster', atkBonus: 0, defBonus: 0, rezMax: 7, rezCurrent: 7, effect: '+2 к проверкам Cloak для маскировки следов', isInstalled: true },
  { id: 'prog-seeya', name: 'SeeYa', category: 'Booster', atkBonus: 0, defBonus: 0, rezMax: 7, rezCurrent: 7, effect: '+2 к Pathfinder для обнаружения скрытых объектов', isInstalled: true },
  { id: 'prog-speedy', name: 'Speedy Gonzalvez', category: 'Booster', atkBonus: 0, defBonus: 0, rezMax: 7, rezCurrent: 7, effect: '+2 к скорости перемещения по узлам сети', isInstalled: false },
  { id: 'prog-armor', name: 'Armor', category: 'Defender', atkBonus: 0, defBonus: 0, rezMax: 7, rezCurrent: 7, effect: 'Снижает урон мозгу персонажа от Black ICE на 4', isInstalled: true },
  { id: 'prog-shield', name: 'Shield', category: 'Defender', atkBonus: 0, defBonus: 0, rezMax: 7, rezCurrent: 7, effect: 'Останавливает первую успешную атаку против вас', isInstalled: false },
  { id: 'prog-sword', name: 'Sword', category: 'Attacker', atkBonus: 2, defBonus: 0, rezMax: 7, rezCurrent: 7, effect: 'Наносит 3d6 урона программе-цели (или Black ICE)', isInstalled: true },
  { id: 'prog-deckkrash', name: 'DeckKRASH', category: 'Attacker', atkBonus: 0, defBonus: 0, rezMax: 7, rezCurrent: 7, effect: 'Принудительно разрывает джек-ин нетраннера цели', isInstalled: false },
  { id: 'prog-hellhound', name: 'Hellhound', category: 'Black ICE', atkBonus: 6, defBonus: 6, rezMax: 15, rezCurrent: 15, effect: 'Антиперсональный волк: наносит 2d6 прямо в мозг и поджигает память', isInstalled: false }
];

export const PRESET_ARMOR_OPTIONS = [
  { name: 'Leathers (Кожа)', sp: 4, penalty: 0 },
  { name: 'Kevlar (Кевлар)', sp: 7, penalty: 0 },
  { name: 'Light Armorjack (Легкий бронекостюм)', sp: 11, penalty: 0 },
  { name: 'Bodyweight Suit (Облегающий костюм)', sp: 11, penalty: 0 },
  { name: 'Medium Armorjack (Средний бронекостюм)', sp: 12, penalty: 0 },
  { name: 'Heavy Armorjack (Тяжелый бронекостюм)', sp: 13, penalty: -2 },
  { name: 'Flak (Флак-жилет)', sp: 15, penalty: -4 },
  { name: 'Metalgear (Металгир)', sp: 18, penalty: -4 },
];

export const CPR_LIFEPATH_TABLES = {
  culturalOrigins: [
    { origin: 'Северная Америка', languages: 'Английский, Испанский, Навахо' },
    { origin: 'Южная Америка / Карибы', languages: 'Испанский, Португальский, Патуа' },
    { origin: 'Восточная Азия (Япония/Корея/Китай)', languages: 'Японский, Кантонский, Мандарин, Корейский' },
    { origin: 'Юго-Восточная Азия', languages: 'Тагальский, Вьетнамский, Тайский' },
    { origin: 'Западная Европа', languages: 'Французский, Немецкий, Итальянский' },
    { origin: 'Восточная Европа / СНГ', languages: 'Русский, Польский, Украинский' },
    { origin: 'Ближний Восток / Северная Африка', languages: 'Арабский, Фарси, Иврит' },
    { origin: 'Африка к югу от Сахары', languages: 'Суахили, Йоруба, Французский' },
    { origin: 'Южная Азия', languages: 'Хинди, Бенгали, Урду' },
    { origin: 'Океания / Австралия', languages: 'Английский, Маори' }
  ],
  personalities: [
    'Замкнутый и скрытный, держится в тени',
    'Мятежный бунтарь, плюющий на авторитеты',
    'Высокомерный циник, знающий себе цену',
    'Холодный профессионал с ледяным взглядом',
    'Обаятельный авантюрист с кривой ухмылкой',
    'Параноик, проверяющий углы и жучки',
    'Взрывной холерик, готовый сразу хвататься за ствол',
    'Философ трущоб, цитирующий классиков',
    'Идеалист, мечтающий спасти хотя бы одного человека',
    'Жестокий прагматик, ценящий только кредиты'
  ],
  clothingStyles: [
    'Уличный шик (Streetwear: рваный деним, неоновые кроссовки, худи)',
    'Милитари / Тактика (Tactical: разгрузки, кевларовые вставки, берцы)',
    'Корпоративный стиль (Corpo: строгий деловой костюм, галстук)',
    'Азиатский фьюжн (Kimono-jacket, шелк, неоновые иероглифы)',
    'Кожа и клепки (Booster: шипы, тяжелые цепи, косуха)',
    'Номадический стиль (Пыльник, бандана, заплатки из кевлара)',
    'Ультра-гламур (Винил, хром, блестящие ткани)',
    'Кибер-гот (Черный латекс, респиратор, светящиеся трубки)',
    'Минимализм рабочего (Комбинезон, защитные очки, перчатки)',
    'Ретро-панк (80s vibe, синтвейв цвета, пластик)'
  ],
  hairstyles: [
    'Яркий неоновый ирокез',
    'Гладко выбритые виски и длинный топ',
    'Дреды со светящимися оптоволоконными нитями',
    'Короткий армейский ёжик',
    'Длинные растрепанные волосы',
    'Идеальная корпоративная укладка с гелем',
    'Бритый налысо череп с разъемами нейропортов',
    'Асимметричное каре кислотного цвета',
    'Кибернетический парик со сменой цвета',
    'Афро с хромированными кольцами'
  ],
  affectations: [
    'Постоянно крутит в пальцах патрон или монету',
    'Курит редкие настоящие сигареты из табака',
    'Слушает синт-рок на старом кассетном плеере',
    'Разговаривает на смеси стритсленга и японского',
    'Татуировки с именами погибших напарников',
    'Хромированный протез с гравировкой дракона',
    'Темные зеркальные очки даже в темных закоулках',
    'Нервный тик правого глаза при опасности',
    'Носит старый армейский жетон отца',
    'Всегда садится спиной только к капитальной стене'
  ],
  valueMost: [
    'Деньги и богатство',
    'Честь и данное слово',
    'Собственная свобода и независимость',
    'Семья или банда',
    'Дружба и преданность',
    'Сила и боевое превосходство',
    'Знания и ценная информация',
    'Месть тем, кто предал',
    'Красивая жизнь здесь и сейчас',
    'Наследие — чтобы помнили в Night City'
  ],
  feelingsAboutPeople: [
    'Люди — расходный материал, пока они полезны',
    'Каждый сам за себя в этом проклятом городе',
    'Я верен только тем, кто доказал свою преданность в бою',
    'Люблю толпу, но никому не доверяю по-настоящему',
    'Большинство людей заслуживают лучшей жизни',
    'Мир полон хищников, и нужно быть главным волком',
    'Отношусь ко всем нейтрально, пока не перейдут дорогу',
    'Ищу искренность в мире подделок и синтетики',
    'Ненавижу корпоративных крыс и продажных копов',
    'Одиночка — так безопаснее для всех'
  ],
  familyBackgrounds: [
    'Корпоративная элита (бывшие директора, потерявшие статус)',
    'Уличные бродяги (вырос в трущобах Комбат-зоны)',
    'Клан кочевников-номадов (вырос в караване на шоссе)',
    'Семья наемников или соло-ветеранов Четвертой корпоративной',
    'Техники и механики трущоб',
    'Полицейские или бойцы сил правопорядка',
    'Гангстеры одной из уличных банд Night City',
    'Медиа-активисты или пиратские радиоведущие',
    'Фермеры с агро-куполов или пустошей',
    'Сирота, воспитанный приютом благотворительной миссии'
  ],
  childhoodEnvs: [
    'В роскошном пентхаусе с персональной охраной',
    'В контейнерном поселке на свалке',
    'В постоянных переездах по пыльным дорогам Калифорнии',
    'В темном подвале, прячась от перестрелок банд',
    'В тесной фабричной комнате корпоративного общежития',
    'В передвижном лагере беженцев',
    'В безопасном загородном пригороде до Войны корпораций',
    'На заброшенной станции метро среди изгоев',
    'В мастерской кибернетики среди деталей и паяльников',
    'На улицах, воруя еду и бегая от полиции'
  ],
  familyCrises: [
    'Семья разорилась и потеряла всё из-за корпоративного поглощения',
    'Родители погибли во время налета банды или взрыва бомбы',
    'Один из родителей бесследно исчез в лабораториях биотехники',
    'Семья была изгнана из клана номадов за нарушение кодекса',
    'Долги синдикату якудза вынудили бежать и сменить имена',
    'Родители были арестованы и отбывают срок в колонии криосна',
    'Предательство близкого родственника раскололо семью',
    'Тяжелая болезнь матери опустошила все сбережения',
    'Дом был уничтожен при падении авиатранспорта',
    'Семья распалась, каждый пошел своей криминальной дорогой'
  ],
  lifeGoals: [
    'Стать живой легендой Посмертия (Afterlife)',
    'Отомстить мегакорпорации Арасака или Милитех',
    'Заработать миллион евродолларов и уехать на орбиту',
    'Построить собственную надежную банду или синдикат',
    'Найти и вызволить пропавшего близкого человека',
    'Раскрыть страшную тайну Черного Заслона (Blackwall)',
    'Умереть ярко в эпической перестрелке, чтобы о тебе спели',
    'Открыть лучшую подпольную клинику / мастерскую в городе',
    'Выбиться в высший эшелон совета директоров',
    'Просто дожить до тридцати лет со всеми родными конечностями'
  ]
};

// Default empty character template
export function createEmptyCharacter(name = 'Новый бегущий', role: Character['role'] = 'Solo'): Character {
  const defaultSkills: Skill[] = CPR_SKILLS.map(s => ({
    ...s,
    level: 0
  }));

  // Default CPR starting core skill minimums for basic survivability
  const coreSkillDefaults: Record<string, number> = {
    perception: 2,
    athletics: 2,
    brawling: 2,
    evasion: 2,
    first_aid: 2,
    conversation: 2,
    human_perception: 2,
    persuasion: 2,
    stealth: 2,
    local_expert: 2,
    education: 2,
    language_streetslang: 4,
    handgun: 2
  };

  defaultSkills.forEach(s => {
    if (coreSkillDefaults[s.id]) {
      s.level = coreSkillDefaults[s.id];
    }
  });

  const baseStats = {
    INT: 6,
    REF: 7,
    DEX: 6,
    TECH: 5,
    COOL: 6,
    WILL: 6,
    LUCK: 6,
    MOVE: 6,
    BODY: 6,
    EMP: 6
  };

  const hp = 10 + 5 * Math.ceil((baseStats.BODY + baseStats.WILL) / 2); // 40 HP
  const humanity = baseStats.EMP * 10; // 60 Humanity

  return {
    id: 'char-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    name,
    handle: 'Street-Sam',
    role,
    roleRank: 4,
    avatarUrl: '',
    notes: 'Готов к работе на улицах Найт-Сити.',

    stats: { ...baseStats },
    statMods: {
      INT: 0, REF: 0, DEX: 0, TECH: 0, COOL: 0, WILL: 0, LUCK: 0, MOVE: 0, BODY: 0, EMP: 0
    },

    hpCurrent: hp,
    humanityCurrent: humanity,
    luckCurrent: baseStats.LUCK,
    deathSavePenalties: 0,

    armor: {
      head: {
        id: 'armor-head-1',
        name: 'Light Armorjack Helmet',
        location: 'head',
        spMax: 11,
        spCurrent: 11,
        penalty: 0
      },
      body: {
        id: 'armor-body-1',
        name: 'Light Armorjack Vest',
        location: 'body',
        spMax: 11,
        spCurrent: 11,
        penalty: 0
      }
    },

    skills: defaultSkills,

    weapons: [
      {
        id: 'weap-1',
        name: 'Heavy Pistol (Sternmeyer P-35)',
        category: 'Heavy Pistol',
        damage: '3d6',
        standardRof: 2,
        magCapacity: 8,
        currentAmmo: 8,
        ammoType: 'Basic Heavy Pistol',
        concealable: true,
        notes: 'Надежный тяжелый калибр.',
        quality: 'Standard',
        skillId: 'handgun'
      },
      {
        id: 'weap-2',
        name: 'Very Heavy Melee (Katana)',
        category: 'Very Heavy Melee',
        damage: '4d6',
        standardRof: 1,
        magCapacity: 0,
        currentAmmo: 0,
        ammoType: 'None',
        concealable: false,
        notes: 'Игнорирует половину брони цели (SP/2)!',
        quality: 'Excellent',
        skillId: 'melee_weapon'
      }
    ],

    cyberware: [
      {
        id: 'cyb-1',
        name: 'Neural Link (Нейролинк)',
        category: 'Neuralware',
        installLocation: 'Spine/Brain',
        humanityCost: 7,
        description: 'Базовый интерфейс для подключения кибероптики, чипов и кибероружия.'
      },
      {
        id: 'cyb-2',
        name: 'Interface Plugs (Разъемы интерфейса)',
        category: 'Neuralware',
        installLocation: 'Wrists',
        humanityCost: 7,
        description: 'Штекеры прямого подключения к смарт-оружию, кибердеке и технике (+2 к проверкам).'
      }
    ],

    criticalInjuries: CPR_CRITICAL_INJURIES.map(inj => ({
      ...inj,
      id: 'inj-' + inj.location + '-' + inj.rollNumber,
      isActive: false
    })),

    cyberdeck: {
      name: 'Kirama Cyberdeck',
      hardwareSlotsMax: 3,
      hardwareSlotsUsed: 1,
      programSlotsMax: 5,
      installedHardware: ['Backup Drive (+1 slot)']
    },

    programs: [...PRESET_PROGRAMS],

    gear: [
      { id: 'gear-1', name: 'Agent (Смартфон/ИИ-ассистент)', category: 'Electronics', quantity: 1, costEb: 100, notes: 'Личный помощник, GPS, связь, сеть.' },
      { id: 'gear-2', name: 'Патроны (Heavy Pistol Ammo)', category: 'Ammunition', quantity: 50, costEb: 50, notes: 'Стандартные патроны 50 шт.' },
      { id: 'gear-3', name: 'Аптечка (Medtech Bag / First Aid Kit)', category: 'Medical', quantity: 1, costEb: 50, notes: 'Для проверок First Aid.' }
    ],

    vehicles: [],

    lifepath: {
      culturalOrigin: 'Северная Америка (Английский, Уличный сленг)',
      languages: 'Streetslang, English',
      personality: 'Холодный профессионал с ледяным взглядом',
      clothingStyle: 'Милитари / Тактика (Tactical: разгрузки, кевларовые вставки)',
      hairstyle: 'Короткий армейский ёжик',
      affectation: 'Темные зеркальные очки даже в темных закоулках',
      valueMost: 'Собственная свобода и независимость',
      feelingsAboutPeople: 'Я верен только тем, кто доказал свою преданность в бою',
      valuedPerson: 'Боевой напарник, спасший жизнь в перестрелке',
      valuedPossession: 'Отцовский модифицированный кольт',
      familyBackground: 'Семья наемников или соло-ветеранов Четвертой корпоративной',
      childhoodEnv: 'В темном подвале, прячась от перестрелок банд',
      familyCrisis: 'Родители погибли во время налета банды Арасаки',
      lifeGoals: 'Стать живой легендой Посмертия (Afterlife)',
      friends: 'Фиксер из Маленького Китая',
      tragicLoveAffairs: 'Любимый человек погиб в результате предательства',
      enemies: 'Капитан охраны Arasaka Security (Личная вендетта)',
      roleLifepathNotes: 'Специализация: штурм и скрытное проникновение.'
    },

    roleAbilities: {
      solo: {
        threatDetection: 1,
        initiativeReaction: 1,
        precisionAttack: 1,
        spotWeakness: 1,
        damageAbsorb: 0
      },
      netrunner: {
        interfaceRank: 4
      },
      tech: {
        makerRank: 4,
        fieldExpertise: 2,
        upgrade: 1,
        fabrication: 1,
        invention: 0
      },
      medtech: {
        medicineRank: 4,
        surgery: 2,
        medicalTech: 1,
        pharmaceuticals: 1,
        speedhealDoses: 2,
        cryopumpDoses: 1
      },
      generic: {
        rank: 4,
        details: 'Способность роли ранга 4.'
      }
    },

    cashEb: 500,
    bankEb: 1200,
    lifestyle: 'Good Prepak (Качественные полуфабрикаты - 600 eb/мес)',
    housing: 'Studio Apartment (Квартира-студия в Хейвуде - 1000 eb/мес)',
    rentDueEb: 1000,

    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}
