const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { load, mount, nodes, button, randomSequence } = require('./helpers.cjs');
const { createEmptyCharacter, CPR_SKILLS, CPR_RANGE_DV_TABLE, PRESET_PROGRAMS } = load('src/data/initialData.ts');
const { CPR_ROLE_PACKAGES } = load('src/data/roleTemplates.ts');
const dice = load('src/utils/dice.ts');
const rules = load('src/utils/rules.ts');
const damage = load('src/utils/damage.ts');
const storage = load('src/utils/storage.ts');
const { calculateHumanityStats } = load('src/utils/roleUtils.ts');
const { getUnarmedDamage } = load('src/data/meleeRules.ts');
const { creationErrors } = load('src/utils/creation.ts');
const { App } = load('src/App.tsx');
const { Header } = load('src/components/Header.tsx');
const { SectionNav } = load('src/components/SectionNav.tsx');
const { StatsSection } = load('src/components/StatsSection.tsx');
const { DiceRollerModal } = load('src/components/DiceRollerModal.tsx');
const { DamageCalculatorModal } = load('src/components/DamageCalculatorModal.tsx');
const { CharacterWizardModal } = load('src/components/CharacterWizardModal.tsx');
const { WeaponsSection } = load('src/components/WeaponsSection.tsx');
const { DataPoolShopModal } = load('src/components/DataPoolShopModal.tsx');
const { isCharacter } = load('src/utils/characterValidation.ts');
const { CyberwareSection } = load('src/components/CyberwareSection.tsx');
const { NetrunnerSection } = load('src/components/NetrunnerSection.tsx');
const { DATAPOOL_WEAPONS } = load('src/data/datapoolCatalog.ts');
let memory;
beforeEach(() => {
  memory = new Map();
  global.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key,value) => memory.set(key,value) };
  global.alert = () => {};
});
const fresh = () => createEmptyCharacter('Regression');
const options = { location:'body', attackType:'ranged',rawDamage:15,critical:false,hasShield:false,shieldHp:10 };

