import type { RoleType } from '../types/character';

// Printed names in corebook.txt, Roles chapter (pp.143–161).
export const ROLE_NAMES_RU: Record<RoleType,string> = {
  Solo:'Соло', Netrunner:'Нетраннер', Tech:'Техник', Medtech:'Медтех',
  Rockerboy:'Рокербой', Media:'Медиа', Lawman:'Законник', Exec:'Менеджер',
  Fixer:'Фиксер', Nomad:'Кочевник',
};
export const roleName = (role: RoleType, lang: 'ru' | 'en') => lang === 'ru' ? ROLE_NAMES_RU[role] : role;
