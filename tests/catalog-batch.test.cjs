const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { load, mount, nodes, label, button } = require('./helpers.cjs');
const { createEmptyCharacter } = load('src/data/initialData.ts');
const { DATAPOOL_CYBERWARE, DATAPOOL_ARMORS } = load('src/data/datapoolCatalog.ts');
const { DATAPOOL_ALL_VEHICLES, DATAPOOL_VEHICLE_UPGRADES } = load('src/data/datapoolVehicles.ts');
const { vehicleFromCatalog } = load('src/utils/vehicles.ts');
const { CyberwareSection } = load('src/components/CyberwareSection.tsx');
const { CyberwareCatalogBrowser } = load('src/components/CyberwareCatalogBrowser.tsx');
const { CyberwareInstallModal } = load('src/components/CyberwareInstallModal.tsx');
const { NetrunnerSection } = load('src/components/NetrunnerSection.tsx');
const { WeaponsSection } = load('src/components/WeaponsSection.tsx');
const { VehiclesSection } = load('src/components/VehiclesSection.tsx');
const { DataPoolShopModal } = load('src/components/DataPoolShopModal.tsx');

const noop = () => {};
const fresh = () => {
  const c = createEmptyCharacter('Batch catalogs');
  return { ...c, stats: { ...c.stats, EMP: 8 }, cyberware: [], weapons: [], programs: [], vehicles: [], cashEb: 100000, humanityCurrent: 80 };
};
const chrome = number => DATAPOOL_CYBERWARE.find(item => item.id === `cat-cyber-${number}`);
function exactButton(tree, text) {
  const result = nodes(tree, node => node.type === 'button' && label(node).trim() === text)[0];
  assert.ok(result, `Exact button missing: ${text}`);
  return result;
}
function selectOffering(tree, value) {
  const select = nodes(tree, node => node.type === 'select' && nodes(node, child => child.type === 'option' && child.props.value === value).length > 0)[0];
  assert.ok(select, `Selection missing: ${value}`);
  select.props.onChange({ target: { value } });
}
const browser = view => nodes(view.render(), node => node.type === CyberwareCatalogBrowser)[0];
function receipt(tree, count) {
  const status = nodes(tree, node => node.props.role === 'status')[0];
  assert.ok(status, 'Visible add receipt');
  assert.match(label(status), new RegExp(`Total this session\\s*:\\s*${count}\\b`));
  return label(status);
}

beforeEach(() => { global.alert = noop; });

test('cyberware catalog adds two distinct selections cumulatively without closing or installing either', () => {
  let updated, updates = 0;
  const view = mount(CyberwareSection, { character: fresh(), lang: 'en', onUpdateCharacter: c => { updated = c; updates++; } });
  button(view.render(), 'Install Cyberware').props.onClick();
  browser(view).props.onSelect(chrome(12));
  exactButton(view.render(), 'Add to inventory').props.onClick();
  assert.equal(updates, 1); assert.equal(updated.cyberware[0].catalogId, chrome(12).id); assert.equal(updated.humanityCurrent, 80);
  view.props.character = updated;
  assert.equal(browser(view).props.selectedId, chrome(12).id); receipt(view.render(), 1);
  browser(view).props.onSelect(chrome(31));
  exactButton(view.render(), 'Add to inventory').props.onClick();
  view.props.character = updated;
  assert.equal(updates, 2); assert.deepEqual(updated.cyberware.map(item => item.catalogId), [chrome(12).id, chrome(31).id]);
  assert.equal(new Set(updated.cyberware.map(item => item.id)).size, 2);
  assert.ok(updated.cyberware.every(item => item.isInstalled === false)); assert.equal(updated.humanityCurrent, 80);
  assert.equal(browser(view).props.selectedId, chrome(31).id); assert.match(receipt(view.render(), 2), /Киберглаз/);
  assert.equal(nodes(view.render(), node => node.type === CyberwareInstallModal).length, 0);
});

