import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { TRAIT_FILES } from '../js/data.js';

async function readJson(path) {
  return JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
}

async function traitIds() {
  const ids = new Set();
  for (const path of TRAIT_FILES) {
    const doc = await readJson(`data/${path}`);
    for (const trait of doc.traits || []) ids.add(trait.id);
  }
  return ids;
}

test('search aliases reference existing canonical traits', async () => {
  const config = await readJson('data/search-aliases.json');
  const ids = await traitIds();
  assert.equal(config.schema_version, 1);
  assert.ok(config.entries.length >= 20);

  for (const entry of config.entries) {
    assert.ok(ids.has(entry.trait_id), `unknown alias target: ${entry.trait_id}`);
    assert.ok(Array.isArray(entry.aliases) && entry.aliases.length > 0, entry.trait_id);
    assert.equal(new Set(entry.aliases).size, entry.aliases.length, `duplicate alias in ${entry.trait_id}`);
    assert.ok(Array.isArray(entry.sources) && entry.sources.length > 0, `${entry.trait_id}: sources`);
  }
});

test('trait-local aliases and prompt_terms use string arrays when present', async () => {
  for (const path of TRAIT_FILES) {
    const doc = await readJson(`data/${path}`);
    for (const trait of doc.traits || []) {
      if ('aliases' in trait) {
        assert.ok(Array.isArray(trait.aliases), `${trait.id}: aliases must be an array`);
        assert.ok(trait.aliases.every(v => typeof v === 'string' && v.trim()), `${trait.id}: invalid alias`);
      }
      if ('prompt_terms' in trait) {
        assert.ok(Array.isArray(trait.prompt_terms), `${trait.id}: prompt_terms must be an array`);
        assert.ok(trait.prompt_terms.every(v => typeof v === 'string' && v.trim()), `${trait.id}: invalid prompt term`);
      }
    }
  }
});
