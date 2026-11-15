import { useEffect, useState } from 'react'
import { Activity, Anchor, ArrowLeft, Brain, CircleAlert, HeartPulse, LockKeyhole, Package, Radiation, RotateCcw, ScanLine, Send, ShieldAlert, Timer, Trophy, UserRound } from 'lucide-react'

export function MissionModules({ module, crew, mission, onModule, solarEvent, onAward }) {
  if (module === 'female') return <FemaleHealth crew={crew} mission={mission} onModule={onModule} solarEvent={solarEvent} />
  if (module === 'emergency') return <EmergencyGuided mission={mission} crew={crew} onModule={onModule} onAward={onAward} />
  return <CognitiveReadiness onModule={onModule} onAward={onAward} />
}

function ModuleShell({ eyebrow, title, description, children, onModule }) {
  return <div className="module-page"><button type="button" className="back-link" onClick={() => onModule('dashboard')}><ArrowLeft size={14} /> Painel da tripulação</button><div className="module-hero"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div>{children}</div>
}

function FemaleHealth({ crew, mission, onModule, solarEvent }) {
  const [suppression, setSuppression] = useState(true)
  return <ModuleShell eyebrow="MÓDULO 02 · SAÚDE FEMININA" title="Saúde feminina" description={`Acompanhamento de saúde reprodutiva de ${crew.name} durante ${mission.name}.`} onModule={onModule}><div className="module-toggle"><button type="button" className={suppression ? 'active' : ''} onClick={() => setSuppression(true)}>Supressão menstrual <small>Contraceptivo contínuo</small></button><button type="button" className={!suppression ? 'active' : ''} onClick={() => setSuppression(false)}>Ciclo natural ativo <small>Acompanhamento por fase</small></button></div>{solarEvent.active && <div className="cascade-alert"><CircleAlert size={18} /><div><strong>Evento SEP ativo · radiação {solarEvent.radiationRate} µSv/h</strong><p>{suppression ? 'Revisar estoque de contraceptivos protegidos no abrigo: degradação radiativa estimada em 18%.' : 'Alerta cruzado: diferenciar fadiga/náusea da fase menstrual de síndrome aguda por radiação; realizar exame imediato de leucócitos e hemoglobina no Bio-Analyzer.'}</p></div></div>}<div className="module-grid"><article className="module-card"><p className="eyebrow"><HeartPulse size={14} /> STATUS DO PROTOCOLO</p><h3>{suppression ? 'Supressão menstrual monitorada' : 'Fase folicular · Dia 12'}</h3><span className={`state-badge ${solarEvent.active ? 'attention' : ''}`}><span /> {solarEvent.active ? 'Atenção' : suppression ? 'Nominal' : 'Atenção'}</span>{suppression && <div className="pharmacy-meter"><span>Integridade da Farmácia de Bordo</span><b>{solarEvent.active ? '76%' : '94%'}</b><i><em style={{ width: `${solarEvent.active ? 76 : 94}%` }} /></i></div>}<p className="module-copy">{suppression ? 'Monitorando risco de trombose em 0g, adesão ao contraceptivo e degradação da farmácia por radiação acumulada/DONKI.' : 'Monitorando ferritina e sinais de anemia espacial, diferenciando sintomas menstruais de radiação aguda.'}</p></article><article className="module-card"><p className="eyebrow"><CircleAlert size={14} /> PRÓXIMAS VERIFICAÇÕES</p><ul className="check-list"><li>Bio-Monitor de panturrilha · hoje 18:00</li><li>Hemoglobina: 12.9 g/dL · nominal</li><li>Farmácia de bordo · validade revisada</li></ul></article></div></ModuleShell>
}

const scenarios = [
  { id: 'chest', label: 'Dor Aguda no Peito / Colapso', icon: HeartPulse },
  { id: 'thrombosis', label: 'Suspeita de Trombose', detail: 'Inchaço na Panturrilha', icon: UserRound },
  { id: 'radiation', label: 'Exposição Aguda à Radiação', icon: Radiation },
]

function ScenarioSelector({ active, onChange }) {
  return <div className="scenario-selector" aria-label="Cenário de emergência">{scenarios.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={active === item.id ? 'active' : ''} onClick={() => onChange(item.id)}><Icon size={18} /><span>{item.label}<small>{item.detail || 'Triagem imediata'}</small></span></button> })}</div>
}

