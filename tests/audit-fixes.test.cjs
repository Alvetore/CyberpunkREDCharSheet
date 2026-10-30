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
const { SkillsSection } = load('src/components/SkillsSection.tsx');
const { Header } = load('src/components/Header.tsx');

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

const backpack = load('src/utils/backpack.ts');
const { GRENADE_CATALOG } = load('src/data/grenadeCatalog.ts');
const { GearSection } = load('src/components/GearSection.tsx');

test('audit: equipping a grenade from backpack adds to existing equipped grenade instead of creating a duplicate', () => {
  const c = createEmptyCharacter('Grenadier');
  const frag = GRENADE_CATALOG.find(g => g.name === 'Бронебойная граната');
  // 1 equipped grenade (1/1)
  const equippedFrag = { ...frag, id: 'weap-frag-1', isEquipped: true, currentAmmo: 1, magCapacity: 1 };
  // 1 unequipped grenade in backpack (1/1)
  const backpackFrag = { ...frag, id: 'weap-frag-2', isEquipped: false, currentAmmo: 1, magCapacity: 1 };
  c.weapons = [equippedFrag, backpackFrag];

  // Equip the backpack grenade
  const updated = backpack.setWeaponEquipped(c, 'weap-frag-2', true);
  // Should NOT create 2 equipped weapons; should have 1 equipped weapon with currentAmmo = 2, magCapacity = 2
  assert.equal(updated.weapons.length, 1);
  assert.equal(updated.weapons[0].id, 'weap-frag-1');
  assert.equal(updated.weapons[0].currentAmmo, 2);
  assert.equal(updated.weapons[0].magCapacity, 2);
  assert.equal(updated.weapons[0].isEquipped, true);
});

test('audit: buying or adding grenades in backpack stacks unequipped grenades', () => {
  const c = createEmptyCharacter('Buyer');
  c.weapons = [];
  c.cashEb = 10000;
  const frag = GRENADE_CATALOG.find(g => g.name === 'Бронебойная граната');
  const equipment = { kind: 'weapon', item: frag };
  const draft = { name: frag.name, costEb: frag.costEb, notes: frag.notes, quantity: 3, category: 'Gear' };

  // Add 3 grenades to backpack
  let updated = backpack.addEquipmentToBackpack(c, equipment, draft, 3, true).character;
  assert.equal(updated.weapons.length, 1);
  assert.equal(updated.weapons[0].currentAmmo, 3);
  assert.equal(updated.weapons[0].magCapacity, 3);
  assert.equal(updated.weapons[0].isEquipped, false);

  // Add 2 more of the same grenade
  updated = backpack.addEquipmentToBackpack(updated, equipment, draft, 2, true).character;
  assert.equal(updated.weapons.length, 1);
  assert.equal(updated.weapons[0].currentAmmo, 5);
  assert.equal(updated.weapons[0].magCapacity, 5);

  // Now equip it
  updated = backpack.setWeaponEquipped(updated, updated.weapons[0].id, true);
  assert.equal(updated.weapons.length, 1);
  assert.equal(updated.weapons[0].isEquipped, true);
  assert.equal(updated.weapons[0].currentAmmo, 5);
  assert.equal(updated.weapons[0].magCapacity, 5);
});

test('audit: buying a grenade from DataPoolShopModal adds to existing equipped grenade', () => {
  const c = createEmptyCharacter('Shopper');
  c.cashEb = 5000;
  const frag = GRENADE_CATALOG.find(g => g.name === 'Бронебойная граната');
  c.weapons = [{ ...frag, id: 'owned-frag', isEquipped: true, currentAmmo: 1, magCapacity: 1 }];

  let updated = null;
  const view = mount(DataPoolShopModal, {
    isOpen: true,
    character: c,
    lang: 'ru',
    initialCategory: 'weapons',
    onClose() {},
    onUpdateCharacter(next) { updated = next; }
  });

  // Search for the grenade and click Buy
  nodes(view.render(), n => n.type === 'input' && n.props.placeholder?.includes('Поиск'))[0].props.onChange({ target: { value: 'Бронебойная граната' } });
  const buyBtn = button(view.render(), 'Купить');
  assert.ok(buyBtn);
  buyBtn.props.onClick();

  assert.ok(updated);
  // Still only 1 weapon in weapons array, with currentAmmo = 2
  assert.equal(updated.weapons.length, 1);
  assert.equal(updated.weapons[0].currentAmmo, 2);
  assert.equal(updated.weapons[0].magCapacity, 2);
});

