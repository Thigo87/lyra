import { Activity, Gauge, Heart, Thermometer, Waves } from 'lucide-react'
import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'

const baseVitals = [
  { id: 'heart', label: 'Frequência Cardíaca', unit: 'BPM', value: '72', icon: Heart, color: '#f27272', data: [68, 71, 70, 74, 72, 76, 72, 73], normal: '60—100' },
  { id: 'spo2', label: 'SpO2', unit: '%', value: '98', icon: Waves, color: '#62d1c0', data: [97, 98, 97, 98, 99, 98, 98, 98], normal: '95—100' },
  { id: 'pressure', label: 'Pressão Arterial', unit: 'mmHg', value: '118/76', icon: Gauge, color: '#e5bd70', data: [116, 121, 119, 118, 120, 117, 118, 118], normal: '90—140' },
  { id: 'temp', label: 'Temperatura Corporal', unit: '°C', value: '36.7', icon: Thermometer, color: '#9aa9f7', data: [36.5, 36.6, 36.7, 36.8, 36.7, 36.7, 36.6, 36.7], normal: '36.1—37.2' },
]

export function VitalSignsGrid({ mission, crew }) {
  const multiplier = mission.id === 'transit' ? 1.08 : mission.id === 'lunar' ? 1.03 : 1
  const vitals = baseVitals.map((item) => ({ ...item, data: item.data.map((value) => Number((value * multiplier).toFixed(2))) }))
  const dose = mission.id === 'orbit' ? '0.42' : mission.id === 'transit' ? '2.87' : mission.id === 'lunar' ? '1.64' : '1.91'

  return <div className="grid gap-5 sm:grid-cols-2"><div className="col-span-full flex items-center justify-between"><div><p className="eyebrow"><Activity size={13} /> SINAIS VITAIS</p><h2 className="panel-title">Telemetria em tempo real</h2></div><div className="text-right"><p className="text-[10px] uppercase tracking-widest text-slate-500">Tripulante</p><p className="text-xs text-slate-300">{crew.name}</p></div></div>{vitals.map((vital) => <VitalCard key={vital.id} vital={vital} mission={mission} />)}<RadiationCard mission={mission} dose={dose} /></div>
}

function VitalCard({ vital, mission }) {
  const Icon = vital.icon
  return <article className="vital-card"><div className="flex items-start justify-between"><div className="icon-tile" style={{ color: vital.color, backgroundColor: `${vital.color}16` }}><Icon size={17} /></div><span className="normal-pill">NORMAL · {vital.normal}</span></div><div className="mt-4 flex items-end justify-between"><div><p className="text-xs text-slate-400">{vital.label}</p><p className="mt-1 font-mono text-3xl tracking-tight text-white">{vital.value}<span className="ml-1 text-xs text-slate-500">{vital.unit}</span></p></div><span className="trend-up">↑ 1.2%</span></div><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={vital.data.map((value, index) => ({ index, value }))}><defs><linearGradient id={`fill-${vital.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={mission.accent} stopOpacity=".35" /><stop offset="100%" stopColor={mission.accent} stopOpacity="0" /></linearGradient></defs><YAxis domain={['dataMin - 2', 'dataMax + 2']} hide /><Tooltip content={() => null} /><Area type="monotone" dataKey="value" stroke={mission.accent} fill={`url(#fill-${vital.id})`} strokeWidth={2} dot={false} /></AreaChart></ResponsiveContainer></div></article>
}

function RadiationCard({ mission, dose }) {
  const critical = mission.radiationLevel === 'critical'
  return <article className={`vital-card radiation-card sm:col-span-2 ${critical ? 'critical' : ''}`}><div className="flex items-center justify-between"><div className="flex items-center gap-3"><div className="icon-tile text-orange-300"><Activity size={17} /></div><div><p className="text-xs text-slate-400">Dose Cumulativa de Radiação</p><p className="mt-1 font-mono text-3xl text-white">{dose}<span className="ml-1 text-xs text-slate-500">mSv</span></p></div></div><div className="text-right"><span className={`normal-pill ${critical ? 'warning' : ''}`}>{critical ? 'ATENÇÃO' : 'DENTRO DO LIMITE'}</span><p className="mt-2 text-[10px] text-slate-500">Limite da fase: {critical ? '5.00' : '3.00'} mSv</p></div></div><div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-800"><div className={`h-full rounded-full ${critical ? 'bg-red-400' : 'bg-orange-300'}`} style={{ width: `${critical ? 57 : 28}%` }} /></div></article>
}
