import { useMemo, useState } from 'react'
import { Activity, Radio, Shield, Telescope } from 'lucide-react'
import { AnatomyPanel } from './components/AnatomyPanel'
import { MissionHeader } from './components/MissionHeader'
import { VitalSignsGrid } from './components/VitalSignsGrid'
import './App.css'

const missions = [
  {
    id: 'orbit',
    name: 'Órbita Terrestre',
    context: 'ISS',
    gravity: '0g',
    latency: '<1s',
    radiation: 'Baixa',
    radiationLevel: 'low',
    accent: '#55d6a5',
    phase: 'FASE 01',
  },
  {
    id: 'transit',
    name: 'Trânsito Terra-Marte',
    context: 'Espaço Profundo',
    gravity: '0g',
    latency: '14 min',
    radiation: 'Crítica',
    radiationLevel: 'critical',
    accent: '#ff6b5f',
    phase: 'FASE 02',
  },
  {
    id: 'lunar',
    name: 'Superfície Lunar',
    context: 'Artemis',
    gravity: '0.16g',
    latency: '1.3s',
    radiation: 'Alta',
    radiationLevel: 'high',
    accent: '#f5bc63',
    phase: 'FASE 03',
  },
  {
    id: 'mars',
    name: 'Superfície de Marte',
    context: 'Base',
    gravity: '0.38g',
    latency: '18 min',
    radiation: 'Alta',
    radiationLevel: 'high',
    accent: '#f5bc63',
    phase: 'FASE 04',
  },
]

const crew = [
  { id: 'elena', name: 'Cmdr. Elena Vance', gender: 'Feminino', role: 'Comandante' },
  { id: 'lucas', name: 'Eng. Lucas Silva', gender: 'Masculino', role: 'Engenheiro de voo' },
]

function App() {
  const [missionId, setMissionId] = useState('orbit')
  const [crewId, setCrewId] = useState('elena')
  const [selectedZone, setSelectedZone] = useState('head')
  const mission = useMemo(() => missions.find((item) => item.id === missionId), [missionId])
  const selectedCrew = crew.find((item) => item.id === crewId)

  return (
    <main className="min-h-screen bg-[#070b12] text-slate-100">
      <MissionHeader
        missions={missions}
        missionId={missionId}
        setMissionId={setMissionId}
        crew={crew}
        crewId={crewId}
        setCrewId={setCrewId}
      />

      <div className="mx-auto max-w-[1500px] px-5 pb-10 pt-7 lg:px-10">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="eyebrow mb-2"><Radio size={13} /> TELEMETRIA BIOMÉDICA / ONLINE</p>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Centro de Saúde da Missão
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Monitoramento fisiológico em tempo real · {selectedCrew.name}
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-slate-800 bg-[#0b111c] px-4 py-3">
            <span className="status-dot" />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">Link de dados</p>
              <p className="font-mono text-xs text-emerald-300">ESTÁVEL · 98.7%</p>
            </div>
          </div>
        </div>

        <section className="grid gap-5 xl:grid-cols-[minmax(390px,0.82fr)_minmax(620px,1.55fr)]">
          <AnatomyPanel
            mission={mission}
            selectedZone={selectedZone}
            setSelectedZone={setSelectedZone}
            crew={selectedCrew}
          />
          <VitalSignsGrid mission={mission} crew={selectedCrew} />
        </section>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-slate-800/80 pt-5 text-[10px] uppercase tracking-[0.16em] text-slate-600">
          <span className="flex items-center gap-2"><Shield size={13} /> Protocolo de segurança médica · NASA-STD-3001</span>
          <span className="flex items-center gap-2"><Telescope size={13} /> Sistema Orion Health v1.0.0</span>
          <span className="flex items-center gap-2"><Activity size={13} /> Última sincronização: agora</span>
        </footer>
      </div>
    </main>
  )
}

export default App
