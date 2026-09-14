function normalize(text, config = {}) {
  let value = String(text || '');
  if (config.unicode_normalization) value = value.normalize(config.unicode_normalization);
  if (config.lowercase) value = value.toLowerCase();
  if (config.normalize_common_separators) value = value.replace(/[_.\-/]+/g, ' ');
  if (config.collapse_whitespace) value = value.replace(/\s+/g, ' ').trim();
  return value;
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function matchesPattern(text, pattern, wordBoundaries) {
  const normalizedPattern = pattern.toLowerCase().replace(/[_.\-/]+/g, ' ').replace(/\s+/g, ' ').trim();
  const source = escapeRegex(normalizedPattern).replace(/\\ /g, '\\s+');
  const regex = new RegExp(wordBoundaries ? `(?:^|\\b)${source}(?:\\b|$)` : source, 'i');
  return regex.test(text);
}

export function checkSafety(text, safety) {
  const config = safety.normalization || {};
  const normalized = normalize(text, config);
  if (!normalized) return { ok: true, matches: [] };

  const matches = [];
  for (const rule of safety.rules || []) {
    for (const pattern of rule.patterns || []) {
      if (matchesPattern(normalized, pattern, config.match_word_boundaries !== false)) {
        matches.push({ id: rule.id, category: rule.category, action: rule.action });
        break;
      }
    }
  }
  return { ok: !matches.some(match => match.action === 'block'), matches };
}
