export const APP_NAME = 'CampusMood AI'
export const APP_TAGLINE = 'Understand your study moments. Support your wellbeing.'
export const APP_DESCRIPTION =
  'CampusMood AI estimates visible facial expressions from your webcam during study sessions and turns them into supportive, non-medical insights — processed on-device whenever possible.'

export const CONSENT_VERSION = '2026-10-01'

export const DISCLAIMER_SHORT =
  'Expression estimates are based only on visible facial-expression patterns and may not reflect how you actually feel.'

export const DISCLAIMER_LONG =
  'CampusMood AI estimates visible facial expressions from camera frames. These are observational estimates of muscle patterns in the image — they are not measurements of your true feelings, not a diagnosis, and not a validated assessment of mental health or wellbeing. Results can be affected by lighting, camera angle, occlusion, culture, and individual differences.'

export const NON_MEDICAL_STATEMENT =
  'This is not a medical or mental-health diagnosis system, and it must never be used for grading, attendance, discipline, hiring, or any decision about a person.'

export const MAX_SESSION_HOURS = 4
export const MAX_TIMELINE_SAMPLES = 900
export const SAMPLE_INTERVAL_MS = 2000

export const STUDY_PRESETS = [25, 45, 60] as const

export const STORAGE_KEYS = {
  consent: 'campusmood.consent',
  settings: 'campusmood.settings',
  sessions: 'campusmood.sessions',
  auth: 'campusmood.auth',
  theme: 'campusmood.theme',
} as const

export const SUPPORT_EMAIL = 'privacy@campusmood.ai'
