import { useEffect, useMemo, useState } from 'react'
import {
  Activity, Anchor, ArrowDown, Battery, Brain, CheckCircle2, CircleAlert, ClipboardCheck, Droplets, Eye, HeartPulse, Lock,
  Megaphone, Radio, Rocket, ScanLine, Send, ShieldAlert, Siren, Snowflake, Sparkles,
  Thermometer, TimerReset, UserRound, Wind,
} from 'lucide-react'
import { InteractiveBodyAvatar } from './InteractiveBodyAvatar'
import { FacialTelemetryMonitor } from './FacialTelemetryMonitor'
import { runDiagnostic } from '../utils/neuralDiagnostic'

const zones = [
  { id: 'head', label: 'Head', score: 1 },
  { id: 'chest', label: 'Chest', score: 2 },
  { id: 'abdomen', label: 'Abdomen', score: 3 },
  { id: 'limbs', label: 'Limbs', score: 4 },
  { id: 'full', label: 'Whole body', score: 0 },
]
const symptomChips = [
  { label: 'Blurred vision', key: 'tontura' },
  { label: 'Pelvic discomfort', key: 'urinary' },
  { label: 'Tingling', key: 'tontura' },
  { label: 'Leg swelling', key: 'edema' },
  { label: 'Ringing ears', key: 'tontura' },
]
const questions = [
  { key: 'pain', label: 'Pain intensity', icon: HeartPulse, color: '#ef4444' },
  { key: 'dizziness', label: 'Neuro / visual', icon: Brain, color: '#f59e0b' },
  { key: 'fatigue', label: 'Fatigue / weakness', icon: Activity, color: '#f59e0b' },
  { key: 'breathlessness', label: 'Dyspnea / palpitations', icon: Wind, color: '#ef4444' },
  { key: 'urinary', label: 'Urinary / pelvic', icon: Droplets, color: '#f59e0b' },
  { key: 'edema', label: 'Edema / vascular asymmetry', icon: Activity, color: '#f97316' },
]
const iconMap = { Activity, Anchor, ArrowDown, Battery, ClipboardCheck, Droplets, Eye, HeartPulse, Lock, Megaphone, Radio, Rocket, ScanLine, Send, ShieldAlert, Siren, Snowflake, Thermometer }

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value))
}

function avatarColorToken(color) {
  return { '#ef4444': 'rose', '#fb7185': 'rose', '#f59e0b': 'amber', '#f97316': 'orange', '#10b981': 'emerald' }[color] || 'emerald'
}

