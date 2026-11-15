export const missions = [
  { id: 'orbit', name: 'Órbita Terrestre', context: 'ISS', gravity: '0g', latency: '<1s', radiation: 'Baixa', radiationLevel: 'low', accent: '#55d6a5' },
  { id: 'transit', name: 'Trânsito Terra–Marte', context: 'Espaço Profundo', gravity: '0g', latency: '14 min', radiation: 'Crítica', radiationLevel: 'critical', accent: '#ff6b5f' },
  { id: 'lunar', name: 'Superfície Lunar', context: 'Artemis', gravity: '0.16g', latency: '1.3s', radiation: 'Alta', radiationLevel: 'high', accent: '#f5bc63' },
  { id: 'mars', name: 'Superfície de Marte', context: 'Base', gravity: '0.38g', latency: '18 min', radiation: 'Alta', radiationLevel: 'high', accent: '#f5bc63' },
]

export const crew = [
  { id: 'elena', name: 'Cmdr. Elena Vance', role: 'Comandante', age: 41, gender: 'Feminino', profile: 'feminino', cycle: 'Supressão menstrual' },
  { id: 'lucas', name: 'Eng. Lucas Silva', role: 'Engenheiro de Sistemas', age: 36, gender: 'Masculino', profile: 'masculino', cycle: 'Perfil fisiológico nominal' },
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
