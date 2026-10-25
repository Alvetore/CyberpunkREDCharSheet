const {test,beforeEach}=require('node:test');
const assert=require('node:assert/strict');
const {load,mount,nodes,button,label,randomSequence:withRandom}=require('./helpers.cjs');
const {createEmptyCharacter}=load('src/data/initialData.ts');
const {ROLE_NAMES_RU}=load('src/locales/roles.ts');
const {StatsSection}=load('src/components/StatsSection.tsx');
const {SkillsSection}=load('src/components/SkillsSection.tsx');
const {NetrunnerSection}=load('src/components/NetrunnerSection.tsx');
const {RoleActions}=load('src/components/RoleActions.tsx');
const {RoleSection}=load('src/components/RoleSection.tsx');
const {App}=load('src/App.tsx');
const {WeaponsSection}=load('src/components/WeaponsSection.tsx');
const {DiceRollerModal}=load('src/components/DiceRollerModal.tsx');
const {GearSection}=load('src/components/GearSection.tsx');
const {GEAR_CATALOG}=load('src/data/gearCatalog.ts');
const {CYBERWARE_CATALOG}=load('src/data/cyberwareCatalog.ts');
const chrome=load('src/utils/cyberware.ts'), gear=load('src/utils/gear.ts'), wearable=load('src/utils/gearCyberware.ts');
const rules=load('src/utils/rules.ts'), roles=load('src/utils/roleAbilities.ts'), dice=load('src/utils/dice.ts');
const storage=load('src/utils/storage.ts'), {isCharacter}=load('src/utils/characterValidation.ts');
const noop=()=>{};
beforeEach(()=>{const data=new Map();global.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};});
const fresh=()=>({...createEmptyCharacter('Test'),gear:[],cyberware:[],weapons:[],humanityCurrent:70,stats:{...createEmptyCharacter().stats,EMP:7}});
const implant=(c,number,id='implant-'+number)=>{const item={...structuredClone(CYBERWARE_CATALOG.find(x=>x.id==='cat-cyber-'+number)),id,isInstalled:false};return {...c,cyberware:[...c.cyberware,item]};};
const install=(c,id,targets)=>{const result=chrome.installCyberware(c,id,targets,'en');assert.ok(result.character,result.error);return result.character;};
const own=(c,number)=>{const result=gear.addGearToInventory(c,GEAR_CATALOG.find(x=>x.id==='cat-gear-'+number),1,false);assert.ok(result.character);return result.character;};

test('skill STAT column and roll base both use current EMP and other stat modifiers',()=>{
  const c=fresh();c.humanityCurrent=20;c.statMods.INT=3;
  let rolled;const view=mount(SkillsSection,{character:c,lang:'en',dualTerms:true,onUpdateCharacter:noop,onRollSkill:(skill,base)=>rolled={skill,base}});
  const tree=view.render();assert.ok(nodes(tree,n=>n.props.title?.includes('Original: 7; current: 2')).length>=2);
  assert.ok(nodes(tree,n=>n.props.title?.includes('Original: 6; current: 9')).length>0);
  nodes(tree,n=>n.type==='button'&&n.props.title?.startsWith('Roll Human Perception:'))[0].props.onClick();
  assert.equal(rolled.base,2+c.skills.find(s=>s.id==='human_perception').level);
});

test('new roles receive no free NET gear except the Netrunner sample; legacy gear is preserved',()=>{
  for(const role of Object.keys(ROLE_NAMES_RU)) {
    const c=createEmptyCharacter(role,role);assert.ok(isCharacter(c));
    assert.equal(c.cyberdeck.isOwned,role==='Netrunner');assert.equal(c.programs.length>0,role==='Netrunner');
    assert.equal(rules.interfaceRank(c),role==='Netrunner'?4:0);if(role!=='Netrunner') assert.equal(rules.deckCapacity(c),0);
  }
  const legacy=createEmptyCharacter('Legacy','Netrunner');legacy.role='Solo';delete legacy.cyberdeck.isOwned;
  assert.ok(isCharacter(legacy));assert.ok(storage.saveCharactersToStorage([legacy]));assert.deepEqual(storage.loadStoredCharacters()[0].programs,legacy.programs);
  assert.equal(rules.interfaceRank(legacy),0);legacy.role='Netrunner';legacy.roleRank=7;assert.equal(rules.netActionBase(legacy,'Scanner'),7);
});