export function EmergencyTriageForm({ radiationIndex = 0.8, biometricTelemetry = {}, initialBiologicalProfile = 'female', onComplete }) {
  const [subject, setSubject] = useState('self')
  const [biologicalProfile, setBiologicalProfile] = useState(initialBiologicalProfile)
  const [crewId, setCrewId] = useState('')
  const [zone, setZone] = useState('full')
  const [symptoms, setSymptoms] = useState({ pain: 0, dizziness: 0, fatigue: 0, breathlessness: 0, urinary: 0, edema: 0 })
  const [chips, setChips] = useState([])
  const [description, setDescription] = useState('')
  const [telemetry, setTelemetry] = useState({
    bpm: biometricTelemetry.bpm ?? 72,
    temperature: biometricTelemetry.temperature ?? 36.8,
    systolic: biometricTelemetry.systolic ?? 115,
    spo2: biometricTelemetry.spo2 ?? 98,
    radiation: biometricTelemetry.radiation ?? radiationIndex,
  })
  const [result, setResult] = useState(null)
  const [facialStressScore, setFacialStressScore] = useState(0)
  const [completedSteps, setCompletedSteps] = useState([])
  const [timer, setTimer] = useState(null)

  const keywordBoosts = useMemo(() => {
    const text = `${description} ${chips.join(' ')}`.toLowerCase()
    return {
      dizziness: /(vision|blur|tingling|ringing|vertigo|dizz)/.test(text) ? 3 : 0,
      urinary: /(pelvic|urinary|dysuria|burning|menstrual)/.test(text) ? 3 : 0,
      edema: /(swelling|edema|calf|jugular|neck)/.test(text) ? 3 : 0,
      breathlessness: /(nausea|breath|shortness|palpitation)/.test(text) ? 2 : 0,
    }
  }, [description, chips])
  const progress = result ? 100 : Math.round((Object.values(symptoms).reduce((sum, value) => sum + value, 0) / 60) * 55 + (zone !== 'full' ? 15 : 0) + (Object.keys(telemetry).length * 6))
  const declaredSymptomScore = Math.round((Object.values(symptoms).reduce((sum, value) => sum + value, 0) / 6) * 10) / 10

  useEffect(() => {
    if (!timer || timer.remaining <= 0) return undefined
    const interval = window.setInterval(() => setTimer((current) => {
      if (!current || current.remaining <= 1) return current ? { ...current, remaining: 0, running: false } : current
      return { ...current, remaining: current.remaining - 1 }
    }), 1000)
    return () => window.clearInterval(interval)
  }, [timer])

  const updateTelemetry = (key, value) => setTelemetry((current) => ({ ...current, [key]: Number(value) }))
  const selectBiologicalProfile = (profile) => {
    setBiologicalProfile(profile)
    if (profile === 'female') {
      setSymptoms((current) => ({ ...current, urinary: Math.max(current.urinary, 2), edema: Math.max(current.edema, 1) }))
      setChips((current) => current.includes('Pelvic discomfort') ? current : [...current, 'Pelvic discomfort'])
    } else {
      setSymptoms((current) => ({ ...current, urinary: Math.min(current.urinary, 1) }))
      setChips((current) => current.filter((item) => item !== 'Pelvic discomfort'))
    }
  }
  const simulatePeak = () => setTelemetry({ bpm: 142, temperature: 39.1, systolic: 168, spo2: 88, radiation: 4.6 })
  const toggleChip = (label) => setChips((current) => current.includes(label) ? current.filter((item) => item !== label) : [...current, label])
  const analyze = () => {
    const features = [
      symptoms.pain,
      clamp(symptoms.dizziness + keywordBoosts.dizziness, 0, 10),
      symptoms.fatigue,
      clamp(symptoms.breathlessness + keywordBoosts.breathlessness, 0, 10),
      clamp(symptoms.urinary + keywordBoosts.urinary, 0, 10),
      clamp(symptoms.edema + keywordBoosts.edema, 0, 10),
      zones.find((item) => item.id === zone)?.score ?? 0,
      biologicalProfile === 'female' ? 1 : 0,
      telemetry.bpm,
      telemetry.temperature,
      telemetry.systolic,
      telemetry.radiation,
      facialStressScore,
    ]
    const nextResult = runDiagnostic(features)
    setResult(nextResult)
    setCompletedSteps([])
    onComplete?.(nextResult)
  }
  const reset = () => { setResult(null); setCompletedSteps([]); setTimer(null) }
  const toggleStep = (stepNumber, durationSeconds) => {
    setCompletedSteps((current) => current.includes(stepNumber) ? current.filter((item) => item !== stepNumber) : [...current, stepNumber])
    if (durationSeconds >= 30) setTimer({ stepNumber, remaining: durationSeconds, running: true })
  }

  return <section className="triage-form">
    <div className="triage-mission-bar"><div><p className="eyebrow"><ShieldAlert size={14} /> EMERGENCY TRIAGE · LOCAL AI</p><h2>One-Form Rescue Assessment</h2></div><div className="triage-progress"><span>MISSION PROGRESS <b>{progress}%</b></span><i><em style={{ width: `${clamp(progress, 0, 100)}%` }} /></i></div></div>
    <FacialTelemetryMonitor declaredSymptomScore={declaredSymptomScore} onStressScore={setFacialStressScore} />
    <div className="triage-subject-toggle"><span className="triage-selector-label">Crew profile</span><button type="button" className={biologicalProfile === 'female' ? 'active' : ''} onClick={() => selectBiologicalProfile('female')}><UserRound size={15} /> Female</button><button type="button" className={biologicalProfile === 'male' ? 'active' : ''} onClick={() => selectBiologicalProfile('male')}><UserRound size={15} /> Male</button><span className="triage-selector-label">Assessment</span><button type="button" className={subject === 'self' ? 'active' : ''} onClick={() => setSubject('self')}><UserRound size={15} /> Assess Myself</button><button type="button" className={subject === 'crew' ? 'active' : ''} onClick={() => setSubject('crew')}><Radio size={15} /> Assess Crew Mate</button>{subject === 'crew' && <input value={crewId} onChange={(event) => setCrewId(event.target.value)} placeholder="Crew ID or name (optional)" aria-label="Crew ID or name" />}</div>
    <div className="triage-form-grid">
      <div className="triage-symptoms-panel"><div className="triage-section-title"><span>01</span><div><h3>Symptoms & crew report</h3><p>Tap the avatar zone, then tune the signal sliders.</p></div></div><InteractiveBodyAvatar biologicalProfile={biologicalProfile} selectedZone={zone} onSelectZone={setZone} severityColor={avatarColorToken(result?.avatarCue?.statusColor)} pulseSpeed={result?.avatarCue?.pulseSpeed || 'slow'} /><div className="triage-zone-chips">{zones.map((item) => <button type="button" key={item.id} className={zone === item.id ? 'active' : ''} onClick={() => setZone(item.id)}>{item.label}</button>)}</div><div className="triage-sliders">{questions.map(({ key, label, icon: Icon, color }) => <label key={key}><span><Icon size={15} />{label}<b style={{ color: symptoms[key] > 6 ? '#ef4444' : color }}>{symptoms[key]} / 10</b></span><input type="range" min="0" max="10" value={symptoms[key]} onChange={(event) => setSymptoms((current) => ({ ...current, [key]: Number(event.target.value) }))} /></label>)}</div><div className="triage-quick-row">{symptomChips.map((chip) => <button type="button" key={chip.label} className={chips.includes(chip.label) ? 'active' : ''} onClick={() => toggleChip(chip.label)}>{chip.label}</button>)}</div><textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Add a short crew report or observed symptom..." aria-label="Crew report" maxLength={240} /></div>
      <div className="triage-telemetry-panel"><div className="triage-section-title"><span>02</span><div><h3>Suit sensor telemetry</h3><p>Live Bio-Band readings feed the neural triage.</p></div></div><div className="triage-sensor-grid">{[['bpm', 'BPM', 45, 180, 0], ['temperature', 'TEMP °C', 35, 41, 1], ['systolic', 'SYS mmHg', 80, 190, 0], ['spo2', 'SpO₂ %', 80, 100, 0], ['radiation', 'DONKI RAD', 0, 5, 1]].map(([key, label, min, max, step]) => <label className="triage-sensor-card" key={key}><span>{label}</span><strong>{Number(telemetry[key]).toFixed(step)}{key === 'bpm' ? ' bpm' : ''}</strong><input type="range" min={min} max={max} step={step ? 0.1 : 1} value={telemetry[key]} onChange={(event) => updateTelemetry(key, event.target.value)} /></label>)}</div><button type="button" className="triage-simulate-button" onClick={simulatePeak}><Siren size={15} /> Simulate Emergency Peak</button><div className="triage-sensor-note"><Activity size={14} /> External telemetry is accepted through <code>biometricTelemetry</code>; sliders remain available for training demos.</div><button type="button" className="triage-analyze-button" onClick={analyze}><Sparkles size={17} /> Analyze Case with AI</button></div>
    </div>
    {result && <div className="triage-result-panel" style={{ '--result-color': result.avatarCue.statusColor }}><div className="triage-result-top"><div><p className="eyebrow"><ShieldAlert size={14} /> 03 · RESCUE AVATAR ACTIVE</p><h3>{result.diagnosis.label}</h3><span className="triage-severity">{result.diagnosis.severity.toUpperCase()} · {result.diagnosis.confidence.toFixed(1)}% confidence</span></div><InteractiveBodyAvatar biologicalProfile={biologicalProfile} selectedZone={result.avatarCue.highlightZone} onSelectZone={setZone} severityColor={avatarColorToken(result.avatarCue.statusColor)} pulseSpeed={result.avatarCue.pulseSpeed} diagnostic /></div>{result.facialWarning && <div className="triage-facial-warning"><CircleAlert size={15} /><span><b>Facial incongruence detected</b><small>{result.justification}</small></span></div>}<div className="triage-confidence"><span><small>Neural confidence</small><b>{result.diagnosis.confidence.toFixed(1)}%</b></span><i><em style={{ width: `${result.diagnosis.confidence}%` }} /></i></div><div className="triage-probabilities">{result.probabilities.map((item) => <div key={item.label}><span>{item.label}<b>{item.percentage.toFixed(1)}%</b></span><i><em style={{ width: `${item.percentage}%` }} /></i></div>)}</div><div className="triage-steps"><div className="triage-section-title"><span>04</span><div><h3>Gamified rescue protocol</h3><p>Complete each objective to stabilize the crew signal.</p></div></div>{result.actionSteps.map((step) => { const Icon = iconMap[step.iconName] || CheckCircle2; const isDone = completedSteps.includes(step.stepNumber); const activeTimer = timer?.stepNumber === step.stepNumber; return <div className={`triage-step ${isDone ? 'done' : ''}`} key={step.stepNumber}><button type="button" onClick={() => toggleStep(step.stepNumber, step.durationSeconds)}><span className="triage-step-number">{isDone ? <CheckCircle2 size={16} /> : step.stepNumber}</span><span><b><Icon size={14} /> {step.title}</b><small>{step.instruction}</small></span><em>{activeTimer && timer.running ? `${timer.remaining}s` : `${step.durationSeconds}s`}</em></button>{activeTimer && timer.running && <div className="triage-timer"><TimerReset size={13} /> Monitoring live · keep position steady</div>}</div> })}</div><div className="triage-result-actions"><span>{completedSteps.length} / {result.actionSteps.length} objectives complete</span><button type="button" onClick={reset}><ScanLine size={14} /> Start New Assessment</button></div></div>}
  </section>
}
