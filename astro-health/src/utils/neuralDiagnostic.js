import model from '../data/astro_model.json'

const protocols = {
  'Estado Nominal / Estável': ['Confirm baseline', 'Acknowledge stable readings and continue the scheduled watch.', 10, 'CheckCircle2'],
  'Síndrome Neurovestibular & SANS (Neuro-ocular)': ['Stabilize posture', 'Secure yourself and keep your head still while fixing your gaze on a stable reference.', 30, 'Anchor'],
  'Intolerância Ortostática & Hipotensão': ['Lower safely', 'Sit or lie down, elevate the legs if safe, and avoid a rapid stand.', 30, 'ArrowDown'],
  'Alerta Tromboembólico Venoso (VTE / Estase Jugular)': ['Stop exertion', 'Keep the affected limb or neck still and notify the medical officer immediately.', 30, 'ShieldAlert'],
  'Infecção do Trato Urinário (ITU) / Desconforto Pélvico': ['Log symptoms', 'Record pain, urinary changes, fever, and cycle context in the medical log.', 30, 'ClipboardCheck'],
  'Anemia Espacial & Fadiga Endócrina': ['Conserve energy', 'Stop strenuous activity, secure hydration, and move to a monitored rest position.', 60, 'Battery'],
  'Exposição Aguda à Radiação Solar (Evento DONKI)': ['Move to shelter', 'Proceed calmly to the storm shelter and minimize exposure time.', 30, 'ShieldAlert'],
  'Emergência Cardiorrespiratória Crítica': ['Call emergency', 'Use the emergency channel and summon the nearest trained crewmate now.', 10, 'Siren'],
}

const severityByLabel = {
  'Estado Nominal / Estável': 'nominal',
  'Síndrome Neurovestibular & SANS (Neuro-ocular)': 'warning',
  'Intolerância Ortostática & Hipotensão': 'danger',
  'Alerta Tromboembólico Venoso (VTE / Estase Jugular)': 'danger',
  'Infecção do Trato Urinário (ITU) / Desconforto Pélvico': 'warning',
  'Anemia Espacial & Fadiga Endócrina': 'warning',
  'Exposição Aguda à Radiação Solar (Evento DONKI)': 'danger',
  'Emergência Cardiorrespiratória Crítica': 'critical',
}

const cueByLabel = {
  'Estado Nominal / Estável': ['full', 'slow', '#10b981'],
  'Síndrome Neurovestibular & SANS (Neuro-ocular)': ['head', 'medium', '#f59e0b'],
  'Intolerância Ortostática & Hipotensão': ['limbs', 'fast', '#f97316'],
  'Alerta Tromboembólico Venoso (VTE / Estase Jugular)': ['limbs', 'fast', '#fb7185'],
  'Infecção do Trato Urinário (ITU) / Desconforto Pélvico': ['abdomen', 'medium', '#f59e0b'],
  'Anemia Espacial & Fadiga Endócrina': ['full', 'medium', '#f59e0b'],
  'Exposição Aguda à Radiação Solar (Evento DONKI)': ['full', 'medium', '#f97316'],
  'Emergência Cardiorrespiratória Crítica': ['chest', 'fast', '#ef4444'],
}

function softmax(values) {
  const maximum = Math.max(...values)
  const exponentials = values.map((value) => Math.exp(value - maximum))
  const total = exponentials.reduce((sum, value) => sum + value, 0)
  return exponentials.map((value) => value / total)
}

export function runDiagnostic(featuresArray) {
  if (!Array.isArray(featuresArray) || featuresArray.length !== model.feature_names.length) {
    throw new Error(`Emergency triage requires exactly ${model.feature_names.length} numeric features.`)
  }
  if (featuresArray.some((value) => typeof value !== 'number' || !Number.isFinite(value))) {
    throw new Error('Emergency triage features must be finite numbers.')
  }
  const normalized = featuresArray.map((value, index) => {
    const range = model.max_val[index] - model.min_val[index]
    return Math.min(1, Math.max(0, (value - model.min_val[index]) / (range || 1)))
  })
  const hidden = model.b1.map((bias, index) => Math.max(0, normalized.reduce((sum, value, featureIndex) => sum + value * model.w1[featureIndex][index], bias)))
  const probabilities = softmax(model.b2.map((bias, index) => hidden.reduce((sum, value, hiddenIndex) => sum + value * model.w2[hiddenIndex][index], bias)))
  const ranked = probabilities.map((probability, index) => ({ label: model.labels[index], percentage: Number((probability * 100).toFixed(1)) })).sort((a, b) => b.percentage - a.percentage)
  const winner = ranked[0]
  const [highlightZone, pulseSpeed, statusColor] = cueByLabel[winner.label]
  const protocol = protocols[winner.label]
  const facialStress = featuresArray[12]
  const declaredStress = (featuresArray[0] + featuresArray[1] + featuresArray[2] + featuresArray[3] + featuresArray[4] + featuresArray[5]) / 6
  const facialWarning = facialStress >= 6 && declaredStress <= 3

  return {
    diagnosis: { label: winner.label, confidence: winner.percentage, severity: severityByLabel[winner.label] },
    probabilities: ranked,
    avatarCue: { highlightZone, pulseSpeed, statusColor },
    facialWarning,
    justification: facialWarning
      ? `Facial telemetry detected elevated ocular, brow, or jaw tension (${facialStress.toFixed(1)}/10) despite low declared symptom intensity.`
      : `Facial telemetry is consistent with the declared symptom profile (${facialStress.toFixed(1)}/10).`,
    actionSteps: Array.from({ length: 4 }, (_, index) => {
      const [title, instruction, durationSeconds, iconName] = index === 0 ? protocol : [
        ['Monitor telemetry', 'Keep the Bio-Band active and watch for worsening readings.', 30, 'Activity'],
        ['Report to crew', 'Transmit the symptom summary and current vital signs to mission control.', 30, 'Radio'],
        ['Reassess safely', 'Repeat the focused check before resuming movement or mission tasks.', 60, 'ScanLine'],
      ][index - 1]
      return { stepNumber: index + 1, title, instruction, durationSeconds, iconName }
    }),
  }
}
