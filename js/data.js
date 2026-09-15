export const TRAIT_FILES = [
  { path:'person/identity.json', domain:'person' },
  { path:'person/body.json', domain:'person' },
  { path:'person/face.json', domain:'person' },
  { path:'person/skin.json', domain:'person' },
  { path:'person/hair.json', domain:'person' },
  { path:'person/hair-color-effects.json', domain:'person' },
  { path:'person/expression.json', domain:'person' },
  { path:'person/head-gaze.json', domain:'person' },
  { path:'person/pose.json', domain:'person' },
  { path:'person/pose-naturalism.json', domain:'person' },
  { path:'person/wearables.json', domain:'person' },

  // Scene/image are still stored as v1 files for now. They are normalized to
  // the v2 domain + taxonomy[] model at load time so the application itself
  // only works with one structural representation.
  { path:'weather-time.json', domain:'scene' },
  { path:'background.json', domain:'scene' },
  { path:'mood.json', domain:'image' },
  { path:'focus-depth-of-field.json', domain:'image' },
  { path:'shot-style.json', domain:'image' },
  { path:'style-medium.json', domain:'image' },
  { path:'realism.json', domain:'image' }
];

function normalizeLegacyDoc(doc, fallbackDomain) {
  if (doc.schema_version === 2) {
    const domain = doc.meta?.domain || fallbackDomain || 'other';
    const root = Array.isArray(doc.meta?.taxonomy) ? doc.meta.taxonomy : [];
    return {
      ...doc,
      meta: { ...doc.meta, domain, taxonomy: root },
      traits: (doc.traits || []).map(trait => ({
        ...trait,
        domain: trait.domain || domain,
        taxonomy: Array.isArray(trait.taxonomy) ? trait.taxonomy : root
      }))
    };
  }

  const domain = fallbackDomain || 'other';
  const root = doc.meta?.category || 'other';
  const meta = {
    domain,
    taxonomy: [root],
    title_en: doc.meta?.title_en || root,
    title_de: doc.meta?.title_de || root,
    description_en: doc.meta?.description_en || '',
    description_de: doc.meta?.description_de || '',
    guidance: doc.meta?.guidance || {}
  };

  const traits = (doc.traits || []).map(trait => {
    const tail = trait.subcategory && trait.subcategory !== 'general' ? [trait.subcategory] : [];
    const { category: _category, subcategory: _subcategory, ...rest } = trait;
    return { ...rest, domain, taxonomy: [root, ...tail] };
  });

  return { schema_version: 2, meta, traits };
}

export async function loadData() {
  const docs = await Promise.all(TRAIT_FILES.map(async entry => {
    const response = await fetch(`data/${entry.path}`);
    if (!response.ok) throw new Error(`Kann data/${entry.path} nicht laden (${response.status})`);
    return normalizeLegacyDoc(await response.json(), entry.domain);
  }));

  const safetyResponse = await fetch('data/safety.json');
  if (!safetyResponse.ok) throw new Error('Kann data/safety.json nicht laden');
  const safety = await safetyResponse.json();

  let negative = { traits: [] };
  try {
    const response = await fetch('data/negative.json');
    if (response.ok) negative = await response.json();
  } catch (_) { /* negative prompts are optional */ }

  return { docs, safety, negative };
}
