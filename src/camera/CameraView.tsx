import { Camera, CameraOff, RotateCcw, Maximize, Minimize, AlertCircle, VideoOff, ToggleLeft, ToggleRight } from 'lucide-react'
import { useRef, useEffect, useState } from 'react'
import type { CameraState, CameraControls } from './types'
import { cn } from '@/utils/cn'
import { useFaceLandmarker } from '@/ai'
import { Alert } from '@/components/ui'

interface CameraViewProps {
  camera: CameraState & CameraControls
  className?: string
  showControls?: boolean
  showStatus?: boolean
  inferenceFps?: number
  showLandmarks?: boolean
  mirrored?: boolean
}

export function CameraView({
  camera,
  className,
  showControls = true,
  showStatus = true,
  inferenceFps = 12,
  showLandmarks = true,
  mirrored = true,
}: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef<number>(0)
  const lastTimeRef = useRef<number>(performance.now())
  const [computedFps, setComputedFps] = useState(0)

  const camStatus = camera.status
  const statusColors = {
    idle: 'text-muted',
    requesting: 'text-warning',
    connected: 'text-success',
    paused: 'text-warning',
    stopped: 'text-muted',
    error: 'text-danger',
  } as const

  const statusLabels = {
    idle: 'IDLE',
    requesting: 'REQUESTING',
    connected: 'LIVE',
    paused: 'PAUSED',
    stopped: 'STOPPED',
    error: 'ERROR',
  } as const

  // Face landmark detection
  const landmarkState = useFaceLandmarker(videoRef, canvasRef, camera.status === 'connected' && showLandmarks, {
    inferenceFps,
    mirrored,
    showMesh: true,
    showKeyPoints: true,
    showBoundingBox: false,
  })

  const isRetryDisabled = camStatus === 'requesting' || camStatus === 'connected' || camStatus === 'paused'

  // Attach video element to camera hook
  useEffect(() => {
    camera.attachVideo(videoRef.current)
    return () => camera.attachVideo(null)
  }, [camera, camera.attachVideo])

  // Compute FPS
  useEffect(() => {
    if (!videoRef.current || camera.status !== 'connected') return

    let rafId: number

    const tick = (now: number) => {
      frameRef.current++
      if (now - lastTimeRef.current >= 1000) {
        setComputedFps(frameRef.current)
        frameRef.current = 0
        lastTimeRef.current = now
      }
      if (camera.status === 'connected') {
        rafId = requestAnimationFrame(tick)
      }
    }

    rafId = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId)
  }, [camera.status])

  // Draw landmarks canvas to match video size
  useEffect(() => {
    if (!canvasRef.current || !videoRef.current) return
    const canvas = canvasRef.current
    const video = videoRef.current
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
  }, [])

  return (
    <div className={cn('relative', className)}>
      {/* Video + Canvas overlay */}
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-elevated">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          playsInline
          muted
          style={{ transform: mirrored ? 'scaleX(-1)' : 'none' }}
          aria-label="Camera preview"
        />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          aria-hidden="true"
        />

        {/* Status overlay */}
        {showStatus && (
          <div className="absolute top-3 left-3 flex items-center gap-2">
            <span
              className={cn(
                'flex h-2 w-2 rounded-full',
                camStatus === 'connected' && 'bg-success animate-pulse-dot',
                camStatus === 'requesting' && 'bg-warning animate-pulse',
                camStatus === 'error' && 'bg-danger',
                camStatus === 'paused' && 'bg-warning',
                ['idle', 'stopped'].includes(camStatus) && 'bg-muted',
              )}
              aria-hidden="true"
            />
            <span className={cn('text-xs font-mono font-semibold', statusColors[camStatus])}>
              {statusLabels[camStatus]}
            </span>
            {computedFps > 0 && (
              <span className="text-[10px] font-mono text-muted/70">{computedFps} FPS</span>
            )}
            {landmarkState.fps > 0 && (
              <span className="text-[10px] font-mono text-brand/70">AI: {landmarkState.fps} FPS</span>
            )}
          </div>
        )}

        {/* Error overlay */}
        {camera.error && camStatus === 'error' && (
          <div className="absolute inset-0 flex items-center justify-center p-6 bg-bg/95 backdrop-blur-sm">
            <div className="surface-card max-w-md p-6 text-center">
              <AlertCircle className="mx-auto mb-3 h-10 w-10 text-danger" />
              <h3 className="text-lg font-semibold">{camera.error.title}</h3>
              <p className="mt-2 text-sm text-muted">{camera.error.message}</p>
              {camera.error.hint && <p className="mt-1.5 text-xs text-muted/80">{camera.error.hint}</p>}
              <div className="mt-4 flex gap-2 justify-center">
                <button
                  onClick={() => { camera.clearError(); camera.start() }}
                  className="btn-primary"
                  disabled={isRetryDisabled}
                >
                  Retry
                </button>
                <button onClick={camera.clearError} className="btn-secondary">
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No camera / idle state */}
        {camStatus === 'idle' && !camera.error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-elevated/50">
            <Camera className="h-12 w-12 text-muted/50" />
            <p className="text-sm text-muted">Press Start to begin camera</p>
          </div>
        )}

        {camStatus === 'stopped' && !camera.error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-elevated/50">
            <CameraOff className="h-12 w-12 text-muted/50" />
            <p className="text-sm text-muted">Camera stopped</p>
          </div>
        )}

        {camStatus === 'paused' && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6 text-center bg-bg/80 backdrop-blur-sm">
            <VideoOff className="h-12 w-12 text-warning" />
            <p className="text-sm font-medium text-warning">Camera paused</p>
          </div>
        )}
      </div>

      {/* Landmark detection status */}
      {showLandmarks && camera.status === 'connected' && (
        <div className="mt-2 flex items-center justify-center gap-4 text-xs text-muted">
          <span className={cn('flex items-center gap-1', landmarkState.faces.length > 0 ? 'text-success' : 'text-muted')}>
            {landmarkState.faces.length > 0 ? <ToggleRight className="h-3 w-3" /> : <ToggleLeft className="h-3 w-3" />}
            Face: {landmarkState.faces.length > 0 ? 'DETECTED' : 'SEARCHING...'}
          </span>
          {landmarkState.fps > 0 && (
            <span>Landmark FPS: {landmarkState.fps}</span>
          )}
          {landmarkState.loading && <span className="flex items-center gap-1"><span className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" /> Loading model...</span>}
          {landmarkState.error && <span className="text-danger">Model error</span>}
        </div>
      )}

      {/* Controls */}
      {showControls && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {camStatus === 'idle' || camStatus === 'stopped' ? (
            <button
              onClick={() => camera.start()}
              className="btn-primary flex items-center gap-2"
            >
              <Camera className="h-4 w-4" />
              Start Camera
            </button>
          ) : null}

          {camStatus === 'connected' && (
            <>
              <button
                onClick={camera.pause}
                className="btn-secondary flex items-center gap-2"
                aria-label="Pause camera"
              >
                <CameraOff className="h-4 w-4" />
                Pause
              </button>
              <button
                onClick={camera.stop}
                className="btn-danger flex items-center gap-2"
                aria-label="Stop camera"
              >
                <CameraOff className="h-4 w-4" />
                Stop
              </button>
            </>
          )}

          {camStatus === 'paused' && (
            <button
              onClick={camera.resume}
              className="btn-primary flex items-center gap-2"
              aria-label="Resume camera"
            >
              <Camera className="h-4 w-4" />
              Resume
            </button>
          )}

          {camera.devices.length > 1 && (
            <button
              onClick={camera.switchCamera}
              className="btn-ghost flex items-center gap-2"
              aria-label="Switch camera"
              title="Switch camera"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          )}

          {camStatus === 'connected' && videoRef.current && (
            <button
              onClick={() => {
                const video = videoRef.current!
                const canvas = document.createElement('canvas')
                canvas.width = video.videoWidth
                canvas.height = video.videoHeight
                const ctx = canvas.getContext('2d')!
                ctx.drawImage(video, 0, 0)
                const link = document.createElement('a')
                link.download = `campusmood-screenshot-${Date.now()}.png`
                link.href = canvas.toDataURL('image/png')
                link.click()
              }}
              className="btn-ghost flex items-center gap-2"
              aria-label="Take screenshot"
              title="Screenshot (local only)"
            >
              <Camera className="h-4 w-4" />
            </button>
          )}

          {videoRef.current && (
            <button
              onClick={() => {
                const video = videoRef.current!
                if (!document.fullscreenElement) {
                  video.parentElement?.requestFullscreen?.()
                } else {
                  document.exitFullscreen()
                }
              }}
              className="btn-ghost flex items-center gap-2"
              aria-label={document.fullscreenElement ? 'Exit fullscreen' : 'Enter fullscreen'}
            >
              {document.fullscreenElement ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
            </button>
          )}
        </div>
      )}

      {/* Face not detected hint */}
      {camStatus === 'connected' && !camera.error && landmarkState.faces.length === 0 && (
        <div className="mt-2 text-center text-xs text-muted" role="status" aria-live="polite">
          Position your face in the frame for landmark detection...
        </div>
      )}

      {/* Landmark error */}
      {landmarkState.error && (
        <Alert tone="danger" title="Landmark model error" className="mt-4">
          {landmarkState.error.message}
        </Alert>
      )}
    </div>
  )
}