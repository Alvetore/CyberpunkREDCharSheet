import { Skill, CriticalInjury, Weapon, ProgramItem, ArmorItem, Character } from '../types/character';

export const CPR_SKILLS: Omit<Skill, 'level'>[] = [
  // Awareness Skills (Навыки восприятия)
  { id: 'perception', nameRu: 'Восприятие', nameEn: 'Perception', stat: 'INT', category: 'Awareness', multiplier: 1 },
  { id: 'tracking', nameRu: 'Выслеживание', nameEn: 'Tracking', stat: 'INT', category: 'Awareness', multiplier: 1 },
  { id: 'concentration', nameRu: 'Концентрация', nameEn: 'Concentration', stat: 'WILL', category: 'Awareness', multiplier: 1 },
  { id: 'conceal_reveal', nameRu: 'Скрытие/обнаружение объекта', nameEn: 'Conceal/Reveal Object', stat: 'INT', category: 'Awareness', multiplier: 1 },
  { id: 'lip_reading', nameRu: 'Чтение по губам', nameEn: 'Lip Reading', stat: 'INT', category: 'Awareness', multiplier: 1 },

  // Body Skills (Физические навыки)
  { id: 'contortionist', nameRu: 'Акробатика', nameEn: 'Contortionist', stat: 'DEX', category: 'Body', multiplier: 1 },
  { id: 'athletics', nameRu: 'Атлетика', nameEn: 'Athletics', stat: 'DEX', category: 'Body', multiplier: 1 },
  { id: 'endurance', nameRu: 'Выносливость', nameEn: 'Endurance', stat: 'WILL', category: 'Body', multiplier: 1 },
  { id: 'stealth', nameRu: 'Скрытность', nameEn: 'Stealth', stat: 'DEX', category: 'Body', multiplier: 1 },
  { id: 'resist_torture', nameRu: 'Сопротивление пыткам/наркотикам', nameEn: 'Resist Torture/Drugs', stat: 'WILL', category: 'Body', multiplier: 1 },
  { id: 'dance', nameRu: 'Танец', nameEn: 'Dance', stat: 'DEX', category: 'Body', multiplier: 1 },

  // Control Skills (Навыки управления)
  { id: 'riding', nameRu: 'Верховая езда', nameEn: 'Riding', stat: 'REF', category: 'Control', multiplier: 1 },
  { id: 'drive_land', nameRu: 'Вождение', nameEn: 'Drive Land Vehicle', stat: 'REF', category: 'Control', multiplier: 1 },
  { id: 'pilot_air', nameRu: 'Пилотирование', nameEn: 'Pilot Air Vehicle', stat: 'REF', category: 'Control', multiplier: 2 },
  { id: 'pilot_sea', nameRu: 'Судовождение', nameEn: 'Pilot Sea Vehicle', stat: 'REF', category: 'Control', multiplier: 1 },

  // Education Skills (Навыки образования)
  { id: 'gamble', nameRu: 'Азартные игры', nameEn: 'Gamble', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'business', nameRu: 'Бизнес', nameEn: 'Business', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'accounting', nameRu: 'Бухгалтерия', nameEn: 'Accounting', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'bureaucracy', nameRu: 'Бюрократия', nameEn: 'Bureaucracy', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'wilderness_survival', nameRu: 'Выживание в дикой местности', nameEn: 'Wilderness Survival', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'deduction', nameRu: 'Дедукция', nameEn: 'Deduction', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'local_expert', nameRu: 'Знание района (Твой дом)', nameEn: 'Local Expert (Home District)', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'composition', nameRu: 'Композиция', nameEn: 'Composition', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'criminology', nameRu: 'Криминология', nameEn: 'Criminology', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'cryptography', nameRu: 'Криптография', nameEn: 'Cryptography', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'science', nameRu: 'Наука', nameEn: 'Science', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'education', nameRu: 'Образование', nameEn: 'Education', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'animal_handling', nameRu: 'Обращение с животными', nameEn: 'Animal Handling', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'library_search', nameRu: 'Поиск информации', nameEn: 'Library Search', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'tactics', nameRu: 'Тактика', nameEn: 'Tactics', stat: 'INT', category: 'Education', multiplier: 1 },
  { id: 'language_streetslang', nameRu: 'Язык: Уличный слэнг', nameEn: 'Language (Streetslang)', stat: 'INT', category: 'Education', multiplier: 1 },

  // Fighting Skills (Навыки рукопашного боя)
  { id: 'martial_arts', nameRu: 'Боевые искусства', nameEn: 'Martial Arts', stat: 'DEX', category: 'Fighting', multiplier: 2 },
  { id: 'brawling', nameRu: 'Драка', nameEn: 'Brawling', stat: 'DEX', category: 'Fighting', multiplier: 1 },
  { id: 'evasion', nameRu: 'Уклонение', nameEn: 'Evasion', stat: 'DEX', category: 'Fighting', multiplier: 1 },
  { id: 'melee_weapon', nameRu: 'Холодное оружие', nameEn: 'Melee Weapon', stat: 'DEX', category: 'Fighting', multiplier: 1 },

  // Performance Skills (Творческие навыки)
  { id: 'acting', nameRu: 'Актёрское мастерство', nameEn: 'Acting', stat: 'COOL', category: 'Performance', multiplier: 1 },
  { id: 'play_instrument', nameRu: 'Игра на инструменте', nameEn: 'Play Instrument', stat: 'TECH', category: 'Performance', multiplier: 1 },

  // Ranged Weapon Skills (Навыки боя на дистанции)
  { id: 'autofire', nameRu: 'Автоогонь', nameEn: 'Autofire', stat: 'REF', category: 'Ranged', multiplier: 2 },
  { id: 'shoulder_arms', nameRu: 'Длинноствольное оружие', nameEn: 'Shoulder Arms', stat: 'REF', category: 'Ranged', multiplier: 1 },
  { id: 'handgun', nameRu: 'Короткоствольное оружие', nameEn: 'Handgun', stat: 'REF', category: 'Ranged', multiplier: 1 },
  { id: 'archery', nameRu: 'Луки и арбалеты', nameEn: 'Archery', stat: 'REF', category: 'Ranged', multiplier: 1 },
  { id: 'heavy_weapons', nameRu: 'Тяжёлое оружие', nameEn: 'Heavy Weapons', stat: 'REF', category: 'Ranged', multiplier: 2 },

  // Social Skills (Социальные навыки)
  { id: 'bribery', nameRu: 'Взяточничество', nameEn: 'Bribery', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'wardrobe_style', nameRu: 'Гардероб и стиль', nameEn: 'Wardrobe & Style', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'interrogation', nameRu: 'Допрос', nameEn: 'Interrogation', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'conversation', nameRu: 'Общение', nameEn: 'Conversation', stat: 'EMP', category: 'Social', multiplier: 1 },
  { id: 'streetwise', nameRu: 'Опыт на улицах', nameEn: 'Streetwise', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'human_perception', nameRu: 'Проницательность', nameEn: 'Human Perception', stat: 'EMP', category: 'Social', multiplier: 1 },
  { id: 'trading', nameRu: 'Торговля', nameEn: 'Trading', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'persuasion', nameRu: 'Убеждение', nameEn: 'Persuasion', stat: 'COOL', category: 'Social', multiplier: 1 },
  { id: 'personal_grooming', nameRu: 'Уход за собой', nameEn: 'Personal Grooming', stat: 'COOL', category: 'Social', multiplier: 1 },

  // Technique Skills (Технические навыки)
  { id: 'air_vehicle_tech', nameRu: 'Авиатехника', nameEn: 'Air Vehicle Tech', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'land_vehicle_tech', nameRu: 'Автомеханика', nameEn: 'Land Vehicle Tech', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'pick_lock', nameRu: 'Взлом замков', nameEn: 'Pick Lock', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'demolitions', nameRu: 'Взрывотехника', nameEn: 'Demolitions', stat: 'TECH', category: 'Technique', multiplier: 2 },
  { id: 'paint_draw_sculpt', nameRu: 'Живопись/рис./скульптура', nameEn: 'Paint/Draw/Sculpt', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'pick_pocket', nameRu: 'Карманная кража', nameEn: 'Pick Pocket', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'cybertech', nameRu: 'Кибертехника', nameEn: 'Cybertech', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'weaponstech', nameRu: 'Оружейная техника', nameEn: 'Weaponstech', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'basic_tech', nameRu: 'Основы техники', nameEn: 'Basic Tech', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'paramedic', nameRu: 'Парамедицина', nameEn: 'Paramedic', stat: 'TECH', category: 'Technique', multiplier: 2 },
  { id: 'first_aid', nameRu: 'Первая помощь', nameEn: 'First Aid', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'sea_vehicle_tech', nameRu: 'Судоремонт', nameEn: 'Sea Vehicle Tech', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'forgery', nameRu: 'Фальсификация', nameEn: 'Forgery', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'photography_film', nameRu: 'Фотография/видео', nameEn: 'Photography/Film', stat: 'TECH', category: 'Technique', multiplier: 1 },
  { id: 'electronics_security', nameRu: 'Электр./безопасность', nameEn: 'Electronics/Security Tech', stat: 'TECH', category: 'Technique', multiplier: 2 },
];

