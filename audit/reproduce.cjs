// Read-only audit of the current application modules. No browser storage is used.
// Run: node audit/reproduce.cjs
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const ts = require('typescript');
const root = path.resolve(__dirname, '..');
const cache = new Map();
let current;
const react = {
  useState(initial) {
    const state = current, i = state.cursor++;
    if (!(i in state.values)) state.values[i] = typeof initial === 'function' ? initial() : initial;
    return [state.values[i], value => { state.values[i] = typeof value === 'function' ? value(state.values[i]) : value; }];
  },
  useEffect() {},
  useMemo(fn) { return fn(); },
  useRef(value) { return { current: value }; },
  useCallback(fn) { return fn; },
};
react.default = react;
const jsx = (type, props) => ({ type, props: props || {} });
const icons = new Proxy({}, { get: (_, key) => key === '__esModule' ? true : `icon:${String(key)}` });
const noop = () => {};
function load(relative) {
  let file = path.resolve(root, relative);
  if (!path.extname(file)) file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx';
  if (cache.has(file)) return cache.get(file).exports;
  const module = { exports: {} };
  cache.set(file, module);
  const source = fs.readFileSync(file, 'utf8');
  const output = ts.transpileModule(source, { compilerOptions: {
    target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.CommonJS,
    jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true,
  }, fileName: file }).outputText;
  const localRequire = name => {
    if (name === 'react') return react;
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
    if (name === 'lucide-react') return icons;
    if (name === 'canvas-confetti') return noop;
    if (name.includes('utils/audio') || name === './audio') return { sfx: new Proxy({}, { get: () => noop }) };
    if (name.startsWith('@tiptap') || name === 'tiptap-markdown') return {};
    if (name.startsWith('.')) return load(path.resolve(path.dirname(file), name));
    return require(name);
  };
  new Function('require', 'module', 'exports', output)(localRequire, module, module.exports);
  return module.exports;
}
function mount(Component, props) {
  const state = { values: [], cursor: 0 };
  return {
    props, state,
    render() { current = state; state.cursor = 0; return Component(this.props); },
  };
}
function nodes(tree, predicate) {
  const result = [];
  function walk(value) {
    if (!value || typeof value !== 'object') return;
    if (Array.isArray(value)) return value.forEach(walk);
    if (predicate(value)) result.push(value);
    walk(value.props?.children);
  }
  walk(tree);
  return result;
}
function label(tree) {
  if (tree == null || tree === false) return '';
  if (Array.isArray(tree)) return tree.map(label).join(' ');
  return typeof tree === 'object' ? label(tree.props?.children) : String(tree);
}
function button(tree, text) {
  const found = nodes(tree, n => n.type === 'button' && label(n).includes(text));
  assert.ok(found.length, `Button not found: ${text}`);
  return found[0];
}
function randomSequence(values, fn) {
  const previous = Math.random;
  let i = 0;
  Math.random = () => values[Math.min(i++, values.length - 1)];
  try { return fn(); } finally { Math.random = previous; }
}
const results = [];
function probe(id, fn) {
  try { results.push({ id, ...fn() }); }
  catch (error) { results.push({ id, harnessError: error.stack }); }
}
const { createEmptyCharacter, CPR_SKILLS, CPR_RANGE_DV_TABLE, PRESET_PROGRAMS } = load('src/data/initialData.ts');
const { CPR_ROLE_PACKAGES } = load('src/data/roleTemplates.ts');
const dice = load('src/utils/dice.ts');
const storage = load('src/utils/storage.ts');
const { calculateHumanityStats } = load('src/utils/roleUtils.ts');
const { getUnarmedDamage } = load('src/data/meleeRules.ts');
const catalog = load('src/data/datapoolCatalog.ts');
const { DamageCalculatorModal } = load('src/components/DamageCalculatorModal.tsx');
const { CharacterWizardModal } = load('src/components/CharacterWizardModal.tsx');
const { SkillsSection } = load('src/components/SkillsSection.tsx');
const { DiceRollerModal } = load('src/components/DiceRollerModal.tsx');
const { WeaponsSection } = load('src/components/WeaponsSection.tsx');
const { TherapyModal } = load('src/components/TherapyModal.tsx');
const { App } = load('src/App.tsx');
const { StatsSection } = load('src/components/StatsSection.tsx');
const { Header } = load('src/components/Header.tsx');
const { NetrunnerSection } = load('src/components/NetrunnerSection.tsx');
const { CyberwareSection } = load('src/components/CyberwareSection.tsx');
const character = createEmptyCharacter('AUDIT');
const memoryStorage = new Map();
global.localStorage = { getItem: k => memoryStorage.get(k) ?? null, setItem: (k, v) => memoryStorage.set(k, v) };
global.alert = noop;

