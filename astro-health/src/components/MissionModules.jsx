import { useEffect, useState } from 'react'
import { Activity, Anchor, ArrowLeft, Brain, CircleAlert, Droplets, Dumbbell, FlaskConical, Gauge, HeartPulse, LockKeyhole, Package, Pill, Radiation, RotateCcw, Scale, ScanLine, Send, ShieldAlert, ShieldCheck, Timer, Trophy, UserRound } from 'lucide-react'

export function MissionModules({ module, crew, mission, onModule, solarEvent, onAward, onDispatch }) {
  if (module === 'female') return <FemaleHealth crew={crew} mission={mission} onModule={onModule} solarEvent={solarEvent} onAward={onAward} />
  if (module === 'emergency') return <EmergencyGuided mission={mission} crew={crew} onModule={onModule} onAward={onAward} onDispatch={onDispatch} />
  return <CognitiveReadiness onModule={onModule} onAward={onAward} />
}

function ModuleShell({ eyebrow, title, description, children, onModule }) {
  return <div className="module-page"><button type="button" className="back-link" onClick={() => onModule('dashboard')}><ArrowLeft size={14} /> Painel da tripulação</button><div className="module-hero"><p className="eyebrow">{eyebrow}</p><h2>{title}</h2><p>{description}</p></div>{children}</div>
}

