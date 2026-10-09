import { MartialArtsStyle } from '../types/character';

export interface MeleeWeaponTier {
  category: string;
  nameRu: string;
  nameEn: string;
  damage: string;
  rof: number;
  hands: 1 | 2;
  concealable: boolean;
  examplesRu: string;
  examplesEn: string;
}

export interface BrawlingManeuver {
  id: 'strike' | 'grab' | 'choke' | 'throw' | 'human_shield';
  nameRu: string;
  nameEn: string;
  requirementRu: string;
  requirementEn: string;
  checkRu: string;
  checkEn: string;
  effectRu: string;
  effectEn: string;
  damageType?: 'unarmed' | 'body_direct' | 'none';
}

export interface MartialArtsMove {
  id: string;
  nameRu: string;
  nameEn: string;
  style: MartialArtsStyle | 'Universal';
  requirementRu: string;
  requirementEn: string;
  checkRu: string;
  checkEn: string;
  effectRu: string;
  effectEn: string;
  targetDv?: number;
  damageBonus?: string;
  source?: string;
}

export interface MartialArtsStyleInfo {
  id: MartialArtsStyle;
  nameRu: string;
  nameEn: string;
  source: string;
  category: 'Corebook' | 'Fury';
  descriptionRu: string;
  descriptionEn: string;
  moves: MartialArtsMove[];
}

/**
 * Calculates Unarmed Strike damage from character's BODY stat according to official CPR rules.
 * BODY <= 4: 1d6
 * BODY 5-6: 2d6
 * BODY 7-8: 3d6
 * BODY 9-10: 4d6
 * BODY 11+: 5d6 (Linear Frame Sigma/Beta, Grafted Muscle, etc.)
 */
export function getUnarmedDamage(body: number): string {
  if (body <= 4) return '1d6';
  if (body <= 6) return '2d6';
  if (body <= 8) return '3d6';
  if (body <= 10) return '4d6';
  return '5d6';
}

export const CPR_BODY_DAMAGE_SCALE = [
  { range: 'BODY ≤ 4', damage: '1d6', descRu: 'Слабое телосложение (1–4)', descEn: 'Weak physique (1–4)' },
  { range: 'BODY 5–6', damage: '2d6', descRu: 'Среднее телосложение (5–6)', descEn: 'Average street physique (5–6)' },
  { range: 'BODY 7–8', damage: '3d6', descRu: 'Крепкий атлет / Соло (7–8)', descEn: 'Tough athlete / Solo (7–8)' },
  { range: 'BODY 9–10', damage: '4d6', descRu: 'Пик человеческих сил (9–10)', descEn: 'Peak human power (9–10)' },
  { range: 'BODY 11+', damage: '5d6', descRu: 'Кибернетический каркас / Экзоскелет (11+)', descEn: 'Linear Frame / Cyborg (11+)' },
];

export const CPR_MELEE_WEAPON_TIERS: MeleeWeaponTier[] = [
  {
    category: 'Light Melee',
    nameRu: 'Легкое холодное оружие',
    nameEn: 'Light Melee Weapon',
    damage: '1d6',
    rof: 2,
    hands: 1,
    concealable: true,
    examplesRu: 'Боевой нож, кастет, заточка, стилет, складной нож',
    examplesEn: 'Combat knife, brass knuckles, shiv, switchblade'
  },
  {
    category: 'Medium Melee',
    nameRu: 'Среднее холодное оружие',
    nameEn: 'Medium Melee Weapon',
    damage: '2d6',
    rof: 2,
    hands: 1,
    concealable: false,
    examplesRu: 'Мачете, бейсбольная бита, томагавк, полицейская дубинка',
    examplesEn: 'Machete, baseball bat, tomahawk, stun baton, crowbar'
  },
  {
    category: 'Heavy Melee',
    nameRu: 'Тяжелое холодное оружие',
    nameEn: 'Heavy Melee Weapon',
    damage: '3d6',
    rof: 2,
    hands: 2,
    concealable: false,
    examplesRu: 'Катана, свинцовая труба, пожарный топор, кувалда',
    examplesEn: 'Katana, lead pipe, fire axe, sledgehammer'
  },
  {
    category: 'Very Heavy Melee',
    nameRu: 'Очень тяжелое холодное оружие',
    nameEn: 'Very Heavy Melee Weapon',
    damage: '4d6',
    rof: 1,
    hands: 2,
    concealable: false,
    examplesRu: 'Двуручный палаш, бензопила, молот разрушения, монокатана',
    examplesEn: 'Two-handed greatsword, chainsaw, heavy sledge, monokatana'
  }
];

export const CPR_BRAWLING_MANEUVERS: BrawlingManeuver[] = [
  {
    id: 'strike',
    nameRu: 'Удар в рукопашной (Драка)',
    nameEn: 'Brawling Strike',
    requirementRu: '1 свободная рука или нога',
    requirementEn: '1 free hand or foot',
    checkRu: 'ЛВК + Драка + 1d10 против ЛВК + Уклонение цели',
    checkEn: 'DEX + Brawling + 1d10 vs Defender DEX + Evasion + 1d10',
    effectRu: 'Наносит урон на основе вашего ТЕЛО (игнорирует 50% ОС брони цели, округление вверх). Темп боя: СКОР 2 (2 удара за действие).',
    effectEn: 'Deals damage based on your BODY stat (ignores half of target SP, rounded up). ROF 2 (2 attacks per action).',
    damageType: 'unarmed'
  },
  {
    id: 'grab',
    nameRu: 'Захват противника (Grab)',
    nameEn: 'Grapple / Grab',
    requirementRu: '1 свободная рука, цель в пределах досягаемости',
    requirementEn: '1 free hand, target within melee reach',
    checkRu: 'ЛВК + Драка + 1d10 против ЛВК + Драка (или Уклонение) цели',
    checkEn: 'DEX + Brawling + 1d10 vs Target DEX + Brawling (or Evasion) + 1d10',
    effectRu: 'При успехе цель захвачена (Grappled): не может перемещаться самостоятельно, получает штраф -2 ко всем действиям (кроме попыток вырваться). Вы можете волочить цель со скоростью 1/2 СКО или использовать как живой щит (Human Shield). Для освобождения цель тратит Действие на встречный бросок Драки.',
    effectEn: 'Target is Grappled: cannot move on their own, suffers -2 to all actions (except escape). You can drag target at 1/2 MOVE or use as Human Shield. Target spends Action on their turn to roll DEX + Brawling to break free.',
    damageType: 'none'
  },
  {
    id: 'choke',
    nameRu: 'Удушение (Choke)',
    nameEn: 'Choke',
    requirementRu: 'Цель уже находится в вашем захвате (Grappled)',
    requirementEn: 'Target is already Grappled by you',
    checkRu: 'Требует Действие (автоматическое попадание по захваченной цели)',
    checkEn: 'Requires Action (automatic hit on grappled target)',
    effectRu: 'Наносит урон, равный показателю вашего ТЕЛО, НАПРЯМУЮ в Пункты здоровья (ПЗ) цели (ПОЛНОСТЬЮ ИГНОРИРУЕТ ВСЮ БРОНЮ ОС!). Если удерживать удушение 3 хода подряд — цель теряет сознание (без сознания на 1 минуту или до реанимации).',
    effectEn: 'Deals damage equal to your BODY stat directly to target HP (COMPLETELY IGNORES ALL ARMOR SP!). If choked for 3 consecutive turns, target is knocked unconscious for 1 minute.',
    damageType: 'body_direct'
  },
  {
    id: 'throw',
    nameRu: 'Бросок (Throw)',
    nameEn: 'Throw',
    requirementRu: 'Цель уже находится в вашем захвате (Grappled)',
    requirementEn: 'Target is already Grappled by you',
    checkRu: 'Требует Действие. Завершает захват.',
    checkEn: 'Requires Action. Ends the grapple.',
    effectRu: 'Вы бросаете цель на землю: цель сбита с ног (Prone) и получает полный урон рукопашного удара (на основе вашего ТЕЛО, игнорируя 50% ОС). Если бросить во второго врага — оба падают с ног и получают урон!',
    effectEn: 'You throw target to ground: target falls Prone and takes full unarmed strike damage (based on your BODY, ignoring 50% SP). If thrown into another person, both take damage and fall Prone!',
    damageType: 'unarmed'
  },
  {
    id: 'human_shield',
    nameRu: 'Живой щит (Human Shield)',
    nameEn: 'Human Shield',
    requirementRu: 'Цель находится в вашем захвате (Grappled)',
    requirementEn: 'Target is Grappled by you',
    checkRu: 'Пассивное состояние при захвате',
    checkEn: 'Passive state while grappling',
    effectRu: 'Вы держите врага перед собой. Все входящие в вас атаки попадают в живой щит! Урон наносится по ОС и ПЗ удерживаемого врага. Когда ПЗ врага падает до 0, он умирает и перестает служить щитом.',
    effectEn: 'You position the grappled target in front of you. Incoming attacks hit the human shield instead, damaging their SP and HP until they reach 0 HP.',
    damageType: 'none'
  }
];

