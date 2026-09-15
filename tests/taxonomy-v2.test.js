import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const DOMAIN_FILES = {
  person: [
    'identity.json', 'body.json', 'face.json', 'skin.json', 'hair.json',
    'hair-color-effects.json', 'expression.json', 'head-gaze.json', 'pose.json',
    'pose-naturalism.json', 'wearables.json'
  ],
  scene: [
    'clothing.json', 'location.json', 'environment.json', 'weather-time.json',
    'background.json', 'objects.json', 'interaction.json', 'situation.json'
  ],
  image: [
    'camera.json', 'perspective.json', 'framing.json', 'composition.json',
    'lighting.json', 'focus-depth-of-field.json', 'shot-style.json', 'mood.json',
    'style-medium.json', 'realism.json'
  ]
};

async function readJson(path) {
  return JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
}

test('all taxonomy files use schema v2 domain + taxonomy only', async () => {
  const ids = new Set();
  for (const [domain, files] of Object.entries(DOMAIN_FILES)) {
    for (const file of files) {
      const doc = await readJson(`data/${domain}/${file}`);
      assert.equal(doc.schema_version, 2, `${domain}/${file}`);
      assert.equal(doc.meta.domain, domain, `${domain}/${file}`);
      assert.ok(Array.isArray(doc.meta.taxonomy) && doc.meta.taxonomy.length > 0, `${domain}/${file}`);
      assert.equal('category' in doc.meta, false, `${domain}/${file}: legacy meta.category`);
      assert.equal('subcategory' in doc.meta, false, `${domain}/${file}: legacy meta.subcategory`);
      assert.ok(doc.meta.title_en && doc.meta.title_de, `${domain}/${file}: bilingual title`);

      for (const trait of doc.traits || []) {
        assert.equal(trait.domain, domain, trait.id);
        assert.ok(Array.isArray(trait.taxonomy) && trait.taxonomy.length > 0, trait.id);
        assert.ok(trait.id.startsWith(`${domain}.`), trait.id);
        assert.equal('category' in trait, false, `${trait.id}: legacy category`);
        assert.equal('subcategory' in trait, false, `${trait.id}: legacy subcategory`);
        assert.equal(ids.has(trait.id), false, `duplicate id: ${trait.id}`);
        ids.add(trait.id);
        assert.ok(trait.prompt && trait.label_en && trait.label_de, `${trait.id}: labels/prompt`);
        assert.ok(trait.description_en != null && trait.description_de != null, `${trait.id}: descriptions`);
        if (trait.selection?.group != null) assert.match(trait.selection.group, new RegExp(`^${domain}\\.[a-z0-9_.]+$`));
      }
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

test('scene objects do not imply interaction semantics', async () => {
  const doc = await readJson('data/scene/objects.json');
  assert.ok(doc.traits.length > 0);
  for (const trait of doc.traits) assert.deepEqual(trait.implies, [], trait.id);
});

test('image realism does not duplicate shot-style or lighting roots', async () => {
  const doc = await readJson('data/image/realism.json');
  for (const trait of doc.traits) {
    assert.equal(trait.taxonomy[0], 'realism');
    assert.notEqual(trait.prompt, 'natural available light');
    assert.notEqual(trait.prompt, 'documentary photography');
    assert.notEqual(trait.prompt, 'candid portrait photography');
  }
});
