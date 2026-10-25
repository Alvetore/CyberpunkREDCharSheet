import React, { useState } from 'react';
import { Character, CyberwareItem } from '../types/character';
import { Language } from '../locales/i18n';
import { cyberwareDefinition, cyberwareHosts, cyberwareInstallError, cyberwareMounts, cyberwareSlotLabel, findCyberwarePlacement, installCyberware, isCyberwareInstalled, mountableWeapons } from '../utils/cyberware';

interface Props {
  character: Character;
  item: CyberwareItem;
  lang: Language;
  onUpdateCharacter: (character: Character) => void;
  onClose: () => void;
}

export const CyberwareInstallModal: React.FC<Props> = ({ character, item, lang, onUpdateCharacter, onClose }) => {
  const definition = cyberwareDefinition(item);
  const mounts = cyberwareMounts(item);
  const [targets, setTargets] = useState<string[]>(() => item.installedIn ?? findCyberwarePlacement(character, item) ?? mounts.map(() => ''));
  const [weaponId, setWeaponId] = useState(item.embeddedWeaponId ?? '');
  const [error, setError] = useState('');
  const hosts = cyberwareHosts(character, item.id);
  const alreadyInstalled = isCyberwareInstalled(character, item);
  const placementError = cyberwareInstallError(character, item, targets, lang);
  const requiresWeapon = definition.weaponMount && (!alreadyInstalled || !definition.weapon);
  const weapons = definition.weaponMount ? mountableWeapons(character, definition.weaponMount) : [];
  const submit = () => {
    const result = installCyberware(character, item.id, targets, lang, weaponId);
    if (!result.character) { setError(result.error ?? 'Installation failed'); return; }
    onUpdateCharacter(result.character);
    onClose();
  };
  return <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-sm no-print">
    <section role="dialog" aria-modal="true" aria-label={lang === 'ru' ? 'Установка импланта' : 'Install cyberware'} className="bg-zinc-900 border border-cyan-500 rounded-lg p-4 space-y-3 max-w-xl w-full max-h-[90dvh] overflow-y-auto">
      <div className="flex justify-between gap-3"><h3 className="font-orbitron text-cyan-300">{definition.name}</h3><button aria-label={lang === 'ru' ? 'Закрыть установку' : 'Close installation'} onClick={onClose}>✕</button></div>
      <p className="text-xs text-zinc-400">{alreadyInstalled ? (lang === 'ru' ? 'Переназначение размещения: повторная Humanity не списывается.' : 'Reassign placement: no repeated Humanity loss.') : (lang === 'ru' ? 'Humanity списывается при установке. Услуги клиники и особые условия сверяйте с описанием.' : 'Installation deducts Humanity. Check clinic fees and special conditions in the description.')}</p>
      {mounts.map((mount, index) => <label key={index} className="block text-xs text-zinc-200">
        {lang === 'ru' ? `Крепление ${index + 1}: ${mount.slots} слот(а)` : `Mount ${index + 1}: ${mount.slots} slot(s)`} · {mount.allowedHosts.map(type => cyberwareSlotLabel(type,lang)).join(' / ')}
        <select aria-label={`${lang === 'ru' ? 'Место установки' : 'Installation host'} ${index + 1}`} value={targets[index] ?? ''} onChange={event => { setTargets(mounts.map((_, i) => i === index ? event.target.value : targets[i] ?? '')); setError(''); }} className="block w-full bg-zinc-950 border border-zinc-700 p-2 rounded mt-1">
          <option value="">{lang === 'ru' ? 'Выберите основание / часть тела' : 'Choose a foundation / body part'}</option>
          {hosts.filter(host => host.ownerId !== item.id && mount.allowedHosts.includes(host.type)).map(host => <option key={host.id} value={host.id}>{host.name} · {host.capacity === 0 ? (lang === 'ru' ? 'особое крепление' : 'special mount') : `${host.used}/${host.capacity}`}</option>)}
        </select>
      </label>)}
      {definition.installRule?.paired && <p className="text-xs text-amber-300">{lang === 'ru' ? 'Для работы нужны две отдельно купленные копии на разных основаниях. Установка одной копии занимает её слоты и списывает её HL.' : 'Requires two separately purchased copies on different hosts. Each copy consumes its own slots and Humanity.'}</p>}
      {requiresWeapon && <label className="block text-xs text-zinc-200">{lang === 'ru' ? 'Имеющееся одноручное оружие' : 'Owned one-handed weapon'}
        <select aria-label="Embedded weapon" value={weaponId} onChange={event => setWeaponId(event.target.value)} className="block w-full p-2 bg-zinc-950 border border-zinc-700 rounded mt-1"><option value="">{lang === 'ru' ? 'Выберите оружие' : 'Choose a weapon'}</option>{weapons.map(weapon => <option key={weapon.id} value={weapon.id}>{weapon.name}</option>)}</select>
        <span className="block text-zinc-400 mt-1">{lang === 'ru' ? 'Оружие переносится из инвентаря в имплант, без дублирования. При снятии вернётся в инвентарь с остатком патронов.' : 'Transfers the weapon into the implant without duplicating it. Uninstalling returns it with remaining ammo.'}</span>
      </label>}
      <details className="text-xs text-zinc-400"><summary>{lang === 'ru' ? 'Условия и описание' : 'Conditions and description'}</summary><p className="whitespace-pre-line mt-2">{definition.description}</p></details>
      {definition.installRule?.notes && <p className="text-xs text-amber-300 whitespace-pre-line">{definition.installRule.notes}</p>}
      {(error || placementError) && <p role="alert" className="text-xs text-red-300">{error || placementError}</p>}
      <div className="flex justify-end gap-2"><button onClick={onClose} className="px-3 py-2 bg-zinc-800 rounded text-xs">{lang === 'ru' ? 'Отмена' : 'Cancel'}</button><button disabled={!!placementError || (!!requiresWeapon && !weaponId)} onClick={submit} className="px-3 py-2 bg-cyan-600 text-black font-bold rounded text-xs disabled:opacity-40">{lang === 'ru' ? 'Подтвердить установку' : 'Confirm installation'}</button></div>
    </section>
  </div>;
};
