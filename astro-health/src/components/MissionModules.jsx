import { useEffect, useState } from 'react'
import { Activity, Anchor, ArrowLeft, Brain, CircleAlert, Droplets, Dumbbell, FlaskConical, Gauge, HeartPulse, LockKeyhole, Package, Pill, Radiation, RotateCcw, Scale, ScanLine, Send, ShieldAlert, ShieldCheck, Timer, Trophy, UserRound } from 'lucide-react'
import { EmergencyTriageForm } from './EmergencyTriageForm'
import { OpticalBioScanner } from './OpticalBioScanner'
import { NutritionalBiomarkerPanel } from './NutritionalBiomarkerPanel'
import { crew as crewRoster } from '../data/missionData'

export function MissionModules({ module, crew, mission, missionType, labResults, onRecordLabResult, onModule, solarEvent, onAward, onDispatch, onOpticalHeartRate, opticalSnapshot, onOpticalSnapshot, onRadiationSync, onRadiationBurst }) {
  if (module === 'female') return <FemaleHealth crew={crew} mission={mission} missionType={missionType} labResults={labResults} onRecordLabResult={onRecordLabResult} onModule={onModule} solarEvent={solarEvent} onAward={onAward} onRadiationSync={onRadiationSync} onRadiationBurst={onRadiationBurst} />
  if (module === 'emergency') return <EmergencyGuided mission={mission} crew={crew} onModule={onModule} onAward={onAward} onDispatch={onDispatch} onOpticalHeartRate={onOpticalHeartRate} opticalSnapshot={opticalSnapshot} onOpticalSnapshot={onOpticalSnapshot} />
  return <CognitiveReadiness onModule={onModule} onAward={onAward} />
}

function ModuleShell({ eyebrow, title, description, children, onModule }) {
  return <div className="module-page"><button type="button" className="back-link" onClick={() => onModule('dashboard')}><ArrowLeft size={14} /> Crew Dashboard</button><div className="module-hero"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div>{children}</div>
}

