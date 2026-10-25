const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { load } = require('./helpers.cjs');
const { createEmptyCharacter } = load('src/data/initialData.ts');
const { DATAPOOL_WEAPONS, DATAPOOL_ARMORS, DATAPOOL_CYBERWARE } = load('src/data/datapoolCatalog.ts');
const backpack = load('src/utils/backpack.ts');
const rules = load('src/utils/rules.ts');
const { calculateHumanityStats } = load('src/utils/roleUtils.ts');
const { isCharacter } = load('src/utils/characterValidation.ts');
const storage = load('src/utils/storage.ts');

const fresh = () => ({ ...createEmptyCharacter('Backpack'), weapons: [], cyberware: [], gear: [], cashEb: 10000 });
const weapon = () => structuredClone(DATAPOOL_WEAPONS.find(item => item.id === 'cat-weap-117'));
const armor = () => structuredClone(DATAPOOL_ARMORS.find(item => item.location === 'body' && item.penalty < 0));
const graft = () => structuredClone(DATAPOOL_CYBERWARE.find(item => item.id === 'cat-cyber-66'));
const draft = equipment => ({ ...backpack.equipmentCatalogEntry(equipment), name: 'Owned ' + equipment.item.name, notes: 'Edited inventory notes' });
function add(character, equipment, quantity = 1, purchase = true) {
  const result = backpack.addEquipmentToBackpack(character, equipment, draft(equipment), quantity, purchase);
  assert.ok(result.character, result.error);
  return result.character;
}