test('check must beat DV; a tie fails', () => {
  const roll = randomSequence([0.4], () => dice.executeCyberpunkCheck({title:'DV',baseVal:10,targetDv:15}));
  assert.equal(roll.total,15); assert.equal(roll.isSuccess,false);
});
test('critical success adds exactly one die; fumble subtracts exactly one', () => {
  assert.equal(randomSequence([0.99],()=>dice.executeCyberpunkCheck({title:'10',baseVal:0})).total,20);
  assert.equal(randomSequence([0,0.99],()=>dice.executeCyberpunkCheck({title:'1',baseVal:10})).total,1);
});
test('death natural 10 fails even with BODY 14; no normal exploding die', () => {
  assert.equal(randomSequence([0.99],()=>dice.executeDeathSave(14,0)).isSuccess,false);
  assert.equal(randomSequence([0],()=>dice.executeDeathSave(6,0)).total,1);
});
test('damage parser rejects malformed, zero and unbounded dice', () => {
  for(const formula of ['3d65d6','abc','0d6','1000000000d6','-1d6','1d6+Infinity']) assert.throws(()=>dice.executeDamageRoll('bad',formula));
  assert.deepEqual(dice.parseDamageFormula(' 4d6+2 '),{numDice:4,flatBonus:2});
});
test('critical bonus is separate from raw damage', () => {
  const roll=randomSequence([0.99],()=>dice.executeDamageRoll('crit','2d6'));
  assert.equal(roll.rawDamage,12);assert.equal(roll.total,17);assert.equal(roll.bonusDamage,5);
});
test('therapy recovery survives a save/load and unknown data is lossless', () => {
  const c=fresh();c.humanityCurrent=56;c.extra={zero:0,off:false,nil:null,nested:['Я',{}]};
  assert.equal(storage.saveCharactersToStorage([c]),true);
  const loaded=storage.loadStoredCharacters()[0];
  assert.equal(loaded.humanityCurrent,56);assert.deepEqual(loaded.extra,c.extra);
});
test('empty or partial backups are rejected without replacing state', () => {
  for(const input of ['[]','[null]','[{}]','{"id":"x","name":"X","stats":{}}','{}']) assert.equal(storage.parseImportedJson(input),null);
  const c=fresh();assert.ok(storage.parseImportedJson(JSON.stringify(c)));
  assert.equal(storage.parseImportedJson(JSON.stringify([c,c])),null);
});
test('invalid storage original is backed up byte-for-byte before overwrite', () => {
  memory.set('cpr_characters_v1','{"broken":');
  const previous=console.error;console.error=()=>{};
  try { const chars=storage.loadStoredCharacters(); assert.equal(memory.get('cpr_characters_v1'),'{"broken":');assert.equal(storage.saveCharactersToStorage(chars),true); }
  finally {console.error=previous;}
  assert.equal(memory.get('cpr_characters_recovery_v1'),'{"broken":');
  storage.saveCharactersToStorage([fresh()]);assert.equal(memory.get('cpr_characters_recovery_v1'),'{"broken":');
});
test('backup write failure prevents overwriting an original', () => {
  const original=JSON.stringify([fresh()]);memory.set('cpr_characters_v1',original);
  global.localStorage.setItem=()=>{throw new Error('quota');};
  const previous=console.error;console.error=()=>{};
  try {assert.equal(storage.saveCharactersToStorage([fresh()]),false);}finally{console.error=previous;}
  assert.equal(memory.get('cpr_characters_v1'),original);
});
test('current EMP owns Conversation and Human Perception', () => {
  const c=fresh();c.humanityCurrent=20;
  assert.equal(rules.effectiveStat(c,'EMP'),2);assert.equal(rules.skillBase(c,'conversation'),4);
});
test('negative Humanity survives save/load without a fictitious refund', () => {
  const c=fresh();c.humanityCurrent=-7;
  storage.saveCharactersToStorage([c]);assert.equal(storage.loadStoredCharacters()[0].humanityCurrent,-7);
  assert.equal(calculateHumanityStats(c).currentEmp,0);
});
test('wound threshold is strict and uses a manual HP maximum consistently', () => {
  const c=fresh();c.hpCurrent=20;assert.equal(rules.woundPenalty(c),0);
  c.hpCurrent=19;assert.equal(rules.woundPenalty(c),-2);
  c.hpMaxManual=60;c.hpCurrent=29;assert.equal(rules.woundPenalty(c),-2);
});
test('armor reaches zero REF while mortal MOVE has minimum one', () => {
  const c=fresh();c.stats.REF=2;c.armor.body.penalty=-4;c.hpCurrent=0;
  assert.equal(rules.effectiveStat(c,'REF'),0);assert.equal(rules.effectiveStat(c,'MOVE'),1);
});
test('unarmed scale and cyberarm minimum match the core table', () => {
  assert.deepEqual([4,6,8,10,12,14].map(n=>getUnarmedDamage(n)),['1d6','2d6','3d6','3d6','4d6','4d6']);
  assert.equal(getUnarmedDamage(3,true),'2d6');
});
test('shield absorbs the whole hit; persistent HP is updated', () => {
  const c=fresh();c.armor.body.spCurrent=0;c.armor.shield={...c.armor.body,id:'shield',location:'shield',spCurrent:10,spMax:10};
  const result=damage.resolveDamage(c,{...options,hasShield:true},()=>3);
  assert.equal(result.finalHpDamage,0);assert.equal(result.remainingShieldHp,0);
  assert.equal(damage.applyDamage(c,result).armor.shield.spCurrent,0);
});
test('a shield also blocks the injury on the absorbed hit', () => {
  const c=fresh();const result=damage.resolveDamage(c,{...options,critical:true,hasShield:true},()=>3);
  assert.equal(result.isCritInjury,false);assert.equal(result.finalHpDamage,0);
});
test('headshot critical is after armor and not multiplied', () => {
  const c=fresh();c.armor.head.spCurrent=11;
  const result=damage.resolveDamage(c,{...options,location:'head',rawDamage:15,critical:true},()=>3);
  assert.equal(result.finalHpDamage,13);assert.equal(result.ablationAmount,1);
});
test('critical bypasses SP without ablating armor', () => {
  const c=fresh();c.armor.body.spCurrent=18;
  const result=damage.resolveDamage(c,{...options,rawDamage:12,critical:true},()=>3);
  assert.equal(result.finalHpDamage,5);assert.equal(result.ablationAmount,0);
});
test('brawling takes full SP; melee takes half; direct damage never ablates', () => {
  const c=fresh();
  assert.equal(damage.resolveDamage(c,{...options,attackType:'brawling'},()=>3).finalHpDamage,4);
  assert.equal(damage.resolveDamage(c,{...options,attackType:'melee'},()=>3).finalHpDamage,9);
  const result=damage.resolveDamage(c,{...options,attackType:'direct'},()=>3);
  assert.equal(result.finalHpDamage,15);assert.equal(result.ablationAmount,0);
});
test('AP ablates two SP; Fractured Skull changes headshot to x3', () => {
  const c=fresh();assert.equal(damage.resolveDamage(c,{...options,attackType:'ap'},()=>3).ablationAmount,2);
  c.criticalInjuries.find(i=>i.location==='head'&&i.rollNumber===9).isActive=true;
  c.armor.head.spCurrent=0;assert.equal(damage.resolveDamage(c,{...options,location:'head',rawDamage:9},()=>3).finalHpDamage,27);
});
test('duplicate injuries are rerolled and an exhausted table terminates', () => {
  const c=fresh();c.criticalInjuries.find(i=>i.location==='body'&&i.rollNumber===12).isActive=true;
  const values=[6,6,3,3];let n=0;
  assert.equal(rules.rollNewInjury(c.criticalInjuries,'body',()=>values[n++]).rollNumber,6);
  c.criticalInjuries.forEach(i=>i.isActive=true);assert.equal(rules.rollNewInjury(c.criticalInjuries,'body',()=>6),undefined);
});
test('a new damaging hit at zero HP inflicts an injury and death penalty', () => {
  const c=fresh();c.hpCurrent=0;c.armor.body.spCurrent=0;
  const result=damage.resolveDamage(c,options,()=>3);const updated=damage.applyDamage(c,result);
  assert.equal(updated.deathSavePenalties,1);assert.equal(updated.criticalInjuries.filter(i=>i.isActive).length,1);
});
test('damage preview refuses a changed character or changed source state', () => {
  const c=fresh();const result=damage.resolveDamage(c,options,()=>3);
  assert.equal(damage.applyDamage({...c,id:'another'},result),null);
  assert.equal(damage.applyDamage({...c,hpCurrent:1},result),null);
});
test('Solo precision and weapon quality reach the attack base', () => {
  const c=fresh();c.roleAbilities.solo.precisionAttack=3;
  assert.equal(rules.weaponAttackBase(c,{...c.weapons[0],quality:'Excellent'}),11);
});
test('martial art ranks belong to each style; switching grants no free ranks', () => {
  const c=fresh();c.skills.find(s=>s.id==='martial_arts').level=6;
  assert.equal(rules.martialArtsLevel(c),6);
  c.martialArtsStyle='Boxing';assert.equal(rules.martialArtsLevel(c),0);
  c.martialArtsLevels={Boxing:2};assert.equal(rules.martialArtsLevel(c),2);
});
test('all ten official templates have ten stat rows and 86 weighted skill points', () => {
  for(const pkg of Object.values(CPR_ROLE_PACKAGES)) {
    assert.equal(pkg.statTable.length,10);assert.deepEqual(pkg.statTable.map(row=>row.rollRange),['1','2','3','4','5','6','7','8','9','10']);
    assert.equal(CPR_SKILLS.reduce((n,s)=>n+(pkg.streetratSkills[s.id]||0)*s.multiplier,0),86);
    assert.equal(Object.keys(pkg.edgerunnerCareerSkills).length,20);
    assert.ok(Object.values(pkg.edgerunnerCareerSkills).every(n=>n===2));
  }
});
test('generator rejects unfinished skills, mandatory minima and overspending', () => {
  const c=fresh();const career=CPR_ROLE_PACKAGES.Solo.edgerunnerCareerSkills;
  assert.ok(creationErrors('pointbuy',c.stats,c.skills,career,2550).length);
  const skills=CPR_SKILLS.map(s=>({...s,level:CPR_ROLE_PACKAGES.Solo.streetratSkills[s.id]||0}));
  assert.deepEqual(creationErrors('streetrat',CPR_ROLE_PACKAGES.Solo.statTable[0].stats,skills,career,0),[]);
  assert.ok(creationErrors('streetrat',c.stats,skills,career,-1).includes('Budget exceeded'));
});
test('Tech starts with two specialty ranks per Maker rank',()=>{
  const c=fresh();const {makerRank,...specialties}=c.roleAbilities.tech;
  assert.equal(Object.values(specialties).reduce((a,b)=>a+b,0),makerRank*2);
});
test('only rezzed installed boosters apply and NET checks include wounds', () => {
  const c=createEmptyCharacter('NET','Netrunner');c.hpCurrent=0;
  const seeya=c.programs.find(p=>p.name==='SeeYa');seeya.isInstalled=true;seeya.isActive=true;
  assert.equal(rules.netActionBase(c,'Pathfinder'),2);seeya.isActive=false;
  assert.equal(rules.netActionBase(c,'Pathfinder'),0);
});
test('Black ICE uses two slots shared with hardware',()=>{
  const c=createEmptyCharacter('NET','Netrunner');c.programs=PRESET_PROGRAMS.map(p=>({...p,isInstalled:p.category==='Black ICE'}));
  assert.equal(rules.usedDeckSlots(c),c.cyberdeck.hardwareSlotsUsed+2);
});
test('range DV covers SMG autofire through 100m',()=>assert.equal(CPR_RANGE_DV_TABLE.find(row=>row.category==='Autofire (SMG)').dvs[4],30));
test('catalog formulas and every explicit damage profile can be parsed',()=>{
  for(const weapon of DATAPOOL_WEAPONS) {
    if(weapon.damage) assert.doesNotThrow(()=>dice.parseDamageFormula(weapon.damage),weapon.name);
    for(const profile of weapon.damageProfiles||[]) if(profile.damage) assert.doesNotThrow(()=>dice.parseDamageFormula(profile.damage),weapon.name);
    assert.ok(!weapon.notes.includes('\uFFFD'),weapon.name);
  }
});
test('2026 errata reaches structured WAA and both Mastiff entries',()=>{
  assert.equal(DATAPOOL_WEAPONS.find(w=>w.name.includes('WAA')).magCapacity,35);
  for(const w of DATAPOOL_WEAPONS.filter(w=>/Мастиф/.test(w.name))) assert.equal(w.costEb,500);
});
test('import [] preserves the active collection in the actual App handler',()=>{
  const c=fresh();storage.saveCharactersToStorage([c]);const view=mount(App,{});
  nodes(view.render(),n=>n.type===Header)[0].props.onImportCharacter('[]');
  assert.equal(view.state.values[0].length,1);assert.equal(view.state.values[0][0].id,c.id);
});
test('role selector preserves earned skills',()=>{
  const c=fresh();c.skills.find(s=>s.id==='handgun').level=10;let updated;
  const view=mount(StatsSection,{character:c,lang:'en',onUpdateCharacter:c=>updated=c});
  nodes(view.render(),n=>n.type==='select'&&n.props.value==='Solo')[0].props.onChange({target:{value:'Nomad'}});
  assert.equal(updated.skills.find(s=>s.id==='handgun').level,10);
});
test('Luck overspend yields neither a bonus roll nor a deduction',()=>{
  const c=fresh();c.luckCurrent=1;let calls=0;
  const view=mount(DiceRollerModal,{character:c,isOpen:true,lang:'en',onUpdateCharacter:()=>calls++,onAddRollResult:()=>calls++,rollHistory:[],onClose(){},onClearHistory(){}});
  nodes(view.render(),n=>n.type==='input'&&n.props.max===1)[0].props.onChange({target:{value:'100'}});
  button(view.render(),'ROLL 1D10').props.onClick();assert.equal(calls,0);
});
test('death save action increments the persistent counter',()=>{
  const c=fresh();c.hpCurrent=0;storage.saveCharactersToStorage([c]);const view=mount(App,{});
  randomSequence([0.2],()=>nodes(view.render(),n=>n.type===StatsSection)[0].props.onRollDeathSave());
  assert.equal(view.state.values[0][0].deathSavePenalties,1);
});
test('range table chooses a real rifle and passes the Autofire mode',()=>{
  const c=fresh();c.weapons.push({...c.weapons[0],id:'rifle',category:'Assault Rifle',skillId:'shoulder_arms',currentAmmo:25});let captured;
  const view=mount(WeaponsSection,{character:c,lang:'en',onUpdateCharacter(){},onRollWeaponAttack:(...args)=>captured=args,onRollWeaponDamage(){}});
  nodes(view.render(),n=>n.type==='button'&&n.props.onClick?.toString().includes('setShowRangeMatrix'))[0].props.onClick();
  const row=nodes(view.render(),n=>n.type==='tr'&&require('./helpers.cjs').label(n).startsWith('Autofire (Rifle)'))[0];
  nodes(row,n=>n.type==='button')[0].props.onClick();assert.equal(captured[0].id,'rifle');assert.equal(captured[3],true);
});
test('CPR removal increases cap without refunding present Humanity',()=>{
  const c=fresh();let updated;const view=mount(CyberwareSection,{character:c,lang:'en',onUpdateCharacter:c=>updated=c});
  nodes(view.render(),n=>n.type==='button'&&n.props.onClick?.toString().includes('setItemToDelete'))[0].props.onClick();
  nodes(view.render(),n=>n.type==='button'&&n.props.onClick?.toString().includes("confirmDeleteItem('cpr')"))[0].props.onClick();
  assert.equal(updated.humanityCurrent,c.humanityCurrent);assert.ok(calculateHumanityStats(updated).maxRecoverableHumanity>calculateHumanityStats(c).maxRecoverableHumanity);
});

