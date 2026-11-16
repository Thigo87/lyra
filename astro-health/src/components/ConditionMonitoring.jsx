import { Activity, BookOpen, Check, CircleHelp, FlaskConical, RotateCcw, ShieldCheck } from 'lucide-react'
import { useState } from 'react'
import { compareWithPreflightBaseline } from '../utils/clinicalProxyEngine'
import { NutritionalBiomarkerPanel } from './NutritionalBiomarkerPanel'

const signalDefinitions = {
  medicationAdherence: { label: 'Medication adherence log', kind: 'categorical' },
  cyclePhase: { label: 'Cycle phase', kind: 'categorical' },
  pelvicPain: { label: 'Pelvic symptom check-in', kind: 'categorical' },
  radiation: { label: 'Cumulative radiation feed', kind: 'numeric' },
  skinTemp: { label: 'Skin temperature trend', kind: 'numeric' },
  basalTemp: { label: 'Basal temperature trend', kind: 'numeric' },
  hrv: { label: 'HRV trend', kind: 'numeric' },
  cuticle: { label: 'Cuticle / skin observation', kind: 'categorical' },
  fatigue: { label: 'Fatigue check-in', kind: 'categorical' },
  sleep: { label: 'Sleep check-in', kind: 'categorical' },
  cabinCo2: { label: 'Cabin CO₂', kind: 'numeric' },
  cabinPressure: { label: 'Cabin pressure', kind: 'numeric' },
  hydration: { label: 'Hydration log', kind: 'numeric' },
  headache: { label: 'Headache / dizziness check-in', kind: 'categorical' },
  neuroOcular: { label: 'Neuro-ocular feed', kind: 'numeric' },
  urinaryFrequency: { label: 'Urinary frequency check-in', kind: 'categorical' },
  humidity: { label: 'Cabin humidity', kind: 'numeric' },
  hygiene: { label: 'Hygiene / dry-change log', kind: 'categorical' },
  workout: { label: 'Time since workout', kind: 'numeric' },
  antibiotics: { label: 'Recent antibiotic-course log', kind: 'categorical' },
  inventory: { label: 'Consumables inventory', kind: 'categorical' },
  hemoglobin: { label: 'Hemoglobin', kind: 'numeric' },
  hematocrit: { label: 'Hematocrit', kind: 'numeric' },
  mcv: { label: 'MCV (VCM)', kind: 'numeric' },
  bleeding: { label: 'Bleeding / cycle check-in', kind: 'categorical' },
  heartRate: { label: 'Heart rate trend', kind: 'numeric' },
  nutrition: { label: 'Estimated nutritional intake', kind: 'numeric' },
  method: { label: 'Recorded contraceptive method', kind: 'categorical' },
  packaging: { label: 'Packaging integrity check', kind: 'categorical' },
  doppler: { label: 'Calf Doppler observation', kind: 'numeric' },
  calfSymptoms: { label: 'Calf symptom check-in', kind: 'categorical' },
}

const conditions = [
  {
    id: 'endometriosis',
    label: 'Endometriosis',
    description: 'Organize symptom and medication check-ins.',
    signals: ['medicationAdherence', 'cyclePhase', 'pelvicPain', 'radiation'],
    action: 'Package the symptom, cycle, adherence, and packaging logs for asynchronous Flight Surgeon review.',
  },
  {
    id: 'autoimmune',
    label: 'Controlled autoimmune condition',
    description: 'Organize temperature, fatigue, skin, and sleep check-ins.',
    signals: ['basalTemp', 'hrv', 'cuticle', 'fatigue'],
    action: 'Record temperature, HRV, skin, and sleep observations; package the telemetry for asynchronous review.',
  },
  {
    id: 'migraine',
    label: 'Episodic migraine',
    description: 'Organize headache, sleep, and environment check-ins.',
    signals: ['cabinCo2', 'cabinPressure', 'sleep', 'headache', 'neuroOcular'],
    action: 'Record headache, sleep, and cabin context; package neuro-ocular observations for asynchronous review.',
  },
  {
    id: 'uti_recurrent',
    label: 'Recurrent urinary tract infections',
    description: 'Organize hydration and urinary symptom check-ins.',
    signals: ['hydration', 'urinaryFrequency', 'basalTemp', 'humidity'],
    action: 'Record hydration and urinary-frequency logs with habitat context for asynchronous review.',
  },
  {
    id: 'candidiasis_recurrent',
    label: 'Recurrent candidiasis',
    description: 'Organize hygiene, inventory, and symptom check-ins.',
    signals: ['humidity', 'hygiene', 'workout', 'inventory'],
    action: 'Record the dry-change and hygiene log, habitat humidity, and consumables inventory.',
  },
  {
    id: 'uterine_fibroids',
    label: 'Uterine fibroids',
    description: 'Organize bleeding, symptom, and laboratory check-ins.',
    signals: ['hemoglobin', 'hematocrit', 'mcv', 'bleeding', 'pelvicPain', 'heartRate'],
    action: 'Package bleeding and symptom logs with available hematology readings for asynchronous review.',
  },
  {
    id: 'pcos',
    label: 'Polycystic ovary syndrome (PCOS)',
    description: 'Organize cycle and metabolic check-ins.',
    signals: ['cyclePhase', 'nutrition', 'method', 'doppler', 'calfSymptoms'],
    action: 'Record cycle, nutritional, calf, and Doppler observations; package the telemetry for review.',
  },
]

