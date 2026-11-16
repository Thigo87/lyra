import model from '../data/astro_model.json'

const protocols = {
  'Nominal / Stable Condition': ['Confirm baseline', 'Acknowledge stable readings and continue the scheduled watch.', 10, 'CheckCircle2'],
  'Spaceflight Neurovestibular & SANS Syndrome': ['Stabilize posture', 'Secure yourself and keep your head still while fixing your gaze on a stable reference.', 30, 'Anchor'],
  'Orthostatic Intolerance & Hypotension': ['Lower safely', 'Sit or lie down, elevate the legs if safe, and avoid a rapid stand.', 30, 'ArrowDown'],
  'Venous Thromboembolism Alert (VTE / Jugular Stasis)': ['Stop exertion', 'Keep the affected limb or neck still and notify the medical officer immediately.', 30, 'ShieldAlert'],
  'Urinary Tract Infection (UTI) / Pelvic Discomfort': ['Log symptoms', 'Record pain, urinary changes, fever, and cycle context in the medical log.', 30, 'ClipboardCheck'],
  'Spaceflight Anemia & Endocrine Fatigue': ['Conserve energy', 'Stop strenuous activity, secure hydration, and move to a monitored rest position.', 60, 'Battery'],
  'Acute Solar Radiation Exposure (DONKI Event)': ['Move to shelter', 'Proceed calmly to the storm shelter and minimize exposure time.', 30, 'ShieldAlert'],
  'Critical Cardiorespiratory Emergency': ['Call emergency', 'Use the emergency channel and summon the nearest trained crewmate now.', 10, 'Siren'],
}

const severityByLabel = {
  'Nominal / Stable Condition': 'nominal',
  'Spaceflight Neurovestibular & SANS Syndrome': 'warning',
  'Orthostatic Intolerance & Hypotension': 'danger',
  'Venous Thromboembolism Alert (VTE / Jugular Stasis)': 'danger',
  'Urinary Tract Infection (UTI) / Pelvic Discomfort': 'warning',
  'Spaceflight Anemia & Endocrine Fatigue': 'warning',
  'Acute Solar Radiation Exposure (DONKI Event)': 'danger',
  'Critical Cardiorespiratory Emergency': 'critical',
}

const cueByLabel = {
  'Nominal / Stable Condition': ['full', 'slow', '#10b981'],
  'Spaceflight Neurovestibular & SANS Syndrome': ['head', 'medium', '#f59e0b'],
  'Orthostatic Intolerance & Hypotension': ['limbs', 'fast', '#f97316'],
  'Venous Thromboembolism Alert (VTE / Jugular Stasis)': ['limbs', 'fast', '#fb7185'],
  'Urinary Tract Infection (UTI) / Pelvic Discomfort': ['abdomen', 'medium', '#f59e0b'],
  'Spaceflight Anemia & Endocrine Fatigue': ['full', 'medium', '#f59e0b'],
  'Acute Solar Radiation Exposure (DONKI Event)': ['full', 'medium', '#f97316'],
  'Critical Cardiorespiratory Emergency': ['chest', 'fast', '#ef4444'],
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
  const facialStressScore = featuresArray[12]
  const declaredSymptomAverage = featuresArray.slice(0, 6).reduce((sum, value) => sum + value, 0) / 6
  const incongruenceDetected = facialStressScore >= 6.5 && declaredSymptomAverage <= 3
  const refinedProbabilities = [...probabilities]
  if (incongruenceDetected) {
    const nominalIndex = model.labels.indexOf('Nominal / Stable Condition')
    const clinicalCandidate = probabilities.reduce((bestIndex, probability, index) => (
      index !== nominalIndex && probability > probabilities[bestIndex] ? index : bestIndex
    ), nominalIndex === 0 ? 1 : 0)
    refinedProbabilities[nominalIndex] *= 0.25
    refinedProbabilities[clinicalCandidate] *= 1.15
    const total = refinedProbabilities.reduce((sum, probability) => sum + probability, 0)
    for (let index = 0; index < refinedProbabilities.length; index += 1) refinedProbabilities[index] /= total
  }
  const ranked = refinedProbabilities.map((probability, index) => ({ label: model.labels[index], percentage: Number((probability * 100).toFixed(1)) })).sort((a, b) => b.percentage - a.percentage)
  const winner = ranked[0]
  const [highlightZone, pulseSpeed, statusColor] = cueByLabel[winner.label]
  const protocol = protocols[winner.label]
  const facialTelemetryNote = incongruenceDetected
    ? `The experimental facial-expression signal (${facialStressScore.toFixed(1)}/10) differs from the low self-reported symptom average; review both directly. This difference is not evidence of under-reporting.`
    : ''
  const baseActionSteps = Array.from({ length: 4 }, (_, index) => {
    const [title, instruction, durationSeconds, iconName] = index === 0 ? protocol : [
      ['Monitor telemetry', 'Keep the Bio-Band active and watch for worsening readings.', 30, 'Activity'],
      ['Report to crew', 'Transmit the symptom summary and current vital signs to mission control.', 30, 'Radio'],
      ['Reassess safely', 'Repeat the focused check before resuming movement or mission tasks.', 60, 'ScanLine'],
    ][index - 1]
    return { stepNumber: index + 1, title, instruction, durationSeconds, iconName }
  })
  const actionSteps = incongruenceDetected
    ? [
      { stepNumber: 1, title: 'Verify objective vitals', instruction: 'Verify objective vital signs before clearing the crewmate for mission activities.', durationSeconds: 60, iconName: 'Activity' },
      ...baseActionSteps.map((step) => ({ ...step, stepNumber: step.stepNumber + 1 })),
    ]
    : baseActionSteps

  return {
    diagnosis: { label: winner.label, confidence: winner.percentage, severity: severityByLabel[winner.label] },
    probabilities: ranked,
    avatarCue: { highlightZone, pulseSpeed, statusColor },
    facialStressScore,
    declaredSymptomAverage,
    incongruenceDetected,
    facialWarning: incongruenceDetected,
    facialTelemetryNote,
    justification: incongruenceDetected
      ? facialTelemetryNote
      : `No mismatch was flagged between the experimental facial-expression signal (${facialStressScore.toFixed(1)}/10) and the self-reported symptom average.`,
    actionSteps,
  }
}