function FemaleHealth({ crew, mission, missionType, labResults, onRecordLabResult, onModule, solarEvent, onAward, onRadiationSync, onRadiationBurst }) {
  const [protocol, setProtocol] = useState('combined')
  const [cyclePhase, setCyclePhase] = useState('luteal')
  const [cycleDay, setCycleDay] = useState(22)
  const [calfReading, setCalfReading] = useState(null)
  const [bioRecorded, setBioRecorded] = useState(false)
  const [venousCompleted, setVenousCompleted] = useState(false)
  const [landingStep, setLandingStep] = useState(0)
  const [landingScore, setLandingScore] = useState(72)
  const [landingSeconds, setLandingSeconds] = useState(0)
  const [landingAwarded, setLandingAwarded] = useState(false)
  const [missionDay, setMissionDay] = useState(96)
  const [eclssLogged, setEclssLogged] = useState(false)
  const [opticalScannerOpen, setOpticalScannerOpen] = useState(false)
  const [opticalDiagnostic, setOpticalDiagnostic] = useState(null)
  const pharmacyIntegrity = solarEvent.active ? 76 : 94
  const calfRisk = calfReading ? (mission.gravity === '0g' ? 'Caution · +4.6%' : 'Nominal · +2.1%') : 'Awaiting reading'
  const protocolInfo = {
    combined: { title: 'Menstrual Suppression — Combined Pill', detail: 'Estrogen + progestin', icon: Pill },
    implant: { title: 'Menstrual Suppression — Hormonal IUD / Implant', detail: 'No daily pills', icon: ShieldCheck },
    natural: { title: 'Active Natural Cycle', detail: 'No hormonal suppression', icon: Droplets },
  }
  const phaseInfo = {
    menstrual: 'Menstrual · bleeding window and increased iron surveillance',
    follicular: 'Follicular · hematologic recovery and endometrial growth',
    ovulatory: 'Ovulatory · physiologic energy and HRV peak',
    luteal: 'Luteal · basal temperature calibrated +0.4°C',
  }
  const ProtocolIcon = protocolInfo[protocol].icon
  const gravityLabel = mission.gravity === '0.16g' ? 'Lunar surface' : mission.gravity === '0.38g' ? 'Mars surface' : 'Microgravity'
  const remainingMissionDays = Math.max(0, 900 - missionDay)
  const pillPotency = Math.max(0, 100 - missionDay * 0.018 - (solarEvent.active ? missionDay * 0.028 : 0))
  const completeOpticalDiagnostic = (result) => {
    setOpticalDiagnostic(result)
    if (result.mode === 'calf') setCalfReading(true)
    onAward('optical-diagnostics-specialist', 75, 'Optical Diagnostics Specialist')
  }
  useEffect(() => {
    if (landingStep === 0 || landingStep >= 4) return undefined
    const timer = window.setInterval(() => setLandingSeconds((seconds) => Math.max(0, seconds - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [landingStep])
  return <ModuleShell eyebrow="MODULE 02 · WOMEN'S HEALTH · HRP" title="Women's Health" description={`Physiology, space pharmacology, and radiation telemetry for ${crew.name} during ${mission.name}.`} onModule={onModule}>
    {solarEvent.active && <div className="cascade-alert"><CircleAlert size={18} /><div><strong>Active SEP event · radiation {solarEvent.radiationRate} µSv/h</strong><p>{protocol === 'combined' ? `Pharmacologic integrity reduced to ${pharmacyIntegrity}%. Review protected blister packs in the shelter before the next dose.` : protocol === 'implant' ? 'No-daily-pill method: radiation degradation of blister packs not applicable. Maintain bone and breakthrough bleeding surveillance.' : 'Cross-reference fatigue/nausea with cycle phase and request leukocyte and hemoglobin testing in the Bio-Analyzer.'}</p></div></div>}
    <div className="female-protocol-selector"><p className="eyebrow"><ShieldCheck size={13} /> ACTIVE HORMONAL PROTOCOL</p><div className="female-protocol-grid">{Object.entries(protocolInfo).map(([id, item]) => { const Icon = item.icon; return <button type="button" key={id} className={protocol === id ? 'active' : ''} onClick={() => setProtocol(id)}><Icon size={18} /><span><strong>{item.title}</strong><small>{item.detail}</small></span></button> })}</div></div>
    <div className="female-status-strip"><div><ProtocolIcon size={17} /><span>{protocolInfo[protocol].title}<small>{protocol === 'combined' ? 'DVT + pharmacologic degradation monitored' : protocol === 'implant' ? 'Bone mineral density + breakthrough bleeding monitored' : phaseInfo[cyclePhase]}</small></span></div><span className={`state-badge ${solarEvent.active ? 'attention' : ''}`}><span /> {solarEvent.active ? 'Caution' : 'Nominal telemetry'}</span></div>
    <LandingReadinessCard mission={mission} gravityLabel={gravityLabel} landingStep={landingStep} setLandingStep={setLandingStep} landingScore={landingScore} setLandingScore={setLandingScore} landingSeconds={landingSeconds} setLandingSeconds={setLandingSeconds} landingAwarded={landingAwarded} setLandingAwarded={setLandingAwarded} onAward={onAward} />
    <PharmacokineticsCard missionDay={missionDay} setMissionDay={setMissionDay} pillPotency={pillPotency} solarEvent={solarEvent} onLaunchOptical={() => setOpticalScannerOpen(true)} />
    {protocol === 'natural' && <article className="female-card cycle-card"><div className="female-card-heading"><div><p className="eyebrow"><Droplets size={13} /> ACTIVE NATURAL CYCLE</p><h3>{phaseInfo[cyclePhase]}</h3></div><strong>Day {cycleDay} <small>/ 28</small></strong></div><div className="cycle-wheel"><i style={{ transform: `rotate(${((cycleDay - 1) / 28) * 360}deg)` }} /></div><input aria-label="Cycle day" type="range" min="1" max="28" value={cycleDay} onChange={(event) => setCycleDay(Number(event.target.value))} /><div className="cycle-phases">{Object.entries({ menstrual: 'Menstrual', follicular: 'Follicular', ovulatory: 'Ovulatory', luteal: 'Luteal' }).map(([id, label]) => <button type="button" key={id} className={cyclePhase === id ? 'active' : ''} onClick={() => setCyclePhase(id)}>{label}</button>)}</div></article>}
    <div className="female-science-grid"><article className="female-card"><p className="eyebrow"><Gauge size={13} /> DYNAMIC VITAL-SIGN CALIBRATION</p><h3>Individual physiology recalibrated</h3><p className="module-copy">LYRA adjusts the green zone to prevent false alarms: during the luteal phase, basal body temperature accepts <strong>+0.4°C</strong>; Heart Rate Variability (HRV) is compared with the personal baseline, not an Earth average.</p><div className="calibration-values"><span><b>Basal temperature</b>36.9–37.5°C luteal</span><span><b>Reference HRV</b>62 ms · individual baseline</span></div></article><article className="female-card"><p className="eyebrow"><FlaskConical size={13} /> SPACE ANEMIA & IRON RADAR</p><h3>Bio-Analyzer · latest reading</h3><div className="lab-values"><span><b>12.4</b>g/dL<small>Hemoglobin</small></span><span><b>38</b>ng/mL<small>Ferritin</small></span></div><p className="module-copy">Microgravity accelerates red blood cell destruction. Prioritize dietary iron and record fatigue, dyspnea, or bleeding.</p><button type="button" className="female-action optical-launch-button" onClick={() => setOpticalScannerOpen(true)}>Launch Optical Bio-Check (Camera)</button><div className="eclss-note"><Droplets size={14} /> Waste protocol: segregate biological material to protect ECLSS water recycling.</div></article></div>
    <div className="female-science-grid"><article className="female-card"><p className="eyebrow"><Scale size={13} /> VENOUS THROMBOEMBOLISM (DVT) SCREENING</p><h3>Doppler / comparative calf assessment</h3><p className="module-copy">Compare left and right circumference to cross-reference venous stasis with current gravity: <strong>{mission.gravity}</strong>.</p><div className="calf-comparison"><span>Left <b>36.2 cm</b></span><span>Right <b>{calfReading ? '37.9 cm' : '—'}</b></span></div><button type="button" className="female-action" onClick={() => setCalfReading(true)}>{calfReading ? `Reading complete · ${calfRisk}` : 'Read calves with Doppler · 2s'}</button>{calfReading && <div className="risk-result"><strong>{calfRisk}</strong><small>Index cross-referenced with {mission.gravity} · repeat for pain, warmth, or edema</small></div>}</article><article className="female-card"><p className="eyebrow"><Dumbbell size={13} /> BONE & OVARIAN RESERVE PROTECTION</p><h3>ARED + cumulative dose</h3><div className="bone-meter"><div><span>Weekly resistive exercise</span><b>78%</b></div><i><em style={{ width: '78%' }} /></i><div><span>Radiation career dose</span><b>{solarEvent.active ? '30.1%' : '28.7%'}</b></div><i className="radiation-meter"><em style={{ width: `${solarEvent.active ? 30.1 : 28.7}%` }} /></i></div><p className="module-copy">Maintain ARED for bone mineral density and record dose for ovarian monitoring. Cumulative dose: <strong>{(172 + solarEvent.addedDose).toFixed(1)} mSv</strong>.</p></article></div>
    <NeuroOcularCard />
    <NutritionalBiomarkerPanel missionType={missionType} latestResults={labResults} onRecordLabResult={onRecordLabResult} />
    {protocol === 'natural' && <EclssLogisticsCard remainingMissionDays={remainingMissionDays} eclssLogged={eclssLogged} setEclssLogged={setEclssLogged} onAward={onAward} />}
    {opticalDiagnostic && <div className="optical-diagnostic-status"><strong>Optical reading logged · {opticalDiagnostic.title}</strong><span>{opticalDiagnostic.metric} · {new Date(opticalDiagnostic.timestamp).toLocaleString('en-US')}</span></div>}
    <OpticalBioScanner open={opticalScannerOpen} specialized initialMode="anemia" onClose={() => setOpticalScannerOpen(false)} onDiagnostic={completeOpticalDiagnostic} onRadiationSync={onRadiationSync} onRadiationBurst={onRadiationBurst} />
    <div className="female-actions"><button type="button" className="female-action" disabled={bioRecorded} onClick={() => { setBioRecorded(true); onAward('female-bio', 80, 'Female Bio-Analyzer Reading Recorded') }}><FlaskConical size={15} />{bioRecorded ? 'Bio-Analyzer reading recorded' : 'Record Bio-Analyzer Reading (+80 XP)'}</button><button type="button" className="female-action" disabled={venousCompleted} onClick={() => { setVenousCompleted(true); onAward('female-venous', 60, 'Preventive Venous Protocol') }}><HeartPulse size={15} />{venousCompleted ? 'Venous pumping completed' : 'Complete Preventive Venous Pumping Protocol (+60 XP)'}</button></div>
  </ModuleShell>
}

function LandingReadinessCard({ mission, gravityLabel, landingStep, setLandingStep, landingScore, setLandingScore, landingSeconds, setLandingSeconds, landingAwarded, setLandingAwarded, onAward }) {
  const auroraBodyMassKg = 62
  const fluidLoadMl = Math.round(auroraBodyMassKg * 5)
  const transitionText = mission.gravity === '0g'
    ? 'Microgravity baseline: maintain countermeasure readiness before a gravity transition.'
    : `${gravityLabel} landing: orthostatic stress rises as blood volume shifts toward the lower body.`
  const advance = () => {
    if (landingStep === 0) setLandingStep(1)
    else if (landingStep < 4) setLandingStep((step) => step + 1)
    if (landingStep < 4) setLandingSeconds(15)
    if (landingStep === 3) {
      setLandingScore(96)
      setLandingStep(4)
      if (!landingAwarded) {
        setLandingAwarded(true)
        onAward('landing-lbnP', 90, 'LBNP Orthostatic Countermeasure Complete')
      }
    }
  }
  return <article className="female-card female-tool-card"><div className="female-card-heading"><div><p className="eyebrow"><Gauge size={13} /> GRAVITY TRANSITION & ORTHOSTATIC TOLERANCE</p><h3>Landing Readiness & Orthostatic Stress</h3></div><strong>{landingScore}% <small>landing score</small></strong></div><p className="module-copy"><strong>{mission.gravity} · {gravityLabel}</strong> — {transitionText}</p><p className="module-copy">Female astronauts can experience greater post-flight orthostatic intolerance because fluid redistribution, reduced plasma volume, and cardiovascular deconditioning can impair upright blood-pressure control during re-entry to gravity.</p><div className="calibration-values"><span><b>Current environment</b>{mission.name}</span><span><b>Aurora body mass / fluid target</b>{auroraBodyMassKg} kg · {fluidLoadMl} mL electrolyte solution</span></div>{landingStep === 0 && <button type="button" className="female-action" onClick={advance}>Run LBNP Countermeasure Session · 3 steps</button>}{landingStep > 0 && landingStep < 4 && <div className="protocol-steps"><span className="protocol-step active"><b>{landingStep}</b>{landingStep === 1 ? `Drink ${fluidLoadMl} mL electrolyte solution` : landingStep === 2 ? 'Complete 5-minute LBNP exposure' : 'Confirm orthostatic stand-test readiness'}</span><span className="protocol-timer">{String(landingSeconds).padStart(2, '0')}s</span><button type="button" className="female-action" onClick={advance}>{landingStep === 1 ? 'Confirm fluid loading' : landingStep === 2 ? 'Confirm LBNP session' : 'Confirm stand-test readiness'}</button></div>}{landingStep === 4 && <div className="risk-result"><strong>LBNP session complete · Landing Orthostatic Score 96%</strong><small>Countermeasure sequence logged for {mission.name}. Repeat before any major gravity transition.</small></div>}</article>
}

function PharmacokineticsCard({ missionDay, setMissionDay, pillPotency, solarEvent, onLaunchOptical }) {
  const recommendation = pillPotency < 80 || solarEvent.active
  return <article className="female-card female-tool-card"><p className="eyebrow"><Pill size={13} /> SPACE PHARMACOKINETICS & RADIATION SHELF-LIFE</p><h3>Onboard Pharmacy & Pharmacokinetics Analyzer</h3><button type="button" className="female-action optical-launch-button" onClick={onLaunchOptical}>Launch Optical Bio-Check (Camera)</button><div className="metric-table"><div className="metric-table-row metric-table-head"><span>Telemetry metric</span><b>Combined pill</b><b>Levonorgestrel IUD</b><b>Subdermal implant</b></div><div className="metric-table-row"><span>Microgravity hepatic absorption (CYP3A4 shift)</span><b>Variable</b><b>Low systemic load</b><b>Low systemic load</b></div><div className="metric-table-row"><span>VTE (clot) risk multiplier in 0g</span><b>1.8×</b><b>1.1×</b><b>1.2×</b></div><div className="metric-table-row"><span>Cosmic radiation degradation rate</span><b>High · oral blister packs</b><b>Low · implanted device</b><b>Low · implanted device</b></div></div><label className="tool-range">Mission Duration Forecast · Day {missionDay} of 900 (Mars round-trip)<input aria-label="Mission duration forecast" type="range" min="1" max="900" value={missionDay} onChange={(event) => setMissionDay(Number(event.target.value))} /></label><div className="calibration-values"><span><b>Oral pill potency forecast</b>{pillPotency.toFixed(1)}%</span><span><b>DONKI radiation modifier</b>{solarEvent.active ? 'Active SEP event · accelerated loss' : 'Nominal deep-space exposure'}</span></div>{recommendation && <div className="eclss-note"><CircleAlert size={14} /> Automated recommendation: switch from oral suppression to a non-oral method before launch or before potency falls below the operational threshold.</div>}</article>
}

function NeuroOcularCard() {
  return <article className="female-card female-tool-card"><p className="eyebrow"><Brain size={13} /> SANS & NUTRIENT CONTEXT</p><h3>Neuro-Ocular & Vascular Observations</h3><p className="module-copy">Review neuro-ocular and vascular observations alongside the recorded laboratory history. The lab values below are displayed as recorded and are not used to calculate a diagnosis or treatment recommendation.</p></article>
}

function EclssLogisticsCard({ remainingMissionDays, eclssLogged, setEclssLogged, onAward }) {
  const days = Math.min(remainingMissionDays, 900)
  const supplies = { cups: Math.ceil(days / 28), wipes: days * 3, pouches: days * 1 }
  const logDailyCheck = () => {
    if (eclssLogged) return
    setEclssLogged(true)
    onAward('eclss-menstrual-log', 50, 'ECLSS Menstrual Hygiene Log Complete')
  }
  return <article className="female-card female-tool-card"><p className="eyebrow"><Droplets size={13} /> ECLSS WATER RECOVERY & HYGIENE LOGISTICS</p><h3>Active Cycle Closed-Loop Habitat Calculator</h3><p className="module-copy">Projected remaining mission days: <strong>{days}</strong>. Supply estimates support ISS, Lunar Gateway, and Mars Transit logistics planning.</p><div className="biomarker-grid"><span><b>Reusable menstrual cups</b>{supplies.cups} units</span><span><b>Hygiene wipes</b>{supplies.wipes} units</span><span><b>Sealed disposal pouches</b>{supplies.pouches} units</span><span><b>Habitat routing</b>Solid bio-containment</span></div><div className="eclss-note"><CircleAlert size={14} /><span><strong>ECLSS UPA Protection Alert:</strong> route menstrual waste to solid bio-containment, never liquid water recycling, during active menstruation.</span></div><label className="check-log"><input type="checkbox" checked={eclssLogged} onChange={logDailyCheck} /> Daily menstrual hygiene and waste-routing log complete <b>{eclssLogged ? '+50 XP awarded' : '+50 XP'}</b></label></article>
}

const scenarios = [
  { id: 'chest', label: 'Acute Chest Pain / Collapse', icon: HeartPulse },
  { id: 'thrombosis', label: 'Suspected DVT', detail: 'Calf swelling', icon: UserRound },
  { id: 'radiation', label: 'Acute Radiation Exposure', icon: Radiation },
]

function ScenarioSelector({ active, onChange }) {
  return <div className="scenario-selector" aria-label="Emergency scenario">{scenarios.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={active === item.id ? 'active' : ''} onClick={() => onChange(item.id)}><Icon size={18} /><span>{item.label}<small>{item.detail || 'Immediate triage'}</small></span></button> })}</div>
}

function EmergencyGuided({ mission, crew, onModule, onAward, onDispatch, onOpticalHeartRate, opticalSnapshot, onOpticalSnapshot }) {
  const [scenario, setScenario] = useState('chest')
  return <ModuleShell eyebrow="MODULE 03 · EMERGENCY COCKPIT" title="Guided Emergency" description={`${mission.name} · low-cognitive-load protocol`} onModule={onModule}><EmergencyTriageForm authenticatedCrew={crew} crewOptions={crewRoster} missionDay={96} initialBiologicalProfile={crew?.gender === 'male' ? 'male' : 'female'} radiationIndex={mission.gravity === '0g' ? 1.2 : 0.5} biometricTelemetry={{ bpm: 72, temperature: 36.8, systolic: 115, radiation: mission.gravity === '0g' ? 1.2 : 0.5 }} /><ScenarioSelector active={scenario} onChange={setScenario} />{scenario === 'chest' && <ChestTraining mission={mission} onReset={() => setScenario('chest')} onDispatch={onDispatch} onOpticalHeartRate={onOpticalHeartRate} opticalSnapshot={opticalSnapshot} onOpticalSnapshot={onOpticalSnapshot} />}{scenario === 'thrombosis' && <ThrombosisTraining mission={mission} onAward={onAward} onReset={() => setScenario('thrombosis')} onDispatch={onDispatch} />}{scenario === 'radiation' && <RadiationTraining crew={crew} mission={mission} onAward={onAward} onReset={() => setScenario('radiation')} onDispatch={onDispatch} />}</ModuleShell>
}

function TrainingHeader({ label, step, complete }) {
  return <><div className="training-progress-head"><span>{label}</span><strong>{complete ? '100%' : `${step * 25}%`}</strong></div><div className="training-progress"><i style={{ width: `${complete ? 100 : step * 25}%` }} /></div><div className="training-timer">RESPONSE TIME <b>00:{String(Math.max(0, 30 - step * 6)).padStart(2, '0')}</b></div><div className="training-stepper">{[1, 2, 3, 4].map((number) => <span className={step >= number - 1 || complete ? 'active' : ''} key={number}>{number}</span>)}</div></>
}

function ChestTraining({ mission, onReset, onDispatch, onOpticalHeartRate, opticalSnapshot, onOpticalSnapshot }) {
  const [step, setStep] = useState(0)
  const [capturing, setCapturing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [captured, setCaptured] = useState(false)
  const [differential, setDifferential] = useState(null)
  const [sent, setSent] = useState(false)
  const [scannerOpen, setScannerOpen] = useState(false)
  useEffect(() => {
    if (!capturing) return undefined
    const started = Date.now()
    const timer = window.setInterval(() => { const value = Math.min(100, ((Date.now() - started) / 3000) * 100); setProgress(value); if (value === 100) { window.clearInterval(timer); setCapturing(false); setCaptured(true) } }, 80)
    return () => window.clearInterval(timer)
  }, [capturing])
  return <div className="training-mission"><TrainingHeader label="MISSION: ACUTE CHEST PAIN" step={step} complete={sent} /><article className="training-card">{step === 0 && <><UserRound size={34} /><p className="training-kicker">STEP 1 · RESTRAINT</p><h3>Secure the crew member in 0g</h3><p>Secure your colleague's legs and your own to the wall restraints.</p><button type="button" className="training-action" onClick={() => { setStep(1); setCapturing(true) }}>CONFIRM PHYSICAL RESTRAINT IN 0g <LockKeyhole size={16} /></button></>}{step === 1 && <><Activity size={34} /><p className="training-kicker">STEP 2 · BIO-MONITOR / OPTICAL CAPTURE</p><h3>{captured ? 'Reading captured' : 'Live capture'}</h3>{capturing && <><div className="capture-readout"><span>ECG</span><strong>▁▂▃▂▁▃▂▁▂▃▁</strong><span>SpO2 · 98%</span></div><div className="capture-progress"><i style={{ width: `${progress}%` }} /></div></>}{captured && <><div className="capture-result"><strong>Normal Sinus Rhythm</strong><span>Stable ECG · SpO2 98%</span></div><button type="button" className="training-next" onClick={() => setStep(2)}>CONTINUE</button></>}<button type="button" className="training-action optical-emergency-trigger" onClick={() => setScannerOpen(true)}>Open Optical Camera Scan</button>{opticalSnapshot && <img className="emergency-snapshot" src={opticalSnapshot} alt="Optical pupil capture attached to emergency report" />}</>}{step === 2 && <><CircleAlert size={34} className="cockpit-icon amber" /><p className="training-kicker">STEP 3 · DIFFERENTIAL TRIAGE</p><h3>Which description matches?</h3><div className="training-choices"><button type="button" onClick={() => { setDifferential('critical'); setStep(3) }}>YES — Dyspnea or radiating pain</button><button type="button" onClick={() => { setDifferential('reflux'); setStep(3) }}>NO — Typical reflux burning</button></div></>}{step === 3 && <><Package size={34} /><p className="training-kicker">STEP 4 · FINAL ACTION</p><h3>{differential === 'reflux' ? 'Administer Chewable Antacid' : 'Activate Defibrillator / Thromboembolism Protocol'}</h3><p>{differential === 'reflux' ? 'Inventory: 42 units · Drawer B2' : 'Heparin inventory: 6 ampoules'}</p><button type="button" className="training-action" onClick={() => { setSent(true); onDispatch?.(differential === 'reflux' ? 'Chest pain · probable reflux' : 'Chest pain · suspected cardiac event', 'Medical emergency') }}>EXECUTE AND TRANSMIT TELEMETRY <Send size={16} /></button>{sent && <div className="arrival-time">Estimated Earth arrival in <strong>{mission.latency}</strong></div>}</>}</article><OpticalBioScanner open={scannerOpen} initialMode="pupil" onClose={() => setScannerOpen(false)} onHeartRate={onOpticalHeartRate} onSnapshot={onOpticalSnapshot} /><div className="cockpit-footer"><span>TRAINING PROTOCOL</span><button type="button" className="back-link" onClick={onReset}><RotateCcw size={14} /> Restart</button></div></div>
}

function ThrombosisTraining({ onAward, mission, onReset, onDispatch }) {
  const [step, setStep] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [measurement, setMeasurement] = useState(false)
  const [decision, setDecision] = useState(null)
  const [complete, setComplete] = useState(false)
  useEffect(() => {
    if (!scanning) return undefined
    const started = Date.now()
    const timer = window.setInterval(() => { const value = Math.min(100, ((Date.now() - started) / 2000) * 100); setProgress(value); if (value === 100) { window.clearInterval(timer); setScanning(false); setMeasurement(true) } }, 80)
    return () => window.clearInterval(timer)
  }, [scanning])
  const finish = () => { setComplete(true); onAward('emergency', 150, 'Orbital First Responder'); onDispatch?.('Suspected DVT · calf asymmetry +4.6%', 'Medical emergency') }
  return <div className="training-mission"><TrainingHeader label="MISSION: VENOUS FLOW" step={step} complete={complete} /><article className="training-card">{complete ? <MissionMedal title="Orbital First Responder" mission={mission} onReset={onReset} /> : step === 0 ? <><Anchor size={34} /><p className="training-kicker">STEP 1 · RESTRAINT</p><h3>Secure the crew member and yourself in 0g</h3><button type="button" className="training-action" onClick={() => setStep(1)}>CONFIRM PHYSICAL RESTRAINT IN 0g <LockKeyhole size={16} /></button></> : step === 1 ? <><ScanLine size={34} /><p className="training-kicker">STEP 2 · MEASUREMENT</p><h3>Scan with Bio-Monitor / ultrasound</h3>{scanning ? <><div className="scan-progress"><i style={{ width: `${progress}%` }} /></div><small>Scan in progress…</small></> : measurement ? <><div className="measurement-result">+4.6% calf asymmetry</div><button type="button" className="training-next" onClick={() => setStep(2)}>CONTINUE</button></> : <button type="button" className="training-action" onClick={() => setScanning(true)}>START SCAN · 2s</button>}</> : step === 2 ? <><CircleAlert size={34} /><p className="training-kicker">STEP 3 · BINARY DECISION</p><h3>Are inflammatory signs present?</h3><div className="training-choices"><button type="button" onClick={() => { setDecision('yes'); setStep(3) }}>YES — Local pain and warmth detected</button><button type="button" onClick={() => { setDecision('no'); setStep(3) }}>NO — No inflammatory signs</button></div></> : <><Activity size={34} /><p className="training-kicker">STEP 4 · FINAL ACTION</p><h3>{decision === 'yes' ? 'Activate thromboembolism protocol' : 'Record observation and repeat in 30 min'}</h3><button type="button" className="training-action" onClick={finish}>EXECUTE PROTOCOL AND TRANSMIT TELEMETRY <Send size={16} /></button></>}</article></div>
}

function RadiationTraining({ crew, mission, onAward, onReset, onDispatch }) {
  const [step, setStep] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dose, setDose] = useState(false)
  const [triage, setTriage] = useState(null)
  const [complete, setComplete] = useState(false)
  useEffect(() => {
    if (!scanning) return undefined
    const started = Date.now()
    const timer = window.setInterval(() => { const value = Math.min(100, ((Date.now() - started) / 2000) * 100); setProgress(value); if (value === 100) { window.clearInterval(timer); setScanning(false); setDose(true) } }, 80)
    return () => window.clearInterval(timer)
  }, [scanning])
  const finish = () => { setComplete(true); onAward('emergency-radiation', 150, 'Solar Shield'); onDispatch?.('Acute radiation exposure · absorbed dose 145 mSv', 'Medical emergency') }
  return <div className="training-mission radiation-mission"><TrainingHeader label="MISSION: ACUTE EXPOSURE" step={step} complete={complete} /><article className="training-card">{complete ? <MissionMedal title="Solar Shield" mission={mission} onReset={onReset} /> : <>{step === 0 && <><Radiation size={34} className="text-red-400" /><p className="training-kicker">STEP 1 · STOP EXPOSURE</p><h3>Block the external source</h3><p>Close the radiation path before touching the crew member.</p><button type="button" className="training-action" onClick={() => setStep(1)}>SEAL AIRLOCK / ABORT EVA <LockKeyhole size={16} /></button></>}{step === 1 && <><Anchor size={34} /><p className="training-kicker">STEP 2 · RESTRAINT</p><h3>Secure the crew in 0g</h3><button type="button" className="training-action" onClick={() => setStep(2)}>CONFIRM PHYSICAL RESTRAINT IN 0g <LockKeyhole size={16} /></button></>}{step === 2 && <><ScanLine size={34} /><p className="training-kicker">STEP 3 · ABSORBED DOSE</p><h3>Read Dosimeter / Bio-Monitor</h3>{scanning && <><div className="scan-progress"><i style={{ width: `${progress}%` }} /></div><small>Dose reading in progress…</small></>}{!scanning && !dose && <button type="button" className="training-action" onClick={() => setScanning(true)}>START READING · 2s</button>}{dose && <><div className="measurement-result">145 mSv absorbed during event</div><p className="training-question">Nausea or acute fatigue within the last 2 hours?</p><div className="training-choices"><button type="button" onClick={() => setTriage('yes')}>YES — assess acute radiation syndrome</button><button type="button" onClick={() => setTriage('no')}>NO — no acute symptoms</button></div>{crew?.id === 'aurora' && <p className="profile-cross-check">Female profile: cross-reference nausea/fatigue with menstrual phase before completing triage.</p>}{triage && <button type="button" className="training-next" onClick={() => setStep(3)}>CONTINUE</button>}</>}</>}{step === 3 && <><ShieldAlert size={34} /><p className="training-kicker">STEP 4 · SHELTER & TELEMETRY</p><h3>Move to the water-shielded shelter</h3><p>{triage === 'yes' ? 'Symptoms detected: maintain medical observation in the shelter.' : 'No symptoms: maintain observation and repeat dose per protocol.'}</p><button type="button" className="training-action" onClick={finish}>CONFIRM SHELTER TRANSFER AND TRANSMIT PACKET TO HOUSTON <Send size={16} /></button></>}</>}</article></div>
}

function MissionMedal({ title, mission, onReset }) {
  return <div className="mission-complete"><Trophy size={43} /><p>MISSION COMPLETE</p><h3>{title}</h3><strong>+150 Medical Readiness XP</strong><small>Protocol executed and telemetry transmitted to Houston · {mission.latency}</small><button type="button" className="back-link" onClick={onReset}><RotateCcw size={14} /> Repeat mission</button></div>
}

function CognitiveReadiness({ onModule, onAward }) {
  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(null)
  return <ModuleShell eyebrow="MODULE 04 · NASA HRP" title="Cognitive Readiness" description="15-second psychomotor vigilance task measuring visual reaction time and spatial memory without subjective forms." onModule={onModule}><article className="cognitive-card"><div className="cognitive-icon"><Brain size={35} /></div><h3>{score ? `Response latency: ${score} ms` : 'Crew attention task'}</h3><p>{score ? 'Nominal result. Confinement fatigue and elevated CO2 not suggested by this reading.' : 'Observe the stimuli, tap the target, and memorize the sequence. The task starts when you are ready.'}</p>{!started && !score && <button type="button" className="detail-action" onClick={() => { setStarted(true); window.setTimeout(() => { setScore(284); setStarted(false); onAward('cognitive', 100, 'Nominal Cognitive Response') }, 1400) }}>Start task · 15s <Timer size={15} /></button>}{started && <div className="reaction-target">TAP HERE</div>}{score && <button type="button" className="back-link" onClick={() => setScore(null)}>Retake task</button>}</article></ModuleShell>
}
