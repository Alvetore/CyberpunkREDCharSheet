import React, { useState } from 'react';
import type { Character, RollResult } from '../types/character';
import { rollD6 } from '../utils/dice';
import { charismaticImpactBase, execTeamSize, fixerReach, fixerTradingBase, mediaBelievability, medtechSkills, roleTechnicalBase, rollExecLoyalty, rollLawmanBackup, rollMediaStory, rollRoleSkill } from '../utils/roleAbilities';

interface Props { character:Character; lang:'ru'|'en'; onUpdateCharacter:(character:Character)=>void; onRollResult?:(result:RollResult)=>void }
export const RoleActions:React.FC<Props> = ({character:c,lang,onUpdateCharacter,onRollResult}) => {
  const ru=lang==='ru', rank=c.roleRank;
  const [easyEvidence,setEasyEvidence]=useState(false), [hardEvidence,setHardEvidence]=useState(0);
  const [techSkill,setTechSkill]=useState('basic_tech');
  const emit=(result:RollResult)=>onRollResult?.(result);
  const check=(title:string,base:number,dv?:number)=>emit(rollRoleSkill(c,title,base,lang,dv));
  const button=(text:string,act:()=>void,disabled=false)=><button type="button" key={text} disabled={disabled} onClick={act} className="px-3 py-2 text-xs rounded bg-cyan-950 border border-cyan-700 text-cyan-200 disabled:opacity-40">{text}</button>;
  const members=c.roleAbilities.exec?.members??[];
  const setMembers=(next:typeof members)=>onUpdateCharacter({...c,roleAbilities:{...c.roleAbilities,exec:{...c.roleAbilities.exec,members:next}}});
  const panel='bg-zinc-950 border border-zinc-800 p-3 rounded space-y-3 text-xs text-zinc-300';
  if(c.role==='Rockerboy') return <section className={panel}><h3 className="text-cyan-300 font-bold">{ru?'Харизматическое влияние':'Charismatic Impact'} · {rank}</h3>
    <p>{ru?'1d10 + ранг, без характеристики, со штрафами ранений. Превращение в фанатов — вне боя; услуги зависят от ранга. После отказа ту же услугу нельзя просить неделю.':'1d10 + rank, no STAT, wound penalties apply. Convert non-fans outside combat; favors depend on rank. Wait a week before repeating a failed favor.'}</p>
    <p>{ru?['Небольшие клубы; мелкая услуга одному фанату.','Известные клубы; крупная услуга одному, компания до 6 фанатов.','Крупные клубы; мелкое преступление от одного, личная компания до 6 фанатов.','Небольшие концертные залы; один фанат рискует жизнью, малая группа совершает мелкое преступление.','Крупные залы и национальные трансляции; преступление от одного, серьёзное преступление от малой группы.','Мировые туры; фанаты готовы жертвовать собой, группы действуют как преданный культ.'][rank>=10?5:rank>=9?4:Math.floor((rank-1)/2)]:'Core pp.144–145: use the current rank to limit favors and performance venues.'}</p>
    <div className="flex flex-wrap gap-2">{[8,10,12].map((dv,i)=>button(`${ru?['Один фанат','До 6 фанатов','Большая группа'][i]:['One fan','Up to 6 fans','Large group'][i]} · DV ${dv}`,()=>check(ru?'Харизматическое влияние':'Charismatic Impact',charismaticImpactBase(c),dv)))}</div>
  </section>;
  if(c.role==='Media') return <section className={panel}><h3 className="text-cyan-300 font-bold">{ru?'Авторитетность':'Credibility'} · {rank}</h3>
    <p>{ru?'Пассивные слухи: мастер тайно проверяет ранг + 1d10 минимум дважды в неделю. Активный поиск использует обычные навыки сбора информации.':'Passive rumors: GM secretly rolls rank + 1d10 at least twice a week. Active investigation uses information-gathering skills.'}</p>
    <div className="flex flex-wrap gap-2">{[7,9,11,13].map(dv=>button(`${ru?'Пассивный слух':'Passive rumor'} · DV ${dv}`,()=>check(ru?'Авторитетность: пассивный слух':'Credibility: passive rumor',rank,dv)))}</div>
    <p>{ru?`Базовая убедительность: ${mediaBelievability(rank)} из 10. Масштаб аудитории: ${rank>=10?'весь мир':rank>=9?'страна':rank>=7?'штат':rank>=5?'город':rank>=3?'несколько районов':'район'}.`:`Base believability: ${mediaBelievability(rank)} in 10.`}</p>
    <label className="block"><input type="checkbox" checked={easyEvidence} onChange={e=>setEasyEvidence(e.target.checked)} /> {ru?'Хотя бы одно понятное проверяемое доказательство (+1)':'At least one easily understood verifiable proof (+1)'}</label>
    <label className="block">{ru?'Различные твёрдые доказательства (4+ дают +2)':'Distinct hard evidence (4+ grants +2)'} <input aria-label="Hard evidence" type="number" min="0" value={hardEvidence} onChange={e=>setHardEvidence(Math.max(0,parseInt(e.target.value)||0))} className="w-16 bg-zinc-900 p-1" /></label>
    {button(ru?'Проверить убедительность':'Check believability',()=>emit(rollMediaStory(c,easyEvidence,hardEvidence,lang)))}
  </section>;
  if(c.role==='Lawman') return <section className={panel}><h3 className="text-cyan-300 font-bold">{ru?'Подкрепление':'Backup'} · {rank}</h3>
    <p>{ru?'Действие: обычный 1d10 ≤ ранг. При ответе 1d6 определяет число раундов до прибытия. Подкреплением управляет мастер; уклоняться от пуль оно не может.':'Action: plain 1d10 ≤ rank. On success, 1d6 gives rounds until arrival. The GM controls backup; they cannot dodge bullets.'}</p>
    <p>{ru?(rank>=10?'Национальные службы: 2 бойца, БП14, ОС11, ПЗ35.':rank>=9?'C-SWAT: 2 бойца, БП15, ОС18, ПЗ35.':rank>=8?'Маршал: 1 боец, БП16, ОС15, ПЗ50.':rank>=5?'Шерифы: 2 бойца, БП14, ОС13, ПЗ35.':rank>=3?'Патрульные: 4 бойца, БП10, ОС7, ПЗ25.':'Охрана: 4 бойца, БП8, ОС7, ПЗ20.'):'Backup composition follows Core pp.158–159 for the selected rank.'}</p>
    {button(ru?'Вызвать подкрепление':'Call Backup',()=>emit(rollLawmanBackup(c,lang)))}
  </section>;
  if(c.role==='Fixer') return <section className={panel}><h3 className="text-cyan-300 font-bold">{ru?'Деловая хватка':'Operator'} · {rank}</h3>
    <p>{ru?`Охват: товары до ${fixerReach(rank)}. Торг: КРУТ + Торговля + ранг; ранг уже включён в навык. Одна сделка на транзакцию, проверка против Торговли второй стороны.`:`Reach: items up to ${fixerReach(rank)}. Haggle: COOL + Trading + rank; rank already included in Trading. One deal per transaction; oppose the other party's Trading.`}</p>
    <ul className="list-disc pl-4"><li>{ru?`Покупка/продажа: ±${rank>=9?20:10}% при успешном торге.`:`Buy/sell: ±${rank>=9?20:10}% after successful haggling.`}</li>
      {rank>=3&&<li>{ru?'При покупке 5 одинаковых предметов — шестой бесплатно; дополнительная культура и язык 4.':'Buy 5 identical items, get one free; additional culture and language at 4.'}</li>}
      {rank>=5&&<li>{ru?'Ночной рынок раз в месяц с другими фиксерами; оплата работы до ±20%. Всего 3 дополнительные культуры/языка 4.':'Monthly Night Market with other Fixers; job pay up to ±20%. Three additional cultures/languages at 4.'}</li>}
      {rank>=7&&<li>{ru?'Роскошь/суперроскошь: половина сейчас, половина через месяц; всего 6 дополнительных культур/языков 4.':'Luxury/Super Luxury: half now, half next month; six additional cultures/languages at 4.'}</li>}
      {rank>=9&&<li>{ru?'Можно организовать Полуночный рынок.':'Can arrange a Midnight Market.'}</li>}
      {rank>=10&&<li>{ru?'Оплата опасной работы может быть удвоена при успехе.':'Successful haggling may double dangerous job pay.'}</li>}</ul>
    <p>{ru?'Согласованные цены и языки вносятся вручную; магазин не считает скидку гарантированной.':'Enter agreed prices and languages manually; shop discounts are not guaranteed.'}</p>
    {button(`${ru?'Торг':'Haggle'} · ${fixerTradingBase(c)} + 1d10`,()=>check(ru?'Деловая хватка: Торг':'Operator: Haggle',fixerTradingBase(c)))}
  </section>;
  if(c.role==='Exec') return <section className={panel}><h3 className="text-cyan-300 font-bold">{ru?'Командная работа':'Teamwork'} · {rank}</h3>
    <p>{ru?`Команда: ${members.length}/${execTeamSize(rank)}. Деловая одежда с ранга 1; ${rank>=10?'особняк/пентхаус':rank>=7?'дом в Бивервилле':rank>=2?'корпоративный конапт':'жильё ещё не предоставляется'}. ${rank>=8?'Trauma Team Executive':rank>=6?'Trauma Team Silver':'Без корпоративной медицинской страховки'}.`:`Team: ${members.length}/${execTeamSize(rank)}. Businesswear at 1; corporate housing at 2 (upgrade at 7/10), Trauma Team Silver at 6, Executive at 8.`}</p>
    <p>{ru?'Лояльность: 1d6 меньше текущей лояльности. Новому сотруднику бросьте 1d6+1; замене погибшего назначьте 1. Между сессиями максимум 10; в сессии предел не действует.':'Loyalty: 1d6 below current Loyalty. New employee: 1d6+1; replacement for a dead employee: 1. Between sessions cap at 10; no in-session cap.'}</p>
    {members.map((member,index)=><div key={member.id} className="flex flex-wrap items-center gap-2 border-t border-zinc-800 pt-2">
      <input aria-label={`${ru?'Имя сотрудника':'Employee name'} ${index+1}`} value={member.name} placeholder={ru?'Имя':'Name'} onChange={e=>setMembers(members.map(m=>m.id===member.id?{...m,name:e.target.value}:m))} className="bg-zinc-900 p-1" />
      <input aria-label={`${ru?'Специализация':'Specialty'} ${index+1}`} value={member.specialty} placeholder={ru?'Телохранитель, водитель, техник…':'Bodyguard, driver, technician…'} onChange={e=>setMembers(members.map(m=>m.id===member.id?{...m,specialty:e.target.value}:m))} className="bg-zinc-900 p-1" />
      <label>{ru?'Лояльность':'Loyalty'} <input type="number" aria-label={`Loyalty ${index+1}`} value={member.loyalty} onChange={e=>setMembers(members.map(m=>m.id===member.id?{...m,loyalty:parseInt(e.target.value)||0}:m))} className="bg-zinc-900 p-1 w-16" /></label>
      {button(`${ru?'Проверка':'Check'}: ${member.name||(ru?'Сотрудник ':'Employee ')+(index+1)}`,()=>emit(rollExecLoyalty(member.name,member.loyalty,lang)))}
      {button(`${ru?'Убрать':'Remove'}: ${member.name||(ru?'Сотрудник ':'Employee ')+(index+1)}`,()=>setMembers(members.filter(m=>m.id!==member.id)))}
    </div>)}
    {button(ru?'Добавить сотрудника':'Add employee',()=>setMembers([...members,{id:crypto.randomUUID(),name:'',specialty:'',loyalty:rollD6()+1}]),members.length>=execTeamSize(rank))}
    {members.length>execTeamSize(rank)&&<p role="alert">{ru?'Команда превышает доступный размер текущего ранга. Сохранённые сотрудники не удалены.':'Team exceeds the current rank limit. Existing employees are preserved.'}</p>}
  </section>;
  if(c.role==='Medtech') {
    const skills=medtechSkills(c), known=c.roleAbilities.medtechKnownPharmaceuticals??[];
    const meds=['Antibiotic','Rapidetox','Speedheal','Stim','Surge'];
    return <section className={panel}><h3 className="text-cyan-300 font-bold">{ru?'Медицина: проверки и специализации':'Medicine: checks and specialties'}</h3>
      <p>{ru?`Хирургия: ${skills.surgery} (2 за очко). Медицинские технологии: ${skills.medicalTech} (фармацевтика + криосистемы). Не заменяют Первую помощь/Парамедицину.`:`Surgery: ${skills.surgery} (2 per point). Medical Tech: ${skills.medicalTech} (Pharmaceuticals + Cryosystem Operation). Separate from First Aid/Paramedic.`}</p>
      <div className="flex flex-wrap gap-2">{button(`${ru?'Хирургия':'Surgery'} · ${roleTechnicalBase(c,skills.surgery)} + 1d10`,()=>check(ru?'Хирургия':'Surgery',roleTechnicalBase(c,skills.surgery)),!skills.surgery)}{button(`${ru?'Медицинские технологии':'Medical Tech'} · ${roleTechnicalBase(c,skills.medicalTech)} + 1d10`,()=>check(ru?'Медицинские технологии':'Medical Tech',roleTechnicalBase(c,skills.medicalTech)),!skills.medicalTech)}</div>
      <p>{ru?`Известные препараты: ${known.length}/${c.roleAbilities.medtech.pharmaceuticals}. Синтез: 1 час, 200 eb материалов, СЛ13; при успехе ${skills.medicalTech} доз. Расход материалов и доз отмечается вручную.`:`Known drugs: ${known.length}/${c.roleAbilities.medtech.pharmaceuticals}. Synthesis: 1 hour, 200 eb materials, DV13; success yields ${skills.medicalTech} doses. Track materials/doses manually.`}</p>
      <div className="flex flex-wrap gap-3">{meds.map((med,i)=><label key={med}><input type="checkbox" checked={known.includes(med)} disabled={!known.includes(med)&&known.length>=c.roleAbilities.medtech.pharmaceuticals} onChange={e=>onUpdateCharacter({...c,roleAbilities:{...c.roleAbilities,medtechKnownPharmaceuticals:e.target.checked?[...known,med]:known.filter(x=>x!==med)}})} /> {ru?['Антибиотик','Рапидетокс','Спидхил','Стим','Сурдж'][i]:med}</label>)}</div>
      {button(ru?'Синтез препарата · СЛ13':'Synthesize drug · DV13',()=>check(ru?'Синтез препарата':'Synthesize drug',roleTechnicalBase(c,skills.medicalTech),13),!known.length)}
      <p>{ru?`Криосистемы: ${c.roleAbilities.medtech.medicalTech} очк. 1: крионасос; 2: доступ к криокамере; 3: своя камера; 4: ещё две камеры, насос на 2 заряда/места; 5: ещё три камеры, насос на 3 заряда/места.`:'Cryosystems: 1 pump; 2 cryotank facility access; 3 owned tank; 4 adds two tanks and upgrades pump; 5 adds three tanks and upgrades pump again.'}</p>
    </section>;
  }
  if(c.role==='Tech') return <section className={panel}><h3 className="text-cyan-300 font-bold">{ru?'Создатель':'Maker'}</h3><p>{ru?'Полевой опыт уже учтён в технических навыках. Изготовление, модификация и изобретение: текущая ТЕХ + соответствующий технический навык + специализация; СЛ, срок и материалы определяет предмет. Полевой опыт в эти три проверки повторно не добавляется.':'Field Expertise is included in tech skills. Fabrication/Upgrade/Invention: current TECH + appropriate tech skill + specialty; item determines DV, time and materials. Do not add Field Expertise to these three checks.'}</p>
    <label>{ru?'Технический навык':'Technical skill'} <select aria-label="Maker technical skill" value={techSkill} onChange={e=>setTechSkill(e.target.value)} className="bg-zinc-900 p-1">{c.skills.filter(s=>['basic_tech','cybertech','electronics_security','weaponstech','land_vehicle_tech','air_vehicle_tech','sea_vehicle_tech'].includes(s.id)).map(s=><option key={s.id} value={s.id}>{ru?s.nameRu:s.nameEn} · {s.level}</option>)}</select></label>
    <div className="flex flex-wrap gap-2">{(['upgrade','fabrication','invention'] as const).map((key,i)=>button(ru?['Модификация','Изготовление','Изобретение'][i]:key,()=>check(ru?['Модификация','Изготовление','Изобретение'][i]:key,roleTechnicalBase(c,c.roleAbilities.tech[key])+(c.skills.find(s=>s.id===techSkill)?.level??0)),!c.roleAbilities.tech[key]))}</div>
  </section>;
  return null;
};