function FemaleHealth({ crew, mission, onModule, solarEvent, onAward }) {
  const [protocol, setProtocol] = useState('combined')
  const [cyclePhase, setCyclePhase] = useState('luteal')
  const [cycleDay, setCycleDay] = useState(22)
  const [calfReading, setCalfReading] = useState(null)
  const [bioRecorded, setBioRecorded] = useState(false)
  const [venousCompleted, setVenousCompleted] = useState(false)
  const pharmacyIntegrity = solarEvent.active ? 76 : 94
  const calfRisk = calfReading ? (mission.gravity === '0g' ? 'Atenção · +4.6%' : 'Nominal · +2.1%') : 'Aguardando leitura'
  const protocolInfo = {
    combined: { title: 'Supressão — Pílula Combinada', detail: 'Estrogênio + Progestagênio', icon: Pill },
    implant: { title: 'Supressão — DIU Hormonal / Implante', detail: 'Sem pílulas diárias', icon: ShieldCheck },
    natural: { title: 'Ciclo Natural Ativo', detail: 'Sem supressão hormonal', icon: Droplets },
  }
  const phaseInfo = {
    menstrual: 'Menstrual · janela de sangramento e maior vigilância de ferro',
    follicular: 'Folicular · recuperação hematológica e crescimento endometrial',
    ovulatory: 'Ovulatória · pico fisiológico de energia e HRV',
    luteal: 'Lútea · temperatura basal calibrada +0.4°C',
  }
  const ProtocolIcon = protocolInfo[protocol].icon
  return <ModuleShell eyebrow="MÓDULO 02 · SAÚDE FEMININA · HRP" title="Saúde feminina" description={`Fisiologia, farmacologia espacial e telemetria de radiação para ${crew.name} durante ${mission.name}.`} onModule={onModule}>
    {solarEvent.active && <div className="cascade-alert"><CircleAlert size={18} /><div><strong>Evento SEP ativo · radiação {solarEvent.radiationRate} µSv/h</strong><p>{protocol === 'combined' ? `Integridade farmacológica reduzida para ${pharmacyIntegrity}%. Revisar cartelas protegidas no abrigo antes da próxima dose.` : protocol === 'implant' ? 'Método sem comprimidos diários: degradação radiativa de cartelas não aplicável. Manter vigilância óssea e sangramento de escape.' : 'Cruzar fadiga/náusea com a fase do ciclo e solicitar leucócitos e hemoglobina no Bio-Analyzer.'}</p></div></div>}
    <div className="female-protocol-selector"><p className="eyebrow"><ShieldCheck size={13} /> PROTOCOLO HORMONAL ATIVO</p><div className="female-protocol-grid">{Object.entries(protocolInfo).map(([id, item]) => { const Icon = item.icon; return <button type="button" key={id} className={protocol === id ? 'active' : ''} onClick={() => setProtocol(id)}><Icon size={18} /><span><strong>{item.title}</strong><small>{item.detail}</small></span></button> })}</div></div>
    <div className="female-status-strip"><div><ProtocolIcon size={17} /><span>{protocolInfo[protocol].title}<small>{protocol === 'combined' ? 'TVP + degradação farmacológica monitorados' : protocol === 'implant' ? 'DMO + sangramento de escape monitorados' : phaseInfo[cyclePhase]}</small></span></div><span className={`state-badge ${solarEvent.active ? 'attention' : ''}`}><span /> {solarEvent.active ? 'Atenção' : 'Telemetria nominal'}</span></div>
    {protocol === 'natural' && <article className="female-card cycle-card"><div className="female-card-heading"><div><p className="eyebrow"><Droplets size={13} /> CICLO NATURAL ATIVO</p><h3>{phaseInfo[cyclePhase]}</h3></div><strong>Dia {cycleDay} <small>/ 28</small></strong></div><div className="cycle-wheel"><i style={{ transform: `rotate(${((cycleDay - 1) / 28) * 360}deg)` }} /></div><input aria-label="Dia do ciclo" type="range" min="1" max="28" value={cycleDay} onChange={(event) => setCycleDay(Number(event.target.value))} /><div className="cycle-phases">{Object.entries({ menstrual: 'Menstrual', follicular: 'Folicular', ovulatory: 'Ovulatória', luteal: 'Lútea' }).map(([id, label]) => <button type="button" key={id} className={cyclePhase === id ? 'active' : ''} onClick={() => setCyclePhase(id)}>{label}</button>)}</div></article>}
    <div className="female-science-grid"><article className="female-card"><p className="eyebrow"><Gauge size={13} /> CALIBRAÇÃO DINÂMICA DE SINAIS VITAIS</p><h3>Fisiologia individual recalibrada</h3><p className="module-copy">O SENTINELA ajusta a zona verde para evitar falsos alarmes: na fase lútea, a Temperatura Basal aceita <strong>+0.4°C</strong>; a Variabilidade Cardíaca (HRV) é comparada ao baseline pessoal, não a uma média terrestre.</p><div className="calibration-values"><span><b>Temperatura basal</b>36.9–37.5°C na lútea</span><span><b>HRV de referência</b>62 ms · baseline individual</span></div></article><article className="female-card"><p className="eyebrow"><FlaskConical size={13} /> ANEMIA ESPACIAL & FERRO</p><h3>Bio-Analyzer · última leitura</h3><div className="lab-values"><span><b>12.4</b>g/dL<small>Hemoglobina</small></span><span><b>38</b>ng/mL<small>Ferritina</small></span></div><p className="module-copy">Microgravidade acelera a destruição de glóbulos vermelhos. Priorizar ferro na dieta e registrar fadiga, dispneia ou sangramento.</p><div className="eclss-note"><Droplets size={14} /> Protocolo de resíduos: separar material biológico para proteger a reciclagem de água ECLSS.</div></article></div>
    <div className="female-science-grid"><article className="female-card"><p className="eyebrow"><Scale size={13} /> TRIAGEM PREVENTIVA DE TVP</p><h3>Doppler / panturrilha comparativa</h3><p className="module-copy">Compare circunferência esquerda e direita para cruzar estase venosa com a gravidade atual: <strong>{mission.gravity}</strong>.</p><div className="calf-comparison"><span>Esquerda <b>36.2 cm</b></span><span>Direita <b>{calfReading ? '37.9 cm' : '—'}</b></span></div><button type="button" className="female-action" onClick={() => setCalfReading(true)}>{calfReading ? `Leitura concluída · ${calfRisk}` : 'Ler panturrilhas com Doppler · 2s'}</button>{calfReading && <div className="risk-result"><strong>{calfRisk}</strong><small>Índice cruzado com {mission.gravity} · repetir se houver dor, calor ou edema</small></div>}</article><article className="female-card"><p className="eyebrow"><Dumbbell size={13} /> PROTEÇÃO ÓSSEA & OVARIANA</p><h3>ARED + dose cumulativa</h3><div className="bone-meter"><div><span>Exercício resistido semanal</span><b>78%</b></div><i><em style={{ width: '78%' }} /></i><div><span>Carreira radiológica</span><b>{solarEvent.active ? '30.1%' : '28.7%'}</b></div><i className="radiation-meter"><em style={{ width: `${solarEvent.active ? 30.1 : 28.7}%` }} /></i></div><p className="module-copy">Manter ARED para DMO e registrar dose para acompanhamento ovariano. Dose acumulada: <strong>{(172 + solarEvent.addedDose).toFixed(1)} mSv</strong>.</p></article></div>
    <div className="female-actions"><button type="button" className="female-action" disabled={bioRecorded} onClick={() => { setBioRecorded(true); onAward('female-bio', 80, 'Bio-Analyzer Feminino Registrado') }}><FlaskConical size={15} />{bioRecorded ? 'Exame Bio-Analyzer registrado' : 'Registrar Exame Bio-Analyzer (+80 XP)'}</button><button type="button" className="female-action" disabled={venousCompleted} onClick={() => { setVenousCompleted(true); onAward('female-venous', 60, 'Protocolo Venoso Preventivo') }}><HeartPulse size={15} />{venousCompleted ? 'Bombeamento venoso concluído' : 'Concluir Protocolo Preventivo de Bombeamento Venoso (+60 XP)'}</button></div>
  </ModuleShell>
}

