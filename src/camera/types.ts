export interface CameraDevice {
  deviceId: string
  label: string
  kind: 'videoinput'
}

export interface CameraError {
  code: 'permission-denied' | 'not-found' | 'in-use' | 'not-readable' | 'over-constrained' | 'unsupported' | 'insecure-context' | 'disconnected' | 'unknown'
  title: string
  message: string
  hint?: string
}

export type CameraStatus = 'idle' | 'requesting' | 'connected' | 'paused' | 'stopped' | 'error'

export interface CameraState {
  status: CameraStatus
  stream: MediaStream | null
  error: CameraError | null
  devices: CameraDevice[]
  selectedDeviceId: string | null
  facingMode: 'user' | 'environment'
  mirrored: boolean
}

export interface CameraControls {
  start: (deviceId?: string) => Promise<void>
  stop: () => void
  pause: () => void
  resume: () => void
  switchCamera: () => Promise<void>
  setMirrored: (mirrored: boolean) => void
  clearError: () => void
  attachVideo: (video: HTMLVideoElement | null) => void
}