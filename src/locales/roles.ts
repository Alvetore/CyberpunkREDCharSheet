import type { RoleType } from '../types/character';

// Printed names in corebook.txt, Roles chapter (pp.143–161).
export const ROLE_NAMES_RU: Record<RoleType,string> = {
  Solo:'Соло', Netrunner:'Нетраннер', Tech:'Техник', Medtech:'Медтех',
  Rockerboy:'Рокербой', Media:'Медиа', Lawman:'Законник', Exec:'Менеджер',
  Fixer:'Фиксер', Nomad:'Кочевник',
};
export const roleName = (role: RoleType, lang: 'ru' | 'en') => lang === 'ru' ? ROLE_NAMES_RU[role] : role;

/** Hide only known generated starter text; never rewrite a player's notes. */
export function roleAbilityNotes(details:string):string {
  const value=details.trim();
  const names=[...Object.keys(ROLE_NAMES_RU),...Object.values(ROLE_NAMES_RU)];
  if (value==='Способность роли ранга 4.' || names.some(name=>value===`Способность роли ${name} ранга 4.` || value===`Role ability for ${name} at rank 4.`)) return '';
  return details;
}
