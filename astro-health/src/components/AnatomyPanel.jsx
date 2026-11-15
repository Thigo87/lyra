import { useState } from 'react'
import { Brain, HeartPulse, Ruler, ScanLine, Syringe } from 'lucide-react'

const zones = [
  { id: 'head', label: 'Head & Neuro-ocular', short: '01', icon: Brain, status: 'MONITORING', risk: 'Vestibular changes and increased intracranial pressure.', measure: 'Secure the Bio-Monitor at the temple; run the visual acuity test in the Bio-Analyzer.' },
  { id: 'chest', label: 'Thorax & Heart', short: '02', icon: HeartPulse, status: 'STABLE', risk: 'Arrhythmia and cardiac remodeling under microgravity.', measure: 'Apply Bio-Monitor thoracic electrodes and start a 60-second ECG.' },
  { id: 'abdomen', label: 'Abdomen & Metabolic', short: '03', icon: ScanLine, status: 'MONITORING', risk: 'Fluid shifts and gastrointestinal discomfort.', measure: 'Position the abdominal sensor; run a body-composition reading in the Bio-Analyzer.' },
  { id: 'legs', label: 'Lower Limbs & Venous Flow', short: '04', icon: Ruler, status: 'CAUTION', risk: 'Muscle loss and reduced bone mineral density.', measure: 'Use the Bio-Monitor on the quadriceps after resistive exercise; record strength.' },
]

