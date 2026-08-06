// src/entities/Finance.js
// Field set includes both `title` (requested) and `description` (used by Finances.jsx), kept in sync.
const STORAGE_KEY = 'ilife_mock_finances';

const seedFinances = [
  { id: 'fin_1', title: 'Monthly Salary', description: 'Monthly Salary', amount: 3200, type: 'income', category: 'Salary', date: '2026-08-01' },
  { id: 'fin_2', title: 'Freelance Web Design', description: 'Freelance Web Design', amount: 450, type: 'income', category: 'Freelance', date: '2026-08-03' },
  { id: 'fin_3', title: 'Rent', description: 'Rent', amount: 1100, type: 'expense', category: 'Housing', date: '2026-08-01' },
  { id: 'fin_4', title: 'Groceries', description: 'Weekly grocery run', amount: 78.4, type: 'expense', category: 'Groceries', date: '2026-08-04' },
  { id: 'fin_5', title: 'Gym Membership', description: 'Gym Membership', amount: 35, type: 'expense', category: 'Health', date: '2026-08-02' },
  { id: 'fin_6', title: 'Coffee & Dining', description: 'Brunch with Jade', amount: 22.5, type: 'expense', category: 'Dining', date: '2026-08-04' },
  { id: 'fin_7', title: 'Utility Bills', description: 'Electricity + internet', amount: 96, type: 'expense', category: 'Utilities', date: '2026-08-05' },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStore() {
  if (typeof window === 'undefined') return [...seedFinances];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('Finance mock store: failed to read localStorage', error);
  }
  return [...seedFinances];
}

function saveStore(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Finance mock store: failed to write localStorage', error);
  }
}

let _finances = loadStore();

const generateId = () => `fin_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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
  if (merged.title && !merged.description) merged.description = merged.title;
  if (merged.description && !merged.title) merged.title = merged.description;
  return merged;
}

export const Finance = {
  async list(sort) {
    await delay();
    return applySort(_finances, sort).map((item) => ({ ...item }));
  },
  async filter(query = {}, sort) {
    await delay();
    const filtered = _finances.filter((item) => matchesQuery(item, query));
    return applySort(filtered, sort).map((item) => ({ ...item }));
  },
  async create(data) {
    await delay(200);
    const newFinance = {
      id: generateId(),
      title: '',
      amount: 0,
      type: 'expense',
      category: 'General',
      date: new Date().toISOString().slice(0, 10),
      ...normalize(data),
    };
    _finances = [newFinance, ..._finances];
    saveStore(_finances);
    return { ...newFinance };
  },
  async update(id, data) {
    await delay(200);
    let updated = null;
    _finances = _finances.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...normalize(data), id };
        return updated;
      }
      return item;
    });
    if (!updated) throw new Error(`Finance.update: no record found with id "${id}"`);
    saveStore(_finances);
    return { ...updated };
  },
  async delete(id) {
    await delay(200);
    const exists = _finances.some((item) => item.id === id);
    if (!exists) throw new Error(`Finance.delete: no record found with id "${id}"`);
    _finances = _finances.filter((item) => item.id !== id);
    saveStore(_finances);
    return { success: true, id };
  },
};

export default Finance;