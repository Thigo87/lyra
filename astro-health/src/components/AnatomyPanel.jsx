import { useMemo, useState } from 'react'
import Model from 'react-body-highlighter'
import { Brain, HeartPulse, Ruler, ScanLine, Syringe } from 'lucide-react'

const zones = [
  { id: 'head', label: 'Head & Neuro-ocular', short: '01', icon: Brain, status: 'MONITORING', risk: 'Vestibular changes and increased intracranial pressure.', measure: 'Secure the Bio-Monitor at the temple; run the visual acuity test in the Bio-Analyzer.' },
  { id: 'chest', label: 'Thorax & Heart', short: '02', icon: HeartPulse, status: 'STABLE', risk: 'Arrhythmia and cardiac remodeling under microgravity.', measure: 'Apply Bio-Monitor thoracic electrodes and start a 60-second ECG.' },
  { id: 'abdomen', label: 'Abdomen & Metabolic', short: '03', icon: ScanLine, status: 'MONITORING', risk: 'Fluid shifts and gastrointestinal discomfort.', measure: 'Position the abdominal sensor; run a body-composition reading in the Bio-Analyzer.' },
  { id: 'legs', label: 'Lower Limbs & Venous Flow', short: '04', icon: Ruler, status: 'CAUTION', risk: 'Muscle loss and reduced bone mineral density.', measure: 'Use the Bio-Monitor on the quadriceps after resistive exercise; record strength.' },
]

const musclesByZone = {
  head: ['head', 'neck'],
  chest: ['chest', 'front-deltoids', 'biceps', 'triceps', 'forearm'],
  abdomen: ['abs', 'obliques'],
  legs: ['quadriceps', 'adductor', 'abductors', 'calves', 'knees'],
}

function getZoneForMuscle(muscleId) {
  return Object.entries(musclesByZone).find(([, muscles]) => muscles.includes(muscleId))?.[0] || null
}

function FemaleBodyModel({ selectedZone, onMuscleClick }) {
  const fillFor = (muscleId) => getZoneForMuscle(muscleId) === selectedZone ? '#ef4444' : '#10b981'
  const muscle = (muscleId, points) => (
    <polygon
      className="female-body-muscle"
      points={points}
      fill={fillFor(muscleId)}
      aria-label={muscleId}
      onClick={() => onMuscleClick(muscleId)}
    />
  )

  return (
    <svg className="female-body-model" viewBox="0 0 220 425" role="img" aria-label="Female anterior anatomical model">
      {muscle('head', '91,27 99,20 110,18 121,20 129,27 126,48 116,61 104,61 94,48')}
      {muscle('neck', '103,58 117,58 121,82 110,91 99,82')}
      {muscle('front-deltoids', '99,80 87,80 75,88 66,104 82,113 98,101')}
      {muscle('front-deltoids', '121,80 133,80 145,88 154,104 138,113 122,101')}
      {muscle('chest', '99,88 110,94 121,88 132,103 123,125 110,130 97,125 88,103')}
      {muscle('biceps', '75,106 65,104 57,123 54,148 68,151 78,131')}
      {muscle('biceps', '145,106 155,104 163,123 166,148 152,151 142,131')}
      {muscle('triceps', '65,104 57,123 54,148 61,158 70,151 68,125')}
      {muscle('triceps', '155,104 163,123 166,148 159,158 150,151 152,125')}
      {muscle('forearm', '54,148 61,158 53,191 43,187 45,163')}
      {muscle('forearm', '166,148 159,158 167,191 177,187 175,163')}
      {muscle('abs', '98,124 110,130 110,177 96,174 91,145')}
      {muscle('abs', '122,124 110,130 110,177 124,174 129,145')}
      {muscle('obliques', '91,126 98,124 96,174 86,183 80,159')}
      {muscle('obliques', '129,126 122,124 124,174 134,183 140,159')}
      {muscle('abductors', '86,183 98,174 108,181 101,211 86,217 78,204')}
      {muscle('abductors', '134,183 122,174 112,181 119,211 134,217 142,204')}
      {muscle('adductor', '108,181 112,181 119,211 110,230 101,211')}
      {muscle('adductor', '110,181 108,181 101,211 110,230 119,211')}
      {muscle('quadriceps', '86,217 101,211 108,230 104,282 88,282 82,247')}
      {muscle('quadriceps', '134,217 119,211 112,230 116,282 132,282 138,247')}
      {muscle('knees', '88,282 104,282 105,297 89,299')}
      {muscle('knees', '132,282 116,282 115,297 131,299')}
      {muscle('calves', '89,299 105,297 101,349 91,383 79,380 86,344')}
      {muscle('calves', '131,299 115,297 119,349 129,383 141,380 134,344')}
    </svg>
  )
}

