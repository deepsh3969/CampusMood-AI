# CampusMood AI

**AI-Powered Facial Expression & Student Wellbeing Insight Platform**

> "Understand your study moments. Support your wellbeing."

CampusMood AI is a privacy-first web application for college students that estimates **visible facial expressions** from the webcam during study sessions, tracks expression trends over time, and turns them into supportive, **non-medical** insights.

---

## Important disclaimers

- **Not a medical device.** CampusMood AI does not diagnose, treat, or screen for any medical or mental-health condition.
- **Not a mental-health assessment.** Expression estimates are *estimates of visible facial muscle patterns*, not measurements of a person's true feelings or psychological state.
- **Not facial recognition.** No identity matching, no biometric identity database, no grading, attendance, discipline, hiring, or academic-punishment use.
- Camera access is always explicit, revocable, and controlled by the student. Video frames are processed locally in the browser and are **never uploaded by default**.

See [docs/privacy.md](docs/privacy.md) and the in-app Privacy Center for the full policy.

---

## Features

- Professional landing page with clear responsible-AI and privacy messaging
- Student authentication (local adapter out of the box, Supabase-ready)
- Dashboard with session KPIs, skeletons, empty states, and error states
- Explicit, user-initiated webcam pipeline with full permission/error handling
- Real-time face detection + 478-point facial landmark overlay (MediaPipe Tasks Vision, on-device)
- Expression estimation engine driven by model blendshapes (Happy-looking, Neutral, Sad-looking, Angry-looking, Surprised, Fearful-looking, Disgusted-looking) with confidence values
- Live monitor with FPS, face status, session timer, distribution bars, and controls
- Study session mode with 25/45/60/custom countdown and a neutral-language summary
- Real-time analytics: timeline, distribution, confidence trend, detection consistency
- Insights dashboard with line, donut, bar, and calendar heatmap charts (7/30/90 days)
- Session history with per-session detail views and CSV/PDF-friendly report export
- Privacy Center, consent gate, settings, theme toggle, and data deletion
- Multi-face safety: analysis pauses when more than one face is visible

## Technology stack

| Layer | Choice |
| --- | --- |
| Frontend | React 18, TypeScript (strict), Vite 5 |
| Styling | Tailwind CSS 3, custom design tokens, dark/light themes |
| State | Zustand |
| AI / CV | MediaPipe Tasks Vision (FaceLandmarker, WASM + WebGL) |
| Charts | Recharts |
| Icons | lucide-react |
| Routing | React Router 6 |
| Backend | Serverless-ready; optional Supabase (Auth + Postgres + RLS) |
| Testing | Vitest, React Testing Library, Playwright (smoke) |
| Quality | ESLint (flat config), Prettier, TypeScript strict |
| Deploy | GitHub + Vercel (SPA) |

## Quick start

```bash
npm install
cp .env.example .env.local   # optional — works with no env vars at all
npm run dev
```

Open http://localhost:5173, register an account, and start a session.

### Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Type-check + production build |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | ESLint with zero-warning policy |
| `npm run format` / `format:check` | Prettier write / check |
| `npm run test` | Vitest unit + component tests |
| `npm run test:coverage` | Coverage report |
| `npm run test:e2e` | Playwright end-to-end smoke tests |

## Architecture

```
src/
  ai/          Model adapters: FaceDetector, LandmarkDetector, ExpressionClassifier, ExpressionEngine
  camera/      getUserMedia lifecycle, device errors, <CameraView />
  components/  UI, feature and chart components
  hooks/       Reusable React hooks
  layouts/     App and auth shells
  pages/       Route-level screens
  services/    Auth, session repository, analytics, reports, consent
  store/       Zustand stores
  types/       Shared domain types
  constants/   Labels, colors, limits
  utils/       Pure helpers (timers, math, formatting)
```

See [docs/architecture.md](docs/architecture.md) and [docs/ai-pipeline.md](docs/ai-pipeline.md).

## Environment variables

All variables are optional; the app runs in **local-only mode** without any of them.

| Variable | Purpose |
| --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL (enables Supabase auth + persistence) |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon (public) key |
| `VITE_APP_URL` | Public origin for links/allow-lists |
| `VITE_FACE_LANDMARKER_MODEL_URL` | Face landmarker `.task` bundle URL |
| `VITE_MEDIAPIPE_WASM_URL` | MediaPipe WASM asset directory |

`.env` and `.env.local` are git-ignored. Only `.env.example` is committed.

## Responsible AI

- Every prediction is labelled an **expression estimate**, never a "true emotion".
- Insights use neutral, observational language and always include the disclaimer that estimates may not reflect how the student actually feels.
- Inference runs on-device; no video is uploaded; no landmark data is retained.
- The system refuses to run expression analysis when more than one face is visible.

## Limitations

- Expression-to-feeling mapping is inherently unreliable; results are indicative at best.
- Occlusion, poor lighting, profile faces, sunglasses, and heavy masks reduce accuracy.
- The MediaPipe model bundle is fetched over HTTPS on first use (cached by the browser).
- Emotion labels are culture- and individual-specific; the engine estimates visible muscle patterns only.

## License

MIT
