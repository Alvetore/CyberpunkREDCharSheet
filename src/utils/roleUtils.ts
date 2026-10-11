import { Character, StatKey } from '../types/character';

export interface RoleSkillBonusInfo {
  bonus: number;
  badgeRu: string;
  badgeEn: string;
  descriptionRu: string;
  descriptionEn: string;
}

/**
 * Calculates all official Cyberpunk RED role-based skill bonuses.
 * E.g.:
 * - Nomad Moto: +Moto rank to Drive Land, Pilot Air, Pilot Sea, Land Tech, Air Tech, Sea Tech
 * - Solo Combat Awareness: +Threat Detection to Perception
 * - Tech Maker: +Field Expertise to Basic Tech, Cybertech, Electronics/Security, Weaponstech, Vehicle Techs
 */
export function getRoleSkillBonus(character: Character, skillId: string): RoleSkillBonusInfo {
  let totalBonus = 0;
  const badgesRu: string[] = [];
  const badgesEn: string[] = [];
  const descriptionsRu: string[] = [];
  const descriptionsEn: string[] = [];

  // 1. NOMAD: Moto (Мото)
  // CPR Core Rulebook p.161: Nomad adds Moto rank to Drive Land, Pilot Air, Pilot Sea, Land Tech, Air Tech, Sea Tech
  const isNomad = character.role === 'Nomad';
  const motoRank = isNomad ? (character.roleRank || 1) : 0;

  if (motoRank > 0) {
    const nomadSkills = [
      'drive_land',
      'pilot_air',
      'pilot_sea',
      'land_vehicle_tech',
      'air_vehicle_tech',
      'sea_vehicle_tech'
    ];

    if (nomadSkills.includes(skillId)) {
      totalBonus += motoRank;
      badgesRu.push(`Мото +${motoRank}`);
      badgesEn.push(`Moto +${motoRank}`);
      descriptionsRu.push(`Ролевой навык Кочевника «Мото» (+${motoRank})`);
      descriptionsEn.push(`Nomad Role Ability "Moto" (+${motoRank})`);
    }
  }

  // 2. SOLO: Combat Awareness -> Threat Detection (Обнаружение угроз)
  // CPR Core Rulebook p.146: Solo adds Threat Detection points to Perception checks
  const isSolo = character.role === 'Solo';
  const threatDetection = isSolo ? (character.roleAbilities?.solo?.threatDetection || 0) : 0;
  if (threatDetection > 0 && skillId === 'perception') {
    totalBonus += threatDetection;
    badgesRu.push(`Чутьё +${threatDetection}`);
    badgesEn.push(`Threat +${threatDetection}`);
    descriptionsRu.push(`Боевое чутьё: Обнаружение угроз (+${threatDetection})`);
    descriptionsEn.push(`Combat Awareness: Threat Detection (+${threatDetection})`);
  }

  // 3. TECH: Maker -> Field Expertise (Полевой опыт / Полевая работа)
  // CPR Core Rulebook p.147: Tech adds Field Expertise to Basic Tech, Cybertech, Electronics/Security, Weaponstech, Vehicle Techs
  const isTech = character.role === 'Tech';
  const fieldExpertise = isTech ? (character.roleAbilities?.tech?.fieldExpertise || 0) : 0;
  if (fieldExpertise > 0) {
    const techSkills = [
      'basic_tech',
      'cybertech',
      'electronics_security',
      'weaponstech',
      'land_vehicle_tech',
      'air_vehicle_tech',
      'sea_vehicle_tech'
    ];

    if (techSkills.includes(skillId)) {
      totalBonus += fieldExpertise;
      badgesRu.push(`Полевой опыт +${fieldExpertise}`);
      badgesEn.push(`Field Tech +${fieldExpertise}`);
      descriptionsRu.push(`Создатель: Полевой опыт (+${fieldExpertise})`);
      descriptionsEn.push(`Maker: Field Expertise (+${fieldExpertise})`);
    }
  }

  return {
    bonus: totalBonus,
    badgeRu: badgesRu.join(', '),
    badgeEn: badgesEn.join(', '),
    descriptionRu: descriptionsRu.join('; '),
    descriptionEn: descriptionsEn.join('; ')
  } as RoleSkillBonusInfo;
}

export interface HumanityStats {
  baseHumanityMax: number;
  totalInstallationHL: number;
  cyberwarePermanentLoss: number;
  maxRecoverableHumanity: number;
  currentHumanity: number;
  currentEmp: number;
  unrecoveredLoss: number;
  canRestore: boolean;
}

/**
 * Calculates official Cyberpunk RED Humanity and Cyberware parameters:
 * - Base Max Humanity = EMP * 10 (or manual override)
 * - Cyberware Permanent Loss = 2 per standard cyberware with HL > 0, 4 per borgware
 * - Max Recoverable Humanity (Cap) = Base Max - Cyberware Permanent Loss
 * - Current Humanity can be restored via Therapy or rest up to Max Recoverable Humanity
 * - Current EMP = Math.floor(Current Humanity / 10)
 */
export function calculateHumanityStats(character: Character): HumanityStats {
  const baseHumanityMax = character.humanityMaxManual || (character.stats.EMP * 10);
  const cyberwareList = character.cyberware || [];

  const totalInstallationHL = cyberwareList.reduce((acc, c) => acc + (c.humanityCost || 0), 0);

  // Corebook p. 229:
  // "Каждый установленный киберимплант снижает максимум человечности на 2.
  // Каждый имплант боргирования снижает максимум человечности на 4.
  // Киберимпланты с 0 потери человечности при установке не снижают максимум."
  const cyberwarePermanentLoss = cyberwareList.reduce((acc, c) => {
    const cost = c.humanityCost || 0;
    if (cost <= 0) return acc;
    return acc + (c.category === 'Borgware' ? 4 : 2);
  }, 0);

  const maxRecoverableHumanity = Math.max(0, baseHumanityMax - cyberwarePermanentLoss);
  const currentHumanity = Math.max(0, Math.min(character.humanityCurrent, maxRecoverableHumanity));
  const currentEmp = Math.max(0, Math.floor(currentHumanity / 10));
  const unrecoveredLoss = Math.max(0, maxRecoverableHumanity - currentHumanity);
  const canRestore = currentHumanity < maxRecoverableHumanity;

  return {
    baseHumanityMax,
    totalInstallationHL,
    cyberwarePermanentLoss,
    maxRecoverableHumanity,
    currentHumanity,
    currentEmp,
    unrecoveredLoss,
    canRestore
  };
}
