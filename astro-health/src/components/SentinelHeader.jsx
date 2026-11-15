import { Bluetooth, Clock3, Globe2, Menu, Radio, ShieldAlert, Sun, Waves, X } from 'lucide-react'
import { useState } from 'react'
import { NotificationCenter } from './EmergencyDispatch'
import { MissionEnvironmentDropdown } from './MissionEnvironmentDropdown'

function formatMissionTime(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600) % 24
  const minutes = Math.floor(totalSeconds / 60) % 60
  const seconds = totalSeconds % 60
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, '0')).join(':')
}

export function SentinelHeader({ mission, missions, missionId, setMissionId, missionSeconds, onEmergency, notifications, activeAlertCount, onAcknowledge, onManualAlert, mobileMenuOpen, onMenuToggle, donkiStatus, onSimulateStorm, stormSimulated, solarEvent, donkiPayload, donkiPayloadOpen, setDonkiPayloadOpen, activeCrew, wristbandZone, setWristbandZone, onWristbandSync }) {
  const [wristbandOpen, setWristbandOpen] = useState(false)
  const [wristbandSyncing, setWristbandSyncing] = useState(false)
  const [wristbandSynced, setWristbandSynced] = useState(false)
  const zone = wristbandZone === 'airlock'
    ? { label: 'Unshielded Airlock / EVA', rate: '2.40 mSv/h', module: 'Cupola · High Exposure', dose: '+0.38 mSv' }
    : { label: 'Storm Shelter / Water Wall', rate: '0.05 mSv/h', module: 'Node 2 · Standard Shielding', dose: '+0.08 mSv' }
  const syncWristband = () => {
    setWristbandSyncing(true)
    setWristbandSynced(false)
    window.setTimeout(() => {
      onWristbandSync?.()
      setWristbandSyncing(false)
      setWristbandSynced(true)
    }, 1500)
  }
  return <header className="sentinel-header">
    <div className="sentinel-header-main">
      <div className="header-primary">
        <div className="header-identity"><button type="button" className="mobile-menu-button" aria-label={mobileMenuOpen ? 'Close navigation' : 'Open navigation'} onClick={onMenuToggle}>{mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}</button><div className="sentinel-brand"><div className="sentinel-logo"><Globe2 size={22} /></div><div><h1>LYRA</h1><p>Autonomous Crew & Women's Health</p></div></div></div>
        <div className="header-actions"><div className="header-crew-status"><span className="header-crew-badge">{activeCrew?.name || 'Crew'}</span><button type="button" className="wristband-status-pill" onClick={() => setWristbandOpen((open) => !open)}><span className="wristband-pulse-dot" /><Bluetooth size={13} /> Bio-Band · Synced (BLE)</button>{wristbandOpen && <div className="wristband-popover"><div className="wristband-popover-heading"><div><p className="eyebrow"><Waves size={13} /> WRISTBAND TELEMETRY & SYNC</p><strong>{activeCrew?.name || 'Crew'} · passive dosimeter</strong></div><button type="button" className="optical-close" onClick={() => setWristbandOpen(false)}><X size={15} /></button></div><p className="wristband-copy">Co-located absorption is cross-referenced with the active habitat beacon.</p><div className="wristband-zone-toggle"><button type="button" className={wristbandZone === 'shelter' ? 'active' : ''} onClick={() => setWristbandZone('shelter')}>Storm Shelter / Water Wall<br /><small>0.05 mSv/h</small></button><button type="button" className={wristbandZone === 'airlock' ? 'active' : ''} onClick={() => setWristbandZone('airlock')}>Unshielded Airlock / EVA<br /><small>2.40 mSv/h</small></button></div><div className="wristband-zone-readout"><span><b>BLE beacon</b>{zone.module}</span><span><b>Zone rate</b>{zone.rate}</span></div><button type="button" className="female-action" onClick={syncWristband} disabled={wristbandSyncing}>{wristbandSyncing ? 'NFC / BLE wave in progress…' : 'Tap Wristband to Sync (NFC)'}</button>{wristbandSyncing && <div className="wristband-wave-animation"><i /><i /><i /></div>}{wristbandSynced && <div className="wristband-sync-result">Latest reading {zone.dose} · {zone.module}</div>}</div>}</div><NotificationCenter notifications={notifications} activeCount={activeAlertCount} onAcknowledge={onAcknowledge} onManualAlert={onManualAlert} /><button type="button" className="emergency-button" onClick={onEmergency}><ShieldAlert size={18} /><span>Medical emergency<br />on board</span></button></div>
      </div>
      <div className="header-telemetry">
        <div className="sentinel-mission-controls"><MissionEnvironmentDropdown value={missionId} options={missions} onChange={setMissionId} /></div>
        <div className="telemetry-badges">
          <span><b>GRAVITY</b><strong>{mission.gravity}</strong></span><span><b>EARTH LATENCY</b><strong>{mission.latency}</strong></span><span className={`telemetry-${solarEvent.active ? 'critical' : mission.radiationLevel}`}><b>RADIATION</b><strong>{mission.radiation} · {solarEvent.radiationRate} µSv/h</strong></span><span><b>DAY 96 · MET</b><strong><Clock3 size={12} />{formatMissionTime(missionSeconds)}</strong></span>
        </div>
      </div>
    </div>
    <div className={`donki-bar ${stormSimulated ? 'storm' : ''}`}><span className="donki-status"><span className="status-dot" />{donkiStatus}</span><span className="donki-source"><Radio size={13} /> NASA DONKI / SEP</span><button type="button" className="donki-json-button" onClick={() => setDonkiPayloadOpen((value) => !value)}>View Raw JSON Payload</button><button type="button" onClick={onSimulateStorm}><Sun size={13} /> {stormSimulated ? 'End simulation' : 'Simulate Solar Flare / SEP Event'}</button>{donkiPayloadOpen && <div className="donki-payload-popover"><div><strong>NASA DONKI / SEP Payload</strong><button type="button" onClick={() => setDonkiPayloadOpen(false)}>Close</button></div><pre>{JSON.stringify(donkiPayload, null, 2)}</pre></div>}</div>
  </header>
}