test('direct attack at zero HP inflicts mortal consequences without armor ablation',()=>{
  const c=fresh();c.hpCurrent=0;
  const hit=damage.resolveDamage(c,{...options,attackType:'direct',rawDamage:6},()=>3);
  assert.equal(hit.finalHpDamage,11);assert.equal(hit.mortalHit,true);assert.equal(hit.ablationAmount,0);
  assert.equal(damage.applyDamage(c,hit).deathSavePenalties,1);
  assert.equal(damage.resolveDamage(c,{...options,attackType:'direct',rawDamage:0},()=>3).mortalHit,false);
});
test('explicit penetration exceptions override melee category',()=>{
  assert.equal(rules.weaponPenetration({...fresh().weapons[1],armorPenetration:'none'}),'none');
});
test('invalid optional profiles and ammo maps are rejected at import boundary',()=>{
  for(const invalid of [{damageProfiles:{}},{damageProfiles:[{name:'x',damage:3}]},{profileAmmo:[]},{profileAmmo:{a:-1}},{quality:'Magic'}]) {
    const c=fresh();Object.assign(c.weapons[0],invalid);assert.equal(storage.parseImportedJson(JSON.stringify(c)),null);
  }
});
test('profile magazines consume their own rounds and reload to their own capacity',()=>{
  let w={...fresh().weapons[0],magCapacity:30,currentAmmo:30,ammoType:'Rifle Ammo',selectedProfile:1,damageProfiles:[{name:'rifle',damage:'5d6'},{name:'shotgun',damage:'5d6',category:'Shotgun',magCapacity:3,ammoType:'Shotgun Shells'}]};
  assert.equal(rules.selectedWeaponProfile(w).currentAmmo,0);
  w=rules.updateWeaponAmmo(w,'reload');
  for(const expected of [2,1,0,0]) {w=rules.updateWeaponAmmo(w,-1);assert.equal(rules.selectedWeaponProfile(w).currentAmmo,expected);}
  assert.equal(w.currentAmmo,30);w={...w,selectedProfile:0};w=rules.updateWeaponAmmo(w,-10);assert.equal(w.currentAmmo,20);
  w={...w,selectedProfile:1};assert.equal(rules.selectedWeaponProfile(w).currentAmmo,0);
});
test('alternate damage modes of one magazine share ammo',()=>{
  const w={...fresh().weapons[0],damageProfiles:[{name:'normal',damage:'3d6'},{name:'alt',damage:'2d6'}],selectedProfile:1};
  const fired=rules.updateWeaponAmmo(w,-1);assert.equal(fired.currentAmmo,7);assert.equal(rules.selectedWeaponProfile({...fired,selectedProfile:0}).currentAmmo,7);
});
test('actual weapon card fire handler consumes the displayed profile magazine',()=>{
  const c=fresh();c.weapons=[rules.updateWeaponAmmo({...c.weapons[0],selectedProfile:0,damageProfiles:[{name:'small',damage:'3d6',magCapacity:3}]},'reload')];let updated;
  const view=mount(WeaponsSection,{character:c,lang:'en',onUpdateCharacter:next=>updated=next,onRollWeaponAttack(){},onRollWeaponDamage(){}});
  button(view.render(),'Fire (1)').props.onClick();assert.equal(rules.selectedWeaponProfile(updated.weapons[0]).currentAmmo,2);
});
test('every Streetrat role can finish the real wizard with its complete package',()=>{
  for(const role of Object.keys(CPR_ROLE_PACKAGES)) {
    let created;const view=mount(CharacterWizardModal,{isOpen:true,lang:'en',onClose(){},onCharacterCreated:c=>created=c});
    button(view.render(),`${role} `).props.onClick();button(view.render(),'6.').props.onClick();
    const complete=button(view.render(),'CREATE CHARACTER');assert.ok(!complete.props.disabled,role);complete.props.onClick();
    assert.equal(created.role,role);assert.ok(isCharacter(created),role);assert.equal(created.skills.find(s=>s.id==='language_cultural').level,4);
    assert.equal(created.cashEb,500);
    if(role==='Netrunner') {assert.equal(created.programs.length,5);assert.equal(rules.usedDeckSlots(created),5);}
    if(role==='Lawman') assert.equal(created.armor.shield.spCurrent,10);
    for(const gear of created.gear.filter(item=>item.category==='Ammo')) {
      const loaded=created.weapons.filter(w=>w.ammoType===gear.name||w.ammoType+' Ammo'===gear.name).reduce((sum,w)=>sum+w.currentAmmo,0);
      const original=CPR_ROLE_PACKAGES[role].equipment.gear.find(item=>item.name===gear.name);
      assert.equal(gear.quantity+loaded,original.quantity);
    }
  }
});
test('NET cannot install Black ICE beyond the common deck capacity',()=>{
  const c=fresh();c.cyberdeck.slotsMax=1;c.programs=[{...PRESET_PROGRAMS.find(p=>p.name==='Hellhound'),isInstalled:false}];let updates=0;
  const view=mount(NetrunnerSection,{character:c,lang:'en',onUpdateCharacter(){updates++},onRollInterfaceAction(){},onRollProgramAttack(){}});
  button(view.render(),'Install to Deck').props.onClick();assert.equal(updates,0);assert.ok(nodes(view.render(),n=>n.props.role==='alert').length);
  assert.equal(button(view.render(),'Rez').props.disabled,true);
});
test('Hellhound defaults include all five Black ICE stats',()=>{
  const ice=PRESET_PROGRAMS.find(p=>p.name==='Hellhound');assert.deepEqual([ice.perception,ice.speed,ice.atkBonus,ice.defBonus,ice.rezMax],[6,6,6,2,20]);
});

