# BrainGraph — AI Features

These are the AI-powered features the platform is built around, mapped to what's already
scaffolded in `backend/app/services/ai_service.py` plus a few for future phases.

## 1. Study Material Simplifier
Takes dense textbook/notes text and rewrites it in short sentences, plain language, bolded
key terms, and bullet form — tuned for ADHD reading patterns (low working-memory load,
scannable structure). Also auto-generates a bullet-point summary and flashcards (Q/A pairs)
from the same text.
**Endpoint:** `POST /api/materials/`

## 2. AI Task Breakdown ("Task Paralysis Buster")
ADHD students often stall on vague, large tasks. When a task is created, the AI splits it into
3–6 small, concrete, sub-20-minute steps with time estimates, so the student always has an
obvious "next action" instead of a wall of ambiguity.
**Endpoint:** `POST /api/tasks/`

## 3. Adaptive Learning Recommendations
Looks at the student's recent quiz/task scores plus their profile (baseline focus span,
preferred content style — visual/audio/text) and returns: 3 short actionable study tips, a
recommended focus-session length, a recommended break length, and a brief encouraging note.
Recalculated on demand from the dashboard.
**Endpoint:** `POST /api/ai/recommendations`

## 4. Focus Session Coach
Pomodoro/timeboxing sessions log planned vs. actual minutes and self-reported distractions.
A lightweight rule-based classifier (no LLM round-trip needed) flags sessions as
`on_track`, `high_distraction`, or `session_cut_short`, which feeds back into future
recommendations.
**Endpoint:** `POST /api/ai/focus-session/{id}/feedback`

## 5. Progress-Aware Difficulty Adjustment
`difficulty_level` on the user profile (`easy` / `medium` / `hard` / `adaptive`) is passed
into the simplifier and recommendation prompts, so content gets easier or more challenging
as performance trends up or down over time.

## Planned / Phase 2 ideas (not yet scaffolded)
- **Text-to-speech read-aloud** for simplified materials (helps auditory learners / reduces
  reading fatigue) — e.g. via browser Web Speech API or an external TTS provider.
- **Speech-to-text quick capture** for tasks/notes when typing feels like too much friction.
- **AI study buddy chat** — a persistent conversational tutor that can answer "explain this
  differently" or "quiz me" on a given study material.
- **Body-doubling / co-working rooms** — matches students into a shared virtual focus session
  (not AI, but pairs well with the Focus Mode timer already built).
- **Distraction-pattern insights** — weekly AI-generated summary of when/why focus sessions
  tend to break down, based on accumulated `focus_sessions` data.
- **Smart reminders** — AI decides *when* to nudge a student about an upcoming task based on
  their historical procrastination pattern, rather than a fixed offset before the due date.

## Model/provider notes
- `ai_service.py` currently calls OpenAI (`gpt-4o-mini`) via the `openai` Python SDK, using
  JSON-mode responses for structured output.
- To swap to Claude, replace the client in `ai_service.py` with the `anthropic` SDK and set
  `response_format` via a "respond only with valid JSON" system prompt (Claude doesn't have a
  dedicated JSON mode) — parse defensively.
- All AI calls are server-side only; the frontend never holds an AI provider API key.
