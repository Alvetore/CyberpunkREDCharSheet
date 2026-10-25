const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { load, mount, nodes, button, label } = require('./helpers.cjs');
const { createEmptyCharacter } = load('src/data/initialData.ts');
const { DATAPOOL_ALL_VEHICLES } = load('src/data/datapoolVehicles.ts');
const { CatalogBrowser } = load('src/components/CatalogBrowser.tsx');
const { VehicleCatalogBrowser } = load('src/components/VehicleCatalogBrowser.tsx');
const { VehicleCatalogModal } = load('src/components/VehicleCatalogModal.tsx');
const { VehiclesSection } = load('src/components/VehiclesSection.tsx');
const { DataPoolShopModal } = load('src/components/DataPoolShopModal.tsx');
const { vehicleFromCatalog, addVehicleToGarage } = load('src/utils/vehicles.ts');
const { isCharacter } = load('src/utils/characterValidation.ts');
const storage = load('src/utils/storage.ts');
const fresh=()=>({...createEmptyCharacter('Garage'),vehicles:[],cashEb:100000});
const bike=()=>vehicleFromCatalog(DATAPOOL_ALL_VEHICLES.find(v=>v.category==='Bicycle'),'ru');
beforeEach(()=>{const data=new Map();global.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};global.alert=()=>{};});

test('garage models match all source categories and retain original motor vehicle identities',()=>{
  assert.equal(DATAPOOL_ALL_VEHICLES.length,59);assert.equal(new Set(DATAPOOL_ALL_VEHICLES.map(v=>v.id)).size,59);
  for(const [prefix,count] of [['ground',34],['sea',8],['air',16]]) for(let i=1;i<=count;i++) assert.ok(DATAPOOL_ALL_VEHICLES.some(v=>v.id===`veh-${prefix}-${i}`));
  for(const v of DATAPOOL_ALL_VEHICLES) {assert.equal(v.catalogId,v.id);assert.ok(v.sourceUrl.startsWith('https://alec-leon.github.io/data-pool/workshop/garage/'));assert.ok(Number.isFinite(v.costEb)&&v.costEb>0);assert.ok(v.descriptionRu);assert.ok(v.speedCombat&&v.speedNarrative);assert.ok(v.priceLabel);}
  const bicycle=DATAPOOL_ALL_VEHICLES.filter(v=>v.category==='Bicycle');assert.equal(bicycle.length,1);assert.equal(bicycle[0].costEb,100);assert.equal(bicycle[0].sdpMax,15);assert.match(bicycle[0].speedCombat,/8 СКО/);assert.match(bicycle[0].speedNarrative,/19 км/);assert.match(bicycle[0].descriptionRu,/нельзя приобрести или модернизировать/);
});

test('vehicle catalog sections combine with search and return the complete selected model',()=>{
  let selected;const view=mount(CatalogBrowser,VehicleCatalogBrowser({lang:'en',onSelect:v=>selected=v}).props);
  const cards=tree=>nodes(tree,n=>n.type==='button'&&n.props['aria-label']?.startsWith('Select:'));
  assert.equal(cards(view.render()).length,59);button(view.render(),'Bicycles').props.onClick();assert.equal(cards(view.render()).length,1);cards(view.render())[0].props.onClick();assert.equal(selected.id,'veh-bike-1');
  button(view.render(),'Watercraft').props.onClick();assert.equal(cards(view.render()).length,8);nodes(view.render(),n=>n.type==='input')[0].props.onChange({target:{value:'  Aerojeep  '}});assert.equal(cards(view.render()).length,0);button(view.render(),'All sections').props.onClick();assert.equal(cards(view.render()).length,1);cards(view.render())[0].props.onClick();assert.match(selected.speedCombat,/воздух/);assert.match(selected.speedNarrative,/по земле/);
});

test('adding and buying vehicles creates independent instances without changing old damage or upgrades',()=>{
  const legacy={...bike(),id:'legacy-bike',sdpCurrent:3,upgrades:['Custom wheels'],notes:'my notes',unknown:{enabled:false,zero:0}};
  const c={...fresh(),vehicles:[legacy]};const snapshot=JSON.stringify(c);
  let next=addVehicleToGarage(c,bike(),true).character;assert.equal(next.cashEb,99900);assert.deepEqual(next.vehicles[0],legacy);assert.equal(next.vehicles[1].sdpCurrent,15);assert.ok(next.vehicles[1].sourceUrl);assert.equal(JSON.stringify(c),snapshot);
  next=addVehicleToGarage(next,bike(),false).character;assert.equal(next.cashEb,99900);assert.equal(next.vehicles.length,3);assert.notEqual(next.vehicles[1].id,next.vehicles[2].id);assert.notEqual(next.vehicles[1].upgrades,next.vehicles[2].upgrades);
});

test('garage additions reject invalid data and insufficient funds without mutating state',()=>{
  const c=fresh(),snapshot=JSON.stringify(c),v=bike();
  assert.equal(addVehicleToGarage({...c,cashEb:99},v,true).error,'funds');
  for(const costEb of [-1,NaN,Infinity]) assert.equal(addVehicleToGarage(c,{...v,costEb},false).error,'price');
  for(const change of [{sdpMax:0},{seats:0},{seats:'0'},{seats:-1},{seats:'-1'},{seats:1.5},{armorSp:-1},{nomadRankReq:11},{category:'invalid'}]) assert.equal(addVehicleToGarage(c,{...v,...change},false).error,'stats');
  const free=addVehicleToGarage(c,{...v,costEb:0,armorSp:0,sdpMax:1,seats:1},true).character;assert.equal(free.cashEb,c.cashEb);assert.equal(free.vehicles[0].sdpMax,1);assert.equal(free.vehicles[0].armorSp,0);assert.equal(JSON.stringify(c),snapshot);
});

