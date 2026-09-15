import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const PERSON_FILES = [
  'identity.json', 'body.json', 'face.json', 'skin.json', 'hair.json',
  'hair-color-effects.json', 'expression.json', 'head-gaze.json', 'pose.json', 'wearables.json'
];

async function readJson(path) {
  return JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
}

test('all person files use schema v2 domain + taxonomy only', async () => {
  const ids = new Set();
  for (const file of PERSON_FILES) {
    const doc = await readJson(`data/person/${file}`);
    assert.equal(doc.schema_version, 2, file);
    assert.equal(doc.meta.domain, 'person', file);
    assert.ok(Array.isArray(doc.meta.taxonomy) && doc.meta.taxonomy.length > 0, file);
    assert.equal('category' in doc.meta, false, `${file}: legacy meta.category`);
    assert.equal('subcategory' in doc.meta, false, `${file}: legacy meta.subcategory`);

    for (const trait of doc.traits || []) {
      assert.equal(trait.domain, 'person', trait.id);
      assert.ok(Array.isArray(trait.taxonomy) && trait.taxonomy.length > 0, trait.id);
      assert.ok(trait.id.startsWith('person.'), trait.id);
      assert.equal('category' in trait, false, `${trait.id}: legacy category`);
      assert.equal('subcategory' in trait, false, `${trait.id}: legacy subcategory`);
      assert.equal(ids.has(trait.id), false, `duplicate id: ${trait.id}`);
      ids.add(trait.id);
      if (trait.selection?.group != null) assert.match(trait.selection.group, /^person\.[a-z0-9_.]+$/);
    }
  }
  assert.ok(ids.size > 0);
});

test('ancestry/ethnicity traits do not imply physical traits', async () => {
  const doc = await readJson('data/person/identity.json');
  const traits = doc.traits.filter(t => t.taxonomy?.includes('ancestry_ethnicity'));
  assert.ok(traits.length > 0);
  for (const trait of traits) assert.deepEqual(trait.implies, [], trait.id);
});

test('skin tone is independent and mutually exclusive', async () => {
  const doc = await readJson('data/person/skin.json');
  const tones = doc.traits.filter(t => t.taxonomy?.[0] === 'skin' && t.taxonomy?.[1] === 'tone' && t.selection?.group === 'person.skin.tone');
  assert.ok(tones.length >= 6);
  for (const trait of tones) assert.equal(trait.selection.mode, 'single');
});
