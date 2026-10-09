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
  style: MartialArtsStyle;
  requirementRu: string;
  requirementEn: string;
  checkRu: string;
  checkEn: string;
  effectRu: string;
  effectEn: string;
  damageBonus?: string;
}

export interface MartialArtsStyleInfo {
  id: MartialArtsStyle;
  nameRu: string;
  nameEn: string;
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
    checkRu: 'DEX + Мордобой + 1d10 против DEX + Уклонение цели',
    checkEn: 'DEX + Brawling + 1d10 vs Defender DEX + Evasion + 1d10',
    effectRu: 'Наносит урон на основе вашего BODY (игнорирует 50% SP брони цели, округление вверх). Темп стрельбы: ROF 2 (2 удара за действие).',
    effectEn: 'Deals damage based on your BODY stat (ignores half of target SP, rounded up). ROF 2 (2 attacks per action).',
    damageType: 'unarmed'
  },
  {
    id: 'grab',
    nameRu: 'Захват противника (Grab)',
    nameEn: 'Grapple / Grab',
    requirementRu: '1 свободная рука, цель в пределах досягаемости',
    requirementEn: '1 free hand, target within melee reach',
    checkRu: 'DEX + Мордобой + 1d10 против DEX + Мордобой (или Уклонение) цели',
    checkEn: 'DEX + Brawling + 1d10 vs Target DEX + Brawling (or Evasion) + 1d10',
    effectRu: 'При успехе цель захвачена (Grappled): не может перемещаться самостоятельно, получает штраф -2 ко всем действиям (кроме попыток вырваться). Вы можете волочить цель со скоростью 1/2 MOVE или использовать как живой щит (Human Shield). Для освобождения цель тратит Действие на встречный бросок Мордобоя.',
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
    effectRu: 'Наносит урон, равный показателю вашего BODY, НАПРЯМУЮ в Очки Здоровья цели (ПОЛНОСТЬЮ ИГНОРИРУЕТ ВСЮ БРОНЮ SP!). Если удерживать удушение 3 хода подряд — цель теряет сознание (без сознания на 1 минуту или до реанимации).',
    effectEn: 'Deals damage equal to your BODY stat directly to target HP (COMPLETELY IGNORES ALL ARMOR SP!). If choked for 3 consecutive turns, target is knocked unconscious for 1 minute.',
    damageType: 'body_direct'
  },
  {
    id: 'throw',
    nameRu: 'Бросок через себя (Throw)',
    nameEn: 'Throw',
    requirementRu: 'Цель уже находится в вашем захвате (Grappled)',
    requirementEn: 'Target is already Grappled by you',
    checkRu: 'Требует Действие. Завершает захват.',
    checkEn: 'Requires Action. Ends the grapple.',
    effectRu: 'Вы бросаете цель на землю: цель сбита с ног (Prone) и получает полный урон рукопашного удара (на основе вашего BODY, игнорируя 50% SP). Если бросить во второго врага — оба падают с ног и получают урон!',
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
    effectRu: 'Вы держите врага перед собой. Все входящие в вас атаки попадают в живой щит! Урон наносится по SP и HP удерживаемого врага. Когда HP врага падает до 0, он умирает и перестает служить щитом.',
    effectEn: 'You position the grappled target in front of you. Incoming attacks hit the human shield instead, damaging their SP and HP until they reach 0 HP.',
    damageType: 'none'
  }
];