test('source descriptions, speed modes and old unknown vehicle fields survive save and load',()=>{
  const model=DATAPOOL_ALL_VEHICLES.find(v=>v.name==='VMW Aerojeep');let c=addVehicleToGarage(fresh(),vehicleFromCatalog(model,'ru'),false).character;
  c.vehicles[0]={...c.vehicles[0],unknown:{zero:0,value:null},sdpCurrent:17,upgrades:['Custom upgrade']};assert.ok(isCharacter(c));assert.equal(storage.saveCharactersToStorage([c]),true);assert.deepEqual(storage.loadStoredCharacters()[0].vehicles,c.vehicles);
  assert.equal(isCharacter({...c,vehicles:[{...c.vehicles[0],sourceUrl:42}]}),false);
});

test('vehicle modal buys different models cumulatively without closing and retains receipts after a failed purchase',()=>{
  let updated,closed=0,updates=0;const view=mount(VehicleCatalogModal,{character:fresh(),lang:'en',onUpdateCharacter:c=>{updated=c;updates++;},onClose(){closed++;}});
  const model=DATAPOOL_ALL_VEHICLES.find(v=>v.id==='veh-ground-1');nodes(view.render(),n=>n.type===VehicleCatalogBrowser)[0].props.onSelect(model);button(view.render(),'Buy').props.onClick();assert.equal(updated.cashEb,80000);assert.equal(updated.vehicles[0].catalogId,model.id);assert.equal(updated.vehicles[0].notes,model.descriptionRu);assert.equal(closed,0);
  view.props.character=updated;
  assert.equal(nodes(view.render(),n=>n.props.role==='dialog').length,1);
  assert.equal(nodes(view.render(),n=>n.type===VehicleCatalogBrowser)[0].props.selectedId,model.id);
  assert.match(label(nodes(view.render(),n=>n.props.role==='status')[0]),/Total this session\s*:\s*1\b/);

  const bicycle=DATAPOOL_ALL_VEHICLES.find(v=>v.id==='veh-bike-1');nodes(view.render(),n=>n.type===VehicleCatalogBrowser)[0].props.onSelect(bicycle);
  button(view.render(),'Buy').props.onClick();assert.equal(updated.cashEb,79900);assert.equal(updated.vehicles.length,2);
  assert.equal(updated.vehicles[0].catalogId,model.id);assert.equal(updated.vehicles[1].catalogId,bicycle.id);assert.equal(closed,0);
  view.props.character=updated;
  assert.equal(nodes(view.render(),n=>n.type===VehicleCatalogBrowser)[0].props.selectedId,bicycle.id);
  assert.match(label(nodes(view.render(),n=>n.props.role==='status')[0]),/Total this session\s*:\s*2\b/);
  button(view.render(),'Add owned vehicle').props.onClick();assert.equal(updated.cashEb,79900);assert.equal(updated.vehicles.length,3);assert.notEqual(updated.vehicles[1].id,updated.vehicles[2].id);
  view.props.character=updated;const snapshot=JSON.stringify(updated);

  const expensive=DATAPOOL_ALL_VEHICLES.find(v=>v.costEb>updated.cashEb);assert.ok(expensive);
  nodes(view.render(),n=>n.type===VehicleCatalogBrowser)[0].props.onSelect(expensive);button(view.render(),'Buy').props.onClick();
  assert.equal(updates,3);assert.equal(JSON.stringify(updated),snapshot);assert.equal(closed,0);
  assert.equal(nodes(view.render(),n=>n.props.role==='dialog').length,1);
  assert.equal(nodes(view.render(),n=>n.type===VehicleCatalogBrowser)[0].props.selectedId,expensive.id);
  assert.match(label(nodes(view.render(),n=>n.props.role==='status')[0]),/Total this session\s*:\s*3\b/);
  assert.match(label(view.render()),/Not enough Eurodollars/);
  button(view.render(),'Close').props.onClick();assert.equal(closed,1);
});

test('vehicle modal keeps insufficient-funds errors open and garage entry opens the new catalog',()=>{
  let updated,closed=0;const view=mount(VehicleCatalogModal,{character:{...fresh(),cashEb:0},lang:'en',onUpdateCharacter:c=>updated=c,onClose(){closed++;}});
  nodes(view.render(),n=>n.type===VehicleCatalogBrowser)[0].props.onSelect(DATAPOOL_ALL_VEHICLES[0]);button(view.render(),'Buy').props.onClick();assert.equal(updated,undefined);assert.equal(closed,0);assert.match(label(view.render()),/Not enough Eurodollars/);
  const section=mount(VehiclesSection,{character:fresh(),lang:'en',onUpdateCharacter(){},onRollCustomCheck(){},onRollCustomDamage(){}});button(section.render(),'Add Vehicle').props.onClick();assert.equal(nodes(section.render(),n=>n.type===VehicleCatalogModal).length,1);
});

test('global vehicle shop uses the same validated catalog purchase path',()=>{
  let updated;const view=mount(DataPoolShopModal,{isOpen:true,initialCategory:'vehicles',character:fresh(),lang:'en',onClose(){},onUpdateCharacter:c=>updated=c});
  nodes(view.render(),n=>n.type==='input'&&n.props.placeholder==='Search items...')[0].props.onChange({target:{value:'Bicycle'}});button(view.render(),'Buy').props.onClick();assert.equal(updated.cashEb,99900);assert.equal(updated.vehicles[0].catalogId,'veh-bike-1');assert.equal(updated.vehicles[0].sdpMax,15);
});