probe('DV_EQUALITY', () => {
  const roll = randomSequence([0.4], () => dice.executeCyberpunkCheck({ title: 'audit', baseVal: 10, targetDv: 15 }));
  return { observed: { total: roll.total, success: roll.isSuccess }, expected: { total: 15, success: false } };
});
probe('DEATH_NATURAL_10', () => ({ observed: randomSequence([0.99], () => dice.executeDeathSave(12, 0)).isSuccess, expected: false }));
probe('HUMANITY_RELOAD', () => {
  const c = structuredClone(character); c.humanityCurrent = 56;
  storage.saveCharactersToStorage([c]);
  const before = calculateHumanityStats(c);
  const after = storage.loadStoredCharacters()[0];
  return { observed: after.humanityCurrent, expected: before.currentHumanity, installedHL: before.totalInstallationHL };
});
probe('UNARMED_DAMAGE', () => ({ observed: [7, 8, 10, 12, 14].map(body => [body, getUnarmedDamage(body)]), expected: [[7, '3d6'], [8, '3d6'], [10, '3d6'], [12, '4d6'], [14, '4d6']] }));
probe('STREETRAT_SKILLS', () => ({ observed: Object.entries(CPR_ROLE_PACKAGES).map(([role, pkg]) => ({
  role, points: CPR_SKILLS.reduce((n, skill) => n + (pkg.streetratSkills[skill.id] || 0) * skill.multiplier, 0),
  unknownIds: Object.keys(pkg.streetratSkills).filter(id => !CPR_SKILLS.some(s => s.id === id)),
})), expected: '86 points per role; exact corebook packages and cultural language rank 4 in addition' }));
probe('EMP_SKILL_BASE', () => {
  let base;
  const c = structuredClone(character); c.humanityCurrent = 20;
  const view = mount(SkillsSection, { character: c, onUpdateCharacter: noop, onRollSkill: (s, value) => { base = [s.id, value]; }, lang: 'en', dualTerms: false });
  const tree = view.render();
  const roll = nodes(tree, n => n.type === 'button' && n.props.title?.startsWith('Roll Conversation:'))[0];
  assert.ok(roll, 'Conversation roll button'); roll.props.onClick();
  return { observed: base, expected: ['conversation', 4], baseEMP: c.stats.EMP, currentEMP: calculateHumanityStats(c).currentEmp };
});
probe('LUCK_OVERSPEND', () => {
  const rolls = []; let updated;
  const c = structuredClone(character); c.luckCurrent = 1;
  const view = mount(DiceRollerModal, { isOpen: true, onClose: noop, character: c, onUpdateCharacter: u => updated = u, onAddRollResult: r => rolls.push(r), rollHistory: [], onClearHistory: noop, lang: 'en' });
  const input = nodes(view.render(), n => n.type === 'input' && n.props.max === 1)[0];
  input.props.onChange({ target: { value: '100' } });
  randomSequence([0.4], () => button(view.render(), 'ROLL 1D10').props.onClick());
  return { observed: { luckBonus: rolls[0].luckSpent, remaining: updated?.luckCurrent ?? c.luckCurrent }, expected: 'Reject spending 100 with 1 available; never grant the bonus for free' };
});
function damageView(c) {
  let updated;
  const view = mount(DamageCalculatorModal, { isOpen: true, onClose: noop, character: c, onUpdateCharacter: u => updated = u, lang: 'en' });
  return { view, update: () => updated };
}
probe('SHIELD_OVERFLOW', () => {
  const c = structuredClone(character); c.armor.body.spCurrent = 0;
  const { view, update } = damageView(c);
  const checkbox = nodes(view.render(), n => n.type === 'input' && n.props.type === 'checkbox')[0];
  assert.ok(checkbox); checkbox.props.onChange({ target: { checked: true } });
  // Three fives: no critical injury, 15 damage against 10-HP shield.
  randomSequence([0.7], () => button(view.render(), 'CALCULATE').props.onClick());
  button(view.render(), 'APPLY').props.onClick();
  return { observed: c.hpCurrent - update().hpCurrent, expected: 0 };
});
probe('STALE_DAMAGE_CHARACTER', () => {
  const c = structuredClone(character); c.armor.body.spCurrent = 0; c.armor.head.spCurrent = 11;
  const { view, update } = damageView(c);
  randomSequence([0.7], () => button(view.render(), 'CALCULATE').props.onClick());
  view.props.isOpen = false; view.render();
  const other = structuredClone(c); other.id = 'other'; other.hpCurrent = 40; other.armor.body.spCurrent = 18;
  view.props.character = other; view.props.isOpen = true;
  button(view.render(), 'APPLY').props.onClick();
  return { observed: { id: update().id, bodySP: update().armor.body.spCurrent, hpLoss: other.hpCurrent - update().hpCurrent }, expected: 'Invalidate previous character calculation when reopening; SP 18, HP 40 until recalculated' };
});
probe('DUPLICATE_CRITICAL', () => {
  const c = structuredClone(character);
  const injury = c.criticalInjuries.find(i => i.location === 'body' && i.rollNumber === 12); injury.isActive = true;
  const { view, update } = damageView(c);
  randomSequence([0.99, 0.99, 0.99, 0.99, 0.99, 0.4, 0.4], () => button(view.render(), 'CALCULATE').props.onClick());
  button(view.render(), 'APPLY').props.onClick();
  return { observed: update().criticalInjuries.filter(i => i.isActive).length, expected: 2 };
});
probe('WIZARD_FREE_ARMOR', () => {
  let created;
  const view = mount(CharacterWizardModal, { isOpen: true, onClose: noop, onCharacterCreated: c => created = c, lang: 'en' });
  nodes(view.render(), n => n.type === 'div' && n.props.onClick && label(n).includes('Complete Packages'))[0].props.onClick();
  for (let i = 0; i < 5; i++) button(view.render(), 'Next').props.onClick();
  button(view.render(), 'CREATE').props.onClick();
  return { observed: created && { cash: created.cashEb, head: created.armor.head.spCurrent, body: created.armor.body.spCurrent, skillPoints: created.skills.reduce((n,s) => n+s.level*s.multiplier,0) }, expected: 'No free armor; validate skills and stat allocation before finishing' };
});
probe('THERAPY_HOOK_ORDER_STATIC_CONCERN', () => {
  const view = mount(TherapyModal, { isOpen: false, character, lang: 'en', onClose: noop, onUpdateCharacter: noop });
  view.render(); const closed = view.state.cursor;
  view.props.isOpen = true; view.render();
  return { observed: { hooksWhenClosed: closed, hooksWhenOpen: view.state.cursor }, expected: 'Same hook order on every render (real React must also be checked)' };
});
probe('MALFORMED_BACKUP', () => {
  memoryStorage.clear(); storage.saveCharactersToStorage([character]);
  const app = mount(App, {});
  const tree = app.render();
  const header = nodes(tree, n => n.type === Header)[0];
  assert.ok(header); header.props.onImportCharacter('[]');
  return { observed: { characters: app.state.values[0], blankScreen: app.render() === null }, expected: 'Reject empty backup before replacing the collection' };
});
probe('ATTACK_IGNORES_SOLO_QUALITY_MODS', () => {
  const c = structuredClone(character);
  c.roleAbilities.solo.precisionAttack = 3; c.statMods.REF = 2;
  const weapon = { ...c.weapons[0], quality: 'Excellent' };
  memoryStorage.clear(); storage.saveCharactersToStorage([c]);
  const app = mount(App, {}); const tree = app.render();
  const weapons = nodes(tree, n => n.type === WeaponsSection)[0];
  assert.ok(weapons); randomSequence([0.4], () => weapons.props.onRollWeaponAttack(weapon, 15));
  const roller = nodes(app.render(), n => n.type === DiceRollerModal)[0];
  const roll = roller.props.rollHistory[0];
  return { observed: roll.baseVal, expectedWithoutTemporaryMods: c.stats.REF + c.skills.find(s => s.id === weapon.skillId).level + 1 + 1, ignoredStoredTemporaryModifier: c.statMods.REF };
});
probe('RANGE_ATTACK_WRONG_SKILL', () => {
  const c = structuredClone(character);
  c.weapons.push({ ...c.weapons[0], id:'audit-rifle', name:'Audit Rifle', category:'Assault Rifle', skillId:'shoulder_arms', damage:'5d6', magCapacity:30, currentAmmo:30 });
  c.skills.find(s => s.id === 'handgun').level = 6;
  c.skills.find(s => s.id === 'autofire').level = 2;
  let captured;
  const view = mount(WeaponsSection, { character: c, lang: 'en', onUpdateCharacter: noop, onRollWeaponAttack: (...args) => captured = args, onRollWeaponDamage: noop });
  const toggle = nodes(view.render(), n => n.type === 'button' && n.props.onClick?.toString().includes('setShowRangeMatrix'))[0];
  assert.ok(toggle); toggle.props.onClick();
  const tree = view.render();
  const row = nodes(tree, n => n.type === 'tr' && label(n).startsWith('Autofire (Rifle)'))[0];
  assert.ok(row); nodes(row, n => n.type === 'button')[0].props.onClick();
  return { observed: { weapon: captured[0].category, skill: captured[0].skillId, DV: captured[1] }, expected: { weapon: 'Assault Rifle', skill: 'autofire', DV: 22 } };
});
probe('CATALOG_INVENTORY', () => ({ observed: Object.fromEntries(Object.entries(catalog).filter(([,v]) => Array.isArray(v)).map(([k,v]) => [k,v.length])), affected: catalog.DATAPOOL_WEAPONS.filter(w => /WAA|ARS-5|Мастиф|Mastiff|Overlord|Повелитель|Крауд|Crowd|Crusher|Крашер|Вест|Westwood/i.test(w.name)).map(w => ({ name:w.name, capacity:w.magCapacity, cost:w.costEb, category:w.category, quality:w.quality, notes:w.notes })) }));
probe('INVALID_DAMAGE_FORMULAS', () => {
  const invalid = catalog.DATAPOOL_WEAPONS.filter(w => !/^\d+d6(?:\+\d+)?$/i.test(w.damage));
  return { observed: { count: invalid.length, weapons: invalid.map(w => ({ name:w.name, formula:w.damage })), fallback: randomSequence([0.4], () => dice.executeDamageRoll('invalid', '3d65d6')).total }, expected: 'Reject unsupported formulas or use explicit attack profiles; never silently roll 3d6' };
});
probe('CATALOG_TRUNCATION', () => ({ observed: {
  notesExactly200Chars: catalog.DATAPOOL_WEAPONS.filter(w => w.notes.length === 200).length,
  damagedUnicodeItems: Object.values(catalog).filter(Array.isArray).flat().filter(i => JSON.stringify(i).includes('\uFFFD')).length,
  weaponCategoryCounts: catalog.DATAPOOL_WEAPONS.reduce((a,w) => { a[w.category]=(a[w.category]||0)+1; return a; }, {}),
}, expected: 'Full rule text and correct structured categories; no decoding replacement characters' }));
probe('SERIOUS_WOUND_BOUNDARY', () => {
  let base;
  const c = structuredClone(character); c.hpCurrent = 20;
  const view = mount(SkillsSection, { character: c, onUpdateCharacter: noop, onRollSkill: (s,v) => base=v, lang:'en',dualTerms:false });
  const roll = nodes(view.render(), n => n.type==='button' && n.props.title?.startsWith('Roll Perception:'))[0];
  assert.ok(roll); roll.props.onClick();
  return { observed: base, expected: c.stats.INT+c.skills.find(s=>s.id==='perception').level+1, hp:20, maxHP:40, note:'Includes Solo Threat Detection +1 on both sides' };
});
probe('NET_BOOSTER_AND_WOUNDS', () => {
  const c = structuredClone(character); c.role='Netrunner'; c.hpCurrent=0;
  memoryStorage.clear(); storage.saveCharactersToStorage([c]);
  const app=mount(App,{});
  const sectionNav=load('src/components/SectionNav.tsx').SectionNav;
  nodes(app.render(),n=>n.type===sectionNav)[0].props.onChangeTab('netrunner');
  let net=nodes(app.render(),n=>n.type===NetrunnerSection)[0];
  assert.ok(net,'Netrunner tab');
  const view=mount(NetrunnerSection,net.props);
  randomSequence([0.4],()=>nodes(view.render(),n=>n.type==='button'&&n.props.onClick?.toString().includes('Следопыт'))[0].props.onClick());
  const roller=nodes(app.render(),n=>n.type===DiceRollerModal)[0];
  return { observed:roller.props.rollHistory[0].baseVal, expected:c.roleAbilities.netrunner.interfaceRank+2-4, installedSeeYa:c.programs.some(p=>p.name==='SeeYa'&&p.isInstalled) };
});
probe('NET_ACTIONS_RANK_3_CORRECT', () => {
  const c=structuredClone(character);c.roleAbilities.netrunner.interfaceRank=3;
  const view=mount(NetrunnerSection,{character:c,lang:'en',onUpdateCharacter:noop,onRollInterfaceAction:noop,onRollProgramAttack:noop});
  const actionBox=nodes(view.render(),n=>n.type==='div'&&label(n).includes('Actions / Turn')&&label(n).includes('NET')).at(-1);
  return { observed:label(actionBox).replace(/\s+/g,' ').trim(), expected:'Actions / Turn 2 NET' };
});
probe('DEATH_COUNTER_NOT_INCREMENTED', () => {
  const c=structuredClone(character); c.hpCurrent=0;
  memoryStorage.clear();storage.saveCharactersToStorage([c]);
  const app=mount(App,{});
  randomSequence([0.2],()=>nodes(app.render(),n=>n.type===StatsSection)[0].props.onRollDeathSave());
  return { observed:app.state.values[0][0].deathSavePenalties, expected:1, note:'UI also has manual counter buttons' };
});
probe('ARMOR_MINIMUM_AND_MORTAL_MOVE', () => {
  const c=structuredClone(character);c.stats.REF=2;c.stats.MOVE=6;c.armor.body.penalty=-4;c.hpCurrent=0;
  const view=mount(StatsSection,{character:c,onUpdateCharacter:noop,onRollStat:noop,onRollInitiative:noop,onRollDeathSave:noop,onOpenDamageCalc:noop,lang:'en'});
  return { observed:nodes(view.render(),n=>n.type==='button'&&/^Roll (REF|MOVE)/.test(n.props.title||'')).map(n=>n.props.title), expected:['Roll REF (1d10 + 0)','Roll MOVE (1d10 + 1)'] };
});
probe('CYBERWARE_REMOVE_HUMANITY_REFUND', () => {
  const c=structuredClone(character); let updated;
  const view=mount(CyberwareSection,{character:c,lang:'en',onUpdateCharacter:u=>updated=u});
  const del=nodes(view.render(),n=>n.type==='button'&&n.props.onClick?.toString().includes('setItemToDelete'))[0];
  assert.ok(del);del.props.onClick();
  const confirm=nodes(view.render(),n=>n.type==='button'&&n.props.onClick?.toString().includes("confirmDeleteItem('cpr')"))[0];
  assert.ok(confirm);confirm.props.onClick();
  return { observed:updated.humanityCurrent, expected:c.humanityCurrent, note:'Removal raises recoverable cap; therapy restores current Humanity' };
});
probe('ROLE_CHANGE_REPLACES_EARNED_SKILLS', () => {
  const c=structuredClone(character);c.skills.find(s=>s.id==='handgun').level=10;
  let updated;
  const view=mount(StatsSection,{character:c,onUpdateCharacter:u=>updated=u,onRollStat:noop,onRollInitiative:noop,onRollDeathSave:noop,onOpenDamageCalc:noop,lang:'en'});
  const role=nodes(view.render(),n=>n.type==='select'&&n.props.value==='Solo')[0];
  assert.ok(role);role.props.onChange({target:{value:'Nomad'}});
  return { observed:updated.skills.find(s=>s.id==='handgun').level, expected:10 };
});
probe('MORTAL_INCOMING_DAMAGE', () => {
  const c=structuredClone(character);c.hpCurrent=0;c.armor.body.spCurrent=0;
  const {view,update}=damageView(c);
  randomSequence([0.7],()=>button(view.render(),'CALCULATE').props.onClick());
  button(view.render(),'APPLY').props.onClick();
  return { observed:{injuries:update().criticalInjuries.filter(i=>i.isActive).length,deathSavePenalties:update().deathSavePenalties}, expected:{injuries:1,deathSavePenalties:1} };
});
probe('CRITICAL_HEAD_MULTIPLIER', () => {
  const c=structuredClone(character);c.armor.head.spCurrent=0;
  c.criticalInjuries.find(i=>i.location==='head'&&i.rollNumber===9).isActive=true;
  const {view,update}=damageView(c);
  const head=nodes(view.render(),n=>n.type==='button'&&n.props.onClick?.toString().includes("setHitLocation('head')"))[0];
  assert.ok(head);head.props.onClick();
  randomSequence([0.4],()=>button(view.render(),'CALCULATE').props.onClick());
  button(view.render(),'APPLY').props.onClick();
  return { observed:c.hpCurrent-update().hpCurrent,expected:27,rawDamage:9 };
});
probe('WIZARD_SHIELD_LOST', () => {
  let created;
  const view=mount(CharacterWizardModal,{isOpen:true,onClose:noop,onCharacterCreated:c=>created=c,lang:'en'});
  nodes(view.render(),n=>n.type==='div'&&n.props.onClick&&label(n).includes('Complete Packages'))[0].props.onClick();
  for(let i=0;i<3;i++) button(view.render(),'Next').props.onClick();
  const shield=nodes(view.render(),n=>n.type==='div'&&n.props.onClick&&label(n).includes('Bulletproof Shield'))[0];
  assert.ok(shield);shield.props.onClick();
  for(let i=0;i<2;i++) button(view.render(),'Next').props.onClick();
  button(view.render(),'CREATE').props.onClick();
  return {observed:{cash:created.cashEb,hasShield:!!created.armor.shield},expected:{cash:2450,hasShield:true}};
});
probe('TECH_STARTING_SPECIALTIES', () => {
  const c=createEmptyCharacter('AUDIT TECH','Tech');
  const {makerRank,...specialties}=c.roleAbilities.tech;
  return {observed:{makerRank,specialtyRanks:Object.values(specialties).reduce((n,v)=>n+v,0)},expected:{makerRank:4,specialtyRanks:8}};
});
probe('SOURCE_MANIFEST', () => {
  const crypto=require('node:crypto');
  return { observed:Object.fromEntries([...cache.keys()].filter(f=>f.startsWith(root)).map(f=>[path.relative(root,f).replaceAll('\\','/'),crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex')])) };
});
probe('BASELINE_CORRECT', () => ({ observed: {
  HP: character.hpCurrent,
  criticalExplosion: randomSequence([0.99], () => dice.executeCyberpunkCheck({ title:'audit', baseVal:0 })).total,
  noCriticalDeathDie: randomSequence([0], () => dice.executeDeathSave(6,0)).total,
  humanityTherapyCap: calculateHumanityStats(character).maxRecoverableHumanity,
  assaultRifleDVs: CPR_RANGE_DV_TABLE.find(r => r.category === 'Assault Rifle').dvs,
  programCount: PRESET_PROGRAMS.length,
}, expected: { HP:40, criticalExplosion:20, noCriticalDeathDie:1, humanityTherapyCap:56, assaultRifleDVs:[17,16,15,13,15,20,25,30], programCount:8 } }));
fs.writeFileSync(path.join(__dirname, 'results.json'), JSON.stringify(results, null, 2) + '\n');
for (const result of results) console.log(JSON.stringify(result));
if (results.some(r => r.harnessError)) process.exitCode = 1;
