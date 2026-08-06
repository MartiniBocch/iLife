// src/entities/Cycle.js
// Standalone cycle-tracking mock (date, metrics, notes) for future use
// alongside the more detailed HealthLog entity.
const STORAGE_KEY = 'ilife_mock_cycle_logs';

const seedCycleLogs = [
  { id: 'cyc_1', date: '2026-07-30', metrics: { flow: 'heavy', phase: 'menstrual', temperatureC: 36.3, symptoms: ['cramps', 'fatigue'] }, notes: 'Day 1 — took ibuprofen and rested most of the day.' },
  { id: 'cyc_2', date: '2026-07-31', metrics: { flow: 'medium', phase: 'menstrual', temperatureC: 36.4, symptoms: ['cramps'] }, notes: 'Heating pad helped a lot.' },
  { id: 'cyc_3', date: '2026-08-01', metrics: { flow: 'light', phase: 'follicular', temperatureC: 36.5, symptoms: ['fatigue'] }, notes: 'Bleeding tapering off, energy returning.' },
  { id: 'cyc_4', date: '2026-08-02', metrics: { flow: 'none', phase: 'follicular', temperatureC: 36.5, symptoms: [] }, notes: 'Feeling clear-headed and motivated.' },
  { id: 'cyc_5', date: '2026-08-03', metrics: { flow: 'none', phase: 'ovulation', temperatureC: 36.8, symptoms: ['headache'] }, notes: 'Mild headache in the afternoon, likely ovulation-related.' },
  { id: 'cyc_6', date: '2026-08-04', metrics: { flow: 'none', phase: 'ovulation', temperatureC: 36.9, symptoms: [] }, notes: 'High energy and social today.' },
  { id: 'cyc_7', date: '2026-08-05', metrics: { flow: 'none', phase: 'luteal', temperatureC: 36.7, symptoms: ['bloating'] }, notes: 'Slight bloating, otherwise steady.' },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStore() {
  if (typeof window === 'undefined') return [...seedCycleLogs];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('Cycle mock store: failed to read localStorage', error);
  }
  return [...seedCycleLogs];
}

function saveStore(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Cycle mock store: failed to write localStorage', error);
  }
}

let _cycleLogs = loadStore();

const generateId = () => `cyc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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

export const Cycle = {
  async list(sort) {
    await delay();
    return applySort(_cycleLogs, sort).map((item) => ({ ...item, metrics: { ...item.metrics } }));
  },
  async filter(query = {}, sort) {
    await delay();
    const filtered = _cycleLogs.filter((item) => matchesQuery(item, query));
    return applySort(filtered, sort).map((item) => ({ ...item, metrics: { ...item.metrics } }));
  },
  async create(data) {
    await delay(200);
    const newLog = {
      id: generateId(),
      date: new Date().toISOString().slice(0, 10),
      metrics: { flow: 'none', phase: 'none', temperatureC: null, symptoms: [] },
      notes: '',
      ...data,
    };
    _cycleLogs = [newLog, ..._cycleLogs];
    saveStore(_cycleLogs);
    return { ...newLog };
  },
  async update(id, data) {
    await delay(200);
    let updated = null;
    _cycleLogs = _cycleLogs.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...data, metrics: { ...item.metrics, ...(data.metrics || {}) }, id };
        return updated;
      }
      return item;
    });
    if (!updated) throw new Error(`Cycle.update: no log found with id "${id}"`);
    saveStore(_cycleLogs);
    return { ...updated };
  },
  async delete(id) {
    await delay(200);
    const exists = _cycleLogs.some((item) => item.id === id);
    if (!exists) throw new Error(`Cycle.delete: no log found with id "${id}"`);
    _cycleLogs = _cycleLogs.filter((item) => item.id !== id);
    saveStore(_cycleLogs);
    return { success: true, id };
  },
};

export default Cycle;