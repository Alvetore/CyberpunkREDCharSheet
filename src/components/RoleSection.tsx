import React from 'react';
import { Character } from '../types/character';
import { Language, translations } from '../locales/i18n';
import { sfx } from '../utils/audio';
import { 
  Award, 
  Crosshair, 
  ShieldAlert, 
  Wrench, 
  HeartHandshake, 
  Radio, 
  BadgeAlert, 
  Briefcase, 
  Car, 
  Coins,
  Plane,
  Ship,
  Sparkles,
  Info
} from 'lucide-react';

interface RoleSectionProps {
  character: Character;
  onUpdateCharacter: (char: Character) => void;
  lang: Language;
}

export const RoleSection: React.FC<RoleSectionProps> = ({
  character,
  onUpdateCharacter,
  lang
}) => {
  const t = translations[lang];
  const role = character.role;
  const rank = character.roleRank;

  // Solo Points allocation handler
  const handleSoloPointChange = (
    field: keyof Character['roleAbilities']['solo'],
    delta: number
  ) => {
    sfx.playClick();
    const current = character.roleAbilities.solo[field];
    const totalSpent =
      Object.values(character.roleAbilities.solo).reduce((a, b) => a + b, 0) - current;
    const newVal = delta < 0 ? Math.max(0, current + delta) : Math.max(current, Math.min(rank - totalSpent, current + delta));

    onUpdateCharacter({
      ...character,
      roleAbilities: {
        ...character.roleAbilities,
        solo: {
          ...character.roleAbilities.solo,
          [field]: newVal
        }
      }
    });
  };

  // Tech Maker allocation handler
  const handleTechPointChange = (
    field: keyof Character['roleAbilities']['tech'],
    delta: number
  ) => {
    sfx.playClick();
    const current = character.roleAbilities.tech[field];
    const tech = character.roleAbilities.tech;
    const makerRank = Math.min(rank, tech.makerRank);
    const spent = tech.fieldExpertise + tech.upgrade + tech.fabrication + tech.invention - current;
    const newVal = delta < 0 ? Math.max(0, current + delta) : Math.max(current, Math.min(makerRank, 2 * makerRank - spent, current + delta));

    onUpdateCharacter({
      ...character,
      roleAbilities: {
        ...character.roleAbilities,
        tech: {
          ...character.roleAbilities.tech,
          [field]: newVal
        }
      }
    });
  };

  // Medtech allocation handler
  const handleMedtechPointChange = (
    field: keyof Character['roleAbilities']['medtech'],
    delta: number
  ) => {
    sfx.playClick();
    const current = character.roleAbilities.medtech[field];
    const medicine = character.roleAbilities.medtech;
    const specialties = ['surgery','medicalTech','pharmaceuticals'];
    const spent = medicine.surgery + medicine.medicalTech + medicine.pharmaceuticals - current;
    const newVal = specialties.includes(field) ? (delta < 0 ? Math.max(0, current + delta) : Math.max(current, Math.min(rank - spent, current + delta))) : Math.max(0, current + delta);

    onUpdateCharacter({
      ...character,
      roleAbilities: {
        ...character.roleAbilities,
        medtech: {
          ...character.roleAbilities.medtech,
          [field]: newVal
        }
      }
    });
  };

  const soloPointsAllocated = Object.values(character.roleAbilities.solo).reduce((a, b) => a + b, 0);
  const techPoints = ['fieldExpertise','upgrade','fabrication','invention'].map(key => character.roleAbilities.tech[key as 'fieldExpertise']);
  const medtechPoints = character.roleAbilities.medtech.surgery + character.roleAbilities.medtech.medicalTech + character.roleAbilities.medtech.pharmaceuticals;
  const invalidAllocation = role === 'Solo' ? soloPointsAllocated > rank : role === 'Tech' ? techPoints.some(value => value > rank) || techPoints.reduce((sum, value) => sum + value, 0) > 2 * rank : role === 'Medtech' ? medtechPoints > rank : false;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md space-y-3">
      {invalidAllocation && <p role="alert" className="text-amber-300 text-xs">{lang === 'ru' ? 'Распределение превышает текущий ранг. Уменьшите специализации; сохранённые очки не удаляются автоматически.' : 'Allocation exceeds the current rank. Reduce specialties; saved points are preserved for correction.'}</p>}
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-red-500" />
          <h2 className="font-orbitron font-bold text-sm text-red-500 uppercase tracking-wider">
            {t.roleAbilityTitle}: {role} ({lang === 'ru' ? 'Ранг' : 'Rank'} {rank})
          </h2>
        </div>
      </div>

      {role === 'Solo' && <button type="button" onClick={() => onUpdateCharacter({ ...character, soloSpotWeaknessUsed: false, soloDamageDeflectionUsed: false })} className="text-xs text-amber-300 underline">{lang === 'ru' ? 'Новый ход: восстановить Spot Weakness / Damage Deflection' : 'New turn: reset Spot Weakness / Damage Deflection'}</button>}
      {/* SOLO: Combat Awareness */}
      {role === 'Solo' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span className="font-semibold text-yellow-400">
              {t.soloCombatAwareness}: {lang === 'ru' ? `Распределено ${soloPointsAllocated} / ${rank} очков` : `Allocated ${soloPointsAllocated} / ${rank} points`}
            </span>
            <span className="text-zinc-500 text-[11px]">
              {lang === 'ru' ? '(Очки можно перераспределять вне боя или с затратой действия)' : '(Points can be reallocated out of combat or by spending an action)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {/* Threat Detection */}
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-200 block">{t.threatDetection}</span>
                <span className="text-[10px] text-zinc-500">{lang === 'ru' ? '+1 к проверкам Восприятия за очко' : '+1 Perception per point'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSoloPointChange('threatDetection', -1)}
                  className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition"
                >
                  -
                </button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">
                  {character.roleAbilities.solo.threatDetection}
                </span>
                <button
                  onClick={() => handleSoloPointChange('threatDetection', 1)}
                  className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Initiative Reaction */}
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-200 block">{t.initiativeReaction}</span>
                <span className="text-[10px] text-zinc-500">{lang === 'ru' ? '+1 к броскам Инициативы за очко' : '+1 to Initiative per point'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSoloPointChange('initiativeReaction', -1)}
                  className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition"
                >
                  -
                </button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">
                  {character.roleAbilities.solo.initiativeReaction}
                </span>
                <button
                  onClick={() => handleSoloPointChange('initiativeReaction', 1)}
                  className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Precision Attack */}
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-200 block">{t.precisionAttack}</span>
                <span className="text-[10px] text-zinc-500">{lang === 'ru' ? '+1 ко всем атакам за каждые 3 очка' : '+1 to all attacks per 3 pts'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSoloPointChange('precisionAttack', -1)}
                  className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition"
                >
                  -
                </button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">
                  {character.roleAbilities.solo.precisionAttack}
                </span>
                <button
                  onClick={() => handleSoloPointChange('precisionAttack', 1)}
                  className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Spot Weakness */}
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-200 block">{t.spotWeakness}</span>
                <span className="text-[10px] text-zinc-500">{lang === 'ru' ? '+1 к первому урону за очко' : '+1 damage to first hit per pt'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSoloPointChange('spotWeakness', -1)}
                  className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition"
                >
                  -
                </button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">
                  {character.roleAbilities.solo.spotWeakness}
                </span>
                <button
                  onClick={() => handleSoloPointChange('spotWeakness', 1)}
                  className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>

            {/* Damage Absorb */}
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-200 block">{t.damageAbsorb}</span>
                <span className="text-[10px] text-zinc-500">{lang === 'ru' ? '-1 к первому урону за каждые 2 очка' : '-1 to first damage per 2 pts'}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSoloPointChange('damageAbsorb', -1)}
                  className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition"
                >
                  -
                </button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">
                  {character.roleAbilities.solo.damageAbsorb}
                </span>
                <button
                  onClick={() => handleSoloPointChange('damageAbsorb', 1)}
                  className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TECH: Maker */}
      {role === 'Tech' && (
        <div className="space-y-3">
          <div className="text-xs text-yellow-400 font-semibold">{t.techMaker}</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{t.fieldExpertise}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleTechPointChange('fieldExpertise', -1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">-</button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">{character.roleAbilities.tech.fieldExpertise}</span>
                <button onClick={() => handleTechPointChange('fieldExpertise', 1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">+</button>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{t.upgrade}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleTechPointChange('upgrade', -1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">-</button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">{character.roleAbilities.tech.upgrade}</span>
                <button onClick={() => handleTechPointChange('upgrade', 1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">+</button>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{t.fabrication}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleTechPointChange('fabrication', -1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">-</button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">{character.roleAbilities.tech.fabrication}</span>
                <button onClick={() => handleTechPointChange('fabrication', 1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">+</button>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{t.invention}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleTechPointChange('invention', -1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">-</button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">{character.roleAbilities.tech.invention}</span>
                <button onClick={() => handleTechPointChange('invention', 1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MEDTECH: Medicine */}
      {role === 'Medtech' && (
        <div className="space-y-3">
          <div className="text-xs text-yellow-400 font-semibold">{t.medtechMedicine}</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{t.surgery} ({lang === 'ru' ? 'очков; ранг навыка ×2' : 'points; skill rank ×2'})</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleMedtechPointChange('surgery', -1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">-</button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">{character.roleAbilities.medtech.surgery}</span>
                <button onClick={() => handleMedtechPointChange('surgery', 1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">+</button>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{lang === 'ru' ? 'Криотехника (очки)' : 'Cryotech Operation (points)'}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleMedtechPointChange('medicalTech', -1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">-</button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">{character.roleAbilities.medtech.medicalTech}</span>
                <button onClick={() => handleMedtechPointChange('medicalTech', 1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">+</button>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{t.pharmaceuticals}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleMedtechPointChange('pharmaceuticals', -1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">-</button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">{character.roleAbilities.medtech.pharmaceuticals}</span>
                <button onClick={() => handleMedtechPointChange('pharmaceuticals', 1)} className="w-7 h-7 sm:w-6 sm:h-6 bg-zinc-800 hover:bg-zinc-700 rounded text-sm sm:text-xs text-zinc-300 font-bold flex items-center justify-center transition">+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NETRUNNER notice */}
      {role === 'Netrunner' && (
        <div className="p-3 bg-zinc-950 border border-cyan-800/60 rounded text-xs text-cyan-300 flex items-center justify-between">
          <span>
            {lang === 'ru' ? (
              <>Интерфейс: Ранг {character.roleAbilities.netrunner.interfaceRank}. Управление кибердекой и сетевые действия доступны во вкладке <strong>&quot;Нетраннинг&quot;</strong>.</>
            ) : (
              <>Interface: Rank {character.roleAbilities.netrunner.interfaceRank}. Cyberdeck management and Net actions are located in the <strong>&quot;Netrunning&quot;</strong> tab.</>
            )}
          </span>
        </div>
      )}

      {/* NOMAD: Moto */}
      {role === 'Nomad' && (
        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-zinc-950 border border-amber-900/60 rounded p-3">
            <div>
              <div className="flex items-center gap-2">
                <Car size={16} className="text-amber-400" />
                <span className="font-orbitron font-bold text-xs text-amber-300 uppercase tracking-wider">
                  {lang === 'ru' ? 'Способность роли: Мото (Moto)' : 'Role Ability: Moto'}
                </span>
                <span className="px-2 py-0.5 bg-amber-950/80 border border-amber-700/80 rounded text-[11px] font-mono font-bold text-amber-300">
                  +{rank} {lang === 'ru' ? 'к навыкам' : 'to skills'}
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 mt-1 leading-relaxed max-w-2xl">
                {lang === 'ru'
                  ? 'Ранг способности «Мото» автоматически добавляется ко всем проверкам управления и ремонта транспорта, а также определяет класс доступного семейного транспорта и модификаций (Cyberpunk RED стр. 161–166).'
                  : 'Your Moto rank is automatically added to all vehicle driving and tech checks, and determines access to your Nomad Family vehicle fleet and upgrades (Corebook p. 161–166).'}
              </p>
            </div>
            <div className="flex items-center gap-1.5 self-center">
              <span className="text-xs text-zinc-400 font-semibold">{lang === 'ru' ? 'Ранг Мото:' : 'Moto Rank:'}</span>
              <button
                onClick={() => {
                  sfx.playClick();
                  onUpdateCharacter({ ...character, roleRank: Math.max(1, rank - 1) });
                }}
                disabled={rank <= 1}
                className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded text-xs text-zinc-200 font-bold flex items-center justify-center transition"
              >
                -
              </button>
              <span className="font-orbitron font-bold text-sm text-white w-6 text-center">
                {rank}
              </span>
              <button
                onClick={() => {
                  sfx.playClick();
                  onUpdateCharacter({ ...character, roleRank: Math.min(10, rank + 1) });
                }}
                disabled={rank >= 10}
                className="w-6 h-6 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-30 rounded text-xs text-zinc-200 font-bold flex items-center justify-center transition"
              >
                +
              </button>
            </div>
          </div>

          {/* Affected Skills Grid */}
          <div>
            <div className="text-xs text-zinc-400 font-semibold mb-2 flex items-center gap-1.5">
              <Sparkles size={13} className="text-amber-400" />
              <span>{lang === 'ru' ? 'Бонусы «Мото» к навыкам персонажа:' : 'Moto Bonuses Applied to Skills:'}</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
              {[
                { id: 'drive_land', nameRu: 'Управление наз. транспортом', nameEn: 'Drive Land', stat: 'REF', icon: Car },
                { id: 'pilot_air', nameRu: 'Пилотирование возд. транспорта', nameEn: 'Pilot Air', stat: 'REF', icon: Plane },
                { id: 'pilot_sea', nameRu: 'Управление водным транспортом', nameEn: 'Pilot Sea', stat: 'REF', icon: Ship },
                { id: 'land_vehicle_tech', nameRu: 'Техобслуживание наз. трансп.', nameEn: 'Land Vehicle Tech', stat: 'TECH', icon: Wrench },
                { id: 'air_vehicle_tech', nameRu: 'Техобслуживание возд. трансп.', nameEn: 'Air Vehicle Tech', stat: 'TECH', icon: Wrench },
                { id: 'sea_vehicle_tech', nameRu: 'Техобслуживание водн. трансп.', nameEn: 'Sea Vehicle Tech', stat: 'TECH', icon: Wrench },
              ].map((item) => {
                const sk = character.skills.find((s) => s.id === item.id);
                const lvl = sk ? sk.level : 0;
                const statVal = character.stats[item.stat as keyof typeof character.stats] || 0;
                const totalBase = statVal + lvl + rank;
                const ItemIcon = item.icon;
                return (
                  <div key={item.id} className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-200 truncate">
                        <ItemIcon size={13} className="text-amber-400 shrink-0" />
                        <span className="truncate">{lang === 'ru' ? item.nameRu : item.nameEn}</span>
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                        {item.stat} {statVal} + {lang === 'ru' ? 'Ур' : 'Lvl'} {lvl} + <strong className="text-amber-400">Мото +{rank}</strong>
                      </div>
                    </div>
                    <div className="bg-zinc-900 border border-amber-900/60 rounded px-2 py-1 text-center shrink-0">
                      <div className="text-[9px] text-zinc-500 uppercase font-mono font-bold leading-none">{lang === 'ru' ? 'ОСН' : 'BASE'}</div>
                      <div className="font-orbitron font-bold text-xs text-amber-300">{totalBase}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Family Fleet Pool Summary */}
          <div className="bg-zinc-950/70 border border-zinc-800/80 rounded p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-zinc-300 font-orbitron uppercase tracking-wide">
                {lang === 'ru' ? 'Автопарк Семьи Кочевников (доступ по рангу):' : 'Nomad Family Fleet Access:'}
              </span>
              <span className="text-[10px] text-zinc-500 font-mono">
                {lang === 'ru' ? 'Cyberpunk RED стр. 161' : 'Cyberpunk RED p. 161'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-[11px]">
              <div className={`p-2 rounded border ${rank >= 1 ? 'bg-amber-950/30 border-amber-800/60 text-zinc-200' : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'}`}>
                <div className="font-bold text-amber-400 font-orbitron">Ранг 1</div>
                <div>{lang === 'ru' ? 'Мотоцикл, Гидроцикл или 1 модификация' : 'Roadbike, Jet Ski, or 1 Upgrade'}</div>
              </div>
              <div className={`p-2 rounded border ${rank >= 2 ? 'bg-amber-950/30 border-amber-800/60 text-zinc-200' : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'}`}>
                <div className="font-bold text-amber-400 font-orbitron">Ранги 2–3</div>
                <div>{lang === 'ru' ? 'Компактный авто, Автожир' : 'Compact Car, Gyrocopter'}</div>
              </div>
              <div className={`p-2 rounded border ${rank >= 4 ? 'bg-amber-950/30 border-amber-800/60 text-zinc-200' : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'}`}>
                <div className="font-bold text-amber-400 font-orbitron">Ранги 4–6</div>
                <div>{lang === 'ru' ? 'Седан, Супербайк, Катер' : 'Sedan, Superbike, Cabin Cruiser'}</div>
              </div>
              <div className={`p-2 rounded border ${rank >= 7 ? 'bg-amber-950/30 border-amber-800/60 text-zinc-200' : 'bg-zinc-900/40 border-zinc-800 text-zinc-500'}`}>
                <div className="font-bold text-amber-400 font-orbitron">Ранги 7–10</div>
                <div>{lang === 'ru' ? 'Суперкар, Аэродин (AV-4), Броневик' : 'Supercar, AV-4 Aerodyne, Armored Vehicle'}</div>
              </div>
            </div>
          </div>

          {/* Family / Pack Notes */}
          <div className="space-y-1">
            <label className="text-xs text-zinc-400 block font-semibold">
              {lang === 'ru' ? 'Клан / Семья Кочевника и заметки о стае:' : 'Nomad Clan / Pack Details:'}
            </label>
            <input
              type="text"
              placeholder={lang === 'ru' ? 'например: Клан Альдекальдо, Стая Бейкера / Внедорожник с турелью' : 'e.g. Aldecaldos Clan, Baker Pack / Upgraded Nomad Cruiser'}
              value={character.roleAbilities.generic.details}
              onChange={(e) =>
                onUpdateCharacter({
                  ...character,
                  roleAbilities: {
                    ...character.roleAbilities,
                    generic: {
                      ...character.roleAbilities.generic,
                      details: e.target.value
                    }
                  }
                })
              }
              className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:border-amber-600"
            />
          </div>
        </div>
      )}

      {/* Generic Role Description & Notes */}
      {role !== 'Solo' && role !== 'Tech' && role !== 'Medtech' && role !== 'Netrunner' && role !== 'Nomad' && (
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 block">
            {lang === 'ru' ? `Детали способности роли (${role}):` : `Role Ability Details (${role}):`}
          </label>
          <input
            type="text"
            value={character.roleAbilities.generic.details}
            onChange={(e) =>
              onUpdateCharacter({
                ...character,
                roleAbilities: {
                  ...character.roleAbilities,
                  generic: {
                    ...character.roleAbilities.generic,
                    details: e.target.value
                  }
                }
              })
            }
            className="w-full bg-zinc-950 border border-zinc-800 rounded px-3 py-1.5 text-xs text-zinc-100"
          />
        </div>
      )}
    </div>
  );
};
