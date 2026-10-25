const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { load, mount, nodes, button, label } = require('./helpers.cjs');
const { createEmptyCharacter } = load('src/data/initialData.ts');
const { DATAPOOL_GEAR } = load('src/data/datapoolCatalog.ts');
const { GEAR_SECTIONS } = load('src/data/gearCatalog.ts');
const { CatalogBrowser } = load('src/components/CatalogBrowser.tsx');
const { GearCatalogBrowser } = load('src/components/GearCatalogBrowser.tsx');
const { GearSection } = load('src/components/GearSection.tsx');
const { DataPoolShopModal } = load('src/components/DataPoolShopModal.tsx');
const { addGearToInventory, gearPrice } = load('src/utils/gear.ts');
const { isCharacter } = load('src/utils/characterValidation.ts');
const storage = load('src/utils/storage.ts');
const fresh = () => ({ ...createEmptyCharacter('Gear test'), gear: [], cashEb: 1000 });
const find = name => DATAPOOL_GEAR.find(item => item.name === name);
const cards = tree => nodes(tree,n=>n.type==='button'&&n.props['aria-label']?.startsWith('Select:'));
beforeEach(()=>{ const data = new Map(); global.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)}; global.alert=()=>{}; });

test('gear catalogue covers the priced equipment tables and retains all 126 legacy identities',()=>{
  assert.equal(DATAPOOL_GEAR.length,261);assert.equal(GEAR_SECTIONS.length,14);
  assert.equal(new Set(DATAPOOL_GEAR.map(item=>item.id)).size,261);
  assert.equal(new Set(DATAPOOL_GEAR.map(item=>item.sourceKey)).size,261);
  for(let n=1;n<=126;n++) assert.ok(DATAPOOL_GEAR.some(item=>item.id===`cat-gear-${n}`));
  for(const item of DATAPOOL_GEAR) { assert.ok(GEAR_SECTIONS.some(section=>section.id===item.section));assert.ok(item.notes.length>40);assert.ok(item.sourceUrl.startsWith('https://alec-leon.github.io/data-pool/equipment/'));assert.ok(Number.isFinite(item.costEb)&&item.costEb>=0); }
  assert.equal(DATAPOOL_GEAR.filter(item=>item.section==='clothing').length,90);
  assert.equal(DATAPOOL_GEAR.filter(item=>item.section==='software').length,20);
  assert.ok(find('Агент (обычного качества)').notes.length>1000);
  assert.deepEqual(DATAPOOL_GEAR.filter(item=>item.sourceKey.startsWith('items:агент:')).map(item=>item.costEb),[50,100,500,1000]);
  assert.equal(DATAPOOL_GEAR.filter(item=>item.sourceKey.startsWith('items:фирменныйкомбенизонуниформа:')).length,4);
});

test('gear navigation and search keep all offers reachable and pass the original selected item',()=>{
  let selected;const props=GearCatalogBrowser({lang:'en',onSelect:item=>selected=item}).props;
  const view=mount(CatalogBrowser,props);assert.equal(cards(view.render()).length,261);
  button(view.render(),'Medical equipment').props.onClick();assert.equal(cards(view.render()).length,5);
  nodes(view.render(),n=>n.type==='input')[0].props.onChange({target:{value:'  Фонарик  '}});assert.equal(cards(view.render()).length,0);
  button(view.render(),'All sections').props.onClick();
  const flashlight=cards(view.render()).find(card=>card.props['aria-label']==='Select: Фонарик');assert.ok(flashlight);
  flashlight.props.onClick();assert.equal(selected,find('Фонарик'));
});

test('purchasing a quantity charges once, stacks identical offers and preserves edited and legacy rows',()=>{
  let c=fresh();const item=find('Фонарик');
  const legacy={id:'old',name:item.name,category:'Gear',quantity:2,costEb:9,notes:'custom note',unknown:{zero:0,enabled:false}};
  c.gear=[legacy];const before=JSON.stringify(c);
  let next=addGearToInventory(c,item,3,true).character;assert.equal(next.cashEb,940);assert.equal(next.gear[1].quantity,3);assert.equal(next.gear[1].sourceUrl,item.sourceUrl);assert.equal(JSON.stringify(c),before);assert.deepEqual(next.gear[0],legacy);
  next=addGearToInventory(next,item,2,false).character;assert.equal(next.cashEb,940);assert.equal(next.gear[1].quantity,5);
  next.gear[1]={...next.gear[1],notes:'edited'};next=addGearToInventory(next,item,1,true).character;assert.equal(next.gear.length,3);assert.equal(next.gear[1].notes,'edited');
});

