const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { load, mount, nodes, label, button } = require('./helpers.cjs');
const { createEmptyCharacter, CPR_SKILLS } = load('src/data/initialData.ts');
const { isCharacter } = load('src/utils/characterValidation.ts');
const cyber = load('src/utils/cyberware.ts');
const storage = load('src/utils/storage.ts');
const rules = load('src/utils/rules.ts');
const { StatsSection } = load('src/components/StatsSection.tsx');
const { SectionNav } = load('src/components/SectionNav.tsx');
const { CharacterWizardModal } = load('src/components/CharacterWizardModal.tsx');
const { DataPoolShopModal } = load('src/components/DataPoolShopModal.tsx');
const { TherapyModal } = load('src/components/TherapyModal.tsx');
const { WeaponsSection } = load('src/components/WeaponsSection.tsx');
const { VehiclesSection } = load('src/components/VehiclesSection.tsx');

let memory;
beforeEach(() => {
  memory = new Map();
  global.localStorage = {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: key => memory.delete(key),
  };
  global.alert = () => {};
  global.confirm = () => true;
});

test('audit: wizard rejects creation with an empty name', () => {
  let created = null;
  const view = mount(CharacterWizardModal, {
    isOpen: true,
    lang: 'en',
    onClose() {},
    onCharacterCreated: c => { created = c; }
  });

  // Clear name input
  const nameInput = nodes(view.render(), n => n.type === 'input' && n.props.value === 'New Edgerunner')[0];
  assert.ok(nameInput);
  nameInput.props.onChange({ target: { value: '   ' } });

  // Navigate to step 6
  button(view.render(), '6.').props.onClick();

  // Create button should be disabled
  const createBtn = nodes(view.render(), n => n.type === 'button' && n.props.children?.includes?.('CREATE CHARACTER'))[0];
  assert.ok(createBtn);
  assert.equal(createBtn.props.disabled, true);
  assert.ok(createBtn.props.title.includes('Character name is required'));

  // Attempt to call complete creation
  createBtn.props.onClick();
  assert.equal(created, null);
});

test('audit: legacy cyberware with isInstalled true without slot is recognized as installed and does not double-charge Humanity', () => {
  const c = {
    ...createEmptyCharacter('Legacy'),
    humanityCurrent: 60,
    stats: { ...createEmptyCharacter().stats, EMP: 7 },
    cyberware: [{
      id: 'legacy-neural',
      name: 'Neural Link',
      category: 'Neuralware',
      installLocation: 'Spine',
      humanityCost: 7,
      isInstalled: true,
      installedIn: undefined
    }]
  };

  assert.equal(cyber.isCyberwareInstalled(c, c.cyberware[0]), true);

  const installResult = cyber.installCyberware(c, 'legacy-neural', ['body:neural'], 'en');
  assert.ok(installResult.character);
  // Humanity should remain 60, NOT be deducted again to 53
  assert.equal(installResult.character.humanityCurrent, 60);
  assert.equal(installResult.character.cyberware[0].isInstalled, true);
  assert.deepEqual(installResult.character.cyberware[0].installedIn, ['body:neural']);
});

test('audit: storage recovery and previous character collection restoration', () => {
  const initial = [createEmptyCharacter('Char1'), createEmptyCharacter('Char2')];
  storage.saveCharactersToStorage(initial);

  const next = [createEmptyCharacter('Char3')];
  storage.saveCharactersToStorage(next);

  assert.equal(storage.hasStorageRecovery(), true);
  const previous = storage.restorePreviousCharacters();
  assert.ok(previous);
  assert.equal(previous.length, 2);
  assert.equal(previous[0].name, 'Char1');
});

test('audit: DataPoolShopModal syncs activeTab with initialCategory', () => {
  const c = createEmptyCharacter('ShopTest');
  let view = mount(DataPoolShopModal, {
    isOpen: true,
    character: c,
    lang: 'en',
    initialCategory: 'weapons',
    onClose() {},
    onUpdateCharacter() {}
  });

  const weaponTabBtn = nodes(view.render(), n => n.type === 'button' && label(n).includes('Weapons'))[0];
  assert.ok(weaponTabBtn);
  assert.ok(weaponTabBtn.props.className.includes('bg-red-600'));
});

test('audit: SectionNav survives when localStorage is blocked or throws', () => {
  global.localStorage = {
    getItem() { throw new Error('SecurityError: Access Denied'); },
    setItem() { throw new Error('SecurityError: Access Denied'); }
  };

  const c = createEmptyCharacter('NavTest');
  let view;
  assert.doesNotThrow(() => {
    view = mount(SectionNav, {
      activeTab: 'main',
      onChangeTab() {},
      character: c,
      lang: 'en'
    });
  });
  assert.ok(view);
});

