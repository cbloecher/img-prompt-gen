import { loadData } from './data.js';
import { state, restoreState, saveState, clearState } from './state.js';
import { checkSafety } from './safety.js';
import { buildTraitIndex, traitApplies, selectTrait, validateSelection, buildPrompt, buildNegativePrompt } from './generator.js';

const $ = selector => document.querySelector(selector);
let data, traitIndex;

function renderCategories() {
  const root = $('#categories');
  root.replaceChildren();
  for (const doc of data.docs) {
    const visible = (doc.traits || []).filter(t => traitApplies(t, state.sex, state.age));
    if (!visible.length) continue;
    const details = document.createElement('details');
    details.open = ['body', 'face', 'skin'].includes(doc.meta?.category);
    const summary = document.createElement('summary');
    summary.textContent = doc.meta?.title_de || doc.meta?.category || 'Merkmale';
    details.append(summary);

    const groups = Map.groupBy(visible, t => t.subcategory || 'general');
    for (const [subcategory, traits] of groups) {
      const section = document.createElement('section'); section.className = 'subcategory';
      const h3 = document.createElement('h3'); h3.textContent = subcategory.replaceAll('_', ' '); section.append(h3);
      const list = document.createElement('div'); list.className = 'traits';
      for (const trait of traits) {
        const label = document.createElement('label'); label.className = 'trait';
        const input = document.createElement('input');
        input.type = trait.selection?.mode === 'single' && trait.selection?.group ? 'radio' : 'checkbox';
        if (input.type === 'radio') input.name = `group-${trait.selection.group}`;
        input.checked = state.selected.has(trait.id); input.dataset.traitId = trait.id;
        const text = document.createElement('span');
        text.append(document.createTextNode(trait.label_de || trait.label_en || trait.prompt));
        const small = document.createElement('small'); small.textContent = `${trait.prompt} — ${trait.description_de || ''}`; text.append(small);
        label.append(input, text); list.append(label);
      }
      section.append(list); details.append(section);
    }
    root.append(details);
  }
}

function updateOutput() {
  const safety = checkSafety(state.freeText, data.safety);
  const message = $('#safetyMessage');
  if (!safety.ok) {
    message.textContent = `Freie Ergänzung blockiert (${[...new Set(safety.matches.map(m => m.category))].join(', ')}).`;
    message.className = 'message error';
    $('#promptOutput').value = '';
  } else {
    const issues = validateSelection(state, traitIndex);
    message.textContent = issues.length ? issues.join(' · ') : '';
    message.className = 'message';
    const prompt = buildPrompt(state, traitIndex);
    const finalSafety = checkSafety(prompt, data.safety);
    $('#promptOutput').value = finalSafety.ok ? prompt : '';
    if (!finalSafety.ok) { message.textContent = 'Der zusammengesetzte Prompt wurde durch die Sicherheitsprüfung blockiert.'; message.className = 'message error'; }
  }
  $('#negativeOutput').value = buildNegativePrompt(data.negative);
  saveState();
}

function syncControls() {
  $('#sex').value = state.sex; $('#age').value = state.age; $('#freeText').value = state.freeText;
}

async function init() {
  try {
    data = await loadData(); traitIndex = buildTraitIndex(data.docs); restoreState(); syncControls(); renderCategories(); updateOutput();

    $('#categories').addEventListener('change', event => {
      const id = event.target.dataset.traitId; if (!id) return;
      selectTrait(state, traitIndex.get(id), event.target.checked, traitIndex); renderCategories(); updateOutput();
    });
    $('#sex').addEventListener('change', event => { state.sex = event.target.value; renderCategories(); updateOutput(); });
    $('#age').addEventListener('change', event => { state.age = Math.max(18, Number(event.target.value) || 18); event.target.value = state.age; renderCategories(); updateOutput(); });
    $('#freeText').addEventListener('input', event => { state.freeText = event.target.value; updateOutput(); });
    $('#reset').addEventListener('click', () => { clearState(); syncControls(); renderCategories(); updateOutput(); });
    document.addEventListener('click', async event => {
      const target = event.target.dataset.copy; if (!target) return;
      await navigator.clipboard.writeText(document.getElementById(target).value);
      const old = event.target.textContent; event.target.textContent = 'Kopiert'; setTimeout(() => event.target.textContent = old, 900);
    });
  } catch (error) {
    $('#categories').innerHTML = `<p class="message error">${error.message}. Bitte über einen lokalen HTTP-Server starten, nicht als file://.</p>`;
  }
}

init();
