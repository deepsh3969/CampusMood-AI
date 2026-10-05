import { Panel, SectionHeading, Toggle } from '@/components/ui'
import { useState, useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

const SETTINGS_KEY = 'campusmood.settings'

interface Settings {
  landmarkOverlay: boolean
  analyticsEnabled: boolean
  sessionReminders: boolean
  theme: 'dark' | 'light'
  inferenceFps: 8 | 12 | 15
  mirroredVideo: boolean
}

const DEFAULT_SETTINGS: Settings = {
  landmarkOverlay: true,
  analyticsEnabled: true,
  sessionReminders: true,
  theme: 'dark',
  inferenceFps: 12,
  mirroredVideo: true,
}

function loadSettings(): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS
  } catch {
    return DEFAULT_SETTINGS
  }
}

function saveSettings(s: Settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  if (s.theme) {
    document.documentElement.classList.toggle('dark', s.theme === 'dark')
  }
}

export default function SettingsPage() {
  const { session } = useAuthStore()
  const [settings, setSettings] = useState<Settings>(() => loadSettings())

  useEffect(() => {
    saveSettings(settings)
  }, [settings])

  const updateBoolean = (key: keyof Pick<Settings, 'landmarkOverlay' | 'analyticsEnabled' | 'sessionReminders' | 'mirroredVideo'>, value: boolean) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
  }

  const updateFps = (value: 8 | 12 | 15) => {
    setSettings((prev) => ({ ...prev, inferenceFps: value }))
  }

  const updateTheme = (value: 'dark' | 'light') => {
    setSettings((prev) => ({ ...prev, theme: value }))
  }

  return (
    <div className="space-y-8 animate-fade-up max-w-2xl">
      <SectionHeading
        eyebrow="Settings"
        title="Customize your experience"
        description="Control camera behavior, data collection, appearance, and notifications."
        className="mb-6"
      />

      <Panel>
        <SectionHeading title="Camera & inference" description="How the monitor captures and processes frames." className="mb-4" />
        <div className="space-y-4">
          <Toggle
            checked={settings.landmarkOverlay}
            onChange={(v) => updateBoolean('landmarkOverlay', v)}
            label="Show facial landmarks"
            description="Overlay the 478-point mesh on the video feed."
          />
          <Toggle
            checked={settings.mirroredVideo}
            onChange={(v) => updateBoolean('mirroredVideo', v)}
            label="Mirror video"
            description="Flip the camera preview horizontally (like a mirror)."
          />
          <div className="space-y-2">
            <label className="label">Inference rate</label>
            <select
              value={settings.inferenceFps}
              onChange={(e) => updateFps(Number(e.target.value) as 8 | 12 | 15)}
              className="input max-w-xs"
            >
              <option value={8}>8 FPS (lower CPU)</option>
              <option value={12}>12 FPS (balanced)</option>
              <option value={15}>15 FPS (smoother)</option>
            </select>
            <p className="text-xs text-muted">Higher rates use more CPU. 12 FPS is recommended.</p>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeading title="Privacy & data" description="Control what data is stored and shared." className="mb-4" />
        <div className="space-y-4">
          <Toggle
            checked={settings.analyticsEnabled}
            onChange={(v) => updateBoolean('analyticsEnabled', v)}
            label="Local session analytics"
            description="Store expression timeline and statistics for the Insights dashboard. Data never leaves this device."
          />
          <div className="pt-4 border-t border-border">
            <button
              type="button"
              className="btn-danger w-full"
              onClick={() => {
                if (confirm('Delete all locally stored session data? This cannot be undone.')) {
                  localStorage.removeItem('campusmood.sessions')
                  alert('Session data deleted.')
                }
              }}
            >
              Delete all session data
            </button>
            <p className="mt-2 text-xs text-muted text-center">Removes timeline, distribution, and session records from this browser.</p>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeading title="Appearance" description="Visual preferences." className="mb-4" />
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="label">Theme</label>
            <select
              value={settings.theme}
              onChange={(e) => updateTheme(e.target.value as 'dark' | 'light')}
              className="input max-w-xs"
            >
              <option value="dark">Dark</option>
              <option value="light">Light</option>
            </select>
          </div>
        </div>
      </Panel>

      <Panel>
        <SectionHeading title="Notifications" description="Gentle reminders for study sessions." className="mb-4" />
        <Toggle
          checked={settings.sessionReminders}
          onChange={(v) => updateBoolean('sessionReminders', v)}
          label="Session reminders"
          description="Get a browser notification when it's time for a scheduled study session."
        />
      </Panel>

      <Panel>
        <SectionHeading title="Account" description="Your profile and authentication." className="mb-4" />
        <div className="space-y-3 text-sm">
          <p><strong>Email:</strong> {session?.user.email ?? '—'}</p>
          <p><strong>Display name:</strong> {session?.user.displayName ?? '—'}</p>
          <p><strong>Student ID:</strong> {session?.user.studentId ?? 'Not set'}</p>
          <p><strong>Provider:</strong> {session?.provider ?? 'local'}</p>
        </div>
      </Panel>
    </div>
  )
}