import { useState } from 'react'
import { getNutritionalBiomarkerReadings } from '../utils/clinicalProxyEngine'

const missionProfileLabels = {
  LEO_ISS: 'Low Earth orbit · laboratory update profile',
  ARTEMIS_ORBITAL: 'Artemis orbital · laboratory update profile',
  MARS_TRANSIT: 'Mars transit · pre-flight history profile',
  DEEP_SPACE: 'Deep space · pre-flight history profile',
  ARTEMIS_SURFACE: 'Artemis surface · pre-flight history profile',
}

export function NutritionalBiomarkerPanel({ missionType, latestResults = {}, onRecordLabResult }) {
  const [draftValues, setDraftValues] = useState({})
  const readings = getNutritionalBiomarkerReadings({ missionType, latestResults })
  const canUpdate = readings[0]?.canUpdate === true

  const recordResult = (biomarkerId) => {
    const rawValue = draftValues[biomarkerId]
    const value = Number(rawValue)
    if (rawValue === '' || !Number.isFinite(value) || value < 0) return
    onRecordLabResult?.(biomarkerId, value)
    setDraftValues((current) => ({ ...current, [biomarkerId]: '' }))
  }

  return <article className="proxy-biomarkers-panel nutritional-biomarkers-panel">
    <div className="proxy-panel-heading">
      <div>
        <p className="condition-card-kicker">Nutritional and hematologic records</p>
        <h4>Micronutrient biomarkers</h4>
      </div>
      <span className="proxy-coverage-badge">{canUpdate ? 'Lab updates enabled' : 'Pre-flight baseline only'}</span>
    </div>
    <p className="proxy-panel-note">{missionProfileLabels[missionType] || missionProfileLabels.DEEP_SPACE}. Values are the Lyra demo profile's sample pre-flight records, not a connected medical record. Entered updates are labeled separately and compared with the Earth baseline.</p>
    <div className="proxy-biomarker-grid">
      {readings.map((biomarker) => {
        const draftValue = draftValues[biomarker.id] ?? ''
        const canSubmit = draftValue !== '' && Number.isFinite(Number(draftValue)) && Number(draftValue) >= 0
        return <div className="proxy-biomarker" key={biomarker.id}>
          <strong>{biomarker.name}</strong>
          <span className="biomarker-record-source">{biomarker.hasUpdate ? 'Operator-entered flight lab update' : 'Pre-flight baseline (Earth · demo profile)'}</span>
          <div className="biomarker-current-value">
            <span>{biomarker.hasUpdate ? 'Latest result' : 'Recorded value'}</span>
            <strong>{formatValue(biomarker.value)} <small>{biomarker.unit}</small></strong>
          </div>
          {biomarker.canUpdate && <div className="biomarker-baseline-comparison">
            <span>Earth baseline</span>
            <strong>{formatValue(biomarker.baselineValue)} {biomarker.unit}</strong>
            {biomarker.hasUpdate && <><span>Change from baseline</span><strong>{formatPercent(biomarker.deltaPercent)}</strong></>}
          </div>}
          {biomarker.canUpdate && <div className="biomarker-update-control">
            <label htmlFor={`lab-update-${biomarker.id}`}>New laboratory result</label>
            <div>
              <input
                id={`lab-update-${biomarker.id}`}
                type="number"
                min="0"
                step="any"
                inputMode="decimal"
                value={draftValue}
                onChange={(event) => setDraftValues((current) => ({ ...current, [biomarker.id]: event.target.value }))}
              />
              <button type="button" disabled={!canSubmit} onClick={() => recordResult(biomarker.id)}>Record update</button>
            </div>
          </div>}
          {biomarker.hasUpdate && biomarker.updatedAt && <small className="biomarker-updated-at">Entered {new Date(biomarker.updatedAt).toLocaleString('en-US')}</small>}
        </div>
      })}
    </div>
    <p className="proxy-panel-note biomarker-safety-note">Telemetry and historical comparison only · no diagnosis or medication/supplement recommendation.</p>
  </article>
}

function formatValue(value) {
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)
}

function formatPercent(value) {
  const sign = value > 0 ? '+' : ''
  return `${sign}${value.toFixed(1)}%`
}
