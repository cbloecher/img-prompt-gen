import { loadData } from './data.js';
import { state, restoreState, saveState, clearState } from './state.js';
import { checkSafety } from './safety.js';
import { buildTraitIndex, traitApplies, selectTrait, validateSelection, buildPrompt, buildNegativePrompt } from './generator.js';
import { readProfiles, writeProfiles, upsertProfile, deleteProfileEntry, findProfile, buildTraitScopeIndex, selectedForScope } from './profiles.js';

const $ = s => document.querySelector(s);
let data, traitIndex, traitScopeIndex;
let renderedCategories = new Map();

const NAV_GROUPS = [
  { id:'person', label:'Person', categories:['age','body','face','skin','hair','expression','gaze','pose'] },
  { id:'scene', label:'Szene', categories:['clothing','environment','location','interaction','objects','situation'] },
  { id:'image', label:'Bild', categories:['camera','perspective','composition','framing','lighting','shot_style','mood','realism','style'] }
];

const SUBCATEGORY_LABELS = {
  general:'Allgemein', build:'Körperbau', proportions:'Proportionen', breast:'Brust', hips:'Hüfte', legs:'Beine', arms:'Arme', details:'Details', aging:'Alterung',
  length:'Länge', texture:'Struktur', style:'Frisur', color:'Grundfarbe', color_effects:'Farbeffekte', roots_regrowth:'Ansatz / herausgewachsen', dye_condition:'Färbezustand', realism:'Realismus',
  base_pose:'Grundpose', posture:'Haltung', leg_pose:'Beine', hand_pose:'Hände', arm_pose:'Arme',
  face_shape:'Gesichtsform', forehead:'Stirn', cheeks_jaw:'Wangen / Kiefer', eyes:'Augen', eye_details:'Augendetails', eye_color:'Augenfarbe', eyebrows:'Augenbrauen', nose:'Nase', mouth_lips:'Mund / Lippen', teeth:'Zähne', ears:'Ohren', facial_hair:'Gesichtsbehaarung', individualization:'Individualisierung'
};

function groupBy(items,keyFn){const groups=new Map();for(const item of items){const key=keyFn(item);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}return groups;}
function slug(value){return String(value).toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'');}
function subLabel(key){return SUBCATEGORY_LABELS[key]||key.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());}
function mergedCategories(){const categories=new Map();for(const doc of data.docs){const category=doc.meta?.category||'other';if(!categories.has(category))categories.set(category,{meta:doc.meta||{category},traits:[]});categories.get(category).traits.push(...(doc.traits||[]));}return categories;}

function renderCategories(){
  const root=$('#categories');root.replaceChildren();renderedCategories=new Map();
  for(const [category,categoryDoc] of mergedCategories()){
    const visible=categoryDoc.traits.filter(t=>traitApplies(t,state.sex,state.age));if(!visible.length)continue;
    const block=document.createElement('section');block.className='category-block';block.id=`category-${slug(category)}`;block.dataset.category=category;
    const h2=document.createElement('h2');h2.className='category-title';h2.textContent=categoryDoc.meta?.title_de||category||'Merkmale';block.append(h2);
    const groups=groupBy(visible,t=>t.subcategory||'general');const renderedGroups=[];
    for(const [subcategory,traits] of groups){
      const section=document.createElement('section');section.className='subcategory';section.id=`subcategory-${slug(category)}-${slug(subcategory)}`;section.dataset.subcategory=subcategory;
      const h3=document.createElement('h3');h3.textContent=subLabel(subcategory);section.append(h3);
      const list=document.createElement('div');list.className='traits';
      for(const trait of traits){
        const label=document.createElement('label');label.className='trait';
        const input=document.createElement('input');input.type=trait.selection?.mode==='single'&&trait.selection?.group?'radio':'checkbox';if(input.type==='radio')input.name=`group-${trait.selection.group}`;input.checked=state.selected.has(trait.id);input.dataset.traitId=trait.id;
        const en=document.createElement('span');en.className='trait-en';en.textContent=trait.prompt||trait.label_en||'';
        const de=document.createElement('span');de.className='trait-de';de.textContent=trait.label_de||trait.label_en||trait.prompt||'';
        const description=document.createElement('span');description.className='trait-description';description.textContent=trait.description_de||'';
        label.append(input,en,de,description);list.append(label);
      }
      section.append(list);block.append(section);renderedGroups.push({subcategory,traits,section});
    }
    root.append(block);renderedCategories.set(category,{meta:categoryDoc.meta,block,groups:renderedGroups});
  }
  renderOverview();
}

