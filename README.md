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

## Native checkbox integration

`jellyfin-native-season-checkboxes.js` reuses the existing Jellyfin `emby-checkbox` component's lifecycle to attach its Enter handler to the original season inputs. It preserves existing input references and change listeners, and does not submit requests. The adapter checks that the component is available before changing inputs and can be removed using `window.jellyfinNativeSeasonCheckboxes.remove()`.

Browser verification: the registered native component was found, and a temporary test checkbox toggled on/off with two Enter key events and exactly two change events. Physical TV OK behavior still needs validation. This script currently runs only in the browser tab where loaded; CSS does not install it. Persistent use requires an authorized script integration in the client or server. Do not run the older request key handler alongside it.

Native handler source: https://github.com/jellyfin/jellyfin-web/blob/master/src/elements/emby-checkbox/emby-checkbox.js
