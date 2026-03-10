# Shorts Library & Aesthetics System

This directory (`public/shorts/`) contains all the dynamic media for your Short/Reel videos. Remotion relies on exactly matching paths to compile correctly without heavy webpack processing.

## Music & Audio (`/shorts/music/` and `/shorts/sfx/`)
1. Place your `.mp3` background tracks into `music/`.
2. Ensure you have transition sound effects (like swoosh/whoosh) inside `music/` or create an `sfx/` folder.
3. **Important:** When linking these in `Root.tsx`, always path them relative to `public` (e.g., `shorts/music/my-epic-song.mp3`).

## Video Assets (`/shorts/videos/`)
Place the 1080x1920 or 1920x1080 mp4 fragments here. Vertical (1080x1920) is preferred. Horizontal video uses a generated blurred wrapper.

## How to Apply "Themes" in `Root.tsx`
We have implemented a **Shorts Theme Engine**. You can easily switch the entire video's vibe (fonts, animations, colors, shadows) by supplying a `themeId`.

Available Themes:
- `'epic-bestseller'` (Golden colors, pop animation, cinematic fonts)
- `'dark-thriller'` (Red neon colors, fade blur, glitch transitions)
- `'neon-scifi'` (Cyan colors, float-in animation, crossfade transitions)
- `'romantic-rose'` (Pink colors, slide-up, zoom transitions)
- `'corporate-clean'` (Tech blue, minimal, pop animations)

**Example usage in `Root.tsx`:**
```tsx
<Composition
  id="Thriller-Books-2026"
  component={BookRecommendationShort}
  defaultProps={{
    themeId: 'dark-thriller',
    bgMusic: 'shorts/music/creepy-ambient.mp3',
    // ...
  }}
/>
```

No need to specify transitions or fonts individually, the layout automatically handles the mapping!