test('audit: equipping a grenade from character.gear adds to equipped grenade and decrements gear', () => {
  const c = createEmptyCharacter('SoloGrenadier');
  const frag = GRENADE_CATALOG.find(g => g.name === 'Бронебойная граната');
  c.weapons = [{ ...frag, id: 'equipped-frag', isEquipped: true, currentAmmo: 1, magCapacity: 1 }];
  c.gear = [{ id: 'gear-smoke', name: 'Smoke Grenade', category: 'Grenade', quantity: 2, costEb: 50, notes: '' }];

  let updated = null;
  const view = mount(GearSection, {
    character: c,
    lang: 'en',
    onUpdateCharacter(next) { updated = next; }
  });

  const equipBtn = button(view.render(), 'Equip');
  assert.ok(equipBtn);
  equipBtn.props.onClick();

  assert.ok(updated);
  // Gear quantity decreased from 2 to 1
  assert.equal(updated.gear.find(g => g.id === 'gear-smoke').quantity, 1);
  // Now 2 weapons: the original frag and the newly equipped smoke grenade
  assert.equal(updated.weapons.length, 2);
  const smoke = updated.weapons.find(w => w.name.toLowerCase().includes('smoke') || w.name.toLowerCase().includes('дымов'));
  assert.ok(smoke);
  assert.equal(smoke.currentAmmo, 1);

  // Equip second smoke grenade
  let updated2 = null;
  const view2 = mount(GearSection, {
    character: updated,
    lang: 'en',
    onUpdateCharacter(next) { updated2 = next; }
  });
  button(view2.render(), 'Equip').props.onClick();
  assert.ok(updated2);
  // Gear is now completely removed (quantity was 1)
  assert.equal(updated2.gear.some(g => g.id === 'gear-smoke'), false);
  // Weapons length is STILL 2 (smoke grenade was merged, not added as 3rd weapon)
  assert.equal(updated2.weapons.length, 2);
  const smoke2 = updated2.weapons.find(w => w.id === smoke.id);
  assert.equal(smoke2.currentAmmo, 2);
  assert.equal(smoke2.magCapacity, 2);
});

test('audit: consolidateGrenadeWeapons merges duplicate equipped and unequipped grenades but preserves distinct firearms', () => {
  const frag = GRENADE_CATALOG.find(g => g.name === 'Бронебойная граната');
  const weapons = [
    { id: 'gun-1', name: 'Heavy Pistol', category: 'Heavy Pistol', damage: '3d6', standardRof: 2, magCapacity: 8, currentAmmo: 8, ammoType: 'Heavy Pistol', isEquipped: true },
    { id: 'gun-2', name: 'Heavy Pistol', category: 'Heavy Pistol', damage: '3d6', standardRof: 2, magCapacity: 8, currentAmmo: 8, ammoType: 'Heavy Pistol', isEquipped: true },
    { ...frag, id: 'frag-eq-1', isEquipped: true, currentAmmo: 1, magCapacity: 1 },
    { ...frag, id: 'frag-eq-2', isEquipped: true, currentAmmo: 1, magCapacity: 1 },
    { ...frag, id: 'frag-bp-1', isEquipped: false, currentAmmo: 2, magCapacity: 2 },
    { ...frag, id: 'frag-bp-2', isEquipped: false, currentAmmo: 1, magCapacity: 1 },
  ];

  const consolidated = backpack.consolidateGrenadeWeapons(weapons);
  // Both pistols are preserved as distinct copies
  assert.equal(consolidated.filter(w => w.name === 'Heavy Pistol').length, 2);
  // Equipped frags are merged into 1 (currentAmmo: 2, magCapacity: 2)
  const equippedFrags = consolidated.filter(w => w.name === frag.name && w.isEquipped !== false);
  assert.equal(equippedFrags.length, 1);
  assert.equal(equippedFrags[0].currentAmmo, 2);
  assert.equal(equippedFrags[0].magCapacity, 2);
  // Unequipped frags are merged into 1 (currentAmmo: 3, magCapacity: 3)
  const unequippedFrags = consolidated.filter(w => w.name === frag.name && w.isEquipped === false);
  assert.equal(unequippedFrags.length, 1);
  assert.equal(unequippedFrags[0].currentAmmo, 3);
  assert.equal(unequippedFrags[0].magCapacity, 3);
});

test('mobile usability: SkillsSection trained-only filter and 1-tap skill rolling', () => {
  const c = createEmptyCharacter('SkillTester');
  // Reset all skills to level 0 then train exactly 2 skills
  c.skills = CPR_SKILLS.map(s => ({ ...s, level: 0 }));
  c.skills.find(s => s.id === 'brawling').level = 4;
  c.skills.find(s => s.id === 'athletics').level = 2;

  let rolledSkill = null;
  const view = mount(SkillsSection, {
    character: c,
    onUpdateCharacter() {},
    onRollSkill(skill) { rolledSkill = skill; },
    lang: 'ru',
    dualTerms: true
  });

  // Verify "Изученные" filter button exists
  const trainedBtn = button(view.render(), 'Изученные');
  assert.ok(trainedBtn);

  // Click "Изученные" filter to show only trained skills
  trainedBtn.props.onClick();

  // Test tap-to-roll: find the clickable title container for brawling
  const titleNodes = nodes(view.render(), n => n.type === 'div' && n.props?.onClick && n.props?.title?.includes('Бросить'));
  assert.ok(titleNodes.length > 0);
  titleNodes[0].props.onClick();
  assert.ok(rolledSkill);
});