const scenarios = [
  { id: 'chest', label: 'Dor Aguda no Peito / Colapso', icon: HeartPulse },
  { id: 'thrombosis', label: 'Suspeita de Trombose', detail: 'Inchaço na Panturrilha', icon: UserRound },
  { id: 'radiation', label: 'Exposição Aguda à Radiação', icon: Radiation },
]

function ScenarioSelector({ active, onChange }) {
  return <div className="scenario-selector" aria-label="Cenário de emergência">{scenarios.map((item) => { const Icon = item.icon; return <button type="button" key={item.id} className={active === item.id ? 'active' : ''} onClick={() => onChange(item.id)}><Icon size={18} /><span>{item.label}<small>{item.detail || 'Triagem imediata'}</small></span></button> })}</div>
}

function EmergencyGuided({ mission, crew, onModule, onAward, onDispatch }) {
  const [scenario, setScenario] = useState('chest')
  const reset = (nextScenario) => setScenario(nextScenario)
  return <ModuleShell eyebrow="MÓDULO 03 · COCKPIT DE EMERGÊNCIA" title="Emergência guiada" description={`${mission.name} · protocolo de baixa carga cognitiva`} onModule={onModule}><ScenarioSelector active={scenario} onChange={reset} />{scenario === 'chest' && <ChestTraining mission={mission} onReset={() => reset('chest')} onDispatch={onDispatch} />}{scenario === 'thrombosis' && <ThrombosisTraining mission={mission} onAward={onAward} onReset={() => reset('thrombosis')} onDispatch={onDispatch} />}{scenario === 'radiation' && <RadiationTraining crew={crew} mission={mission} onAward={onAward} onReset={() => reset('radiation')} onDispatch={onDispatch} />}</ModuleShell>
}

function TrainingHeader({ label, step, complete }) {
  return <><div className="training-progress-head"><span>{label}</span><strong>{complete ? '100%' : `${step * 25}%`}</strong></div><div className="training-progress"><i style={{ width: `${complete ? 100 : step * 25}%` }} /></div><div className="training-timer">TEMPO DE RESPOSTA <b>00:{String(Math.max(0, 30 - step * 6)).padStart(2, '0')}</b></div><div className="training-stepper">{[1, 2, 3, 4].map((number) => <span className={step >= number - 1 || complete ? 'active' : ''} key={number}>{number}</span>)}</div></>
}

