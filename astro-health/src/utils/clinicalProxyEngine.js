export const demoPreFlightBaseline = [
  {
    id: 'ferritin',
    name: 'Ferritin',
    unit: 'ng/mL',
    value: 38,
  },
  {
    id: 'vitamin-b12',
    name: 'Vitamin B12',
    unit: 'pg/mL',
    value: 512,
  },
  {
    id: 'folate',
    name: 'Folate',
    unit: 'ng/mL',
    value: 8.4,
  },
  {
    id: 'homocysteine',
    name: 'Homocysteine',
    unit: 'µmol/L',
    value: 11.8,
  },
]

const missionTypesWithLabUpdateSupport = new Set(['LEO_ISS', 'ARTEMIS_ORBITAL'])

export function canUpdateNutritionalBiomarkers(missionType) {
  return missionTypesWithLabUpdateSupport.has(missionType)
}

export function getNutritionalBiomarkerReadings({ missionType, latestResults = {}, preFlightBaseline = demoPreFlightBaseline }) {
  const canUpdate = canUpdateNutritionalBiomarkers(missionType)

  return preFlightBaseline.map((biomarker) => {
    const result = canUpdate ? latestResults[biomarker.id] : null
    const hasUpdate = Number.isFinite(result?.value)
    const value = hasUpdate ? result.value : biomarker.value
    const comparison = hasUpdate
      ? compareWithPreflightBaseline({ baseline: biomarker.value, current: value })
      : null

    return {
      ...biomarker,
      baselineValue: biomarker.value,
      value,
      hasUpdate,
      updatedAt: hasUpdate ? result.recordedAt : null,
      deltaPercent: comparison?.deviationPercent ?? null,
      canUpdate,
    }
  })
}

export function compareWithPreflightBaseline({ baseline, current, kind = 'numeric' }) {
  if (kind === 'categorical') {
    if (baseline == null || current == null) {
      return { available: false, changed: false, deviationPercent: null }
    }

    return {
      available: true,
      changed: current !== baseline,
      deviationPercent: null,
    }
  }

  if (!Number.isFinite(baseline) || !Number.isFinite(current) || baseline === 0) {
    return { available: false, changed: false, deviationPercent: null }
  }

  const deviationPercent = ((current - baseline) / Math.abs(baseline)) * 100
  return {
    available: true,
    changed: deviationPercent !== 0,
    deviationPercent,
  }
}