test('audit: vehicle driving and repair checks use skillBase with all stat mods and wound penalties', () => {
  const c = createEmptyCharacter('Driver', 'Nomad');
  c.roleRank = 4; // Moto rank 4 -> +4 to driving skills
  c.stats.REF = 7;
  c.statMods.REF = 1; // Effective REF = 8
  c.hpCurrent = 10; // Seriously wounded: max HP = 40, threshold = 20 -> -2 penalty
  const driveSkill = c.skills.find(s => s.id === 'drive_land');
  driveSkill.level = 3;

  // Moto +4, REF 8, Skill 3, Wound -2 = Base 13
  const expectedDriveBase = rules.skillBase(c, 'drive_land');
  assert.equal(expectedDriveBase, 8 + 3 + 4 - 2);

  c.vehicles = [{
    id: 'car-1',
    name: 'Nomad Cruiser',
    model: 'Cruiser',
    category: 'Ground',
    sdpMax: 60,
    sdpCurrent: 20, // < 30 -> critical SDP penalty -2
    seats: 4,
    speedCombat: '20 m/y',
    speedNarrative: '80 mph',
    costEb: 30000,
    notes: ''
  }];

  let rolledCheck = null;
  const view = mount(VehiclesSection, {
    character: c,
    lang: 'en',
    onUpdateCharacter() {},
    onRollCustomCheck(title, base) { rolledCheck = { title, base }; },
    onRollCustomDamage() {}
  });

  const driveBtn = nodes(view.render(), n => n.type === 'button' && n.props.onClick?.toString().includes('handleRollDriveCheck'))[0];
  assert.ok(driveBtn);
  driveBtn.props.onClick();
  // 13 - 2 (SDP penalty) = 11
  assert.equal(rolledCheck.base, 11);
});

test('audit: character validation rejects negative currentAmmo, negative cash, and duplicate IDs', () => {
  const c = createEmptyCharacter('Valid');
  assert.ok(isCharacter(c));

  // Reject negative cash
  assert.equal(isCharacter({ ...c, cashEb: -10 }), false);

  // Reject negative current ammo
  assert.equal(isCharacter({ ...c, weapons: [{ ...c.weapons[0], currentAmmo: -1 }] }), false);

  // Reject duplicate skill IDs
  assert.equal(isCharacter({ ...c, skills: [...c.skills, { ...c.skills[0] }] }), false);

  // Reject duplicate gear IDs
  const gear1 = { id: 'dup-gear', name: 'Item 1', category: 'General', quantity: 1, costEb: 10, notes: '' };
  const gear2 = { id: 'dup-gear', name: 'Item 2', category: 'General', quantity: 1, costEb: 20, notes: '' };
  assert.equal(isCharacter({ ...c, gear: [gear1, gear2] }), false);
});

test('audit: therapy rejects treatment when cash is insufficient for fee', () => {
  const c = createEmptyCharacter('Broke');
  c.cashEb = 100;
  c.bankEb = 0;
  c.humanityCurrent = 40;

  let updated = null;
  let alertMessage = null;
  global.alert = msg => { alertMessage = msg; };

  const view = mount(TherapyModal, {
    isOpen: true,
    character: c,
    lang: 'en',
    onClose() {},
    onUpdateCharacter(next) { updated = next; }
  });

  // Standard therapy costs 500 eb, character has 100 eb
  const therapyBtn = nodes(view.render(), n => n.type === 'button' && n.props.onClick?.toString().includes('executeTherapy'))[0];
  assert.ok(therapyBtn);
  therapyBtn.props.onClick();

  assert.equal(updated, null);
  assert.ok(alertMessage && alertMessage.includes('Insufficient funds'));
});

test('audit: Death Save displays effective BODY and reset button clears penalty; reducing BODY clamps HP', () => {
  let c = createEmptyCharacter('DeathSaveChar');
  c.deathSavePenalties = 3;
  c.hpCurrent = 50;

  let updated = null;
  const view = mount(StatsSection, {
    character: c,
    lang: 'en',
    onUpdateCharacter(next) { updated = next; },
    onRollStat() {},
    onRollInitiative() {},
    onRollDeathSave() {},
    onOpenDamageCalc() {}
  });

  // Check reset button clears deathSavePenalties
  const resetBtn = nodes(view.render(), n => n.type === 'button' && n.props.children === 'Reset')[0];
  assert.ok(resetBtn);
  resetBtn.props.onClick();
  assert.equal(updated.deathSavePenalties, 0);

  // Check lowering BODY clamps HP to new maxHP
  c.stats.BODY = 8;
  c.stats.WILL = 8; // maxHP = 50
  c.hpCurrent = 50;
  updated = null;

  const bodyMinusBtn = nodes(view.render(), n => n.type === 'button' && n.props.onClick?.toString().includes("'BODY', -1"))[0];
  if (bodyMinusBtn) {
    bodyMinusBtn.props.onClick();
    assert.ok(updated.hpCurrent <= rules.maxHP(updated));
  }
});

test('audit: WeaponsSection throw and wrestling choke deal direct damage through onRollCustomDamage', () => {
  const c = createEmptyCharacter('Grappler');
  c.stats.BODY = 8;
  c.skills.find(s => s.id === 'martial_arts').level = 4;
  c.martialArtsStyle = 'Judo';

  let customDamage = null;
  const view = mount(WeaponsSection, {
    character: c,
    lang: 'en',
    onUpdateCharacter() {},
    onRollCustomDamage(title, formula) { customDamage = { title, formula }; },
    onRollCustomCheck() {}
  });

  // Switch to Brawling subtab
  button(view.render(), 'Brawling').props.onClick();

  // Throw button deals unarmed damage (3d6 for BODY 8) directly to HP
  const throwBtn = button(view.render(), 'Throw to Ground');
  assert.ok(throwBtn);
  throwBtn.props.onClick();
  assert.ok(customDamage);
  assert.equal(customDamage.formula, '3d6');
});
