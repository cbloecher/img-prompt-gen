export const DOMAIN_ORDER = { person: 10, scene: 20, image: 30, other: 99 };

export const ROOT_ORDER = {
  'person.identity': 10,
  'person.body': 20,
  'person.face': 30,
  'person.skin': 40,
  'person.hair': 50,
  'person.hair_color_effects': 55,
  'person.expression': 60,
  'person.head_gaze': 70,
  'person.pose': 80,
  'person.wearables': 90,

  'scene.clothing': 110,
  'scene.location': 120,
  'scene.environment': 130,
  'scene.weather_time': 135,
  'scene.background': 145,
  'scene.objects': 150,
  'scene.interaction': 155,
  'scene.situation': 160,

  'image.camera': 165,
  'image.perspective': 168,
  'image.framing': 169,
  'image.composition': 170,
  'image.lighting': 175,
  'image.focus_depth_of_field': 185,
  'image.shot_style': 190,
  'image.mood': 195,
  'image.style_medium': 200,
  'image.realism': 210
};

function taxonomyRoot(trait) {
  return Array.isArray(trait.taxonomy) && trait.taxonomy.length ? trait.taxonomy[0] : 'other';
}

function traitOrder(trait) {
  const domain = trait.domain || 'other';
  const key = `${domain}.${taxonomyRoot(trait)}`;
  return ROOT_ORDER[key] ?? ((DOMAIN_ORDER[domain] ?? 99) * 1000 + 999);
}

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
  selected.sort((a, b) => {
    const rootDiff = traitOrder(a) - traitOrder(b);
    if (rootDiff) return rootDiff;
    const pathDiff = (a.taxonomy || []).join('.').localeCompare((b.taxonomy || []).join('.'));
    return pathDiff || a.id.localeCompare(b.id);
  });
  const person = state.sex === 'female' ? `${state.age}-year-old woman` : state.sex === 'male' ? `${state.age}-year-old man` : `${state.age}-year-old adult person`;
  return [person, ...selected.map(t => t.prompt), state.freeText.trim()].filter(Boolean).join(', ');
}

export function buildNegativePrompt(negative) {
  return (negative.traits || []).map(t => t.prompt).filter(Boolean).join(', ');
}
