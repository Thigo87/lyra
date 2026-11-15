import { Bell, Check, Radio, Send, ShieldAlert, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'

export function NotificationCenter({ notifications, activeCount, onAcknowledge, onManualAlert }) {
  const [open, setOpen] = useState(false)
  return <div className="notification-center">
    <button type="button" className="notification-trigger" aria-label="Open notifications" onClick={() => setOpen((value) => !value)}>
      <Bell size={19} />{activeCount > 0 && <span className="notification-count absolute -top-1.5 -right-1.5 w-5 h-5 min-w-[20px] rounded-full bg-rose-600 text-white text-[11px] font-bold flex items-center justify-center leading-none shrink-0">{activeCount}</span>}
    </button>
    {open && <div className="notification-popover">
      <div className="notification-popover-head"><div><strong>Alert Center</strong><small>Spacecraft intranet · critical history</small></div><Bell size={16} /></div>
      <button type="button" className="dispatch-general-button" onClick={onManualAlert}><ShieldAlert size={15} /> Dispatch General Alert to Crew and Houston</button>
      <div className="notification-list">{notifications.length === 0 && <p className="notification-empty">No critical alerts recorded.</p>}{notifications.map((item) => <div className={`notification-item ${item.status === 'Active' ? 'active' : ''}`} key={item.id}><div className="notification-item-icon"><Radio size={14} /></div><div><strong>{item.title}</strong><p>{item.detail}</p><small>MET {item.met} · {item.status}</small></div>{item.status === 'Active' && <button type="button" aria-label="Acknowledge alert" onClick={() => onAcknowledge(item.id)}><Check size={14} /></button>}</div>)}</div>
    </div>}
  </div>
}

export function EmergencyAlertBanner({ alert, onAcknowledge, onOpenProtocol }) {
  if (!alert || alert.status !== 'Active') return null
  return <div className="emergency-alert-banner" role="alert"><div className="emergency-alert-pulse"><ShieldAlert size={22} /></div><div><strong>EMERGENCY ALERT</strong><p>{alert.crewName} | {alert.detail} | Habitation Module</p><small>MET {alert.met} · Alert replicated across all spacecraft terminals</small></div><div className="emergency-alert-actions"><button type="button" onClick={onOpenProtocol}>Open Emergency Protocol</button><button type="button" className="acknowledge-button" onClick={() => onAcknowledge(alert.id)}>Acknowledge (Crew)</button></div></div>
}

function latencySeconds(latency) {
  if (latency.includes('min')) return Number.parseFloat(latency) * 60
  const seconds = Number.parseFloat(latency)
  return Number.isFinite(seconds) ? Math.max(seconds, 1) : 1
}

export function TelemetryQueue({ packet, mission, onDismiss }) {
  const duration = useMemo(() => latencySeconds(mission.latency), [mission.latency])
  const [remaining, setRemaining] = useState(duration)
  useEffect(() => {
    if (!packet) return undefined
    const timer = window.setInterval(() => setRemaining((value) => Math.max(0, value - 1)), 1000)
    return () => window.clearInterval(timer)
  }, [packet, duration])
  if (!packet) return null
  const progress = ((duration - remaining) / duration) * 100
  const display = remaining >= 60 ? `${Math.floor(remaining / 60)}m ${String(Math.floor(remaining % 60)).padStart(2, '0')}s` : `${remaining.toFixed(remaining < 2 ? 1 : 0)}s`
  return <aside className="telemetry-queue"><div className="telemetry-queue-head"><div><span className="eyebrow"><Send size={12} /> ASYNCHRONOUS TELEMETRY</span><strong>Transmission to Houston</strong></div><button type="button" aria-label="Close telemetry status" onClick={onDismiss}><X size={15} /></button></div><p>Signal in transit · estimated arrival in <b>{display}</b></p><div className="telemetry-queue-progress"><i style={{ width: `${progress}%` }} /></div><details><summary>View medical JSON packet</summary><pre>{JSON.stringify(packet, null, 2)}</pre></details></aside>
}
