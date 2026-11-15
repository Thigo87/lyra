const STORAGE_KEY = 'astro_health_vitals_history_v3'
const LEGACY_STORAGE_KEYS = ['astro_health_vitals_history_v1', 'astro_health_vitals_history_v2']
const OFFICIAL_CREW = [
  { astronautId: 'aurora', astronautName: 'Cmdr. Aurora Solis', biologicalProfile: 'female' },
  { astronautId: 'atlas', astronautName: 'Eng. Atlas Cole', biologicalProfile: 'male' },
]

const seedRecords = [
  {
    id: 'seed-aurora-sol42',
    astronautId: 'aurora',
    astronautName: 'Cmdr. Aurora Solis',
    biologicalProfile: 'female',
    timestamp: '2026-10-28T08:20:00.000Z',
    missionDay: 'Sol 42',
    vitals: { bpm: 68, temperature: 36.7, systolicBP: 112, spo2: 99, donkiRadiation: 0.8 },
    symptoms: { pain: 1, neuroDizziness: 0, fatigue: 2, dyspnea: 0, urinaryPelvic: 1, vascularEdema: 0, affectedZone: 'full' },
    facialStressScore: 2.1,
    aiDiagnosis: { label: 'Nominal / Stable Condition', confidence: 91.4, severity: 'nominal' },
    notes: 'Baseline morning check; stable after scheduled exercise.',
  },
  {
    id: 'seed-atlas-sol43',
    astronautId: 'atlas',
    astronautName: 'Eng. Atlas Cole',
    biologicalProfile: 'male',
    timestamp: '2026-10-29T10:05:00.000Z',
    missionDay: 'Sol 43',
    vitals: { bpm: 76, temperature: 36.9, systolicBP: 118, spo2: 98, donkiRadiation: 1.1 },
    symptoms: { pain: 2, neuroDizziness: 1, fatigue: 3, dyspnea: 1, urinaryPelvic: 0, vascularEdema: 0, affectedZone: 'chest' },
    facialStressScore: 3.2,
    aiDiagnosis: { label: 'Nominal / Stable Condition', confidence: 88.6, severity: 'nominal' },
    notes: 'Stable systems watch; no reported limitations.',
  },
  {
    id: 'seed-aurora-sol44',
    astronautId: 'aurora',
    astronautName: 'Cmdr. Aurora Solis',
    biologicalProfile: 'female',
    timestamp: '2026-10-30T07:45:00.000Z',
    missionDay: 'Sol 44',
    vitals: { bpm: 82, temperature: 37.2, systolicBP: 124, spo2: 97, donkiRadiation: 1.4 },
    symptoms: { pain: 3, neuroDizziness: 1, fatigue: 5, dyspnea: 2, urinaryPelvic: 2, vascularEdema: 1, affectedZone: 'abdomen' },
    facialStressScore: 5.4,
    aiDiagnosis: { label: 'Spaceflight Anemia & Endocrine Fatigue', confidence: 72.6, severity: 'warning' },
    notes: 'Fatigue reported after EVA simulation; hydration and iron surveillance advised.',
  },
  {
    id: 'seed-atlas-sol45',
    astronautId: 'atlas',
    astronautName: 'Eng. Atlas Cole',
    biologicalProfile: 'male',
    timestamp: '2026-10-31T09:10:00.000Z',
    missionDay: 'Sol 45',
    vitals: { bpm: 84, temperature: 37.1, systolicBP: 128, spo2: 97, donkiRadiation: 1.8 },
    symptoms: { pain: 2, neuroDizziness: 2, fatigue: 4, dyspnea: 2, urinaryPelvic: 0, vascularEdema: 1, affectedZone: 'limbs' },
    facialStressScore: 4.9,
    aiDiagnosis: { label: 'Orthostatic Intolerance & Hypotension', confidence: 76.3, severity: 'danger' },
    notes: 'Post-exercise orthostatic symptoms; repeat readings after hydration.',
  },
  {
    id: 'seed-aurora-sol46',
    astronautId: 'aurora',
    astronautName: 'Cmdr. Aurora Solis',
    biologicalProfile: 'female',
    timestamp: '2026-11-01T11:35:00.000Z',
    missionDay: 'Sol 46',
    vitals: { bpm: 88, temperature: 37.4, systolicBP: 132, spo2: 96, donkiRadiation: 2.3 },
    symptoms: { pain: 4, neuroDizziness: 4, fatigue: 6, dyspnea: 3, urinaryPelvic: 0, vascularEdema: 0, affectedZone: 'head' },
    facialStressScore: 7.1,
    aiDiagnosis: { label: 'Acute Solar Radiation Exposure (DONKI Event)', confidence: 84.8, severity: 'danger' },
    notes: 'Elevated dose and facial tension during SEP window; shelter protocol reviewed.',
  },
  {
    id: 'seed-atlas-sol47',
    astronautId: 'atlas',
    astronautName: 'Eng. Atlas Cole',
    biologicalProfile: 'male',
    timestamp: '2026-11-02T06:55:00.000Z',
    missionDay: 'Sol 47',
    vitals: { bpm: 79, temperature: 36.8, systolicBP: 119, spo2: 98, donkiRadiation: 1.6 },
    symptoms: { pain: 1, neuroDizziness: 1, fatigue: 2, dyspnea: 0, urinaryPelvic: 0, vascularEdema: 0, affectedZone: 'full' },
    facialStressScore: 2.8,
    aiDiagnosis: { label: 'Nominal / Stable Condition', confidence: 93.2, severity: 'nominal' },
    notes: 'Follow-up returned to baseline after rest protocol.',
  },
  {
    id: 'seed-aurora-sol48',
    astronautId: 'aurora',
    astronautName: 'Cmdr. Aurora Solis',
    biologicalProfile: 'female',
    timestamp: '2026-11-03T08:05:00.000Z',
    missionDay: 'Sol 48',
    vitals: { bpm: 71, temperature: 36.8, systolicBP: 114, spo2: 99, donkiRadiation: 1.2 },
    symptoms: { pain: 0, neuroDizziness: 1, fatigue: 1, dyspnea: 0, urinaryPelvic: 0, vascularEdema: 0, affectedZone: 'full' },
    facialStressScore: 1.8,
    aiDiagnosis: { label: 'Nominal / Stable Condition', confidence: 94.1, severity: 'nominal' },
    notes: 'Stable follow-up; no new symptoms.',
  },
]