test('NET ownership toggle preserves programs as inventory and roleless NET actions are disabled',()=>{
  let updated;const c=createEmptyCharacter('NET','Netrunner');const view=mount(NetrunnerSection,{character:c,lang:'en',onUpdateCharacter:c=>updated=c,onRollInterfaceAction:noop,onRollProgramAttack:noop});
  nodes(view.render(),n=>n.props['aria-label']==='Own a cyberdeck')[0].props.onChange({target:{checked:false}});
  assert.equal(updated.cyberdeck.isOwned,false);assert.equal(updated.programs.length,c.programs.length);assert.ok(updated.programs.every(p=>!p.isInstalled&&!p.isActive));
  view.props.character=updated;assert.ok(nodes(view.render(),n=>n.type==='fieldset'&&n.props.disabled).length>=2);
  view.props.character={...c,role:'Solo'};assert.match(label(view.render()),/No Interface ability/);
});

test('all ten role identifiers have book translations and selectors retain stable values',()=>{
  assert.equal(ROLE_NAMES_RU.Exec,'Менеджер');assert.equal(ROLE_NAMES_RU.Tech,'Техник');
  const tree=mount(StatsSection,{character:fresh(),lang:'ru',onUpdateCharacter:noop}).render();
  for(const [role,name] of Object.entries(ROLE_NAMES_RU)) assert.equal(label(nodes(tree,n=>n.type==='option'&&n.props.value===role)[0]),name);
});

test('Fixer Trading bonus and role checks use correct dice and rank, not generic STAT additions',()=>{
  const c={...fresh(),role:'Fixer',roleRank:4};assert.equal(rules.skillBase(c,'trading'),rules.effectiveStat(c,'COOL')+4+c.skills.find(s=>s.id==='trading').level);
  c.role='Lawman';let result=withRandom([0.3,0.999],()=>roles.rollLawmanBackup(c,'en'));assert.equal(result.total,4);assert.equal(result.isSuccess,true);assert.match(result.summary,/6 rounds.*next higher/);
  result=withRandom([0.4],()=>roles.rollLawmanBackup(c,'en'));assert.equal(result.isSuccess,false);
  c.role='Media';assert.equal(roles.mediaBelievability(4),3);assert.equal(roles.charismaticImpactBase({...c,hpCurrent:0}),0);result=withRandom([0.5],()=>roles.rollMediaStory(c,true,4,'en'));assert.equal(result.total,6);assert.equal(result.isSuccess,true);
  result=withRandom([0.9,0.9],()=>roles.rollMediaStory(c,false,0,'en'));assert.equal(result.total,10);assert.equal(result.explodedD10s,undefined);
  result=withRandom([0.4],()=>roles.rollExecLoyalty('Employee',3,'en'));assert.equal(result.total,3);assert.equal(result.isSuccess,false);
});

test('new role panels, Maker checks, Medicine and persistent Exec employees use actual handlers',()=>{
  for(const role of ['Rockerboy','Media','Lawman','Exec','Fixer','Tech','Medtech']) assert.ok(label(mount(RoleActions,{character:{...fresh(),role},lang:'ru',onUpdateCharacter:noop}).render()).length>30);
  let updated,rolled;const c={...fresh(),role:'Exec',roleRank:4};const view=mount(RoleActions,{character:c,lang:'en',onUpdateCharacter:c=>updated=c,onRollResult:r=>rolled=r});
  withRandom([0],()=>button(view.render(),'Add employee').props.onClick());assert.equal(updated.roleAbilities.exec.members.length,1);assert.equal(updated.roleAbilities.exec.members[0].loyalty,2);
  view.props.character=updated;assert.equal(button(view.render(),'Add employee').props.disabled,true);
  assert.ok(storage.saveCharactersToStorage([updated]));assert.deepEqual(storage.loadStoredCharacters()[0].roleAbilities.exec,updated.roleAbilities.exec);
  view.props.character={...c,role:'Rockerboy'};withRandom([0.4],()=>button(view.render(),'One fan').props.onClick());assert.equal(rolled.baseVal,4);assert.equal(rolled.targetDv,8);
  const med={...fresh(),role:'Medtech'};assert.deepEqual(roles.medtechSkills(med),{surgery:4,medicalTech:2});
  med.statMods.TECH=2;assert.equal(roles.roleTechnicalBase(med,4),11);
  const tech={...fresh(),role:'Tech'};const tv=mount(RoleActions,{character:tech,lang:'en',onUpdateCharacter:noop,onRollResult:r=>rolled=r});
  withRandom([0.4],()=>button(tv.render(),'upgrade').props.onClick());assert.equal(rolled.baseVal,tech.stats.TECH+2+tech.skills.find(s=>s.id==='basic_tech').level);
});

