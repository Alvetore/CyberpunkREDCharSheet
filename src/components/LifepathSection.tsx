import React from 'react';
import { Character } from '../types/character';
import { Language } from '../locales/i18n';
import { LifepathEditor } from './LifepathEditor';

interface LifepathSectionProps {
  character: Character;
  onUpdateCharacter: (character: Character) => void;
  lang: Language;
}

export const LifepathSection: React.FC<LifepathSectionProps> = ({ character, onUpdateCharacter, lang }) => <LifepathEditor
  value={character.lifepath}
  onChange={lifepath => onUpdateCharacter({ ...character, lifepath })}
  lang={lang}
  idPrefix="lifepath"
/>;
