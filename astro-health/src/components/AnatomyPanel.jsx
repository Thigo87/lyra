import { useEffect, useRef, useState } from 'react'
import { BodyChart, FRONT_MUSCLES, ViewSide } from 'body-muscles'
import { Brain, HeartPulse, Ruler, ScanLine, Syringe } from 'lucide-react'

const zones = [
  { id: 'head', label: 'Cabeça / Neuro-ocular', short: '01', icon: Brain, status: 'MONITORANDO', risk: 'Alterações vestibulares e aumento da pressão intracraniana.', measure: 'Fixar Bio-Monitor na têmpora; executar teste de acuidade no Bio-Analyzer.' },
  { id: 'chest', label: 'Tórax / Sistema Cardiovascular', short: '02', icon: HeartPulse, status: 'ESTÁVEL', risk: 'Arritmia e remodelamento cardíaco por microgravidade.', measure: 'Aplicar eletrodos torácicos do Bio-Monitor e iniciar ECG de 60 segundos.' },
  { id: 'abdomen', label: 'Abdômen / Reprodutor e Metabólico', short: '03', icon: ScanLine, status: 'MONITORANDO', risk: 'Deslocamento de fluidos e desconforto gastrointestinal.', measure: 'Posicionar sensor abdominal; realizar leitura de composição no Bio-Analyzer.' },
  { id: 'legs', label: 'Membros Inferiores / Fluxo Venoso e Densidade Óssea', short: '04', icon: Ruler, status: 'ATENÇÃO', risk: 'Perda de massa muscular e densidade óssea.', measure: 'Usar Bio-Monitor nos quadríceps após exercício resistido; registrar força.' },
]

function getZoneForMuscle(muscleId) {
  if (muscleId === 'head' || muscleId.startsWith('neck-')) return 'head'
  if (muscleId.startsWith('chest-') || muscleId.startsWith('shoulder-')) return 'chest'
  if (muscleId.startsWith('abs-') || muscleId.startsWith('groin-')) return 'abdomen'
  if (muscleId.includes('quadriceps') || muscleId.includes('adductor') || muscleId.includes('knee') || muscleId.includes('foot') || muscleId.includes('tibialis')) return 'legs'
  return null
}

function getBodyState(selectedZone) {
  return FRONT_MUSCLES.reduce((state, muscle) => {
    const zone = getZoneForMuscle(muscle.id)
    if (zone) state[muscle.id] = { intensity: zone === selectedZone ? 6 : 2, selected: zone === selectedZone }
    return state
  }, {})
}

export function AnatomyPanel({ mission, selectedZone, setSelectedZone, crew }) {
  const avatarGender = crew.gender === 'Feminino' ? 'female' : 'male'
  const chartContainerRef = useRef(null)
  const chartRef = useRef(null)
  const selectedZoneRef = useRef(selectedZone)
  const [hoveredMuscle, setHoveredMuscle] = useState(null)
  const zone = zones.find((item) => item.id === selectedZone)

  useEffect(() => {
    selectedZoneRef.current = selectedZone
  }, [selectedZone])

  useEffect(() => {
    if (!chartContainerRef.current) return undefined

    chartRef.current = new BodyChart(chartContainerRef.current, {
      view: ViewSide.FRONT,
      bodyState: getBodyState(selectedZoneRef.current),
      // Kept in the options for body-muscles versions that support sex-specific assets.
      gender: avatarGender,
      sex: avatarGender,
      className: `orion-body-chart gender-${avatarGender}`,
      ariaLabel: 'Mapa anatômico anterior para monitoramento espacial',
      enableTransitions: true,
      onMuscleClick: (muscleId) => {
        const nextZone = getZoneForMuscle(muscleId)
        if (nextZone) setSelectedZone(nextZone)
      },
      onMuscleHover: (muscleId) => setHoveredMuscle(muscleId),
    })

    return () => {
      chartRef.current?.destroy()
      chartRef.current = null
    }
  }, [avatarGender, setSelectedZone])

  useEffect(() => {
    chartRef.current?.update({ bodyState: getBodyState(selectedZone) })
  }, [selectedZone])

  return (
    <article className="panel flex min-h-[650px] flex-col overflow-hidden">
      <div className="panel-heading">
        <div><p className="eyebrow"><ScanLine size={13} /> MAPA FISIOLÓGICO</p><h2 className="panel-title">Análise anatômica</h2></div>
        <span className="tag">{mission.phase}</span>
      </div>
      <div className="anatomy-content flex-1">
        <div className="anatomy-visual">
          <div className="telemetry-grid" /><div className="scan-line" />
          <div className="scan-ring ring-one" /><div className="scan-ring ring-two" />
          <div ref={chartContainerRef} className="body-chart-host" />
          <span className="anatomy-caption">BIO-SCAN / {crew.name.replace(/^(Cmdr\.|Eng\.)\s/, '').toUpperCase()} ({avatarGender === 'female' ? 'F' : 'M'}) {hoveredMuscle ? `· ${hoveredMuscle}` : ''}</span>
        </div>
        <div className="zone-list">
          {zones.map((item) => {
            const Icon = item.icon
            return (
              <button type="button" className={`zone-button ${selectedZone === item.id ? 'active' : ''}`} key={item.id} onClick={() => setSelectedZone(item.id)}>
                <span className="zone-number">{item.short}</span><Icon size={16} /><span className="zone-label">{item.label}</span><span className={`zone-status ${item.status === 'ATENÇÃO' ? 'warning' : ''}`}>{item.status}</span>
              </button>
            )
          })}
        </div>
      </div>
      <div className="risk-box">
        <div className="mb-3 flex items-center justify-between"><p className="eyebrow text-amber-300"><Syringe size={13} /> PROTOCOLO DE MEDIÇÃO</p><span className="text-[10px] font-mono text-slate-500">ZONA {zone.short}</span></div>
        <h3 className="mb-1 text-sm font-semibold text-slate-100">{zone.label}</h3>
        <p className="mb-3 text-xs leading-relaxed text-amber-100/70"><strong className="text-amber-200">Risco:</strong> {zone.risk}</p>
        <p className="flex gap-2 text-xs leading-relaxed text-slate-400"><span className="mt-0.5 text-cyan-300">→</span>{zone.measure}</p>
      </div>
    </article>
  )
}