const demoScenarios = [
  { id: 'hemoglobin-down', label: 'Hemoglobin signal: −10% from baseline', signal: 'hemoglobin', baseline: 100, current: 90 },
  { id: 'hematocrit-change', label: 'Hematocrit signal: +5% from baseline', signal: 'hematocrit', baseline: 100, current: 105 },
  { id: 'mcv-change', label: 'MCV signal: +5% from baseline', signal: 'mcv', baseline: 100, current: 105 },
  { id: 'cycle-change', label: 'Cycle phase changed (categorical)', signal: 'cyclePhase', baseline: 'suppressed', current: 'menstrual' },
  { id: 'nutrition-down', label: 'Nutritional intake index: −15% from baseline', signal: 'nutrition', baseline: 100, current: 85 },
  { id: 'radiation-change', label: 'Radiation feed: +25% from baseline', signal: 'radiation', baseline: 100, current: 125 },
  { id: 'co2-change', label: 'Cabin CO₂ signal: +15% from baseline', signal: 'cabinCo2', baseline: 100, current: 115 },
  { id: 'hydration-change', label: 'Hydration log index: −15% from baseline', signal: 'hydration', baseline: 100, current: 85 },
  { id: 'hrv-change', label: 'HRV signal: −10% from baseline', signal: 'hrv', baseline: 100, current: 90 },
  { id: 'doppler-change', label: 'Doppler observation: +10% from baseline', signal: 'doppler', baseline: 100, current: 110 },
  { id: 'packaging-change', label: 'Packaging integrity check changed', signal: 'packaging', baseline: 'recorded intact', current: 'recheck requested' },
]

const contraceptiveMethods = [
  { id: 'none', label: 'Not recorded' },
  { id: 'combined-pill', label: 'Combined pill' },
  { id: 'progestin-only', label: 'Progestin-only method' },
  { id: 'hormonal-iud', label: 'Hormonal IUD' },
]

const proxyCorrelates = ['hemoglobin', 'hematocrit', 'mcv', 'cyclePhase', 'nutrition']

