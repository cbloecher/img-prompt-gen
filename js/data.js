export const TRAIT_FILES = [
  'age.json', 'body.json', 'face.json', 'hair.json', 'hair-color-effects.json', 'skin.json',
  'pose.json', 'expression.json', 'gaze.json', 'mood.json',
  'shot-style.json', 'realism.json'
];

export async function loadData() {
  const docs = await Promise.all(TRAIT_FILES.map(async file => {
    const response = await fetch(`data/${file}`);
    if (!response.ok) throw new Error(`Kann data/${file} nicht laden (${response.status})`);
    return response.json();
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