function HolographicBodyModel({ gender, selectedZone, handleSelectRegion }) {
  const isActive = (zone) => selectedZone === zone
  const torsoFill = isActive('chest') ? 'url(#holo-highlight)' : 'url(#holo-body)'
  const legFill = isActive('legs') ? 'url(#holo-highlight)' : 'url(#holo-body)'
  const hotspots = [['head', 'NEURO / 01', 130, 48], ['chest', 'CARDIAC / 02', 136, 142], ['abdomen', 'METABOLIC / 03', 130, 215], ['legs', 'VENOUS / 04', 148, 365]]
  const maleMesh = [
    ['head', '114,24 130,18 146,24 151,43 145,67 130,74 115,67 109,43'],
    ['neck', '116,70 130,77 144,70 149,98 130,108 111,98'],
    ['chest', '111,101 130,108 149,101 174,111 164,151 130,160 96,151 86,111'],
    ['deltoids', '86,106 72,116 79,143 98,151 105,122'],
    ['deltoids', '174,106 188,116 181,143 162,151 155,122'],
    ['abs', '101,157 130,160 130,181 101,177'], ['abs', '130,160 159,157 159,177 130,181'],
    ['abs', '101,181 130,181 130,203 101,199'], ['abs', '130,181 159,181 159,199 130,203'],
    ['abs', '103,203 130,203 130,225 106,222'], ['abs', '130,203 157,203 154,222 130,225'],
    ['biceps', '72,143 88,148 83,205 65,211 61,177'], ['biceps', '188,143 172,148 177,205 195,211 199,177'],
    ['forearm', '65,211 83,205 78,257 63,270 54,260'], ['forearm', '195,211 177,205 182,257 197,270 206,260'],
    ['hands', '54,260 63,270 57,281 45,275'], ['hands', '206,260 197,270 203,281 215,275'],
    ['pelvis', '106,225 130,228 154,225 169,249 154,269 130,276 106,269 91,249'],
    ['quadriceps', '91,269 113,274 126,278 119,345 96,345 87,305'], ['quadriceps', '169,269 147,274 134,278 141,345 164,345 173,305'],
    ['knees', '96,345 119,345 120,363 97,365'], ['knees', '164,345 141,345 140,363 163,365'],
    ['calves', '97,365 120,363 115,432 105,467 87,463 94,417'], ['calves', '163,365 140,363 145,432 155,467 173,463 166,417'],
    ['feet', '87,463 105,467 101,484 76,484'], ['feet', '173,463 155,467 159,484 184,484'],
  ]
  const femaleMesh = [
    ['head', '116,25 130,20 144,25 149,44 144,67 130,73 116,67 111,44'],
    ['neck', '119,70 130,77 141,70 144,99 130,106 116,99'],
    ['chest', '115,101 130,107 145,101 164,113 156,148 130,155 104,148 96,113'],
    ['deltoids', '96,106 86,115 91,139 105,147 110,121'],
    ['deltoids', '164,106 174,115 169,139 155,147 150,121'],
    ['abs', '106,152 130,155 130,174 106,171'], ['abs', '130,155 154,152 154,171 130,174'],
    ['abs', '107,175 130,175 130,195 107,192'], ['abs', '130,175 153,175 153,192 130,195'],
    ['abs', '108,196 130,196 130,216 110,213'], ['abs', '130,196 152,196 150,213 130,216'],
    ['biceps', '86,139 99,145 94,203 80,211 76,174'], ['biceps', '174,139 161,145 166,203 180,211 184,174'],
    ['forearm', '80,211 94,203 90,254 77,266 68,257'], ['forearm', '180,211 166,203 170,254 183,266 192,257'],
    ['hands', '68,257 77,266 72,276 60,271'], ['hands', '192,257 183,266 188,276 200,271'],
    ['pelvis', '110,216 130,219 150,216 176,245 161,267 130,276 99,267 84,245'],
    ['quadriceps', '99,267 119,273 127,278 119,345 98,345 90,304'], ['quadriceps', '161,267 141,273 133,278 141,345 162,345 170,304'],
    ['knees', '98,345 119,345 120,362 99,364'], ['knees', '162,345 141,345 140,362 161,364'],
    ['calves', '99,364 120,362 115,431 106,467 91,463 96,417'], ['calves', '161,364 140,362 145,431 154,467 169,463 164,417'],
    ['feet', '91,463 106,467 102,484 81,484'], ['feet', '169,463 154,467 158,484 179,484'],
  ]
  const mesh = gender === 'female' ? femaleMesh : maleMesh

  return <svg className="holographic-body-model" viewBox="0 0 260 520" role="img" aria-label={`${gender === 'female' ? 'Female' : 'Male'} anterior anatomical model`}>
    <defs>
      <linearGradient id="holo-body" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#083344" stopOpacity=".4" /><stop offset="1" stopColor="#22d3ee" stopOpacity=".35" /></linearGradient>
      <linearGradient id="holo-highlight" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#10b981" stopOpacity=".45" /><stop offset="1" stopColor="#fbbf24" stopOpacity=".5" /></linearGradient>
      <filter id="holo-glow"><feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#06b6d4" floodOpacity=".65" /></filter>
    </defs>
    {mesh.map(([, points], index) => {
      return <polygon key={`gap-${index}`} className="holographic-body-gap" points={points} />
    })}
    {mesh.map(([id, points], index) => {
      const region = id === 'head' ? 'head' : id === 'abs' || id === 'pelvis' ? 'abdomen' : id === 'quadriceps' || id === 'knees' || id === 'calves' || id === 'feet' ? 'legs' : 'chest'
      const fill = region === 'legs' ? legFill : region === 'chest' ? torsoFill : isActive(region) ? 'url(#holo-highlight)' : 'url(#holo-body)'
      return <polygon key={`${id}-${index}`} className="holographic-body-segment cursor-pointer" points={points} fill={fill} onClick={() => handleSelectRegion(region)} />
    })}
    {hotspots.map(([zone, label, cx, cy]) => <g key={zone} className={`svg-hotspot cursor-pointer ${isActive(zone) ? 'active' : ''}`} role="button" tabIndex="0" pointerEvents="all" onClick={() => handleSelectRegion(zone)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') handleSelectRegion(zone) }}>
      <circle className="svg-hotspot-target" cx={cx} cy={cy} r="8" /><circle className="svg-hotspot-core" cx={cx} cy={cy} r="2.5" /><line className="svg-hotspot-line" x1={cx + 9} y1={cy} x2="175" y2={cy} /><text className="svg-hotspot-label" x="179" y={cy + 3}>{label}</text>
    </g>)}
  </svg>
}

export function AnatomyPanel({ mission, selectedZone, setSelectedZone, crew }) {
  const currentUser = crew
  const [scanPaused, setScanPaused] = useState(false)
  const zone = zones.find((item) => item.id === selectedZone) || zones[0]
  const handleSelectRegion = (regionId) => setSelectedZone(regionId)

  return <article className="panel flex min-h-[650px] flex-col overflow-hidden">
    <div className="panel-heading"><div><p className="eyebrow"><ScanLine size={13} /> PHYSIOLOGICAL MAP</p><h2 className="panel-title">Anatomical analysis</h2></div><span className="tag">{mission.phase}</span></div>
    <div className="anatomy-content flex-1">
      <div className="anatomy-visual holographic-scanner">
        <div className="telemetry-grid" /><div className={`scan-line ${scanPaused ? 'paused' : ''}`}><span>SCANNING</span></div><div className="scan-ring ring-one" /><div className="scan-ring ring-two" />
        <div className="scanner-bracket bracket-tl" /><div className="scanner-bracket bracket-tr" /><div className="scanner-bracket bracket-bl" /><div className="scanner-bracket bracket-br" />
        <div className="scanner-topbar"><span>● BIO-SCAN / {currentUser.gender === 'female' ? 'AS' : 'AC'}</span><span>ANTERIOR VIEW</span></div><div className="scanner-scale" aria-hidden="true">{[0, 20, 40, 60, 80, 100].map((tick) => <i key={tick} style={{ top: `${tick}%` }}><b>{tick}</b></i>)}</div>
        <div className="body-chart-host"><HolographicBodyModel key={currentUser.id} gender={currentUser.gender} selectedZone={selectedZone} handleSelectRegion={handleSelectRegion} /></div>
        <div className="scanner-bottombar"><span>ANATOMICAL MODEL</span><span>SVG / LIVE TELEMETRY</span></div>
      </div>
      <div className="zone-list">{zones.map((item) => { const Icon = item.icon; return <button type="button" className={`zone-button ${selectedZone === item.id ? 'active' : ''}`} key={item.id} onClick={() => setSelectedZone(item.id)}><span className="zone-number">{item.short}</span><Icon size={16} /><span className="zone-label">{item.label}</span><span className={`zone-status ${item.status === 'CAUTION' ? 'warning' : ''}`}>{item.status}</span></button> })}</div>
    </div>
    <div className="scanner-controlbar"><span><ScanLine size={14} /> Continuous visual scan</span><button type="button" onClick={() => setScanPaused((paused) => !paused)}>{scanPaused ? 'Resume' : 'Pause'}</button></div>
    <div className="risk-box"><div className="mb-3 flex items-center justify-between"><p className="eyebrow text-amber-300"><Syringe size={13} /> MEASUREMENT PROTOCOL</p><span className="text-[10px] font-mono text-slate-500">ZONE {zone.short}</span></div><h3 className="mb-1 text-sm font-semibold text-slate-100">{zone.label}</h3><p className="mb-3 text-xs leading-relaxed text-amber-100/70"><strong className="text-amber-200">Risk:</strong> {zone.risk}</p><p className="flex gap-2 text-xs leading-relaxed text-slate-400"><span className="mt-0.5 text-cyan-300">→</span>{zone.measure}</p></div>
  </article>
}