test('invalid quantities, invalid prices and insufficient cash leave the inventory unchanged',()=>{
  const c=fresh(),snapshot=JSON.stringify(c),item=find('Фонарик');
  for(const quantity of [0,-1,1.5,1000,NaN]) assert.equal(addGearToInventory(c,item,quantity,true).error,'quantity');
  for(const costEb of [-1,Infinity,NaN]) assert.equal(addGearToInventory(c,{...item,costEb},1,true).error,'price');
  assert.equal(addGearToInventory({...c,cashEb:10},item,1,true).error,'funds');assert.equal(JSON.stringify(c),snapshot);
});

test('free apps and subscriptions keep zero price and monthly billing through save and load',()=>{
  let c=fresh();c=addGearToInventory(c,find('Z-Почта'),1,true).character;assert.equal(c.cashEb,1000);
  const subscription=find('Вдохновитель');assert.equal(gearPrice(subscription,'en'),'50 eb / month');
  c=addGearToInventory(c,subscription,2,true).character;assert.equal(c.cashEb,900);assert.ok(isCharacter(c));
  assert.equal(storage.saveCharactersToStorage([c]),true);const restored=storage.loadStoredCharacters()[0];assert.deepEqual(restored.gear,c.gear);
  assert.equal(isCharacter({...c,gear:[{...c.gear[0],billingPeriod:123}]}),false);
});

test('actual gear modal selects a catalog card, buys quantity and supports owned gear without cash loss',()=>{
  let updated;const view=mount(GearSection,{character:fresh(),lang:'en',onUpdateCharacter:c=>updated=c});
  button(view.render(),'Add Gear Item').props.onClick();
  const browser=nodes(view.render(),n=>n.type===GearCatalogBrowser)[0];browser.props.onSelect(find('Фонарик'));
  nodes(view.render(),n=>n.props['aria-label']==='Item quantity')[0].props.onChange({target:{value:'3'}});
  button(view.render(),'Buy').props.onClick();assert.equal(updated.cashEb,940);assert.equal(updated.gear[0].quantity,3);
  view.props.character=updated;button(view.render(),'Add Gear Item').props.onClick();
  button(view.render(),'Add owned gear').props.onClick();assert.equal(updated.cashEb,940);assert.equal(updated.gear[0].quantity,6);
});

test('gear modal refuses overspending and keeps entered choice open for correction',()=>{
  let updated;const view=mount(GearSection,{character:{...fresh(),cashEb:0},lang:'en',onUpdateCharacter:c=>updated=c});
  button(view.render(),'Add Gear Item').props.onClick();nodes(view.render(),n=>n.type===GearCatalogBrowser)[0].props.onSelect(find('Фонарик'));
  button(view.render(),'Buy').props.onClick();assert.equal(updated,undefined);assert.ok(label(view.render()).includes('Not enough Eurodollars!'));assert.equal(nodes(view.render(),n=>n.props.role==='dialog').length,1);
});

test('shop gear sections filter offers and purchase preserves catalog provenance',()=>{
  let updated;const view=mount(DataPoolShopModal,{isOpen:true,character:fresh(),lang:'en',initialCategory:'gear',onClose(){},onUpdateCharacter:c=>updated=c});
  button(view.render(),'Medical equipment').props.onClick();
  nodes(view.render(),n=>n.type==='input'&&n.props.placeholder==='Search items...')[0].props.onChange({target:{value:'Сумка Медтеха'}});
  button(view.render(),'Buy').props.onClick();assert.equal(updated.cashEb,900);assert.equal(updated.gear[0].catalogId,'cat-gear-87');assert.ok(updated.gear[0].sourceUrl);
});