beforeEach(() => {
  const data = new Map();
  global.localStorage = { getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
});

test('typed purchases retain usable definitions and unique copies, charging exactly the edited price', () => {
  const original = fresh(), snapshot = structuredClone(original);
  const gun = weapon(); gun.customPayload = { zero: 0, enabled: false, nested: [null, 'keep'] };
  const equipment = { kind: 'weapon', item: gun }, edited = { ...draft(equipment), costEb: 123 };
  let c = backpack.addEquipmentToBackpack(original, equipment, edited, 2, true).character;
  assert.equal(c.cashEb, 9754);
  assert.equal(c.weapons.length, 2);
  assert.equal(new Set(c.weapons.map(item => item.id)).size, 2);
  for (const item of c.weapons) {
    assert.equal(item.catalogId, gun.id); assert.equal(item.costEb, 123); assert.equal(item.isEquipped, false);
    assert.equal(item.name, edited.name); assert.equal(item.notes, edited.notes);
    assert.deepEqual(item.damageProfiles, gun.damageProfiles); assert.equal(item.skillId, gun.skillId);
    assert.deepEqual(item.customPayload, gun.customPayload);
  }
  const plate = armor(), implant = graft();
  c = add(c, { kind: 'armor', item: plate });
  c = add(c, { kind: 'cyberware', item: implant });
  assert.equal(c.cashEb, 9754 - plate.costEb - implant.costEb);
  assert.equal(c.spareArmor[0].spMax, plate.spMax); assert.equal(c.spareArmor[0].spCurrent, plate.spMax);
  assert.equal(c.cyberware[0].catalogId, implant.id); assert.deepEqual(c.cyberware[0].installRule, implant.installRule);
  assert.equal(c.cyberware[0].isInstalled, false); assert.equal(c.gear.length, 0);
  assert.deepEqual(original, snapshot); assert.ok(isCharacter(c));
});

test('adding owned equipment is free; invalid purchases leave cash and all collections unchanged', () => {
  const c = fresh(), equipment = { kind: 'weapon', item: weapon() }, itemDraft = draft(equipment), snapshot = structuredClone(c);
  assert.equal(backpack.addEquipmentToBackpack(c, equipment, itemDraft, 1, false).character.cashEb, c.cashEb);
  for (const quantity of [0, -1, 1.5, 1000, NaN]) {
    assert.deepEqual(backpack.addEquipmentToBackpack(c, equipment, itemDraft, quantity, true), { error: 'quantity' });
  }
  for (const costEb of [-1, NaN, Infinity]) {
    assert.deepEqual(backpack.addEquipmentToBackpack(c, equipment, { ...itemDraft, costEb }, 1, true), { error: 'price' });
  }
  assert.equal(backpack.addEquipmentToBackpack(c, equipment, { ...itemDraft, name: '  ' }, 1, true).error, 'name');
  assert.equal(backpack.addEquipmentToBackpack({ ...c, cashEb: 0 }, equipment, itemDraft, 1, true).error, 'funds');
  assert.deepEqual(c, snapshot);
});

test('backpack armor and cyberware remain inactive and cannot change protection, stats or Humanity', () => {
  const c = { ...fresh(), automaticCyberwareEffects: true };
  c.armor.body.spCurrent = 0;
  const before = { ref: rules.effectiveStat(c, 'REF'), body: rules.effectiveStat(c, 'BODY'), sp: rules.effectiveSP(c, 'body'), humanity: calculateHumanityStats(c), current: c.humanityCurrent };
  let next = add(c, { kind: 'armor', item: armor() });
  next = add(next, { kind: 'cyberware', item: graft() });
  next = add(next, { kind: 'cyberware', item: structuredClone(DATAPOOL_CYBERWARE.find(item => item.id === 'cat-cyber-91')) });
  assert.equal(rules.effectiveStat(next, 'REF'), before.ref); assert.equal(rules.effectiveStat(next, 'BODY'), before.body);
  assert.equal(rules.effectiveSP(next, 'body'), before.sp); assert.equal(next.humanityCurrent, before.current);
  assert.deepEqual(calculateHumanityStats(next), before.humanity);
  assert.equal(backpack.backpackCyberware(next).length, 2); assert.equal(next.weapons.length, 0);
});

test('ready and stow preserve live weapon magazines, profiles and custom fields without touching linked cyberweapons', () => {
  let c = add(fresh(), { kind: 'weapon', item: weapon() });
  const id = c.weapons[0].id;
  c.weapons[0] = { ...c.weapons[0], currentAmmo: 7, selectedProfile: 1, profileAmmo: { '["Дробовик",3]': 2 }, custom: { zero: 0, false: false } };
  const snapshot = structuredClone(c.weapons[0]), original = structuredClone(c);
  c = backpack.setWeaponEquipped(c, id, true);
  assert.deepEqual(c.weapons[0], { ...snapshot, isEquipped: true });
  c = backpack.setWeaponEquipped(c, id, false);
  assert.deepEqual(c.weapons[0], snapshot); assert.equal(original.weapons[0].isEquipped, false);
  assert.equal(c.weapons[0].currentAmmo, 7); assert.equal(rules.selectedWeaponProfile(c.weapons[0]).currentAmmo, 2);
  const linked = { ...snapshot, id: 'linked', sourceCyberwareId: 'implant', isEquipped: true };
  c.weapons.push(linked);
  assert.deepEqual(backpack.setWeaponEquipped(c, 'linked', false).weapons.at(-1), linked);
});

test('armor swaps and stowing preserve both ablated suits and the shield instead of resetting SP', () => {
  let c = fresh();
  c.armor.body = { ...c.armor.body, spCurrent: 4, unknown: { keep: true }, catalogId: 'old-armor', costEb: 100 };
  const previous = structuredClone(c.armor.body), spare = { ...armor(), id: 'spare-suit', spCurrent: 6, extra: [0, false, null] };
  c.spareArmor = [spare]; const original = structuredClone(c);
  c = backpack.equipBackpackArmor(c, spare.id, 'en');
  assert.deepEqual(c.armor.body, spare); assert.deepEqual(c.spareArmor, [previous]);
  c = backpack.stowArmor(c, 'body', 'en');
  assert.equal(c.armor.body.spCurrent, 0); assert.equal(c.armor.body.penalty, 0);
  assert.deepEqual(c.spareArmor, [previous, spare]); assert.equal(rules.armorPenalty(c), c.armor.head.penalty);
  const shield = { id: 'shield', name: 'Used shield', location: 'shield', spMax: 10, spCurrent: 3, penalty: 0, sourceUrl: 'https://example.com/shield' };
  c.spareArmor.push(shield); c = backpack.equipBackpackArmor(c, shield.id, 'en');
  assert.deepEqual(c.armor.shield, shield); c = backpack.stowArmor(c, 'shield', 'en');
  assert.equal(c.armor.shield, undefined); assert.deepEqual(c.spareArmor.at(-1), shield);
  assert.ok(isCharacter(c)); assert.deepEqual(original.armor.body, previous); assert.deepEqual(original.spareArmor, [spare]);
});

test('import rejects malformed optional weapon inventory fields while accepting zero price and legacy absence', () => {
  const c = fresh(); c.weapons = [weapon()]; assert.ok(isCharacter(c));
  for (const patch of [{ isEquipped: 'false' }, { isEquipped: 0 }, { catalogId: {} }, { costEb: -1 }, { costEb: '0' }, { consumable: 1 }]) {
    assert.equal(storage.parseImportedJson(JSON.stringify({ ...c, weapons: [{ ...c.weapons[0], ...patch }] })), null, JSON.stringify(patch));
  }
  assert.ok(isCharacter({ ...c, weapons: [{ ...c.weapons[0], isEquipped: false, catalogId: '', costEb: 0, consumable: true }] }));
  assert.equal(isCharacter({ ...c, weapons: [{ ...c.weapons[0], costEb: Infinity }] }), false);
});

test('all armor records require complete shapes and unique nonempty IDs across ready and spare armor', () => {
  const c = fresh(), spare = { ...armor(), id: 'spare' }; c.spareArmor = [spare]; assert.ok(isCharacter(c));
  const invalid = [null, {}, { ...spare, id: '' }, { ...spare, id: '  ' }, { ...spare, location: 'legs' },
    { ...spare, spCurrent: '3' }, { ...spare, penalty: null }, { ...spare, sourceUrl: {} }, { ...spare, catalogId: 1 }, { ...spare, costEb: -1 }];
  for (const item of invalid) assert.equal(storage.parseImportedJson(JSON.stringify({ ...c, spareArmor: [item] })), null);
  assert.equal(storage.parseImportedJson(JSON.stringify({ ...c, spareArmor: {} })), null);
  for (const duplicateId of [c.armor.head.id, c.armor.body.id, spare.id]) {
    assert.equal(isCharacter({ ...c, spareArmor: [spare, { ...spare, id: duplicateId }] }), false);
  }
  assert.equal(isCharacter({ ...c, armor: { ...c.armor, shield: { ...spare, location: 'shield', id: c.armor.head.id } } }), false);
  for (const patch of [{ sourceUrl: false }, { catalogId: [] }, { costEb: -1 }, { id: '' }]) {
    assert.equal(isCharacter({ ...c, armor: { ...c.armor, body: { ...c.armor.body, ...patch } } }), false);
  }
  // Finite manually edited SP/penalty values were accepted before backpack support.
  assert.ok(isCharacter({ ...c, spareArmor: [{ ...spare, spMax: -1.5, spCurrent: 99.25, penalty: 2.5, costEb: 0 }] }));
  assert.ok(isCharacter({ ...c, armor: { ...c.armor, head: { ...c.armor.head, spCurrent: -2.5 } } }));
});

test('optional owned cyberware prices validate without changing legacy price-free records', () => {
  const c = fresh(); c.cyberware = [{ ...graft(), isInstalled: false }];
  assert.ok(isCharacter(c)); assert.ok(isCharacter({ ...c, cyberware: [{ ...c.cyberware[0], costEb: 0 }] }));
  const legacy = structuredClone(c); delete legacy.cyberware[0].costEb; assert.ok(isCharacter(legacy));
  for (const costEb of [-1, '100', null]) {
    assert.equal(storage.parseImportedJson(JSON.stringify({ ...c, cyberware: [{ ...c.cyberware[0], costEb }] })), null);
  }
});

test('save and load retain mixed backpack equipment, live SP/ammo, unknown values and inactive cyberware', () => {
  let c = add(fresh(), { kind: 'weapon', item: weapon() });
  c = add(c, { kind: 'armor', item: armor() }); c = add(c, { kind: 'cyberware', item: graft() });
  c.weapons[0] = { ...c.weapons[0], currentAmmo: 2, selectedProfile: 2, profileAmmo: { '["Дробовик",3]': 1 }, custom: { false: false, zero: 0, null: null } };
  c.spareArmor[0] = { ...c.spareArmor[0], spCurrent: 5, custom: [false, 0, null] };
  c.cyberware[0] = { ...c.cyberware[0], custom: { keep: true } };
  const persisted = JSON.parse(JSON.stringify(c));
  assert.equal(storage.saveCharactersToStorage([c]), true);
  const restored = storage.loadStoredCharacters()[0];
  assert.deepEqual(restored.weapons, persisted.weapons); assert.deepEqual(restored.spareArmor, persisted.spareArmor); assert.deepEqual(restored.cyberware, persisted.cyberware);
  assert.equal(restored.weapons[0].isEquipped, false); assert.equal(restored.cyberware[0].isInstalled, false);
  assert.deepEqual(storage.parseImportedJson(JSON.stringify(restored)), restored);
});