export function AnatomyPanel({ mission, selectedZone, setSelectedZone, crew }) {
  const currentUser = crew
  const [hoveredMuscle, setHoveredMuscle] = useState(null)
  const zone = zones.find((item) => item.id === selectedZone)
  const bodyData = useMemo(() => Object.entries(musclesByZone).map(([zoneId, muscles]) => ({
    name: zones.find((item) => item.id === zoneId).label,
    muscles,
    frequency: zoneId === selectedZone ? 3 : 1,
  })), [selectedZone])
  const handleMuscleClick = (muscle) => {
    setHoveredMuscle(muscle)
    const nextZone = getZoneForMuscle(muscle)
    if (nextZone) setSelectedZone(nextZone)
  }

  return (
    <article className="panel flex min-h-[650px] flex-col overflow-hidden">
      <div className="panel-heading">
        <div><p className="eyebrow"><ScanLine size={13} /> PHYSIOLOGICAL MAP</p><h2 className="panel-title">Anatomical analysis</h2></div>
        <span className="tag">{mission.phase}</span>
      </div>
      <div className="anatomy-content flex-1">
        <div className="anatomy-visual">
          <div className="telemetry-grid" /><div className="scan-line" />
          <div className="scan-ring ring-one" /><div className="scan-ring ring-two" />
          <div className="body-chart-host">
            {currentUser.gender === 'female' ? (
              <FemaleBodyModel key={currentUser.id} selectedZone={selectedZone} onMuscleClick={handleMuscleClick} />
            ) : (
              <Model
                key={currentUser.id}
                type="anterior"
                gender={currentUser.gender}
                data={bodyData}
                bodyColor="#1e293b"
                highlightedColors={['#10b981', '#f59e0b', '#ef4444']}
                onClick={({ muscle }) => handleMuscleClick(muscle)}
                style={{ width: '100%', height: '100%' }}
                svgStyle={{ width: '100%', height: '100%' }}
              />
            )}
          </div>
          <span className="anatomy-caption">BIO-SCAN / {currentUser.name.replace(/^(Cmdr\.|Eng\.)\s/, '').toUpperCase()} ({currentUser.gender === 'female' ? 'F' : 'M'}) {hoveredMuscle ? `· ${hoveredMuscle}` : ''}</span>
        </div>
        <div className="zone-list">
          {zones.map((item) => {
            const Icon = item.icon
            return (
              <button type="button" className={`zone-button ${selectedZone === item.id ? 'active' : ''}`} key={item.id} onClick={() => setSelectedZone(item.id)}>
                <span className="zone-number">{item.short}</span><Icon size={16} /><span className="zone-label">{item.label}</span><span className={`zone-status ${item.status === 'CAUTION' ? 'warning' : ''}`}>{item.status}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="risk-box">
        <div className="mb-3 flex items-center justify-between"><p className="eyebrow text-amber-300"><Syringe size={13} /> MEASUREMENT PROTOCOL</p><span className="text-[10px] font-mono text-slate-500">ZONE {zone.short}</span></div>
        <h3 className="mb-1 text-sm font-semibold text-slate-100">{zone.label}</h3>
        <p className="mb-3 text-xs leading-relaxed text-amber-100/70"><strong className="text-amber-200">Risk:</strong> {zone.risk}</p>
        <p className="flex gap-2 text-xs leading-relaxed text-slate-400"><span className="mt-0.5 text-cyan-300">→</span>{zone.measure}</p>
      </div>
    </article>
  )
}
