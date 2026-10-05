import type { DetectedFace } from './faceLandmarker'

export interface LandmarkRenderOptions {
  showMesh: boolean
  showBoundingBox: boolean
  showKeyPoints: boolean
  meshColor: string
  meshLineWidth: number
  keyPointColor: string
  keyPointRadius: number
  boundingBoxColor: string
  boundingBoxLineWidth: number
}

export const DEFAULT_LANDMARK_OPTIONS: LandmarkRenderOptions = {
  showMesh: true,
  showBoundingBox: false,
  showKeyPoints: true,
  meshColor: '#818CF8',
  meshLineWidth: 0.8,
  keyPointColor: '#34D399',
  keyPointRadius: 2,
  boundingBoxColor: '#F87171',
  boundingBoxLineWidth: 2,
}

/** MediaPipe face mesh triangulation (468 points) - simplified connections for performance */
export const FACE_MESH_CONNECTIONS: [number, number][] = [
  // Face oval
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [10, 11], [11, 12], [12, 13], [13, 14], [14, 15], [15, 16], [16, 17], [17, 18],
  [18, 19], [19, 20], [20, 21], [21, 22], [22, 23], [23, 24], [24, 25], [25, 26],
  [26, 27], [27, 28], [28, 29], [29, 30], [30, 31], [31, 32], [32, 33], [33, 34],
  [34, 35], [35, 36], [36, 37], [37, 38], [38, 39], [39, 40], [40, 41], [41, 0],
  // Left eyebrow
  [46, 47], [47, 48], [48, 49], [49, 50], [50, 51], [51, 52],
  // Right eyebrow
  [53, 54], [54, 55], [55, 56], [56, 57], [57, 58], [58, 59],
  // Left eye
  [60, 61], [61, 62], [62, 63], [63, 64], [64, 65], [65, 66], [66, 67], [67, 60],
  // Right eye
  [68, 69], [69, 70], [70, 71], [71, 72], [72, 73], [73, 74], [74, 75], [75, 68],
  // Nose bridge
  [0, 46], [0, 53],
  // Lips outer
  [76, 77], [77, 78], [78, 79], [79, 80], [80, 81], [81, 82], [82, 83], [83, 84],
  [84, 85], [85, 86], [86, 87], [87, 88], [88, 89], [89, 90], [90, 91], [91, 76],
  // Lips inner
  [92, 93], [93, 94], [94, 95], [95, 96], [96, 97], [97, 98], [98, 99], [99, 92],
]

export function drawLandmarks(
  ctx: CanvasRenderingContext2D,
  faces: DetectedFace[],
  videoWidth: number,
  videoHeight: number,
  options: Partial<LandmarkRenderOptions> = {},
  mirrored: boolean = true
): void {
  const opts = { ...DEFAULT_LANDMARK_OPTIONS, ...options }

  for (const face of faces) {
    const { landmarks, boundingBox } = face

    if (opts.showMesh && landmarks.length > 0) {
      ctx.strokeStyle = opts.meshColor
      ctx.lineWidth = opts.meshLineWidth
      ctx.beginPath()

      for (const [i, j] of FACE_MESH_CONNECTIONS) {
        if (i < landmarks.length && j < landmarks.length) {
          const pi = landmarks[i]!
          const pj = landmarks[j]!
          const xi = mirrored ? (1 - pi.x) * videoWidth : pi.x * videoWidth
          const yi = pi.y * videoHeight
          const xj = mirrored ? (1 - pj.x) * videoWidth : pj.x * videoWidth
          const yj = pj.y * videoHeight
          ctx.moveTo(xi, yi)
          ctx.lineTo(xj, yj)
        }
      }
      ctx.stroke()
    }

    if (opts.showKeyPoints && landmarks.length > 0) {
      ctx.fillStyle = opts.keyPointColor
      for (const lm of landmarks) {
        const x = mirrored ? (1 - lm.x) * videoWidth : lm.x * videoWidth
        const y = lm.y * videoHeight
        ctx.beginPath()
        ctx.arc(x, y, opts.keyPointRadius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    if (opts.showBoundingBox && boundingBox) {
      ctx.strokeStyle = opts.boundingBoxColor
      ctx.lineWidth = opts.boundingBoxLineWidth
      const x = mirrored
        ? (1 - boundingBox.x - boundingBox.width) * videoWidth
        : boundingBox.x * videoWidth
      const y = boundingBox.y * videoHeight
      const w = boundingBox.width * videoWidth
      const h = boundingBox.height * videoHeight
      ctx.strokeRect(x, y, w, h)
    }
  }
}

/** Draw blendshape bars for debugging */
export function drawBlendshapeBars(
  ctx: CanvasRenderingContext2D,
  blendshapes: Map<string, number> | null,
  x: number,
  y: number,
  width: number,
  height: number
): void {
  if (!blendshapes || blendshapes.size === 0) return

  const entries = Array.from(blendshapes.entries()).sort((a, b) => b[1] - a[1])
  const barHeight = height / entries.length

  ctx.font = '10px monospace'
  ctx.fillStyle = '#E2E8F0'

  entries.forEach(([name, score], i) => {
    const barY = y + i * barHeight
    const barWidth = score * width

    ctx.fillStyle = '#34D399'
    ctx.fillRect(x, barY, barWidth, barHeight * 0.7)

    ctx.fillStyle = '#E2E8F0'
    ctx.fillText(name, x + barWidth + 4, barY + barHeight * 0.5)
  })
}