export function ConditionMonitoring({ crew, activeConditions, onActiveConditionsChange, mission, missionType, labResults, onRecordLabResult }) {
  const [scenarioId, setScenarioId] = useState(demoScenarios[0].id)
  const [simulationActive, setSimulationActive] = useState(false)
  const [contraceptiveMethod, setContraceptiveMethod] = useState('none')
  const scenario = demoScenarios.find((item) => item.id === scenarioId) || demoScenarios[0]
  const activeConditionRecords = conditions.filter((condition) => activeConditions.includes(condition.id))
  const simulatedObservation = simulationActive
    ? { ...scenario, kind: signalDefinitions[scenario.signal].kind }
    : null

  const toggleCondition = (conditionId, enabled) => {
    const updated = enabled
      ? [...activeConditions, conditionId]
      : activeConditions.filter((id) => id !== conditionId)
    onActiveConditionsChange([...new Set(updated)])
  }

  const applyDemoPreset = () => {
    onActiveConditionsChange(['endometriosis', 'migraine'])
  }

  return <section className="dashboard-section condition-monitoring" aria-labelledby="condition-monitoring-title">
    <div className="section-heading">
      <div>
        <p className="eyebrow"><Activity size={18} /> PERSONALIZED CARE</p>
        <h3 id="condition-monitoring-title">Condition-aware observations</h3>
      </div>
      <span className="connected-label"><ShieldCheck size={17} /> Profile for {crew.name}</span>
    </div>
    <p className="condition-safety-note"><CircleHelp size={18} /> Profile flags organize observational check-ins for this session only. No diagnosis, clinical risk classification, or medication recommendation is generated.</p>

    <ConditionSelector
      activeConditions={activeConditions}
      onToggle={toggleCondition}
      onApplyDemoPreset={applyDemoPreset}
    />

    <SimulationControls
      scenarioId={scenarioId}
      onScenarioChange={(nextScenario) => {
        setScenarioId(nextScenario)
        setSimulationActive(false)
      }}
      simulationActive={simulationActive}
      onSimulationToggle={() => setSimulationActive((active) => !active)}
      contraceptiveMethod={contraceptiveMethod}
      onContraceptiveMethodChange={setContraceptiveMethod}
    />

    {activeConditionRecords.length > 0 || contraceptiveMethod !== 'none'
      ? <div className="condition-monitor-grid">
        {activeConditionRecords.map((condition) => (
          <ConditionMonitorCard
            key={condition.id}
            condition={condition}
            observation={condition.signals.includes(simulatedObservation?.signal) ? simulatedObservation : null}
          />
        ))}
        {contraceptiveMethod !== 'none' && <ConditionMonitorCard
          condition={{
            id: 'contraceptive-method',
            label: 'Contraceptive method',
            description: `Profile selection: ${contraceptiveMethods.find((item) => item.id === contraceptiveMethod)?.label}.`,
            signals: ['method', 'packaging', 'radiation'],
            action: 'Verify the recorded method and packaging observations; bundle the log for asynchronous Flight Surgeon review. No method change is recommended by this display.',
          }}
          observation={['method', 'packaging', 'radiation'].includes(simulatedObservation?.signal) ? simulatedObservation : null}
        />}
      </div>
      : <div className="condition-empty-state"><BookOpen size={20} /><p>No baseline conditions or contraceptive method selected. Choose profile entries to display their observation cards.</p></div>}

    <NutritionalBiomarkerPanel missionType={missionType} latestResults={labResults} onRecordLabResult={onRecordLabResult} />
    <CorrelatedSignalsPanel observation={simulatedObservation} />
    <p className="condition-environment-note">Mission context: {mission.context} · {mission.gravity}. Clinical and habitat sensor feeds shown here are not connected in this demo.</p>
  </section>
}

function ConditionSelector({ activeConditions, onToggle, onApplyDemoPreset }) {
  return <div className="condition-selector">
    <div className="condition-selector-heading">
      <div>
        <h4>Baseline profile flags</h4>
        <p>Select only conditions recorded for this demo profile.</p>
      </div>
      <button type="button" className="condition-preset-button" aria-label="Apply demo profile with endometriosis and episodic migraine" onClick={onApplyDemoPreset}><RotateCcw size={16} /> Endometriosis + migraine preset</button>
    </div>
    <div className="condition-flag-grid">
      {conditions.map((condition) => (
        <label className="condition-flag" key={condition.id}>
          <input
            type="checkbox"
            checked={activeConditions.includes(condition.id)}
            onChange={(event) => onToggle(condition.id, event.target.checked)}
          />
          <span className="condition-flag-copy">
            <strong>{condition.label}</strong>
            <small>{condition.description}</small>
          </span>
          {activeConditions.includes(condition.id) && <Check size={17} aria-hidden="true" />}
        </label>
      ))}
    </div>
  </div>
}

