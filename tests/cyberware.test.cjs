const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { load, mount, nodes, button } = require('./helpers.cjs');
const { createEmptyCharacter } = load('src/data/initialData.ts');
const { DATAPOOL_CYBERWARE } = load('src/data/datapoolCatalog.ts');
const cyber = load('src/utils/cyberware.ts');
const rules = load('src/utils/rules.ts');
const storage = load('src/utils/storage.ts');
const { isCharacter } = load('src/utils/characterValidation.ts');
const { calculateHumanityStats } = load('src/utils/roleUtils.ts');
const { DataPoolShopModal } = load('src/components/DataPoolShopModal.tsx');
const { CyberwareInstallModal } = load('src/components/CyberwareInstallModal.tsx');
const { CyberwareCatalogBrowser } = load('src/components/CyberwareCatalogBrowser.tsx');
const { CatalogBrowser } = load('src/components/CatalogBrowser.tsx');
const { CyberwareSection } = load('src/components/CyberwareSection.tsx');
let serial=0;
const fresh=()=>({...createEmptyCharacter('Chrome'),cyberware:[],weapons:[],humanityCurrent:80,stats:{...createEmptyCharacter('Stats').stats,EMP:8}});
const owned=(id,extra={})=>({...structuredClone(DATAPOOL_CYBERWARE.find(item=>item.id===`cat-cyber-${id}`)),id:`owned-${++serial}`,isInstalled:false,...extra});
const add=(c,id,extra={})=>{const item=owned(id,extra);return[{...c,cyberware:[...c.cyberware,item]},item];};
const put=(c,item,targets,weaponId)=>{
  const result=cyber.installCyberware(c,item.id,targets??cyber.findCyberwarePlacement(c,item),'en',weaponId);
  assert.ok(result.character,result.error);return result.character;
};
beforeEach(()=>{
  const memory=new Map();global.localStorage={getItem:key=>memory.get(key)??null,setItem:(key,value)=>memory.set(key,value)};global.alert=()=>{};
});

test('sectioned cyberware catalog keeps all 173 choices reachable and combines section and search filters',()=>{
  const view=mount(CatalogBrowser,CyberwareCatalogBrowser({lang:'en',onSelect(){}}).props);
  const cards=tree=>nodes(tree,n=>n.type==='button'&&n.props['aria-label']?.startsWith('Select:'));
  assert.equal(cards(view.render()).length,173);
  button(view.render(),'Cyberlegs & options').props.onClick();
  const legs=cards(view.render());assert.ok(legs.length>0&&legs.length<173);
  assert.ok(legs.every(card=>!card.props['aria-label'].includes('гранатомёт')));
  nodes(view.render(),n=>n.type==='input')[0].props.onChange({target:{value:'  выкидной гранатомёт  '}});
  assert.equal(cards(view.render()).length,0);
  button(view.render(),'All sections').props.onClick();
  assert.equal(cards(view.render()).length,1);
  assert.equal(cards(view.render())[0].props['aria-label'],'Select: Выкидной гранатомёт');
});

test('choosing a catalog card preserves weapon and slot metadata through the actual add handler',()=>{
  let updated;const c=fresh();
  const parent=mount(CyberwareSection,{character:c,lang:'en',onUpdateCharacter:next=>updated=next});
  button(parent.render(),'Install Cyberware').props.onClick();
  const browser=nodes(parent.render(),n=>n.type===CyberwareCatalogBrowser)[0];assert.ok(browser);
  const view=mount(CatalogBrowser,CyberwareCatalogBrowser(browser.props).props);
  button(view.render(),'Cyberarms & options').props.onClick();
  nodes(view.render(),n=>n.type==='button'&&n.props['aria-label']==='Select: Выкидной гранатомёт')[0].props.onClick();
  button(parent.render(),'Add and choose slots').props.onClick();
  const item=updated.cyberware.at(-1);assert.equal(item.catalogId,'cat-cyber-108');assert.equal(item.installRule.slots,2);assert.equal(item.weapon.damage,'6d6');assert.equal(item.isInstalled,false);assert.equal(updated.humanityCurrent,c.humanityCurrent);
});

