// src/entities/BreathingLog.js
// `durationMinutes`/`technique` (requested) added alongside `timeSlot`/`notes`
// (needed by Personal.jsx's morning/midday/evening check-ins).
const STORAGE_KEY = 'ilife_mock_breathing_logs';

const seedBreathingLogs = [
  { id: 'bl_1', date: '2026-08-05', timeSlot: 'morning', durationMinutes: 5, technique: '4-7-8 Breathing', notes: 'Felt calm and centered before starting the day.' },
  { id: 'bl_2', date: '2026-08-05', timeSlot: 'midday', durationMinutes: 3, technique: 'Box Breathing', notes: 'Quick reset between meetings.' },
  { id: 'bl_3', date: '2026-08-04', timeSlot: 'evening', durationMinutes: 8, technique: 'Diaphragmatic Breathing', notes: 'Helped wind down before bed.' },
  { id: 'bl_4', date: '2026-08-04', timeSlot: 'morning', durationMinutes: 5, technique: '4-7-8 Breathing', notes: 'Steady start to the day.' },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStore() {
  if (typeof window === 'undefined') return [...seedBreathingLogs];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('BreathingLog mock store: failed to read localStorage', error);
  }
  return [...seedBreathingLogs];
}

function saveStore(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('BreathingLog mock store: failed to write localStorage', error);
  }
}

let _breathingLogs = loadStore();

const generateId = () => `bl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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

export const BreathingLog = {
  async list(sort) {
    await delay();
    return applySort(_breathingLogs, sort).map((item) => ({ ...item }));
  },
  async filter(query = {}, sort) {
    await delay();
    const filtered = _breathingLogs.filter((item) => matchesQuery(item, query));
    return applySort(filtered, sort).map((item) => ({ ...item }));
  },
  async create(data) {
    await delay(200);
    const newLog = {
      id: generateId(),
      date: new Date().toISOString().slice(0, 10),
      timeSlot: 'morning',
      durationMinutes: 5,
      technique: '4-7-8 Breathing',
      notes: '',
      ...data,
    };
    _breathingLogs = [newLog, ..._breathingLogs];
    saveStore(_breathingLogs);
    return { ...newLog };
  },
  async update(id, data) {
    await delay(200);
    let updated = null;
    _breathingLogs = _breathingLogs.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...data, id };
        return updated;
      }
      return item;
    });
    if (!updated) throw new Error(`BreathingLog.update: no log found with id "${id}"`);
    saveStore(_breathingLogs);
    return { ...updated };
  },
  async delete(id) {
    await delay(200);
    const exists = _breathingLogs.some((item) => item.id === id);
    if (!exists) throw new Error(`BreathingLog.delete: no log found with id "${id}"`);
    _breathingLogs = _breathingLogs.filter((item) => item.id !== id);
    saveStore(_breathingLogs);
    return { success: true, id };
  },
};

export default BreathingLog;