test('Smart Glasses enforce two slots, pair optics, preserve Humanity and need wearing for effects',()=>{
  let c=own(fresh(),95);const device=c.gear[0],target=`${device.id}:gear:eye`;
  const optic=CYBERWARE_CATALOG.find(x=>x.installRule.allowedHosts.includes('eye')&&x.installRule.paired&&x.installRule.slots===1);
  c={...c,cyberware:[{...optic,id:'optic',isInstalled:false}]};c=install(c,'optic',[target]);
  assert.equal(c.humanityCurrent,70);assert.equal(chrome.cyberwareHumanityCap(c),70);assert.equal(chrome.pairedCyberwareReady(c,c.cyberware[0]),true);assert.equal(chrome.functionalCyberware(c).length,0);
  c=wearable.wearCyberwareGear(c,device.id,'eyes');assert.equal(chrome.functionalCyberware(c).length,1);
  c=implant(c,34,'second');c=install(c,'second',[target]);assert.equal(chrome.cyberwareHosts(c).find(h=>h.id===target).used,2);
  c=implant(c,34,'third');assert.ok(chrome.installCyberware(c,'third',[target]).error);
  assert.ok(isCharacter(c));assert.ok(storage.saveCharactersToStorage([c]));assert.equal(chrome.functionalCyberware(storage.loadStoredCharacters()[0]).length,2);
  c=wearable.wearCyberwareGear(c,device.id,undefined);assert.equal(chrome.functionalCyberware(c).length,0);assert.equal(chrome.cyberwareHosts(c).find(h=>h.id===target).used,2);
  c=implant(c,31,'body-eye');c=install(c,'body-eye',['body:left-eye']);c={...c,cyberware:[...c.cyberware,{...optic,id:'body-optic',isInstalled:false}]};c=install(c,'body-optic',['body-eye:eye']);assert.equal(chrome.pairedCyberwareReady(c,c.cyberware.find(x=>x.id==='body-optic')),false);
});

test('moving an option from external gear to a body foundation charges HL once; moving back refunds none',()=>{
  let c=own(fresh(),95);const target=`${c.gear[0].id}:gear:eye`;
  c=implant(c,34,'option');c=install(c,'option',[target]);assert.equal(c.humanityCurrent,70);
  c=implant(c,31,'eye');c=install(c,'eye',['body:left-eye']);const prior=c.humanityCurrent,cost=c.cyberware.find(x=>x.id==='option').humanityCost;
  c=install(c,'option',['eye:eye']);assert.equal(c.humanityCurrent,prior-cost);const after=c.humanityCurrent;
  c=install(c,'option',[target]);assert.equal(c.humanityCurrent,after);assert.equal(chrome.cyberwareCapLoss(c.cyberware.find(x=>x.id==='option'),c),0);
});

test('meat arms accept supported options without a Cyberarm, enforce sole-option capacity and gloves cover them',()=>{
  let c=implant(fresh(),103,'knuckles');c=install(c,'knuckles',['body:left-arm']);assert.ok(c.humanityCurrent<70);
  c=implant(c,113,'claws');assert.ok(chrome.installCyberware(c,'claws',['body:left-arm']).error);
  c=implant(c,96,'arm');assert.ok(chrome.installCyberware(c,'arm',['body:left-arm']).error);
  c=own(c,9);const glove=c.gear[0];c=wearable.wearCyberwareGear(c,glove.id,'left-arm');assert.ok(!chrome.functionalCyberware(c).some(x=>x.id==='knuckles'));
  c=implant(c,108,'launcher');const prior=c.humanityCurrent;c=install(c,'launcher',[`${glove.id}:gear:arm`]);assert.equal(c.humanityCurrent,prior);assert.ok(c.weapons.some(w=>w.sourceCyberwareId==='launcher'));
  c=chrome.syncCyberwareWeapons(wearable.wearCyberwareGear(c,glove.id,undefined));assert.ok(chrome.functionalCyberware(c).some(x=>x.id==='knuckles'));assert.ok(!c.weapons.some(w=>w.sourceCyberwareId==='launcher'));
});

