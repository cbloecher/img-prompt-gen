const STORAGE_KEY = 'img-prompt-gen-state-v1';

export const state = {
  sex: 'all',
  age: 35,
  selected: new Set(),
  freeText: ''
};

export function restoreState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved) return;
    state.sex = saved.sex || 'all';
    state.age = Number(saved.age) || 35;
    state.selected = new Set(Array.isArray(saved.selected) ? saved.selected : []);
    state.freeText = saved.freeText || '';
  } catch (_) { /* ignore corrupt local state */ }
}

export function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({
    sex: state.sex,
    age: state.age,
    selected: [...state.selected],
    freeText: state.freeText
  }));
}

export function clearState() {
  state.sex = 'all'; state.age = 35; state.selected.clear(); state.freeText = '';
  localStorage.removeItem(STORAGE_KEY);
}