function isOfficialRecord(record) {
  return OFFICIAL_CREW.some((member) => member.astronautId === record?.astronautId && member.astronautName === record?.astronautName)
}

function readHistory() {
  if (typeof window === 'undefined') return [...seedRecords]
  try {
    LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key))
    const stored = window.localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      window.localStorage.removeItem(LEGACY_STORAGE_KEY)
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRecords))
      return [...seedRecords]
    }
    const parsed = JSON.parse(stored)
    const validRecords = Array.isArray(parsed) ? parsed.filter(isOfficialRecord) : []
    if (!validRecords.length) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seedRecords))
      return [...seedRecords]
    }
    if (validRecords.length !== parsed.length) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(validRecords))
    return validRecords
  } catch {
    return [...seedRecords]
  }
}

function writeHistory(records) {
  if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records.filter(isOfficialRecord)))
  return records
}

export function getHistoryByAstronaut(astronautId) {
  return readHistory().filter((record) => record.astronautId === astronautId).sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
}

export function getAllAstronautsSummary() {
  const grouped = readHistory().reduce((map, record) => {
    if (!map.has(record.astronautId)) map.set(record.astronautId, [])
    map.get(record.astronautId).push(record)
    return map
  }, new Map())
  return Array.from(grouped.values()).map((records) => {
    const latest = [...records].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0]
    return { astronautId: latest.astronautId, astronautName: latest.astronautName, biologicalProfile: latest.biologicalProfile, recordCount: records.length, latestTimestamp: latest.timestamp, latestDiagnosis: latest.aiDiagnosis }
  }).sort((a, b) => a.astronautName.localeCompare(b.astronautName))
}

export function addVitalsRecord(record) {
  if (!isOfficialRecord(record)) throw new Error('Vitals records can only be associated with official crew members.')
  const nextRecord = { ...record, id: record.id || `record-${Date.now()}`, timestamp: record.timestamp || new Date().toISOString() }
  writeHistory([nextRecord, ...readHistory()])
  return nextRecord
}

export function clearOrResetDemoHistory() {
  if (typeof window !== 'undefined') LEGACY_STORAGE_KEYS.forEach((key) => window.localStorage.removeItem(key))
  writeHistory([...seedRecords])
  return [...seedRecords]
}

