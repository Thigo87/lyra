import { Activity, HeartPulse, Radio, ShieldAlert, Unlock } from 'lucide-react'
import { MissionEnvironmentDropdown } from './MissionEnvironmentDropdown'
import { AIGeneratedContentDisclaimer } from './AIGeneratedContentDisclaimer'

function formatMissionTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600) % 24
  const minutes = Math.floor(totalSeconds / 60) % 60
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function MissionOverview({ mission, missions, missionId, setMissionId, missionSeconds, circadianMode, themePreference, onThemePreferenceChange, donkiStatus, solarEvent, gamification, crew, onUnlock, onEmergency }) {
  return <main className={`mission-overview ${circadianMode}`}>
    <header className="overview-header">
      <div className="overview-brand"><div className="sentinel-logo"><img className="lyra-logo-image" src="/images/lyra-logo-mark.jpg" alt="LYRA logo" /></div><div><h1>LYRA</h1><p>Crew Care</p></div></div>
      <div className="overview-header-actions"><span className="overview-donki-pill"><span className="status-dot" /> {solarEvent.active ? 'NASA DONKI · SEP ALERT ACTIVE' : donkiStatus}</span><label className="theme-mode-control"><span>Appearance</span><select aria-label="Interface lighting mode" value={themePreference} onChange={(event) => onThemePreferenceChange(event.target.value)}><option value="circadian">Circadian</option><option value="light">Light</option><option value="dark">Dark</option></select></label><button type="button" className="overview-emergency-button" onClick={onEmergency}><ShieldAlert size={16} /> Medical Emergency Onboard (No PIN)</button></div>
    </header>
    <AIGeneratedContentDisclaimer />
    <section className="overview-telemetry">
      <div className="overview-mission-select"><MissionEnvironmentDropdown value={missionId} options={missions} onChange={setMissionId} /></div>
      <div className="overview-metric"><small>GRAVITY</small><strong>{mission.gravity}</strong></div><div className="overview-metric"><small>EARTH COMMUNICATION LATENCY</small><strong>{mission.latency}</strong></div><div className="overview-metric"><small>AMBIENT RADIATION FLUX</small><strong>{mission.radiation} · {solarEvent.radiationRate} µSv/h</strong></div><div className="overview-metric"><small>MISSION ELAPSED TIME</small><strong>{formatMissionTime(missionSeconds)}</strong></div>
    </section>
    <section className="overview-content"><div className="overview-section-heading"><div><p className="eyebrow"><Activity size={13} /> PUBLIC OPERATIONAL SUMMARY</p><h2>LYRA — Mission Overview & Crew Status</h2></div><span className="overview-live-badge"><Radio size={13} /> LIVE TELEMETRY</span></div>
      <div className="overview-crew-grid">{crew.map((member, index) => { const isAurora = member.gender === 'female'; const vitals = isAurora ? [['Heart Rate (HR)', '72 bpm'], ['Blood Oxygen (SpO₂)', '98%'], ['Blood Pressure (BP)', '114/74 mmHg'], ['Core Temp', '36.9 °C'], ['Cumulative Radiation (Wristband)', '42.8 mSv'], ['Cognitive / Fatigue Index', 'Optimal (92%)']] : [['Heart Rate (HR)', '66 bpm'], ['Blood Oxygen (SpO₂)', '99%'], ['Blood Pressure (BP)', '118/76 mmHg'], ['Core Temp', '36.6 °C'], ['Cumulative Radiation (Wristband)', '45.1 mSv'], ['Cognitive / Fatigue Index', 'Nominal (95%)']]; return <article className="overview-crew-card" key={member.id}><div className="overview-crew-card-top"><div className="overview-avatar">{member.name.split(' ').map((part) => part[0]).slice(-2).join('')}</div><span className={`overview-status ${index === 0 ? 'monitoring' : ''}`}><i /> {index === 0 ? 'Active Monitoring' : 'Nominal'}</span></div><p className="overview-crew-role">{member.role}</p><h3>{member.name}</h3><div className="overview-crew-facts"><span><small>Bio-Band status</small><b>Synced (BLE)</b></span><span><small>Module location</small><b>Node 2 · Standard Shielding</b></span><span><small>Readiness level</small><b>Level {gamification.level} · {gamification.xp} XP</b></span></div><div className="overview-vitals-heading"><HeartPulse size={13} /> LIVE BIOMETRIC TELEMETRY</div><div className="overview-vitals-grid">{vitals.map(([label, value], vitalIndex) => <span key={label} className={vitalIndex === 0 ? 'pulse-vital' : ''}>{vitalIndex === 0 && <HeartPulse size={13} />}<small>{label}</small><b>{value}</b></span>)}</div><button type="button" className="overview-unlock-button" onClick={() => onUnlock(member.id)}><Unlock size={15} /> Unlock Personal Terminal (PIN)</button></article> })}</div>
      <div className="overview-eclss"><div className="overview-eclss-heading"><Activity size={14} /> SPACECRAFT CABIN & LIFE SUPPORT (ECLSS)</div><div className="overview-eclss-grid"><span><small>Cabin Pressure</small><b>101.3 kPa (Nominal)</b></span><span><small>O₂ / CO₂ Levels</small><b>21.0% O₂ · 0.38% CO₂</b></span><span><small>Cabin Temp & Humidity</small><b>22.4 °C · 44% RH</b></span><span><small>Solar Storm Shelter Status</small><b>Ready · Water Wall Shielding Active</b></span></div></div>
    </section>
    <footer className="overview-footer">Autonomous crew operations interface · Training simulation based on NASA Human Research Program evidence.</footer>
  </main>
}
