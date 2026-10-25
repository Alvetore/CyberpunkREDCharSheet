const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { load, mount, nodes, button, label } = require('./helpers.cjs');
const { createEmptyCharacter } = load('src/data/initialData.ts');
const storage = load('src/utils/storage.ts');
const { isCharacter } = load('src/utils/characterValidation.ts');
const { StatsSection } = load('src/components/StatsSection.tsx');
const { Header } = load('src/components/Header.tsx');
const { App } = load('src/App.tsx');
const { AMMUNITION_CATALOG } = load('src/data/ammunitionCatalog.ts');
const { DATAPOOL_GEAR } = load('src/data/datapoolCatalog.ts');
const { GearSection } = load('src/components/GearSection.tsx');
const { GearCatalogBrowser } = load('src/components/GearCatalogBrowser.tsx');
const { CatalogBrowser } = load('src/components/CatalogBrowser.tsx');
const { DataPoolShopModal } = load('src/components/DataPoolShopModal.tsx');
const noop = () => {};
let data;
beforeEach(() => { data = new Map(); global.localStorage = { getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v) }; global.alert = noop; });

test('reputation defaults to zero and legacy saves without it remain valid and lossless', () => {
  const c=createEmptyCharacter('Reputation');assert.equal(c.reputation,0);delete c.reputation;c.custom={keep:[0,false,null]};
  assert.ok(isCharacter(c));assert.equal(storage.saveCharactersToStorage([c]),true);assert.deepEqual(storage.loadStoredCharacters()[0].custom,c.custom);
  const v=mount(StatsSection,{character:c,lang:'en',onUpdateCharacter:noop,onRollStat:noop,onRollInitiative:noop,onRollDeathSave:noop,onOpenDamageCalc:noop});
  assert.equal(nodes(v.render(),n=>n.props['aria-label']==='Reputation')[0].props.value,0);
});

test('reputation editing is bounded and retained by export/import and save/load', () => {
  let updated;const c=createEmptyCharacter('Reputation');const view=mount(StatsSection,{character:c,lang:'en',onUpdateCharacter:c=>updated=c,onRollStat:noop,onRollInitiative:noop,onRollDeathSave:noop,onOpenDamageCalc:noop});
  const edit=value=>nodes(view.render(),n=>n.props['aria-label']==='Reputation')[0].props.onChange({target:{value}});
  edit('7');assert.equal(updated.reputation,7);assert.deepEqual(updated.skills,c.skills);
  assert.equal(storage.saveCharactersToStorage([updated]),true);assert.equal(storage.loadStoredCharacters()[0].reputation,7);assert.equal(storage.parseImportedJson(JSON.stringify(updated)).reputation,7);
  edit('-2');assert.equal(updated.reputation,0);edit('99');assert.equal(updated.reputation,10);
  for(const reputation of [-1,11,2.5,'3',null]) assert.equal(isCharacter({...c,reputation}),false);
});

test('sound ON and OFF preferences restore on a new App mount and ignore bad/unavailable storage', () => {
  assert.equal(storage.getStoredSoundEnabled(),true);
  for(const enabled of [false,true]) {
    storage.saveStoredSoundEnabled(enabled);assert.equal(storage.getStoredSoundEnabled(),enabled);
    const view=mount(App,{});assert.equal(nodes(view.render(),n=>n.type===Header)[0].props.soundEnabled,enabled);
    nodes(view.render(),n=>n.type===Header)[0].props.onToggleSound();assert.equal(nodes(view.render(),n=>n.type===Header)[0].props.soundEnabled,!enabled);
  }
  data.set('cpr_sound_enabled_v1','unexpected');assert.equal(storage.getStoredSoundEnabled(),true);
  global.localStorage={getItem(){throw Error('unavailable');},setItem(){throw Error('quota');}};
  assert.equal(storage.getStoredSoundEnabled(),true);assert.doesNotThrow(()=>storage.saveStoredSoundEnabled(false));
});