test('all 173 catalog records keep valid metadata, descriptions and source identities',()=>{
  assert.equal(DATAPOOL_CYBERWARE.length,173);assert.equal(new Set(DATAPOOL_CYBERWARE.map(item=>item.id)).size,173);
  const c=fresh();c.cyberware=DATAPOOL_CYBERWARE.map(item=>({...item,isInstalled:false}));
  assert.ok(isCharacter(c));
  for(const item of c.cyberware) {assert.equal(item.catalogId,item.id);assert.ok(item.installRule);assert.ok(item.sourceUrl.startsWith('https://alec-leon.github.io/'));assert.ok(item.description.length>40);}
  const upgrades=c.cyberware.filter(item=>item.kind==='upgrade');assert.equal(upgrades.length,9);assert.ok(upgrades.every(item=>item.humanityCostKnown===false&&item.description.length>100));
});
test('purchasing cyberware preserves the definition without charging installation Humanity',()=>{
  let c=fresh();c.cashEb=10000;let updated;
  const view=mount(DataPoolShopModal,{isOpen:true,character:c,lang:'en',initialCategory:'cyberware',onClose(){},onUpdateCharacter:next=>updated=next});
  nodes(view.render(),n=>n.type==='input'&&n.props.placeholder==='Search items...')[0].props.onChange({target:{value:'Большие костяшки'}});
  button(view.render(),'Buy to inventory').props.onClick();
  const item=updated.cyberware.at(-1);assert.equal(item.isInstalled,false);assert.ok(item.weapon);assert.ok(item.installRule);assert.equal(updated.humanityCurrent,80);assert.equal(updated.cashEb,9900);assert.equal(updated.weapons.length,0);
});
test('Neural Link has a single 5-slot pool; a sixth option is rejected atomically',()=>{
  let c=fresh(),base;[c,base]=add(c,12);c=put(c,base,['body:neural']);
  for(let n=0;n<5;n++) {let option;[c,option]=add(c,13);c=put(c,option,[`${base.id}:neural`]);}
  let overflow;[c,overflow]=add(c,13);const snapshot=JSON.stringify(c);
  const result=cyber.installCyberware(c,overflow.id,[`${base.id}:neural`],'en');assert.ok(result.error);assert.equal(JSON.stringify(c),snapshot);
  assert.equal(cyber.cyberwareHosts(c).find(host=>host.id===`${base.id}:neural`).used,5);
});
test('an option cannot occupy an incompatible host or an uninstalled foundation',()=>{
  let c=fresh(),eye,optic;[c,eye]=add(c,31);[c,optic]=add(c,33);
  assert.ok(cyber.installCyberware(c,optic.id,[`${eye.id}:eye`]).error);
  assert.ok(cyber.installCyberware(c,optic.id,['body:internal']).error);
  c=put(c,eye,['body:left-eye']);c=put(c,optic,[`${eye.id}:eye`]);assert.ok(cyber.isCyberwareInstalled(c,c.cyberware.at(-1)));
});
test('paired optics charge two copies and require two different eyes to function',()=>{
  let c=fresh(),left,right,one,two;[c,left]=add(c,31);c=put(c,left,['body:left-eye']);[c,right]=add(c,31);c=put(c,right,['body:right-eye']);
  [c,one]=add(c,37);c=put(c,one,[`${left.id}:eye`]);assert.equal(cyber.pairedCyberwareReady(c,c.cyberware.at(-1)),false);
  const humanity=c.humanityCurrent;[c,two]=add(c,37);c=put(c,two,[`${right.id}:eye`]);assert.equal(cyber.pairedCyberwareReady(c,c.cyberware.at(-1)),true);assert.equal(c.humanityCurrent,humanity-two.humanityCost);
  assert.equal(cyber.cyberwareHosts(c).find(host=>host.id===`${left.id}:eye`).used,2);
});
test('bundled legs consume both anatomical sites but have separate option pools',()=>{
  let c=fresh(),legs,option;[c,legs]=add(c,137);c=put(c,legs,['body:left-leg','body:right-leg']);
  const pools=cyber.cyberwareHosts(c).filter(host=>host.ownerId===legs.id);assert.equal(pools.length,2);assert.deepEqual(pools.map(pool=>pool.capacity),[3,3]);
  assert.equal(c.humanityCurrent,80-legs.humanityCost);
  [c,option]=add(c,141);c=put(c,option,[`${legs.id}:left`]);assert.equal(cyber.cyberwareHosts(c).find(host=>host.id===`${legs.id}:right`).used,0);
  let extra;[c,extra]=add(c,136);assert.equal(cyber.findCyberwarePlacement(c,extra),null);
});
test('Smartlink reserves both arm and Neural Link slots and cannot omit either',()=>{
  let c=fresh(),arm,link,smart;[c,arm]=add(c,96);c=put(c,arm,['body:left-arm']);[c,link]=add(c,12);c=put(c,link,['body:neural']);[c,smart]=add(c,117);
  assert.ok(cyber.installCyberware(c,smart.id,[`${arm.id}:arm`]).error);
  c=put(c,smart,[`${arm.id}:arm`,`${link.id}:neural`]);
  for(const hostId of [`${arm.id}:arm`,`${link.id}:neural`]) assert.equal(cyber.cyberwareHosts(c).find(host=>host.id===hostId).used,1);
});
test('meat-arm-only option occupies the arm site and excludes a replacement arm',()=>{
  let c=fresh(),knucks,arm;[c,knucks]=add(c,103);c=put(c,knucks,['body:left-arm']);[c,arm]=add(c,96);assert.ok(cyber.installCyberware(c,arm.id,['body:left-arm']).error);
  assert.equal(c.weapons.length,1);assert.equal(c.weapons[0].damage,'2d6');assert.equal(c.weapons[0].sourceCyberwareId,knucks.id);
});
test('uninstalling a foundation preserves owned options and current Humanity but removes weapons',()=>{
  let c=fresh(),arm,weapon;[c,arm]=add(c,96);c=put(c,arm,['body:left-arm']);[c,weapon]=add(c,108);c=put(c,weapon,[`${arm.id}:arm`]);
  const humanity=c.humanityCurrent;assert.equal(c.weapons.length,1);c=cyber.uninstallCyberware(c,arm.id);
  assert.equal(c.cyberware.length,2);assert.ok(c.cyberware.every(item=>item.isInstalled===false));assert.equal(c.weapons.length,0);assert.equal(c.humanityCurrent,humanity);
  assert.equal(cyber.cyberwareHosts(c).find(host=>host.id==='body:left-arm').used,0);assert.equal(calculateHumanityStats(c).maxRecoverableHumanity,80);
});
test('embedded owned weapon and all live magazine state return intact on uninstall',()=>{
  let c=fresh(),arm,popup;[c,arm]=add(c,96);c=put(c,arm,['body:left-arm']);[c,popup]=add(c,111);
  c.weapons=[{id:'my-pistol',name:'Custom pistol',category:'Heavy Pistol',damage:'3d6',standardRof:2,magCapacity:8,currentAmmo:3,ammoType:'Pistol',concealable:true,notes:'',damageProfiles:[{name:'one',damage:'3d6'},{name:'two',damage:'2d6',magCapacity:3,ammoType:'Darts'}],selectedProfile:0,profileAmmo:{}}];
  c=put(c,popup,[`${arm.id}:arm`],'my-pistol');assert.equal(c.weapons.length,1);assert.equal(c.weapons[0].currentAmmo,3);
  c.weapons[0]={...c.weapons[0],selectedProfile:1};c.weapons[0]=rules.updateWeaponAmmo(c.weapons[0],'reload');c.weapons[0]=rules.updateWeaponAmmo(c.weapons[0],-1);
  const saved=structuredClone(c.weapons[0]);c=cyber.uninstallCyberware(c,popup.id);
  assert.equal(c.weapons.length,1);assert.equal(c.weapons[0].id,'my-pistol');assert.equal(c.weapons[0].currentAmmo,3);assert.equal(c.weapons[0].selectedProfile,1);assert.deepEqual(c.weapons[0].profileAmmo,saved.profileAmmo);
  c=put(c,c.cyberware.find(item=>item.id===popup.id),[`${arm.id}:arm`],'my-pistol');assert.equal(c.weapons.length,1);assert.equal(rules.selectedWeaponProfile(c.weapons[0]).currentAmmo,2);
});
test('embedding a backpack pistol activates only its linked weapon and restores backpack state on uninstall',()=>{
  const { setWeaponEquipped }=load('src/utils/backpack.ts');
  const { WeaponsSection }=load('src/components/WeaponsSection.tsx');
  let c=fresh(),arm,popup;[c,arm]=add(c,96);c=put(c,arm,['body:left-arm']);[c,popup]=add(c,111);
  const pistol={...createEmptyCharacter('Pistol').weapons[0],id:'backpack-pistol',currentAmmo:3,isEquipped:false};
  c.weapons=[pistol];c=put(c,popup,[`${arm.id}:arm`],pistol.id);
  assert.equal(c.weapons.length,1);const linked=c.weapons[0];
  assert.equal(linked.sourceCyberwareId,popup.id);assert.equal(linked.isEquipped,true);assert.equal(linked.currentAmmo,3);
  assert.equal(c.cyberware.find(item=>item.id===popup.id).weapon.isEquipped,false);
  assert.deepEqual(setWeaponEquipped(c,linked.id,false).weapons[0],linked);
  let attacked;const view=mount(WeaponsSection,{character:c,lang:'en',onUpdateCharacter:next=>c=next,onRollWeaponAttack:weapon=>attacked=weapon,onRollWeaponDamage(){}});
  assert.equal(nodes(view.render(),n=>n.type==='button'&&n.props.title==='Store in backpack').length,0);
  button(view.render(),'Attack').props.onClick();assert.equal(attacked.id,linked.id);
  button(view.render(),'Fire (1)').props.onClick();assert.equal(c.weapons[0].currentAmmo,2);
  c=cyber.syncCyberwareWeapons(c);assert.equal(c.weapons[0].isEquipped,true);assert.equal(c.weapons[0].currentAmmo,2);
  c=cyber.uninstallCyberware(c,popup.id);
  assert.equal(c.weapons.length,1);assert.equal(c.weapons[0].id,pistol.id);assert.equal(c.weapons[0].isEquipped,false);
  assert.equal(c.weapons[0].currentAmmo,2);assert.equal(c.weapons[0].sourceCyberwareId,undefined);
});

