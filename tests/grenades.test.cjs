const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { load, mount, nodes, button, label, randomSequence } = require('./helpers.cjs');
const { createEmptyCharacter, CPR_RANGE_DV_TABLE } = load('src/data/initialData.ts');
const { GRENADE_CATALOG } = load('src/data/grenadeCatalog.ts');
const { DATAPOOL_WEAPONS, DATAPOOL_BASE_WEAPONS } = load('src/data/datapoolCatalog.ts');
const { App } = load('src/App.tsx');
const { WeaponsSection } = load('src/components/WeaponsSection.tsx');
const { DiceRollerModal } = load('src/components/DiceRollerModal.tsx');
const rules = load('src/utils/rules.ts');
const storage = load('src/utils/storage.ts');
const fresh = () => ({ ...createEmptyCharacter('Grenades'), weapons: [], cyberware: [] });
const ap = () => ({ ...GRENADE_CATALOG.find(g => g.name === 'Бронебойная граната'), id: 'owned-grenade' });
beforeEach(() => {
  const data = new Map(); global.localStorage = { getItem: k => data.get(k) ?? null, setItem: (k,v) => data.set(k,v) }; global.alert = () => {};
});

test('grenades extend the original 200 weapon identities with all 18 stable priced source records', () => {
  assert.equal(DATAPOOL_BASE_WEAPONS.length, 200); assert.equal(DATAPOOL_WEAPONS.length, 218);
  assert.ok(DATAPOOL_BASE_WEAPONS.every(w => /^cat-weap-\d+$/.test(w.id)));
  assert.equal(GRENADE_CATALOG.length, 18); assert.equal(new Set(DATAPOOL_WEAPONS.map(w => w.id)).size, 218);
  for (const g of GRENADE_CATALOG) {
    assert.match(g.id, /^grenade-[a-f0-9]{16}$/); assert.ok(g.costEb > 0); assert.equal(g.category, 'Thrown Grenade');
    assert.equal(g.skillId, 'athletics'); assert.equal(g.consumable, true); assert.equal(g.magCapacity, 1); assert.equal(g.currentAmmo, 1);
    assert.match(g.sourceUrl, /equipment\/weapons\/#/); assert.ok(g.notes.length > 300);
  }
  assert.equal(GRENADE_CATALOG.find(g => /Аэрозольная/.test(g.name)).costEb, 125);
  assert.equal(GRENADE_CATALOG.find(g => /Улучшенная/.test(g.name)).costEb, 500);
});

test('utility and conditional grenades never get invented ordinary explosive damage', () => {
  for (const name of ['яд', 'биотоксин', 'Дымовая', 'ЭМИ', 'Светошумовая', 'Усыпляющая', 'Аэрозольная']) {
    const g = GRENADE_CATALOG.find(g => g.name.toLowerCase().includes(name.toLowerCase())); assert.ok(g, name); assert.equal(g.damage, ''); assert.equal(g.canCrit, false);
  }
  const micro = GRENADE_CATALOG.find(g => /микро-компрессор/i.test(g.name));
  assert.equal(micro.attackRequiresRoll, false); assert.equal(micro.damage, '6d6'); assert.match(micro.notes, /10/);
  assert.equal(ap().damage, '6d6');
});

test('thrown grenade checks use DEX Athletics and launcher DVs only through 25m', () => {
  const c = fresh(); c.stats.DEX = 8; c.stats.REF = 2; c.skills.find(s => s.id === 'athletics').level = 4;
  assert.equal(rules.weaponAttackBase(c, ap()), 12);
  assert.deepEqual(CPR_RANGE_DV_TABLE.find(row => row.category === 'Thrown Grenade').dvs, [16,15,15,null,null,null,null,null]);
  let captured; c.weapons = [ap()];
  const view = mount(WeaponsSection, { character:c,lang:'en',onUpdateCharacter(){},onRollWeaponAttack(...args){captured=args;},onRollWeaponDamage(){} });
  const throwButtons = nodes(view.render(), n => n.type === 'button' && label(n).includes('· DV'));
  assert.equal(throwButtons.length, 3); throwButtons[2].props.onClick(); assert.equal(captured[1],15);
  assert.equal(nodes(view.render(),n=>n.type==='button' && n.props.title==='Reload').length,0);
});

test('a real App throw consumes exactly one on hit or miss and cannot be repeated at zero', () => {
  for (const dv of [1,99]) {
    const c=fresh();c.weapons=[ap()];c.luckCurrent=3;storage.saveCharactersToStorage([c]);const view=mount(App,{});
    const attack=()=>nodes(view.render(),n=>n.type===WeaponsSection)[0].props.onRollWeaponAttack;
    randomSequence([0.4],()=>attack()(c.weapons[0],dv,'0–6m'));
    let owned=view.state.values[0][0]; assert.equal(owned.weapons[0].currentAmmo,0);assert.equal(owned.luckCurrent,3);
    const rolls=nodes(view.render(),n=>n.type===DiceRollerModal)[0].props.rollHistory;
    assert.equal(rolls.length,1);assert.equal(rolls[0].isSuccess,dv===1);
    const snapshot=JSON.stringify(view.state.values);
    attack()(c.weapons[0],dv,'0–6m');assert.equal(JSON.stringify(view.state.values),snapshot);
    assert.match(JSON.stringify(view.state.values),/Атака \(DEX\)|Attack \(DEX\)/);
    owned.weapons[0]=rules.updateWeaponAmmo(owned.weapons[0],'reload');assert.equal(owned.weapons[0].currentAmmo,0);
    owned.weapons[0]=rules.updateWeaponAmmo(owned.weapons[0],1);assert.equal(owned.weapons[0].currentAmmo,0);
    assert.equal(storage.saveCharactersToStorage([owned]),true);assert.equal(storage.loadStoredCharacters()[0].weapons[0].currentAmmo,0);
  }
});

test('inactive backpack weapons cannot attack or roll damage even via direct App callbacks', () => {
  const c=fresh();c.weapons=[{...ap(),isEquipped:false}];storage.saveCharactersToStorage([c]);const view=mount(App,{});
  const props=nodes(view.render(),n=>n.type===WeaponsSection)[0].props,snapshot=JSON.stringify(view.state.values);
  props.onRollWeaponAttack(c.weapons[0],15);props.onRollWeaponDamage(c.weapons[0]);assert.equal(JSON.stringify(view.state.values),snapshot);
  const section=mount(WeaponsSection,{...props,character:c,lang:'en'});assert.ok(!label(section.render()).includes(c.weapons[0].name));
});

test('delayed microcompressor has manual single consumption and no instant throw', () => {
  const c=fresh();c.weapons=[{...GRENADE_CATALOG.find(g=>/микро-компрессор/i.test(g.name)),id:'micro'}];let updated;
  const view=mount(WeaponsSection,{character:c,lang:'en',onUpdateCharacter:c=>updated=c,onRollWeaponAttack(){throw Error('no instant throw');},onRollWeaponDamage(){}});
  assert.equal(button(view.render(),'Effect without attack roll').props.disabled,true);
  button(view.render(),'Activate manually').props.onClick();assert.equal(updated.weapons[0].currentAmmo,0);
  view.props.character=updated;assert.equal(button(view.render(),'Activate manually').props.disabled,true);
});
