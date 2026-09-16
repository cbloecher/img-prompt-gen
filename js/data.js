export const TRAIT_FILES = [
  'person/identity.json',
  'person/body.json',
  'person/body-height.json',
  'person/face.json',
  'person/face-eye-color.json',
  'person/skin.json',
  'person/skin-marks.json',
  'person/hair.json',
  'person/hair-color-effects.json',
  'person/expression.json',
  'person/expression-facial-configuration.json',
  'person/head-gaze.json',
  'person/pose.json',
  'person/pose-naturalism.json',
  'person/wearables.json',

  'scene/clothing.json',
  'scene/clothing-expanded.json',
  'scene/location.json',
  'scene/location-expanded.json',
  'scene/environment.json',
  'scene/environment-atmosphere.json',
  'scene/weather-time.json',
  'scene/background.json',
  'scene/objects.json',
  'scene/interaction.json',
  'scene/person-to-person.json',
  'scene/situation.json',

  'image/camera.json',
  'image/perspective.json',
  'image/framing.json',
  'image/composition.json',
  'image/lighting.json',
  'image/focus-depth-of-field.json',
  'image/shot-style.json',
  'image/mood.json',
  'image/style-medium.json',
  'image/style-medium-color-rendering.json',
  'image/effects.json',
  'image/realism.json'
];

function mergeSearchAliases(docs, aliasConfig) {
  const traitIndex = new Map();
  for (const doc of docs) for (const trait of doc.traits || []) traitIndex.set(trait.id, trait);

  for (const entry of aliasConfig.entries || []) {
    const trait = traitIndex.get(entry.trait_id);
    if (!trait) throw new Error(`Alias verweist auf unbekanntes Trait: ${entry.trait_id}`);
    const aliases = [...new Set([...(trait.aliases || []), ...(entry.aliases || [])])];
    trait.aliases = aliases;
    // The current search already indexes tags. Mirror aliases there until aliases
    // are consumed directly by every search/import component.
    trait.tags = [...new Set([...(trait.tags || []), ...aliases])];
  }
}

export async function loadData() {
  const docs = await Promise.all(TRAIT_FILES.map(async path => {
    const response = await fetch(`data/${path}`);
    if (!response.ok) throw new Error(`Kann data/${path} nicht laden (${response.status})`);
    const doc = await response.json();
    if (doc.schema_version !== 2) throw new Error(`data/${path} verwendet nicht Schema v2`);
    return doc;
  }));

  const aliasesResponse = await fetch('data/search-aliases.json');
  if (!aliasesResponse.ok) throw new Error('Kann data/search-aliases.json nicht laden');
  const aliases = await aliasesResponse.json();
  mergeSearchAliases(docs, aliases);

  const safetyResponse = await fetch('data/safety.json');
  if (!safetyResponse.ok) throw new Error('Kann data/safety.json nicht laden');
  const safety = await safetyResponse.json();

  let negative = { traits: [] };
  try {
    const response = await fetch('data/negative.json');
    if (response.ok) negative = await response.json();
  } catch (_) { /* negative prompts are optional */ }

  return { docs, safety, negative, aliases };
}
