import test from 'node:test';
import assert from 'node:assert/strict';
import { selectTrait } from '../js/generator.js';
import {
  PROFILE_KEY_V3,
  readProfiles,
  writeProfiles,
  upsertProfile,
  deleteProfileEntry,
  buildTraitScopeIndex,
  selectedForScope,
  mergeScopedSelection
} from '../js/profiles.js';

class MemoryStorage {
  constructor(seed = {}) { this.map = new Map(Object.entries(seed)); }
  getItem(key) { return this.map.has(key) ? this.map.get(key) : null; }
  setItem(key, value) { this.map.set(key, String(value)); }
}

const docs = [
  { meta: { domain: 'person', taxonomy: ['body'] }, traits: [{ id: 'person.body.a', domain: 'person', taxonomy: ['body'] }] },
  { meta: { domain: 'scene', taxonomy: ['environment'] }, traits: [{ id: 'scene.environment.a', domain: 'scene', taxonomy: ['environment'] }] },
  { meta: { domain: 'image', taxonomy: ['lighting'] }, traits: [{ id: 'image.lighting.a', domain: 'image', taxonomy: ['lighting'] }] },
  { meta: { domain: 'other', taxonomy: ['custom'] }, traits: [{ id: 'other.custom.a', domain: 'other', taxonomy: ['custom'] }] }
];

test('profiles use the v3 store without legacy migration', () => {
  const storage = new MemoryStorage();
  const expected = [{ name: 'Neu', scope: 'person', selected: ['person.body.a'], sex: 'female', age: 42 }];
  writeProfiles(expected, storage);
  assert.equal(storage.getItem(PROFILE_KEY_V3), JSON.stringify(expected));
  assert.deepEqual(readProfiles(storage), expected);
});

test('scoped selection follows trait domains', () => {
  const index = buildTraitScopeIndex(docs);
  const selected = new Set(['person.body.a', 'scene.environment.a', 'image.lighting.a', 'other.custom.a']);
  assert.deepEqual(selectedForScope(selected, 'person', index), ['person.body.a']);
  assert.deepEqual(selectedForScope(selected, 'scene', index), ['scene.environment.a']);
  assert.deepEqual(selectedForScope(selected, 'image', index), ['image.lighting.a']);
  assert.deepEqual(selectedForScope(selected, 'other', index), ['other.custom.a']);
});

test('loading a scoped profile replaces only that domain and ignores stale ids', () => {
  const index = buildTraitScopeIndex(docs);
  const valid = new Set(index.keys());
  const merged = mergeScopedSelection(
    new Set(['person.body.a', 'scene.environment.a']),
    ['image.lighting.a', 'stale'],
    'image',
    index,
    valid
  );
  assert.deepEqual([...merged].sort(), ['image.lighting.a', 'person.body.a', 'scene.environment.a']);
});

test('exclusive hierarchical trait groups remain exclusive', () => {
  const a = { id: 'person.hair_color_effects.base_color.brown', selection: { mode: 'single', group: 'person.hair_color_effects.base_color' }, conflicts: [], implies: [] };
  const b = { id: 'person.hair_color_effects.base_color.blonde', selection: { mode: 'single', group: 'person.hair_color_effects.base_color' }, conflicts: [], implies: [] };
  const index = new Map([[a.id, a], [b.id, b]]);
  const profileState = { selected: new Set() };
  selectTrait(profileState, a, true, index);
  selectTrait(profileState, b, true, index);
  assert.deepEqual([...profileState.selected], [b.id]);
});

test('profile CRUD is unique by scope and name', () => {
  let profiles = [];
  profiles = upsertProfile(profiles, { scope: 'person', name: 'A', selected: ['person.body.a'] });
  profiles = upsertProfile(profiles, { scope: 'scene', name: 'A', selected: ['scene.environment.a'] });
  profiles = upsertProfile(profiles, { scope: 'person', name: 'A', selected: [] });
  assert.equal(profiles.length, 2);
  assert.deepEqual(profiles.find(p => p.scope === 'person').selected, []);
  profiles = deleteProfileEntry(profiles, 'person', 'A');
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].scope, 'scene');
});
