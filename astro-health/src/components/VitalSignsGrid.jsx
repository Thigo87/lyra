import { Area, AreaChart, ResponsiveContainer, Tooltip, YAxis } from 'recharts'
import { Activity, Brain, CheckCircle2, ChevronRight, HeartPulse, Radiation, Thermometer, Waves } from 'lucide-react'

const vitals = [
  { id: 'heart', label: 'Frequência cardíaca', value: '68', unit: 'bpm', normal: 'Zona verde: 52–100 bpm', icon: HeartPulse, data: [64, 67, 65, 69, 68, 70, 68] },
  { id: 'spo2', label: 'SpO2', value: '98.2', unit: '%', normal: 'Zona verde: 95–100%', icon: Waves, data: [97.8, 98, 98.1, 98.2, 98, 98.3, 98.2] },
  { id: 'pressure', label: 'Pressão arterial', value: '106/69', unit: 'mmHg', normal: 'Zona verde: sist. 95–132', icon: Activity, data: [104, 108, 106, 105, 107, 106, 106] },
  { id: 'temp', label: 'Temperatura corporal', value: '37.1', unit: '°C', normal: 'Zona verde: 36.5–37.8 °C', icon: Thermometer, data: [36.9, 37, 37.1, 37.1, 37.2, 37.1, 37.1] },
  { id: 'radiation', label: 'Radiação acumulada', value: '172.0', unit: 'mSv', normal: 'Zona verde: taxa ≤ 110 µSv/h', icon: Radiation, data: [158, 161, 163, 165, 168, 170, 172] },
]

export function VitalSignsGrid({ onModule, solarEvent }) {
  const radiationRate = solarEvent.active ? solarEvent.radiationRate : 80
  const radiationDose = (172 + solarEvent.addedDose).toFixed(1)
  const displayVitals = vitals.map((vital) => vital.id === 'radiation'
    ? { ...vital, value: radiationDose, data: solarEvent.active ? [172, 210, 265, 310, 350, 390, 420] : [158, 161, 163, 165, 168, 170, 172], normal: solarEvent.active ? `Zona vermelha: ${radiationRate} µSv/h` : vital.normal }
    : vital)
  return <section className="dashboard-section vitals-section"><div className="section-heading"><div><p className="eyebrow"><Activity size={13} /> BIO-MONITOR CONECTADO · LIMITES CALIBRADOS PARA ESPAÇO PROFUNDO</p><h3>Sinais vitais <span>· tempo real</span></h3></div><span className={`connected-label ${solarEvent.active ? 'critical-label' : ''}`}><span className="status-dot" /> {solarEvent.active ? `SEP ativo · ${radiationRate} µSv/h` : 'Atualização a cada 5s'}</span></div><div className="vitals-grid">{displayVitals.map((vital) => <VitalCard key={vital.id} vital={vital} />)}<article className="recalibration-card"><div className="recalibration-copy"><p className="eyebrow"><Brain size={13} /> AJUSTE AUTÔNOMO</p><h4>Recalibração automática</h4><p>As zonas verdes mudam conforme gravidade, latência e radiação do ambiente atual.</p><button type="button" className="detail-action" onClick={() => onModule('cognitive')}>Fazer check-up cognitivo <ChevronRight size={14} /></button></div><div className="quick-metrics"><span><b>Limiar trombose</b>+4% panturrilha</span><span><b>Panturrilha hoje</b>+3.3%</span><span><b>Hemoglobina</b>12.9 g/dL</span><span><b>Carreira</b>{radiationDose} de 600 mSv</span></div></article></div></section>
}

function VitalCard({ vital }) {
  const Icon = vital.icon
  return <article className="vital-card"><div className="vital-card-top"><div className="icon-tile"><Icon size={17} /></div><CheckCircle2 size={15} className="text-emerald-400" /></div><p>{vital.label}</p><strong>{vital.value}<small>{vital.unit}</small></strong><span className="vital-normal">{vital.normal}</span><div className="chart-wrap"><ResponsiveContainer width="100%" height="100%"><AreaChart data={vital.data.map((value, index) => ({ index, value }))}><defs><linearGradient id={`fill-${vital.id}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#55d6a5" stopOpacity=".32" /><stop offset="100%" stopColor="#55d6a5" stopOpacity="0" /></linearGradient></defs><YAxis domain={['dataMin - 2', 'dataMax + 2']} hide /><Tooltip content={() => null} /><Area type="monotone" dataKey="value" stroke="#55d6a5" fill={`url(#fill-${vital.id})`} strokeWidth={2} dot={false} /></AreaChart></ResponsiveContainer></div></article>
}