test('linked cyberweapon ammo survives synchronization and a save/load',()=>{
  let c=fresh(),arm,gun;[c,arm]=add(c,96);c=put(c,arm,['body:left-arm']);[c,gun]=add(c,108);c=put(c,gun,[`${arm.id}:arm`]);
  c.weapons[0]=rules.updateWeaponAmmo(c.weapons[0],-1);assert.equal(c.weapons[0].currentAmmo,0);
  c=cyber.syncCyberwareWeapons(c);assert.equal(c.weapons[0].currentAmmo,0);assert.equal(storage.saveCharactersToStorage([c]),true);assert.equal(storage.loadStoredCharacters()[0].weapons[0].currentAmmo,0);
});
test('Gorilla upgrades are attached to their weapon and do not become independent weapons',()=>{
  let c=fresh(),arm,gorilla,upgrade;[c,arm]=add(c,96);c=put(c,arm,['body:left-arm']);[c,gorilla]=add(c,161);c=put(c,gorilla,[`${arm.id}:arm`]);[c,upgrade]=add(c,167);c=put(c,upgrade,[`${gorilla.id}:gorilla`]);
  assert.equal(c.weapons.length,1);assert.equal(c.weapons[0].quality,'Excellent');assert.equal(c.weapons[0].damageProfiles.length,2);
  c=cyber.uninstallCyberware(c,upgrade.id);assert.equal(c.weapons.length,1);assert.equal(c.weapons[0].damageProfiles,undefined);
});
test('inactive armor and grafts provide no automatic benefits',()=>{
  let c=fresh(),graft,armor;[c,graft]=add(c,66);[c,armor]=add(c,91);c.armor.body.spCurrent=0;assert.equal(rules.effectiveSP(c,'body'),0);assert.equal(rules.effectiveStat(c,'BODY'),c.stats.BODY);
  c=put(c,graft);assert.equal(rules.effectiveStat(c,'BODY'),Math.min(10,c.stats.BODY+2));
});
test('legacy assignment preserves unknown fields and does not charge a second installation',()=>{
  let c=fresh();c.cyberware=[{id:'legacy',name:'Neural Link',category:'Neuralware',installLocation:'Spine',humanityCost:7,description:'old',customNote:{keep:true}}];c.humanityCurrent=60;
  const before=JSON.stringify(c.cyberware);const loaded=cyber.syncCyberwareWeapons(c);assert.equal(JSON.stringify(loaded.cyberware),before);
  c=put(c,c.cyberware[0],['body:neural']);assert.equal(c.humanityCurrent,60);assert.deepEqual(c.cyberware[0].customNote,{keep:true});
});
test('malformed installation metadata is rejected before imported state can render',()=>{
  for(const invalid of [{installedIn:{}},{installRule:{allowedHosts:['eye'],slots:1,hostCount:1000000}},{installRule:{allowedHosts:['unknown'],slots:1}},{installRule:{allowedHosts:['eye'],slots:1,provides:{}}},{weapon:{name:'bad'}}]) {
    const c=fresh();c.cyberware=[{...owned(31),...invalid}];assert.equal(storage.parseImportedJson(JSON.stringify(c)),null);
  }
});
test('fabricated and circular hosts never grant active cyberware effects',()=>{
  const c=fresh();const a=owned(31,{id:'a',isInstalled:true,installedIn:['b:eye']}),b=owned(31,{id:'b',isInstalled:true,installedIn:['a:eye']});c.cyberware=[a,b];assert.equal(cyber.installedCyberware(c).length,0);
  c.cyberware=[owned(31,{isInstalled:true,installedIn:['body:invented']})];assert.equal(cyber.installedCyberware(c).length,0);
});
test('installation modal commits through the shared slot validator',()=>{
  let c=fresh(),arm;[c,arm]=add(c,96);let updated;
  const view=mount(CyberwareInstallModal,{character:c,item:arm,lang:'en',onUpdateCharacter:next=>updated=next,onClose(){}});
  const confirm=button(view.render(),'Confirm installation');assert.equal(confirm.props.disabled,false);confirm.props.onClick();assert.ok(updated);assert.equal(updated.cyberware[0].isInstalled,true);assert.equal(updated.humanityCurrent,73);
});

