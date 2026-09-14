export const PROFILE_KEY_V1 = 'img-prompt-gen-profiles-v1';
export const PROFILE_KEY_V2 = 'img-prompt-gen-profiles-v2';

export const PROFILE_SCOPES = [
  { id: 'all', label: 'Gesamt' },
  { id: 'person', label: 'Person' },
  { id: 'scene', label: 'Szene' },
  { id: 'image', label: 'Bild' },
  { id: 'other', label: 'Sonstige' }
];

export function readProfiles(storage = localStorage) {
  try {
    const current = JSON.parse(storage.getItem(PROFILE_KEY_V2) || 'null');
    if (Array.isArray(current)) return current;
  } catch (_) {}

  let legacy = {};
  try { legacy = JSON.parse(storage.getItem(PROFILE_KEY_V1) || '{}') || {}; } catch (_) {}
  const migrated = Object.entries(legacy).map(([name, profile]) => ({
    name,
    scope: 'all',
    selected: Array.isArray(profile?.selected) ? profile.selected : [],
    sex: profile?.sex || 'all',
    age: Number(profile?.age) || 35,
    freeText: profile?.freeText || ''
  }));
  if (migrated.length) writeProfiles(migrated, storage);
  return migrated;
}

export function writeProfiles(profiles, storage = localStorage) {
  storage.setItem(PROFILE_KEY_V2, JSON.stringify(profiles));
}

export function upsertProfile(profiles, profile) {
  const next = profiles.filter(p => !(p.scope === profile.scope && p.name === profile.name));
  next.push(profile);
  return next;
}

export function deleteProfileEntry(profiles, scope, name) {
  return profiles.filter(p => !(p.scope === scope && p.name === name));
}

export function findProfile(profiles, scope, name) {
  return profiles.find(p => p.scope === scope && p.name === name) || null;
}

export function categoryToScope(category, navGroups) {
  for (const group of navGroups) if (group.categories.includes(category)) return group.id;
  return 'other';
}

export function buildTraitScopeIndex(docs, navGroups) {
  const map = new Map();
  for (const doc of docs) {
    const category = doc.meta?.category || 'other';
    const scope = categoryToScope(category, navGroups);
    for (const trait of doc.traits || []) map.set(trait.id, scope);
  }
  return map;
}

export function selectedForScope(selected, scope, traitScopeIndex) {
  const ids = [...selected].filter(id => traitScopeIndex.has(id));
  if (scope === 'all') return ids;
  return ids.filter(id => traitScopeIndex.get(id) === scope);
}

export function mergeScopedSelection(currentSelected, incomingSelected, scope, traitScopeIndex, validIds) {
  const current = new Set([...currentSelected].filter(id => validIds.has(id)));
  if (scope === 'all') return new Set([...incomingSelected].filter(id => validIds.has(id)));
  for (const id of [...current]) if (traitScopeIndex.get(id) === scope) current.delete(id);
  for (const id of incomingSelected) if (validIds.has(id) && traitScopeIndex.get(id) === scope) current.add(id);
  return current;
}
