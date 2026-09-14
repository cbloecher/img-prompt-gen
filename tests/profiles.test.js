import test from 'node:test';
import assert from 'node:assert/strict';
import { selectTrait } from '../js/generator.js';
import {
  PROFILE_KEY_V1,
  PROFILE_KEY_V2,
  readProfiles,
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

const navGroups = [
  { id: 'person', categories: ['body', 'hair'] },
  { id: 'scene', categories: ['environment'] },
  { id: 'image', categories: ['lighting'] }
];
const docs = [
  { meta: { category: 'body' }, traits: [{ id: 'body-a' }] },
  { meta: { category: 'environment' }, traits: [{ id: 'scene-a' }] },
  { meta: { category: 'lighting' }, traits: [{ id: 'image-a' }] },
  { meta: { category: 'custom' }, traits: [{ id: 'other-a' }] }
];

test('legacy profiles migrate to Gesamt profiles', () => {
  const storage = new MemoryStorage({
    [PROFILE_KEY_V1]: JSON.stringify({ Alt: { sex: 'female', age: 42, selected: ['body-a'], freeText: 'soft light' } })
  });
  const profiles = readProfiles(storage);
  assert.equal(profiles.length, 1);
  assert.deepEqual(profiles[0], { name: 'Alt', scope: 'all', selected: ['body-a'], sex: 'female', age: 42, freeText: 'soft light' });
  assert.ok(storage.getItem(PROFILE_KEY_V2));
});

test('scoped selection only returns traits from requested area', () => {
  const index = buildTraitScopeIndex(docs, navGroups);
  const selected = new Set(['body-a', 'scene-a', 'image-a', 'other-a']);
  assert.deepEqual(selectedForScope(selected, 'person', index), ['body-a']);
  assert.deepEqual(selectedForScope(selected, 'scene', index), ['scene-a']);
  assert.deepEqual(selectedForScope(selected, 'image', index), ['image-a']);
  assert.deepEqual(selectedForScope(selected, 'other', index), ['other-a']);
});

test('loading a scoped profile replaces only that area and ignores stale ids', () => {
  const index = buildTraitScopeIndex(docs, navGroups);
  const valid = new Set(index.keys());
  const merged = mergeScopedSelection(new Set(['body-a', 'scene-a']), ['image-a', 'stale'], 'image', index, valid);
  assert.deepEqual([...merged].sort(), ['body-a', 'image-a', 'scene-a']);
});

test('exclusive trait groups remain exclusive when profile traits are applied', () => {
  const a = { id: 'brown', selection: { mode: 'single', group: 'hair_color' }, conflicts: [], implies: [] };
  const b = { id: 'blonde', selection: { mode: 'single', group: 'hair_color' }, conflicts: [], implies: [] };
  const index = new Map([[a.id, a], [b.id, b]]);
  const profileState = { selected: new Set() };
  selectTrait(profileState, a, true, index);
  selectTrait(profileState, b, true, index);
  assert.deepEqual([...profileState.selected], ['blonde']);
});

test('profile CRUD is unique by scope and name', () => {
  let profiles = [];
  profiles = upsertProfile(profiles, { scope: 'person', name: 'A', selected: ['body-a'] });
  profiles = upsertProfile(profiles, { scope: 'scene', name: 'A', selected: ['scene-a'] });
  profiles = upsertProfile(profiles, { scope: 'person', name: 'A', selected: [] });
  assert.equal(profiles.length, 2);
  assert.deepEqual(profiles.find(p => p.scope === 'person').selected, []);
  profiles = deleteProfileEntry(profiles, 'person', 'A');
  assert.equal(profiles.length, 1);
  assert.equal(profiles[0].scope, 'scene');
});