function selectedCount(traits){return traits.reduce((n,t)=>n+(state.selected.has(t.id)?1:0),0);}
function appendCategoryNav(nav,category,item){
  const heading=document.createElement('a');heading.className='nav-category';heading.href=`#${item.block.id}`;heading.textContent=item.meta?.title_de||category;nav.append(heading);
  for(const group of item.groups){const count=selectedCount(group.traits);const a=document.createElement('a');a.className=`nav-link${count?' has-selection':''}`;a.href=`#${group.section.id}`;a.innerHTML=`<span class="nav-dot"></span><span>${subLabel(group.subcategory)}</span><span class="nav-count">${count}</span>`;nav.append(a);}
}
function renderOverview(){
  const sexLabel=state.sex==='female'?'Frau':state.sex==='male'?'Mann':'Neutral';$('#personSummary').textContent=`${sexLabel} · ${state.age}`;
  const nav=$('#sectionNav');nav.replaceChildren();const totals=[];const assigned=new Set();
  for(const [category,item] of renderedCategories){const allTraits=item.groups.flatMap(g=>g.traits);totals.push(`${item.meta?.title_de||category} ${selectedCount(allTraits)}`);}
  for(const navGroup of NAV_GROUPS){
    const groupTitle=document.createElement('div');groupTitle.className='nav-main-group';groupTitle.textContent=navGroup.label;nav.append(groupTitle);
    for(const category of navGroup.categories){const item=renderedCategories.get(category);if(!item)continue;assigned.add(category);appendCategoryNav(nav,category,item);}
  }
  const other=[...renderedCategories.entries()].filter(([category])=>!assigned.has(category));
  if(other.length){const groupTitle=document.createElement('div');groupTitle.className='nav-main-group';groupTitle.textContent='Sonstige';nav.append(groupTitle);for(const [category,item] of other)appendCategoryNav(nav,category,item);}
  $('#selectionSummary').innerHTML=`<strong>${sexLabel} · ${state.age}</strong><span>${totals.join(' · ')}</span>`;
}

function updateOutput(){const safety=checkSafety(state.freeText,data.safety),message=$('#safetyMessage');if(!safety.ok){message.textContent=`Freie Ergänzung blockiert (${[...new Set(safety.matches.map(m=>m.category))].join(', ')}).`;message.className='message error';$('#promptOutput').value='';}else{const issues=validateSelection(state,traitIndex);message.textContent=issues.length?issues.join(' · '):'';message.className='message';const prompt=buildPrompt(state,traitIndex),finalSafety=checkSafety(prompt,data.safety);$('#promptOutput').value=finalSafety.ok?prompt:'';if(!finalSafety.ok){message.textContent='Der zusammengesetzte Prompt wurde durch die Sicherheitsprüfung blockiert.';message.className='message error';}}$('#negativeOutput').value=buildNegativePrompt(data.negative);saveState();renderOverview();}
function syncControls(){$('#sex').value=state.sex;$('#age').value=state.age;$('#freeText').value=state.freeText;}
async function copyText(text){if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return;}const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.focus();area.select();const ok=document.execCommand('copy');area.remove();if(!ok)throw new Error('Kopieren fehlgeschlagen');}
function flash(button,text='Kopiert'){const old=button.textContent;button.textContent=text;setTimeout(()=>button.textContent=old,900);}

