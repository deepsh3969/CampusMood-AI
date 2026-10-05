import {
  Activity,
  BarChart3,
  Camera,
  Eye,
  Gauge,
  History,
  LayoutDashboard,
  Lock,
  MonitorPlay,
  Settings,
  ShieldCheck,
  Sparkles,
  Timer,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  end?: boolean
}

export const APP_NAV: NavItem[] = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/monitor', label: 'Live Monitor', icon: MonitorPlay },
  { to: '/sessions', label: 'Sessions', icon: History },
  { to: '/insights', label: 'Insights', icon: BarChart3 },
  { to: '/profile', label: 'Profile', icon: Eye },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export const LANDING_HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Camera permission',
    body: 'You press Start and your browser asks for camera access. Nothing is captured until you approve it.',
    icon: Camera,
  },
  {
    step: '02',
    title: 'Face landmark detection',
    body: 'An on-device model locates the face and tracks 478 facial landmarks directly inside your browser.',
    icon: Eye,
  },
  {
    step: '03',
    title: 'Expression estimation',
    body: 'Landmark geometry and blendshape coefficients are converted into visible-expression estimates with confidence values.',
    icon: Activity,
  },
  {
    step: '04',
    title: 'Session insights',
    body: 'At the end you get a neutral, observational summary of how expressions changed over your study session.',
    icon: Sparkles,
  },
]

export const LANDING_FEATURES = [
  {
    title: 'On-device expression estimates',
    body: 'Frames never leave your machine. Inference runs locally with WebGL acceleration where your browser supports it.',
    icon: Gauge,
  },
  {
    title: 'Live monitoring studio',
    body: 'Landmark overlay, FPS meter, face-status indicator and real-time distribution bars in a single focused view.',
    icon: MonitorPlay,
  },
  {
    title: 'Study session mode',
    body: 'Pick 25, 45 or 60 minutes (or a custom timer) and track expression trends across a focused work block.',
    icon: Timer,
  },
  {
    title: 'Trend analytics',
    body: 'Timeline, distribution, confidence and consistency charts across 7, 30 or 90 days of sessions.',
    icon: BarChart3,
  },
  {
    title: 'Supportive, non-medical guidance',
    body: 'Suggestions are observational and neutral — never diagnostic, never judgemental.',
    icon: Sparkles,
  },
  {
    title: 'Privacy center & consent',
    body: 'A full privacy hub, an explicit consent gate, and one-click deletion of every stored session.',
    icon: ShieldCheck,
  },
]

export const LANDING_TECH = [
  { name: 'React + TypeScript', role: 'Strict-typed component layer' },
  { name: 'Vite', role: 'Instant dev server, split production bundles' },
  { name: 'Tailwind CSS', role: 'Token-driven responsive design system' },
  { name: 'MediaPipe Tasks Vision', role: 'On-device face landmarks + blendshapes' },
  { name: 'Recharts', role: 'Session trend visualisation' },
  { name: 'Zustand', role: 'Minimal, predictable client state' },
  { name: 'Supabase-ready', role: 'Optional auth + persistence with RLS' },
  { name: 'Vitest + Playwright', role: 'Unit, component and smoke coverage' },
]

export const LANDING_FAQ = [
  {
    q: 'Does CampusMood AI record my webcam?',
    a: 'No. Frames are read into memory, analysed in your browser, and discarded on the next frame. Video is never written to disk and never uploaded. A screenshot is only created if you press the screenshot button yourself.',
  },
  {
    q: 'Can it tell how I really feel?',
    a: 'No. The system estimates visible facial-expression patterns in the image — for example raised mouth corners. Those patterns are an unreliable proxy for a person\u2019s actual emotional state, and the app always presents them as estimates.',
  },
  {
    q: 'Is this a mental-health tool?',
    a: 'No. CampusMood AI is not a medical device and performs no diagnosis, screening, or assessment of any kind. If you are struggling, please speak to someone you trust or your campus counselling service.',
  },
  {
    q: 'Does it identify who I am?',
    a: 'No. There is no facial recognition, no identity matching, and no biometric template is ever stored. The model only reports geometry — not who the face belongs to.',
  },
  {
    q: 'Where is my data stored?',
    a: 'Session statistics (duration, expression distribution, timeline) are stored locally in your browser by default. You can delete them at any time from Settings. Raw video and landmark frames are never stored.',
  },
  {
    q: 'Will it be used to grade or monitor me?',
    a: 'No. The product explicitly refuses use cases such as grading, attendance, discipline, hiring, or academic punishment, and expression results are never shared with third parties.',
  },
  {
    q: 'What happens if more than one person appears?',
    a: 'Expression analysis pauses and a notice is shown. The system is designed for one consenting student at a time and never analyses multiple people.',
  },
  {
    q: 'Which browsers work best?',
    a: 'Recent versions of Chrome, Edge, Firefox and Safari with a webcam. HTTPS is required for camera access — localhost is treated as secure during development.',
  },
]

export const RESPONSIBLE_AI_PILLARS = [
  {
    title: 'Estimates, not truth',
    body: 'Every output is labelled an expression estimate with a confidence value. The product never claims to know your emotional state.',
    icon: Activity,
  },
  {
    title: 'On-device by default',
    body: 'Landmark detection and expression estimation run in your browser. No frames are transmitted to a server.',
    icon: Lock,
  },
  {
    title: 'No identity, ever',
    body: 'No facial recognition, no identity matching, no biometric template — only transient geometric measurements.',
    icon: ShieldCheck,
  },
  {
    title: 'Never used for decisions',
    body: 'Grading, attendance, discipline, hiring and diagnosis are explicitly out of scope and blocked by product policy.',
    icon: Lock,
  },
]
