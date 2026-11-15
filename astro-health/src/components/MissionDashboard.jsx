import { ArrowRight, CheckCircle2, ChevronRight, CircleAlert, FlaskConical, Gauge, Link2, Trophy } from 'lucide-react'
import { AnatomyPanel } from './AnatomyPanel'
import { VitalSignsGrid } from './VitalSignsGrid'

const zoneDetails = {
  head: { title: 'Neuro-ocular', subtitle: 'Cabeça e pescoço', risks: ['Pressão intracraniana pode aumentar', 'Alterações vestibulares e visão', 'Sono fragmentado em confinamento'], steps: ['Vista o Bio-Monitor e confirme o encaixe', 'Ancore o sensor na têmpora sem comprimir', 'Abra o protocolo neuro-ocular no tablet', 'Registre visão, equilíbrio e desconforto'] },
  chest: { title: 'Coração · pulmões · vasos', subtitle: 'Tórax e coração', risks: ['Fluidos acumulados no tórax', 'Descondicionamento cardíaco', 'Arritmias e mudança de pressão'], steps: ['Vista a Camisa Bio-Monitor sobre a pele', 'Ancore os eletrodos no tórax', 'Leia o ECG de 60 segundos no tablet', 'Confirme o sinal verde antes de remover'] },
  abdomen: { title: 'Sistema metabólico', subtitle: 'Abdômen e reprodutor', risks: ['Deslocamento de fluidos', 'Desconforto gastrointestinal', 'Alterações no metabolismo energético'], steps: ['Ajuste o sensor abdominal', 'Fique sentado e respire normalmente', 'Inicie a leitura no Bio-Analyzer', 'Registre sintomas e horário da leitura'] },
  legs: { title: 'Fluxo venoso · ossos', subtitle: 'Membros inferiores', risks: ['Estase venosa e risco de trombose', 'Perda de massa muscular', 'Redução da densidade óssea'], steps: ['Faça a ancoragem física no apoio', 'Posicione sensores nas panturrilhas', 'Complete o exercício resistido prescrito', 'Compare a leitura com o limite da missão'] },
}

export function MissionDashboard({ mission, crew, selectedZone, setSelectedZone, onModule, solarEvent, gamification }) {
  const detail = zoneDetails[selectedZone]
  return <div className="dashboard-page">
    <div className="crew-heading"><div><p className="breadcrumb">{mission.name} · {mission.context} <ChevronRight size={13} /> Dia 96</p><h2>{crew.name}</h2><p>{crew.id === 'elena' ? <button type="button" onClick={() => onModule('female')} className="inline-link">Supressão menstrual</button> : 'Perfil fisiológico nominal'} · {crew.role} · {crew.age} anos</p></div><div className="crew-state-actions"><span className={`state-badge ${solarEvent.active ? 'attention' : ''}`}><span /> Estado geral: {solarEvent.active || mission.radiationLevel === 'critical' ? 'Atenção' : 'Nominal'}</span>{solarEvent.active && <button type="button" className="preventive-button" onClick={() => onModule('female')}>Abrir protocolo preventivo</button>}</div></div>
    <div className="dashboard-readiness"><div><Trophy size={16} /><span>Nível {gamification.level} · Especialista Biomédico</span><i><em style={{ width: `${gamification.progress}%` }} /></i></div><strong>{gamification.streak} dias de streak</strong></div>
    <section className="dashboard-section"><div className="section-heading"><div><p className="eyebrow"><Gauge size={13} /> MONITORAMENTO ESPACIAL</p><h3>Mapa corporal <span>· Toque em um ponto</span></h3></div><span className="connected-label"><Link2 size={13} /> BodyChart conectado</span></div>
      <div className="body-detail-grid"><AnatomyPanel mission={mission} selectedZone={selectedZone} setSelectedZone={setSelectedZone} crew={crew} /><article className="detail-card"><div className="detail-card-top"><div><p className="eyebrow"><FlaskConical size={13} /> REGIÃO SELECIONADA</p><h3>{detail.title}</h3><p>{detail.subtitle}</p></div><span className="nominal-badge"><CheckCircle2 size={13} /> Nominal</span></div><div className="detail-block"><h4>Riscos espaciais nesta região</h4><ul>{detail.risks.map((risk) => <li key={risk}><CircleAlert size={14} />{risk}</li>)}</ul></div><div className="detail-block"><h4>Autoavaliação · Camisa Bio-Monitor</h4><ol>{detail.steps.map((step, index) => <li key={step}><b>{index + 1}</b><span>{step}</span></li>)}</ol></div><button type="button" className="detail-action" onClick={() => onModule('cognitive')}>Abrir Bio-Analyzer <ArrowRight size={15} /></button></article></div>
    </section>
    <VitalSignsGrid mission={mission} crew={crew} onModule={onModule} solarEvent={solarEvent} />
  </div>
}