function EmergencyGuided({ mission, crew, onModule, onAward }) {
  const [scenario, setScenario] = useState('chest')
  const reset = (nextScenario) => setScenario(nextScenario)
  return <ModuleShell eyebrow="MÓDULO 03 · COCKPIT DE EMERGÊNCIA" title="Emergência guiada" description={`${mission.name} · protocolo de baixa carga cognitiva`} onModule={onModule}><ScenarioSelector active={scenario} onChange={reset} />{scenario === 'chest' && <ChestTraining mission={mission} onReset={() => reset('chest')} />}{scenario === 'thrombosis' && <ThrombosisTraining mission={mission} onAward={onAward} onReset={() => reset('thrombosis')} />}{scenario === 'radiation' && <RadiationTraining crew={crew} mission={mission} onAward={onAward} onReset={() => reset('radiation')} />}</ModuleShell>
}

function TrainingHeader({ label, step, complete }) {
  return <><div className="training-progress-head"><span>{label}</span><strong>{complete ? '100%' : `${step * 25}%`}</strong></div><div className="training-progress"><i style={{ width: `${complete ? 100 : step * 25}%` }} /></div><div className="training-timer">TEMPO DE RESPOSTA <b>00:{String(Math.max(0, 30 - step * 6)).padStart(2, '0')}</b></div><div className="training-stepper">{[1, 2, 3, 4].map((number) => <span className={step >= number - 1 || complete ? 'active' : ''} key={number}>{number}</span>)}</div></>
}

