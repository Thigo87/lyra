import { useEffect, useMemo, useState } from 'react'
import { SentinelHeader } from './components/SentinelHeader'
import { Sidebar } from './components/Sidebar'
import { MissionDashboard } from './components/MissionDashboard'
import { MissionModules } from './components/MissionModules'
import { LockScreen } from './components/LockScreen'
import { MissionOverview } from './components/MissionOverview'
import { CrewVitalsHistory } from './components/CrewVitalsHistory'
import { EmergencyAlertBanner, TelemetryQueue } from './components/EmergencyDispatch'
import { ErrorBoundary } from './components/ErrorBoundary'
import { crew, fallbackDonkiPayload, missions } from './data/missionData'
import './App.css'
import './VisualRedesign.css'

function AppContent() {
  const [missionId, setMissionId] = useState('transit')
  const [crewId, setCrewId] = useState(null)
  const [activeView, setActiveView] = useState('overview')
  const [emergencyAccess, setEmergencyAccess] = useState(false)
  const [module, setModule] = useState('dashboard')
  const [selectedZone, setSelectedZone] = useState(null)
  const [missionSeconds, setMissionSeconds] = useState(96 * 86400 + 12 * 3600 + 34 * 60 + 18)
  const [donkiStatus, setDonkiStatus] = useState('Querying NASA DONKI feed…')
  const [donkiPayload, setDonkiPayload] = useState(fallbackDonkiPayload)
  const [donkiPayloadOpen, setDonkiPayloadOpen] = useState(false)
  const [stormSimulated, setStormSimulated] = useState(false)
  const [readinessXp, setReadinessXp] = useState(1250)
  const [completedQuests, setCompletedQuests] = useState([])
  const [achievement, setAchievement] = useState(null)
  const [notifications, setNotifications] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('lyra-notifications') || '[]') } catch { return [] }
  })
  const [activeAlert, setActiveAlert] = useState(() => {
    try { return JSON.parse(window.localStorage.getItem('lyra-active-alert') || 'null') } catch { return null }
  })
  const [telemetryPacket, setTelemetryPacket] = useState(null)
  const [opticalHeartRate, setOpticalHeartRate] = useState(null)
  const [opticalSnapshot, setOpticalSnapshot] = useState(null)
  const [radiationDoseOffset, setRadiationDoseOffset] = useState(0)
  const [wristbandZone, setWristbandZone] = useState('shelter')
  const [wristbandDose, setWristbandDose] = useState(0)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [themePreference, setThemePreference] = useState('circadian')
  const [waiverFlagsByCrew, setWaiverFlagsByCrew] = useState({})
  const [labResultsByCrew, setLabResultsByCrew] = useState({})
  const mission = useMemo(() => missions.find((item) => item.id === missionId), [missionId])
  const missionType = mission?.missionType || 'DEEP_SPACE'
  const selectedCrew = crew.find((item) => item.id === crewId)
  const selectedLabResults = crewId ? labResultsByCrew[crewId] || {} : {}
  const missionHour = Math.floor(missionSeconds / 3600) % 24
  const isLightMode = themePreference === 'light' || (themePreference === 'circadian' && missionHour >= 7 && missionHour < 19)
  const circadianMode = isLightMode ? 'theme-operational' : 'theme-decompression'
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
      .then((response) => { if (!response.ok) throw new Error('DONKI unavailable'); return response.json() })
      .then((payload) => { setDonkiPayload(payload); setDonkiStatus('NASA DONKI Feed Active') })
      .catch(() => setDonkiStatus('NASA DONKI Feed Active · historical payload offline'))
      .finally(() => window.clearTimeout(timeout))
    return () => { window.clearTimeout(timeout); controller.abort() }
  }, [])

  useEffect(() => { window.localStorage.setItem('lyra-notifications', JSON.stringify(notifications)) }, [notifications])
  useEffect(() => {
    if (activeAlert) window.localStorage.setItem('lyra-active-alert', JSON.stringify(activeAlert))
    else window.localStorage.removeItem('lyra-active-alert')
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
    const send = () => new Notification(title, { body, tag: 'lyra-emergency' })
    if (Notification.permission === 'granted') send()
    else if (Notification.permission !== 'denied') Notification.requestPermission().then((permission) => { if (permission === 'granted') send() })
  }

  const dispatchAlert = (detail, source = 'Emergency protocol') => {
    const alert = {
      id: `${Date.now()}-${source}`,
      title: source,
      detail,
      crewName: selectedCrew?.name || 'Crew',
      met: formatMet(missionSeconds),
      status: 'Active',
      opticalSnapshot,
    }
    setActiveAlert(alert)
    setNotifications((items) => [alert, ...items].slice(0, 20))
    setTelemetryPacket({ event: 'LYRA_EMERGENCY', alert, mission: mission.name, sentAt: new Date().toISOString() })
    playAlertTone()
    notifyNative(`LYRA · ${source}`, `${alert.crewName} | ${detail}`)
  }

  const acknowledgeAlert = (id) => {
    setNotifications((items) => items.map((item) => item.id === id ? { ...item, status: 'Acknowledged' } : item))
    setActiveAlert((alert) => alert?.id === id ? { ...alert, status: 'Acknowledged' } : alert)
  }

  const handleStorm = () => {
    setStormSimulated((value) => {
      if (!value) window.setTimeout(() => dispatchAlert('SEP solar event detected · Preventive shelter recommended', 'NASA DONKI / SEP Alert'), 0)
      return !value
    })
  }

  const emergency = () => setModule('emergency')
  const lockTerminal = () => { setCrewId(null); setEmergencyAccess(false); setModule('dashboard'); setActiveView('overview') }
  const awardXp = (questId, amount, title) => {
    if (completedQuests.includes(questId)) return
    setCompletedQuests((quests) => [...quests, questId])
    setReadinessXp((xp) => xp + amount)
    setAchievement({ title, amount })
    window.setTimeout(() => setAchievement(null), 4200)
  }
  const handleOpticalHeartRate = (value) => {
    setOpticalHeartRate(value)
    awardXp('optical-heart-rate', 60, 'Optical Heart Rate Telemetry Updated')
  }
  const handleRadiationSync = ({ doseRate }) => {
    setRadiationDoseOffset((dose) => dose + Math.max(0.1, doseRate / 60))
    awardXp('cmos-radiation-dosimeter', 70, 'CMOS Radiation Dosimeter Sync')
  }
  const handleRadiationBurst = (active) => {
    if (active) dispatchAlert('CMOS sensor detected a simulated cosmic-ray / SEP burst · move to radiation shelter', 'Radiation Shelter Alert')
  }
  const handleWristbandSync = () => {
    const incrementalDose = wristbandZone === 'airlock' ? 0.38 : 0.08
    setWristbandDose((dose) => dose + incrementalDose)
    awardXp(`bioband-sync-${Date.now()}`, 40, 'Bio-Band NFC Dose Sync')
  }
  const updateCrewWaiverFlags = (conditions) => {
    if (!selectedCrew) return
    setWaiverFlagsByCrew((profiles) => ({ ...profiles, [selectedCrew.id]: conditions }))
  }
  const recordLabResult = (biomarkerId, value) => {
    if (!selectedCrew || !Number.isFinite(value)) return
    setLabResultsByCrew((profiles) => ({
      ...profiles,
      [selectedCrew.id]: {
        ...profiles[selectedCrew.id],
        [biomarkerId]: { value, recordedAt: new Date().toISOString() },
      },
    }))
  }

  if (!crewId && !emergencyAccess && activeView === 'overview') return <MissionOverview mission={mission} missions={missions} missionId={missionId} setMissionId={setMissionId} missionSeconds={missionSeconds} circadianMode={circadianMode} themePreference={themePreference} onThemePreferenceChange={setThemePreference} donkiStatus={donkiStatus} solarEvent={solarEvent} gamification={gamification} crew={crew} onUnlock={(id) => { setCrewId(null); setActiveView(`lock:${id}`) }} onEmergency={() => setEmergencyAccess(true)} />

  if (!crewId && !emergencyAccess) {
    const initialCrewId = activeView.startsWith('lock:') ? activeView.slice(5) : null
    return <LockScreen crew={crew} initialCrewId={initialCrewId} circadianMode={circadianMode} onLogin={(id) => { setCrewId(id); setActiveView('workspace') }} onBack={() => setActiveView('overview')} onEmergency={() => setEmergencyAccess(true)} />
  }

  if (emergencyAccess && !crewId) return <main className={`emergency-standalone ${circadianMode}`}><EmergencyAlertBanner alert={activeAlert} onAcknowledge={acknowledgeAlert} onOpenProtocol={() => setEmergencyAccess(false)} /><MissionModules module="emergency" mission={mission} onModule={() => setEmergencyAccess(false)} solarEvent={solarEvent} gamification={gamification} onAward={awardXp} onDispatch={dispatchAlert} onOpticalHeartRate={handleOpticalHeartRate} opticalSnapshot={opticalSnapshot} onOpticalSnapshot={setOpticalSnapshot} /></main>

  return (
    <main className={`sentinel-app transition-colors duration-500 ${circadianMode} ${module === 'female' ? 'theme-rose' : ''}`}>
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
        activeAlertCount={notifications.filter((item) => item.status === 'Active').length}
        onAcknowledge={acknowledgeAlert}
        onManualAlert={() => dispatchAlert('General alert manually activated by crew', 'General Alert')}
        donkiStatus={stormSimulated ? 'Simulated SEP alert · protocol active' : donkiStatus}
        onSimulateStorm={handleStorm}
        stormSimulated={stormSimulated}
        solarEvent={solarEvent}
        donkiPayload={donkiPayload}
        donkiPayloadOpen={donkiPayloadOpen}
        setDonkiPayloadOpen={setDonkiPayloadOpen}
        themePreference={themePreference}
        onThemePreferenceChange={setThemePreference}
        activeCrew={selectedCrew}
        wristbandZone={wristbandZone}
        setWristbandZone={setWristbandZone}
        onWristbandSync={handleWristbandSync}
      />
      <div className="sentinel-body">
        {mobileMenuOpen && <button type="button" className="mobile-drawer-backdrop" aria-label="Close menu" onClick={() => setMobileMenuOpen(false)} />}
        <Sidebar activeCrew={selectedCrew} module={module} setModule={(nextModule) => { setModule(nextModule); setMobileMenuOpen(false) }} mission={mission} onLock={lockTerminal} gamification={gamification} onAward={awardXp} mobileMenuOpen={mobileMenuOpen} />
        <section className="sentinel-content">
          {module === 'dashboard' ? (
            <MissionDashboard mission={mission} missionType={missionType} labResults={selectedLabResults} onRecordLabResult={recordLabResult} crew={selectedCrew} selectedZone={selectedZone} setSelectedZone={setSelectedZone} onModule={setModule} solarEvent={solarEvent} gamification={gamification} opticalHeartRate={opticalHeartRate} onOpticalHeartRate={handleOpticalHeartRate} radiationDoseOffset={radiationDoseOffset} wristbandDose={wristbandDose} wristbandZone={wristbandZone} onWristbandSync={handleWristbandSync} onRadiationSync={handleRadiationSync} onRadiationBurst={handleRadiationBurst} activeConditions={waiverFlagsByCrew[selectedCrew.id] || []} onActiveConditionsChange={updateCrewWaiverFlags} />
          ) : module === 'history' ? (
            <div className="module-page"><button type="button" className="back-link" onClick={() => setModule('dashboard')}>← Crew Dashboard</button><CrewVitalsHistory /></div>
          ) : (
            <MissionModules module={module} crew={selectedCrew} mission={mission} missionType={missionType} labResults={selectedLabResults} onRecordLabResult={recordLabResult} onModule={setModule} solarEvent={solarEvent} gamification={gamification} onAward={awardXp} onDispatch={dispatchAlert} onOpticalHeartRate={handleOpticalHeartRate} opticalSnapshot={opticalSnapshot} onOpticalSnapshot={setOpticalSnapshot} onRadiationSync={handleRadiationSync} onRadiationBurst={handleRadiationBurst} />
          )}
        </section>
      </div>
      <EmergencyAlertBanner alert={activeAlert} onAcknowledge={acknowledgeAlert} onOpenProtocol={() => setModule('emergency')} />
      <TelemetryQueue key={telemetryPacket?.alert?.id || 'empty'} packet={telemetryPacket} mission={mission} onDismiss={() => setTelemetryPacket(null)} />
      {achievement && <div className="achievement-toast"><span className="achievement-medal">★</span><div><p>ACHIEVEMENT UNLOCKED</p><strong>{achievement.title}</strong><small>+{achievement.amount} Medical Readiness XP</small></div></div>}
    </main>
  )
}

function formatMet(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600) % 24
  const minutes = Math.floor(totalSeconds / 60) % 60
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

function App() {
  return <ErrorBoundary><div className="app-root overflow-x-hidden max-w-full"><AppContent /></div></ErrorBoundary>
}

export default App
