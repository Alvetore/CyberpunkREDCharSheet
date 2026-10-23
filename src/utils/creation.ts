import { Skill, StatKey } from '../types/character';

export const BASIC_SKILL_IDS = ['athletics','brawling','concentration','conversation','education','evasion','first_aid','human_perception','language_streetslang','local_expert','perception','persuasion','stealth'];

export function creationErrors(method: 'streetrat' | 'edgerunner' | 'pointbuy', stats: Record<StatKey, number>, skills: Skill[], careerSkills: Record<string, number>, budget: number): string[] {
  const errors: string[] = [];
  if (Object.values(stats).some(value => !Number.isInteger(value) || value < 2 || value > 8)) errors.push('STAT: 2–8');
  if (method === 'pointbuy' && Object.values(stats).reduce((sum, value) => sum + value, 0) !== 62) errors.push('STAT: 62 points');
  if (skills.reduce((sum, skill) => sum + skill.level * skill.multiplier, 0) !== 86) errors.push('Skills: 86 points');
  if (skills.some(skill => !Number.isInteger(skill.level) || skill.level < 0 || skill.level > 6)) errors.push('Skills: 0–6');
  if (BASIC_SKILL_IDS.some(id => (skills.find(skill => skill.id === id)?.level ?? 0) < 2)) errors.push('Basic Skills: minimum 2');
  if (method === 'edgerunner' && skills.some(skill => skill.id in careerSkills ? skill.level < 2 : skill.level !== 0)) errors.push('Edgerunner: 20 career skills, minimum 2');
  if (budget < 0) errors.push('Budget exceeded');
  return errors;
}
