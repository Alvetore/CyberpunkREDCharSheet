import React, { useState } from 'react';
import { Character } from '../types/character';
import { Language } from '../locales/i18n';
import { backpackCyberware, equipBackpackArmor, setWeaponEquipped } from '../utils/backpack';
import { CyberwareInstallModal } from './CyberwareInstallModal';
import { uninstallCyberware } from '../utils/cyberware';

interface Props { character: Character; lang: Language; onUpdateCharacter: (character: Character) => void }

export const BackpackEquipmentSection: React.FC<Props> = ({ character, lang, onUpdateCharacter }) => {
  const [installId, setInstallId] = useState<string | null>(null);
  const cyberware = backpackCyberware(character);
  const removeCyberware = (id: string) => {
    const uninstalled = uninstallCyberware(character, id);
    onUpdateCharacter({ ...uninstalled, cyberware: uninstalled.cyberware.filter(item => item.id !== id) });
  };
  const rows = [
    ...character.weapons.filter(item => item.isEquipped === false).map(item => ({ id: item.id, name: item.name, type: lang === 'ru' ? 'Оружие' : 'Weapon', notes: item.notes, stats: `${item.damage || '—'} · ${item.currentAmmo}/${item.magCapacity}`, useLabel: lang === 'ru' ? 'Взять оружие' : 'Equip weapon', use: () => onUpdateCharacter(setWeaponEquipped(character, item.id, true)), remove: () => onUpdateCharacter({ ...character, weapons: character.weapons.filter(weapon => weapon.id !== item.id) }) })),
    ...(character.spareArmor ?? []).map(item => ({ id: item.id, name: item.name, type: lang === 'ru' ? 'Броня' : 'Armor', notes: item.notes ?? '', stats: `SP ${item.spCurrent}/${item.spMax} · ${item.location}`, useLabel: lang === 'ru' ? 'Надеть' : 'Equip armor', use: () => onUpdateCharacter(equipBackpackArmor(character, item.id, lang)), remove: () => onUpdateCharacter({ ...character, spareArmor: character.spareArmor?.filter(armor => armor.id !== item.id) }) })),
    ...cyberware.map(item => ({ id: item.id, name: item.name, type: lang === 'ru' ? 'Киберимплант' : 'Cyberware', notes: item.description, stats: item.humanityCostKnown === false ? 'HL —' : `${item.humanityCost} HL`, useLabel: lang === 'ru' ? 'Установить' : 'Install', use: () => setInstallId(item.id), remove: () => removeCyberware(item.id) })),
  ];
  const install = character.cyberware.find(item => item.id === installId);
  if (!rows.length && !install) return null;
  return <section className="rounded-lg border border-cyan-900 bg-zinc-900 p-3 space-y-3">
    <h3 className="font-semibold text-sm text-cyan-300">{lang === 'ru' ? 'Снаряжение в рюкзаке' : 'Backpack equipment'} · {rows.length}</h3>
    <p className="text-xs text-zinc-500">{lang === 'ru' ? 'Эти предметы не используются. Их параметры и состояние сохранены.' : 'These items are inactive. Their stats and condition are preserved.'}</p>
    <div className="grid md:grid-cols-2 gap-2">{rows.map(row => <article key={row.id} className="rounded border border-zinc-800 bg-zinc-950 p-3 space-y-2">
      <div className="flex flex-wrap justify-between gap-2"><strong className="text-xs text-zinc-200">{row.name}</strong><span className="text-[10px] text-cyan-400">{row.type}</span></div>
      <p className="text-[11px] text-zinc-400">{row.stats}</p>
      <details className="text-xs text-zinc-500"><summary>{lang === 'ru' ? 'Описание' : 'Description'}</summary><p className="whitespace-pre-line max-h-40 overflow-y-auto mt-2">{row.notes}</p></details>
      <div className="flex justify-between gap-2"><button onClick={row.use} className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 text-xs">{row.useLabel}</button><button aria-label={`${lang === 'ru' ? 'Удалить из рюкзака' : 'Remove from backpack'}: ${row.name}`} onClick={row.remove} className="text-xs text-zinc-500 hover:text-red-400">{lang === 'ru' ? 'Удалить' : 'Remove'}</button></div>
    </article>)}</div>
    {install && <CyberwareInstallModal key={install.id} character={character} item={install} lang={lang} onUpdateCharacter={onUpdateCharacter} onClose={() => setInstallId(null)} />}
  </section>;
};
