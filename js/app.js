import { loadData } from './data.js';
import { state, restoreState, saveState, clearState } from './state.js';
import { checkSafety } from './safety.js';
import { buildTraitIndex, traitApplies, selectTrait, validateSelection, buildPrompt, buildNegativePrompt } from './generator.js';
import { readProfiles, writeProfiles, upsertProfile, deleteProfileEntry, findProfile, buildTraitScopeIndex, selectedForScope } from './profiles.js';

const $ = s => document.querySelector(s);
let data, traitIndex, traitScopeIndex;
let renderedRoots = new Map();
let searchQuery = '';

const NAV_GROUPS = [
  { id:'person', label:'Person', roots:['identity','body','face','skin','hair','hair_color_effects','expression','head_gaze','pose','wearables'] },
  { id:'scene', label:'Szene', roots:['clothing','location','environment','weather_time','background','interaction','objects','situation'] },
  { id:'image', label:'Bild', roots:['camera','perspective','framing','composition','lighting','focus_depth_of_field','shot_style','mood','style_medium','realism'] }
];

const TAXONOMY_LABELS = {
  general:['General','Allgemein'], identity:['Identity','Personenbeschreibung'], age:['Age','Alter'], ancestry_ethnicity:['Ancestry / ethnicity','Abstammung / Ethnie'],
  body:['Body','Körper'], build:['Overall build','Gesamtstatur'], proportions:['Proportions','Proportionen'], shoulders:['Shoulders','Schultern'], torso:['Torso','Oberkörper'], hips:['Hips','Hüften'], pelvis:['Pelvis','Becken'], tissue_distribution:['Tissue distribution','Gewebeverteilung'], abdomen:['Abdomen','Bauch'], hips_thighs:['Hips & thighs','Hüften & Oberschenkel'], thighs:['Thighs','Oberschenkel'], secondary_sex_characteristics:['Secondary sex characteristics','Sekundäre Geschlechtsmerkmale'], breast:['Breast','Brust'], details:['Details','Details'],
  face:['Face','Gesicht'], shape:['Shape','Form'], forehead:['Forehead','Stirn'], cheeks:['Cheeks','Wangen'], jaw_chin:['Jaw & chin','Kiefer & Kinn'], eyes:['Eyes','Augen'], eyebrows:['Eyebrows','Augenbrauen'], nose:['Nose','Nase'], mouth_lips:['Mouth & lips','Mund & Lippen'], teeth:['Teeth','Zähne'], marks:['Marks','Male / Narben'],
  skin:['Skin','Haut'], tone:['Tone','Hautton'], pigmentation:['Pigmentation','Pigmentierung'], texture:['Texture','Struktur'], aging:['Aging','Alterung'], facial:['Facial skin','Gesichtshaut'], hands:['Hands','Hände'], neck:['Neck','Hals'],
  hair:['Hair','Haare'], length:['Length','Länge'], style:['Style','Frisur'], hairline_bangs:['Hairline & bangs','Haaransatz & Pony'], facial_hair:['Facial hair','Gesichtsbehaarung'], hair_color_effects:['Hair color & effects','Haarfarbe & Effekte'], base_color:['Base color','Grundfarbe'], effects:['Color effects','Farbeffekte'], roots_regrowth:['Roots / regrowth','Ansatz / herausgewachsen'], dye_condition:['Dye condition','Färbezustand'],
  expression:['Facial expression','Gesichtsausdruck'], base:['Base expression','Grundausdruck'], smile:['Smile','Lächeln'], emotion:['Emotion','Emotion'], quality:['Expression quality','Ausdruckswirkung'], state:['State','Zustand'],
  head_gaze:['Head & gaze','Kopf & Blick'], gaze_direction:['Gaze direction','Blickrichtung'], gaze_quality:['Gaze quality','Blickwirkung'], eye_state:['Eye state','Augenzustand'], head_orientation:['Head orientation','Kopforientierung'], chin_position:['Chin position','Kinnposition'],
  pose:['Pose','Pose'], base_position:['Base position','Grundposition'], posture:['Posture','Körperhaltung'], weight_balance:['Weight & balance','Gewicht & Balance'], arms:['Arms','Arme'], legs:['Legs','Beine'],
  wearables:['Wearables','Getragene Accessoires'], eyewear:['Eyewear','Brillen'], jewelry:['Jewelry','Schmuck'], earrings:['Earrings','Ohrringe'], necklaces:['Necklaces','Ketten'], rings:['Rings','Ringe'], bracelets:['Bracelets','Armbänder'], watches:['Watches','Uhren'], head_accessories:['Head accessories','Kopf-Accessoires'], carry_wearables:['Carry wearables','Getragene Taschen'], body_adornment:['Body adornment','Körperschmuck'],
  weather_time:['Weather & time','Wetter & Tageszeit'], background:['Background','Hintergrund'], mood:['Mood','Stimmung'], focus_depth_of_field:['Focus & depth of field','Fokus & Schärfentiefe'], shot_style:['Shot style','Aufnahmestil'], style_medium:['Style & medium','Stil & Medium'], realism:['Realism','Realismus'],
  color:['Color','Farbe'], color_effects:['Color effects','Farbeffekte'], roots_regrowth:['Roots / regrowth','Ansatz / herausgewachsen'], type:['Type','Art'], time:['Time','Tageszeit'], weather:['Weather','Wetter'], focus:['Focus','Fokus'], depth_of_field:['Depth of field','Schärfentiefe'], optical_effect:['Optical effect','Optischer Effekt'], medium:['Medium','Medium'], photography:['Photography','Fotografie'], anatomy:['Anatomy','Anatomie'], lighting:['Lighting','Licht'], detail:['Detail','Detail']
};

