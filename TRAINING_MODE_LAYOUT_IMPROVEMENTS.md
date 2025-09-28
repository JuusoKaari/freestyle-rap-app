### Training Mode Layout Improvements (UI/UX Plan)

This document proposes compact, video-friendly layout upgrades for training modes (e.g., Rhyme Explorer) to improve vertical space usage while preserving brand visibility in social clips.

## Goals
- Keep the Rheemy logo visible with minimal vertical cost
- Prioritize the stage (the circle) above the fold on desktop
- Reduce vertical stacking (logo → title → help → start → settings → stage)
- Make help and advanced settings accessible without always occupying space
- Ensure a clean look in screen recordings

## High‑impact, low‑friction changes
- **Compact sticky masthead**: Merge logo + mode title in a single sticky row (48–56px). Put Play/Start at right. On scroll, shrink sizes via a “compact” class. Use a subtle blurred background for contrast.
- **Help text as popover/accordion**: Replace the always-visible description with an “About” icon that toggles a popover. Keep copy short; long help inside the popover.
- **Primary action inside the stage**: Before playback, center the Start/Play button within the circle. After start, move the control into the masthead or a small floating toolbar.
- **Settings = collapsible toolbar**: Convert the settings row into a pill-style toolbar with key controls (bars per round, audio) always visible and an overflow “More” menu for the rest. On mobile, make it horizontally scrollable.
- **Stage above the fold (desktop)**: Reorder layout so the stage sits immediately under the masthead. Move help + secondary actions to a right-side panel or a collapsible section.
- **Brand exposure without vertical cost**: Keep a small top logo, and add a subtle stage watermark (logo in the stage corner) so branding remains in recordings.
- **Tighter vertical rhythm**: Reduce top/bottom margins, clamp large font sizes, and trim paddings to avoid overflow on short, wide screens.
- **Zen mode on idle**: Auto-hide nonessential UI (help/settings) after a few seconds of inactivity; reveal on pointer move or key press.

## Desktop layout sketch

```css
/* Desktop: stage prioritized, side panel for help/settings */
@media (min-width: 1024px) {
  .training-mode-layout {
    display: grid;
    grid-template-columns: 1fr 320px;
    gap: 1.25rem;
    align-items: start;
  }
  .training-main { order: 1; }
  .training-aside { order: 2; position: sticky; top: 64px; }
}
```

## Sticky compact masthead

```css
.app-masthead {
  position: sticky;
  top: 0;
  z-index: 10;
  display: grid;
  grid-template-columns: auto 1fr auto; /* logo | title | play */
  align-items: center;
  gap: 0.75rem;
  height: clamp(48px, 6vh, 56px);
  padding: 0 0.75rem;
  background: color-mix(in oklab, #111 85%, transparent);
  backdrop-filter: blur(8px);
}
.app-masthead.compact .brand { transform: scale(0.9); opacity: 0.9; }
```

## Help as popover

```css
.help-trigger { cursor: pointer; opacity: 0.85; }
.help-popover {
  position: absolute; /* or use a UI lib */
  inset: auto 0 100% auto;
  max-width: 360px;
}
```

## Settings toolbar

```css
.settings-toolbar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: nowrap;
  overflow-x: auto; /* mobile scroll */
}
.settings-toolbar .more { margin-left: auto; }
```

## Stage sizing guidance

- Use viewport-height clamping for the stage container so it fits on short, wide screens.
- Keep the circle square via aspect-ratio and cap width by `vh`.

```css
.rhyme-explorer-stage {
  width: min(100%, 40vh);
  aspect-ratio: 1 / 1;
  max-height: 40vh;
}
.center-word h3 { font-size: clamp(2rem, 6vw, 3.2rem); }
```

## Optional: Branding watermark in stage

```css
.stage-watermark {
  position: absolute; top: 8px; left: 8px;
  width: clamp(48px, 8vw, 72px);
  opacity: 0.18; pointer-events: none;
}
```

## Implementation sequence
1. Build sticky masthead (logo + title + Play), shrink on scroll.
2. Move long help text into a popover triggered by an icon.
3. Convert settings row to a compact toolbar with an overflow menu.
4. Apply desktop two-column layout so the stage is visible above the fold.
5. Add optional stage watermark for brand presence in recordings.
6. Add “Zen mode” auto-hide behavior for help/settings on idle.

## Open questions
- Which settings are “primary” vs “overflow” for your workflows?
- Do we want a persistent right-side panel on desktop, or fully collapsible?
- Should the Play button live in the masthead after start, or as a floating control near the stage?