function ChestTraining({ mission, onReset, onDispatch }) {
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
  return <div className="training-mission"><TrainingHeader label="MISSÃO: DOR AGUDA NO PEITO" step={step} complete={sent} /><article className="training-card">{step === 0 && <><UserRound size={34} /><p className="training-kicker">PASSO 1 · ANCORAGEM</p><h3>Prenda a tripulação em 0g</h3><p>Fixe as pernas do colega e as suas nas alças da parede.</p><button type="button" className="training-action" onClick={() => { setStep(1); setCapturing(true) }}>CONFIRMAR ANCORAGEM FÍSICA EM 0g <LockKeyhole size={16} /></button></>}{step === 1 && <><Activity size={34} /><p className="training-kicker">PASSO 2 · LEITURA BIO-MONITOR</p><h3>{captured ? 'Leitura capturada' : 'Captura ao vivo'}</h3>{capturing && <><div className="capture-readout"><span>ECG</span><strong>▁▂▃▂▁▃▂▁▂▃▁</strong><span>SpO2 · 98%</span></div><div className="capture-progress"><i style={{ width: `${progress}%` }} /></div></>}{captured && <><div className="capture-result"><strong>Ritmo Sinusal Normal</strong><span>ECG estável · SpO2 98%</span></div><button type="button" className="training-next" onClick={() => setStep(2)}>CONTINUAR</button></>}</>}{step === 2 && <><CircleAlert size={34} className="cockpit-icon amber" /><p className="training-kicker">PASSO 3 · TRIAGEM DIFERENCIAL</p><h3>Qual descrição combina?</h3><div className="training-choices"><button type="button" onClick={() => { setDifferential('critical'); setStep(3) }}>SIM — Falta de ar ou dor irradiando</button><button type="button" onClick={() => { setDifferential('reflux'); setStep(3) }}>NÃO — Queimação típica de refluxo</button></div></>}{step === 3 && <><Package size={34} /><p className="training-kicker">PASSO 4 · CONDUTA FINAL</p><h3>{differential === 'reflux' ? 'Administrar Antiácido Mastigável' : 'Acionar Desfibrilador / Protocolo de Tromboembolismo'}</h3><p>{differential === 'reflux' ? 'Estoque: 42 unid. · Gaveta B2' : 'Estoque Heparina: 6 ampolas'}</p><button type="button" className="training-action" onClick={() => { setSent(true); onDispatch?.(differential === 'reflux' ? 'Dor torácica · refluxo provável' : 'Dor torácica · suspeita de evento cardíaco', 'Emergência médica') }}>EXECUTAR E TRANSMITIR TELEMETRIA <Send size={16} /></button>{sent && <div className="arrival-time">Chegada estimada na Terra em <strong>{mission.latency}</strong></div>}</>}</article><div className="cockpit-footer"><span>PROTOCOLO TREINO</span><button type="button" className="back-link" onClick={onReset}><RotateCcw size={14} /> Reiniciar</button></div></div>
}

function ThrombosisTraining({ onAward, mission, onReset, onDispatch }) {
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
  const finish = () => { setComplete(true); onAward('emergency', 150, 'Primeiro Socorrista Orbital'); onDispatch?.('Suspeita de Trombose · assimetria de panturrilha +4.6%', 'Emergência médica') }
  return <div className="training-mission"><TrainingHeader label="MISSÃO: FLUXO VENOSO" step={step} complete={complete} /><article className="training-card">{complete ? <MissionMedal title="Primeiro Socorrista Orbital" mission={mission} onReset={onReset} /> : <>{step === 0 && <><Anchor size={34} /><p className="training-kicker">PASSO 1 · ANCORAGEM</p><h3>Fixar o colega e a si mesmo em 0g</h3><button type="button" className="training-action" onClick={() => setStep(1)}>CONFIRMAR ANCORAGEM FÍSICA EM 0g <LockKeyhole size={16} /></button></>}{step === 1 && <><ScanLine size={34} /><p className="training-kicker">PASSO 2 · MEDIÇÃO</p><h3>Escanear com Bio-Monitor / Ultrassom</h3>{scanning ? <><div className="scan-progress"><i style={{ width: `${progress}%` }} /></div><small>Varredura em andamento…</small></> : measurement ? <><div className="measurement-result">+4.6% de assimetria na panturrilha</div><button type="button" className="training-next" onClick={() => setStep(2)}>CONTINUAR</button></> : <button type="button" className="training-action" onClick={() => setScanning(true)}>INICIAR VARREDURA · 2s</button>}</>}{step === 2 && <><CircleAlert size={34} /><p className="training-kicker">PASSO 3 · DECISÃO BINÁRIA</p><h3>Há sinais inflamatórios?</h3><div className="training-choices"><button type="button" onClick={() => { setDecision('yes'); setStep(3) }}>SIM — Dor e calor local detectados</button><button type="button" onClick={() => { setDecision('no'); setStep(3) }}>NÃO — Sem sinais inflamatórios</button></div></>}{step === 3 && <><Activity size={34} /><p className="training-kicker">PASSO 4 · CONDUTA FINAL</p><h3>{decision === 'yes' ? 'Acionar protocolo de tromboembolismo' : 'Registrar observação e repetir em 30 min'}</h3><button type="button" className="training-action" onClick={finish}>EXECUTAR PROTOCOLO E TRANSMITIR TELEMETRIA <Send size={16} /></button></>}</>}</article></div>
}

function RadiationTraining({ crew, mission, onAward, onReset, onDispatch }) {
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
  const finish = () => { setComplete(true); onAward('emergency-radiation', 150, 'Escudo Solar'); onDispatch?.('Exposição aguda à radiação · dose absorvida 145 mSv', 'Emergência médica') }
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
