// src/entities/WorkLog.js
const STORAGE_KEY = 'ilife_mock_work_logs';

const seedWorkLogs = [
  { id: 'wl_1', date: '2026-08-04', hours: 7.5, task: 'Client onboarding calls + proposal edits', hourlyRate: 45, notes: 'Wrapped up two client calls and revised proposal pricing.' },
  { id: 'wl_2', date: '2026-08-03', hours: 6, task: 'Website revamp — homepage layout', hourlyRate: 45, notes: 'Finished the hero section and mobile nav.' },
  { id: 'wl_3', date: '2026-08-01', hours: 8, task: 'Sprint planning + backlog grooming', hourlyRate: 45, notes: 'Aligned team on Q3 priorities.' },
  { id: 'wl_4', date: '2026-07-31', hours: 5.5, task: 'Bug fixes on checkout flow', hourlyRate: 45, notes: 'Resolved three payment edge cases.' },
  { id: 'wl_5', date: '2026-07-30', hours: 4, task: 'Portfolio site content writing', hourlyRate: 45, notes: 'Drafted two case study summaries.' },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStore() {
  if (typeof window === 'undefined') return [...seedWorkLogs];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('WorkLog mock store: failed to read localStorage', error);
  }
  return [...seedWorkLogs];
}

function saveStore(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('WorkLog mock store: failed to write localStorage', error);
  }
}

let _workLogs = loadStore();

const generateId = () => `wl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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

export const WorkLog = {
  async list(sort) {
    await delay();
    return applySort(_workLogs, sort).map((item) => ({ ...item }));
  },
  async filter(query = {}, sort) {
    await delay();
    const filtered = _workLogs.filter((item) => matchesQuery(item, query));
    return applySort(filtered, sort).map((item) => ({ ...item }));
  },
  async create(data) {
    await delay(200);
    const newLog = {
      id: generateId(),
      date: new Date().toISOString().slice(0, 10),
      hours: 0,
      task: '',
      hourlyRate: 0,
      notes: '',
      ...data,
    };
    _workLogs = [newLog, ..._workLogs];
    saveStore(_workLogs);
    return { ...newLog };
  },
  async update(id, data) {
    await delay(200);
    let updated = null;
    _workLogs = _workLogs.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...data, id };
        return updated;
      }
      return item;
    });
    if (!updated) throw new Error(`WorkLog.update: no log found with id "${id}"`);
    saveStore(_workLogs);
    return { ...updated };
  },
  async delete(id) {
    await delay(200);
    const exists = _workLogs.some((item) => item.id === id);
    if (!exists) throw new Error(`WorkLog.delete: no log found with id "${id}"`);
    _workLogs = _workLogs.filter((item) => item.id !== id);
    saveStore(_workLogs);
    return { success: true, id };
  },
};

export default WorkLog;