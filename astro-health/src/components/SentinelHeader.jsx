import { ChevronDown, Clock3, Globe2, Menu, Radio, ShieldAlert, Sun, X } from 'lucide-react'
import { useState } from 'react'
import { NotificationCenter } from './EmergencyDispatch'

function Dropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const selected = options.find((option) => option.id === value)
  return <div className="sentinel-dropdown">
    <button type="button" className="sentinel-dropdown-trigger" onClick={() => setOpen((state) => !state)}><span><small>AMBIENTE DA MISSÃO</small><strong>{selected.name} · {selected.context}</strong></span><ChevronDown size={16} /></button>
    {open && <div className="sentinel-dropdown-menu">{options.map((option) => <button type="button" key={option.id} className={option.id === value ? 'active' : ''} onClick={() => { onChange(option.id); setOpen(false) }}><span><b>{option.name}</b><small>{option.context}</small></span><em>{option.gravity} · {option.latency}</em></button>)}</div>}
  </div>
}

function formatMissionTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600) % 24
  const minutes = Math.floor(totalSeconds / 60) % 60
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function SentinelHeader({ mission, missions, missionId, setMissionId, missionSeconds, onEmergency, notifications, activeAlertCount, onAcknowledge, onManualAlert, mobileMenuOpen, onMenuToggle, donkiStatus, onSimulateStorm, stormSimulated, solarEvent, donkiPayload, donkiPayloadOpen, setDonkiPayloadOpen }) {
  return <header className="sentinel-header">
    <div className="sentinel-header-main">
      <button type="button" className="mobile-menu-button" aria-label={mobileMenuOpen ? 'Fechar navegação' : 'Abrir navegação'} onClick={onMenuToggle}>{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button><div className="sentinel-brand"><div className="sentinel-logo"><Globe2 size={22} /></div><div><h1>SENTINELA</h1><p>Monitor autônomo de saúde</p></div></div>
      <div className="sentinel-mission-controls">
        <Dropdown value={missionId} options={missions} onChange={setMissionId} />
        <div className="telemetry-badges">
          <span><b>GRAVIDADE</b>{mission.gravity}</span><span><b>LATÊNCIA TERRA</b>{mission.latency}</span><span className={`telemetry-${solarEvent.active ? 'critical' : mission.radiationLevel}`}><b>RADIAÇÃO</b>{mission.radiation} · {solarEvent.radiationRate} µSv/h</span><span><b>DIA 96 · MET</b><Clock3 size={12} />{formatMissionTime(missionSeconds)}</span>
        </div>
      </div>
      <div className="header-actions"><NotificationCenter notifications={notifications} activeCount={activeAlertCount} onAcknowledge={onAcknowledge} onManualAlert={onManualAlert} /><button type="button" className="emergency-button" onClick={onEmergency}><ShieldAlert size={18} /><span>Emergência médica<br />a bordo</span></button></div>
    </div>
    <div className={`donki-bar ${stormSimulated ? 'storm' : ''}`}><span className="donki-status"><span className="status-dot" />{donkiStatus}</span><span className="donki-source"><Radio size={13} /> NASA DONKI / SEP</span><button type="button" className="donki-json-button" onClick={() => setDonkiPayloadOpen((value) => !value)}>Ver Payload JSON Bruto</button><button type="button" onClick={onSimulateStorm}><Sun size={13} /> {stormSimulated ? 'Encerrar simulação' : 'Simular Tempestade Solar (SEP)'}</button>{donkiPayloadOpen && <div className="donki-payload-popover"><div><strong>Payload NASA DONKI / SEP</strong><button type="button" onClick={() => setDonkiPayloadOpen(false)}>Fechar</button></div><pre>{JSON.stringify(donkiPayload, null, 2)}</pre></div>}</div>
  </header>
}