test('ammo covers calibers, compatible variants and source-specific pack sizes and prices', () => {
  assert.equal(AMMUNITION_CATALOG.length,114);assert.equal(new Set(AMMUNITION_CATALOG.map(a=>a.id)).size,114);
  assert.ok(AMMUNITION_CATALOG.every(a=>DATAPOOL_GEAR.includes(a)&&a.section==='ammunition'&&a.category==='Ammunition'&&a.sourceUrl.includes('/weapons/#ammo')));
  const find=(variant,caliber)=>AMMUNITION_CATALOG.find(a=>a.sourceKey===`ammo:${variant}:${caliber}`);
  for(const caliber of ['medium','heavy','very-heavy','rifle','slugs','shells','arrows']) { const a=find('стандартные',caliber);assert.equal(a.costEb,10);assert.match(a.name,/10 шт\./); }
  assert.equal(find('стандартные','rockets'),undefined);assert.equal(find('бронебойные','shells'),undefined);
  assert.equal(find('бронебойные','rockets').costEb,100);assert.match(find('бронебойные','rockets').name,/1 шт\./);
  assert.match(find('дешевые боеприпасы','heavy').name,/50 шт\./);
  const small=AMMUNITION_CATALOG.find(a=>a.sourceKey.includes('мелкой дичи')&&a.sourceKey.endsWith(':heavy'));assert.match(small.name,/100 шт\./);assert.equal(small.costEb,10);
  const aero=AMMUNITION_CATALOG.find(a=>a.sourceKey==='ammo:стрела-аэрогипо:arrows');assert.equal(aero.costEb,100);assert.match(aero.name,/1 шт\./);
  const smart=AMMUNITION_CATALOG.filter(a=>a.sourceKey.startsWith('ammo-77:улучшенный'));assert.equal(smart.find(a=>a.sourceKey.endsWith(':heavy')).costEb,50);assert.equal(smart.find(a=>a.sourceKey.endsWith(':rockets')).costEb,500);
  assert.ok(!AMMUNITION_CATALOG.some(a=>a.name.includes('ЭМИ')));
});

test('ammo section is reachable and buys two packs then another caliber in one gear modal', () => {
  const legacy=createEmptyCharacter('Legacy ammo');
  assert.doesNotMatch(label(mount(GearSection,{character:legacy,lang:'en',onUpdateCharacter:noop}).render()),/packs/);
  let selected;const browser=mount(CatalogBrowser,GearCatalogBrowser({lang:'en',onSelect:a=>selected=a}).props);
  button(browser.render(),'Ammunition').props.onClick();const cards=nodes(browser.render(),n=>n.type==='button'&&n.props['aria-label']?.startsWith('Select:'));assert.equal(cards.length,114);cards[0].props.onClick();assert.equal(selected,AMMUNITION_CATALOG[0]);
  let c={...createEmptyCharacter('Ammo'),gear:[],cashEb:100},updated;
  const view=mount(GearSection,{character:c,lang:'en',onUpdateCharacter:c=>updated=c});button(view.render(),'Add Gear Item').props.onClick();
  const choose=item=>nodes(view.render(),n=>n.type===GearCatalogBrowser)[0].props.onSelect(item);
  choose(AMMUNITION_CATALOG[0]);nodes(view.render(),n=>n.props['aria-label']==='Item quantity')[0].props.onChange({target:{value:'2'}});
  assert.match(label(view.render()),/Number of packs/);button(view.render(),'Buy').props.onClick();assert.equal(updated.cashEb,80);assert.equal(updated.gear[0].quantity,2);
  view.props.character=updated;assert.match(label(view.render()),/packs/);choose(AMMUNITION_CATALOG[1]);button(view.render(),'Buy').props.onClick();assert.equal(updated.cashEb,60);assert.equal(updated.gear.length,2);
  assert.ok(nodes(view.render(),n=>n.props.role==='dialog').length);assert.equal(storage.saveCharactersToStorage([updated]),true);assert.deepEqual(storage.loadStoredCharacters()[0].gear,updated.gear);
});

test('ammo is available through the global shop gear category with pack price intact', () => {
  let updated;const a=AMMUNITION_CATALOG[0];const view=mount(DataPoolShopModal,{isOpen:true,initialCategory:'gear',character:{...createEmptyCharacter('Shop'),gear:[],cashEb:100},lang:'en',onUpdateCharacter:c=>updated=c,onClose:noop});
  button(view.render(),'Ammunition').props.onClick();nodes(view.render(),n=>n.type==='input'&&n.props.placeholder==='Search items...')[0].props.onChange({target:{value:a.name}});
  button(view.render(),'Buy').props.onClick();assert.equal(updated.gear[0].catalogId,a.id);assert.equal(updated.cashEb,90);
});
