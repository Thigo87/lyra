export const missions = [
  { id: 'orbit', name: 'Low Earth Orbit (ISS)', context: 'ISS', gravity: '0g', latency: '<1s', radiation: 'Low', radiationLevel: 'low', accent: '#55d6a5' },
  { id: 'transit', name: 'Earth–Mars Transit (Deep Space)', context: 'Deep Space', gravity: '0g', latency: '14 min', radiation: 'Critical', radiationLevel: 'critical', accent: '#ff6b5f' },
  { id: 'lunar', name: 'Lunar Surface (Artemis)', context: 'Artemis', gravity: '0.16g', latency: '1.3s', radiation: 'High', radiationLevel: 'high', accent: '#f5bc63' },
  { id: 'mars', name: 'Mars Surface (Base)', context: 'Base', gravity: '0.38g', latency: '18 min', radiation: 'High', radiationLevel: 'high', accent: '#f5bc63' },
]

export const crew = [
  { id: 'elena', name: 'Cmdr. Elena Vance', role: 'Commander', age: 41, gender: 'female', profile: 'female', cycle: 'Menstrual suppression' },
  { id: 'lucas', name: 'Eng. Lucas Silva', role: 'Systems Engineer', age: 36, gender: 'male', profile: 'male', cycle: 'Nominal physiological profile' },
]

export const fallbackDonkiPayload = [
  {
    sepID: '2026-07-30T18:20:00-SEP-001',
    eventTime: '2026-07-30T18:20Z',
    instruments: [{ displayName: 'MODEL: REleASE:ACE/EPAM 15.8-39.8 MeV' }],
    submissionTime: '2026-07-30T19:00Z',
    linkedEvents: [
      { activityID: '2026-07-30T16:55:00-FLR-001', activityType: 'FLR' },
      { activityID: '2026-07-30T17:36:00-CME-001', activityType: 'CME' },
    ],
  },
]
