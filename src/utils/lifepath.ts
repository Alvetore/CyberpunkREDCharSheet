import { Lifepath, LifepathEnemy } from '../types/character';
import { Language } from '../locales/i18n';
import { CPR_LIFEPATH_TABLES } from '../data/initialData';

export const emptyEnemy = (): LifepathEnemy => ({ who: '', why: '', resources: '', response: '' });
export const emptyLifepath = (): Lifepath => ({ culturalOrigin: '', languages: '', personality: '', clothingStyle: '', hairstyle: '', affectation: '', valueMost: '', feelingsAboutPeople: '', valuedPerson: '', valuedPossession: '', familyBackground: '', childhoodEnv: '', familyCrisis: '', lifeGoals: '', friends: '', tragicLoveAffairs: '', enemies: '', roleLifepathNotes: '' });

// Old free text is retained verbatim in the first row, never guessed apart or truncated.
export const friendEntries = (lp: Lifepath): string[] => lp.friendEntries ?? (lp.friends ? [lp.friends] : []);
export const loveAffairEntries = (lp: Lifepath): string[] => lp.loveAffairEntries ?? (lp.tragicLoveAffairs ? [lp.tragicLoveAffairs] : []);
export const enemyEntries = (lp: Lifepath): LifepathEnemy[] => lp.enemyEntries ?? (lp.enemies ? [{ ...emptyEnemy(), who: lp.enemies }] : []);

export function updateRelationships(lp: Lifepath, field: 'friendEntries' | 'loveAffairEntries', entries: string[]): Lifepath {
  return { ...lp, [field]: entries, [field === 'friendEntries' ? 'friends' : 'tragicLoveAffairs']: entries.filter(value => value !== '').join('\n') };
}

export function updateEnemies(lp: Lifepath, entries: LifepathEnemy[], lang: Language): Lifepath {
  const titles = lang === 'ru' ? ['Почему', 'Ресурсы', 'Что ты сделаешь'] : ['Why', 'Resources', 'Your response'];
  const text = entries.map(row => [row.who, ...(['why', 'resources', 'response'] as const).map((key, index) => row[key] ? `${titles[index]}: ${row[key]}` : '')].filter(Boolean).join(' · ')).filter(Boolean).join('\n');
  return { ...lp, enemyEntries: entries, enemies: text };
}

/** Existing random-generation behavior, shared by the sheet and creation wizard. */
export function generateLifepath(lp: Lifepath, lang: Language): Lifepath {
  const pick = <T,>(values: T[]): T => values[Math.floor(Math.random() * values.length)];
  const origin = pick(CPR_LIFEPATH_TABLES.culturalOrigins);
  const friends = lang === 'ru' ? 'Свой человек в уличной банде или независимый техник' : 'An ally in a street boostergang or independent techie';
  const love = lang === 'ru' ? 'Любовь прервана смертью или предательством' : 'Love ended by death or betrayal';
  const enemies = lang === 'ru' ? 'Корпорат или гангстер, жаждущий сведения счетов' : 'A corp or gang leader looking to settle a score';
  return {
    ...lp, culturalOrigin: origin.origin, languages: origin.languages,
    personality: pick(CPR_LIFEPATH_TABLES.personalities), clothingStyle: pick(CPR_LIFEPATH_TABLES.clothingStyles),
    hairstyle: pick(CPR_LIFEPATH_TABLES.hairstyles), affectation: pick(CPR_LIFEPATH_TABLES.affectations),
    valueMost: pick(CPR_LIFEPATH_TABLES.valueMost), feelingsAboutPeople: pick(CPR_LIFEPATH_TABLES.feelingsAboutPeople),
    valuedPerson: lang === 'ru' ? 'Близкий друг или напарник, выручивший в тяжелый момент' : 'A close friend or partner who helped out in a pinch',
    valuedPossession: lang === 'ru' ? 'Личный предмет из прошлой жизни до прихода в Night City' : 'A keepsake from past life before coming to Night City',
    familyBackground: pick(CPR_LIFEPATH_TABLES.familyBackgrounds), childhoodEnv: pick(CPR_LIFEPATH_TABLES.childhoodEnvs),
    familyCrisis: pick(CPR_LIFEPATH_TABLES.familyCrises), lifeGoals: pick(CPR_LIFEPATH_TABLES.lifeGoals),
    friends, tragicLoveAffairs: love, enemies, friendEntries: [friends], loveAffairEntries: [love], enemyEntries: [{ ...emptyEnemy(), who: enemies }],
  };
}
