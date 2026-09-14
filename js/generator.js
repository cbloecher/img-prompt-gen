export const CATEGORY_ORDER = {
  age: 10, body: 20, face: 30, skin: 40, hair: 50,
  hair_color_effects: 55, expression: 60, gaze: 70, pose: 80,
  weather_time: 135, background: 145,
  mood: 170, focus_depth_of_field: 180, shot_style: 190,
  style_medium: 200, realism: 210
};

export function traitApplies(trait, sex, age) {
  const applies = trait.applies_to || ['all'];
  if (sex !== 'all' && !applies.includes('all') && !applies.includes(sex)) return false;
  const range = trait.age_range || {};
  if (range.min != null && age < range.min) return false;
  if (range.max != null && age > range.max) return false;
  return true;
}

export function buildTraitIndex(docs) {
  const map = new Map();
  docs.flatMap(doc => doc.traits || []).forEach(trait => map.set(trait.id, trait));
  return map;
}

export function selectTrait(state, trait, checked, traitIndex) {
  if (!checked) { state.selected.delete(trait.id); return; }

  const selection = trait.selection || {};
  if (selection.mode === 'single' && selection.group) {
    for (const id of [...state.selected]) {
      const other = traitIndex.get(id);
      if (other?.selection?.group === selection.group) state.selected.delete(id);
    }
  }
  for (const conflict of trait.conflicts || []) state.selected.delete(conflict);
  state.selected.add(trait.id);
  for (const implied of trait.implies || []) if (traitIndex.has(implied)) state.selected.add(implied);
}

export function validateSelection(state, traitIndex) {
  const issues = [];
  for (const id of state.selected) {
    const trait = traitIndex.get(id);
    if (!trait) continue;
    for (const required of trait.requires || []) {
      if (!state.selected.has(required)) issues.push(`${trait.label_de || id} benötigt ${traitIndex.get(required)?.label_de || required}`);
    }
  }
  return issues;
}

export function buildPrompt(state, traitIndex) {
  const selected = [...state.selected].map(id => traitIndex.get(id)).filter(Boolean);
  selected.sort((a, b) => (CATEGORY_ORDER[a.category] ?? 999) - (CATEGORY_ORDER[b.category] ?? 999));
  const person = state.sex === 'female' ? `${state.age}-year-old woman` : state.sex === 'male' ? `${state.age}-year-old man` : `${state.age}-year-old adult person`;
  return [person, ...selected.map(t => t.prompt), state.freeText.trim()].filter(Boolean).join(', ');
}

export function buildNegativePrompt(negative) {
  return (negative.traits || []).map(t => t.prompt).filter(Boolean).join(', ');
}
