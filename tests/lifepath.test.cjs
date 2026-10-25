const { test, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const { load, mount, nodes, button, label, randomSequence } = require('./helpers.cjs');
const { LifepathEditor } = load('src/components/LifepathEditor.tsx');
const { LifepathSection } = load('src/components/LifepathSection.tsx');
const { CharacterWizardModal } = load('src/components/CharacterWizardModal.tsx');
const { createEmptyCharacter } = load('src/data/initialData.ts');
const life = load('src/utils/lifepath.ts');
const { isCharacter } = load('src/utils/characterValidation.ts');
const storage = load('src/utils/storage.ts');
const field = (tree,id) => nodes(tree,n=>n.type==='textarea'&&n.props.id===id)[0];
const edit = initial => {
  let current=initial;const view=mount(LifepathEditor,{value:current,lang:'en',idPrefix:'test-life',onChange:next=>{current=next;view.props.value=next;}});
  return {view,get value(){return current;}};
};
beforeEach(()=>{const data=new Map();global.localStorage={getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};global.alert=()=>{};});

test('lifepath editor follows the 12-field sheet order with three blank relationship rows and four enemy columns',()=>{
  let updates=0;const view=mount(LifepathEditor,{value:life.emptyLifepath(),lang:'ru',idPrefix:'sheet',onChange(){updates++;}});
  const tree=view.render();const expected=['culturalOrigin','personality','clothingStyle','hairstyle','valueMost','feelingsAboutPeople','valuedPerson','valuedPossession','familyBackground','childhoodEnv','familyCrisis','lifeGoals'];
  assert.deepEqual(nodes(tree,n=>n.type==='textarea').slice(0,12).map(n=>n.props.id),expected.map(key=>'sheet-'+key));
  assert.equal(nodes(tree,n=>n.type==='textarea'&&n.props.id.startsWith('sheet-friendEntries-')).length,3);
  assert.equal(nodes(tree,n=>n.type==='textarea'&&n.props.id.startsWith('sheet-loveAffairEntries-')).length,3);
  assert.equal(nodes(tree,n=>n.type==='textarea'&&n.props.id.startsWith('sheet-enemy-')).length,12);
  assert.deepEqual(nodes(tree,n=>n.type==='th').map(label),['Кто?','Почему?','Какие имеет ресурсы?','Что ты сделаешь?']);
  assert.ok(nodes(tree,n=>n.type==='textarea').every(n=>n.props.value===''));assert.equal(updates,0);
});

test('legacy multiline relationship notes are shown verbatim without changing the stored character',()=>{
  const lp={...life.emptyLifepath(),friends:'A friend\nwith a long note',tragicLoveAffairs:'A past relationship\nwith more detail',enemies:'Someone dangerous\nwith an unsorted history',unknown:{zero:0,enabled:false}};
  const snapshot=JSON.stringify(lp);const {view}=edit(lp);const tree=view.render();
  assert.equal(field(tree,'test-life-friendEntries-0').props.value,lp.friends);assert.equal(field(tree,'test-life-loveAffairEntries-0').props.value,lp.tragicLoveAffairs);assert.equal(field(tree,'test-life-enemy-0-who').props.value,lp.enemies);assert.equal(field(tree,'test-life-enemy-0-why').props.value,'');assert.equal(JSON.stringify(lp),snapshot);
});

test('editing structured relationships keeps other rows, legacy mirrors and unknown nested fields intact',()=>{
  const lp={...life.emptyLifepath(),friends:'old note',friendEntries:['One','Two','Three','Four'],enemyEntries:[{...life.emptyEnemy(),who:'Rival',unknown:{flag:false}}],unknown:{zero:0}};
  const editor=edit(lp);field(editor.view.render(),'test-life-friendEntries-1').props.onChange({target:{value:'Updated'}});
  assert.deepEqual(editor.value.friendEntries,['One','Updated','Three','Four']);assert.equal(editor.value.friends,'One\nUpdated\nThree\nFour');
  field(editor.view.render(),'test-life-enemy-0-why').props.onChange({target:{value:'A reason'}});field(editor.view.render(),'test-life-enemy-0-resources').props.onChange({target:{value:'Contacts'}});
  assert.equal(editor.value.enemyEntries[0].why,'A reason');assert.equal(editor.value.enemyEntries[0].resources,'Contacts');assert.deepEqual(editor.value.enemyEntries[0].unknown,{flag:false});assert.match(editor.value.enemies,/Why: A reason/);assert.deepEqual(editor.value.unknown,{zero:0});
});

test('relationship rows can be extended and removed without truncating longer existing lists or reviving cleared legacy text',()=>{
  const editor=edit({...life.emptyLifepath(),friends:'legacy',friendEntries:['A','B','C','D','E']});
  button(editor.view.render(),'Add friend').props.onClick();assert.equal(editor.value.friendEntries.length,6);
  nodes(editor.view.render(),n=>n.type==='button'&&n.props['aria-label']==='Remove row: Friend 2')[0].props.onClick();assert.deepEqual(editor.value.friendEntries,['A','C','D','E','']);
  const cleared=life.updateRelationships(editor.value,'friendEntries',[]);assert.deepEqual(life.friendEntries(cleared),[]);assert.equal(cleared.friends,'');
  const empty=life.updateEnemies({...editor.value,enemies:'legacy'},[],'en');assert.deepEqual(life.enemyEntries(empty),[]);assert.equal(empty.enemies,'');
});

test('single-field random rolls preserve contacts and full generation updates both contact formats',()=>{
  const editor=edit({...life.emptyLifepath(),friendEntries:['Keep this'],roleLifepathNotes:'Keep role notes',unknown:{value:null}});
  const dice=nodes(editor.view.render(),n=>n.type==='button'&&n.props['aria-label']==='Randomize: Personality')[0];randomSequence([0],()=>dice.props.onClick());assert.deepEqual(editor.value.friendEntries,['Keep this']);
  randomSequence([0],()=>button(editor.view.render(),'Generate Random Lifepath').props.onClick());assert.equal(editor.value.roleLifepathNotes,'Keep role notes');assert.deepEqual(editor.value.unknown,{value:null});assert.equal(editor.value.friends,editor.value.friendEntries[0]);assert.equal(editor.value.tragicLoveAffairs,editor.value.loveAffairEntries[0]);assert.equal(editor.value.enemies,editor.value.enemyEntries[0].who);
});

test('lifepath storage roundtrip retains structured rows and rejects malformed imports before rendering',()=>{
  let lp=life.updateRelationships({...life.emptyLifepath(),languages:'Language A',affectation:'Style note',roleLifepathNotes:'Role note'},'loveAffairEntries',['One','Two','Three','Four']);
  lp=life.updateEnemies(lp,[{who:'Enemy',why:'Cause',resources:'Resources',response:'Plan',unknown:{zero:0}}],'en');const c={...createEmptyCharacter('History'),lifepath:lp};assert.ok(isCharacter(c));assert.equal(storage.saveCharactersToStorage([c]),true);assert.deepEqual(storage.loadStoredCharacters()[0].lifepath,lp);
  for(const invalid of [{friendEntries:'bad'},{loveAffairEntries:[1]},{enemyEntries:[{who:'Missing columns'}]},{friendEntries:Array(101).fill('x')}]) assert.equal(isCharacter({...c,lifepath:{...lp,...invalid}}),false);
});

test('sheet wrapper updates only lifepath and wizard retains every edited field on completion',()=>{
  const c=createEmptyCharacter('Original');let updated;const section=mount(LifepathSection,{character:c,lang:'en',onUpdateCharacter:next=>updated=next});const editor=section.render();assert.equal(editor.type,LifepathEditor);editor.props.onChange({...c.lifepath,childhoodEnv:'A different childhood'});assert.equal(updated.cashEb,c.cashEb);assert.equal(updated.weapons,c.weapons);assert.equal(updated.lifepath.childhoodEnv,'A different childhood');
  let created;const wizard=mount(CharacterWizardModal,{isOpen:true,lang:'en',onClose(){},onCharacterCreated:next=>created=next});button(wizard.render(),'5.').props.onClick();const wizardEditor=nodes(wizard.render(),n=>n.type===LifepathEditor)[0];assert.notEqual(wizardEditor.props.idPrefix,editor.props.idPrefix);
  const entered=life.updateEnemies(life.updateRelationships({...life.emptyLifepath(),childhoodEnv:'My childhood',familyCrisis:'My crisis',valuedPerson:'My person',valuedPossession:'My keepsake',hairstyle:'My hair',languages:'My languages',affectation:'My style detail',roleLifepathNotes:'My role notes'},'friendEntries',['Friend one','Friend two'] ),[{who:'Opponent',why:'Reason',resources:'Means',response:'Plan'}],'en');wizardEditor.props.onChange(entered);
  button(wizard.render(),'6.').props.onClick();button(wizard.render(),'CREATE CHARACTER').props.onClick();assert.ok(created);assert.deepEqual(created.lifepath,entered);assert.ok(isCharacter(created));
});
