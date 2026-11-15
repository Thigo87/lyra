import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { Activity, Brain, Camera, CheckCircle2, ChevronRight, HeartPulse, Radiation, Thermometer, Waves } from 'lucide-react'
import { useState } from 'react'
import { OpticalBioScanner } from './OpticalBioScanner'

const vitals = [
  { id: 'heart', label: 'Heart Rate', value: '68', unit: 'bpm', normal: 'Green zone: 52–100 bpm', icon: HeartPulse, data: [64, 67, 65, 69, 68, 70, 68] },
  { id: 'spo2', label: 'SpO2', value: '98.2', unit: '%', normal: 'Green zone: 95–100%', icon: Waves, data: [97.8, 98, 98.1, 98.2, 98, 98.3, 98.2] },
  { id: 'pressure', label: 'Blood Pressure', value: '106/69', unit: 'mmHg', normal: 'Green zone: systolic 95–132', icon: Activity, data: [104, 108, 106, 105, 107, 106, 106] },
  { id: 'temp', label: 'Core Body Temperature', value: '37.1', unit: '°C', normal: 'Green zone: 36.5–37.8 °C', icon: Thermometer, data: [36.9, 37, 37.1, 37.1, 37.2, 37.1, 37.1] },
  { id: 'radiation', label: 'Cumulative Radiation', value: '172.0', unit: 'mSv', normal: 'Green zone: rate ≤ 110 µSv/h', icon: Radiation, data: [158, 161, 163, 165, 168, 170, 172] },
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
    ? { ...vital, value: String(opticalHeartRate), data: [68, 69, opticalHeartRate - 2, opticalHeartRate, opticalHeartRate + 1, opticalHeartRate, opticalHeartRate], normal: 'Optical camera scan · telemetry updated' }
    : vital.id === 'radiation'
    ? { ...vital, value: radiationDose, data: solarEvent.active ? [172, 210, 265, 310, 350, 390, 420] : [158, 161, 163, 165, 168, 170, 172], normal: solarEvent.active ? `Red zone: ${radiationRate} µSv/h` : vital.normal }
    : vital)
  return <section className="dashboard-section vitals-section"><div className="section-heading"><div><p className="eyebrow"><Activity size={13} /> CONNECTED BIO-MONITOR · LIMITS CALIBRATED FOR DEEP SPACE</p><h3>Vital Signs <span>· real-time</span></h3></div><div className="vital-header-actions"><span className={`connected-label ${solarEvent.active ? 'critical-label' : ''}`}><span className="status-dot" /> {solarEvent.active ? `SEP active · ${radiationRate} µSv/h` : 'Updated every 5s'}</span><button type="button" className="female-action optical-trigger" onClick={() => { setScannerMode('pulse'); setScannerOpen(true) }}><Camera size={14} /> Optical Camera Scan</button></div></div><div className="vitals-grid">{displayVitals.map((vital) => <VitalCard key={vital.id} vital={vital} onRadiationScan={() => { setScannerMode('radiation'); setScannerOpen(true) }} onWristbandSync={syncWristband} wristbandSyncing={wristbandSyncing} wristbandDose={wristbandDose} habitatDose={habitatDose} wristbandSyncResult={wristbandSyncResult} />)}<article className="recalibration-card"><div className="recalibration-copy"><p className="eyebrow"><Brain size={13} /> AUTONOMOUS ADJUSTMENT</p><h4>Auto-Recalibration</h4><p>Green zones change according to the current environment's gravity, latency, and radiation.</p><button type="button" className="detail-action" onClick={() => onModule('cognitive')}>Run cognitive check <ChevronRight size={14} /></button></div><div className="quick-metrics"><span><b>DVT threshold</b>+4% calf</span><span><b>Calf today</b>+3.3%</span><span><b>Hemoglobin</b>12.9 g/dL</span><span><b>Career dose</b>{radiationDose} of 600 mSv</span></div></article></div><OpticalBioScanner open={scannerOpen} specialized={scannerMode === 'radiation'} initialMode={scannerMode} onClose={() => setScannerOpen(false)} onHeartRate={onOpticalHeartRate} onRadiationSync={onRadiationSync} onRadiationBurst={onRadiationBurst} /></section>
}

function VitalCard({ vital, onRadiationScan, onWristbandSync, wristbandSyncing, wristbandDose, habitatDose, wristbandSyncResult }) {
  const Icon = vital.icon
  return <article className="vital-card"><div className="vital-card-top"><div className="icon-tile"><Icon size={17} /></div><CheckCircle2 size={15} className="text-emerald-400" /></div><p>{vital.label}</p><strong>{vital.value}<small>{vital.unit}</small></strong><span className="vital-normal">{vital.normal}</span><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={vital.data.map((value, index) => ({ index, value }))}><defs><linearGradient id={`fill-${vital.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#55d6a5" stopOpacity=".32" /><stop offset="100%" stopColor="#55d6a5" stopOpacity="0" /></linearGradient></defs><YAxis domain={['dataMin - 2', 'dataMax + 2']} hide /><Tooltip content={() => null} /><Area type="monotone" dataKey="value" stroke="#55d6a5" fill={`url(#fill-${vital.id})`} strokeWidth={2} dot={false} /></AreaChart></ResponsiveContainer></div>{vital.id === 'radiation' && <><div className="radiation-breakdown"><span><b>Wristband Co-Located Dose</b>{wristbandDose.toFixed(2)} mSv</span><span><b>Habitat Ambient Sensor</b>{habitatDose.toFixed(2)} mSv</span></div><button type="button" className="radiation-dosimeter-button" onClick={onRadiationScan}><Camera size={12} /> Optical CMOS Dosimeter</button><button type="button" className="wristband-sync-button" onClick={onWristbandSync} disabled={wristbandSyncing}><Waves size={12} /> {wristbandSyncing ? 'NFC / BLE wave scanning…' : 'Tap Wristband to Sync (NFC)'}</button>{wristbandSyncing && <div className="wristband-wave-animation"><i /><i /><i /></div>}{wristbandSyncResult && <div className="wristband-sync-result">Detected {wristbandSyncResult.dose} · {wristbandSyncResult.module}</div>}</>}</article>
}
