// src/entities/HealthLog.js
// Adds `metrics` (object) and `notes` (string) convenience fields on top of the
// detailed fields Cycle.jsx and Home.jsx already read (cyclePhase, physicalSymptoms, etc.).
const STORAGE_KEY = 'ilife_mock_health_logs';

const seedHealthLogs = [
  { id: 'hl_1', date: '2026-08-05', physicalSymptoms: 'Mild bloating', cyclePhase: 'luteal', cycleStart: false, bleedingEnd: false, overallFeeling: 'A little tired but stable', diary: 'Kept up with water intake and stretched before bed.', morningCheckIn: 'Feeling calm.', middayCheckIn: 'Slight energy dip after lunch.', eveningCheckIn: 'Winding down early tonight.', waterIntake: 6 },
  { id: 'hl_2', date: '2026-08-04', physicalSymptoms: 'None', cyclePhase: 'luteal', cycleStart: false, bleedingEnd: false, overallFeeling: 'Energetic', diary: 'Good workout in the morning, productive day overall.', morningCheckIn: 'Ready to tackle the day.', middayCheckIn: 'Focused.', eveningCheckIn: 'Relaxed evening walk.', waterIntake: 7 },
  { id: 'hl_3', date: '2026-08-03', physicalSymptoms: 'Headache', cyclePhase: 'ovulation', cycleStart: false, bleedingEnd: false, overallFeeling: 'Sensitive to light', diary: 'Took a break from the screen mid-afternoon.', morningCheckIn: 'Slight tension.', middayCheckIn: 'Headache peaked around 2pm.', eveningCheckIn: 'Better after resting.', waterIntake: 5 },
  { id: 'hl_4', date: '2026-08-02', physicalSymptoms: 'None', cyclePhase: 'ovulation', cycleStart: false, bleedingEnd: false, overallFeeling: 'Confident and social', diary: 'Great catch-up with friends in the evening.', morningCheckIn: 'Bright mood.', middayCheckIn: 'Chatty and upbeat.', eveningCheckIn: 'Happy and full.', waterIntake: 8 },
  { id: 'hl_5', date: '2026-08-01', physicalSymptoms: 'Fatigue', cyclePhase: 'follicular', cycleStart: false, bleedingEnd: true, overallFeeling: 'Steadily improving', diary: 'Bleeding tapered off today, energy slowly returning.', morningCheckIn: 'Slow start.', middayCheckIn: 'Picking up.', eveningCheckIn: 'Feeling more like myself.', waterIntake: 6 },
  { id: 'hl_6', date: '2026-07-31', physicalSymptoms: 'Cramps', cyclePhase: 'menstrual', cycleStart: false, bleedingEnd: false, overallFeeling: 'Low energy', diary: 'Heating pad and an early night.', morningCheckIn: 'Uncomfortable.', middayCheckIn: 'Resting.', eveningCheckIn: 'Better with rest.', waterIntake: 5 },
  { id: 'hl_7', date: '2026-07-30', physicalSymptoms: 'Cramps, tender skin', cyclePhase: 'menstrual', cycleStart: true, bleedingEnd: false, overallFeeling: 'Emotional and tired', diary: 'First day of my cycle, took it slow.', morningCheckIn: 'Rough start.', middayCheckIn: 'Napped.', eveningCheckIn: 'Comfort food and a movie.', waterIntake: 4 },
];

const delay = (ms = 250) => new Promise((resolve) => setTimeout(resolve, ms));

function loadStore() {
  if (typeof window === 'undefined') return [...seedHealthLogs];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (error) {
    console.warn('HealthLog mock store: failed to read localStorage', error);
  }
  return [...seedHealthLogs];
}

function saveStore(items) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch (error) {
    console.warn('HealthLog mock store: failed to write localStorage', error);
  }
}

let _healthLogs = loadStore();

const generateId = () => `hl_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

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

function withDerived(item) {
  return {
    ...item,
    metrics: {
      cyclePhase: item.cyclePhase,
      cycleStart: item.cycleStart,
      bleedingEnd: item.bleedingEnd,
      waterIntake: item.waterIntake,
    },
    notes: item.diary || item.overallFeeling || '',
  };
}

function normalize(data) {
  const merged = { ...data };
  if (merged.notes && !merged.diary) merged.diary = merged.notes;
  if (merged.metrics) {
    const { cyclePhase, cycleStart, bleedingEnd, waterIntake } = merged.metrics;
    if (cyclePhase !== undefined) merged.cyclePhase = cyclePhase;
    if (cycleStart !== undefined) merged.cycleStart = cycleStart;
    if (bleedingEnd !== undefined) merged.bleedingEnd = bleedingEnd;
    if (waterIntake !== undefined) merged.waterIntake = waterIntake;
  }
  return merged;
}

export const HealthLog = {
  async list(sort) {
    await delay();
    return applySort(_healthLogs, sort).map((item) => withDerived({ ...item }));
  },
  async filter(query = {}, sort) {
    await delay();
    const filtered = _healthLogs.filter((item) => matchesQuery(item, query));
    return applySort(filtered, sort).map((item) => withDerived({ ...item }));
  },
  async create(data) {
    await delay(200);
    const newLog = {
      id: generateId(),
      date: new Date().toISOString().slice(0, 10),
      physicalSymptoms: '',
      cyclePhase: 'none',
      cycleStart: false,
      bleedingEnd: false,
      overallFeeling: '',
      diary: '',
      morningCheckIn: '',
      middayCheckIn: '',
      eveningCheckIn: '',
      waterIntake: 0,
      ...normalize(data),
    };
    _healthLogs = [newLog, ..._healthLogs];
    saveStore(_healthLogs);
    return withDerived({ ...newLog });
  },
  async update(id, data) {
    await delay(200);
    let updated = null;
    _healthLogs = _healthLogs.map((item) => {
      if (item.id === id) {
        updated = { ...item, ...normalize(data), id };
        return updated;
      }
      return item;
    });
    if (!updated) throw new Error(`HealthLog.update: no log found with id "${id}"`);
    saveStore(_healthLogs);
    return withDerived({ ...updated });
  },
  async delete(id) {
    await delay(200);
    const exists = _healthLogs.some((item) => item.id === id);
    if (!exists) throw new Error(`HealthLog.delete: no log found with id "${id}"`);
    _healthLogs = _healthLogs.filter((item) => item.id !== id);
    saveStore(_healthLogs);
    return { success: true, id };
  },
};

export default HealthLog;