test('confirming or cancelling installation returns to the still-selected cyberware catalog and charges HL only on confirmation', () => {
  let updated;
  const view = mount(CyberwareSection, { character: fresh(), lang: 'en', onUpdateCharacter: c => updated = c });
  button(view.render(), 'Install Cyberware').props.onClick();
  browser(view).props.onSelect(chrome(63)); exactButton(view.render(), 'Add and choose slots').props.onClick();
  assert.equal(updated.humanityCurrent, 80); view.props.character = updated;
  assert.equal(browser(view).props.selectedId, chrome(63).id);
  let installation = nodes(view.render(), node => node.type === CyberwareInstallModal)[0]; assert.ok(installation);
  const installer = mount(CyberwareInstallModal, installation.props);
  assert.equal(button(installer.render(), 'Confirm installation').props.disabled, false);
  button(installer.render(), 'Confirm installation').props.onClick(); view.props.character = updated;
  assert.equal(updated.humanityCurrent, 80 - chrome(63).humanityCost); assert.equal(updated.cyberware[0].isInstalled, true);
  assert.equal(nodes(view.render(), node => node.type === CyberwareInstallModal).length, 0);
  assert.equal(browser(view).props.selectedId, chrome(63).id); receipt(view.render(), 1);

  browser(view).props.onSelect(chrome(68)); exactButton(view.render(), 'Add and choose slots').props.onClick(); view.props.character = updated;
  installation = nodes(view.render(), node => node.type === CyberwareInstallModal)[0]; assert.ok(installation);
  const secondInstaller = mount(CyberwareInstallModal, installation.props), before = structuredClone(updated);
  button(secondInstaller.render(), 'Cancel').props.onClick();
  assert.deepEqual(updated, before); assert.equal(updated.cyberware.at(-1).isInstalled, false);
  assert.equal(nodes(view.render(), node => node.type === CyberwareInstallModal).length, 0);
  assert.equal(browser(view).props.selectedId, chrome(68).id); receipt(view.render(), 2);
});

test('program modal cumulatively adds different programs and refuses a third at capacity without losing selections or receipts', () => {
  const c = fresh(); c.cyberdeck = { ...c.cyberdeck, isOwned: true, slotsMax: 2, hardwareSlotsUsed: 0 };
  let updated, updates = 0;
  const view = mount(NetrunnerSection, { character: c, lang: 'en', onUpdateCharacter: next => { updated = next; updates++; }, onRollInterfaceAction: noop, onRollProgramAttack: noop });
  button(view.render(), 'Add Program').props.onClick();
  selectOffering(view.render(), 'Sword'); exactButton(view.render(), 'Add').props.onClick(); view.props.character = updated;
  assert.equal(updated.programs[0].name, 'Sword'); receipt(view.render(), 1);
  selectOffering(view.render(), 'SeeYa'); exactButton(view.render(), 'Add').props.onClick(); view.props.character = updated;
  assert.deepEqual(updated.programs.map(item => item.name), ['Sword', 'SeeYa']);
  assert.equal(new Set(updated.programs.map(item => item.id)).size, 2); assert.ok(updated.programs.every(item => item.isInstalled));
  receipt(view.render(), 2); assert.ok(nodes(view.render(), node => node.type === 'input' && node.props.value === 'SeeYa').length);
  const snapshot = structuredClone(updated);
  selectOffering(view.render(), 'Armor'); exactButton(view.render(), 'Add').props.onClick();
  assert.equal(updates, 2); assert.deepEqual(updated, snapshot); assert.match(label(view.render()), /Not enough cyberdeck slots/);
  receipt(view.render(), 2); assert.ok(nodes(view.render(), node => node.type === 'input' && node.props.value === 'Armor').length);
  assert.ok(exactButton(view.render(), 'Close'));
});

