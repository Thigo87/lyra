import { ChevronDown } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

export function MissionEnvironmentDropdown({ value, options, onChange }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const selected = options.find((option) => option.id === value) || options[0]

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (!containerRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  return <div className="sentinel-dropdown" ref={containerRef}>
    <button type="button" className="sentinel-dropdown-trigger bg-slate-900 text-slate-100" style={{ colorScheme: 'dark' }} onClick={() => setOpen((state) => !state)}><span><small>MISSION ENVIRONMENT</small><strong>{selected.name}</strong></span><ChevronDown size={16} /></button>
    {open && <div className="sentinel-dropdown-menu z-50 rounded-xl border border-slate-700/80 bg-[#0b1322] p-1.5 text-slate-100 shadow-2xl" style={{ colorScheme: 'dark' }}>{options.map((option) => <button type="button" key={option.id} className={`bg-slate-900 text-slate-100 ${option.id === value ? 'active bg-emerald-950/50 border border-emerald-500/50 rounded-lg' : ''}`} onClick={() => { onChange(option.id); setOpen(false) }}><span><b>{option.name}</b><small>{option.context}</small></span><em>{option.gravity} · {option.latency}</em></button>)}</div>}
  </div>
}