test('point-buy wizard preserves a paid shield, clothing and empty armor slots',()=>{
  let created;const view=mount(CharacterWizardModal,{isOpen:true,lang:'en',onClose(){},onCharacterCreated:c=>created=c});
  nodes(view.render(),n=>n.type==='div'&&n.props.onClick?.toString().includes("handleSelectMethod('pointbuy')"))[0].props.onClick();
  button(view.render(),'3.').props.onClick();
  const {label}=require('./helpers.cjs');
  for(const skill of CPR_SKILLS) {
    const target=CPR_ROLE_PACKAGES.Solo.streetratSkills[skill.id]||0;
    let row=nodes(view.render(),n=>n.type==='div'&&n.props.className==='bg-zinc-950 border border-zinc-800 rounded p-2 flex items-center justify-between text-xs'&&label(n).includes(skill.nameEn))[0];
    const level=Number(nodes(row,n=>n.type==='span'&&n.props.className?.includes('min-w-[20px]'))[0].props.children);
    for(let i=level;i<target;i++) {button(row,'+').props.onClick();row=nodes(view.render(),n=>n.type==='div'&&n.props.className==='bg-zinc-950 border border-zinc-800 rounded p-2 flex items-center justify-between text-xs'&&label(n).includes(skill.nameEn))[0];}
  }
  button(view.render(),'4.').props.onClick();
  nodes(view.render(),n=>n.type==='div'&&n.props.onClick&&label(n).startsWith('Bulletproof Shield'))[0].props.onClick();
  nodes(view.render(),n=>n.type==='input'&&n.props['aria-label']==='Clothing set')[0].props.onChange({target:{value:'Nomad Leathers'}});
  nodes(view.render(),n=>n.type==='input'&&n.props['aria-label']==='Clothing cost')[0].props.onChange({target:{value:'220'}});
  button(view.render(),'6.').props.onClick();const complete=button(view.render(),'CREATE CHARACTER');assert.equal(complete.props.disabled,false,complete.props.title);complete.props.onClick();
  assert.ok(isCharacter(created));assert.equal(created.armor.shield.spCurrent,10);assert.equal(created.armor.head.spCurrent,0);assert.equal(created.armor.body.spCurrent,0);
  assert.equal(created.cashEb,2450);assert.equal(created.gear.length,1);assert.equal(created.gear[0].costEb,220);assert.equal(created.weapons.length,0);
});
test('buying a catalog weapon preserves profiles, quality and explicit exceptions',()=>{
  const c=fresh();c.cashEb=100000;let updated;
  const weapon=DATAPOOL_WEAPONS.find(w=>w.damageProfiles?.length>1);
  const view=mount(DataPoolShopModal,{isOpen:true,character:c,lang:'en',onClose(){},onUpdateCharacter:next=>updated=next});
  nodes(view.render(),n=>n.type==='input'&&n.props.placeholder==='Search items...')[0].props.onChange({target:{value:weapon.name}});
  button(view.render(),'Buy').props.onClick();
  const bought=updated.weapons.at(-1);assert.deepEqual(bought.damageProfiles,weapon.damageProfiles);assert.equal(bought.quality,weapon.quality);assert.equal(bought.armorPenetration,weapon.armorPenetration);
});
test('Attacker activation and attack use a single NET action',()=>{
  const c=createEmptyCharacter('NET','Netrunner');c.programs=[{...PRESET_PROGRAMS.find(p=>p.name==='Sword'),isInstalled:true,isActive:false}];storage.saveCharactersToStorage([c]);
  const view=mount(App,{});
  nodes(view.render(),n=>n.type===SectionNav)[0].props.onChangeTab('netrunner');
  nodes(view.render(),n=>n.type===NetrunnerSection)[0].props.onRollProgramAttack(c.programs[0]);
  const history=nodes(view.render(),n=>n.type===DiceRollerModal)[0].props.rollHistory;
  assert.equal(history.length,1);assert.ok(history[0].title.includes('Sword'));assert.equal(history[0].baseVal,5);
  assert.equal(view.state.values[0][0].programs[0].isActive,false);
});