test('manual weapon modal remains open for the next weapon and generates independent UUID identities', () => {
  let updated;
  const view = mount(WeaponsSection, { character: fresh(), lang: 'en', onUpdateCharacter: c => updated = c, onRollWeaponAttack: noop, onRollWeaponDamage: noop, onRollCustomCheck: noop, onRollCustomDamage: noop });
  button(view.render(), 'Add Weapon').props.onClick();
  const oldNow = Date.now; Date.now = () => 123;
  try {
    nodes(view.render(), node => node.type === 'input' && node.props.value === 'Heavy Pistol')[0].props.onChange({ target: { value: 'First custom pistol' } });
    exactButton(view.render(), 'Add').props.onClick(); view.props.character = updated;
    assert.ok(nodes(view.render(), node => node.type === 'input' && node.props.value === 'First custom pistol').length); receipt(view.render(), 1);
    nodes(view.render(), node => node.type === 'input' && node.props.value === 'First custom pistol')[0].props.onChange({ target: { value: 'Second custom pistol' } });
    exactButton(view.render(), 'Add').props.onClick(); view.props.character = updated;
  } finally { Date.now = oldNow; }
  assert.deepEqual(updated.weapons.map(item => item.name), ['First custom pistol', 'Second custom pistol']);
  assert.equal(new Set(updated.weapons.map(item => item.id)).size, 2);
  for (const item of updated.weapons) assert.match(item.id, /^weap-[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
  assert.ok(nodes(view.render(), node => node.type === 'input' && node.props.value === 'Second custom pistol').length); receipt(view.render(), 2);
  assert.ok(exactButton(view.render(), 'Close'));
});

test('vehicle upgrade selector keeps its target and receipt while installing two different upgrades', () => {
  const c = fresh(), vehicle = vehicleFromCatalog(DATAPOOL_ALL_VEHICLES.find(item => item.id === 'veh-ground-1'), 'en');
  vehicle.id = 'batch-vehicle'; vehicle.upgrades = ['Existing custom work']; vehicle.sdpCurrent = 9; c.vehicles = [vehicle];
  let updated;
  const view = mount(VehiclesSection, { character: c, lang: 'en', onUpdateCharacter: next => updated = next, onRollCustomCheck: noop, onRollCustomDamage: noop });
  button(view.render(), 'Install Upgrade').props.onClick();
  const dialog = () => nodes(view.render(), node => node.props.role === 'dialog' && node.props['aria-label'] === 'Vehicle upgrades')[0];
  const one = DATAPOOL_VEHICLE_UPGRADES[0], two = DATAPOOL_VEHICLE_UPGRADES.find(item => item.nameEn !== one.nameEn);
  assert.ok(two); selectOffering(dialog(), one.id); exactButton(dialog(), 'Install').props.onClick(); view.props.character = updated;
  assert.ok(dialog()); assert.equal(nodes(dialog(), node => node.type === 'select')[0].props.value, one.id); receipt(dialog(), 1);
  selectOffering(dialog(), two.id); exactButton(dialog(), 'Install').props.onClick(); view.props.character = updated;
  assert.deepEqual(updated.vehicles[0].upgrades, ['Existing custom work', one.nameEn, two.nameEn]); assert.equal(updated.vehicles[0].sdpCurrent, 9);
  assert.equal(updated.cashEb, c.cashEb); assert.ok(dialog()); assert.equal(nodes(dialog(), node => node.type === 'select')[0].props.value, two.id);
  assert.ok(receipt(dialog(), 2).includes(two.nameEn));
});

test('global armor purchase stores the old ablated suit and all its metadata in spare armor', () => {
  const c = fresh(); c.armor.body = { ...c.armor.body, name: 'Battle-worn custom suit', spCurrent: 4, catalogId: 'old-model', costEb: 250, sourceUrl: 'https://example.com/old', notes: 'Keep my modifications', extension: { enabled: false, zero: 0, nested: [null] } };
  const previous = structuredClone(c.armor.body), snapshot = structuredClone(c), item = DATAPOOL_ARMORS.find(entry => entry.id === 'cat-armor-3');
  let updated;
  const view = mount(DataPoolShopModal, { character: c, lang: 'en', isOpen: true, initialCategory: 'armor', onUpdateCharacter: next => updated = next, onClose: noop });
  nodes(view.render(), node => node.type === 'input' && node.props.placeholder === 'Search items...')[0].props.onChange({ target: { value: item.name } });
  const card = nodes(view.render(), node => node.type === 'div'
    && nodes(node, child => child.type === 'span' && label(child).trim() === item.name).length === 1
    && nodes(node, child => child.type === 'button' && label(child).trim() === 'Buy').length === 1)[0];
  assert.ok(card, 'Matching armor shop card'); exactButton(card, 'Buy').props.onClick();
  assert.deepEqual(updated.spareArmor, [previous]); assert.equal(updated.armor.body.catalogId, item.id);
  assert.equal(updated.armor.body.spCurrent, item.spMax); assert.equal(updated.cashEb, c.cashEb - item.costEb);
  assert.notEqual(updated.armor.body.id, previous.id); assert.deepEqual(c, snapshot);
});
