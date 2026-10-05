import { useEffect, useRef, useState, useCallback } from 'react'
import { getSharedDetector, FaceLandmarkDetector, type DetectedFace } from './faceLandmarker'
import { drawLandmarks } from './landmarkRenderer'
import { getExpressionEngine, smoothExpression, type ExpressionClassification } from './expressionEngine'

export interface ExpressionEstimate {
  primaryExpression: string
  confidence: number
  scores: Record<string, number>
  timestamp: number
}

export interface FaceLandmarkerState {
  faces: DetectedFace[]
  loading: boolean
  error: Error | null
  fps: number
  lastTimestamp: number
  /** Current expression estimate from the first detected face */
  expression: ExpressionEstimate | null
  /** Smoothed expression estimate for stable display */
  smoothedExpression: ExpressionEstimate | null
  /** Per-face expression estimates */
  faceExpressions: ExpressionEstimate[]
}

export function useFaceLandmarker(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  enabled: boolean,
  options: {
    inferenceFps?: number
    mirrored?: boolean
    showMesh?: boolean
    showKeyPoints?: boolean
    showBoundingBox?: boolean
  } = {}
) {
  const [state, setState] = useState<FaceLandmarkerState>({
    faces: [],
    loading: true,
    error: null,
    fps: 0,
    lastTimestamp: 0,
    expression: null,
    smoothedExpression: null,
    faceExpressions: [],
  })

  const detectorRef = useRef<FaceLandmarkDetector | null>(null)
  const frameCountRef = useRef(0)
  const lastFpsTimeRef = useRef(performance.now())
  const animationRef = useRef<number>()
  const lastProcessTimeRef = useRef(0)
  const prevExpressionRef = useRef<ExpressionClassification | null>(null)

  const { inferenceFps = 12, mirrored = true, showMesh = true, showKeyPoints = true, showBoundingBox = false } = options

  // Initialize detector
  useEffect(() => {
    const detector = getSharedDetector()
    detectorRef.current = detector

    const init = async () => {
      try {
        await detector.initialize()
        setState(prev => ({ ...prev, loading: false }))
      } catch (error) {
        setState(prev => ({ ...prev, loading: false, error: error as Error }))
      }
    }

    init()
    return () => {
      // Don't dispose shared detector here
    }
  }, [])

  // Process frames
  const processFrame = useCallback(async () => {
    if (!enabled || !videoRef.current || !canvasRef.current || !detectorRef.current?.running) {
      animationRef.current = requestAnimationFrame(processFrame)
      return
    }

    const now = performance.now()
    const minInterval = 1000 / inferenceFps

    if (now - lastProcessTimeRef.current < minInterval) {
      animationRef.current = requestAnimationFrame(processFrame)
      return
    }
    lastProcessTimeRef.current = now

    const video = videoRef.current!
    const detector = detectorRef.current!

    try {
      const result = await detector.detectForVideo(video, performance.now())
      const faces = result ? detector.parseResult(result) : []

      // Classify expressions for each detected face
      const engine = getExpressionEngine()
      const faceExpressions = faces.map(face => {
        const classification = engine.classify(face.blendshapes ?? new Map())
        return {
          primaryExpression: classification.primaryExpression,
          confidence: classification.confidence,
          scores: classification.scores,
          timestamp: classification.timestamp,
        }
      })

      // Use first face's expression as primary
      const primaryExpression = faceExpressions[0] ?? null

      // Smooth the expression
      let rawClassification = null
      if (faceExpressions[0]) {
        rawClassification = {
          primaryExpression: faceExpressions[0].primaryExpression,
          confidence: faceExpressions[0].confidence,
          scores: faceExpressions[0].scores,
          timestamp: faceExpressions[0].timestamp,
        }
      }
      const smoothed = rawClassification
        ? smoothExpression(rawClassification, prevExpressionRef.current)
        : null
      if (rawClassification) prevExpressionRef.current = rawClassification

      setState(prev => ({
        ...prev,
        faces,
        lastTimestamp: performance.now(),
        expression: primaryExpression,
        smoothedExpression: smoothed ? {
          primaryExpression: smoothed.primaryExpression,
          confidence: smoothed.confidence,
          scores: smoothed.scores,
          timestamp: smoothed.timestamp,
        } : null,
        faceExpressions,
      }))

      // Update FPS
      frameCountRef.current++
      if (performance.now() - lastFpsTimeRef.current >= 1000) {
        setState(prev => ({ ...prev, fps: frameCountRef.current }))
        frameCountRef.current = 0
        lastFpsTimeRef.current = performance.now()
      }

      // Draw landmarks on canvas
      const ctx = canvasRef.current?.getContext('2d', { willReadFrequently: true })
      if (ctx && canvasRef.current && videoRef.current) {
        const canvas = canvasRef.current
        const video = videoRef.current!
        canvas.width = video.videoWidth
        canvas.height = video.videoHeight
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        drawLandmarks(ctx, faces, video.videoWidth, video.videoHeight, {
          showMesh,
          showKeyPoints,
          showBoundingBox,
        }, mirrored)
      }
    } catch (error) {
      console.error('Face landmark detection error:', error)
    }

    animationRef.current = requestAnimationFrame(processFrame)
  }, [enabled, inferenceFps, mirrored, showMesh, showKeyPoints, showBoundingBox, videoRef, canvasRef])

  // Start/stop animation loop
  useEffect(() => {
    if (enabled && !state.loading && detectorRef.current?.running) {
      animationRef.current = requestAnimationFrame(processFrame)
    } else if (animationRef.current) {
      cancelAnimationFrame(animationRef.current)
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current)
    }
  }, [enabled, state.loading, processFrame])

  // Clear canvas when disabled
  useEffect(() => {
    if (!enabled && canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d')
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height)
    }
  }, [enabled, canvasRef])

  return state
}