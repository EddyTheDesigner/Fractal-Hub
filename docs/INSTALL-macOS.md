# Fractal Hub 1.1.0 — macOS

This package is a portable ScriptUI panel for EffectCraft. Install EffectCraft separately. It is not an After Effects plugin or a standalone application.

## Install

1. Extract this entire archive.
2. In EffectCraft, choose **File → Scripts → Install ScriptUI Panel…**.
3. Select the included **Fractal Hub.jsx**.
4. Choose **Window → Fractal Hub.jsx**, then dock or float the panel.

For manual installation, copy Fractal Hub.jsx into `~/Library/Application Support/EffectCraft/Scripts/ScriptUI Panels/` and restart EffectCraft.

To update, close the existing panel, reinstall the JSX and reopen it. Restart EffectCraft if it retains the older script. Saved presets and favorite IDs remain compatible.

## Compatibility

This package uses EffectCraft’s cross-platform ScriptUI API. Native execution on macOS has not been verified. The same JSX payload was validated with EffectCraft 0.14.0 for Windows.

The package contains no native executable, CPU-specific library or OS-specific code. Use an EffectCraft build supported by your operating system and processor. Node.js, Python and network access are not required to browse or apply presets.

Move the pointer horizontally across a thumbnail to scrub its motion preview. Stationary-hover timer playback depends on the host and was not verified in EffectCraft 0.14.0.

To uninstall, close the panel and remove its JSX file from the ScriptUI Panels directory. User preferences and saved presets remain in EffectCraft’s settings.
