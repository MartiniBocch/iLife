// src/entities/DiaryLog.js
// `entry`/`mood` (requested) kept in sync with `notes` (used by Personal.jsx).
const STORAGE_KEY = 'ilife_mock_diary_logs';

const seedDiaryLogs = [
  { id: 'dl_1', date: '2026-08-04', entry: 'Felt really productive today, finished the proposal ahead of schedule.', mood: 'accomplished', notes: 'Felt really productive today, finished the proposal ahead of schedule.' },
  { id: 'dl_2', date: '2026-08-03', entry: 'A bit overwhelmed with the exam prep but pushed through.', mood: 'stressed', notes: 'A bit overwhelmed with the exam prep but pushed through.' },
  { id: 'dl_3', date: '2026-08-02', entry: 'Lovely evening catching up with friends, felt grounded.', mood: 'joyful', notes: 'Lovely evening catching up with friends, felt grounded.' },
  { id: 'dl_4', date: '2026-08-01', entry: 'Quiet day, spent time reflecting on goals for the month.', mood: 'reflective', notes: 'Quiet day, spent time reflecting on goals for the month.' },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStore() {
  if (typeof window === 'undefined') return [...seedDiaryLogs];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('DiaryLog mock store: failed to read localStorage', error);
  }
  return [...seedDiaryLogs];
}

function saveStore(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('DiaryLog mock store: failed to write localStorage', error);
  }
}

let _diaryLogs = loadStore();

const generateId = () => `dl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function applySort(items, sort) {
  if (!sort) return items;
  const [key, direction = 'asc'] = sort.split(':');
  const sorted = [...items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === bv) return 0;
    if (av === undefined || av === null) return 1;
    if (bv === undefined || bv === null) return -1;
    return av > bv ? 1 : -1;
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}

function matchesQuery(item, query = {}) {
  return Object.entries(query).every(([key, value]) => item[key] === value);
}

function normalize(data) {
  const merged = { ...data };
  if (merged.notes && !merged.entry) merged.entry = merged.notes;
  if (merged.entry && !merged.notes) merged.notes = merged.entry;
  return merged;
}

export const DiaryLog = {
  async list(sort) {
    await delay();
    return applySort(_diaryLogs, sort).map((item) => ({ ...item }));
  },
  async filter(query = {}, sort) {
    await delay();
    const filtered = _diaryLogs.filter((item) => matchesQuery(item, query));
    return applySort(filtered, sort).map((item) => ({ ...item }));
  },
  async create(data) {
    await delay(200);
    const newLog = {
      id: generateId(),
      date: new Date().toISOString().slice(0, 10),
      entry: '',
      mood: '',
      notes: '',
      ...normalize(data),
    };
    _diaryLogs = [newLog, ..._diaryLogs];
    saveStore(_diaryLogs);
    return { ...newLog };
  },
  async update(id, data) {
    await delay(200);
    let updated = null;
    _diaryLogs = _diaryLogs.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...normalize(data), id };
        return updated;
      }
      return item;
    });
    if (!updated) throw new Error(`DiaryLog.update: no entry found with id "${id}"`);
    saveStore(_diaryLogs);
    return { ...updated };
  },
  async delete(id) {
    await delay(200);
    const exists = _diaryLogs.some((item) => item.id === id);
    if (!exists) throw new Error(`DiaryLog.delete: no entry found with id "${id}"`);
    _diaryLogs = _diaryLogs.filter((item) => item.id !== id);
    saveStore(_diaryLogs);
    return { success: true, id };
  },
};

export default DiaryLog;