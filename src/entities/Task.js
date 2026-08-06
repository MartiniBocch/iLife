// src/entities/Task.js
const STORAGE_KEY = 'ilife_mock_tasks';

const seedTasks = [
  { id: 'tsk_1', title: 'Finish Q3 client proposal', category: 'work', dueDate: '2026-08-06', completed: false, notes: 'Include updated pricing tiers and onboarding timeline.' },
  { id: 'tsk_2', title: 'Book dentist check-up', category: 'personal', dueDate: '2026-08-05', completed: false, notes: 'Ask for a slot before 10am.' },
  { id: 'tsk_3', title: 'Submit statistics problem set', category: 'education', dueDate: '2026-08-07', completed: false, notes: 'Chapters 6-7, double check question 4.' },
  { id: 'tsk_4', title: 'Team stand-up prep', category: 'work', dueDate: '2026-08-05', completed: true, notes: 'Summarize sprint progress and blockers.' },
  { id: 'tsk_5', title: 'Grocery shopping', category: 'personal', dueDate: '2026-08-05', completed: false, notes: 'Oat milk, spinach, chicken, candles.' },
  { id: 'tsk_6', title: 'Watch React Query lecture', category: 'education', dueDate: '2026-08-09', completed: false, notes: 'Module 3: mutations and cache invalidation.' },
  { id: 'tsk_7', title: 'Call mum', category: 'personal', dueDate: '2026-08-04', completed: true, notes: '' },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStore() {
  if (typeof window === 'undefined') return [...seedTasks];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('Task mock store: failed to read localStorage', error);
  }
  return [...seedTasks];
}

function saveStore(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Task mock store: failed to write localStorage', error);
  }
}

let _tasks = loadStore();

const generateId = () => `tsk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

function applySort(items, sort) {
  if (!sort) return items;
  const [key, direction = 'asc'] = sort.split(':');
  const sorted = [...items].sort((a, b) => {
    const av = a[key];
    const bv = b[key];
    if (av === bv) return 0;
    if (av === undefined || av === null || av === '') return 1;
    if (bv === undefined || bv === null || bv === '') return -1;
    return av > bv ? 1 : -1;
  });
  return direction === 'desc' ? sorted.reverse() : sorted;
}

function matchesQuery(item, query = {}) {
  return Object.entries(query).every(([key, value]) => item[key] === value);
}

export const Task = {
  async list(sort) {
    await delay();
    return applySort(_tasks, sort).map((item) => ({ ...item }));
  },
  async filter(query = {}, sort) {
    await delay();
    const filtered = _tasks.filter((item) => matchesQuery(item, query));
    return applySort(filtered, sort).map((item) => ({ ...item }));
  },
  async create(data) {
    await delay(200);
    const newTask = { id: generateId(), title: '', category: 'personal', dueDate: '', completed: false, notes: '', ...data };
    _tasks = [newTask, ..._tasks];
    saveStore(_tasks);
    return { ...newTask };
  },
  async update(id, data) {
    await delay(200);
    let updated = null;
    _tasks = _tasks.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...data, id };
        return updated;
      }
      return item;
    });
    if (!updated) throw new Error(`Task.update: no task found with id "${id}"`);
    saveStore(_tasks);
    return { ...updated };
  },
  async delete(id) {
    await delay(200);
    const exists = _tasks.some((item) => item.id === id);
    if (!exists) throw new Error(`Task.delete: no task found with id "${id}"`);
    _tasks = _tasks.filter((item) => item.id !== id);
    saveStore(_tasks);
    return { success: true, id };
  },
};

export default Task;