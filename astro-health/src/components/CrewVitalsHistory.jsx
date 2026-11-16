import { useMemo, useState } from 'react'
import { Activity, AlertTriangle, ArrowDown, ArrowUp, BookOpen, ChevronDown, ChevronUp, Clipboard, Copy, Download, HeartPulse, Radiation, ShieldCheck, Thermometer, UserRound } from 'lucide-react'
import { getAllAstronautsSummary, getHistoryByAstronaut } from '../utils/vitalsHistoryStorage'

const metrics = {
  bpm: { label: 'Heart rate', unit: 'bpm', icon: HeartPulse, safe: [55, 100], decimals: 0 },
  temperature: { label: 'Temperature', unit: '°C', icon: Thermometer, safe: [36.1, 37.7], decimals: 1 },
  systolicBP: { label: 'Systolic pressure', unit: 'mmHg', icon: Activity, safe: [90, 140], decimals: 0 },
  facialStressScore: { label: 'Expression tension estimate', unit: '/10', icon: UserRound, safe: [0, 10], decimals: 1 },
}

const roles = { aurora: 'Commander', atlas: 'Flight Engineer' }
const aiAssessmentNotice = 'AI triage estimates use an experimental model trained on synthetic data and are not clinically validated. Results may be inaccurate; scores are model outputs, not calibrated clinical probabilities, diagnoses, or treatment recommendations. Review with mission medical staff.'

function formatValue(value, decimals = 0) {
  return Number(value).toFixed(decimals)
}

function statusLabel(severity) {
  if (severity === 'critical') return 'Critical'
  if (severity === 'danger') return 'Danger'
  if (severity === 'warning') return 'Warning'
  return 'Nominal'
}

function Trend({ current, previous }) {
  if (previous === undefined || current === previous) return <span className="history-trend neutral">—</span>
  const rising = current > previous
  return <span className={`history-trend ${rising ? 'rising' : 'falling'}`}>{rising ? <ArrowUp size={12} /> : <ArrowDown size={12} />}{Math.abs(current - previous).toFixed(1)}</span>
}

function copyReport(record) {
  const report = `${record.astronautName} · ${record.missionDay}\nAI triage estimate: ${record.aiDiagnosis.label} · ${record.aiDiagnosis.severity} · ${record.aiDiagnosis.confidence.toFixed(1)}% model score\nAI notice: ${aiAssessmentNotice}\nVitals: ${record.vitals.bpm} bpm, ${record.vitals.temperature.toFixed(1)} °C, ${record.vitals.systolicBP} mmHg, SpO₂ ${record.vitals.spo2}%\nExpression tension estimate: ${record.facialStressScore.toFixed(1)}/10\nAffected zone: ${record.symptoms.affectedZone}\nNotes: ${record.notes}`
  if (navigator.clipboard) navigator.clipboard.writeText(report)
}

