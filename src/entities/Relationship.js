// src/entities/Relationship.js
// `relation`/`lastContact` (requested) synced with `type`/`lastMet`
// (used by Personal.jsx alongside `nextPlan`).
const STORAGE_KEY = 'ilife_mock_relationships';

const seedRelationships = [
  { id: 'rel_1', name: 'Mum', relation: 'family', type: 'family', lastContact: '2026-08-04', lastMet: '2026-08-04', nextPlan: '2026-08-11', notes: 'Call every Sunday, she loves hearing about work wins.' },
  { id: 'rel_2', name: 'Jade Whitfield', relation: 'friend', type: 'friend', lastContact: '2026-08-02', lastMet: '2026-08-02', nextPlan: '2026-08-16', notes: 'Owes her a birthday gift — she mentioned wanting a new journal.' },
  { id: 'rel_3', name: 'Alex Rivera', relation: 'partner', type: 'partner', lastContact: '2026-08-05', lastMet: '2026-08-05', nextPlan: '2026-08-08', notes: 'Planning a weekend hike together.' },
  { id: 'rel_4', name: 'Sam Okafor', relation: 'colleague', type: 'colleague', lastContact: '2026-07-30', lastMet: '2026-07-30', nextPlan: '2026-08-12', notes: 'Follow up on the shared project timeline.' },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStore() {
  if (typeof window === 'undefined') return [...seedRelationships];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('Relationship mock store: failed to read localStorage', error);
  }
  return [...seedRelationships];
}

function saveStore(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('Relationship mock store: failed to write localStorage', error);
  }
}

let _relationships = loadStore();

const generateId = () => `rel_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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
  if (merged.relation && !merged.type) merged.type = merged.relation;
  if (merged.type && !merged.relation) merged.relation = merged.type;
  if (merged.lastContact && !merged.lastMet) merged.lastMet = merged.lastContact;
  if (merged.lastMet && !merged.lastContact) merged.lastContact = merged.lastMet;
  return merged;
}

export const Relationship = {
  async list(sort) {
    await delay();
    return applySort(_relationships, sort).map((item) => ({ ...item }));
  },
  async filter(query = {}, sort) {
    await delay();
    const filtered = _relationships.filter((item) => matchesQuery(item, query));
    return applySort(filtered, sort).map((item) => ({ ...item }));
  },
  async create(data) {
    await delay(200);
    const newRelationship = {
      id: generateId(),
      name: '',
      relation: 'friend',
      type: 'friend',
      lastContact: '',
      lastMet: '',
      nextPlan: '',
      notes: '',
      ...normalize(data),
    };
    _relationships = [newRelationship, ..._relationships];
    saveStore(_relationships);
    return { ...newRelationship };
  },
  async update(id, data) {
    await delay(200);
    let updated = null;
    _relationships = _relationships.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...normalize(data), id };
        return updated;
      }
      return item;
    });
    if (!updated) throw new Error(`Relationship.update: no relationship found with id "${id}"`);
    saveStore(_relationships);
    return { ...updated };
  },
  async delete(id) {
    await delay(200);
    const exists = _relationships.some((item) => item.id === id);
    if (!exists) throw new Error(`Relationship.delete: no relationship found with id "${id}"`);
    _relationships = _relationships.filter((item) => item.id !== id);
    saveStore(_relationships);
    return { success: true, id };
  },
};

export default Relationship;