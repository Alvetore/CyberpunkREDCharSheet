import React from 'react';
import { Character, Lifepath } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { CPR_LIFEPATH_TABLES } from '../data/initialData';
import { sfx } from '../utils/audio';
import { 
  Sparkles, 
  Dices, 
  User, 
  Heart, 
  Users, 
  ShieldAlert, 
  Target, 
  Compass 
} from 'lucide-react';

interface LifepathSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  lang: Language;
}

export const LifepathSection: React.FC<LifepathSectionProps> = ({
  character,
  onUpdateCharacter,
  lang
}) => {
  const t = translations[lang];
  const lp = character.lifepath;

  const getRandomItem = <T,>(arr: T[]): T => {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  const handleGenerateFullLifepath = () => {
    sfx.playDiceRoll();
    const origin = getRandomItem(CPR_LIFEPATH_TABLES.culturalOrigins);

    const generated: Lifepath = {
      culturalOrigin: origin.origin,
      languages: origin.languages,
      personality: getRandomItem(CPR_LIFEPATH_TABLES.personalities),
      clothingStyle: getRandomItem(CPR_LIFEPATH_TABLES.clothingStyles),
      hairstyle: getRandomItem(CPR_LIFEPATH_TABLES.hairstyles),
      affectation: getRandomItem(CPR_LIFEPATH_TABLES.affectations),
      valueMost: getRandomItem(CPR_LIFEPATH_TABLES.valueMost),
      feelingsAboutPeople: getRandomItem(CPR_LIFEPATH_TABLES.feelingsAboutPeople),
      valuedPerson: lang === 'ru' ? 'Близкий друг или напарник, выручивший в тяжелый момент' : 'A close friend or partner who helped out in a pinch',
      valuedPossession: lang === 'ru' ? 'Личный предмет из прошлой жизни до прихода в Night City' : 'A keepsake from past life before coming to Night City',
      familyBackground: getRandomItem(CPR_LIFEPATH_TABLES.familyBackgrounds),
      childhoodEnv: getRandomItem(CPR_LIFEPATH_TABLES.childhoodEnvs),
      familyCrisis: getRandomItem(CPR_LIFEPATH_TABLES.familyCrises),
      lifeGoals: getRandomItem(CPR_LIFEPATH_TABLES.lifeGoals),
      friends: lang === 'ru' ? 'Свой человек в уличной банде или независимый техник' : 'An ally in a street boostergang or independent techie',
      tragicLoveAffairs: lang === 'ru' ? 'Любовь прервана смертью или предательством' : 'Love ended by death or betrayal',
      enemies: lang === 'ru' ? 'Корпорат или гангстер, жаждущий сведения счетов' : 'A corp or gang leader looking to settle a score',
      roleLifepathNotes: lp.roleLifepathNotes || ''
    };

    onUpdateCharacter({
      ...character,
      lifepath: generated
    });
  };

  const updateField = (field: keyof Lifepath, value: string) => {
    onUpdateCharacter({
      ...character,
      lifepath: { ...character.lifepath, [field]: value }
    });
  };

  const rerollField = (field: keyof Lifepath, options: string[]) => {
    sfx.playDiceRoll();
    updateField(field, getRandomItem(options));
  };

  return (
    <div className="space-y-4">
      {/* Header Banner */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Compass size={18} className="text-yellow-400" />
          <h2 className="font-orbitron font-bold text-sm text-yellow-400 uppercase tracking-wider">
            {t.lifepathTitle}
          </h2>
        </div>

        <button
          onClick={handleGenerateFullLifepath}
          className="flex items-center gap-2 px-3.5 py-1.5 bg-yellow-500 hover:bg-yellow-400 text-black font-orbitron font-black text-xs uppercase tracking-wider rounded transition shadow-md shadow-yellow-950"
        >
          <Sparkles size={14} />
          <span>{t.generateRandomLifepath}</span>
        </button>
      </div>

      {/* Grid of Lifepath cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {/* Style & Quirks */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5 space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs font-orbitron font-bold text-red-400 uppercase">
            <User size={15} />
            <span>{lang === 'ru' ? 'Стиль и Характер' : 'Style & Personality'}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">
                {t.personality}
              </label>
              <button
                onClick={() => rerollField('personality', CPR_LIFEPATH_TABLES.personalities)}
                className="text-zinc-500 hover:text-yellow-400 p-0.5"
                title={lang === 'ru' ? "Случайный выбор" : "Random roll"}
              >
                <Dices size={12} />
              </button>
            </div>
            <textarea
              rows={2}
              value={lp.personality}
              onChange={(e) => updateField('personality', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">
                {t.clothingStyle}
              </label>
              <button
                onClick={() => rerollField('clothingStyle', CPR_LIFEPATH_TABLES.clothingStyles)}
                className="text-zinc-500 hover:text-yellow-400 p-0.5"
              >
                <Dices size={12} />
              </button>
            </div>
            <textarea
              rows={2}
              value={lp.clothingStyle}
              onChange={(e) => updateField('clothingStyle', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">
                {t.hairstyle}
              </label>
              <button
                onClick={() => rerollField('hairstyle', CPR_LIFEPATH_TABLES.hairstyles)}
                className="text-zinc-500 hover:text-yellow-400 p-0.5"
              >
                <Dices size={12} />
              </button>
            </div>
            <input
              type="text"
              value={lp.hairstyle}
              onChange={(e) => updateField('hairstyle', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">
                {t.affectation}
              </label>
              <button
                onClick={() => rerollField('affectation', CPR_LIFEPATH_TABLES.affectations)}
                className="text-zinc-500 hover:text-yellow-400 p-0.5"
              >
                <Dices size={12} />
              </button>
            </div>
            <input
              type="text"
              value={lp.affectation}
              onChange={(e) => updateField('affectation', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
            />
          </div>
        </div>

        {/* Values & Motives */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5 space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs font-orbitron font-bold text-yellow-400 uppercase">
            <Heart size={15} />
            <span>{lang === 'ru' ? 'Ценности и Мотивы' : 'Values & Motives'}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">
                {t.valueMost}
              </label>
              <button
                onClick={() => rerollField('valueMost', CPR_LIFEPATH_TABLES.valueMost)}
                className="text-zinc-500 hover:text-yellow-400 p-0.5"
              >
                <Dices size={12} />
              </button>
            </div>
            <input
              type="text"
              value={lp.valueMost}
              onChange={(e) => updateField('valueMost', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">
                {t.feelingsAboutPeople}
              </label>
              <button
                onClick={() => rerollField('feelingsAboutPeople', CPR_LIFEPATH_TABLES.feelingsAboutPeople)}
                className="text-zinc-500 hover:text-yellow-400 p-0.5"
              >
                <Dices size={12} />
              </button>
            </div>
            <textarea
              rows={2}
              value={lp.feelingsAboutPeople}
              onChange={(e) => updateField('feelingsAboutPeople', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-100"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">
              {t.valuedPerson}
            </label>
            <input
              type="text"
              value={lp.valuedPerson}
              onChange={(e) => updateField('valuedPerson', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">
              {t.valuedPossession}
            </label>
            <input
              type="text"
              value={lp.valuedPossession}
              onChange={(e) => updateField('valuedPossession', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">
                {t.lifeGoals}
              </label>
              <button
                onClick={() => rerollField('lifeGoals', CPR_LIFEPATH_TABLES.lifeGoals)}
                className="text-zinc-500 hover:text-yellow-400 p-0.5"
              >
                <Dices size={12} />
              </button>
            </div>
            <input
              type="text"
              value={lp.lifeGoals}
              onChange={(e) => updateField('lifeGoals', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
            />
          </div>
        </div>

        {/* Origins, Allies & Enemies */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3.5 space-y-3">
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-2 text-xs font-orbitron font-bold text-cyan-400 uppercase">
            <Users size={15} />
            <span>{lang === 'ru' ? 'Семья, Друзья и Враги' : 'Family, Friends & Enemies'}</span>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">
                {t.familyBackground}
              </label>
              <button
                onClick={() => rerollField('familyBackground', CPR_LIFEPATH_TABLES.familyBackgrounds)}
                className="text-zinc-500 hover:text-yellow-400 p-0.5"
              >
                <Dices size={12} />
              </button>
            </div>
            <textarea
              rows={2}
              value={lp.familyBackground}
              onChange={(e) => updateField('familyBackground', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-100"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] text-zinc-400 uppercase font-semibold">
                {t.familyCrisis}
              </label>
              <button
                onClick={() => rerollField('familyCrisis', CPR_LIFEPATH_TABLES.familyCrises)}
                className="text-zinc-500 hover:text-yellow-400 p-0.5"
              >
                <Dices size={12} />
              </button>
            </div>
            <textarea
              rows={2}
              value={lp.familyCrisis}
              onChange={(e) => updateField('familyCrisis', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded p-2 text-xs text-zinc-100"
            />
          </div>

          <div>
            <label className="text-[10px] text-zinc-400 uppercase font-semibold block mb-1">
              {t.friends}
            </label>
            <input
              type="text"
              value={lp.friends}
              onChange={(e) => updateField('friends', e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-2.5 py-1 text-xs text-zinc-100"
            />
          </div>

          <div>
            <label className="text-[10px] text-red-400 uppercase font-semibold block mb-1">
              {t.enemies}
            </label>
            <input
              type="text"
              value={lp.enemies}
              onChange={(e) => updateField('enemies', e.target.value)}
              className="w-full bg-zinc-950 border border-red-900/60 rounded px-2.5 py-1 text-xs text-zinc-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
