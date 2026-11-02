# Netflix TV theme for Jellyfin

Client-side CSS theme for Jellyfin Web in TV mode, including Jellyfin Enhanced request views.

## Install CSS

Copy `netflix-tv.css` into Jellyfin → Settings → Display → Custom CSS, save, then reload the client. This setting applies to the current client; repeat separately on the TV.

The latest CSS adds square season checkboxes, hides server/folder selectors while retaining their default values, and leaves the quality profile visible. It also removes the independent sticky keyboard scroll area as a candidate fix for native arrow-key navigation. That navigation change still needs validation on the TV.

`netflix-tv-quality-search-repair.css` contains only the latest repair rules, already included in the full theme.

## Optional JavaScript experiments

`jellyfin-request-tv-controls.js` adds OK/Enter checkbox toggling and dialog navigation. `jellyfin-search-tv-controls.js` adds explicit transitions between keyboard and results. These are separate optional experiments, not part of CSS and not automatically installed. Running them in the browser console lasts until reload. The search script exposes `window.jellyfinSearchTvControls.remove()` to disable it.

CSS can style native checkboxes and improve layout geometry, but cannot assign new OK/Enter key behavior.

## Status

Work in progress. Browser layout and TV firmware can differ. Playback transparency must be preserved. No server credentials or user configuration are included.
