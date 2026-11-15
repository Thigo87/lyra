import { useEffect, useMemo, useState } from 'react'
import { SentinelHeader } from './components/SentinelHeader'
import { Sidebar } from './components/Sidebar'
import { MissionDashboard } from './components/MissionDashboard'
import { MissionModules } from './components/MissionModules'
import { LockScreen } from './components/LockScreen'
import { EmergencyAlertBanner, TelemetryQueue } from './components/EmergencyDispatch'
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
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('sentinela-notifications') || '[]') } catch { return [] }
  })
  const [activeAlert, setActiveAlert] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('sentinela-active-alert') || 'null') } catch { return null }
  })
  const [telemetryPacket, setTelemetryPacket] = useState(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
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

  useEffect(() => { window.localStorage.setItem('sentinela-notifications', JSON.stringify(notifications)) }, [notifications])
  useEffect(() => {
    if (activeAlert) window.localStorage.setItem('sentinela-active-alert', JSON.stringify(activeAlert))
    else window.localStorage.removeItem('sentinela-active-alert')
  }, [activeAlert])

  const playAlertTone = () => {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext
    if (!AudioContextClass) return
    const context = new AudioContextClass()
    const oscillator = context.createOscillator()
    const gain = context.createGain()
    oscillator.frequency.value = 880
    gain.gain.setValueAtTime(0.08, context.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35)
    oscillator.connect(gain)
    gain.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.35)
  }

  const notifyNative = (title, body) => {
    if (!('Notification' in window)) return
    const send = () => new Notification(title, { body, tag: 'sentinela-emergency' })
    if (Notification.permission === 'granted') send()
    else if (Notification.permission !== 'denied') Notification.requestPermission().then((permission) => { if (permission === 'granted') send() })
  }

  const dispatchAlert = (detail, source = 'Protocolo de emergência') => {
    const alert = {
      id: `${Date.now()}-${source}`,
      title: source,
      detail,
      crewName: selectedCrew?.name || 'Tripulação',
      met: formatMet(missionSeconds),
      status: 'Ativo',
    }
    setActiveAlert(alert)
    setNotifications((items) => [alert, ...items].slice(0, 20))
    setTelemetryPacket({ event: 'SENTINELA_EMERGENCY', alert, mission: mission.name, sentAt: new Date().toISOString() })
    playAlertTone()
    notifyNative(`SENTINELA · ${source}`, `${alert.crewName} | ${detail}`)
  }

  const acknowledgeAlert = (id) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, status: 'Reconhecido' } : item))
    setActiveAlert((alert) => alert?.id === id ? { ...alert, status: 'Reconhecido' } : alert)
  }

  const handleStorm = () => {
    setStormSimulated((value) => {
      if (!value) window.setTimeout(() => dispatchAlert('Tempestade solar SEP detectada · Abrigo preventivo recomendado', 'Alerta NASA DONKI / SEP'), 0)
      return !value
    })
  }

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

  if (emergencyAccess && !crewId) return <main className="emergency-standalone"><EmergencyAlertBanner alert={activeAlert} onAcknowledge={acknowledgeAlert} onOpenProtocol={() => setEmergencyAccess(false)} /><MissionModules module="emergency" mission={mission} onModule={() => setEmergencyAccess(false)} solarEvent={solarEvent} gamification={gamification} onAward={awardXp} onDispatch={dispatchAlert} /></main>

  return (
    <main className="sentinel-app">
      <SentinelHeader
        mission={mission}
        missions={missions}
        missionId={missionId}
        setMissionId={setMissionId}
        missionSeconds={missionSeconds}
        onEmergency={emergency}
        mobileMenuOpen={mobileMenuOpen}
        onMenuToggle={() => setMobileMenuOpen((value) => !value)}
        notifications={notifications}
        activeAlertCount={notifications.filter((item) => item.status === 'Ativo').length}
        onAcknowledge={acknowledgeAlert}
        onManualAlert={() => dispatchAlert('Alerta geral acionado manualmente pela tripulação', 'Alerta Geral')}
        donkiStatus={stormSimulated ? 'Alerta SEP simulado · protocolo ativo' : donkiStatus}
        onSimulateStorm={handleStorm}
        stormSimulated={stormSimulated}
        solarEvent={solarEvent}
        donkiPayload={donkiPayload}
        donkiPayloadOpen={donkiPayloadOpen}
        setDonkiPayloadOpen={setDonkiPayloadOpen}
      />
      <div className="sentinel-body">
        {mobileMenuOpen && <button type="button" className="mobile-drawer-backdrop" aria-label="Fechar menu" onClick={() => setMobileMenuOpen(false)} />}
        <Sidebar activeCrew={selectedCrew} module={module} setModule={(nextModule) => { setModule(nextModule); setMobileMenuOpen(false) }} mission={mission} onLock={lockTerminal} gamification={gamification} onAward={awardXp} mobileMenuOpen={mobileMenuOpen} />
        <section className="sentinel-content">
          {module === 'dashboard' ? (
            <MissionDashboard mission={mission} crew={selectedCrew} selectedZone={selectedZone} setSelectedZone={setSelectedZone} onModule={setModule} solarEvent={solarEvent} gamification={gamification} onAward={awardXp} />
          ) : (
            <MissionModules module={module} crew={selectedCrew} mission={mission} onModule={setModule} solarEvent={solarEvent} gamification={gamification} onAward={awardXp} onDispatch={dispatchAlert} />
          )}
        </section>
      </div>
      <EmergencyAlertBanner alert={activeAlert} onAcknowledge={acknowledgeAlert} onOpenProtocol={() => setModule('emergency')} />
      <TelemetryQueue key={telemetryPacket?.alert?.id || 'empty'} packet={telemetryPacket} mission={mission} onDismiss={() => setTelemetryPacket(null)} />
      {achievement && <div className="achievement-toast"><span className="achievement-medal">★</span><div><p>CONQUISTA DESBLOQUEADA</p><strong>{achievement.title}</strong><small>+{achievement.amount} XP de Prontidão Médica</small></div></div>}
    </main>
  )
}

function formatMet(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600) % 24
  const minutes = Math.floor(totalSeconds / 60) % 60
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export default App