test('uninstall and reinstall never refill a built-in weapon',()=>{
  let c=fresh(),arm,launcher;[c,arm]=add(c,96);c=put(c,arm,['body:left-arm']);[c,launcher]=add(c,162);c=put(c,launcher,[`${arm.id}:arm`]);
  c.weapons[0]=rules.updateWeaponAmmo(c.weapons[0],-1);c=cyber.uninstallCyberware(c,launcher.id);assert.equal(c.weapons.length,0);assert.equal(c.cyberware.at(-1).weaponState.currentAmmo,0);
  storage.saveCharactersToStorage([c]);c=storage.loadStoredCharacters()[0];c=put(c,c.cyberware.at(-1),[`${arm.id}:arm`]);assert.equal(c.weapons[0].currentAmmo,0);
});
test('moving a same-host prerequisite disables the dependent option',()=>{
  let c=fresh(),left,right,deck,upgrade;[c,left]=add(c,96);c=put(c,left,['body:left-arm']);[c,right]=add(c,96);c=put(c,right,['body:right-arm']);
  [c,deck]=add(c,104);c=put(c,deck,[`${left.id}:arm`]);[c,upgrade]=add(c,105);c=put(c,upgrade,[`${left.id}:arm`]);
  c=put(c,c.cyberware.find(item=>item.id===deck.id),[`${right.id}:arm`]);assert.equal(cyber.isCyberwareInstalled(c,c.cyberware.find(item=>item.id===upgrade.id)),false);
});
test('Neuroport satisfies Neural Link dependencies without a second neural foundation',()=>{
  let c=fresh(),port,tail;[c,port]=add(c,160);c=put(c,port,['body:neural']);[c,tail]=add(c,86);c=put(c,tail,['body:external']);assert.equal(c.weapons.length,1);
  c=cyber.uninstallCyberware(c,port.id);assert.equal(c.weapons.length,0);assert.equal(c.cyberware.find(item=>item.id===tail.id).isInstalled,false);
});
test('effective graft BODY qualifies for Heavy Subdermal Armor and its penalty applies',()=>{
  let c=fresh(),graft,armor;c.stats.BODY=8;[c,graft]=add(c,66);c=put(c,graft);[c,armor]=add(c,95);c=put(c,armor);
  assert.equal(rules.effectiveStat(c,'BODY'),10);assert.equal(rules.effectiveStat(c,'REF'),c.stats.REF-2);assert.equal(rules.effectiveSP(c,'body'),13);
  c=cyber.uninstallCyberware(c,armor.id);assert.equal(rules.effectiveStat(c,'REF'),c.stats.REF);
});
test('accepted orphan weapon references survive load for manual repair',()=>{
  const c=fresh();c.weapons=[{id:'orphan',name:'Preserve me',category:'Heavy Pistol',damage:'3d6',standardRof:2,magCapacity:8,currentAmmo:2,ammoType:'Pistol',concealable:true,notes:'',sourceCyberwareId:'missing'}];
  assert.equal(storage.saveCharactersToStorage([c]),true);const loaded=storage.loadStoredCharacters()[0];assert.equal(loaded.weapons.length,1);assert.equal(loaded.weapons[0].currentAmmo,2);assert.ok(cyber.cyberwareWarnings(loaded,'en').length);
  const emptyMount=owned(111,{id:'empty-mount'});c.cyberware=[emptyMount];c.weapons[0].sourceCyberwareId=emptyMount.id;
  assert.equal(storage.saveCharactersToStorage([c]),true);assert.equal(storage.loadStoredCharacters()[0].weapons.length,1);
});
