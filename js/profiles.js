export const PROFILE_KEY_V3 = 'img-prompt-gen-profiles-v3';

export const PROFILE_SCOPES = [
  { id: 'all', label: 'Gesamt' },
  { id: 'person', label: 'Person' },
  { id: 'scene', label: 'Szene' },
  { id: 'image', label: 'Bild' },
  { id: 'other', label: 'Sonstige' }
];

export function readProfiles(storage = localStorage) {
  try {
    const current = JSON.parse(storage.getItem(PROFILE_KEY_V3) || '[]');
    return Array.isArray(current) ? current : [];
  } catch (_) { return []; }
}

export function writeProfiles(profiles, storage = localStorage) {
  storage.setItem(PROFILE_KEY_V3, JSON.stringify(profiles));
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

export function buildTraitScopeIndex(docs) {
  const map = new Map();
  for (const doc of docs) {
    const fallbackDomain = doc.meta?.domain || 'other';
    for (const trait of doc.traits || []) {
      const domain = trait.domain || fallbackDomain;
      map.set(trait.id, ['person','scene','image'].includes(domain) ? domain : 'other');
    }
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
