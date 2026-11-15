import { useEffect, useRef, useState } from 'react'
import { Camera, CameraOff, CircleAlert, LoaderCircle, Radio, RefreshCw, ShieldCheck } from 'lucide-react'

const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task'
const WASM_URL = 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.3/wasm'

function blendshapeScore(categories) {
  const values = Object.fromEntries(categories.map((item) => [item.categoryName, item.score]))
  const ocular = ((values.browDownLeft || 0) + (values.browDownRight || 0) + (values.eyeSquintLeft || 0) + (values.eyeSquintRight || 0)) / 4
  const jaw = ((values.mouthPressLeft || 0) + (values.mouthPressRight || 0) + (values.jawClench || values.mouthClose || 0)) / 3
  return Math.round(Math.min(10, (ocular * .58 + jaw * .42) * 10) * 10) / 10
}

export function FacialTelemetryMonitor({ declaredSymptomScore = 0, onStressScoreChange }) {
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const landmarkerRef = useRef(null)
  const animationRef = useRef(null)
  const [active, setActive] = useState(false)
  const [simulation, setSimulation] = useState(false)
  const [status, setStatus] = useState('Standby')
  const [score, setScore] = useState(0)
  const [error, setError] = useState('')

  const setMeasuredScore = (value) => {
    const next = Math.round(Math.max(0, Math.min(10, value)) * 10) / 10
    setScore(next)
    onStressScoreChange?.(next)
  }
  const discrepancy = score >= 6.5 && declaredSymptomScore <= 3

  useEffect(() => () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    landmarkerRef.current?.close?.()
  }, [])

  const runDetection = (timestamp) => {
    if (!videoRef.current || !landmarkerRef.current) return
    const result = landmarkerRef.current.detectForVideo(videoRef.current, timestamp)
    const categories = result.faceBlendshapes?.[0]?.categories || []
    if (categories.length) {
      setMeasuredScore(blendshapeScore(categories))
      setStatus('Face telemetry live')
    }
    animationRef.current = requestAnimationFrame(runDetection)
  }

  const startSimulation = () => {
    setSimulation(true)
    setActive(true)
    setError('')
    setStatus('Simulation mode active')
    const tick = () => {
      const next = 5.2 + Math.sin(Date.now() / 1200) * 1.8
      setMeasuredScore(next)
      animationRef.current = requestAnimationFrame(tick)
    }
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    animationRef.current = requestAnimationFrame(tick)
  }

  const stop = () => {
    if (animationRef.current) cancelAnimationFrame(animationRef.current)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    landmarkerRef.current?.close?.()
    landmarkerRef.current = null
    setActive(false)
    setSimulation(false)
    setStatus('Paused')
  }

  const startCamera = async () => {
    setError('')
    setStatus('Requesting camera access')
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error('Camera API unavailable')
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        await videoRef.current.play()
      }
      const { FaceLandmarker, FilesetResolver } = await import('@mediapipe/tasks-vision')
      const vision = await FilesetResolver.forVisionTasks(WASM_URL)
      landmarkerRef.current = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
        runningMode: 'VIDEO',
        numFaces: 1,
        outputFaceBlendshapes: true,
      })
      setActive(true)
      setSimulation(false)
      setStatus('Calibrating face')
      animationRef.current = requestAnimationFrame(runDetection)
    } catch {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      setError('Camera or face model unavailable. Use simulation mode for this session.')
      setStatus('Fallback available')
    }
  }

  return <aside className="facial-monitor" aria-label="Facial telemetry monitor">
    <div className="facial-monitor-header"><span><Radio size={13} /> FACIAL TELEMETRY</span><b className={active ? 'live' : ''}>{active ? 'LIVE' : 'STANDBY'}</b></div>
    <div className="facial-monitor-body">
      <div className="facial-monitor-feed">
        <video ref={videoRef} muted playsInline className={active && !simulation ? 'visible' : ''} />
        {!active || simulation ? <div className="facial-monitor-placeholder">{simulation ? <Radio size={24} /> : <Camera size={24} />}<small>{simulation ? 'SIMULATION FEED' : 'CAMERA FEED PAUSED'}</small></div> : null}
        <i className="facial-crosshair" /><span className="facial-feed-label">USER FACING · {status.toUpperCase()}</span>
      </div>
      <div className="facial-monitor-controls">
        <div className="facial-monitor-score"><div><small>HIDDEN TENSION INDEX</small><strong>{score.toFixed(1)}<em>/10</em></strong></div><div className={`facial-status ${discrepancy ? 'warning' : 'nominal'}`}>{discrepancy ? <CircleAlert size={13} /> : <ShieldCheck size={13} />}{discrepancy ? 'Possible under-reporting' : 'Signal aligned'}</div></div>
        <div className="facial-monitor-metrics"><span><small>OCULAR / BROW</small><b>{score >= 6 ? 'ELEVATED' : 'CALIBRATED'}</b></span><span><small>JAW / LIP</small><b>{score >= 5 ? 'TENSE' : 'RELAXED'}</b></span></div>
        {error && <p className="facial-monitor-error">{error}</p>}
        <div className="facial-monitor-actions">{active ? <button type="button" onClick={stop}><CameraOff size={13} /> Pause Feed</button> : <button type="button" onClick={startCamera}><Camera size={13} /> Enable Camera</button>}<button type="button" onClick={startSimulation}><RefreshCw size={13} /> Simulation Mode</button></div>
        {!active && status === 'Requesting camera access' && <LoaderCircle className="facial-monitor-loader" size={14} />}
      </div>
    </div>
  </aside>
}