function downloadReport(record) {
  const blob = new Blob([JSON.stringify({ ...record, aiAssessmentNotice }, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `${record.astronautId}-${record.missionDay.toLowerCase().replace(/\s+/g, '-')}-medical-report.json`
  link.click()
  URL.revokeObjectURL(url)
}

export function CrewVitalsHistory() {
  const summaries = useMemo(() => getAllAstronautsSummary(), [])
  const [selectedId, setSelectedId] = useState(summaries[0]?.astronautId || '')
  const [metricKey, setMetricKey] = useState('bpm')
  const [selectedPoint, setSelectedPoint] = useState(null)
  const [expandedId, setExpandedId] = useState(null)
  const history = useMemo(() => getHistoryByAstronaut(selectedId), [selectedId])
  const selectedSummary = summaries.find((item) => item.astronautId === selectedId)
  const metric = metrics[metricKey]
  const chartWidth = 720
  const chartHeight = 250
  const chartPadding = { left: 44, right: 18, top: 24, bottom: 36 }
  const values = history.map((record) => metricKey === 'facialStressScore' ? record.facialStressScore : record.vitals[metricKey])
  const min = Math.min(...values, metric.safe[0])
  const max = Math.max(...values, metric.safe[1])
  const range = Math.max(1, max - min)
  const points = history.map((record, index) => ({
    record,
    value: values[index],
    x: chartPadding.left + (history.length === 1 ? 0 : (index / (history.length - 1)) * (chartWidth - chartPadding.left - chartPadding.right)),
    y: chartPadding.top + (1 - (values[index] - min) / range) * (chartHeight - chartPadding.top - chartPadding.bottom),
  }))
  const line = points.map((point) => `${point.x},${point.y}`).join(' ')
  const safeTop = chartPadding.top + (1 - (metric.safe[1] - min) / range) * (chartHeight - chartPadding.top - chartPadding.bottom)
  const safeBottom = chartPadding.top + (1 - (metric.safe[0] - min) / range) * (chartHeight - chartPadding.top - chartPadding.bottom)
  const latest = history[history.length - 1]
  const previous = history[history.length - 2]

  if (!selectedSummary) return <section className="history-page"><div className="history-empty">No telemetric records available.</div></section>

  return <section className="history-page">
    <div className="history-heading"><div><p className="eyebrow"><Clipboard size={14} /> CREW VITALS ARCHIVE</p><h2>History & Medical Record</h2><p>Saved AI triage estimates and biometrics across the mission.</p></div><span className="history-sync-badge"><ShieldCheck size={14} /> Local archive synced</span></div>
    <p className="ai-disclaimer history-ai-disclaimer" role="note">{aiAssessmentNotice}</p>
    <div className="crew-history-selector">{summaries.map((summary) => <button type="button" key={summary.astronautId} className={summary.astronautId === selectedId ? 'active' : ''} onClick={() => { setSelectedId(summary.astronautId); setSelectedPoint(null); setExpandedId(null) }}><span className="history-avatar"><UserRound size={17} /></span><span><strong>{summary.astronautName}</strong><small>{roles[summary.astronautId] || 'Crew member'} · {summary.biologicalProfile} profile</small></span><b className={`history-status ${summary.latestDiagnosis.severity}`}>{statusLabel(summary.latestDiagnosis.severity)}</b></button>)}</div>
    <div className="history-kpis">
      {[
        ['bpm', 'Heart rate', latest.vitals.bpm, previous?.vitals.bpm, 'bpm'],
        ['temperature', 'Temperature', latest.vitals.temperature, previous?.vitals.temperature, '°C'],
        ['systolicBP', 'Systolic BP', latest.vitals.systolicBP, previous?.vitals.systolicBP, 'mmHg'],
        ['donkiRadiation', 'Radiation dose', latest.vitals.donkiRadiation, previous?.vitals.donkiRadiation, 'mSv'],
        ['facialStressScore', 'Expression estimate', latest.facialStressScore, previous?.facialStressScore, '/10'],
      ].map(([key, label, value, prior, unit]) => { const Icon = key === 'donkiRadiation' ? Radiation : metrics[key]?.icon || Activity; return <article className="history-kpi" key={key}><Icon size={16} /><small>{label}</small><strong>{formatValue(value, key === 'temperature' || key === 'facialStressScore' || key === 'donkiRadiation' ? 1 : 0)}<em>{unit}</em></strong><Trend current={value} previous={prior} /></article> })}
    </div>
    <article className="history-card history-chart-card"><div className="history-card-heading"><div><p className="eyebrow"><Activity size={13} /> TEMPORAL EVOLUTION · {selectedSummary.astronautName}</p><h3>Mission-day signal trend</h3></div><div className="history-metric-tabs">{Object.entries(metrics).map(([key, item]) => <button type="button" key={key} className={metricKey === key ? 'active' : ''} onClick={() => { setMetricKey(key); setSelectedPoint(null) }}>{item.label}</button>)}</div></div><details className="education-disclosure history-chart-explanation"><summary><BookOpen size={18} />What does this graph mean?</summary><p>Each point is a saved reading for the selected measure; the line connects readings across mission days. The shaded band marks the displayed reference interval, not a diagnosis. Select a point to see its exact value and date.</p></details><div className="history-chart-wrap"><svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} role="img" aria-label={`${metric.label} evolution chart`}><text x={chartPadding.left - 8} y={safeTop - 5} textAnchor="end" className="history-axis-label">{formatValue(metric.safe[1], metric.decimals)}</text><text x={chartPadding.left - 8} y={safeBottom + 13} textAnchor="end" className="history-axis-label">{formatValue(metric.safe[0], metric.decimals)}</text><rect x={chartPadding.left} y={safeTop} width={chartWidth - chartPadding.left - chartPadding.right} height={Math.max(0, safeBottom - safeTop)} className="history-safe-band" /><line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={safeTop} y2={safeTop} className="history-safe-line" /><line x1={chartPadding.left} x2={chartWidth - chartPadding.right} y1={safeBottom} y2={safeBottom} className="history-safe-line" /><polyline points={line} className="history-chart-line" fill="none" />{points.map((point) => <g key={point.record.id} onClick={() => setSelectedPoint(point.record.id)} className={`history-chart-point ${selectedPoint === point.record.id ? 'selected' : ''}`}><circle cx={point.x} cy={point.y} r="7" /><circle cx={point.x} cy={point.y} r="3" /><text x={point.x} y={chartHeight - 12} textAnchor="middle">{point.record.missionDay.replace('Sol ', '')}</text></g>)}</svg></div>{selectedPoint && <div className="history-point-detail">{(() => { const record = history.find((item) => item.id === selectedPoint); return record ? <><strong>{record.missionDay} · {formatValue(metricKey === 'facialStressScore' ? record.facialStressScore : record.vitals[metricKey], metric.decimals)} {metric.unit}</strong><span>{record.aiDiagnosis.label} · {record.timestamp.slice(0, 10)}</span></> : null })()}</div>}</article>
    <article className="history-card">
      <div className="history-card-heading"><div><p className="eyebrow"><Radiation size={13} /> AI TRIAGE ESTIMATES</p><h3>Assessment log</h3></div><span className="history-record-count">{history.length} records</span></div>
      <div className="history-timeline">{[...history].reverse().map((record) => (
        <div className={`history-timeline-item ${record.aiDiagnosis.severity}`} key={record.id}>
          <i />
          <div className="history-timeline-content">
            <button type="button" className="history-timeline-toggle" onClick={() => setExpandedId(expandedId === record.id ? null : record.id)}>
              <span>
                <small>{record.missionDay} · {new Date(record.timestamp).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })}</small>
                <strong>{record.aiDiagnosis.label}</strong>
                <em>{record.aiDiagnosis.confidence.toFixed(1)}% model score · {statusLabel(record.aiDiagnosis.severity)}</em>
              </span>
              {expandedId === record.id ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {expandedId === record.id && <div className="history-detail">
              <p>{record.notes}</p>
              <div>
                <span>Vitals <b>{record.vitals.bpm} bpm · {record.vitals.temperature.toFixed(1)} °C · {record.vitals.systolicBP} mmHg · SpO₂ {record.vitals.spo2}%</b></span>
                <span>Zone <b>{record.symptoms.affectedZone}</b></span>
                <span>Facial tension estimate <b>{record.facialStressScore.toFixed(1)}/10</b></span>
              </div>
              {record.facialStressScore >= 6 && <p className="history-incongruence"><AlertTriangle size={14} /> Elevated facial-expression index recorded</p>}
              <div className="history-detail-actions">
                <button type="button" onClick={() => copyReport(record)}><Copy size={13} /> Copy report</button>
                <button type="button" onClick={() => downloadReport(record)}><Download size={13} /> Export JSON</button>
              </div>
            </div>}
          </div>
        </div>
      ))}</div>
    </article>
  </section>
}

