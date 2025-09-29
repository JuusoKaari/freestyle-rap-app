### Training Mode Launch Dialog Plan

This document defines the UX for launching a training session via a single intro/settings dialog that consolidates help content and session configuration, then is reopenable via a single Settings button during the session.

## Goals
- Reduce pre-session friction while keeping choices intentional
- Keep the stage prioritized during sessions (minimal on-canvas chrome)
- Enable quick iteration: tweak settings and relaunch without leaving the mode
- Support both time-bounded drills and open-ended free play

## Scope
- Applies to all training modes (e.g., Rhyme Explorer) at session start
- Replaces on-page help/settings blocks with a modal; during sessions only a Settings button is shown to reopen it
- Moves beat and vocabulary selection from the main menu into the modal
- Persists last-used session settings between sessions (beat, vocabulary, mode settings, duration)

## Launch flow (modal → Settings button)
1. User selects a training mode from the main menu (no beat/vocab choice upfront).
2. Intro/settings modal opens with:
   - Mode help/description (concise; full copy expandable inside the modal)
   - Session settings (see next section)
   - Primary action: Start session
3. On Start:
   - Close the modal; show a single Settings button in the masthead to reopen it
   - The stage becomes the primary focus; help/settings are hidden from the canvas
4. During session:
   - User can reopen the dialog via the Settings button to adjust and relaunch
   - Optional: small About/Help icon in the masthead opens the help section of the modal

## Simple mode (first-run)
- For first-time visitors (or until they opt into full settings), show a simplified dialog:
  - Display only the mode help/description and a Start button
  - Auto-select sensible defaults (featured beat, default vocabulary, default rhyme matching, recommended duration)
  - Provide a lightweight "Customize" link to switch to the full settings dialog
- After first successful session, default to the full dialog; remember the user's choice

## Session settings (in modal)
- Beat
- Vocabulary
- Rhyme matching settings (e.g., sorting)
- Training mode specific settings
- Duration
  - Presets (e.g., 3/5/10/20 min), custom minutes, and "No limit" (free-play)
  - Units: minutes or musical bars (e.g., 2 min or 16 bars)
  - Show cross-unit estimate based on BPM so choices feel natural
    - Example conversion for common time (4/4): one bar duration = \(60 \times 4 / \text{BPM}\) seconds

## App-wide and in-session switchers
- Beat
- Vocabulary
- Rhyme matching settings (e.g., sorting)
- Training mode specific settings

## Time-bounded sessions/drills (pros/cons)
- Pros
  - UX: Clear start/finish; reduced decision fatigue; natural restart/resume points
  - Engagement/hookability: Streaks, challenges ("3 drills/day"), shareable achievements, templates
  - Business/marketing: Premium drill packs and advanced editors; campaignable programs; better session analytics and retention loops
- Cons
  - UX: Setup friction if the editor is heavy; timer expiry may interrupt flow; added complexity for mid-session setting changes
  - Engagement: Over-gamification risk; timers may deter exploratory play; fixed lengths may not fit all creative styles
  - Business/ops: More surfaces to build/maintain (templates, sharing, analytics); scope creep; paywall sensitivity; requires reliable progress tracking

## Visual/interaction notes
- Keep a compact sticky masthead; show a single Settings button to reopen the dialog
- Show a session countdown timer in the masthead: display mm:ss for time-based drills, or bars remaining for bar-based drills; hide or show elapsed time for "No limit".
- Prioritize the stage above the fold on desktop; avoid rendering full help/settings during sessions
- Maintain brand visibility with the top logo; optional subtle stage watermark for recorded clips
- Preload the dialog with the user's last-used settings; if none exist, use defaults (and Simple mode for first-run)

## Implementation sequence
1. Implement the intro/settings modal
   - 1a. After Start, show a single Settings button in the masthead to reopen the dialog
   - 1b. Hide old on-page help/settings during sessions (move content into modal)
   - 1c. Move beat/vocab selection from main menu into the modal
2. Move training mode specific help text into the intro modal; keep a lightweight HELP icon to reopen during the session
3. Ensure the Settings button reopens the dialog and supports relaunching the session after changes
4. Keep the main logo visible at the top for brand presence; ensure stage remains the primary focus
5. Add duration support: presets, custom, minutes/bars units, BPM-based estimates, and "No limit"
6. Add settings persistence: save and restore last-used beat, vocabulary, mode settings, and duration (per mode); include a "Reset to defaults" affordance
7. Add a masthead session countdown timer synced to duration units; for bars, compute via BPM; hide or show elapsed time for "No limit"
8. Implement Simple mode detection (first-run): show simplified dialog with Start only; add "Customize" to reveal full settings and remember preference
9. Add optional stage watermark for brand presence in recordings
10. Add "Zen mode": auto-hide nonessential UI on idle; reveal on pointer or key

## Analytics (recommended)
- Log session template (mode, beat, vocab, settings, duration unit/value)
- Track session start/stop/relaunch and mid-session tweaks
- Measure completion rates for time-bounded drills vs. No limit free play
- Record settings persistence events (save/restore), Simple mode usage, and conversions to full settings

## Decisions
- Single Settings button only (no quick toggles)
- No right-side panels
- No Play/Start control post-launch; relaunch/change via Settings dialog
- Exit/stop via Settings dialog or the nav-menu
- Persist last-used settings between sessions
- Show Simple mode on first visit; allow switching to full settings and remember choice

