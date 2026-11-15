import { useEffect, useMemo, useState } from 'react'
import { SentinelHeader } from './components/SentinelHeader'
import { Sidebar } from './components/Sidebar'
import { MissionDashboard } from './components/MissionDashboard'
import { MissionModules } from './components/MissionModules'
import { LockScreen } from './components/LockScreen'
import { crew, fallbackDonkiPayload, missions } from './data/missionData'
import './App.css'

function App() {
  const [missionId, setMissionId] = useState('transit')
  const [crewId, setCrewId] = useState(null)
  const [emergencyAccess, setEmergencyAccess] = useState(false)
  const [module, setModule] = useState('dashboard')
  const [selectedZone, setSelectedZone] = useState('chest')
  const [missionSeconds, setMissionSeconds] = useState(96 * 86400 + 12 * 3600 + 34 * 60 + 18)
  const [donkiStatus, setDonkiStatus] = useState('Consultando feed NASA DONKI…')
  const [donkiPayload, setDonkiPayload] = useState(fallbackDonkiPayload)
  const [donkiPayloadOpen, setDonkiPayloadOpen] = useState(false)
  const [stormSimulated, setStormSimulated] = useState(false)
  const [readinessXp, setReadinessXp] = useState(1250)
  const [completedQuests, setCompletedQuests] = useState([])
  const [achievement, setAchievement] = useState(null)
  const mission = useMemo(() => missions.find((item) => item.id === missionId), [missionId])
  const selectedCrew = crew.find((item) => item.id === crewId)
  const solarEvent = { active: stormSimulated, radiationRate: stormSimulated ? 420 : 80, addedDose: stormSimulated ? 8.4 : 0 }
  const gamification = {
    xp: readinessXp,
    level: Math.floor(readinessXp / 300),
    progress: ((readinessXp % 300) / 300) * 100,
    streak: 12,
    completedQuests,
  }

  useEffect(() => {
    const timer = window.setInterval(() => setMissionSeconds((seconds) => seconds + 1), 1000)
    return () => window.clearInterval(timer)
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(() => controller.abort(), 3000)
    fetch('https://api.nasa.gov/DONKI/SEP?api_key=DEMO_KEY', { signal: controller.signal })
      .then((response) => { if (!response.ok) throw new Error('DONKI indisponível'); return response.json() })
      .then((payload) => { setDonkiPayload(payload); setDonkiStatus('Feed NASA DONKI ativo') })
      .catch(() => setDonkiStatus('Feed NASA DONKI ativo · payload histórico offline'))
      .finally(() => window.clearTimeout(timeout))
    return () => { window.clearTimeout(timeout); controller.abort() }
  }, [])

  const emergency = () => setModule('emergency')
  const lockTerminal = () => { setCrewId(null); setEmergencyAccess(false); setModule('dashboard') }
  const awardXp = (questId, amount, title) => {
    if (completedQuests.includes(questId)) return
    setCompletedQuests((quests) => [...quests, questId])
    setReadinessXp((xp) => xp + amount)
    setAchievement({ title, amount })
    window.setTimeout(() => setAchievement(null), 4200)
  }

  if (!crewId && !emergencyAccess) return <LockScreen crew={crew} onLogin={(id) => setCrewId(id)} onEmergency={() => setEmergencyAccess(true)} />

  if (emergencyAccess && !crewId) return <main className="emergency-standalone"><MissionModules module="emergency" mission={mission} onModule={() => setEmergencyAccess(false)} solarEvent={solarEvent} gamification={gamification} onAward={awardXp} /></main>

  return (
    <main className="sentinel-app">
      <SentinelHeader
        mission={mission}
        missions={missions}
        missionId={missionId}
        setMissionId={setMissionId}
        missionSeconds={missionSeconds}
        onEmergency={emergency}
        donkiStatus={stormSimulated ? 'Alerta SEP simulado · protocolo ativo' : donkiStatus}
        onSimulateStorm={() => setStormSimulated((value) => !value)}
        stormSimulated={stormSimulated}
        solarEvent={solarEvent}
        donkiPayload={donkiPayload}
        donkiPayloadOpen={donkiPayloadOpen}
        setDonkiPayloadOpen={setDonkiPayloadOpen}
      />
      <div className="sentinel-body">
        <Sidebar activeCrew={selectedCrew} module={module} setModule={setModule} mission={mission} onLock={lockTerminal} gamification={gamification} onAward={awardXp} />
        <section className="sentinel-content">
          {module === 'dashboard' ? (
            <MissionDashboard mission={mission} crew={selectedCrew} selectedZone={selectedZone} setSelectedZone={setSelectedZone} onModule={setModule} solarEvent={solarEvent} gamification={gamification} onAward={awardXp} />
          ) : (
            <MissionModules module={module} crew={selectedCrew} mission={mission} onModule={setModule} solarEvent={solarEvent} gamification={gamification} onAward={awardXp} />
          )}
        </section>
      </div>
      {achievement && <div className="achievement-toast"><span className="achievement-medal">★</span><div><p>CONQUISTA DESBLOQUEADA</p><strong>{achievement.title}</strong><small>+{achievement.amount} XP de Prontidão Médica</small></div></div>}
    </main>
  )
}

export default App
