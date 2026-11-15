import { useId } from 'react'

const colors = {
  emerald: '#10b981',
  amber: '#f59e0b',
  orange: '#f97316',
  rose: '#fb7185',
}
const zoneLabels = {
  head: 'Head & Neuro-Ocular',
  chest: 'Chest & Cardiopulmonary',
  abdomen: 'Abdomen & Pelvic',
  limbs: 'Limbs & Vascular',
  full: 'Systemic / Full Body',
}

export function InteractiveBodyAvatar({ selectedZone = 'full', onSelectZone, severityColor = 'emerald', pulseSpeed = 'slow', biologicalProfile = 'female', diagnostic = false }) {
  const gradientId = useId().replace(/:/g, '')
  const accent = colors[severityColor] || colors.emerald
  const select = (zone) => onSelectZone?.(zone)
  const zoneClass = (zone) => `body-avatar-zone ${selectedZone === zone ? 'is-selected' : ''}`

  return <div className={`body-avatar-shell ${diagnostic ? 'is-diagnostic' : ''}`} style={{ '--body-accent': accent }}>
    <svg className={`interactive-body-avatar pulse-${pulseSpeed}`} viewBox="0 0 240 460" role="img" aria-label="Interactive low-poly biomedical body scanner">
      <defs>
        <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0" stopColor={accent} stopOpacity=".4" />
          <stop offset="1" stopColor="#082f49" stopOpacity=".2" />
        </linearGradient>
        <pattern id={`${gradientId}-grid`} width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="#38bdf8" strokeOpacity=".14" strokeWidth=".5" />
        </pattern>
        <filter id={`${gradientId}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect width="240" height="460" rx="12" fill={`url(#${gradientId}-grid)`} />
      <path className="body-avatar-scale" d="M18 45h7m-7 55h7m-7 55h7m-7 55h7m-7 55h7m-7 55h7m-7 55h7M215 45h7m-7 55h7m-7 55h7m-7 55h7m-7 55h7m-7 55h7m-7 55h7" />
      <path className={`body-avatar-full-zone ${selectedZone === 'full' ? 'is-selected' : ''}`} d="M120 8c-60 0-98 48-98 111v222c0 64 42 108 98 108s98-44 98-108V119C218 56 180 8 120 8Z" onClick={() => select('full')} />
      <g className={`${zoneClass('head')} body-avatar-head ${biologicalProfile}`} onClick={() => select('head')} tabIndex="0" role="button" aria-label="Head & Neuro-Ocular">
        <path d={biologicalProfile === 'female' ? 'M120 28c-18 0-29 14-29 35s11 33 29 33 29-12 29-33-11-35-29-35Z' : 'M120 26c-21 0-34 15-34 37s13 36 34 36 34-14 34-36-13-37-34-37Z'} fill={`url(#${gradientId})`} />
        <path d="M96 60h48M101 72h14m10 0h14" className="body-avatar-detail" />
        <circle cx="109" cy="61" r="3" className="body-avatar-node" /><circle cx="131" cy="61" r="3" className="body-avatar-node" />
        <text x="158" y="58" className="body-avatar-badge">01</text>
      </g>
      <g className={`${zoneClass('chest')} body-avatar-chest ${biologicalProfile}`} onClick={() => select('chest')} tabIndex="0" role="button" aria-label="Chest & Cardiopulmonary">
        <path d={biologicalProfile === 'female' ? 'M108 96h24l10 15 18 10-10 57-30-7-30 7-10-57 18-10 10-15Z' : 'M104 96h32l14 15 22 11-13 57-39-8-39 8-13-57 22-11 14-15Z'} fill={`url(#${gradientId})`} />
        <path d="M120 108v57m-34-31 34 8 34-8m-52-22 18 12 18-12" className="body-avatar-detail" />
        <path d="M112 151C108 146 99 139 99 132c0-8 9-11 14-4 5-7 14-4 14 4 0 7-9 14-15 19Z" className="body-avatar-heart" />
        <text x="158" y="130" className="body-avatar-badge">02</text>
      </g>
      <g className={`${zoneClass('abdomen')} body-avatar-abdomen ${biologicalProfile}`} onClick={() => select('abdomen')} tabIndex="0" role="button" aria-label="Abdomen & Pelvic">
        <path d={biologicalProfile === 'female' ? 'M96 179h48l9 54-13 22-20 10-20-10-13-22 9-54Z' : 'M92 179h56l7 57-11 21-24 13-24-13-11-21 7-57Z'} fill={`url(#${gradientId})`} />
        <path d="M120 184v65m-26-44h52m-50 19h48m-37 18h26" className="body-avatar-detail" />
        <path d={biologicalProfile === 'female' ? 'm94 233 26 16 26-16 13 22-16 20-23 10-23-10-16-20 13-22Z' : 'm96 236 24 16 24-16 12 21-12 22-24 12-24-12-12-22 12-21Z'} fill={`url(#${gradientId})`} />
        <text x="158" y="213" className="body-avatar-badge">03</text>
      </g>
      <g className={`${zoneClass('limbs')} body-avatar-limbs`} onClick={() => select('limbs')} tabIndex="0" role="button" aria-label="Limbs & Vascular">
        <path d={biologicalProfile === 'female' ? 'M98 111 84 119 54 193l14 7 24-65Zm44 0 14 8 18 74-14 7-24-65ZM96 267l22 10-5 97-18 54-16-5 17-55Zm48 0-22 10 5 97 18 54 16-5-17-55Z' : 'M90 110 76 119 47 193l14 7 24-66Zm60 0 14 9 19 74-14 7-24-66M91 263l25 13-4 98-20 55-17-5 18-56Zm58 0-25 13 4 98 20 55 17-5-18-56Z'} fill={`url(#${gradientId})`} />
        <circle cx={biologicalProfile === 'female' ? 61 : 54} cy="196" r="3" className="body-avatar-node" /><circle cx={biologicalProfile === 'female' ? 179 : 186} cy="196" r="3" className="body-avatar-node" /><circle cx="108" cy="329" r="3" className="body-avatar-node" /><circle cx="132" cy="329" r="3" className="body-avatar-node" />
        <text x="158" y="314" className="body-avatar-badge">04</text>
      </g>
      <path className="body-avatar-scanline" d="M30 226h180" />
    </svg>
    <div className="body-avatar-caption mt-3 text-center font-mono text-xs tracking-wider uppercase">
      BIO-SCAN / {zoneLabels[selectedZone] || zoneLabels.full}
    </div>
  </div>
}