function SimulationControls({ scenarioId, onScenarioChange, simulationActive, onSimulationToggle, contraceptiveMethod, onContraceptiveMethodChange }) {
  return <section className="simulation-controls" aria-labelledby="simulation-controls-title">
    <div className="simulation-controls-heading">
      <div>
        <h4 id="simulation-controls-title">Telemetry simulation</h4>
        <p>Demo indices compare with a normalized preflight baseline of 100; these are not clinical thresholds or real sensor readings.</p>
      </div>
      <span className="simulation-mode-badge">Simulation only</span>
    </div>
    <div className="condition-simulation-controls">
      <label>
        <span>Deviation scenario</span>
        <select value={scenarioId} onChange={(event) => onScenarioChange(event.target.value)}>
          {demoScenarios.map((scenario) => <option value={scenario.id} key={scenario.id}>{scenario.label}</option>)}
        </select>
      </label>
      <label>
        <span>Contraceptive method in demo profile</span>
        <select value={contraceptiveMethod} onChange={(event) => onContraceptiveMethodChange(event.target.value)}>
          {contraceptiveMethods.map((method) => <option value={method.id} key={method.id}>{method.label}</option>)}
        </select>
      </label>
      <button type="button" className="condition-simulate-button" aria-pressed={simulationActive} onClick={onSimulationToggle}>
        <FlaskConical size={17} /> {simulationActive ? 'Clear simulated deviation' : 'Simulate deviation'}
      </button>
    </div>
    {simulationActive && <p className="condition-simulation-status" role="status">Simulated telemetry deviation active. It is an interface test, not a medical finding.</p>}
  </section>
}

function ConditionMonitorCard({ condition, observation }) {
  const observedSignals = condition.signals
    .map((signalId) => {
      const definition = signalDefinitions[signalId]
      if (!definition) return null
      const comparison = observation?.signal === signalId
        ? compareWithPreflightBaseline({
          baseline: observation.baseline,
          current: observation.current,
          kind: observation.kind,
        })
        : null
      return { signalId, definition, comparison }
    })
    .filter(Boolean)
  const hasDeviation = observedSignals.some((signal) => signal.comparison?.changed)

  return <article className="condition-monitor-card">
    <div className="condition-card-heading">
      <div>
        <p className="condition-card-kicker">Observational check-in</p>
        <h4>{condition.label}</h4>
        <p className="condition-card-description">{condition.description}</p>
      </div>
      <span className={`condition-status ${hasDeviation ? 'deviation' : ''}`}>{hasDeviation ? 'Deviation in simulation' : 'Feeds unavailable'}</span>
    </div>
    <div className="condition-signal-grid">
      {observedSignals.map(({ signalId, definition, comparison }) => (
        <div className={`condition-signal ${comparison?.changed ? 'has-deviation' : ''}`} key={signalId}>
          <span>{definition.label}</span>
          <strong>{comparison?.changed ? formatObservationDeviation(observation, comparison) : 'Not connected'}</strong>
        </div>
      ))}
    </div>
    {hasDeviation
      ? <div className="condition-operational-action"><strong>Operational data action</strong><p>{condition.action}</p></div>
      : <p className="condition-card-guidance">No live feed is connected and no matching demo deviation is active. No action is generated.</p>}
    <p className="condition-card-disclaimer">Observation only · no diagnosis or medication recommendation.</p>
  </article>
}

function CorrelatedSignalsPanel({ observation }) {
  return <article className="proxy-biomarkers-panel">
    <p className="condition-card-kicker">Observational telemetry</p>
    <h4>Monitored Correlated Indicators</h4>
    <p className="proxy-panel-note">Demo sensor indices can be compared with the normalized baseline. They do not estimate nutrient biomarkers or assign clinical meaning.</p>
    <div className="proxy-correlated-grid">
      {proxyCorrelates.map((signalId) => {
        const definition = signalDefinitions[signalId]
        const comparison = observation?.signal === signalId
          ? compareWithPreflightBaseline({
            baseline: observation.baseline,
            current: observation.current,
            kind: observation.kind,
          })
          : null
        return <div className={`proxy-correlate ${comparison?.changed ? 'has-deviation' : ''}`} key={signalId}>
          <span>{definition.label}</span>
          <strong>{comparison?.changed ? formatObservationDeviation(observation, comparison) : 'Not connected'}</strong>
        </div>
      })}
    </div>
    <p className="proxy-panel-note">Numeric percentages compare with a normalized demo baseline; categorical changes are shown without percentages.</p>
  </article>
}

function formatObservationDeviation(observation, comparison) {
  if (observation.kind === 'categorical') {
    return `Changed from baseline · ${observation.current} (simulation)`
  }
  const percent = comparison.deviationPercent
  const sign = percent > 0 ? '+' : ''
  return `${sign}${percent.toFixed(0)}% from baseline (simulation)`
}
