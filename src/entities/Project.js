// src/entities/Project.js
// `name`/`description` (requested) are kept in sync with `title`/`trackingNotes`
// (used by Education.jsx and Calendar.jsx).
const STORAGE_KEY = 'ilife_mock_projects';

const seedProjects = [
  { id: 'prj_1', name: 'Statistics Final Exam', title: 'Statistics Final Exam', type: 'exam', status: 'active', deadline: '2026-08-20', progress: 40, skills: '', url: '', description: 'Reviewing chapters 5-9, focus on regression models.', trackingNotes: 'Reviewing chapters 5-9, focus on regression models.' },
  { id: 'prj_2', name: 'iLife App Case Study', title: 'iLife App Case Study', type: 'portfolio', status: 'planning', deadline: '2026-09-15', progress: 15, skills: 'React, UX Writing, Product Design', url: 'https://github.com/example/ilife-case-study', description: 'Document the design process behind the iLife personal ecosystem app.', trackingNotes: 'Document the design process behind the iLife personal ecosystem app.' },
  { id: 'prj_3', name: 'Marketing Analytics Certificate', title: 'Marketing Analytics Certificate', type: 'exam', status: 'planning', deadline: '2026-10-01', progress: 5, skills: '', url: '', description: 'Enroll and complete first two modules.', trackingNotes: 'Enroll and complete first two modules.' },
  { id: 'prj_4', name: 'Personal Brand Portfolio Site', title: 'Personal Brand Portfolio Site', type: 'portfolio', status: 'completed', deadline: '2026-07-10', progress: 100, skills: 'Figma, Vite, Copywriting', url: 'https://example.com/portfolio', description: 'Launched personal portfolio with three case studies.', trackingNotes: 'Launched personal portfolio with three case studies.' },
  { id: 'prj_5', name: 'Capstone Research Paper', title: 'Capstone Research Paper', type: 'general', status: 'active', deadline: '2026-08-30', progress: 60, skills: 'Research, Academic Writing', url: '', description: 'Drafting literature review section.', trackingNotes: 'Drafting literature review section.' },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStore() {
  if (typeof window === 'undefined') return [...seedProjects];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('Project mock store: failed to read localStorage', error);
  }
  return [...seedProjects];
}

function saveStore(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Project mock store: failed to write localStorage', error);
  }
}

let _projects = loadStore();

const generateId = () => `prj_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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

function normalize(data) {
  const merged = { ...data };
  if (merged.name && !merged.title) merged.title = merged.name;
  if (merged.title && !merged.name) merged.name = merged.title;
  if (merged.description && !merged.trackingNotes) merged.trackingNotes = merged.description;
  if (merged.trackingNotes && !merged.description) merged.description = merged.trackingNotes;
  return merged;
}

export const Project = {
  async list(sort) {
    await delay();
    return applySort(_projects, sort).map((item) => ({ ...item }));
  },
  async filter(query = {}, sort) {
    await delay();
    const filtered = _projects.filter((item) => matchesQuery(item, query));
    return applySort(filtered, sort).map((item) => ({ ...item }));
  },
  async create(data) {
    await delay(200);
    const newProject = {
      id: generateId(),
      name: '',
      title: '',
      description: '',
      trackingNotes: '',
      status: 'planning',
      progress: 0,
      type: 'general',
      deadline: '',
      skills: '',
      url: '',
      ...normalize(data),
    };
    _projects = [newProject, ..._projects];
    saveStore(_projects);
    return { ...newProject };
  },
  async update(id, data) {
    await delay(200);
    let updated = null;
    _projects = _projects.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...normalize(data), id };
        return updated;
      }
      return item;
    });
    if (!updated) throw new Error(`Project.update: no project found with id "${id}"`);
    saveStore(_projects);
    return { ...updated };
  },
  async delete(id) {
    await delay(200);
    const exists = _projects.some((item) => item.id === id);
    if (!exists) throw new Error(`Project.delete: no project found with id "${id}"`);
    _projects = _projects.filter((item) => item.id !== id);
    saveStore(_projects);
    return { success: true, id };
  },
};

export default Project;