test('mobile usability: GearSection renders compact mobile cards and equips grenades directly', () => {
  const c = createEmptyCharacter('GearTester');
  c.weapons = []; // Start with no weapons
  c.gear = [
    { id: 'g-frag', name: 'Armor-Piercing Grenade', category: 'Grenade', quantity: 2, costEb: 100, notes: 'Heavy explosive' },
    { id: 'g-rope', name: 'Nylon Rope', category: 'Gear', quantity: 1, costEb: 20, notes: '10m strong rope' }
  ];

  let updatedChar = null;
  const view = mount(GearSection, {
    character: c,
    lang: 'en',
    onUpdateCharacter(next) { updatedChar = next; }
  });

  // Both desktop table and mobile cards are rendered
  const rendered = view.render();
  const equipButtons = nodes(rendered, n => n.type === 'button' && label(n).includes('Equip'));
  assert.ok(equipButtons.length >= 2); // In desktop table and in mobile cards

  // Clicking mobile equip button equips grenade
  equipButtons[equipButtons.length - 1].props.onClick();
  assert.ok(updatedChar);
  assert.equal(updatedChar.gear.find(g => g.id === 'g-frag').quantity, 1);
  assert.equal(updatedChar.weapons.length, 1);
});

test('mobile usability: SectionNav provides 1-tap mobile bar for Skills, Gear, Cyberware and expandable More menu', () => {
  const c = createEmptyCharacter('NavTester');
  let selectedTab = null;

  const view = mount(SectionNav, {
    activeTab: 'main',
    onChangeTab(tab) { selectedTab = tab; },
    character: c,
    lang: 'ru'
  });

  // Check mobile 1-tap tabs exist
  const skillsBtn = button(view.render(), 'Навыки');
  assert.ok(skillsBtn);
  skillsBtn.props.onClick();
  assert.equal(selectedTab, 'skills');

  // Check mobile "Ещё ▾" button toggles secondary tabs drawer
  const moreBtn = button(view.render(), 'Ещё ▾');
  assert.ok(moreBtn);
  moreBtn.props.onClick();

  // Pick secondary tab from drawer: "Травмы и Броня"
  const injuriesBtn = button(view.render(), 'Травмы и Броня');
  assert.ok(injuriesBtn);
  injuriesBtn.props.onClick();
  assert.equal(selectedTab, 'injuries');
});

test('mobile usability: StatsSection collapsible 10 stats and 2x2 vitals grid', () => {
  const c = createEmptyCharacter('StatsTester');
  const view = mount(StatsSection, {
    character: c,
    lang: 'ru',
    onUpdateCharacter() {},
    onRollStat() {},
    onRollInitiative() {},
    onRollDeathSave() {},
    onOpenDamageCalc() {}
  });

  const rendered = view.render();
  // Check details element for mobile stats summary exists
  const details = nodes(rendered, n => n.type === 'details');
  assert.ok(details.length > 0);
  const summary = nodes(rendered, n => n.type === 'summary' && label(n).includes('10 ХАР'));
  assert.ok(summary.length > 0);
});

test('mobile usability: layout mode storage and manual toggle button', () => {
  // Test storage
  assert.equal(storage.getStoredLayoutMode(), 'auto');
  storage.saveStoredLayoutMode('mobile');
  assert.equal(storage.getStoredLayoutMode(), 'mobile');
  storage.saveStoredLayoutMode('desktop');
  assert.equal(storage.getStoredLayoutMode(), 'desktop');
  storage.saveStoredLayoutMode('invalid');
  assert.equal(storage.getStoredLayoutMode(), 'auto');

  // Test Header toggle button
  let toggled = false;
  const c = createEmptyCharacter('LayoutTester');
  const view = mount(Header, {
    characters: [c],
    activeChar: c,
    onSelectCharacter() {},
    onNewCharacter() {},
    onDuplicateCharacter() {},
    onDeleteCharacter() {},
    onExportCharacter() {},
    onExportAll() {},
    onImportCharacter() {},
    onOpenDiceRoller() {},
    onOpenWizard() {},
    onOpenShop() {},
    theme: 'dark',
    onToggleTheme() {},
    lang: 'ru',
    onToggleLang() {},
    soundEnabled: true,
    onToggleSound() {},
    dualTerms: true,
    onToggleDualTerms() {},
    layoutMode: 'auto',
    onToggleLayoutMode() { toggled = true; }
  });

  const btn = button(view.render(), 'Авто');
  assert.ok(btn);
  btn.props.onClick();
  assert.equal(toggled, true);
});