export const CPR_UNIVERSAL_MARTIAL_ARTS_MOVES: MartialArtsMove[] = [
  {
    id: 'kip_up',
    nameRu: 'Возврат / Быстрый подъём (Kip Up)',
    nameEn: 'Kip Up (Stand Up without Action)',
    style: 'Universal',
    requirementRu: 'Без условий, доступен для любого стиля Боевых Искусств (требуется хотя бы 1 ранг в любом стиле).',
    requirementEn: 'No requirements, available for all Martial Arts styles (requires at least 1 rank).',
    checkRu: 'DEX + Боевые искусства + 1d10 против СЛ13',
    checkEn: 'DEX + Martial Arts + 1d10 vs DV 13',
    effectRu: 'Всякий раз, когда вы применяете действие "Встать" (из положения Prone / сбитый с ног), вы можете попытаться превзойти СЛ13. Если вам удалось, то действие "Встать" не тратит ваше Действие!',
    effectEn: 'Whenever you take the "Get Up" action from Prone, you may attempt to beat DV 13. If successful, getting up costs NO Action!',
    targetDv: 13,
    source: 'DataPool / Universal'
  }
];

export const CPR_MARTIAL_ARTS_STYLES: Record<MartialArtsStyle, MartialArtsStyleInfo> = {
  "Aikido": {
    "id": "Aikido",
    "nameRu": "Айкидо (Aikido)",
    "nameEn": "Aikido",
    "source": "Corebook",
    "category": "Corebook",
    "descriptionRu": "Мягкий оборонительный стиль, в котором практикуются размашистые техники рук и тела, позволяющие блокировать и обезоруживать противников, обращая их силу против них самих.",
    "descriptionEn": "Soft defensive martial art using sweeping arm and body movements to neutralize aggression, disarm weapons, and lock attackers in inescapable grips.",
    "moves": [
      {
        "id": "aikido_disarm",
        "nameRu": "Приём обезоруживания (Disarming Strike)",
        "nameEn": "Disarming Strike",
        "style": "Aikido",
        "requirementRu": "В этот ход вы нанесли удар одной и той же цели атакой Рукопашного боя и атакой Боевых Искусств.",
        "requirementEn": "You hit the same target with both a Brawling attack and a Martial Arts attack this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Раз за ход при успехе любой предмет или оружие в руках у цели оказывается у вас в руках либо падает на пол (на ваш выбор).",
        "effectEn": "Once per turn on success, any item or weapon held by the target is snatched into your hands or falls to the floor.",
        "targetDv": 15,
        "source": "Corebook"
      },
      {
        "id": "aikido_iron_grip",
        "nameRu": "Железная хватка (Iron Grip)",
        "nameEn": "Iron Grip",
        "style": "Aikido",
        "requirementRu": "Цель успешно схвачена в захват, но ещё не поражена «Железной хваткой».",
        "requirementEn": "Target is grappled by you and not yet affected by Iron Grip.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15 (Действие)",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15 (Action)",
        "effectRu": "Противнику сложнее выбраться из захвата: он получает штраф -2 ко всем последующим попыткам вырваться. Кроме того, пока противник в захвате, он не может совершать дальние атаки.",
        "effectEn": "Target suffers a -2 penalty to all escape attempts. While grappled, target cannot make ranged attacks.",
        "targetDv": 15,
        "source": "Corebook"
      }
    ]
  },
  "Karate": {
    "id": "Karate",
    "nameRu": "Каратэ (Karate)",
    "nameEn": "Karate",
    "source": "Corebook",
    "category": "Corebook",
    "descriptionRu": "Жёсткий ударный стиль, нацеленный на сокрушение костей и пробитие брони противника мощными прямолинейными ударами кулаков и стоп.",
    "descriptionEn": "Hard linear striking style designed to shatter bones and penetrate armored plating with overwhelming direct impacts.",
    "moves": [
      {
        "id": "karate_armor_break",
        "nameRu": "Сломать броню (Armor Breaking Strike)",
        "nameEn": "Armor Breaking Strike",
        "style": "Karate",
        "requirementRu": "В этот ход вы нанесли удар одной и той же цели атакой Рукопашного боя и атакой Боевых Искусств.",
        "requirementEn": "You hit the same target with both a Brawling attack and a Martial Arts attack this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Броня противника снижается ещё на два пункта (-2 SP дополнительной абляции брони за один ход!).",
        "effectEn": "Target armor SP is ablated by an additional 2 points (-2 extra SP ablation!).",
        "targetDv": 15,
        "damageBonus": "-2 SP Ablation",
        "source": "Corebook"
      },
      {
        "id": "karate_bone_break",
        "nameRu": "Костедробительный удар (Bone Breaking Strike)",
        "nameEn": "Bone Breaking Strike",
        "style": "Karate",
        "requirementRu": "ВОЛЯ 8 или выше. Вместо двух атак Боевыми Искусствами вы тратите Действие на сокрушительный удар.",
        "requirementEn": "WILL 8+. Spend Action instead of making 2 Martial Arts attacks.",
        "checkRu": "DEX + Боевые искусства + 1d10 против Уклонения (или со штрафом -8 в голову)",
        "checkEn": "DEX + Martial Arts + 1d10 vs Defender Evasion (or at -8 aimed head)",
        "effectRu": "При попадании в дополнение к урону цель автоматически получает критическую травму «Перелом рёбер» (+5 урона в ОЗ). При ударе в голову со штрафом -8 наносит «Перелом черепа»!",
        "effectEn": "On hit, deals damage and automatically inflicts Broken Ribs (+5 HP crit). If aimed at head (-8), inflicts Fractured Skull!",
        "damageBonus": "+5 Crit HP",
        "source": "Corebook"
      }
    ]
  },
  "Judo": {
    "id": "Judo",
    "nameRu": "Дзюдо (Judo)",
    "nameEn": "Judo",
    "source": "Corebook",
    "category": "Corebook",
    "descriptionRu": "Мягкий стиль бросков, подсечек и заломов, использующий инерцию и силу нападающего против него самого.",
    "descriptionEn": "Soft grappling and throwing style that redirects the opponent’s momentum to slam them down and lock joints.",
    "moves": [
      {
        "id": "judo_counter_throw",
        "nameRu": "Контрбросок (Counter Throw)",
        "nameEn": "Counter Throw",
        "style": "Judo",
        "requirementRu": "Вы смогли уклониться от всех ближних атак со своего прошлого хода.",
        "requirementEn": "You dodged all melee attacks directed at you since your last turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15 (Действие)",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15 (Action)",
        "effectRu": "Вы применяете действие «Бросок» на одну из целей, от атак которой уклонились, БЕЗ предварительного захвата! От этого броска нельзя уклониться. Цель падает (Prone) и получает урон.",
        "effectEn": "Perform Throw action on attacker without grappling first! This throw cannot be dodged. Target is knocked Prone and takes full damage.",
        "targetDv": 15,
        "source": "Corebook"
      },
      {
        "id": "judo_break_free",
        "nameRu": "Выйти из захвата с переломом (Break Free & Fracture)",
        "nameEn": "Break Free & Fracture",
        "style": "Judo",
        "requirementRu": "В этот ход вы провели 2 атаки ближнего боя по удерживающему вас противнику.",
        "requirementEn": "You landed 2 melee attacks this turn against the opponent grappling you.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Вы мгновенно вырываетесь из захвата, и противник получает критическую травму «Перелом руки» (+5 урона в ОЗ, рука недееспособна, вы выбираете какую руку сломать)!",
        "effectEn": "Instantly break free and target suffers Broken Arm Critical Injury (+5 HP, arm disabled, you choose which arm)!",
        "targetDv": 15,
        "damageBonus": "+5 Crit HP",
        "source": "Corebook"
      }
    ]
  },
  "Taekwondo": {
    "id": "Taekwondo",
    "nameRu": "Тхэквондо (Taekwondo)",
    "nameEn": "Taekwondo",
    "source": "Corebook",
    "category": "Corebook",
    "descriptionRu": "Жёсткий стиль с преобладанием молниеносных прыжков, высоких ударов ногами и точечных сокрушительных атак по болевым точкам.",
    "descriptionEn": "Dynamic striking art emphasizing explosive leaps, spinning roundhouses, and surgical nerve strikes.",
    "moves": [
      {
        "id": "taekwondo_pressure_point",
        "nameRu": "Удар по болевым точкам (Pressure Point Strike)",
        "nameEn": "Pressure Point Strike",
        "style": "Taekwondo",
        "requirementRu": "ВОЛЯ 8 или выше. Вместо двух атак Боевыми Искусствами потратить Действие на одиночный удар.",
        "requirementEn": "WILL 8+. Spend Action instead of 2 Martial Arts attacks.",
        "checkRu": "DEX + Боевые искусства + 1d10 против Уклонения (или со штрафом -8 в голову)",
        "checkEn": "DEX + Martial Arts + 1d10 vs Defender Evasion (or at -8 aimed head)",
        "effectRu": "При попадании цель получает критическую травму «Травма позвоночника» в дополнение к урону. При ударе в голову со штрафом -8 цель получает «Черепно-мозговую травму»!",
        "effectEn": "Deals damage and inflicts Spinal Injury Critical Injury. If aimed at head (-8), inflicts Foreign Brain Injury / Concussion!",
        "damageBonus": "+5 Crit HP",
        "source": "Corebook"
      },
      {
        "id": "taekwondo_flying_kick",
        "nameRu": "Летящий удар (Flying Kick)",
        "nameEn": "Flying Kick",
        "style": "Taekwondo",
        "requirementRu": "СКО 8 или выше. Переместиться как минимум на 4 метра по прямой линии к цели в этот ход.",
        "requirementEn": "MOVE 8+. Move at least 4m in a straight line toward target before striking.",
        "checkRu": "DEX + Боевые искусства + 1d10 против Уклонения цели (Действие)",
        "checkEn": "DEX + Martial Arts + 1d10 vs Defender Evasion (Action)",
        "effectRu": "Наносит урон в тело. Цель падает с ног (Prone) и слетает с любого мотоцикла или другого открытого транспортного средства без закрытой кабины!",
        "effectEn": "Deals damage, knocks target Prone, and violently dismounts them from any bike or open vehicle!",
        "source": "Corebook"
      }
    ]
  },
  "ArasakaTe": {
    "id": "ArasakaTe",
    "nameRu": "Арасака-Тэ (Arasaka-te)",
    "nameEn": "Arasaka-te",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Боевой стиль, разработанный Arasaka до Четвёртой Корпоративной Войны. Благодаря простоте мог преподаваться кому угодно, что позволило корпорации франчайзить додзё в торговых центрах по всему миру.",
    "descriptionEn": "Corporate combat system developed by Arasaka before the 4th Corporate War, streamlined for rapid training and corporate security franchisees.",
    "moves": [
      {
        "id": "arasaka_retaliatory",
        "nameRu": "Ответный удар (Retaliatory Strike)",
        "nameEn": "Retaliatory Strike",
        "style": "ArasakaTe",
        "requirementRu": "С момента вашего прошлого хода вы получили урон от атаки рукопашного боя, боевых искусств или оружия ближнего боя.",
        "requirementEn": "Took damage from brawling, martial arts, or melee weapon attack since last turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Штраф за прицельную атаку оружием ближнего боя или БИ по атаковавшей цели уменьшается с -8 до -5 до конца вашего хода.",
        "effectEn": "Aimed shot penalty with melee or MA attacks against that attacker drops from -8 to -5 until end of turn.",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "arasaka_escape",
        "nameRu": "Выход из захвата (Grapple Reversal)",
        "nameEn": "Grapple Reversal",
        "style": "ArasakaTe",
        "requirementRu": "Вы являетесь защищающимся в захвате.",
        "requirementEn": "You are defending in a grapple.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "При успехе вы мгновенно освобождаетесь и больше не находитесь в захвате!",
        "effectEn": "On success you instantly escape and are no longer in the grapple!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "Escrima": {
    "id": "Escrima",
    "nameRu": "Эскрима / Кали (Escrima / Kali)",
    "nameEn": "Escrima / Kali",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Филиппинское искусство с акцентом на координацию клинков, палок и пустых рук. Одно из самых скоростных и смертоносных на планете.",
    "descriptionEn": "Filipino martial art with weapon flow mastery, renowned worldwide for devastating coordination with sticks, blades, and cyber-weapons.",
    "moves": [
      {
        "id": "escrima_combo",
        "nameRu": "Скоординированная комбинация (Coordinated Combo)",
        "nameEn": "Coordinated Combo",
        "style": "Escrima",
        "requirementRu": "Дважды попали по одной и той же цели в этот ход атаками БИ (Эскрима) или лёгким/средним оружием ближнего боя (включая киберимпланты и боевые перчатки).",
        "requirementEn": "Hit the same target twice this turn with Escrima or Light/Medium melee weapons.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Цель получает критическую травму «Разрыв мышц» (Torn Muscle, без бонусного урона от травмы).",
        "effectEn": "Target suffers Torn Muscle Critical Injury (without bonus crit damage).",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "escrima_disarm",
        "nameRu": "Техника обезоруживания (Disarm Technique)",
        "nameEn": "Disarm Technique",
        "style": "Escrima",
        "requirementRu": "С прошлого хода уклонились от всех атак оружием ближнего боя. В ваших руках — холодное оружие.",
        "requirementEn": "Dodged all melee weapon attacks since last turn. Holding a melee weapon.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Одно холодное оружие в руках противника в ближнем бою оказывается либо у вас в руках, либо падает на пол.",
        "effectEn": "One melee weapon held by an adjacent attacker drops to the floor or is taken into your hands.",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "Boxing": {
    "id": "Boxing",
    "nameRu": "Бокс (Boxing)",
    "nameEn": "Boxing",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Прямолинейное боевое искусство, основанное на ударах и парировании. Универсально в своей простоте — позволяет как выматывать противника, так и добивать его шквалом ударов.",
    "descriptionEn": "Pugilistic art centered on tight guards, slipping, head movement, devastating jabs, and bout-ending hooks.",
    "moves": [
      {
        "id": "boxing_knockout",
        "nameRu": "Нокаутирующий удар (Knockout Punch / Haymaker)",
        "nameEn": "Knockout Punch / Haymaker",
        "style": "Boxing",
        "requirementRu": "ТЕЛ 8 или выше. Вместо двух обычных атак боевых искусств потратить Действие.",
        "requirementEn": "BODY 8+. Spend Action instead of making 2 normal Martial Arts attacks.",
        "checkRu": "DEX + Боевые искусства + 1d10 со штрафом -5 против Уклонения цели",
        "checkEn": "DEX + Martial Arts + 1d10 at -5 penalty vs target Evasion",
        "effectRu": "Удар в голову (как прицельная атака). Цель получает урон БИ и критическую травму «Сломанная челюсть» (Broken Jaw, +5 урона в ОЗ)!",
        "effectEn": "Aimed head strike. Deals full damage and target suffers Broken Jaw Critical Injury (+5 HP)!",
        "damageBonus": "+5 Crit HP",
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "boxing_flurry",
        "nameRu": "Серия ударов (Flurry of Blows)",
        "nameEn": "Flurry of Blows",
        "style": "Boxing",
        "requirementRu": "Дважды попали по одной и той же цели атаками Драки в этот ход.",
        "requirementEn": "Hit the same target twice with Brawling attacks this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Совершите одну дополнительную бесплатную атаку Драки по этой же цели!",
        "effectEn": "Make one immediate bonus Brawling attack against that target!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "Capoeira": {
    "id": "Capoeira",
    "nameRu": "Капоэйра (Capoeira)",
    "nameEn": "Capoeira",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Боевой стиль, возникший среди бразильских рабов. Его движения напоминают акробатический танец. Мастера двигаются в бою с невероятной пластикой и непредсказуемой траекторией ударов.",
    "descriptionEn": "Afro-Brazilian fighting art disguised as dance, relying on fluid swaying momentum and razor-sharp sweeping kicks.",
    "moves": [
      {
        "id": "capoeira_recovery",
        "nameRu": "Ритмичное восстановление (Rhythmic Recovery)",
        "nameEn": "Rhythmic Recovery",
        "style": "Capoeira",
        "requirementRu": "Вы промахнулись по цели атакой боевых искусств (Капоэйра) в этот ход.",
        "requirementEn": "You missed a Capoeira Martial Arts attack this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Совершите одну атаку Драки по цели в ближнем бою!",
        "effectEn": "Immediately make one Brawling attack against an adjacent target!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "capoeira_dance",
        "nameRu": "Танец-рассечение (Slashing Dance)",
        "nameEn": "Slashing Dance",
        "style": "Capoeira",
        "requirementRu": "Нанесли критическую травму лёгким/средним холодным оружием в этот ход ИЛИ потратили более 3 очков Удачи на атаку.",
        "requirementEn": "Inflicted a Crit with Light/Medium melee weapon OR spent >3 Luck on an attack.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Совершите одну дополнительную атаку боевых искусств (Капоэйра) по цели в ближнем бою!",
        "effectEn": "Make one immediate bonus Capoeira Martial Arts attack against a melee target!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "ChoyLiFut": {
    "id": "ChoyLiFut",
    "nameRu": "Цайлифо (Choy Li Fut)",
    "nameEn": "Choy Li Fut",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Китайское боевое искусство, сочетающее скорость и универсальность. Широкие размашистые круговые удары дают решающее преимущество при сражении с несколькими противниками.",
    "descriptionEn": "Chinese martial art combining southern circular hammer strikes with northern agile footwork, designed to crush groups.",
    "moves": [
      {
        "id": "choy_footwork",
        "nameRu": "Шаолиньский шаг (Shaolin Footwork)",
        "nameEn": "Shaolin Footwork",
        "style": "ChoyLiFut",
        "requirementRu": "СКО 6 или выше. Уклонились от всех атак с прошлого хода. Ещё не совершали Бег в этот ход.",
        "requirementEn": "MOVE 6+. Dodged all attacks since last turn. Have not taken Run action yet this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Вы совершаете действие Бег без затрат Действия! (Повторно использовать Бег в этот ход нельзя).",
        "effectEn": "You execute the Run action without spending your Action! (Cannot run again this turn).",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "choy_sweeping",
        "nameRu": "Размашистый удар (Sweeping Strike)",
        "nameEn": "Sweeping Strike",
        "style": "ChoyLiFut",
        "requirementRu": "СКО 6 или выше. Дважды попали по одной цели атаками БИ (Цайлифо) в этот ход.",
        "requirementEn": "MOVE 6+. Hit the same target twice with Choy Li Fut attacks this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Совершите одну атаку Драки по другой цели в ближнем бою, которую вы ещё не атаковали в этот ход!",
        "effectEn": "Make one Brawling attack against a different adjacent target not yet attacked this turn!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "DrunkenBoxing": {
    "id": "DrunkenBoxing",
    "nameRu": "Пьяный кулак (Drunken Boxing / Zui Quan)",
    "nameEn": "Drunken Boxing",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Китайский стиль, имитирующий движения пьяного, чтобы неожиданно атаковать и защищаться через непредсказуемые изгибы тела и использование окружения.",
    "descriptionEn": "Deceptive martial art mimicking stumbling drunkenness to throw awkward heavy strikes and use terrain unpredictably.",
    "moves": [
      {
        "id": "drunken_improv",
        "nameRu": "Импровизация подручными средствами (Improvised Brawling)",
        "nameEn": "Improvised Brawling",
        "style": "DrunkenBoxing",
        "requirementRu": "УДЧ 4 или выше (характеристика).",
        "requirementEn": "LUCK 4+ (base stat).",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ13",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 13",
        "effectRu": "Выберите объект или стену рядом: все ваши атаки Драки в этом ходу игнорируют 50% SP брони цели (урон до 4d6 по согласию Ведущего)!",
        "effectEn": "Pick an object or wall nearby: all Brawling attacks this turn ignore half SP (damage up to 4d6 with GM agreement)!",
        "targetDv": 13,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "drunken_lucky",
        "nameRu": "Счастливый случай (Lucky Break)",
        "nameEn": "Lucky Break",
        "style": "DrunkenBoxing",
        "requirementRu": "УДЧ 4 или выше (характеристика). На вас совершается неожиданная атака (даже если вы без сознания).",
        "requirementEn": "LUCK 4+ (base stat). An attack is made against you that you are unaware of (even unconscious).",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Вы уклоняетесь от атаки (даже от пуль!). При первом успешном использовании за сессию восстанавливает до 2 потраченных очков Удачи!",
        "effectEn": "Dodge the attack (even bullets!). First success per session restores up to 2 spent Luck points!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "GunFu": {
    "id": "GunFu",
    "nameRu": "Ган-Фу (Gun-Fu)",
    "nameEn": "Gun-Fu",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Боевой стиль, сочетающий рукопашный бой и стрельбу из пистолетов в упор. Смертоносен в замкнутых пространствах. Тренирует использование пистолета как продолжения тела.",
    "descriptionEn": "Lethal tactical hybrid fusing close combat martial arts with point-blank pistol shooting in tight quarters.",
    "moves": [
      {
        "id": "gunfu_reload",
        "nameRu": "Боевая перезарядка (Combat Reload)",
        "nameEn": "Combat Reload",
        "style": "GunFu",
        "requirementRu": "Попали по цели атакой БИ (Ган-Фу). Ещё не перезаряжались в этот ход.",
        "requirementEn": "Hit target with Gun-Fu attack. Have not reloaded yet this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Вы совершаете перезарядку оружия в руках без траты Действия!",
        "effectEn": "Reload your held firearm without spending an Action!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "gunfu_woo",
        "nameRu": "Приём Ву (Woo Technique / Gun Kata)",
        "nameEn": "Woo Technique / Gun Kata",
        "style": "GunFu",
        "requirementRu": "Навык Пистолеты 4+ или Боевое чутьё (Соло) 1+. В руках одноручный пистолет со СКА2.",
        "requirementEn": "Handgun skill 4+ or Solo Combat Sense 1+. Holding a single-handed ROF 2 handgun.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Дистанция атак БИ увеличивается до 25 м! Атаки считаются рукопашными (игнорируют 50% SP), наносят урон пистолета и расходуют патроны.",
        "effectEn": "Gun-Fu strike range increases up to 25m! Counts as melee (half SP), deals firearm damage, expends ammo.",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "JiuJitsu": {
    "id": "JiuJitsu",
    "nameRu": "Джиу-Джитсу (Jiu-Jitsu)",
    "nameEn": "Jiu-Jitsu",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Японское боевое искусство, основанное на подчинении силы противника и направлении её против него самого через рычаги и удушения.",
    "descriptionEn": "Japanese soft martial art manipulating balance, leverage, and opponent power to ground and control heavy foes.",
    "moves": [
      {
        "id": "jiujitsu_aiki",
        "nameRu": "Айки (Aiki)",
        "nameEn": "Aiki",
        "style": "JiuJitsu",
        "requirementRu": "Попали по цели атакой БИ и собираетесь нанести урон.",
        "requirementEn": "Hit target with Martial Arts attack and about to roll damage.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "До конца хода вы можете использовать показатель ТЕЛ цели вместо своего для расчёта урона от Драки и БИ!",
        "effectEn": "Until end of turn you may use target BODY instead of yours for calculating Brawling and MA damage!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "jiujitsu_throw",
        "nameRu": "Приём броска (Throw Technique)",
        "nameEn": "Throw Technique",
        "style": "JiuJitsu",
        "requirementRu": "ВОЛЯ 6 или выше. Дважды попали по цели атаками БИ (Джиу-Джитсу) в этот ход.",
        "requirementEn": "WILL 6+. Hit target twice with Jiu-Jitsu attacks this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Совершите действие «Бросок» по цели БЕЗ предварительного захвата! Можно использовать ТЕЛ цели для расчёта урона.",
        "effectEn": "Execute Throw action without grappling first! You may use target BODY for throw damage.",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "Kendo": {
    "id": "Kendo",
    "nameRu": "Кендо / Кэндзюцу (Kendo / Kenjutsu)",
    "nameEn": "Kendo / Kenjutsu",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Современное японское «Путь меча». Боевое искусство с родословной, уходящей к эпохе самураев — воинскому сословию, а не музыкальной группе.",
    "descriptionEn": "Modern \"Way of the Sword\" descended from samurai warrior disciplines, deflecting ranged fire and executing lethal slices.",
    "moves": [
      {
        "id": "kendo_bullet_cut",
        "nameRu": "Разрез пули (Bullet Cut)",
        "nameEn": "Bullet Cut",
        "style": "Kendo",
        "requirementRu": "ВОЛЯ 8+, Навык Холодное оружие 6+. Держите в руках холодное оружие. В вас стреляют одиночным выстрелом или взрывом.",
        "requirementEn": "WILL 8+, Melee Weapon 6+. Holding melee weapon. Targeted by single shot or explosive.",
        "checkRu": "DEX + Боевые искусства + 1d10 против броска атаки стрелка",
        "checkEn": "DEX + Martial Arts + 1d10 vs Attacker roll",
        "effectRu": "При успехе атака рассекается клинком и не наносит урон! (При провале взрыва вы становитесь эпицентром).",
        "effectEn": "On success attack is sliced mid-air and deals zero damage! (On blast failure you are blast center).",
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "kendo_focus",
        "nameRu": "Ки Кен Тай Но Ити (Ki Ken Tai No Ichi)",
        "nameEn": "Ki Ken Tai No Ichi",
        "style": "Kendo",
        "requirementRu": "Вы находитесь в бою. Потратить Действие на медитативную концентрацию меча.",
        "requirementEn": "In combat. Spend Action centering spirit and sword.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Штраф за прицельную атаку оружием ближнего боя на вашем следующем ходу снижается до -2 (вместо стандартных -8)!",
        "effectEn": "Aimed shot penalty with melee weapon on your next turn drops to -2 (instead of -8)!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "KravMaga": {
    "id": "KravMaga",
    "nameRu": "Крав-Мага (Krav Maga)",
    "nameEn": "Krav Maga",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Израильское боевое искусство, сочетающее техники айкидо, бокса, дзюдо, каратэ и борьбы с акцентом на применимость в экстремальных ситуациях самообороны.",
    "descriptionEn": "Tactical survival fighting system built on simultaneous defense and aggressive counter-attacks.",
    "moves": [
      {
        "id": "krav_contact",
        "nameRu": "Контактный бой (Close Contact)",
        "nameEn": "Close Contact",
        "style": "KravMaga",
        "requirementRu": "В этот ход нанесли критическое ранение приёмом БИ стилей Айкидо, Бокс, Дзюдо, Каратэ, Крав-Мага или Реслинг.",
        "requirementEn": "Inflicted Critical Injury with a move of Aikido, Boxing, Judo, Karate, Krav Maga, or Wrestling this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Совершите одну бесплатную атаку рукопашного боя по цели, которой нанесли травму!",
        "effectEn": "Make one immediate bonus melee attack against that target!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "krav_punishing",
        "nameRu": "Карательный удар (Punishing Counter)",
        "nameEn": "Punishing Counter",
        "style": "KravMaga",
        "requirementRu": "С прошлого хода уклонились от всех атак ближнего боя.",
        "requirementEn": "Dodged all melee attacks directed at you since last turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Совершите одну атаку Драки по цели, которая атаковала вас в ближнем бою!",
        "effectEn": "Make one Brawling attack against the enemy who attacked you in melee!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "KungFu": {
    "id": "KungFu",
    "nameRu": "Кунг-Фу (Kung Fu)",
    "nameEn": "Kung Fu",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Древнейшее китайское боевое искусство — предок множества других стилей. В умелых руках оно практически непобедимо благодаря мастерству Пяти Форм.",
    "descriptionEn": "Legendary Chinese traditional martial art mastering the Five Animal Forms, balance, and turn order dominance.",
    "moves": [
      {
        "id": "kungfu_forms",
        "nameRu": "Пять форм (Five Animal Forms)",
        "nameEn": "Five Animal Forms",
        "style": "KungFu",
        "requirementRu": "Навык БИ (Кунг-Фу) 4+. Вместо 2 атак потратить Действие. Выбрать 2 формы (Журавль, Дракон, Леопард, Змея, Тигр).",
        "requirementEn": "Kung Fu skill 4+. Spend Action instead of 2 attacks. Pick 2 forms (Crane, Dragon, Leopard, Snake, Tiger).",
        "checkRu": "DEX + Боевые искусства + 1d10 против Уклонения цели",
        "checkEn": "DEX + Martial Arts + 1d10 vs Defender Evasion",
        "effectRu": "Наносит урон + эффект 1-й формы (Журавль: кравма Повреждённый глаз; Дракон: +1 к след. атаке; Леопард: СКО +2; Змея: +1 Удача; Тигр: +1 абляция SP). На след. ходу срабатывает 2-я форма!",
        "effectEn": "Deals damage + Form 1 effect (Crane: Damaged Eye crit; Dragon: +1 attack; Leopard: MOVE +2; Snake: +1 Luck; Tiger: +1 SP ablation). Form 2 applies on next turn hit!",
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "kungfu_stance",
        "nameRu": "Превосходная стойка (Superior Stance)",
        "nameEn": "Superior Stance",
        "style": "KungFu",
        "requirementRu": "Попали по цели атакой боевых искусств в этот ход.",
        "requirementEn": "Hit target with Martial Arts attack this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ17",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 17",
        "effectRu": "При успехе вы немедленно перемещаетесь на САМУЮ ВЕРХНЮЮ позицию в шкале Инициативы боя!",
        "effectEn": "On success you instantly move to the TOP position in combat Initiative order!",
        "targetDv": 17,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "Kyudo": {
    "id": "Kyudo",
    "nameRu": "Кюдо (Kyudo)",
    "nameEn": "Kyudo",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Японское боевое искусство стрельбы из лука. В современном боевом варианте Найт-Сити включает специальный набор стоек ближнего боя, дополняющих владение луком.",
    "descriptionEn": "Traditional Japanese archery martial art, featuring focused meditative stances that multiply bow lethality in modern firefights.",
    "moves": [
      {
        "id": "kyudo_hassetsu",
        "nameRu": "Хассэцу (Hassetsu Stance)",
        "nameEn": "Hassetsu Stance",
        "style": "Kyudo",
        "requirementRu": "Не в нокдауне и не в захвате. В руках оружие с навыком Лук. Потратить Действие.",
        "requirementEn": "Not prone or grappled. Holding weapon using Bow skill. Spend Action.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Входите в Стойку Кюдо: первая атака на вашем ходу оружием со СКА1 и Навыком Лук наносит +2d6 урона! (Стойка спадает при беге >6м, получении ближнего урона, захвате или нокдауне).",
        "effectEn": "Enter Kyudo Stance: first ROF 1 Bow attack each turn deals +2d6 bonus damage! (Breaks on moving >6m, melee hit, grapple, or knockdown).",
        "targetDv": 15,
        "damageBonus": "+2d6 Bow",
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "kyudo_zaiteki",
        "nameRu": "Дзайтеки (Zaiteki Aim)",
        "nameEn": "Zaiteki Aim",
        "style": "Kyudo",
        "requirementRu": "Попали по цели прицельным выстрелом из оружия с Навыком Лук в этот ход.",
        "requirementEn": "Hit target with an aimed shot using Bow skill this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Вы восстанавливаете до 2 потраченных очков Удачи!",
        "effectEn": "Restore up to 2 spent Luck points!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "MilitechKnife": {
    "id": "MilitechKnife",
    "nameRu": "Боевая подготовка Militech (Militech Knife Combat)",
    "nameEn": "Militech Knife Combat",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Боевой стиль, разработанный Militech для обучения корпоративных коммандос правильному и смертоносному использованию боевых ножей.",
    "descriptionEn": "Military combat doctrine engineered by Militech instructors for lethal tactical knife deployment and rapid disarms.",
    "moves": [
      {
        "id": "militech_knife_training",
        "nameRu": "Обучение боевому ножу (Combat Knife Training)",
        "nameEn": "Combat Knife Training",
        "style": "MilitechKnife",
        "requirementRu": "Первая атака в ход лёгким или средним оружием ближнего боя.",
        "requirementEn": "First attack of turn using Light or Medium melee weapon.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "До конца хода урон вашего лёгкого или среднего холодного оружия повышается до 4d6, а СКА понижается до 1!",
        "effectEn": "Melee weapon damage increases to 4d6 until end of turn (ROF drops to 1)!",
        "targetDv": 15,
        "damageBonus": "Damage -> 4d6",
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "militech_disarm",
        "nameRu": "Разоружение со встречным ударом (Disarm & Strike)",
        "nameEn": "Disarm & Strike",
        "style": "MilitechKnife",
        "requirementRu": "Свободны две руки. Потратить Действие против цели с оружием в руках.",
        "requirementEn": "Both hands free. Spend Action vs target holding a weapon.",
        "checkRu": "DEX + Боевые искусства + 1d10 против проверки Драки цели",
        "checkEn": "DEX + Martial Arts + 1d10 vs Target Brawling check",
        "effectRu": "Оружие цели оказывается в ваших руках, и вы сразу атакуете эту же цель этим оружием без траты Действия!",
        "effectEn": "Target weapon is snatched into your hands, and you immediately attack that target with it!",
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "MuayThai": {
    "id": "MuayThai",
    "nameRu": "Тайский бокс / Муай-Тай (Muay Thai)",
    "nameEn": "Muay Thai",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Тайское боевое искусство, сфокусированное на жестоких ударах локтями, коленями и голенями. Практикующие проходят экстремальную подготовку тела — зачастую с не менее экстремальными имплантами.",
    "descriptionEn": "The Art of Eight Limbs: devastating elbow cuts, knee drives, and heavy roundhouses conditioned through intense combat training.",
    "moves": [
      {
        "id": "muay_fury",
        "nameRu": "Закалённая ярость (Hardened Fury)",
        "nameEn": "Hardened Fury",
        "style": "MuayThai",
        "requirementRu": "С начала прошлого хода нанесли урон хотя бы одной цели атакой боевых искусств.",
        "requirementEn": "Dealt damage to a target with Martial Arts since start of last turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "До конца текущего хода урон всех ваших атак Рукопашного боя увеличивается на +1d6 (максимум до 4d6), и все атаки получают бонус +1!",
        "effectEn": "Melee attack damage increases by +1d6 (max 4d6) and all melee attacks gain +1 bonus until end of turn!",
        "targetDv": 15,
        "damageBonus": "+1d6 Melee",
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "muay_might",
        "nameRu": "Закалённая мощь (Hardened Might)",
        "nameEn": "Hardened Might",
        "style": "MuayThai",
        "requirementRu": "С начала прошлого хода нанесли урон хотя бы одной цели атакой Драки.",
        "requirementEn": "Dealt damage to a target with Brawling since start of last turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Урон от вашей следующей атаки боевых искусств в этот ход увеличивается на +1d6!",
        "effectEn": "Your next Martial Arts attack this turn deals an extra +1d6 damage!",
        "targetDv": 15,
        "damageBonus": "+1d6 MA",
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "YukonMultiArmed": {
    "id": "YukonMultiArmed",
    "nameRu": "Многорукий ближний бой (Yukon Multi-Armed Combat)",
    "nameEn": "Yukon Multi-Armed Combat",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Боевой стиль, разработанный жителями долины Юкон в Свободном Штате Аляска, чтобы противостоять генно-модифицированным медведям Biotechnica и диверсантам Petrochem с помощью дополнительных киберрук.",
    "descriptionEn": "Yukon Valley combat style engineered to overpower genetically enhanced wildlife and corporate squads using multi-cyberarm brawling.",
    "moves": [
      {
        "id": "yukon_armed",
        "nameRu": "Вооружён и опасен (Armed & Dangerous)",
        "nameEn": "Armed & Dangerous",
        "style": "YukonMultiArmed",
        "requirementRu": "У вас больше рук, чем у цели, которую вы атакуете рукопашной атакой.",
        "requirementEn": "You have more arms than your target.",
        "checkRu": "DEX + БИ + 1d10 против СЛ15 (1-я попытка) / СЛ17 (2-я попытка)",
        "checkEn": "DEX + MA + 1d10 vs DV 15 (1st attempt) / DV 17 (2nd attempt)",
        "effectRu": "Выберите эффект: бросьте 1d10 атаки дважды и выберите лучший результат, уменьшите штраф прицельной атаки Дракой с -8 до -5, либо перераспределите очки Боевого Чутья (Соло)!",
        "effectEn": "Pick one: roll attack with advantage (2d10 take highest), reduce aimed brawling penalty to -5, or reallocate Combat Sense points!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "yukon_crack_skulls",
        "nameRu": "Стукни друг о друга (Crack Skulls Together)",
        "nameEn": "Crack Skulls Together",
        "style": "YukonMultiArmed",
        "requirementRu": "ТЕЛ 6 или выше. Вы являетесь нападающим в двух или более захватах одновременно. Потратить Действие.",
        "requirementEn": "BODY 6+. Attacker in two or more grapples simultaneously. Spend Action.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Все удерживаемые вами цели получают прямой урон, равный вашей характеристике ТЕЛ (игнорирует всю броню SP)!",
        "effectEn": "All grappled targets take direct damage equal to your BODY stat (completely ignores all SP)!",
        "targetDv": 15,
        "damageBonus": "Direct BODY HP",
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "FpaBorg": {
    "id": "FpaBorg",
    "nameRu": "Панцерфауст / Стиль ПКТ (FPA Borg Style)",
    "nameEn": "Panzerfaust / FPA Borg Style",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Боевой стиль, разработанный ПКТ (Полными Киборгами) для ПКТ. Его техники построены вокруг высвобождения ужасающей гидравлической силы металлического тела против мягкой человеческой плоти.",
    "descriptionEn": "Full Body Conversion style designed by borgs for borgs, turning hydraulic metal limbs into unstoppable battering rams.",
    "moves": [
      {
        "id": "borg_fist",
        "nameRu": "Кулак борга (Borg Fist)",
        "nameEn": "Borg Fist",
        "style": "FpaBorg",
        "requirementRu": "ТЕЛ 10 или выше. Потратить Действие против цели с ТЕЛ ниже вашего.",
        "requirementEn": "BODY 10+. Spend Action against a target with lower BODY.",
        "checkRu": "DEX + Боевые искусства + 1d10 против Уклонения",
        "checkEn": "DEX + Martial Arts + 1d10 vs Defender Evasion",
        "effectRu": "Атака БИ наносит 5d6 урона вместо обычного! (Если ваша Человечность ниже 0 — урон увеличивается до 6d6!).",
        "effectEn": "Martial Arts strike deals 5d6 damage! (Increases to 6d6 if your Humanity is below 0!).",
        "damageBonus": "5d6 / 6d6",
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "borg_internal_chrome",
        "nameRu": "Внутренний хром (Internal Chrome Resilience)",
        "nameEn": "Internal Chrome Resilience",
        "style": "FpaBorg",
        "requirementRu": "Вы в ПКТ или Человечность < 0. Имплант отключён, повреждён или получил критическую травму.",
        "requirementEn": "In FBC or Humanity < 0. An implant is disabled, EMP-damaged, or critically injured.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ11 (+2 к СЛ за каждый повреждённый имплант)",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 11 (+2 per disabled implant)",
        "effectRu": "Все повреждённые импланты работают как обычно до конца боя и защищены от повторного отключения до следующего хода (или до конца боя при успехе на СЛ15+ и Человечности < 0)!",
        "effectEn": "All disabled implants work normally until combat ends and cannot be disabled again!",
        "targetDv": 11,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "PencakSilat": {
    "id": "PencakSilat",
    "nameRu": "Силат (Pencak Silat)",
    "nameEn": "Pencak Silat",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Естественное слияние множества коренных боевых искусств Юго-Восточной Азии. Текучие движения, переломы суставов и смертоносная связка с холодным оружием.",
    "descriptionEn": "Southeast Asian martial art combining fluid ground transitions, sudden joint breaks, and rapid knife insertions.",
    "moves": [
      {
        "id": "silat_internal_strength",
        "nameRu": "Внутренняя сила (Internal Strength)",
        "nameEn": "Internal Strength",
        "style": "PencakSilat",
        "requirementRu": "ВОЛЯ 6 или выше. Дважды поразили одну цель в этот ход (БИ Силат или лёгким/средним оружием ближнего боя).",
        "requirementEn": "WILL 6+. Hit the same target twice this turn with Silat or Light/Medium melee weapons.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Совершите одну дополнительную атаку Драки по цели в ближнем бою!",
        "effectEn": "Make one immediate bonus Brawling attack against an adjacent target!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "silat_brutal_leverage",
        "nameRu": "Жестокий рычаг (Brutal Leverage)",
        "nameEn": "Brutal Leverage",
        "style": "PencakSilat",
        "requirementRu": "В этот ход начали захват цели, которую не захватывали ранее в этом бою.",
        "requirementEn": "Initiated a grapple on a target not grappled previously this combat.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Совершите одну атаку оружием ближнего боя по цели в ближнем бою!",
        "effectEn": "Make one melee weapon attack against an adjacent target!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "SovietSystema": {
    "id": "SovietSystema",
    "nameRu": "Советская Система (Soviet Systema)",
    "nameEn": "Soviet Systema",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Прямой наследник Командного самбо Красной Армии. Модифицирован и адаптирован корпорацией SovOil, одержимо стремящейся создать коммерческое боевое искусство, превосходящее Arasaka-тэ.",
    "descriptionEn": "Evolved from Red Army combat sambo, perfected by SovOil as a ruthless commercial street fighting doctrine.",
    "moves": [
      {
        "id": "soviet_dirty_blow",
        "nameRu": "Грязный удар (Dirty Blow)",
        "nameEn": "Dirty Blow",
        "style": "SovietSystema",
        "requirementRu": "ТЕЛ 4 или выше. Вместо двух атак БИ потратить Действие.",
        "requirementEn": "BODY 4+. Spend Action instead of making 2 Martial Arts attacks.",
        "checkRu": "DEX + Боевые искусства + 1d10 против Уклонения",
        "checkEn": "DEX + Martial Arts + 1d10 vs Defender Evasion",
        "effectRu": "Цель получает урон БИ и случайную Критическую Травму по телу (если выпал «Инородный объект» — перебросить на другую травму)!",
        "effectEn": "Target takes damage plus a random Body Critical Injury (reroll if Foreign Object)!",
        "damageBonus": "+5 Crit HP",
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "soviet_retaliation",
        "nameRu": "Удар возмездия (Retaliatory Strike)",
        "nameEn": "Retaliatory Strike",
        "style": "SovietSystema",
        "requirementRu": "ТЕЛ 4 или выше. С прошлого хода вы получили Критическую Травму от атаки ближнего боя или приёма БИ.",
        "requirementEn": "BODY 4+. Suffered a Critical Injury from melee/MA since your last turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против Уклонения атакующего",
        "checkEn": "DEX + Martial Arts + 1d10 vs Attacker Evasion",
        "effectRu": "Совершите одну атаку БИ по атакующему. Если эта атака приводит к Критической Травме — вы восстанавливаете до 2 очков Удачи!",
        "effectEn": "Make a Martial Arts counter-attack. If it inflicts a Critical Injury, restore up to 2 spent Luck points!",
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "Sumo": {
    "id": "Sumo",
    "nameRu": "Сумо (Sumo)",
    "nameEn": "Sumo",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Японское борцовское боевое искусство, сосредоточенное на том, чтобы сдвинуть противника всей массой своего тела, сокрушить татиаем и выиграть схватку взглядов.",
    "descriptionEn": "Ancient Japanese heavyweight wrestling style utilizing immense forward mass, immovable balance, and intimidating stares.",
    "moves": [
      {
        "id": "sumo_zashi",
        "nameRu": "Дзаси (Zashi Counter-Slam)",
        "nameEn": "Zashi Counter-Slam",
        "style": "Sumo",
        "requirementRu": "ТЕЛ 7 или выше. Вас вот-вот захватят или бросят.",
        "requirementEn": "BODY 7+. You are about to be grappled or thrown.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Вы не захвачены и не брошены! Вы можете переместить себя и нападающего до 6 метров (3 клетки) в любом выбранном направлении!",
        "effectEn": "You negate the grapple/throw! Move both yourself and the attacker up to 6m in any direction!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "sumo_niramiai",
        "nameRu": "Нирамияй (Niramiai Stare-Down)",
        "nameEn": "Niramiai Stare-Down",
        "style": "Sumo",
        "requirementRu": "КРУТ 4 или выше. Вы пытаетесь осадить противника (Facedown).",
        "requirementEn": "COOL 4+. Attempting a Facedown.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "При успехе вы осаживаете противника с бонусом +2 к проверке!",
        "effectEn": "Gain a +2 bonus to your Facedown check!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "TaiChi": {
    "id": "TaiChi",
    "nameRu": "Тай-Чи / Тайцзицюань (Tai Chi)",
    "nameEn": "Tai Chi",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Китайское боевое искусство, направленное на перенаправление и нейтрализацию атак противника, сохраняя при этом внутреннее равновесие и гармонию сил.",
    "descriptionEn": "Internal Chinese martial art deflecting opponent momentum and neutralizing hostile techniques with effortless flow.",
    "moves": [
      {
        "id": "taichi_joint",
        "nameRu": "Манипуляция суставами (Joint Redirection)",
        "nameEn": "Joint Redirection",
        "style": "TaiChi",
        "requirementRu": "Кто-то в пределах досягаемости промахнулся по вам атакой ближнего боя.",
        "requirementEn": "Adjacent enemy missed a melee attack against you.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Выберите одну руку нападающего: он не может использовать её до конца своего следующего хода (при этом не роняет предметы в руке).",
        "effectEn": "Choose an attacker arm: they cannot use it until end of their next turn (without dropping held items).",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "taichi_lu",
        "nameRu": "Лу (Lu Deflection)",
        "nameEn": "Lu Deflection",
        "style": "TaiChi",
        "requirementRu": "ВОЛЯ 8 или выше. Кто-то в пределах досягаемости успешно применил спецприём боевых искусств.",
        "requirementEn": "WILL 8+. Adjacent enemy successfully performed a Martial Arts special move.",
        "checkRu": "DEX + Боевые искусства + 1d10 против результата спецприёма врага",
        "checkEn": "DEX + Martial Arts + 1d10 vs Enemy check total",
        "effectRu": "Приём врага считается полностью отражённым и проваленным (если только он немедленно не ответит ответным Лу)!",
        "effectEn": "Enemy special move is deflected and nullified!",
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "PoliceDefensiveTactics": {
    "id": "PoliceDefensiveTactics",
    "nameRu": "Защитная тактика полиции / ИСС (Police Defensive Tactics)",
    "nameEn": "Police Defensive Tactics",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "«Искусство Современного Столкновения» (ИСС), разработанное для подготовки сотрудников полиции к безопасному удержанию табельного оружия и контролю задержанных.",
    "descriptionEn": "Tactical law enforcement doctrine designed for NCPD officers focusing on weapon retention, takedowns, and suspect containment.",
    "moves": [
      {
        "id": "police_dominant",
        "nameRu": "Выгодная позиция (Dominant Position)",
        "nameEn": "Dominant Position",
        "style": "PoliceDefensiveTactics",
        "requirementRu": "Вы являетесь нападающим в захвате.",
        "requirementEn": "You are attacker in a grapple.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Штраф за прицельную атаку оружием ближнего боя или БИ по удерживаемой цели снижается с -8 до -5 до конца текущего хода.",
        "effectEn": "Aimed strike penalty with melee/MA against the grappled target drops from -8 to -5 until end of turn.",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "police_weapon_retention",
        "nameRu": "Удержание оружия (Weapon Retention)",
        "nameEn": "Weapon Retention",
        "style": "PoliceDefensiveTactics",
        "requirementRu": "У вас пытаются отнять или выбить оружие любым способом (разоружение).",
        "requirementEn": "Someone attempts to disarm you by any means.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Попытка разоружения провалена — оружие остаётся крепко зафиксированным в ваших руках!",
        "effectEn": "Disarm attempt fails — the weapon remains firmly locked in your hands!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "StrikeBoxing": {
    "id": "StrikeBoxing",
    "nameRu": "Ударное самбо / Ударный бокс (Strike Boxing)",
    "nameEn": "Strike Boxing / Combat Sambo",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Гибрид Командного самбо и Ударного бокса — танцеобразного стиля боя, зародившегося в подпольных ночных клубах Восточной Европы в 2020-х. Известен феноменальной стойкостью к боли.",
    "descriptionEn": "Eastern European underground hybrid of combat sambo and club strike boxing famed for damage dampening and pain resistance.",
    "moves": [
      {
        "id": "strike_negation",
        "nameRu": "Хватка (Damage Negation)",
        "nameEn": "Damage Negation",
        "style": "StrikeBoxing",
        "requirementRu": "Вы вот-вот получите Критическую Травму.",
        "requirementEn": "You are about to suffer a Critical Injury.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Вы не получаете бонусного урона (+5 ОЗ) от Критической Травмы (сам эффект и штраф травмы всё равно применяются).",
        "effectEn": "You suffer no bonus crit damage (+5 HP) from the Critical Injury (injury effect still applies).",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "strike_iron_hide",
        "nameRu": "Толстая кожа (Iron Hide)",
        "nameEn": "Iron Hide",
        "style": "StrikeBoxing",
        "requirementRu": "Вы получаете урон от атаки ближнего боя.",
        "requirementEn": "You take damage from a melee attack.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Получаемый урон снижается на 2 (или на 4, если это была атака боевых искусств)!",
        "effectEn": "Incoming melee damage is reduced by 2 (or by 4 if it was a Martial Arts attack)!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  },
  "Wrestling": {
    "id": "Wrestling",
    "nameRu": "Реслинг / Борьба (Wrestling)",
    "nameEn": "Wrestling",
    "source": "Киберкулаки Ярости",
    "category": "Fury",
    "descriptionRu": "Одно из древнейших боевых искусств, сосредоточенное на захвате и удержании противника. Его простота и сокрушительная зрелищная мощь обеспечили ему популярность на улицах Найт-Сити.",
    "descriptionEn": "Ancient grappling art combining high-impact spectacle with street-tested submissions, body slams, and chokes.",
    "moves": [
      {
        "id": "wrestling_choke",
        "nameRu": "Удушающий захват (Instant Choke)",
        "nameEn": "Instant Choke",
        "style": "Wrestling",
        "requirementRu": "Вы являетесь нападающим в захвате и ещё не использовали действие Удушения в этот ход.",
        "requirementEn": "Attacker in grapple and have not used Choke action yet this turn.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Вы применяете действие «Удушение» (-BODY прямо в ОЗ цели, игнорируя всю броню SP) БЕЗ траты Действия!",
        "effectEn": "Execute Choke action (-BODY directly to target HP, ignores all SP) without spending an Action!",
        "targetDv": 15,
        "damageBonus": "Direct BODY HP",
        "source": "Киберкулаки Ярости"
      },
      {
        "id": "wrestling_reversal",
        "nameRu": "Перехват захвата (Grapple Reversal)",
        "nameEn": "Grapple Reversal",
        "style": "Wrestling",
        "requirementRu": "Вы являетесь защищающимся в захвате.",
        "requirementEn": "You are defender in a grapple.",
        "checkRu": "DEX + Боевые искусства + 1d10 против СЛ15",
        "checkEn": "DEX + Martial Arts + 1d10 vs DV 15",
        "effectRu": "Вы вырываетесь из захвата и сами становитесь нападающим в этом захвате!",
        "effectEn": "You break the hold and become the attacker in the grapple!",
        "targetDv": 15,
        "source": "Киберкулаки Ярости"
      }
    ]
  }
};