function groupBy(items,keyFn){const groups=new Map();for(const item of items){const key=keyFn(item);if(!groups.has(key))groups.set(key,[]);groups.get(key).push(item);}return groups;}
function slug(value){return String(value).toLowerCase().replace(/[^a-z0-9_-]+/g,'-').replace(/^-+|-+$/g,'');}
function normalize(value){return String(value??'').toLocaleLowerCase('de').normalize('NFKD').replace(/\p{Diacritic}/gu,'');}
function segmentLabel(segment){const pair=TAXONOMY_LABELS[segment];if(pair)return `${pair[0]} - ${pair[1]}`;const label=segment.replaceAll('_',' ').replace(/^./,c=>c.toUpperCase());return label;}
function pathLabel(parts){return parts.length?parts.map(segmentLabel).join(' › '):segmentLabel('general');}
function rootTitle(meta={},root='Traits'){const en=meta.title_en?.trim(),de=meta.title_de?.trim();if(en&&de)return `${en} - ${de}`;return en||de||segmentLabel(root);}
function rootKey(domain,root){return `${domain}:${root}`;}
function traitRoot(trait){return trait.taxonomy?.[0]||'other';}
function traitTail(trait){return (trait.taxonomy||[]).slice(1);}

function mergedRoots(){
  const roots=new Map();
  for(const doc of data.docs){
    const domain=doc.meta?.domain||'other',root=doc.meta?.taxonomy?.[0]||'other',key=rootKey(domain,root);
    if(!roots.has(key))roots.set(key,{domain,root,meta:doc.meta||{domain,taxonomy:[root]},traits:[]});
    roots.get(key).traits.push(...(doc.traits||[]));
  }
  return roots;
}
function groupHasSelection(group){for(const id of state.selected){if(traitIndex.get(id)?.selection?.group===group)return true;}return false;}
function clearSelectionGroup(group){for(const id of [...state.selected]){if(traitIndex.get(id)?.selection?.group===group)state.selected.delete(id);}}
function appendNoSpecification(list,group){
  const label=document.createElement('label');label.className='trait trait-none';
  const input=document.createElement('input');input.type='radio';input.name=`group-${group}`;input.checked=!groupHasSelection(group);input.dataset.clearGroup=group;
  const en=document.createElement('span');en.className='trait-en';en.textContent='No specification';
  const de=document.createElement('span');de.className='trait-de';de.textContent='Keine Angabe';
  const description=document.createElement('span');description.className='trait-description';description.textContent='Keine Vorgabe für diese Auswahlgruppe.';
  label.append(input,en,de,description);list.append(label);
}
function traitSearchText(trait,rootDoc){return normalize([
  trait.id,trait.prompt,trait.label_en,trait.label_de,trait.description_en,trait.description_de,trait.domain,
  ...(trait.taxonomy||[]),...(trait.taxonomy||[]).map(segmentLabel),...(trait.tags||[]),
  rootDoc.meta?.title_en,rootDoc.meta?.title_de,rootDoc.meta?.description_en,rootDoc.meta?.description_de
].filter(Boolean).join(' '));}
function traitMatchesSearch(trait,rootDoc){const tokens=normalize(searchQuery).trim().split(/\s+/).filter(Boolean);if(!tokens.length)return true;const haystack=traitSearchText(trait,rootDoc);return tokens.every(token=>haystack.includes(token));}
function updateSearchStatus(count){const status=$('#traitSearchStatus');if(!searchQuery.trim()){status.textContent='';return;}status.textContent=count===1?'1 passendes Merkmal':`${count} passende Merkmale`;}