export const CPR_CRITICAL_INJURIES: Omit<CriticalInjury, 'id' | 'isActive'>[] = [
  // Head Injuries (Roll 2d6) — CPR Core Rulebook p. 189
  {
    rollNumber: 2,
    location: 'head',
    nameRu: 'Потеря глаза',
    nameEn: 'Lost Eye',
    effectRu: '–4 к дальнобойным атакам и проверкам восприятия, связанным со зрением. Штраф к спасброску от смерти +1.',
    effectEn: '-4 to all Ranged Attacks and sight-based Perception checks. Death Save Penalty +1. Blinded if both lost.',
    quickFixDv: 0,
    treatmentDv: 17,
    quickFixTextRu: '–',
    quickFixTextEn: '–',
    treatmentTextRu: 'Хирургия СЛ17',
    treatmentTextEn: 'Surgery DV17'
  },
  {
    rollNumber: 3,
    location: 'head',
    nameRu: 'Травма мозга',
    nameEn: 'Brain Injury',
    effectRu: '–2 ко всем действиям. Штраф к спасброску от смерти +1.',
    effectEn: '-2 to all Actions. Death Save Penalty +1.',
    quickFixDv: 0,
    treatmentDv: 17,
    quickFixTextRu: '–',
    quickFixTextEn: '–',
    treatmentTextRu: 'Хирургия СЛ17',
    treatmentTextEn: 'Surgery DV17'
  },
  {
    rollNumber: 4,
    location: 'head',
    nameRu: 'Повреждение глаза',
    nameEn: 'Damaged Eye',
    effectRu: '–4 к дальнобойным атакам и проверкам восприятия, связанным со зрением. Штраф к спасброску от смерти +1.',
    effectEn: '-4 to all Ranged Attacks and sight-based Perception checks. Death Save Penalty +1.',
    quickFixDv: 15,
    treatmentDv: 13,
    quickFixTextRu: 'Парамедицина СЛ15',
    quickFixTextEn: 'Paramedic DV15',
    treatmentTextRu: 'Хирургия СЛ13',
    treatmentTextEn: 'Surgery DV13'
  },
  {
    rollNumber: 5,
    location: 'head',
    nameRu: 'Сотрясение',
    nameEn: 'Concussion',
    effectRu: '–2 ко всем действиям.',
    effectEn: '-2 to all Actions.',
    quickFixDv: 13,
    treatmentDv: 13,
    quickFixTextRu: 'Первая помощь или Парамедицина СЛ13',
    quickFixTextEn: 'First Aid or Paramedic DV13',
    treatmentTextRu: 'Быстрая помощь лечит',
    treatmentTextEn: 'Quick Fix treats'
  },
  {
    rollNumber: 6,
    location: 'head',
    nameRu: 'Перелом челюсти',
    nameEn: 'Broken Jaw',
    effectRu: '–4 ко всем действиям, связанным с речью.',
    effectEn: '-4 to all Actions involving speech.',
    quickFixDv: 13,
    treatmentDv: 13,
    quickFixTextRu: 'Парамедицина СЛ13',
    quickFixTextEn: 'Paramedic DV13',
    treatmentTextRu: 'Парамедицина или Хирургия СЛ13',
    treatmentTextEn: 'Paramedic or Surgery DV13'
  },
  {
    rollNumber: 7,
    location: 'head',
    nameRu: 'Инородное тело',
    nameEn: 'Foreign Object (Head)',
    effectRu: 'В конце каждого хода, если двигаешься дальше 4 м пешком — снова получаешь бонусный урон от этой критической травмы напрямую по ПЗ.',
    effectEn: 'At end of each turn moving >4m on foot, take the Critical Injury bonus damage again directly to HP.',
    quickFixDv: 13,
    treatmentDv: 13,
    quickFixTextRu: 'Первая помощь или Парамедицина СЛ13',
    quickFixTextEn: 'First Aid or Paramedic DV13',
    treatmentTextRu: 'Быстрая помощь лечит',
    treatmentTextEn: 'Quick Fix treats'
  },
  {
    rollNumber: 8,
    location: 'head',
    nameRu: 'Хлыстовая травма',
    nameEn: 'Whiplash',
    effectRu: 'Штраф к спасброску от смерти +1.',
    effectEn: 'Death Save Penalty +1.',
    quickFixDv: 13,
    treatmentDv: 13,
    quickFixTextRu: 'Парамедицина СЛ13',
    quickFixTextEn: 'Paramedic DV13',
    treatmentTextRu: 'Парамедицина или Хирургия СЛ13',
    treatmentTextEn: 'Paramedic or Surgery DV13'
  },
  {
    rollNumber: 9,
    location: 'head',
    nameRu: 'Трещина черепа',
    nameEn: 'Cracked Skull',
    effectRu: 'Урон от прицельных выстрелов в голову увеличивается до х3. Штраф к спасброску от смерти +1.',
    effectEn: 'Aimed Shots to the head multiply damage by 3 instead of 2. Death Save Penalty +1.',
    quickFixDv: 15,
    treatmentDv: 15,
    quickFixTextRu: 'Парамедицина СЛ15',
    quickFixTextEn: 'Paramedic DV15',
    treatmentTextRu: 'Парамедицина или Хирургия СЛ15',
    treatmentTextEn: 'Paramedic or Surgery DV15'
  },
  {
    rollNumber: 10,
    location: 'head',
    nameRu: 'Повреждение уха',
    nameEn: 'Damaged Ear',
    effectRu: 'В конце каждого хода, если двигаешься дальше 4 м пешком — снова получаешь бонусный урон от этой критической травмы напрямую по ПЗ.',
    effectEn: 'At end of each turn moving >4m on foot, take the Critical Injury bonus damage again directly to HP.',
    quickFixDv: 13,
    treatmentDv: 13,
    quickFixTextRu: 'Парамедицина СЛ13',
    quickFixTextEn: 'Paramedic DV13',
    treatmentTextRu: 'Хирургия СЛ13',
    treatmentTextEn: 'Surgery DV13'
  },
  {
    rollNumber: 11,
    location: 'head',
    nameRu: 'Раздавленная трахея',
    nameEn: 'Crushed Windpipe',
    effectRu: 'Ты не можешь говорить. Штраф к спасброску от смерти +1.',
    effectEn: 'You cannot speak. Death Save Penalty +1.',
    quickFixDv: 0,
    treatmentDv: 15,
    quickFixTextRu: '–',
    quickFixTextEn: '–',
    treatmentTextRu: 'Хирургия СЛ15',
    treatmentTextEn: 'Surgery DV15'
  },
  {
    rollNumber: 12,
    location: 'head',
    nameRu: 'Потеря уха',
    nameEn: 'Lost Ear',
    effectRu: '–4 к проверкам восприятия, связанным со слухом. Штраф к спасброску от смерти +1. Если потеряны оба уха — глухота.',
    effectEn: '-4 to hearing-based Perception checks. Death Save Penalty +1. Deafened if both lost.',
    quickFixDv: 0,
    treatmentDv: 17,
    quickFixTextRu: '–',
    quickFixTextEn: '–',
    treatmentTextRu: 'Хирургия СЛ17',
    treatmentTextEn: 'Surgery DV17'
  },

  // Body Injuries (Roll 2d6) — CPR Core Rulebook p. 187
  {
    rollNumber: 2,
    location: 'body',
    nameRu: 'Оторванная рука',
    nameEn: 'Dismembered Arm',
    effectRu: 'Предметы в руке падают. Рука потеряна. Штраф к спасброску от смерти +1.',
    effectEn: 'Objects in hand are dropped. Arm is lost. Death Save Penalty +1.',
    quickFixDv: 0,
    treatmentDv: 17,
    quickFixTextRu: '–',
    quickFixTextEn: '–',
    treatmentTextRu: 'Хирургия СЛ17',
    treatmentTextEn: 'Surgery DV17'
  },
  {
    rollNumber: 3,
    location: 'body',
    nameRu: 'Оторванная кисть',
    nameEn: 'Dismembered Hand',
    effectRu: 'Предметы в руке падают. Кисть потеряна. Штраф к спасброску от смерти +1.',
    effectEn: 'Objects in hand are dropped. Hand is lost. Death Save Penalty +1.',
    quickFixDv: 0,
    treatmentDv: 17,
    quickFixTextRu: '–',
    quickFixTextEn: '–',
    treatmentTextRu: 'Хирургия СЛ17',
    treatmentTextEn: 'Surgery DV17'
  },
  {
    rollNumber: 4,
    location: 'body',
    nameRu: 'Разрыв лёгкого',
    nameEn: 'Collapsed Lung',
    effectRu: '–2 к СКО (мин. 1). Штраф к спасброску от смерти +1.',
    effectEn: '-2 to MOVE (minimum 1). Death Save Penalty +1.',
    quickFixDv: 15,
    treatmentDv: 15,
    quickFixTextRu: 'Парамедицина СЛ15',
    quickFixTextEn: 'Paramedic DV15',
    treatmentTextRu: 'Хирургия СЛ15',
    treatmentTextEn: 'Surgery DV15'
  },
  {
    rollNumber: 5,
    location: 'body',
    nameRu: 'Перелом рёбер',
    nameEn: 'Broken Ribs',
    effectRu: 'В конце каждого хода, если двигаешься дальше 4 м пешком — снова получаешь бонусный урон от этой критической травмы напрямую по ПЗ.',
    effectEn: 'At end of each turn moving >4m on foot, take the Critical Injury bonus damage again directly to HP.',
    quickFixDv: 13,
    treatmentDv: 15,
    quickFixTextRu: 'Парамедицина СЛ13',
    quickFixTextEn: 'Paramedic DV13',
    treatmentTextRu: 'Парамедицина СЛ15 или Хирургия СЛ17',
    treatmentTextEn: 'Paramedic DV15 or Surgery DV17'
  },
  {
    rollNumber: 6,
    location: 'body',
    nameRu: 'Перелом руки',
    nameEn: 'Broken Arm',
    effectRu: 'Сломанная рука бесполезна. Всё, что в этой руке, немедленно выпадает из рук.',
    effectEn: 'Broken arm is useless. Everything in that hand immediately drops.',
    quickFixDv: 13,
    treatmentDv: 15,
    quickFixTextRu: 'Парамедицина СЛ13',
    quickFixTextEn: 'Paramedic DV13',
    treatmentTextRu: 'Парамедицина СЛ15 или Хирургия СЛ17',
    treatmentTextEn: 'Paramedic DV15 or Surgery DV17'
  },
  {
    rollNumber: 7,
    location: 'body',
    nameRu: 'Инородное тело',
    nameEn: 'Foreign Object (Body)',
    effectRu: 'В конце каждого хода, если двигаешься дальше 4 м пешком — снова получаешь бонусный урон от этой критической травмы напрямую по ПЗ.',
    effectEn: 'At end of each turn moving >4m on foot, take the Critical Injury bonus damage again directly to HP.',
    quickFixDv: 13,
    treatmentDv: 13,
    quickFixTextRu: 'Первая помощь или Парамедицина СЛ13',
    quickFixTextEn: 'First Aid or Paramedic DV13',
    treatmentTextRu: 'Быстрая помощь лечит',
    treatmentTextEn: 'Quick Fix treats'
  },
  {
    rollNumber: 8,
    location: 'body',
    nameRu: 'Перелом ноги',
    nameEn: 'Broken Leg',
    effectRu: '–4 к СКО (мин. 1).',
    effectEn: '-4 to MOVE (minimum 1).',
    quickFixDv: 13,
    treatmentDv: 15,
    quickFixTextRu: 'Парамедицина СЛ13',
    quickFixTextEn: 'Paramedic DV13',
    treatmentTextRu: 'Парамедицина СЛ15 или Хирургия СЛ17',
    treatmentTextEn: 'Paramedic DV15 or Surgery DV17'
  },
  {
    rollNumber: 9,
    location: 'body',
    nameRu: 'Разрыв мышц',
    nameEn: 'Torn Muscle',
    effectRu: '–2 к атакам в рукопашном бою.',
    effectEn: '-2 to Melee Attacks.',
    quickFixDv: 13,
    treatmentDv: 13,
    quickFixTextRu: 'Первая помощь или Парамедицина СЛ13',
    quickFixTextEn: 'First Aid or Paramedic DV13',
    treatmentTextRu: 'Быстрая помощь лечит',
    treatmentTextEn: 'Quick Fix treats'
  },
  {
    rollNumber: 10,
    location: 'body',
    nameRu: 'Травма позвоночника',
    nameEn: 'Spinal Injury',
    effectRu: 'В следующий ход можно делать только действие перемещения. Базовый штраф к спасброску от смерти +1.',
    effectEn: 'Next turn, you can only take a Move Action. Base Death Save Penalty +1.',
    quickFixDv: 15,
    treatmentDv: 15,
    quickFixTextRu: 'Парамедицина СЛ15',
    quickFixTextEn: 'Paramedic DV15',
    treatmentTextRu: 'Хирургия СЛ15',
    treatmentTextEn: 'Surgery DV15'
  },
  {
    rollNumber: 11,
    location: 'body',
    nameRu: 'Раздробленные пальцы',
    nameEn: 'Crushed Fingers',
    effectRu: '–4 ко всем действиям, связанным с этой рукой.',
    effectEn: '-4 to all Actions involving this hand.',
    quickFixDv: 13,
    treatmentDv: 15,
    quickFixTextRu: 'Парамедицина СЛ13',
    quickFixTextEn: 'Paramedic DV13',
    treatmentTextRu: 'Хирургия СЛ15',
    treatmentTextEn: 'Surgery DV15'
  },
  {
    rollNumber: 12,
    location: 'body',
    nameRu: 'Оторванная нога',
    nameEn: 'Dismembered Leg',
    effectRu: '–6 к СКО (мин. 1). Нельзя уклоняться от атак. Штраф к спасброску от смерти +1.',
    effectEn: '-6 to MOVE (minimum 1). Cannot dodge attacks. Death Save Penalty +1.',
    quickFixDv: 0,
    treatmentDv: 15,
    quickFixTextRu: '–',
    quickFixTextEn: '–',
    treatmentTextRu: 'Хирургия СЛ15',
    treatmentTextEn: 'Surgery DV15'
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
    nameRu: 'Средний пистолет (Medium Pistol)',
    nameEn: 'Medium Pistol',
    dvs: [13, 15, 20, 25, 30, 30, null, null]
  },
  {
    category: 'Heavy Pistol',
    nameRu: 'Тяжёлый пистолет (Heavy Pistol)',
    nameEn: 'Heavy Pistol',
    dvs: [13, 15, 20, 25, 30, 30, null, null]
  },
  {
    category: 'Very Heavy Pistol',
    nameRu: 'Очень тяжёлый пистолет (Very Heavy Pistol)',
    nameEn: 'Very Heavy Pistol',
    dvs: [13, 15, 20, 25, 30, 30, null, null]
  },
  {
    category: 'SMG',
    nameRu: 'ПП (SMG)',
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
    nameRu: 'Дробовик: Дробь (СЛ 13 конус)',
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
    nameRu: 'Луки и арбалеты (Bow / Crossbow)',
    nameEn: 'Bow & Crossbow',
    dvs: [15, 13, 15, 17, 20, 22, null, null]
  },
  {
    category: 'Grenade Launcher',
    nameRu: 'Гранатомёт (Grenade Launcher)',
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
    nameRu: 'Автоогонь: ПП (Autofire SMG)',
    nameEn: 'Autofire (SMG)',
    dvs: [20, 17, 20, 25, null, null, null, null]
  },
  {
    category: 'Autofire (Rifle)',
    nameRu: 'Автоогонь: Винтовка (Autofire Rifle)',
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
  { name: 'Кожа (Leather)', sp: 4, penalty: 0 },
  { name: 'Кевлар® (Kevlar)', sp: 7, penalty: 0 },
  { name: 'Лёгкий арморджек (Light Armorjack)', sp: 11, penalty: 0 },
  { name: 'Костюм Bodyweight', sp: 11, penalty: 0 },
  { name: 'Средний арморджек (Medium Armorjack)', sp: 12, penalty: -2 },
  { name: 'Тяжёлый арморджек (Heavy Armorjack)', sp: 13, penalty: -2 },
  { name: 'Осколочный бронежилет (Flak)', sp: 15, penalty: -4 },
  { name: 'Metalgear®', sp: 18, penalty: -4 },
  { name: 'Пуленепробиваемый щит (Bulletproof Shield)', sp: 10, penalty: 0 },
];

export const CPR_LIFEPATH_TABLES = {
  culturalOrigins: [
    { origin: 'Северная Америка', languages: 'Китайский, Кри, Креольский, Английский, Французский, Навахо, Испанский' },
    { origin: 'Южная/Центральная Америка', languages: 'Креольский, Английский, Немецкий, Гуарани, Майя, Португальский, Кечуа, Испанский' },
    { origin: 'Западная Европа', languages: 'Голландский, Английский, Французский, Немецкий, Итальянский, Норвежский, Португальский, Испанский' },
    { origin: 'Восточная Европа', languages: 'Английский, Финский, Польский, Румынский, Русский, Украинский' },
    { origin: 'Ближний Восток/Северная Африка', languages: 'Арабский, Берберский, Английский, Персидский, Французский, Иврит, Турецкий' },
    { origin: 'Чёрная Африка', languages: 'Арабский, Английский, Французский, Хауса, Лингала, Оромо, Португальский, Суахили, Чви, Йоруба' },
    { origin: 'Южная Азия', languages: 'Бенгальский, Дари, Английский, Хинди, Непальский, Пушту, Панджаби, Тамильский, Урду' },
    { origin: 'Юго-Восточная Азия', languages: 'Арабский, Бирманский, Английский, Филиппинский, Индонезийский, Кхмерский, Малайский, Тагальский, Тайский, Вьетнамский' },
    { origin: 'Восточная Азия', languages: 'Кантонский, Английский, Японский, Корейский, Севернокитайский (Мандарин)' },
    { origin: 'Океания/Тихоокеанские острова', languages: 'Английский, Гавайский, Маори, Папуасские языки, Самоанский, Таитянский' }
  ],
  personalities: [
    'Застенчивый и скрытный',
    'Мятежный, злобный, дерзкий',
    'Высокомерный, гордый, отчуждённый',
    'Капризный, резкий, упрямый',
    'Привередливый, суетливый, нервный',
    'Уравновешенный, серьёзный',
    'Глупый, легкомысленный',
    'Коварный, скрытный, хитрый',
    'Интеллектуальный, отстранённый',
    'Дружелюбный, открытый'
  ],
  clothingStyles: [
    'Generic Chic (стандартный, яркий, модульный)',
    'Leisurewear (комфорт, ловкость, спортивный)',
    'Urban Flash (яркий, технологичный, уличный)',
    'Businesswear (лидерский, строгий, корпоративный)',
    'High Style (роскошный, эксклюзивный, дизайнерский)',
    'Bohemian (винтажный, богемный, эклектичный)',
    'Bag Lady Chic (бомж-шик, потрёпанный, многослойный)',
    'Gang Colors (цвета банды, вызывающий, опасный)',
    'Nomad Leathers (кожа кочевников, практичный, дорожный)',
    'Asia Pop (азиатский поп, яркий, футуристичный)'
  ],
  hairstyles: [
    'Ирокез',
    'Длинные и растрёпанные',
    'Короткие и острые',
    'Короткая стрижка (ёжик)',
    'Плетёные косы',
    'Растрёпанные',
    'Короткие и аккуратные',
    'Дреды',
    'Пышные кудри',
    'Бритая голова'
  ],
  affectations: [
    'Татуировки',
    'Зеркальные очки',
    'Ритуальные шрамы',
    'Шипы на одежде',
    'Кольца в носу / пирсинг',
    'Язычковый пирсинг',
    'Странные ногти',
    'Острые зубы / клыки',
    'Светящиеся полосы на коже',
    'Смертельный макияж'
  ],
  valueMost: [
    'Деньги',
    'Честь',
    'Твоё слово',
    'Честность',
    'Знания',
    'Месть',
    'Любовь',
    'Власть',
    'Семья',
    'Дружба'
  ],
  feelingsAboutPeople: [
    'Я остаюсь нейтральным',
    'Мне нравятся почти все',
    'Я ненавижу почти всех',
    'Люди — это инструменты. Использую их для своих целей, а потом избавляюсь.',
    'Каждый человек — ценная личность.',
    'Люди — это препятствия, которые нужно уничтожить, если они мне мешают.',
    'Люди ненадёжны. Не полагайся ни на кого.',
    'Уничтожь всех и пусть тараканы захватят мир.',
    'Люди замечательные!',
    'Я верен только тем, кто доказал свою преданность'
  ],
  familyBackgrounds: [
    'Корпоративная элита',
    'Корпоративные служащие',
    'Бюрократы корпораций',
    'Кочевой клан',
    'Семья из боевой зоны',
    'Семья с городских задворок',
    'Трущобы мегабашни',
    'Канализационные скитальцы',
    'Семья с фабрики / производственники',
    'Сирота / воспитанник улицы'
  ],
  childhoodEnvs: [
    'На улице, без присмотра взрослых',
    'В безопасном корпоративном анклаве',
    'В кочевом лагере в постоянном движении',
    'В гетто с высоким уровнем преступности',
    'В разрушенном войной пригороде',
    'В тесном многоквартирном комплексе мегабашни',
    'В изолированном поселении выживших',
    'На борту семейного трейлера или кочевого корабля',
    'В корпоративном интернате или приюте',
    'В подземельях или заброшенных станциях метро'
  ],
  familyCrises: [
    'Семья потеряла всё из-за предательства корпорации',
    'Один или оба родителя погибли в перестрелке',
    'Семья была вынуждена бежать и сменить имена',
    'Родители пропали без вести, оставив вас одних',
    'Семья распалась, каждый пошёл своей дорогой',
    'Семья была изгнана из общины или клана',
    'Родители были арестованы и отправлены в тюрьму или криосон',
    'Один из родителей стал киберпсихом',
    'Дом и всё имущество были уничтожены бомбёжкой или пожаром',
    'Семья увязла в неоплатных долгах синдикату'
  ],
  lifeGoals: [
    'Очистить своё имя',
    'Жить на широкую ногу и умереть молодым',
    'Отомстить тем, кто разрушил мою жизнь',
    'Заработать власть и контроль в Найт-Сити',
    'Спасти кого-то, кто мне дорог',
    'Стать живой легендой улиц',
    'Найти мир и спокойствие вдали от города',
    'Разрушить корпорацию или банду, сломавшую семью',
    'Выбиться в высший совет директоров',
    'Просто выжить в Красное время'
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
  const baseHumanity = baseStats.EMP * 10; // 60 Humanity
  const startingCyberwareLoss = 14; // Neural Link (7) + Interface Plugs (7)
  const humanity = Math.max(0, baseHumanity - startingCyberwareLoss); // 46 Humanity

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
        name: 'Лёгкий арморджек (Шлем)',
        location: 'head',
        spMax: 11,
        spCurrent: 11,
        penalty: 0
      },
      body: {
        id: 'armor-body-1',
        name: 'Лёгкий арморджек (Жилет)',
        location: 'body',
        spMax: 11,
        spCurrent: 11,
        penalty: 0
      },
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
