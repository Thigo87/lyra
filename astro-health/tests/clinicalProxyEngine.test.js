import assert from 'node:assert/strict'
import test from 'node:test'
import {
  canUpdateNutritionalBiomarkers,
  compareWithPreflightBaseline,
  demoPreFlightBaseline,
  getNutritionalBiomarkerReadings,
} from '../src/utils/clinicalProxyEngine.js'
import { missions } from '../src/data/missionData.js'

test('preflight baseline contains concrete demonstration values and units', () => {
  assert.deepEqual(
    demoPreFlightBaseline.map(({ id }) => id),
    ['ferritin', 'vitamin-b12', 'folate', 'homocysteine'],
  )
  assert.ok(demoPreFlightBaseline.every(({ value, unit }) => (
    Number.isFinite(value) && typeof unit === 'string'
  )))
})

test('mission selections carry an explicit operational lab-support profile', () => {
  assert.deepEqual(Object.fromEntries(missions.map(({ id, missionType }) => [id, missionType])), {
    orbit: 'LEO_ISS',
    transit: 'MARS_TRANSIT',
    'artemis-orbital': 'ARTEMIS_ORBITAL',
    lunar: 'ARTEMIS_SURFACE',
    mars: 'DEEP_SPACE',
  })
})

test('deep-space profiles show only the preflight baseline even if a flight result exists', () => {
  const readings = getNutritionalBiomarkerReadings({
    missionType: 'MARS_TRANSIT',
    latestResults: { ferritin: { value: 52, recordedAt: '2026-01-02T03:04:05.000Z' } },
  })

  assert.equal(readings[0].value, 38)
  assert.equal(readings[0].hasUpdate, false)
  assert.equal(readings[0].canUpdate, false)
  assert.equal(readings[0].deltaPercent, null)
  assert.equal(canUpdateNutritionalBiomarkers('DEEP_SPACE'), false)
})

test('supported mission profiles expose the latest entered value and baseline delta', () => {
  const readings = getNutritionalBiomarkerReadings({
    missionType: 'LEO_ISS',
    latestResults: { ferritin: { value: 45.6, recordedAt: '2026-01-02T03:04:05.000Z' } },
  })

  assert.equal(canUpdateNutritionalBiomarkers('LEO_ISS'), true)
  assert.equal(canUpdateNutritionalBiomarkers('ARTEMIS_ORBITAL'), true)
  assert.equal(canUpdateNutritionalBiomarkers('ARTEMIS_SURFACE'), false)
  assert.equal(readings[0].value, 45.6)
  assert.equal(readings[0].hasUpdate, true)
  assert.ok(Math.abs(readings[0].deltaPercent - 20) < 1e-10)
  assert.equal(readings[0].updatedAt, '2026-01-02T03:04:05.000Z')
})

test('baseline comparison reports a numeric percentage without assigning clinical meaning', () => {
  assert.deepEqual(
    compareWithPreflightBaseline({ baseline: 100, current: 90 }),
    { available: true, changed: true, deviationPercent: -10 },
  )
  assert.deepEqual(
    compareWithPreflightBaseline({ baseline: 100, current: 100 }),
    { available: true, changed: false, deviationPercent: 0 },
  )
})

test('baseline comparison leaves categorical changes unpercentaged', () => {
  assert.deepEqual(
    compareWithPreflightBaseline({ baseline: 'suppressed', current: 'menstrual', kind: 'categorical' }),
    { available: true, changed: true, deviationPercent: null },
  )
})

test('baseline comparison withholds percentage when baseline is missing or zero', () => {
  assert.equal(compareWithPreflightBaseline({ baseline: 0, current: 5 }).available, false)
  assert.equal(compareWithPreflightBaseline({ baseline: null, current: 5 }).available, false)
})