function renderTaxonomy(){
  const container=$('#taxonomy');container.replaceChildren();renderedRoots=new Map();const renderedSingleGroups=new Set();let matchCount=0;
  for(const [key,rootDoc] of mergedRoots()){
    const applicable=rootDoc.traits.filter(t=>traitApplies(t,state.sex,state.age));
    const visible=applicable.filter(t=>traitMatchesSearch(t,rootDoc));if(!visible.length)continue;matchCount+=visible.length;
    const block=document.createElement('section');block.className='taxonomy-root';block.id=`taxonomy-${slug(rootDoc.domain)}-${slug(rootDoc.root)}`;block.dataset.domain=rootDoc.domain;block.dataset.taxonomyRoot=rootDoc.root;
    const h2=document.createElement('h2');h2.className='taxonomy-root-title';h2.textContent=rootTitle(rootDoc.meta,rootDoc.root);block.append(h2);
    const groups=groupBy(visible,t=>traitTail(t).join('/')||'general');const renderedGroups=[];
    for(const [groupKey,traits] of groups){
      const parts=groupKey==='general'?[]:groupKey.split('/');
      const section=document.createElement('section');section.className='taxonomy-group';section.id=`taxonomy-${slug(rootDoc.domain)}-${slug(rootDoc.root)}-${slug(groupKey)}`;section.dataset.taxonomyPath=[rootDoc.root,...parts].join('/');
      const h3=document.createElement('h3');h3.textContent=pathLabel(parts);section.append(h3);
      const list=document.createElement('div');list.className='traits';
      for(const trait of traits){
        const singleGroup=trait.selection?.mode==='single'&&trait.selection?.group?trait.selection.group:null;
        if(singleGroup&&!renderedSingleGroups.has(singleGroup)){appendNoSpecification(list,singleGroup);renderedSingleGroups.add(singleGroup);}
        const label=document.createElement('label');label.className=`trait${searchQuery.trim()?' search-match':''}`;label.id=`trait-${slug(trait.id)}`;
        const input=document.createElement('input');input.type=singleGroup?'radio':'checkbox';if(input.type==='radio')input.name=`group-${singleGroup}`;input.checked=state.selected.has(trait.id);input.dataset.traitId=trait.id;
        const en=document.createElement('span');en.className='trait-en';en.textContent=trait.prompt||trait.label_en||'';
        const de=document.createElement('span');de.className='trait-de';de.textContent=trait.label_de||trait.label_en||trait.prompt||'';
        const description=document.createElement('span');description.className='trait-description';description.textContent=trait.description_de||'';
        label.append(input,en,de,description);list.append(label);
      }
      section.append(list);block.append(section);renderedGroups.push({groupKey,parts,traits,section});
    }
    container.append(block);renderedRoots.set(key,{...rootDoc,block,groups:renderedGroups});
  }
  if(searchQuery.trim()&&!matchCount){const empty=document.createElement('p');empty.className='panel message';empty.textContent='Keine passenden Merkmale gefunden.';container.append(empty);}
  updateSearchStatus(matchCount);renderOverview();
}