export const CPR_MARTIAL_ARTS_STYLES: Record<MartialArtsStyle, MartialArtsStyleInfo> = {
  Karate: {
    id: 'Karate',
    nameRu: 'Каратэ (Karate)',
    nameEn: 'Karate',
    descriptionRu: 'Жесткий ударный стиль, нацеленный на пробитие защитных слоев и сокрушение костей противника тяжелыми прямыми ударами.',
    descriptionEn: 'Hard-striking style focused on penetrating armored defenses and shattering bones with devastating direct impacts.',
    moves: [
      {
        id: 'armor_breaking_strike',
        nameRu: 'Пробивающий броню удар (Armor Breaking Strike)',
        nameEn: 'Armor Breaking Strike',
        style: 'Karate',
        requirementRu: 'Первая атака боевыми искусствами в этом ходу попала по цели.',
        requirementEn: 'First Martial Arts attack this turn already hit the target.',
        checkRu: 'DEX + Боевые искусства + 1d10 против DEX + Уклонение цели (2-я атака ROF)',
        checkEn: 'DEX + Martial Arts + 1d10 vs Defender DEX + Evasion + 1d10 (2nd ROF attack)',
        effectRu: 'Если этот второй удар попадает и пробивает броню, броня цели теряет дополнительно 1 SP (суммарно -2 SP абляции за один удар вместо стандартного -1 SP!).',
        effectEn: 'If this second attack hits and penetrates SP, target armor is ablated by 2 SP instead of 1 (an additional -1 SP ablation!).'
      },
      {
        id: 'bone_breaking_strike',
        nameRu: 'Дробящий кости удар (Bone Breaking Strike)',
        nameEn: 'Bone Breaking Strike',
        style: 'Karate',
        requirementRu: 'Обе ваши атаки боевых искусств в этом ходу успешно попали по одной и той же цели.',
        requirementEn: 'Both Martial Arts attacks in the same turn hit the same target.',
        checkRu: 'Обе атаки успешно преодолели проверку Уклонения цели',
        checkEn: 'Both attacks successfully beat target Evasion',
        effectRu: 'Цель автоматически получает критическую травму «Сломанная рука» (Broken Arm) или «Сломанные ребра» (Broken Ribs) с гарантированными +5 бонусного урона напрямую в ОЗ, без необходимости выбрасывать две шестерки на кубиках!',
        effectEn: 'Target automatically suffers a Broken Arm or Broken Ribs Critical Injury (+5 bonus damage directly to HP) without needing to roll two 6s!',
        damageBonus: '+5 Crit HP'
      }
    ]
  },
  Judo: {
    id: 'Judo',
    nameRu: 'Дзюдо (Judo)',
    nameEn: 'Judo',
    descriptionRu: 'Мягкий стиль бросков и захватов, использующий силу и инерцию нападающего против него самого, с последующим болевым контролем.',
    descriptionEn: 'Soft grappling and throwing style that redirects the opponent’s momentum and applies painful joint locks.',
    moves: [
      {
        id: 'counter_throw',
        nameRu: 'Ответный бросок (Counter Throw)',
        nameEn: 'Counter Throw',
        style: 'Judo',
        requirementRu: 'Противник промахнулся рукопашной атакой по вам в ближнем бою.',
        requirementEn: 'An enemy misses a melee attack against you.',
        checkRu: 'DEX + Боевые искусства + 1d10 против DEX + Уклонение (реакция или след. действие)',
        checkEn: 'DEX + Martial Arts + 1d10 vs Defender DEX + Evasion + 1d10 (reaction / action)',
        effectRu: 'Вы перехватываете атакующего и швыряете его о землю. Враг сбит с ног (Prone) и получает полный урон безоружного удара дзюдо (на основе вашего BODY, игнорируя 50% SP).',
        effectEn: 'You counter and slam the attacker to the ground. Target falls Prone and takes full unarmed strike damage (based on your BODY, half SP applies).'
      },
      {
        id: 'pain_compliance',
        nameRu: 'Болевой приём / Залом (Pain Compliance)',
        nameEn: 'Pain Compliance',
        style: 'Judo',
        requirementRu: 'Цель уже находится в вашем захвате (Grappled).',
        requirementEn: 'Target is already Grappled by you.',
        checkRu: 'DEX + Боевые искусства + 1d10 против DEX + Мордобой цели',
        checkEn: 'DEX + Martial Arts + 1d10 vs Target DEX + Brawling + 1d10',
        effectRu: 'Вы выкручиваете сустав противника. Цель получает урон, равный показателю вашего BODY, НАПРЯМУЮ в ОЗ (игнорирует всю броню SP!), а также штраф -2 ко всем действиям до тех пор, пока захват не прекратится.',
        effectEn: 'You twist target joints into agonizing compliance. Deals attacker BODY damage directly to HP (ignores SP) and target takes -2 to all actions until released.',
        damageBonus: 'Direct BODY HP'
      }
    ]
  },
  Taekwondo: {
    id: 'Taekwondo',
    nameRu: 'Тхэквондо (Taekwondo)',
    nameEn: 'Taekwondo',
    descriptionRu: 'Динамичное боевое искусство с акцентом на молниеносные прыжки, удары ногами в полете и разрушительные круговые вертушки.',
    descriptionEn: 'Dynamic martial art emphasizing lightning-fast leaping kicks, flying strikes, and devastating spinning roundhouses.',
    moves: [
      {
        id: 'flying_kick',
        nameRu: 'Удар в прыжке (Flying Kick)',
        nameEn: 'Flying Kick',
        style: 'Taekwondo',
        requirementRu: 'Вы пробежали не менее 4 метров (2 клетки) по прямой к цели перед ударом.',
        requirementEn: 'You move at least 4m (2 squares) in a straight line toward target before striking.',
        checkRu: 'DEX + Боевые искусства + 1d10 против DEX + Уклонение цели',
        checkEn: 'DEX + Martial Arts + 1d10 vs Defender DEX + Evasion + 1d10',
        effectRu: 'Наносит базовый урон боевых искусств (на основе BODY) ПЛЮС дополнительно +1d6 урона! При попадании цель отбрасывается назад на 2 метра.',
        effectEn: 'Deals normal strike damage (based on BODY) PLUS an extra +1d6 bonus damage! Target is knocked back 2 meters on hit.',
        damageBonus: '+1d6'
      },
      {
        id: 'spinning_kick',
        nameRu: 'Удар с разворота / Вертушка (Spinning Kick)',
        nameEn: 'Spinning Kick',
        style: 'Taekwondo',
        requirementRu: 'Любая атака боевыми искусствами.',
        requirementEn: 'Any Martial Arts attack.',
        checkRu: 'DEX + Боевые искусства + 1d10 против DEX + Уклонение цели',
        checkEn: 'DEX + Martial Arts + 1d10 vs Defender DEX + Evasion + 1d10',
        effectRu: 'Наносит полный урон удара, и цель обязана успешно пройти проверку DEX + Атлетика против вашего результата атаки, иначе падает с ног (Prone) и теряет возможность Двигаться (Move Action) на своем следующем ходу!',
        effectEn: 'Deals full damage and target must pass DEX + Athletics check vs your Attack Total or be knocked Prone and lose their Move Action on their next turn.'
      }
    ]
  },
  Aikido: {
    id: 'Aikido',
    nameRu: 'Айкидо (Aikido)',
    nameEn: 'Aikido',
    descriptionRu: 'Оборонительное искусство перенаправления силы, специализирующееся на блокировании вооруженных атак, обезоруживании и железных захватах.',
    descriptionEn: 'Defensive martial art specializing in neutralizing armed aggression, disarming attackers, and unbreakable joint locks.',
    moves: [
      {
        id: 'iron_grip',
        nameRu: 'Железный захват (Iron Grip)',
        nameEn: 'Iron Grip',
        style: 'Aikido',
        requirementRu: 'Проведение захвата, удержание захвата или попытка освобождения от чужого захвата.',
        requirementEn: 'Initiating a grab, maintaining a grab, or escaping an enemy grapple.',
        checkRu: 'DEX + Боевые искусства (или Мордобой) + 1d10 с бонусом +2',
        checkEn: 'DEX + Martial Arts (or Brawling) + 1d10 with +2 bonus',
        effectRu: 'Вы получаете бонус +2 к проверке захвата или освобождения. Удерживаемый противник не может использовать двуручное оружие и получает -2 ко всем действиям.',
        effectEn: 'You gain a +2 bonus to grapple or escape checks. Grappled opponent cannot use two-handed weapons and suffers -2 to all actions.'
      },
      {
        id: 'disarming_strike',
        nameRu: 'Обезоруживающий приём (Disarming Strike)',
        nameEn: 'Disarming Strike',
        style: 'Aikido',
        requirementRu: 'Цель держит в руках оружие или предмет. Вы проводите атаку боевыми искусствами.',
        requirementEn: 'Target is holding a weapon or item. You make a Martial Arts attack.',
        checkRu: 'DEX + Боевые искусства + 1d10 против DEX + Уклонение цели',
        checkEn: 'DEX + Martial Arts + 1d10 vs Defender DEX + Evasion + 1d10',
        effectRu: 'Вместо нанесения урона вы выбиваете оружие или предмет из рук противника на землю. Если у вас есть свободная рука — вы можете перехватить выбитое оружие прямо в воздухе!',
        effectEn: 'Instead of dealing damage, you knock the weapon or object from the target’s hand onto the ground. If you have a free hand, you can catch it in mid-air!'
      }
    ]
  }
};
