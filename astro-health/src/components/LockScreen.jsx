import { Delete, Fingerprint, Orbit, ShieldAlert } from 'lucide-react'
import { useState } from 'react'

export function LockScreen({ crew, onLogin, onEmergency }) {
  const [selectedId, setSelectedId] = useState(null)
  const [pin, setPin] = useState('')
  const [shaking, setShaking] = useState(false)

  const chooseCrew = (id) => { setSelectedId(id); setPin(''); setShaking(false) }
  const addDigit = (digit) => {
    if (!selectedId || pin.length >= 4) return
    const nextPin = `${pin}${digit}`
    setPin(nextPin)
    if (nextPin.length === 4) {
      if (nextPin === '1234') onLogin(selectedId)
      else { setShaking(true); window.setTimeout(() => { setPin(''); setShaking(false) }, 520) }
    }
  }
  const removeDigit = () => setPin((value) => value.slice(0, -1))

  return <main className="lock-screen"><div className="lock-shell"><div className="lock-brand"><div className="sentinel-logo"><Orbit size={26} /></div><div><h1>SENTINELA</h1><p>Terminal Médico Autônomo</p></div></div><div className="lock-divider" /><p className="lock-kicker">IDENTIFICAÇÃO DO TRIPULANTE</p><div className="lock-crew-grid">{crew.map((member) => <button type="button" key={member.id} className={selectedId === member.id ? 'selected' : ''} onClick={() => chooseCrew(member.id)}><span className="lock-avatar">{member.name.slice(-1)}</span><span><strong>{member.name}</strong><small>{member.role} · Perfil {member.profile}</small></span><Fingerprint size={18} /></button>)}</div>{selectedId && <div className={`pin-panel ${shaking ? 'pin-shake' : ''}`}><p>PIN BIOMÉTRICO · {crew.find((member) => member.id === selectedId).name.toUpperCase()}</p><div className="pin-dots">{[0, 1, 2, 3].map((index) => <i className={pin.length > index ? 'filled' : ''} key={index} />)}</div><div className="pin-keypad">{['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => <button type="button" key={digit} onClick={() => addDigit(digit)}>{digit}</button>)}<button type="button" className="keypad-action" onClick={() => setPin('')}>Limpar</button><button type="button" onClick={() => addDigit('0')}>0</button><button type="button" className="keypad-action" onClick={removeDigit}><Delete size={18} /></button></div></div>}<p className="lock-hint">PIN de demonstração: 1234</p><button type="button" className="quick-emergency" onClick={onEmergency}><ShieldAlert size={16} /> Acesso Rápido: Emergência Médica (Sem PIN)</button></div></main>
}
