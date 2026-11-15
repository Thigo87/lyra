import { Activity, Brain, HeartPulse, LockKeyhole, ShieldAlert, Trophy, Zap } from 'lucide-react'

const modules = [
  { id: 'dashboard', label: 'Painel da tripulação', icon: Activity },
  { id: 'female', label: 'Saúde feminina', icon: HeartPulse },
  { id: 'emergency', label: 'Emergência guiada', icon: ShieldAlert },
  { id: 'cognitive', label: 'Prontidão cognitiva', icon: Brain },
]

export function Sidebar({ activeCrew, module, setModule, mission, onLock, gamification, onAward }) {
  const modulesForCrew = activeCrew.id === 'elena' ? modules : modules.filter((item) => item.id !== 'female')
  return <aside className="sentinel-sidebar">
    <div className="sidebar-crew">
      <p className="sidebar-label">TRIPULANTE AUTENTICADO</p>
      <div className="crew-profile-button locked"><span className="crew-avatar">{activeCrew.name.slice(-1)}</span><span><strong>{activeCrew.name}</strong><small>{activeCrew.role} · {activeCrew.age} anos · Perfil {activeCrew.profile}</small></span><LockKeyhole size={14} /></div>
    </div>
    <nav className="module-nav"><p className="sidebar-label">NAVEGAÇÃO DE MÓDULOS</p>{modulesForCrew.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={module === item.id ? 'active' : ''} onClick={() => setModule(item.id)}><Icon size={17} /><span>{item.label}</span>{module === item.id && <i />}</button> })}</nav>
    <div className="readiness-panel"><div className="readiness-title"><Trophy size={14} /><span>NÍVEL DE PRONTIDÃO</span><b>Nível {gamification.level}</b></div><strong>Especialista Biomédico</strong><div className="xp-track"><i style={{ width: `${gamification.progress}%` }} /></div><div className="xp-meta"><span>{gamification.xp} XP</span><span>{gamification.streak} dias seguidos</span></div><p className="sidebar-label quest-label">MISSÕES DIÁRIAS</p>{[{ id: 'cognitive', label: 'Check-up Cognitivo PVT', xp: 100 }, { id: 'biomonitor', label: 'Leitura Matinal Bio-Monitor', xp: 75 }, { id: 'emergency', label: 'Simulação sem Erros', xp: 150 }].map((quest) => <button type="button" className={`quest-button ${gamification.completedQuests.includes(quest.id) ? 'complete' : ''}`} key={quest.id} onClick={() => onAward(quest.id, quest.xp, quest.label)}><Zap size={11} /><span>{quest.label}</span><b>{gamification.completedQuests.includes(quest.id) ? '✓' : `+${quest.xp}`}</b></button>)}</div>
    <div className="sidebar-context"><p>CONTEXTO OPERACIONAL</p><strong>Terra a {mission.latency}</strong><span>Este sistema orienta decisões autônomas da tripulação.</span><small>Simulação de treinamento baseada em evidências do NASA Human Research Program. Não substitui um médico.</small></div>
    <div className="offline-badge"><strong>Offline-First / Dual-Use</strong><span>Triagem autônoma sem telemedicina em tempo real para comunidades remotas isoladas, regiões amazônicas e bases antárticas.</span></div>
    <button type="button" className="lock-terminal-button" onClick={onLock}><LockKeyhole size={14} /> Bloquear Terminal / Trocar Tripulante</button>
  </aside>
}