function selectedCount(traits){return traits.reduce((n,t)=>n+(state.selected.has(t.id)?1:0),0);}
function appendRootNav(nav,item){
  const heading=document.createElement('a');heading.className='nav-root';heading.href=`#${item.block.id}`;heading.textContent=rootTitle(item.meta,item.root);nav.append(heading);
  for(const group of item.groups){const count=selectedCount(group.traits);const a=document.createElement('a');a.className=`nav-link${count?' has-selection':''}`;a.href=`#${group.section.id}`;a.innerHTML=`<span class="nav-dot"></span><span>${pathLabel(group.parts)}</span><span class="nav-count">${count}</span>`;nav.append(a);}
}
function renderOverview(){
  const sexLabel=state.sex==='female'?'Frau':state.sex==='male'?'Mann':'Neutral';$('#personSummary').textContent=`${sexLabel} · ${state.age}`;
  const nav=$('#sectionNav');nav.replaceChildren();const totals=[];const assigned=new Set();
  for(const [,item] of mergedRoots()){const applicable=item.traits.filter(t=>traitApplies(t,state.sex,state.age));totals.push(`${rootTitle(item.meta,item.root)} ${selectedCount(applicable)}`);}
  for(const navGroup of NAV_GROUPS){
    const visible=navGroup.roots.map(root=>renderedRoots.get(rootKey(navGroup.id,root))).filter(Boolean);if(!visible.length)continue;
    const groupTitle=document.createElement('div');groupTitle.className='nav-main-group';groupTitle.textContent=navGroup.label;nav.append(groupTitle);
    for(const item of visible){assigned.add(rootKey(item.domain,item.root));appendRootNav(nav,item);}
  }
  const other=[...renderedRoots.entries()].filter(([key])=>!assigned.has(key));
  if(other.length){const groupTitle=document.createElement('div');groupTitle.className='nav-main-group';groupTitle.textContent='Sonstige';nav.append(groupTitle);for(const [,item] of other)appendRootNav(nav,item);}
  $('#selectionSummary').innerHTML=`<strong>${sexLabel} · ${state.age}</strong><span>${totals.join(' · ')}</span>`;
}

function updateOutput(){const safety=checkSafety(state.freeText,data.safety),message=$('#safetyMessage');if(!safety.ok){message.textContent=`Freie Ergänzung blockiert (${[...new Set(safety.matches.map(m=>m.category))].join(', ')}).`;message.className='message error';$('#promptOutput').value='';}else{const issues=validateSelection(state,traitIndex);message.textContent=issues.length?issues.join(' · '):'';message.className='message';const prompt=buildPrompt(state,traitIndex),finalSafety=checkSafety(prompt,data.safety);$('#promptOutput').value=finalSafety.ok?prompt:'';if(!finalSafety.ok){message.textContent='Der zusammengesetzte Prompt wurde durch die Sicherheitsprüfung blockiert.';message.className='message error';}}$('#negativeOutput').value=buildNegativePrompt(data.negative);saveState();renderOverview();}
function syncControls(){$('#sex').value=state.sex;$('#age').value=state.age;$('#freeText').value=state.freeText;}
async function copyText(text){if(navigator.clipboard&&window.isSecureContext){await navigator.clipboard.writeText(text);return;}const area=document.createElement('textarea');area.value=text;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.focus();area.select();const ok=document.execCommand('copy');area.remove();if(!ok)throw new Error('Kopieren fehlgeschlagen');}
function flash(button,text='Kopiert'){const old=button.textContent;button.textContent=text;setTimeout(()=>button.textContent=old,900);}