function ChestTraining({ mission, onReset }) {
  const [step, setStep] = useState(0)
  const [capturing, setCapturing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [captured, setCaptured] = useState(false)
  const [differential, setDifferential] = useState(null)
  const [sent, setSent] = useState(false)
  useEffect(() => {
    if (!capturing) return undefined
    const started = Date.now()
    const timer = window.setInterval(() => { const value = Math.min(100, ((Date.now() - started) / 3000) * 100); setProgress(value); if (value === 100) { window.clearInterval(timer); setCapturing(false); setCaptured(true) } }, 80)
    return () => window.clearInterval(timer)
  }, [capturing])
  return <div className="training-mission"><TrainingHeader label="MISSÃO: DOR AGUDA NO PEITO" step={step} complete={sent} /><article className="training-card">{step === 0 && <><UserRound size={34} /><p className="training-kicker">PASSO 1 · ANCORAGEM</p><h3>Prenda a tripulação em 0g</h3><p>Fixe as pernas do colega e as suas nas alças da parede.</p><button type="button" className="training-action" onClick={() => { setStep(1); setCapturing(true) }}>CONFIRMAR ANCORAGEM FÍSICA EM 0g <LockKeyhole size={16} /></button></>}{step === 1 && <><Activity size={34} /><p className="training-kicker">PASSO 2 · LEITURA BIO-MONITOR</p><h3>{captured ? 'Leitura capturada' : 'Captura ao vivo'}</h3>{capturing && <><div className="capture-readout"><span>ECG</span><strong>▁▂▃▂▁▃▂▁▂▃▁</strong><span>SpO2 · 98%</span></div><div className="capture-progress"><i style={{ width: `${progress}%` }} /></div></>}{captured && <><div className="capture-result"><strong>Ritmo Sinusal Normal</strong><span>ECG estável · SpO2 98%</span></div><button type="button" className="training-next" onClick={() => setStep(2)}>CONTINUAR</button></>}</>}{step === 2 && <><CircleAlert size={34} className="cockpit-icon amber" /><p className="training-kicker">PASSO 3 · TRIAGEM DIFERENCIAL</p><h3>Qual descrição combina?</h3><div className="training-choices"><button type="button" onClick={() => { setDifferential('critical'); setStep(3) }}>SIM — Falta de ar ou dor irradiando</button><button type="button" onClick={() => { setDifferential('reflux'); setStep(3) }}>NÃO — Queimação típica de refluxo</button></div></>}{step === 3 && <><Package size={34} /><p className="training-kicker">PASSO 4 · CONDUTA FINAL</p><h3>{differential === 'reflux' ? 'Administrar Antiácido Mastigável' : 'Acionar Desfibrilador / Protocolo de Tromboembolismo'}</h3><p>{differential === 'reflux' ? 'Estoque: 42 unid. · Gaveta B2' : 'Estoque Heparina: 6 ampolas'}</p><button type="button" className="training-action" onClick={() => setSent(true)}>EXECUTAR E TRANSMITIR TELEMETRIA <Send size={16} /></button>{sent && <div className="arrival-time">Chegada estimada na Terra em <strong>{mission.latency}</strong></div>}</>}</article><div className="cockpit-footer"><span>PROTOCOLO TREINO</span><button type="button" className="back-link" onClick={onReset}><RotateCcw size={14} /> Reiniciar</button></div></div>
}

function ThrombosisTraining({ onAward, mission, onReset }) {
  const [step, setStep] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [measurement, setMeasurement] = useState(false)
  const [decision, setDecision] = useState(null)
  const [complete, setComplete] = useState(false)
  useEffect(() => {
    if (!scanning) return undefined
    const started = Date.now()
    const timer = window.setInterval(() => { const value = Math.min(100, ((Date.now() - started) / 2000) * 100); setProgress(value); if (value === 100) { window.clearInterval(timer); setScanning(false); setMeasurement(true) } }, 80)
    return () => window.clearInterval(timer)
  }, [scanning])
  const finish = () => { setComplete(true); onAward('emergency', 150, 'Primeiro Socorrista Orbital') }
  return <div className="training-mission"><TrainingHeader label="MISSÃO: FLUXO VENOSO" step={step} complete={complete} /><article className="training-card">{complete ? <MissionMedal title="Primeiro Socorrista Orbital" mission={mission} onReset={onReset} /> : <>{step === 0 && <><Anchor size={34} /><p className="training-kicker">PASSO 1 · ANCORAGEM</p><h3>Fixar o colega e a si mesmo em 0g</h3><button type="button" className="training-action" onClick={() => setStep(1)}>CONFIRMAR ANCORAGEM FÍSICA EM 0g <LockKeyhole size={16} /></button></>}{step === 1 && <><ScanLine size={34} /><p className="training-kicker">PASSO 2 · MEDIÇÃO</p><h3>Escanear com Bio-Monitor / Ultrassom</h3>{scanning ? <><div className="scan-progress"><i style={{ width: `${progress}%` }} /></div><small>Varredura em andamento…</small></> : measurement ? <><div className="measurement-result">+4.6% de assimetria na panturrilha</div><button type="button" className="training-next" onClick={() => setStep(2)}>CONTINUAR</button></> : <button type="button" className="training-action" onClick={() => setScanning(true)}>INICIAR VARREDURA · 2s</button>}</>}{step === 2 && <><CircleAlert size={34} /><p className="training-kicker">PASSO 3 · DECISÃO BINÁRIA</p><h3>Há sinais inflamatórios?</h3><div className="training-choices"><button type="button" onClick={() => { setDecision('yes'); setStep(3) }}>SIM — Dor e calor local detectados</button><button type="button" onClick={() => { setDecision('no'); setStep(3) }}>NÃO — Sem sinais inflamatórios</button></div></>}{step === 3 && <><Activity size={34} /><p className="training-kicker">PASSO 4 · CONDUTA FINAL</p><h3>{decision === 'yes' ? 'Acionar protocolo de tromboembolismo' : 'Registrar observação e repetir em 30 min'}</h3><button type="button" className="training-action" onClick={finish}>EXECUTAR PROTOCOLO E TRANSMITIR TELEMETRIA <Send size={16} /></button></>}</>}</article></div>
}

function RadiationTraining({ crew, mission, onAward, onReset }) {
  const [step, setStep] = useState(0)
  const [scanning, setScanning] = useState(false)
  const [progress, setProgress] = useState(0)
  const [dose, setDose] = useState(false)
  const [triage, setTriage] = useState(null)
  const [complete, setComplete] = useState(false)
  useEffect(() => {
    if (!scanning) return undefined
    const started = Date.now()
    const timer = window.setInterval(() => { const value = Math.min(100, ((Date.now() - started) / 2000) * 100); setProgress(value); if (value === 100) { window.clearInterval(timer); setScanning(false); setDose(true) } }, 80)
    return () => window.clearInterval(timer)
  }, [scanning])
  const finish = () => { setComplete(true); onAward('emergency-radiation', 150, 'Escudo Solar') }
  return <div className="training-mission radiation-mission"><TrainingHeader label="MISSÃO: EXPOSIÇÃO AGUDA" step={step} complete={complete} /><article className="training-card">{complete ? <MissionMedal title="Escudo Solar" mission={mission} onReset={onReset} /> : <>{step === 0 && <><Radiation size={34} className="text-red-400" /><p className="training-kicker">PASSO 1 · INTERROMPER EXPOSIÇÃO</p><h3>Bloquear a fonte externa</h3><p>Feche o caminho da radiação antes de tocar no tripulante.</p><button type="button" className="training-action" onClick={() => setStep(1)}>SELAR ESCOTILHA / ABORTAR EVA <LockKeyhole size={16} /></button></>}{step === 1 && <><Anchor size={34} /><p className="training-kicker">PASSO 2 · ANCORAGEM</p><h3>Fixar a tripulação em 0g</h3><button type="button" className="training-action" onClick={() => setStep(2)}>CONFIRMAR ANCORAGEM FÍSICA EM 0g <LockKeyhole size={16} /></button></>}{step === 2 && <><ScanLine size={34} /><p className="training-kicker">PASSO 3 · DOSE ABSORVIDA</p><h3>Ler Dosímetro / Bio-Monitor</h3>{scanning && <><div className="scan-progress"><i style={{ width: `${progress}%` }} /></div><small>Leitura de dose em andamento…</small></>}{!scanning && !dose && <button type="button" className="training-action" onClick={() => setScanning(true)}>INICIAR LEITURA · 2s</button>}{dose && <><div className="measurement-result">145 mSv absorvidos no evento</div><p className="training-question">Náusea ou fadiga aguda nas últimas 2 horas?</p><div className="training-choices"><button type="button" onClick={() => setTriage('yes')}>SIM — avaliar síndrome aguda</button><button type="button" onClick={() => setTriage('no')}>NÃO — sem sintomas agudos</button></div>{crew?.id === 'elena' && <p className="profile-cross-check">Perfil feminino: cruzar náusea/fadiga com fase menstrual antes de concluir a triagem.</p>}{triage && <button type="button" className="training-next" onClick={() => setStep(3)}>CONTINUAR</button>}</>}</>}{step === 3 && <><ShieldAlert size={34} /><p className="training-kicker">PASSO 4 · ABRIGO E TELEMETRIA</p><h3>Recolhimento ao abrigo de água</h3><p>{triage === 'yes' ? 'Sintomas detectados: manter observação médica no abrigo.' : 'Sem sintomas: manter observação e repetir dose conforme protocolo.'}</p><button type="button" className="training-action" onClick={finish}>CONFIRMAR RECOLHIMENTO AO ABRIGO E TRANSMITIR PACOTE A HOUSTON <Send size={16} /></button></>}</>}</article></div>
}

function MissionMedal({ title, mission, onReset }) {
  return <div className="mission-complete"><Trophy size={43} /><p>MISSÃO CONCLUÍDA</p><h3>{title}</h3><strong>+150 XP de Prontidão Médica</strong><small>Protocolo executado e telemetria transmitida para Houston · {mission.latency}</small><button type="button" className="back-link" onClick={onReset}><RotateCcw size={14} /> Repetir missão</button></div>
}

function CognitiveReadiness({ onModule, onAward }) {
  const [started, setStarted] = useState(false)
  const [score, setScore] = useState(null)
  return <ModuleShell eyebrow="MÓDULO 04 · NASA HRP" title="Prontidão cognitiva" description="Mini-teste de 30 segundos para medir tempo de reação visual e memória espacial sem formulários subjetivos." onModule={onModule}><article className="cognitive-card"><div className="cognitive-icon"><Brain size={35} /></div><h3>{score ? `Latência de resposta: ${score} ms` : 'Teste de atenção da tripulação'}</h3><p>{score ? 'Resultado nominal. Fadiga de confinamento e excesso de CO2 não sugeridos nesta leitura.' : 'Observe os estímulos, toque no alvo e memorize a sequência. O teste inicia quando você estiver pronto.'}</p>{!started && !score && <button type="button" className="detail-action" onClick={() => { setStarted(true); window.setTimeout(() => { setScore(284); setStarted(false); onAward('cognitive', 100, 'Resposta Cognitiva Nominal') }, 1400) }}>Iniciar teste · 30s <Timer size={15} /></button>}{started && <div className="reaction-target">TOQUE AQUI</div>}{score && <button type="button" className="back-link" onClick={() => setScore(null)}>Refazer teste</button>}</article></ModuleShell>
}
