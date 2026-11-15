import { Camera, CheckCircle2, CircleAlert, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

const SCAN_DURATION_SECONDS = 10
const DIAGNOSTIC_DURATION_SECONDS = 5
const STANDARD_MODES = ['pulse', 'pupil']
const DIAGNOSTIC_MODES = ['anemia', 'calf', 'pill', 'radiation']

function normalizeMode(value, specialized) {
  const allowedModes = specialized ? DIAGNOSTIC_MODES : STANDARD_MODES
  return allowedModes.includes(value) ? value : allowedModes[0]
}

export function OpticalBioScanner({ open, initialMode = 'pulse', specialized = false, onClose, onHeartRate, onSnapshot, onDiagnostic, onRadiationSync, onRadiationBurst }) {
  const [mode, setMode] = useState(() => normalizeMode(initialMode, specialized))
  const [cameraState, setCameraState] = useState('starting')
  const [demoMode, setDemoMode] = useState(false)
  const [countdown, setCountdown] = useState(SCAN_DURATION_SECONDS)
  const [heartRate, setHeartRate] = useState(null)
  const [signalQuality, setSignalQuality] = useState(null)
  const [flash, setFlash] = useState(false)
  const [snapshot, setSnapshot] = useState(null)
  const [diagnosticProgress, setDiagnosticProgress] = useState(0)
  const [diagnosticResult, setDiagnosticResult] = useState(null)
  const [radiationBurst, setRadiationBurst] = useState(false)
  const [lightLeak, setLightLeak] = useState(false)
  const [radiationCpm, setRadiationCpm] = useState(0)
  const [doseRate, setDoseRate] = useState(0)
  const [doseSynced, setDoseSynced] = useState(false)
  const videoRef = useRef(null)
  const sampleCanvasRef = useRef(null)
  const radiationCanvasRef = useRef(null)
  const radiationViewportRef = useRef(null)
  const waveformCanvasRef = useRef(null)
  const sampleFrameRef = useRef(null)
  const streamRef = useRef(null)
  const animationRef = useRef(null)
  const samplesRef = useRef([])
  const waveformRef = useRef([])
  const scanStartedRef = useRef(0)
  const lastSampleRef = useRef(0)
  const diagnosticSamplesRef = useRef([])
  const diagnosticCompletedRef = useRef(false)
  const radiationHitsRef = useRef([])
  const cameraRequestRef = useRef(0)

  const stopCamera = () => {
    cameraRequestRef.current += 1
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = null
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    if (videoRef.current) videoRef.current.srcObject = null
  }

  const startCamera = async () => {
    stopCamera()
    const requestId = cameraRequestRef.current
    setCameraState('starting')
    setDemoMode(false)
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Camera API unavailable')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      if (requestId !== cameraRequestRef.current) {
        stream.getTracks().forEach((track) => track.stop())
        return
      }
      streamRef.current = stream
      setCameraState('live')
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
    } catch {
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) throw new Error('Camera API unavailable')
        const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        if (!fallbackStream) throw new Error('Camera permission denied')
        if (requestId !== cameraRequestRef.current) {
          fallbackStream.getTracks().forEach((track) => track.stop())
          return
        }
        streamRef.current = fallbackStream
        setCameraState('live')
        if (videoRef.current) {
          videoRef.current.srcObject = fallbackStream
          await videoRef.current.play()
        }
      } catch {
        setCameraState('demo')
        setDemoMode(true)
      }
    }
  }

  const finishPulseScan = () => {
    const samples = samplesRef.current
    const values = samples.map((sample) => sample.red)
    const mean = values.length ? values.reduce((sum, value) => sum + value, 0) / values.length : 128
    const variance = values.length ? values.reduce((sum, value) => sum + ((value - mean) ** 2), 0) / values.length : 0
    const deviation = Math.sqrt(variance)
    const threshold = mean + Math.max(2, deviation * 0.45)
    let peaks = 0
    let lastPeak = -Infinity
    for (let index = 1; index < values.length - 1; index += 1) {
      if (values[index] > threshold && values[index] >= values[index - 1] && values[index] > values[index + 1] && index - lastPeak > 9) {
        peaks += 1
        lastPeak = index
      }

    }
    const detectedRate = Math.round(Math.max(48, Math.min(120, (peaks / SCAN_DURATION_SECONDS) * 60 || 72)))
    setHeartRate(detectedRate)
    setSignalQuality(deviation > 3 ? 'Good' : 'Demo / low signal')
  }

  const finishDiagnosticScan = () => {
    if (diagnosticCompletedRef.current) return
    diagnosticCompletedRef.current = true
    const samples = diagnosticSamplesRef.current
    const average = (key) => samples.length ? samples.reduce((sum, sample) => sum + sample[key], 0) / samples.length : 128
    let result
    if (mode === 'anemia') {
      const redGreenRatio = average('red') / Math.max(1, average('green'))
      result = {
        mode,
        title: redGreenRatio >= 1.05 ? 'Normal Perfusion' : 'Mild Pallor',
        detail: redGreenRatio >= 1.05 ? 'Capillary hemoglobin perfusion appears nominal.' : 'Recommend Bio-Analyzer Ferritin Check.',
        metric: `Erythema index R/G ${redGreenRatio.toFixed(2)}`,
      }
    } else if (mode === 'calf') {
      const left = average('leftRed') / Math.max(1, average('leftGreen'))
      const right = average('rightRed') / Math.max(1, average('rightGreen'))
      const asymmetry = Math.abs(left - right)
      result = {
        mode,
        title: asymmetry < 0.08 ? 'Nominal Bilateral Comparison' : 'Asymmetric Erythema — Review DVT Protocol',
        detail: 'Photogrammetric comparison supports thrombosis triage in 0g.',
        metric: `Left ${left.toFixed(2)} · Right ${right.toFixed(2)} · delta ${asymmetry.toFixed(2)}`,
      }
    } else if (mode === 'pill') {
      const red = average('red')
      const green = average('green')
      const blue = average('blue')
      const distance = Math.sqrt(((red - 248) ** 2) + ((green - 250) ** 2) + ((blue - 252) ** 2))
      const potency = Math.max(0, Math.round(100 - distance * 0.8))
      result = {
        mode,
        title: distance < 28 ? 'Reference Color Intact' : 'Discoloration Detected',
        detail: distance < 28 ? `Estimated onboard potency ${potency}%.` : `Photolytic or radiation-induced color shift detected. Estimated potency ${potency}%.`,
        metric: `RGB ${Math.round(red)}, ${Math.round(green)}, ${Math.round(blue)} · baseline #F8FAFC`,
      }
    } else {
      result = {
        mode,
        title: radiationCpm > 0 ? 'Particle Field Detected' : 'Thermal Baseline Only',
        detail: `${radiationCpm} CPM · estimated dose rate ${doseRate.toFixed(2)} µSv/h.`,
        metric: lightLeak ? 'Light leak prevented a valid covered-lens baseline.' : 'Covered-lens CMOS particle scan complete.',
      }
    }
    const completedResult = { ...result, timestamp: new Date().toISOString() }
    setDiagnosticResult(completedResult)
    onDiagnostic?.(completedResult)
  }

  const drawWaveform = (values) => {
    const canvas = waveformCanvasRef.current
    if (!canvas) return
    const context = canvas.getContext('2d')
    context.clearRect(0, 0, canvas.width, canvas.height)
    context.strokeStyle = '#55d6a5'
    context.lineWidth = 2
    context.beginPath()
    values.forEach((value, index) => {
      const x = (index / Math.max(1, values.length - 1)) * canvas.width
      const y = canvas.height / 2 - ((value - 128) / 80) * canvas.height
      if (index === 0) context.moveTo(x, y)
      else context.lineTo(x, y)
    })
    context.stroke()
  }

  const sampleFrame = (timestamp) => {
    if (!open || (!specialized && mode !== 'pulse')) return
    if (!scanStartedRef.current) scanStartedRef.current = timestamp
    if (timestamp - lastSampleRef.current >= 33) {
      const elapsed = (timestamp - scanStartedRef.current) / 1000
      const canvas = sampleCanvasRef.current
      const context = canvas?.getContext('2d', { willReadFrequently: true })
      let red = 128 + Math.sin(elapsed * 2 * Math.PI * 1.2) * 18
      let green = 112
      let blue = 108
      let leftRed = 0
      let leftGreen = 0
      let rightRed = 0
      let rightGreen = 0
      if (context && videoRef.current?.readyState >= 2 && !demoMode) {
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
        const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data
        let totalRed = 0
        let totalGreen = 0
        let totalBlue = 0
        let leftPixels = 0
        let rightPixels = 0
        for (let index = 0; index < pixels.length; index += 4) {
          const pixel = index / 4
          const x = pixel % canvas.width
          totalRed += pixels[index]
          totalGreen += pixels[index + 1]
          totalBlue += pixels[index + 2]
          if (x < canvas.width / 2) {
            leftRed += pixels[index]
            leftGreen += pixels[index + 1]
            leftPixels += 1
          } else {
            rightRed += pixels[index]
            rightGreen += pixels[index + 1]
            rightPixels += 1
          }
        }
        red = totalRed / (pixels.length / 4)
        green = totalGreen / (pixels.length / 4)
        blue = totalBlue / (pixels.length / 4)
        leftRed /= Math.max(1, leftPixels)
        leftGreen /= Math.max(1, leftPixels)
        rightRed /= Math.max(1, rightPixels)
        rightGreen /= Math.max(1, rightPixels)
      } else if (specialized) {
        red = mode === 'anemia' ? 126 : mode === 'pill' ? 248 : mode === 'radiation' ? 4 : 116
        green = mode === 'anemia' ? 108 : mode === 'pill' ? 250 : mode === 'radiation' ? 4 : 106
        blue = mode === 'pill' ? 252 : mode === 'radiation' ? 4 : 112
      }
      if (specialized) {
        if (mode === 'radiation') {
          const luminance = (red * 0.2126) + (green * 0.7152) + (blue * 0.0722)
          const hasLightLeak = luminance >= 25
          setLightLeak(hasLightLeak)
        }
        diagnosticSamplesRef.current = [...diagnosticSamplesRef.current, { red, green, blue, leftRed, leftGreen, rightRed, rightGreen }].slice(-150)
        setDiagnosticProgress(Math.min(100, (elapsed / DIAGNOSTIC_DURATION_SECONDS) * 100))
      } else {
        samplesRef.current = [...samplesRef.current, { red, timestamp }].slice(-360)
        waveformRef.current = [...waveformRef.current, red].slice(-120)
        drawWaveform(waveformRef.current)
        setCountdown(Math.max(0, SCAN_DURATION_SECONDS - Math.floor(elapsed)))
      }
      lastSampleRef.current = timestamp
      if (elapsed >= (specialized ? DIAGNOSTIC_DURATION_SECONDS : SCAN_DURATION_SECONDS)) {
        if (specialized && mode === 'radiation') {
          if (!diagnosticCompletedRef.current) finishDiagnosticScan()
        } else {
          if (specialized) finishDiagnosticScan()
          else finishPulseScan()
          return
        }
      }
    }
    animationRef.current = requestAnimationFrame(sampleFrame)
  }

  useEffect(() => {
    setMode(normalizeMode(initialMode, specialized))
  }, [initialMode, specialized])

  useEffect(() => {
    if (!open) {
      stopCamera()
      return undefined
    }
    setHeartRate(null)
    setSignalQuality(null)
    setSnapshot(null)
    setCountdown(SCAN_DURATION_SECONDS)
    setDiagnosticProgress(0)
    setDiagnosticResult(null)
    setRadiationBurst(false)
    setLightLeak(false)
    setRadiationCpm(0)
    setDoseRate(0)
    setDoseSynced(false)
    waveformRef.current = []
    samplesRef.current = []
    diagnosticSamplesRef.current = []
    diagnosticCompletedRef.current = false
    radiationHitsRef.current = []
    scanStartedRef.current = 0
    return () => stopCamera()
  }, [open])

  useEffect(() => {
    if (!open) return undefined
    stopCamera()
    setHeartRate(null)
    setSignalQuality(null)
    setCountdown(SCAN_DURATION_SECONDS)
    samplesRef.current = []
    scanStartedRef.current = 0
    setDiagnosticProgress(0)
    setDiagnosticResult(null)
    setRadiationBurst(false)
    setLightLeak(false)
    setRadiationCpm(0)
    setDoseRate(0)
    setDoseSynced(false)
    diagnosticSamplesRef.current = []
    diagnosticCompletedRef.current = false
    radiationHitsRef.current = []
    startCamera()
    return () => stopCamera()
  }, [open, mode])

  useEffect(() => {
    if (!open) return undefined
    const handleVisibility = () => {
      if (document.hidden) stopCamera()
      else startCamera()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [open, mode])

  useEffect(() => {
    if (!open || ((!specialized && mode !== 'pulse') || (!specialized && heartRate)) || (diagnosticResult && mode !== 'radiation')) return undefined
    animationRef.current = requestAnimationFrame((timestamp) => sampleFrameRef.current?.(timestamp))
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [open, mode, heartRate, demoMode, specialized, diagnosticResult])

  useEffect(() => {
    if (!open || !specialized || mode !== 'radiation') return undefined
    let animationId
    const renderRadiationFrame = (timestamp) => {
      const canvas = radiationCanvasRef.current
      const viewport = radiationViewportRef.current
      if (!canvas || !viewport) {
        animationId = requestAnimationFrame(renderRadiationFrame)
        return
      }
      const bounds = viewport.getBoundingClientRect()
      const pixelRatio = window.devicePixelRatio || 1
      const width = Math.max(1, Math.floor(bounds.width * pixelRatio))
      const height = Math.max(1, Math.floor(bounds.height * pixelRatio))
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width
        canvas.height = height
      }
      const context = canvas.getContext('2d')
      context.save()
      context.scale(pixelRatio, pixelRatio)
      const displayWidth = bounds.width
      const displayHeight = bounds.height
      context.fillStyle = '#020617'
      context.fillRect(0, 0, displayWidth, displayHeight)
      context.strokeStyle = 'rgba(30, 41, 59, .75)'
      context.lineWidth = 1
      for (let grid = 0; grid < displayWidth; grid += 32) {
        context.beginPath()
        context.moveTo(grid, 0)
        context.lineTo(grid, displayHeight)
        context.stroke()
      }
      for (let grid = 0; grid < displayHeight; grid += 32) {
        context.beginPath()
        context.moveTo(0, grid)
        context.lineTo(displayWidth, grid)
        context.stroke()
      }
      const burstAge = timestamp % 1800
      if (radiationBurst) {
        const burstCpm = Math.round(450 + ((timestamp / 1800) % 1) * 750)
        setRadiationCpm(burstCpm)
        setDoseRate(18.5 + ((timestamp / 2200) % 1) * 26.5)
        context.shadowBlur = 18
        const colors = ['#f8fafc', '#67e8f9', '#f0abfc']
        for (let hit = 0; hit < 12; hit += 1) {
          const x = (Math.sin(timestamp / 130 + hit * 2.7) * .5 + .5) * displayWidth
          const y = (Math.cos(timestamp / 170 + hit * 1.9) * .5 + .5) * displayHeight
          context.fillStyle = colors[hit % colors.length]
          context.shadowColor = context.fillStyle
          context.fillRect(x, y, 2.5, 2.5)
        }
        context.shadowBlur = 8
        context.strokeStyle = 'rgba(103, 232, 249, .85)'
        context.lineWidth = 2
        for (let track = 0; track < 4; track += 1) {
          const offset = ((burstAge / 1800) + track / 4) % 1
          context.beginPath()
          context.moveTo(-20 + offset * displayWidth, displayHeight * (.15 + track * .18))
          context.lineTo(displayWidth * (.45 + offset * .45), displayHeight * (.8 - track * .12))
          context.stroke()
        }
        context.shadowBlur = 0
      } else {
        setRadiationCpm(15 + Math.floor((timestamp / 9000) % 21))
        setDoseRate(.18)
        context.shadowBlur = 5
        context.shadowColor = '#c4f1ff'
        for (let hit = 0; hit < 2; hit += 1) {
          const x = (Math.sin(timestamp / 1700 + hit * 4) * .5 + .5) * displayWidth
          const y = (Math.cos(timestamp / 2100 + hit * 5) * .5 + .5) * displayHeight
          context.fillStyle = hit ? '#67e8f9' : '#f8fafc'
          context.fillRect(x, y, 1, 1)
        }
        context.shadowBlur = 0
      }
      context.fillStyle = '#8de8ca'
      context.font = '10px monospace'
      context.fillText(lightLeak ? 'VISIBLE LIGHT' : 'COVERED LENS', 14, 20)
      context.restore()
      animationId = requestAnimationFrame(renderRadiationFrame)
    }
    animationId = requestAnimationFrame(renderRadiationFrame)
    return () => cancelAnimationFrame(animationId)
  }, [open, specialized, mode, radiationBurst, lightLeak])

  useEffect(() => {
    sampleFrameRef.current = sampleFrame
  })

  const updateTelemetry = () => {
    if (heartRate) onHeartRate?.(heartRate)
    onClose()
  }

  const captureSnapshot = () => {
    const canvas = document.createElement('canvas')
    canvas.width = 480
    canvas.height = 360
    const context = canvas.getContext('2d')
    if (videoRef.current?.readyState >= 2 && !demoMode) context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height)
    else {
      context.fillStyle = '#07111d'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.strokeStyle = '#55d6a5'
      context.strokeRect(20, 20, canvas.width - 40, canvas.height - 40)
      context.fillStyle = '#8de8ca'
      context.font = '18px monospace'
      context.fillText('DEMO PUPIL CAPTURE', 125, 180)
    }
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8)
    setSnapshot(dataUrl)
    onSnapshot?.(dataUrl)
  }

  const toggleRadiationBurst = () => {
    const nextValue = !radiationBurst
    setRadiationBurst(nextValue)
    onRadiationBurst?.(nextValue)
  }

  const syncRadiationDose = () => {
    onRadiationSync?.({ cpm: radiationCpm, doseRate, timestamp: new Date().toISOString() })
    setDoseSynced(true)
  }

  if (!open) return null
  const diagnosticCopy = {
    anemia: { tab: 'Nailbed / Conjunctiva Pallor', title: 'Space Anemia Screening', instruction: 'Align the fingertip or conjunctiva with the ring. White illumination calibrates the capillary field before RGB analysis.' },
    calf: { tab: 'Bilateral Calf Edema & Erythema', title: 'DVT Screening', instruction: 'Center both calves in the split frame. Compare redness and cyanosis indices for 0g thrombosis triage.' },
    pill: { tab: 'Hormonal Pill Colorimetric Integrity', title: 'Radiation Degradation', instruction: 'Align the tablet blister with the reticle. Compare surface RGB values with the pharmaceutical reference #F8FAFC.' },
    radiation: { tab: 'CMOS Radiation Dosimeter', title: 'Covered-Lens Particle Dosimeter', instruction: 'Cover the camera lens completely with your finger or dark tape to block visible light.' },
  }
  const renderDiagnostic = () => {
    const activeDiagnosticMode = normalizeMode(mode, true)
    const copy = diagnosticCopy[activeDiagnosticMode] || diagnosticCopy.anemia
    return <div className={`optical-diagnostic-layout optical-diagnostic-${activeDiagnosticMode}`}><div ref={radiationViewportRef} className="optical-video-frame">{activeDiagnosticMode === 'radiation' && <video ref={videoRef} className="radiation-source-video" muted playsInline aria-label="Covered lens camera source" />} {activeDiagnosticMode !== 'radiation' && <video ref={videoRef} muted playsInline aria-label={`${copy.title} live camera feed`} />}<canvas ref={sampleCanvasRef} className="optical-sample-canvas" width="160" height="90" />{activeDiagnosticMode === 'radiation' ? <canvas ref={radiationCanvasRef} className="radiation-canvas" aria-label="CMOS particle detection canvas" /> : activeDiagnosticMode === 'calf' ? <div className="calf-split-overlay"><span>LEFT CALF</span><span>RIGHT CALF</span><i /><i /></div> : <div className={`diagnostic-target-ring ${activeDiagnosticMode === 'pill' ? 'pill-reticle' : ''}`} />}{activeDiagnosticMode === 'anemia' && <div className="illumination-calibration">WHITE SCREEN ILLUMINATION CALIBRATION</div>}{activeDiagnosticMode === 'pill' && <div className="pill-reference-label">REFERENCE #F8FAFC</div>}</div><div className="optical-readout"><h3>{copy.title}</h3><p>{copy.instruction}</p>{activeDiagnosticMode === 'radiation' && <><div className={`radiation-light-status ${radiationBurst ? 'high-flux' : lightLeak ? 'warning' : ''}`}>{radiationBurst ? 'HIGH RADIATION FLUX DETECTED' : lightLeak ? 'Light leak detected — cover lens fully' : 'Visible light blocked · dosimeter armed'}</div><div className="radiation-metrics"><span><b>Counts Per Minute</b>{radiationCpm} CPM</span><span><b>Estimated dose rate</b>{doseRate.toFixed(2)} µSv/h</span></div><button type="button" className={`female-action ${radiationBurst ? 'active' : ''}`} onClick={toggleRadiationBurst}>{radiationBurst ? 'Disable Simulate Cosmic Ray / SEP Burst' : 'Simulate Cosmic Ray / SEP Burst'}</button>{radiationBurst && <button type="button" className="female-action radiation-shelter-button" onClick={() => onRadiationBurst?.(true)}>Trigger Radiation Shelter Alert</button>}<button type="button" className="female-action" onClick={syncRadiationDose} disabled={doseSynced}>Sync Dose to Crew Profile (+70 XP)</button></>}{activeDiagnosticMode !== 'radiation' && <div className="diagnostic-progress"><i style={{ width: `${diagnosticProgress}%` }} /></div>}<strong className="optical-countdown">{activeDiagnosticMode === 'radiation' ? `${radiationCpm} CPM` : diagnosticResult ? 'SCAN COMPLETE' : `${Math.max(0, Math.ceil(DIAGNOSTIC_DURATION_SECONDS - (diagnosticProgress / 100) * DIAGNOSTIC_DURATION_SECONDS))}s`}</strong>{diagnosticResult && <div className={`diagnostic-result ${diagnosticResult.title.includes('Mild') || diagnosticResult.title.includes('Asymmetric') || diagnosticResult.title.includes('Discoloration') ? 'warning' : ''}`}><CheckCircle2 size={16} /><div><strong>{diagnosticResult.title}</strong><span>{diagnosticResult.detail}</span><small>{diagnosticResult.metric}</small><small>Reading logged {new Date(diagnosticResult.timestamp).toLocaleString('en-US')}</small></div></div>}</div></div>
  }
  return <div className="optical-scanner-backdrop" role="dialog" aria-modal="true" aria-label="Optical Bio-Scanner">
    <section className="optical-scanner-panel">
      <header className="optical-scanner-header"><div><p className="eyebrow"><Camera size={13} /> OPTICAL BIO-SCANNER</p><h2>Camera Sensor</h2></div><button type="button" className="optical-close" aria-label="Close optical scanner" onClick={onClose}><X size={18} /></button></header>
      <div className="optical-mode-tabs">{specialized ? Object.entries(diagnosticCopy).map(([id, copy]) => <button type="button" key={id} className={mode === id ? 'active' : ''} onClick={() => setMode(id)}>{copy.tab}</button>) : <><button type="button" className={mode === 'pulse' ? 'active' : ''} onClick={() => setMode('pulse')}>Fingertip rPPG · 10s heart rate</button><button type="button" className={mode === 'pupil' ? 'active' : ''} onClick={() => setMode('pupil')}>Neurological & SANS pupil caliper</button></>}</div>
      {cameraState === 'demo' && <div className="optical-demo-banner"><CircleAlert size={14} /> Camera permission unavailable. Running simulated demo mode.</div>}
      {specialized ? renderDiagnostic() : mode === 'pulse' ? <div className="optical-pulse-layout"><div className="optical-hud-frame"><video ref={videoRef} muted playsInline aria-label="Live fingertip camera feed" /><div className="optical-crosshair" /><span>{cameraState === 'live' ? 'LIVE CAMERA' : 'SIMULATED FEED'}</span></div><div className="optical-readout"><h3>Fingertip Pulse Photoplethysmography</h3><p>Hold a fingertip over the camera lens. The scanner samples average red-channel intensity at 30 fps.</p><canvas ref={sampleCanvasRef} className="optical-sample-canvas" width="160" height="90" /><canvas ref={waveformCanvasRef} className="optical-waveform" width="360" height="100" aria-label="Live PPG waveform" /><strong className="optical-countdown">{heartRate ? `${heartRate} BPM` : `${countdown}s`}</strong>{signalQuality && <span className="optical-quality"><CheckCircle2 size={13} /> Signal quality: {signalQuality}</span>}{heartRate && <button type="button" className="female-action" onClick={updateTelemetry}>Update Crew Telemetry (+60 XP)</button>}</div></div> : <div className="optical-pupil-layout"><div className="optical-video-frame"><video ref={videoRef} muted playsInline aria-label="Live pupil camera feed" /><svg className="pupil-reticle" viewBox="0 0 300 220" role="img" aria-label="Pupil caliper reticle"><circle cx="150" cy="110" r="20" /><circle cx="150" cy="110" r="35" /><circle cx="150" cy="110" r="50" /><text x="174" y="94">2mm</text><text x="186" y="76">4mm</text><text x="202" y="58">8mm</text><line x1="120" y1="110" x2="180" y2="110" /><line x1="150" y1="80" x2="150" y2="140" /></svg>{flash && <div className="pupil-flash" />}</div><div className="optical-readout"><h3>Neurological & SANS Pupil Caliper</h3><p>Assess pupil symmetry, anisocoria, and optic stress. This screen supports triage and does not replace a clinical examination.</p><div className="calibration-values"><span><b>Caliper range</b>2–8 mm</span><span><b>Capture status</b>{snapshot ? 'Attached to report' : 'Awaiting capture'}</span></div><button type="button" className="female-action" onClick={() => { setFlash(true); window.setTimeout(() => setFlash(false), 180) }}>Trigger Light Reflex Flash</button><button type="button" className="female-action" onClick={captureSnapshot}>Capture & Attach to Houston Telemetry</button>{snapshot && <img className="optical-snapshot" src={snapshot} alt="Captured pupil assessment thumbnail" />}</div></div>}
    </section>
  </div>
}