function currentProfileScope(){return $('#profileScope').value||'all';}
function renderProfiles(selected=''){const scope=currentProfileScope(),select=$('#profileSelect');select.innerHTML='<option value="">– Profil wählen –</option>';const entries=readProfiles().filter(p=>p.scope===scope).sort((a,b)=>a.name.localeCompare(b.name,'de'));for(const profile of entries){const o=document.createElement('option');o.value=o.textContent=profile.name;select.append(o);}select.value=selected;}
function saveProfile(){const name=$('#profileName').value.trim(),scope=currentProfileScope();if(!name){$('#profileMessage').textContent='Bitte Profilnamen eingeben.';return;}const profile={name,scope,selected:selectedForScope(state.selected,scope,traitScopeIndex)};if(scope==='all'||scope==='person'){profile.sex=state.sex;profile.age=state.age;}if(scope==='all')profile.freeText=state.freeText;writeProfiles(upsertProfile(readProfiles(),profile));renderProfiles(name);$('#profileMessage').textContent=`${scope==='all'?'Gesamtprofil':'Bereichsprofil'} „${name}“ gespeichert.`;}
function applyProfileSelection(profile){const scope=profile.scope||'all';if(scope==='all'||scope==='person'){state.sex=profile.sex||state.sex||'all';state.age=Math.max(18,Number(profile.age)||state.age||35);}if(scope==='all')state.freeText=profile.freeText||'';const base=new Set();if(scope!=='all')for(const id of state.selected){if(traitIndex.has(id)&&traitScopeIndex.get(id)!==scope)base.add(id);}state.selected=base;for(const id of profile.selected||[]){const trait=traitIndex.get(id);if(!trait)continue;if(scope!=='all'&&traitScopeIndex.get(id)!==scope)continue;if(!traitApplies(trait,state.sex,state.age))continue;selectTrait(state,trait,true,traitIndex);}}
function loadProfile(){const scope=currentProfileScope(),name=$('#profileSelect').value,p=findProfile(readProfiles(),scope,name);if(!p)return;applyProfileSelection(p);syncControls();renderTaxonomy();updateOutput();$('#profileName').value=name;$('#profileMessage').textContent=`Profil „${name}“ geladen.`;}
function deleteProfile(){const scope=currentProfileScope(),name=$('#profileSelect').value;if(!name)return;writeProfiles(deleteProfileEntry(readProfiles(),scope,name));renderProfiles();$('#profileName').value='';$('#profileMessage').textContent=`Profil „${name}“ gelöscht.`;}

async function init(){try{
  data=await loadData();traitIndex=buildTraitIndex(data.docs);traitScopeIndex=buildTraitScopeIndex(data.docs);restoreState();state.selected=new Set([...state.selected].filter(id=>traitIndex.has(id)));syncControls();renderTaxonomy();renderProfiles();updateOutput();
  $('#taxonomy').addEventListener('change',e=>{const clearGroup=e.target.dataset.clearGroup;if(clearGroup){clearSelectionGroup(clearGroup);renderTaxonomy();updateOutput();return;}const id=e.target.dataset.traitId;if(!id)return;selectTrait(state,traitIndex.get(id),e.target.checked,traitIndex);renderTaxonomy();updateOutput();});
  $('#traitSearch').addEventListener('input',e=>{searchQuery=e.target.value;renderTaxonomy();});
  $('#traitSearch').addEventListener('keydown',e=>{if(e.key==='Escape'&&e.target.value){e.preventDefault();e.target.value='';searchQuery='';renderTaxonomy();}});
  $('#clearTraitSearch').addEventListener('click',()=>{searchQuery='';$('#traitSearch').value='';renderTaxonomy();$('#traitSearch').focus();});
  $('#sex').addEventListener('change',e=>{state.sex=e.target.value;renderTaxonomy();updateOutput();});$('#age').addEventListener('change',e=>{state.age=Math.max(18,Number(e.target.value)||18);e.target.value=state.age;renderTaxonomy();updateOutput();});$('#freeText').addEventListener('input',e=>{state.freeText=e.target.value;updateOutput();});
  $('#reset').addEventListener('click',()=>{clearState();syncControls();renderTaxonomy();updateOutput();});$('#profileScope').addEventListener('change',()=>{renderProfiles();$('#profileName').value='';$('#profileMessage').textContent='';});$('#profileSelect').addEventListener('change',e=>{$('#profileName').value=e.target.value;});$('#saveProfile').addEventListener('click',saveProfile);$('#loadProfile').addEventListener('click',loadProfile);$('#deleteProfile').addEventListener('click',deleteProfile);
  document.addEventListener('click',async e=>{const target=e.target.dataset.copy;if(!target)return;try{await copyText(document.getElementById(target).value);flash(e.target);}catch(err){$('#safetyMessage').textContent=err.message;}});
  $('#copyAll').addEventListener('click',async e=>{const positive=$('#promptOutput').value,negative=$('#negativeOutput').value,text=`${positive}\n\nNEGATIVE:\n${negative}`;try{await copyText(text);flash(e.target);}catch(err){$('#safetyMessage').textContent=err.message;}});
}catch(error){$('#taxonomy').innerHTML=`<p class="message error">${error.message}. Bitte über einen lokalen HTTP-Server starten, nicht als file://.</p>`;}}
init();
