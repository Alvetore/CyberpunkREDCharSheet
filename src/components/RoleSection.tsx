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
  Coins 
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
    const newVal = Math.max(0, Math.min(rank - totalSpent, current + delta));

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
    const newVal = Math.max(0, current + delta);

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
    const newVal = Math.max(0, current + delta);

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

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 sm:p-4 shadow-md space-y-3">
      <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
        <div className="flex items-center gap-2">
          <Award size={18} className="text-red-500" />
          <h2 className="font-orbitron font-bold text-sm text-red-500 uppercase tracking-wider">
            {t.roleAbilityTitle}: {role} (Ранг {rank})
          </h2>
        </div>
      </div>

      {/* SOLO: Combat Awareness */}
      {role === 'Solo' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-300">
            <span className="font-semibold text-yellow-400">
              {t.soloCombatAwareness}: Распределено {soloPointsAllocated} / {rank} очков
            </span>
            <span className="text-zinc-500 text-[11px]">
              (Очки можно перераспределять вне боя или с затратой действия)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {/* Threat Detection */}
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-200 block">{t.threatDetection}</span>
                <span className="text-[10px] text-zinc-500">+к Восприятию против засад</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSoloPointChange('threatDetection', -1)}
                  className="w-5 h-5 bg-zinc-800 rounded text-xs text-zinc-300"
                >
                  -
                </button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">
                  {character.roleAbilities.solo.threatDetection}
                </span>
                <button
                  onClick={() => handleSoloPointChange('threatDetection', 1)}
                  className="w-5 h-5 bg-zinc-800 rounded text-xs text-zinc-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Initiative Reaction */}
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-200 block">{t.initiativeReaction}</span>
                <span className="text-[10px] text-zinc-500">+к броску Инициативы</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSoloPointChange('initiativeReaction', -1)}
                  className="w-5 h-5 bg-zinc-800 rounded text-xs text-zinc-300"
                >
                  -
                </button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">
                  {character.roleAbilities.solo.initiativeReaction}
                </span>
                <button
                  onClick={() => handleSoloPointChange('initiativeReaction', 1)}
                  className="w-5 h-5 bg-zinc-800 rounded text-xs text-zinc-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Precision Attack */}
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-200 block">{t.precisionAttack}</span>
                <span className="text-[10px] text-zinc-500">+к прицельным атакам</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSoloPointChange('precisionAttack', -1)}
                  className="w-5 h-5 bg-zinc-800 rounded text-xs text-zinc-300"
                >
                  -
                </button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">
                  {character.roleAbilities.solo.precisionAttack}
                </span>
                <button
                  onClick={() => handleSoloPointChange('precisionAttack', 1)}
                  className="w-5 h-5 bg-zinc-800 rounded text-xs text-zinc-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Spot Weakness */}
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-200 block">{t.spotWeakness}</span>
                <span className="text-[10px] text-zinc-500">+к урону первой успешной атаки</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSoloPointChange('spotWeakness', -1)}
                  className="w-5 h-5 bg-zinc-800 rounded text-xs text-zinc-300"
                >
                  -
                </button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">
                  {character.roleAbilities.solo.spotWeakness}
                </span>
                <button
                  onClick={() => handleSoloPointChange('spotWeakness', 1)}
                  className="w-5 h-5 bg-zinc-800 rounded text-xs text-zinc-300"
                >
                  +
                </button>
              </div>
            </div>

            {/* Damage Absorb */}
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-zinc-200 block">{t.damageAbsorb}</span>
                <span className="text-[10px] text-zinc-500">Снижает получаемый урон</span>
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => handleSoloPointChange('damageAbsorb', -1)}
                  className="w-5 h-5 bg-zinc-800 rounded text-xs text-zinc-300"
                >
                  -
                </button>
                <span className="font-orbitron font-bold text-xs text-white min-w-[16px] text-center">
                  {character.roleAbilities.solo.damageAbsorb}
                </span>
                <button
                  onClick={() => handleSoloPointChange('damageAbsorb', 1)}
                  className="w-5 h-5 bg-zinc-800 rounded text-xs text-zinc-300"
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
                <button onClick={() => handleTechPointChange('fieldExpertise', -1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">-</button>
                <span className="font-orbitron font-bold text-xs text-white">{character.roleAbilities.tech.fieldExpertise}</span>
                <button onClick={() => handleTechPointChange('fieldExpertise', 1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">+</button>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{t.upgrade}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleTechPointChange('upgrade', -1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">-</button>
                <span className="font-orbitron font-bold text-xs text-white">{character.roleAbilities.tech.upgrade}</span>
                <button onClick={() => handleTechPointChange('upgrade', 1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">+</button>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{t.fabrication}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleTechPointChange('fabrication', -1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">-</button>
                <span className="font-orbitron font-bold text-xs text-white">{character.roleAbilities.tech.fabrication}</span>
                <button onClick={() => handleTechPointChange('fabrication', 1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">+</button>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{t.invention}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleTechPointChange('invention', -1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">-</button>
                <span className="font-orbitron font-bold text-xs text-white">{character.roleAbilities.tech.invention}</span>
                <button onClick={() => handleTechPointChange('invention', 1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">+</button>
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
              <span className="text-xs text-zinc-200 font-bold">{t.surgery}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleMedtechPointChange('surgery', -1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">-</button>
                <span className="font-orbitron font-bold text-xs text-white">{character.roleAbilities.medtech.surgery}</span>
                <button onClick={() => handleMedtechPointChange('surgery', 1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">+</button>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{t.medicalTech}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleMedtechPointChange('medicalTech', -1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">-</button>
                <span className="font-orbitron font-bold text-xs text-white">{character.roleAbilities.medtech.medicalTech}</span>
                <button onClick={() => handleMedtechPointChange('medicalTech', 1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">+</button>
              </div>
            </div>
            <div className="bg-zinc-950 border border-zinc-800 rounded p-2.5 flex items-center justify-between">
              <span className="text-xs text-zinc-200 font-bold">{t.pharmaceuticals}</span>
              <div className="flex items-center gap-1.5">
                <button onClick={() => handleMedtechPointChange('pharmaceuticals', -1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">-</button>
                <span className="font-orbitron font-bold text-xs text-white">{character.roleAbilities.medtech.pharmaceuticals}</span>
                <button onClick={() => handleMedtechPointChange('pharmaceuticals', 1)} className="w-5 h-5 bg-zinc-800 rounded text-xs">+</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* NETRUNNER notice */}
      {role === 'Netrunner' && (
        <div className="p-3 bg-zinc-950 border border-cyan-800/60 rounded text-xs text-cyan-300 flex items-center justify-between">
          <span>
            Интерфейс: Ранг {character.roleAbilities.netrunner.interfaceRank}. Управление кибердекой и сетевые действия доступны во вкладке <strong>&quot;Нетраннинг&quot;</strong>.
          </span>
        </div>
      )}

      {/* Generic Role Description & Notes */}
      {role !== 'Solo' && role !== 'Tech' && role !== 'Medtech' && role !== 'Netrunner' && (
        <div className="space-y-2">
          <label className="text-xs text-zinc-400 block">
            Детали способности роли ({role}):
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