test('separate wearable copies, wearing exclusivity and invalid import guards preserve ownership',()=>{
  let c=gear.addGearToInventory(fresh(),GEAR_CATALOG.find(x=>x.id==='cat-gear-95'),2,false).character;assert.equal(c.gear.length,2);assert.ok(c.gear.every(x=>x.quantity===1));
  c=wearable.wearCyberwareGear(c,c.gear[0].id,'eyes');c=wearable.wearCyberwareGear(c,c.gear[1].id,'eyes');assert.equal(c.gear.filter(x=>x.wornOn).length,1);
  assert.ok(isCharacter(c));const invalid=structuredClone(c);invalid.gear[1].wornOn='left-arm';assert.equal(isCharacter(invalid),false);
  const view=mount(GearSection,{character:c,lang:'en',onUpdateCharacter:next=>c=next});
  const plus=nodes(view.render(),n=>n.type==='button'&&label(n)==='+');plus[1].props.onClick();assert.ok(isCharacter(c));assert.equal(c.gear.length,3);
  assert.equal(isCharacter({...c,roleAbilities:{...c.roleAbilities,exec:{members:[{id:'x',name:'x',specialty:'x',loyalty:'bad'}]}}}),false);
});

test('Solo Fumble Recovery preserves a natural one without an extra die and uses four points',()=>{
  const result=withRandom([0,0.9],()=>dice.executeCyberpunkCheck({title:'Attack',baseVal:8,ignoreCriticalFailure:true}));assert.equal(result.total,9);assert.equal(result.isCritFail,false);
  let updated;const c=fresh();c.roleRank=4;c.roleAbilities.solo={threatDetection:0,initiativeReaction:0,precisionAttack:0,spotWeakness:0,damageAbsorb:0};
  const view=mount(RoleSection,{character:c,lang:'en',onUpdateCharacter:c=>updated=c});nodes(view.render(),n=>n.type==='input'&&n.props.type==='checkbox')[0].props.onChange({target:{checked:true}});assert.equal(updated.roleAbilities.solo.fumbleRecovery,4);assert.ok(isCharacter(updated));
  updated.weapons=createEmptyCharacter().weapons;storage.saveCharactersToStorage([updated]);const app=mount(App,{});
  const weaponProps=nodes(app.render(),n=>n.type===WeaponsSection)[0].props;
  withRandom([0,0.9],()=>weaponProps.onRollWeaponAttack(updated.weapons[0]));
  const roll=nodes(app.render(),n=>n.type===DiceRollerModal)[0].props.rollHistory[0];assert.equal(roll.d10Result,1);assert.equal(roll.critFailD10,undefined);assert.equal(roll.total,roll.baseVal+1);
});

test('smart glove fingers need body Interface Plugs and fingerless gloves preserve finger weapons',()=>{
  let c=own(fresh(),83);const glove=c.gear[0];c=wearable.wearCyberwareGear(c,glove.id,'left-arm');
  const finger={name:'Custom modular finger',category:'Cyberlimb',installLocation:'Finger',humanityCost:2,description:'A user-defined modular finger',installRule:{allowedHosts:['finger'],slots:1}};
  assert.ok(finger);c={...c,cyberware:[{...finger,id:'finger',isInstalled:false}]};c=install(c,'finger',[`${glove.id}:gear:finger`]);assert.equal(chrome.functionalCyberware(c).length,0);assert.equal(c.humanityCurrent,70);
  c=implant(c,12,'link');c=install(c,'link',['body:neural']);c=implant(c,16,'plugs');c=install(c,'plugs',['link:neural']);assert.ok(chrome.functionalCyberware(c).some(x=>x.id==='finger'));
  let d=implant(fresh(),96,'arm');d=install(d,'arm',['body:left-arm']);d=implant(d,113,'claws');d=install(d,'claws',['arm:arm']);d=own(d,84);d=wearable.wearCyberwareGear(d,d.gear[0].id,'left-arm');assert.ok(chrome.functionalCyberware(d).some(x=>x.id==='claws'));
});
