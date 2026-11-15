import { Activity, Brain, ClipboardList, HeartPulse, LockKeyhole, ShieldAlert, Trophy, Zap } from 'lucide-react'

const modules = [
  { id: 'dashboard', label: 'Crew Dashboard', icon: Activity },
  { id: 'female', label: "Women's Health", icon: HeartPulse },
  { id: 'emergency', label: 'Guided Emergency', icon: ShieldAlert },
  { id: 'history', label: 'History & Medical Record', icon: ClipboardList },
  { id: 'cognitive', label: 'Cognitive Readiness', icon: Brain },
]

export function Sidebar({ activeCrew, module, setModule, mission, onLock, gamification, onAward, mobileMenuOpen }) {
  const modulesForCrew = activeCrew.id === 'aurora' ? modules : modules.filter((item) => item.id !== 'female')
  return <aside className={`sentinel-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
    <div className="sidebar-crew">
      <p className="sidebar-label">AUTHENTICATED CREW MEMBER</p>
      <div className="crew-profile-button locked"><span className="crew-avatar">{activeCrew.name.slice(-1)}</span><span><strong>{activeCrew.name}</strong><small>{activeCrew.role} · {activeCrew.age} years · {activeCrew.profile} profile</small></span><LockKeyhole size={14} /></div>
    </div>
    <nav className="module-nav"><p className="sidebar-label">MODULE NAVIGATION</p>{modulesForCrew.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={module === item.id ? 'active' : ''} onClick={() => setModule(item.id)}><Icon size={17} /><span>{item.label}</span>{module === item.id && <i />}</button> })}</nav>
    <div className="readiness-panel"><div className="readiness-title"><Trophy size={14} /><span>READINESS LEVEL</span><b>Level {gamification.level}</b></div><strong>Biomedical Specialist</strong><div className="xp-track"><i style={{ width: `${gamification.progress}%` }} /></div><div className="xp-meta"><span>{gamification.xp} XP</span><span>{gamification.streak}-day streak</span></div><p className="sidebar-label quest-label">DAILY MISSIONS</p>{[{ id: 'cognitive', label: 'PVT Cognitive Check', xp: 100 }, { id: 'biomonitor', label: 'Morning Bio-Monitor Reading', xp: 75 }, { id: 'emergency', label: 'Zero-Error Simulation', xp: 150 }].map((quest) => <button type="button" className={`quest-button ${gamification.completedQuests.includes(quest.id) ? 'complete' : ''}`} key={quest.id} onClick={() => onAward(quest.id, quest.xp, quest.label)}><Zap size={11} /><span>{quest.label}</span><b>{gamification.completedQuests.includes(quest.id) ? '✓' : `+${quest.xp}`}</b></button>)}</div>
    <div className="sidebar-context"><p>OPERATIONAL CONTEXT</p><strong>Earth at {mission.latency}</strong><span>This system guides autonomous crew decisions.</span><small>Training simulation based on NASA Human Research Program evidence. Does not replace a physician.</small></div>
    <div className="offline-badge"><strong>Offline-First / Dual-Use</strong><span>Autonomous triage without real-time telemedicine for isolated remote communities, Amazonian regions, and Antarctic bases.</span></div>
    <button type="button" className="lock-terminal-button" onClick={onLock}><LockKeyhole size={14} /> Lock Terminal / Switch Crew</button>
  </aside>
}
