import { useCallback, useEffect, useRef, useState } from 'react'
import type { CameraState, CameraControls, CameraError, CameraDevice } from './types'

const DEFAULT_CONSTRAINTS: MediaTrackConstraints = {
  width: { ideal: 1280 },
  height: { ideal: 720 },
  frameRate: { ideal: 30, max: 30 },
  facingMode: 'user',
}

function mapError(error: Error | DOMException): CameraError {
  const name = error.name
  const message = error.message

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return {
      code: 'permission-denied',
      title: 'Camera access denied',
      message: 'Please allow camera access in your browser settings and reload the page.',
      hint: 'Click the camera icon in the address bar to change permissions.',
    }
  }
  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return {
      code: 'not-found',
      title: 'No camera found',
      message: 'No video input device was detected on this system.',
      hint: 'Connect a webcam and try again.',
    }
  }
  if (name === 'NotReadableError' || name === 'TrackStartError') {
    return {
      code: 'in-use',
      title: 'Camera in use',
      message: 'The camera is already being used by another application.',
      hint: 'Close other apps using the camera (video calls, other browser tabs).',
    }
  }
  if (name === 'OverconstrainedError') {
    return {
      code: 'over-constrained',
      title: 'Constraints not satisfied',
      message: 'The requested video resolution or frame rate is not supported.',
      hint: 'Try a lower resolution or different camera.',
    }
  }
  if (name === 'SecurityError' || name === 'InsecureContextError') {
    return {
      code: 'insecure-context',
      title: 'Insecure context',
      message: 'Camera access requires a secure context (HTTPS or localhost).',
      hint: 'Use https:// or http://localhost.',
    }
  }
  if (name === 'AbortError') {
    return {
      code: 'disconnected',
      title: 'Camera disconnected',
      message: 'The camera device was disconnected during use.',
      hint: 'Reconnect the camera and try again.',
    }
  }
  if (name === 'NotSupportedError') {
    return {
      code: 'unsupported',
      title: 'Not supported',
      message: 'getUserMedia is not supported in this browser.',
      hint: 'Use a modern browser: Chrome, Firefox, Edge, Safari.',
    }
  }

  return {
    code: 'unknown',
    title: 'Camera error',
    message: message || 'An unexpected camera error occurred.',
  }
}

export function useCamera(): CameraState & CameraControls {
  const [status, setStatus] = useState<CameraState['status']>('idle')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<CameraError | null>(null)
  const [devices, setDevices] = useState<CameraDevice[]>([])
  const [selectedDeviceId, setSelectedDeviceId] = useState<string | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [mirrored, setMirrored] = useState(true)

  const streamRef = useRef<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Enumerate devices on mount
  useEffect(() => {
    let mounted = true
    navigator.mediaDevices.enumerateDevices().then((devs) => {
      if (!mounted) return
      const videoDevices = devs
        .filter((d) => d.kind === 'videoinput')
        .map((d) => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 8)}`, kind: 'videoinput' as const }))
      setDevices(videoDevices)
      if (videoDevices.length > 0 && !selectedDeviceId) {
        const firstDevice = videoDevices[0]
        if (firstDevice) setSelectedDeviceId(firstDevice.deviceId)
      }
    })
    return () => { mounted = false }
  }, [selectedDeviceId])

  // Listen for device changes
  useEffect(() => {
    const handler = () => {
      navigator.mediaDevices.enumerateDevices().then((devs) => {
        const videoDevices = devs
          .filter((d) => d.kind === 'videoinput')
          .map((d) => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 8)}`, kind: 'videoinput' as const }))
        setDevices(videoDevices)
      })
    }
    navigator.mediaDevices.addEventListener('devicechange', handler)
    return () => navigator.mediaDevices.removeEventListener('devicechange', handler)
  }, [])

  // Cleanup stream on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop())
        streamRef.current = null
      }
    }
  }, [])

  const clearError = useCallback(() => setError(null), [])

  const start = useCallback(async (deviceId?: string) => {
    setError(null)
    setStatus('requesting')

    const targetDeviceId = deviceId ?? selectedDeviceId ?? devices[0]?.deviceId
    if (!targetDeviceId) {
      const err = mapError(new DOMException('No camera device available', 'NotFoundError'))
      setError(err)
      setStatus('error')
      return
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          ...DEFAULT_CONSTRAINTS,
          deviceId: targetDeviceId ? { exact: targetDeviceId } : undefined,
          facingMode: { ideal: facingMode },
        },
        audio: false,
      }

      const newStream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = newStream
      setStream(newStream)
      setSelectedDeviceId(targetDeviceId)
      setStatus('connected')

      // Update video element if attached
      if (videoRef.current) {
        videoRef.current.srcObject = newStream
        await videoRef.current.play().catch(() => {})
      }
    } catch (err) {
      const cameraError = mapError(err as Error | DOMException)
      setError(cameraError)
      setStatus('error')
    }
  }, [selectedDeviceId, devices, facingMode])

  const stop = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop())
      streamRef.current = null
    }
    setStream(null)
    setStatus('stopped')
  }, [])

  const pause = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => { t.enabled = false })
    }
    setStatus('paused')
  }, [])

  const resume = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getVideoTracks().forEach((t) => { t.enabled = true })
    }
    setStatus('connected')
  }, [])

  const switchCamera = useCallback(async () => {
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacingMode)
    // Restart with new facing mode
    await start()
  }, [facingMode, start])

  const setMirroredState = useCallback((m: boolean) => {
    setMirrored(m)
  }, [])

  const attachVideo = useCallback((video: HTMLVideoElement | null) => {
    videoRef.current = video
    if (video && stream) {
      video.srcObject = stream
      video.play().catch(() => {})
    } else if (video) {
      video.srcObject = null
    }
  }, [stream])

  return {
    status,
    stream,
    error,
    devices,
    selectedDeviceId,
    facingMode,
    mirrored,
    start,
    stop,
    pause,
    resume,
    switchCamera,
    setMirrored: setMirroredState,
    clearError,
    attachVideo,
  }
}