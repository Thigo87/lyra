import { Activity, BookOpen, Brain, Camera, ChevronRight, CircleAlert, HeartPulse, Radiation, Thermometer, Waves } from 'lucide-react'
import { useState } from 'react'
import { OpticalBioScanner } from './OpticalBioScanner'

const vitals = [
  { id: 'heart', label: 'Heart rate', value: '68', unit: 'bpm', normal: 'Reference: 52–100 bpm', icon: HeartPulse, why: 'Heart rate helps the crew follow cardiovascular adaptation and recovery. Activity, posture, stress, and sleep can all change a single reading.' },
  { id: 'spo2', label: 'Blood oxygen', value: '98.2', unit: '%', normal: 'Reference: 95–100%', icon: Waves, why: 'This estimate shows how much oxygen is carried in the blood. It is useful alongside symptoms and breathing observations; movement or sensor fit can affect the reading.' },
  { id: 'pressure', label: 'Blood pressure', value: '106/69', unit: 'mmHg', normal: 'Reference: systolic 95–132', icon: Activity, why: 'Blood pressure can shift as body fluids redistribute in microgravity. Repeated readings under similar conditions are more useful than one measurement alone.' },
  { id: 'temp', label: 'Core body temperature', value: '37.1', unit: '°C', normal: 'Reference: 36.5–37.8 °C', icon: Thermometer, why: 'Temperature helps identify changes in the body’s response to workload or illness. Time of day, recent exercise, and measurement technique matter.' },
  { id: 'radiation', label: 'Cumulative radiation', value: '172.0', unit: 'mSv', normal: 'Mission-to-date dose estimate', icon: Radiation, why: 'This is accumulated mission exposure, not the current radiation rate. The rate is shown separately in µSv/h; both help the crew understand exposure and plan shielding.' },
]

export function VitalSignsGrid({ onModule, solarEvent, opticalHeartRate, onOpticalHeartRate, radiationDoseOffset = 0, wristbandDose = 0, wristbandZone = 'shelter', onWristbandSync, onRadiationSync, onRadiationBurst }) {
  const [scannerOpen, setScannerOpen] = useState(false)
  const [scannerMode, setScannerMode] = useState('pulse')
  const [wristbandSyncing, setWristbandSyncing] = useState(false)
  const [wristbandSyncResult, setWristbandSyncResult] = useState(null)
  const radiationRate = solarEvent.active ? solarEvent.radiationRate : 80
  const habitatDose = 172 + solarEvent.addedDose + radiationDoseOffset
  const radiationDose = (habitatDose + wristbandDose).toFixed(1)
  const wristbandZoneData = wristbandZone === 'airlock'
    ? { module: 'Cupola · High Exposure', dose: '+0.38 mSv' }
    : { module: 'Node 2 · Standard Shielding', dose: '+0.08 mSv' }
  const syncWristband = () => {
    setWristbandSyncing(true)
    setWristbandSyncResult(null)
    window.setTimeout(() => {
      onWristbandSync?.()
      setWristbandSyncing(false)
      setWristbandSyncResult(wristbandZoneData)
    }, 1500)
  }
  const displayVitals = vitals.map((vital) => vital.id === 'heart' && opticalHeartRate
    ? { ...vital, value: String(opticalHeartRate), normal: 'Optical camera reading · telemetry updated' }
    : vital.id === 'radiation'
    ? { ...vital, value: radiationDose, normal: `Mission-to-date dose · current rate ${radiationRate} µSv/h` }
    : vital)
  return <section className="dashboard-section vitals-section"><div className="section-heading"><div><p className="eyebrow"><Activity size={18} /> CONNECTED BIO-MONITOR · DEEP-SPACE REFERENCE RANGES</p><h3>Vital signs <span>· current readings</span></h3></div><div className="vital-header-actions"><span className={`connected-label ${solarEvent.active ? 'critical-label' : ''}`}><span className="status-dot" /> {solarEvent.active ? `Solar event simulation · ${radiationRate} µSv/h` : 'Telemetry connected'}</span><button type="button" className="female-action optical-trigger" onClick={() => { setScannerMode('pulse'); setScannerOpen(true) }}><Camera size={18} /> Optical camera scan</button></div></div><div className="vitals-grid">{displayVitals.map((vital) => <VitalCard key={vital.id} vital={vital} radiationRate={radiationRate} radiationActive={solarEvent.active} onRadiationScan={() => { setScannerMode('radiation'); setScannerOpen(true) }} onWristbandSync={syncWristband} wristbandSyncing={wristbandSyncing} wristbandDose={wristbandDose} wristbandSyncResult={wristbandSyncResult} />)}<article className="recalibration-card"><div className="recalibration-copy"><p className="eyebrow"><Brain size={18} /> AUTONOMOUS ADJUSTMENT</p><h4>Auto-recalibration</h4><p>Reference bands adjust for the current environment’s gravity, communication delay, and radiation.</p><button type="button" className="detail-action" onClick={() => onModule('cognitive')}>Run cognitive check <ChevronRight size={18} /></button></div><div className="quick-metrics"><span><b>DVT threshold</b>+4% calf</span><span><b>Calf today</b>+3.3%</span><span><b>Hemoglobin</b>12.9 g/dL</span><span><b>Career dose</b>{radiationDose} of 600 mSv</span></div></article></div><OpticalBioScanner open={scannerOpen} specialized={scannerMode === 'radiation'} initialMode={scannerMode} onClose={() => setScannerOpen(false)} onHeartRate={onOpticalHeartRate} onRadiationSync={onRadiationSync} onRadiationBurst={onRadiationBurst} /></section>
}

function VitalCard({ vital, radiationRate, radiationActive, onRadiationScan, onWristbandSync, wristbandSyncing, wristbandDose, wristbandSyncResult }) {
  const Icon = vital.icon
  const isRadiation = vital.id === 'radiation'
  return <article className="vital-card"><div className="vital-card-top"><div className="icon-tile"><Icon size={23} /></div>{isRadiation && radiationActive && <span className="vital-status monitor"><CircleAlert size={18} />Review shelter guidance</span>}</div><p>{vital.label}</p><strong>{vital.value}<small>{vital.unit}</small></strong><span className="vital-normal">{vital.normal}</span>{isRadiation && <div className="radiation-breakdown"><span><b>Wristband dose</b>{wristbandDose.toFixed(2)} mSv</span><span><b>Habitat rate</b>{radiationRate} µSv/h</span></div>}<details className="vital-education"><summary><BookOpen size={18} />What does this reading mean?</summary><p>{vital.why}</p></details>{isRadiation && <><button type="button" className="radiation-dosimeter-button" onClick={onRadiationScan}><Camera size={17} /> Optical CMOS dosimeter</button><button type="button" className="wristband-sync-button" onClick={onWristbandSync} disabled={wristbandSyncing}><Waves size={17} /> {wristbandSyncing ? 'NFC / BLE scan in progress…' : 'Sync Bio-Band dose'}</button>{wristbandSyncing && <div className="wristband-wave-animation"><i /><i /><i /></div>}{wristbandSyncResult && <div className="wristband-sync-result">Latest reading {wristbandSyncResult.dose} · {wristbandSyncResult.module}</div>}</>}</article>
}
