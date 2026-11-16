import { useEffect, useRef, useState } from 'react'
import { ChevronDown, CircleUserRound, Sparkles } from 'lucide-react'

function CustomDropdown({ label, value, options, onChange, renderOption, icon: Icon, className = '' }) {
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef(null)
  const selected = options.find((option) => option.id === value)

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (!dropdownRef.current?.contains(event.target)) setOpen(false)
    }
    document.addEventListener('mousedown', closeOnOutsideClick)
    return () => document.removeEventListener('mousedown', closeOnOutsideClick)
  }, [])

  return (
    <div className={`custom-dropdown ${className}`} ref={dropdownRef}>
      <button type="button" className="select-shell custom-dropdown-trigger" aria-expanded={open} onClick={() => setOpen((isOpen) => !isOpen)}>
        {Icon && <Icon size={16} className="text-slate-500" />}
        {label && <span className="select-label">{label}</span>}
        <span className="custom-dropdown-value">{renderOption(selected, true)}</span>
        <ChevronDown size={15} className={`dropdown-chevron ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="custom-dropdown-menu" role="listbox" aria-label={label}>
          {options.map((option) => (
            <button type="button" role="option" aria-selected={option.id === value} className={`custom-dropdown-option ${option.id === value ? 'active' : ''}`} key={option.id} onClick={() => { onChange(option.id); setOpen(false) }}>
              {renderOption(option, false)}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function MissionHeader({ missions, missionId, setMissionId, crew, crewId, setCrewId }) {
  const mission = missions.find((item) => item.id === missionId)
  const activeCrew = crew.find((item) => item.id === crewId)

  return (
    <header className="border-b border-slate-800/80 bg-[#090e17]/95">
      <div className="mx-auto flex max-w-[1500px] flex-wrap items-center justify-between gap-5 px-5 py-4 lg:px-10">
        <div className="flex items-center gap-3">
          <div className="brand-mark"><img className="lyra-logo-image" src="/images/lyra-logo-mark.jpg" alt="LYRA logo" /></div>
          <div>
            <p className="font-display text-sm font-bold tracking-[0.2em] text-white">LYRA</p>
            <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">Crew Care</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CustomDropdown
            label="Mission Phase"
            value={missionId}
            options={missions}
            onChange={setMissionId}
            renderOption={(item, compact) => compact ? item.name : (
              <span className="mission-option">
                <span><strong>{item.name}</strong><small>{item.context}</small></span>
                <span className="mission-option-facts"><b>{item.gravity}</b><span>Earth latency: {item.latency}</span><em className={`radiation-${item.radiationLevel}`}>Radiation: {item.radiation}</em></span>
              </span>
            )}
          />
          <div className="mission-facts">
            <span>{mission.gravity}</span><i /> <span>Earth latency: {mission.latency}</span><i /> <span className={`radiation-${mission.radiationLevel}`}>Radiation: {mission.radiation}</span>
          </div>
          <CustomDropdown
            className="crew-select"
            value={crewId}
            options={crew}
            onChange={setCrewId}
            icon={CircleUserRound}
            renderOption={(item, compact) => compact ? `${item.name} · ${item.gender === 'female' ? 'Female' : 'Male'}` : (
              <span className="crew-option"><span><strong>{item.name}</strong><small>{item.role}</small></span><em>{item.gender === 'female' ? 'Female' : 'Male'}</em></span>
            )}
          />
          <div className="hidden items-center gap-2 text-right sm:flex">
            <Sparkles size={14} className="text-amber-300" />
            <div><p className="text-[10px] uppercase tracking-widest text-slate-500">{activeCrew.role}</p><p className="font-mono text-[10px] text-slate-300">CREW ID: {crewId.toUpperCase()}</p></div>
          </div>
        </div>
      </div>
    </header>
  )
}
