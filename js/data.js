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

export async function loadData() {
  const docs = await Promise.all(TRAIT_FILES.map(async path => {
    const response = await fetch(`data/${path}`);
    if (!response.ok) throw new Error(`Kann data/${path} nicht laden (${response.status})`);
    const doc = await response.json();
    if (doc.schema_version !== 2) throw new Error(`data/${path} verwendet nicht Schema v2`);
    return doc;
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
