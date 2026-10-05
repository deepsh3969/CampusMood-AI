import { useEffect, useCallback, useRef } from 'react'
import { Timer, Play, Pause, Square, Download } from 'lucide-react'
import { Panel, SectionHeading, Badge, Alert, Toggle } from '@/components/ui'
import { CameraView } from '@/camera'
import { useCamera } from '@/camera/useCamera'
import { useFaceLandmarker } from '@/ai'
import { SessionSummaryModal } from '@/components/monitor'
import { useMonitorStore, MonitorMode } from '@/store/monitorStore'
import { expressionDisplay, expressionColor, EXPRESSION_KEYS } from '@/constants/expressions'
import { useSessionsStore } from '@/store/sessionsStore'
import type { ExpressionScores } from '@/types'
import { formatElapsed, formatPercent } from '@/utils/format'
import { cn } from '@/utils/cn'
import { sessionToCSV, sessionsToCSV, downloadCSV } from '@/utils/export'

const STUDY_PRESETS = [25, 45, 60] as const

export default function MonitorPage() {
  const { sessions } = useSessionsStore()
  const camera = useCamera()
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const landmarkState = useFaceLandmarker(videoRef, canvasRef, camera.status === 'connected', {
    inferenceFps: 12,
    mirrored: true,
    showMesh: true,
    showKeyPoints: true,
    showBoundingBox: false,
  })

  const {
    mode,
    setMode,
    plannedDurationSec,
    setPlannedDuration,
    startSession,
    pauseSession,
    resumeSession,
    endSession,
    addSample,
    updateFaceStatus,
    updateExpression,
    startedAt,
    pausedAt,
    samples,
    currentExpression,
    currentScores,
    currentConfidence,
    faceDetected,
    lastSessionSummary,
    showSessionSummary,
    dismissSessionSummaryModal,
  } = useMonitorStore()

  // Use smoothed expression from landmark detection
  const smoothedExpr = landmarkState.smoothedExpression
  const primaryExpression = (smoothedExpr?.primaryExpression as import('@/types').ExpressionLabel | undefined) ?? currentExpression
  const scores = (smoothedExpr?.scores ?? currentScores) as ExpressionScores
  const confidence = smoothedExpr?.confidence ?? currentConfidence

  // Update monitor store with latest expression
  useEffect(() => {
    if (primaryExpression) {
      updateExpression(primaryExpression, scores ?? {}, confidence ?? 0)
    }
  }, [primaryExpression, scores, confidence, updateExpression])

  const sampleIntervalRef = useRef<number>()
  const lastSampleTimeRef = useRef(0)
  const SAMPLE_INTERVAL_MS = 2000 // 2 seconds between samples

  // Sample interval for analytics
  useEffect(() => {
    if (!startedAt || pausedAt) return
    sampleIntervalRef.current = window.setInterval(() => {
      const now = Date.now()
      if (now - lastSampleTimeRef.current >= SAMPLE_INTERVAL_MS) {
        lastSampleTimeRef.current = now
        const elapsed = now - startedAt
        addSample({
          t: elapsed,
          expression: primaryExpression as import('@/types').ExpressionLabel | null,
          confidence: confidence ?? 0,
          faceDetected: landmarkState.faces.length > 0,
        })
      }
      // Check for study session expiry
      if (plannedDurationSec && startedAt) {
        const now = Date.now()
        const elapsed = pausedAt ? pausedAt - startedAt : now - startedAt
        if (elapsed >= plannedDurationSec * 1000) {
          endSession()
        }
      }
    }, 500)
    return () => {
      if (sampleIntervalRef.current) clearInterval(sampleIntervalRef.current)
    }
  }, [startedAt, pausedAt, primaryExpression, confidence, mode, plannedDurationSec, addSample, endSession, landmarkState.faces.length])

  // Update monitor store when camera status changes
  useEffect(() => {
    if (camera.status !== 'connected') {
      updateFaceStatus(false, 0)
    } else {
      updateFaceStatus(true, landmarkState.faces.length)
    }
  }, [camera.status, landmarkState.faces.length, updateFaceStatus])

  const handleStart = useCallback(async () => {
    await camera.start()
    if (camera.status === 'connected') {
      startSession()
    }
  }, [camera, startSession])

  const handlePause = useCallback(() => {
    camera.pause()
    pauseSession()
  }, [camera, pauseSession])

  const handleResume = useCallback(() => {
    camera.resume()
    resumeSession()
  }, [camera, resumeSession])

  const handleStop = useCallback(() => {
    camera.stop()
    // endSession now shows the summary modal automatically
    endSession()
  }, [camera, endSession])

  const handleModeChange = useCallback((newMode: MonitorMode) => {
    setMode(newMode)
    if (newMode === 'study' && !plannedDurationSec) {
      setPlannedDuration(25 * 60)
    } else if (newMode === 'quick') {
      setPlannedDuration(null)
    }
  }, [setMode, setPlannedDuration, plannedDurationSec])

  // Compute elapsed time directly (avoids type issues with partial state)
  const now = Date.now()
  const elapsedMs = startedAt
    ? (pausedAt ? pausedAt - startedAt : now - startedAt)
    : 0
  const progress = plannedDurationSec ? Math.min(elapsedMs / (plannedDurationSec * 1000), 1) : 0

  return (
    <div className="space-y-6 animate-fade-up">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Live Monitor</h1>
          <p className="mt-1 text-sm text-muted">Real-time visible expression estimation from your webcam</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Toggle
            checked={mode === 'study'}
            onChange={(v) => handleModeChange(v ? 'study' : 'quick')}
            label="Study Session"
            description="Timed session with preset durations"
          />
          {mode === 'study' && (
            <select
              value={plannedDurationSec ? plannedDurationSec / 60 : 25}
              onChange={(e) => setPlannedDuration(Number(e.target.value) * 60)}
              className="input max-w-xs"
              disabled={startedAt !== null}
            >
              {STUDY_PRESETS.map((min) => (
                <option key={min} value={min}>{min} min</option>
              ))}
              <option value={0}>Custom...</option>
            </select>
          )}
        </div>
      </div>

      {/* Camera View */}
      <Panel className="overflow-hidden">
        <CameraView
          camera={camera}
          showControls={true}
          showStatus={true}
          inferenceFps={12}
          showLandmarks={true}
          mirrored={true}
        />
      </Panel>

      {/* Session Timer & Status */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel className="flex flex-col items-center gap-2 p-6">
          <div className="flex items-center gap-2">
            <Timer className={cn('h-5 w-5', faceDetected ? 'text-success' : 'text-muted')} />
            <span className="text-sm font-medium text-muted">Session</span>
          </div>
          <div className="font-mono text-3xl font-bold tabular-nums">{formatElapsed(elapsedMs)}</div>
          {plannedDurationSec && (
            <div className="w-full h-2 rounded-full bg-border overflow-hidden">
              <div
                className="h-full rounded-full bg-brand transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
          )}
        </Panel>

        <Panel className="flex flex-col items-center gap-2 p-6">
          <div className="flex items-center gap-2">
            <span className={cn('h-2.5 w-2.5 rounded-full', landmarkState.faces.length > 0 ? 'bg-success' : 'text-muted')} />
            <span className="text-sm font-medium text-muted">Face</span>
          </div>
          <div className={cn('text-3xl font-bold tabular-nums', landmarkState.faces.length > 0 ? 'text-success' : 'text-muted')}>
            {landmarkState.faces.length > 0 ? 'DETECTED' : 'NOT DETECTED'}
          </div>
          {landmarkState.faces.length > 1 && (
            <Badge variant="warning" dot>Multiple faces detected</Badge>
          )}
        </Panel>

        <Panel className="flex flex-col items-center gap-2 p-6">
          <span className="text-sm font-medium text-muted">Inference</span>
          <div className="font-mono text-3xl font-bold tabular-nums text-brand">{camera.status === 'connected' ? 'READY' : '—'}</div>
          <span className="text-xs text-muted">MediaPipe FaceLandmarker</span>
        </Panel>
      </div>

      {/* Current Expression */}
      <Panel>
        <SectionHeading title="Current Expression Estimate" className="mb-4" />
        {primaryExpression && scores ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-lg font-semibold">{expressionDisplay(primaryExpression)}</span>
              <span className="font-mono text-lg font-bold text-brand">{confidence !== undefined ? formatPercent(confidence) : '—'}</span>
            </div>
            <div className="space-y-2">
              {EXPRESSION_KEYS.map((key) => {
                const score = scores[key] ?? 0
                return (
                  <div key={key} className="grid grid-cols-[8rem_1fr_3rem] items-center gap-3">
                    <span className="text-sm text-muted">{expressionDisplay(key)}</span>
                    <div className="h-2 overflow-hidden rounded-full bg-border/70">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${score * 100}%`, backgroundColor: expressionColor(key) }}
                      />
                    </div>
                    <span className="text-right font-mono text-sm text-muted">{formatPercent(score)}</span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-muted">
            {landmarkState.faces.length > 0 ? (
              <>
                <div className="flex h-8 w-8 mx-auto animate-spin rounded-full border-2 border-brand border-t-transparent" />
                <p className="mt-2">Analyzing expression...</p>
              </>
            ) : (
              <>
                <p className="font-medium">No face detected</p>
                <p className="text-sm mt-1">Position your face in the camera view</p>
              </>
            )}
          </div>
        )}
      </Panel>

      {/* Session Controls */}
      <Panel>
        <SectionHeading title="Session Controls" className="mb-4" />
        <div className="flex flex-wrap items-center justify-center gap-3">
          {(camera.status === 'idle' || camera.status === 'stopped') && (
            <button
              onClick={handleStart}
              className="btn-primary flex items-center gap-2 px-6 py-3 text-base"
            >
              <Play className="h-5 w-5" />
              Start Session
            </button>
          )}

          {camera.status === 'connected' && !pausedAt && (
            <>
              <button
                onClick={handlePause}
                className="btn-secondary flex items-center gap-2 px-6 py-3 text-base"
              >
                <Pause className="h-5 w-5" />
                Pause
              </button>
              <button
                onClick={handleStop}
                className="btn-danger flex items-center gap-2 px-6 py-3 text-base"
              >
                <Square className="h-5 w-5" />
                End
              </button>
            </>
          )}

          {pausedAt && (
            <>
              <button
                onClick={handleResume}
                className="btn-primary flex items-center gap-2 px-6 py-3 text-base"
              >
                <Play className="h-5 w-5" />
                Resume
              </button>
              <button
                onClick={handleStop}
                className="btn-danger flex items-center gap-2 px-6 py-3 text-base"
              >
                <Square className="h-5 w-5" />
                End
              </button>
            </>
          )}

          <button
            onClick={() => downloadCSV(sessionsToCSV(sessions), 'campusmood-all-sessions.csv')}
            className="btn-ghost flex items-center gap-2"
            disabled={samples.length === 0 && sessions.length === 0}
            title="Download all sessions report (CSV)"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </Panel>

      {/* Multi-face warning */}
      {landmarkState.faces.length > 1 && (
        <Alert tone="warning" title="Multiple faces detected">
          The system is designed for one consenting student. Expression analysis is paused until only one face is visible.
        </Alert>
      )}

      {/* Landmark model loading/error */}
      {landmarkState.loading && (
        <Alert tone="info" className="mt-4">
          Loading MediaPipe FaceLandmarker model...
        </Alert>
      )}
      {landmarkState.error && (
        <Alert tone="danger" title="Landmark model error" className="mt-4">
          {landmarkState.error.message}
        </Alert>
      )}

      {/* Session Summary Modal */}
      {showSessionSummary && lastSessionSummary && (
        <SessionSummaryModal
          open={showSessionSummary}
          onClose={dismissSessionSummaryModal}
          onExport={() => {
            // Find the full session record and export it
            const fullSession = sessions.find(s => s.endedAt === lastSessionSummary.endedAt)
            if (fullSession) {
              downloadCSV(sessionToCSV(fullSession), `campusmood-session-${fullSession.id}.csv`)
            }
          }}
          sessionData={lastSessionSummary}
        />
      )}
    </div>
  )
}