function currentProfileScope(){return $('#profileScope').value||'all';}
function renderProfiles(selected=''){
  const scope=currentProfileScope();const select=$('#profileSelect');select.innerHTML='<option value="">– Profil wählen –</option>';
  const entries=readProfiles().filter(p=>p.scope===scope).sort((a,b)=>a.name.localeCompare(b.name,'de'));
  for(const profile of entries){const o=document.createElement('option');o.value=o.textContent=profile.name;select.append(o);}select.value=selected;
}
function saveProfile(){
  const name=$('#profileName').value.trim(),scope=currentProfileScope();if(!name){$('#profileMessage').textContent='Bitte Profilnamen eingeben.';return;}
  const profile={name,scope,selected:selectedForScope(state.selected,scope,traitScopeIndex)};
  if(scope==='all'||scope==='person'){profile.sex=state.sex;profile.age=state.age;}
  if(scope==='all')profile.freeText=state.freeText;
  const next=upsertProfile(readProfiles(),profile);writeProfiles(next);renderProfiles(name);$('#profileMessage').textContent=`${scope==='all'?'Gesamtprofil':'Bereichsprofil'} „${name}“ gespeichert.`;
}
function applyProfileSelection(profile){
  const scope=profile.scope||'all';
  if(scope==='all'||scope==='person'){
    state.sex=profile.sex||state.sex||'all';
    state.age=Math.max(18,Number(profile.age)||state.age||35);
  }
  if(scope==='all')state.freeText=profile.freeText||'';

  const base=new Set();
  if(scope!=='all')for(const id of state.selected){if(traitIndex.has(id)&&traitScopeIndex.get(id)!==scope)base.add(id);}
  state.selected=base;
  for(const id of profile.selected||[]){
    const trait=traitIndex.get(id);if(!trait)continue;
    if(scope!=='all'&&traitScopeIndex.get(id)!==scope)continue;
    if(!traitApplies(trait,state.sex,state.age))continue;
    selectTrait(state,trait,true,traitIndex);
  }
}
function loadProfile(){
  const scope=currentProfileScope(),name=$('#profileSelect').value,p=findProfile(readProfiles(),scope,name);if(!p)return;
  applyProfileSelection(p);syncControls();renderCategories();updateOutput();$('#profileName').value=name;$('#profileMessage').textContent=`Profil „${name}“ geladen.`;
}
function deleteProfile(){
  const scope=currentProfileScope(),name=$('#profileSelect').value;if(!name)return;
  writeProfiles(deleteProfileEntry(readProfiles(),scope,name));renderProfiles();$('#profileName').value='';$('#profileMessage').textContent=`Profil „${name}“ gelöscht.`;
}

async function init(){try{data=await loadData();traitIndex=buildTraitIndex(data.docs);traitScopeIndex=buildTraitScopeIndex(data.docs,NAV_GROUPS);restoreState();syncControls();renderCategories();renderProfiles();updateOutput();
$('#categories').addEventListener('change',e=>{const id=e.target.dataset.traitId;if(!id)return;selectTrait(state,traitIndex.get(id),e.target.checked,traitIndex);renderCategories();updateOutput();});
$('#sex').addEventListener('change',e=>{state.sex=e.target.value;renderCategories();updateOutput();});$('#age').addEventListener('change',e=>{state.age=Math.max(18,Number(e.target.value)||18);e.target.value=state.age;renderCategories();updateOutput();});$('#freeText').addEventListener('input',e=>{state.freeText=e.target.value;updateOutput();});
$('#reset').addEventListener('click',()=>{clearState();syncControls();renderCategories();updateOutput();});$('#profileScope').addEventListener('change',()=>{renderProfiles();$('#profileName').value='';$('#profileMessage').textContent='';});$('#profileSelect').addEventListener('change',e=>{$('#profileName').value=e.target.value;});$('#saveProfile').addEventListener('click',saveProfile);$('#loadProfile').addEventListener('click',loadProfile);$('#deleteProfile').addEventListener('click',deleteProfile);
document.addEventListener('click',async e=>{const target=e.target.dataset.copy;if(!target)return;try{await copyText(document.getElementById(target).value);flash(e.target);}catch(err){$('#safetyMessage').textContent=err.message;}});
$('#copyAll').addEventListener('click',async e=>{const positive=$('#promptOutput').value,negative=$('#negativeOutput').value;const text=`${positive}\n\nNEGATIVE:\n${negative}`;try{await copyText(text);flash(e.target);}catch(err){$('#safetyMessage').textContent=err.message;}});
}catch(error){$('#categories').innerHTML=`<p class="message error">${error.message}. Bitte über einen lokalen HTTP-Server starten, nicht als file://.</p>`;}}
init();
