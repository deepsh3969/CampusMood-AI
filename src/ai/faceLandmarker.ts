import { FilesetResolver, FaceLandmarker, type FaceLandmarkerResult } from '@mediapipe/tasks-vision'

export interface LandmarkerConfig {
  modelUrl: string
  wasmUrl: string
  runningMode: 'VIDEO' | 'IMAGE'
  numFaces: number
  minFaceDetectionConfidence: number
  minFacePresenceConfidence: number
  minTrackingConfidence: number
  outputFaceBlendshapes: boolean
  outputFacialTransformationMatrixes: boolean
}

export interface DetectedFace {
  boundingBox: { x: number; y: number; width: number; height: number }
  landmarks: Array<{ x: number; y: number; z: number }>
  blendshapes: Map<string, number> | null
  faceCount: number
}

const DEFAULT_CONFIG: LandmarkerConfig = {
  modelUrl: 'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task',
  wasmUrl: 'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22/wasm',
  runningMode: 'VIDEO',
  numFaces: 1,
  minFaceDetectionConfidence: 0.5,
  minFacePresenceConfidence: 0.5,
  minTrackingConfidence: 0.5,
  outputFaceBlendshapes: true,
  outputFacialTransformationMatrixes: false,
}

export class FaceLandmarkDetector {
  private landmarker: FaceLandmarker | null = null
  private config: LandmarkerConfig
  private isLoading = false
  private loadError: Error | null = null

  constructor(config: Partial<LandmarkerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async initialize(): Promise<void> {
    if (this.landmarker || this.isLoading) return

    this.isLoading = true
    this.loadError = null

    try {
      const vision = await FilesetResolver.forVisionTasks(this.config.wasmUrl)
      this.landmarker = await FaceLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath: this.config.modelUrl,
          delegate: 'GPU',
        },
        runningMode: this.config.runningMode,
        numFaces: this.config.numFaces,
        minFaceDetectionConfidence: this.config.minFaceDetectionConfidence,
        minFacePresenceConfidence: this.config.minFacePresenceConfidence,
        minTrackingConfidence: this.config.minTrackingConfidence,
        outputFaceBlendshapes: this.config.outputFaceBlendshapes,
        outputFacialTransformationMatrixes: this.config.outputFacialTransformationMatrixes,
      })
      this.isLoading = false
    } catch (error) {
      this.isLoading = false
      this.loadError = error instanceof Error ? error : new Error('Failed to initialize face landmarker')
      throw this.loadError
    }
  }

  async detectForVideo(video: HTMLVideoElement, timestampMs: number): Promise<FaceLandmarkerResult | null> {
    if (!this.landmarker || !video || video.readyState < video.HAVE_ENOUGH_DATA) {
      return null
    }
    return this.landmarker.detectForVideo(video, timestampMs)
  }

  parseResult(result: FaceLandmarkerResult): DetectedFace[] {
    if (!result.faceLandmarks || result.faceLandmarks.length === 0) {
      return []
    }

    return result.faceLandmarks.map((landmarks, faceIndex) => {
      const blendshapes = result.faceBlendshapes?.[faceIndex]
      const blendshapeMap = new Map<string, number>()
      if (blendshapes) {
        // Classifications is array-like but not iterable in TS types
        const categories = blendshapes.categories
        if (categories && typeof categories.length === 'number') {
          for (let i = 0; i < categories.length; i++) {
            const bs = categories[i]!
            blendshapeMap.set(bs.categoryName, bs.score)
          }
        }
      }

      // Compute bounding box from landmarks
      let minX = 1, minY = 1, maxX = 0, maxY = 0
      for (const lm of landmarks) {
        minX = Math.min(minX, lm.x)
        minY = Math.min(minY, lm.y)
        maxX = Math.max(maxX, lm.x)
        maxY = Math.max(maxY, lm.y)
      }

      return {
        boundingBox: {
          x: minX,
          y: minY,
          width: maxX - minX,
          height: maxY - minY,
        },
        landmarks: landmarks.map(lm => ({ x: lm.x, y: lm.y, z: lm.z })),
        blendshapes: blendshapeMap.size > 0 ? blendshapeMap : null,
        faceCount: result.faceLandmarks.length,
      }
    })
  }

  get running(): boolean {
    return this.landmarker !== null
  }

  get loading(): boolean {
    return this.isLoading
  }

  get error(): Error | null {
    return this.loadError
  }

  dispose(): void {
    if (this.landmarker) {
      this.landmarker.close()
      this.landmarker = null
    }
  }
}

let sharedDetector: FaceLandmarkDetector | null = null

export function getSharedDetector(config?: Partial<LandmarkerConfig>): FaceLandmarkDetector {
  if (!sharedDetector) {
    sharedDetector = new FaceLandmarkDetector(config)
  }
  return sharedDetector
}

export function disposeSharedDetector(): void {
  if (sharedDetector) {
    sharedDetector.dispose()
    sharedDetector = null
  }
}