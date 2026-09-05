1. Update `Atlas.jsx` to introduce `ax-mac-window`.
   - Add `leftOpen` and `rightOpen` state (default false).
   - The Mac titlebar contains the 3 dots, the title of the stage, and two toggle buttons for side panels.
   - Wrap the `ax-rail` and `ax-panel` in floating/sliding containers, or make them flex items that collapse. Since we want a "near full screen Mac window", the sidebars should probably be absolute positioned floating glass panels (like Xcode inspectors or floating palettes), or they can push the content but have a sleek transition. Absolute floating glass panels (`backdrop-blur`) are more "premium".
2. Update `atlas.css` for high-end styling.
   - Use Ethereal Glass / Ethereal aesthetics for sidebars. `backdrop-blur-2xl`, deep translucent backgrounds, hairline borders.
   - Mac window shadow and borders.
3. Update `agent-composer` Stage:
   - Make it resemble the real Claude desktop UI:
     - The message thread should look like Claude's UI (fonts, colors, spacing).
     - The Composer should match Claude's input bar exactly (the rounded pill, attachment clipping, font sizes, colors).
     - The tool calling should use the Claude artifact/tool UI pattern (the expanding accordion with yellow/green/gray status dots).
4. Update `text-reveal` Stage:
   - Add more text effects (e.g., Apple-style "scrub" reveal on scroll, GSAP-like split text staggered rotation).
   - Add more art text materials (e.g., holographic foil, glassmorphism text, neon tube).
