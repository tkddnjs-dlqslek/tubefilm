# TubeFilm — Privacy Policy

**Last updated: 2026-05-18**

## Summary

TubeFilm **does not collect, store, or transmit any personal information.**

## Details

### Information Collected

None.

### External Transmission

None. TubeFilm does not communicate with any external server. No analytics, advertising, or remote logging is used.

### Local Storage

Only **user preference values** required for the extension to function are stored via Chrome's `chrome.storage.sync` API. Stored items:

- Enabled state (on/off)
- Selected preset ID (e.g., `"newjeans"`)
- Slider values (intensity, grain, etc.)
- Panel position / collapsed state
- "Disable filter on ads" option / first-run hint dismissed flag

This data is held in Chrome sync storage so that **settings can sync across the user's Chrome devices signed in to the same Google account**. The sync mechanism is managed by Google; the extension itself does not transmit the data.

If Chrome sync is disabled, settings are stored only on the local device.

### Permission Usage

| Permission | Purpose |
|---|---|
| `storage` | Persist user settings via Chrome sync storage |
| `host_permissions: *://*.youtube.com/*` | Apply filters only on YouTube pages (no access to other sites) |

### Data Sale / Third-Party Sharing

Not applicable.

### Children's Privacy

Not applicable — no data is collected.

### Contact

Issues and feedback are accepted via the GitHub repository: https://github.com/tkddnjs-dlqslek/tubefilm

### Revision History

- 2026-05-18: Initial draft (v0.2.0)
