## 2024-05-22 - Prevent XSS in External Links
**Vulnerability:** Unvalidated `href` attribute in `DependencyDetails.jsx` allowed execution of `javascript:` URIs (XSS) via the "View PR" link.
**Learning:** React escapes text content but does not sanitize `href` attributes. Developers often assume React handles all XSS, but `javascript:` protocol remains a vector.
**Prevention:** Always validate user-provided URLs using a strict allowlist of protocols (e.g., `http:`, `https:`) before rendering them in `<a>` tags.

## 2026-02-03 - Missing Session Data Validation
**Vulnerability:** `MainPage.jsx` accepted uploaded JSON files without validation, leading to potential app crashes or invalid state if malformed data was uploaded.
**Learning:** React apps importing state from files must treat file content as untrusted input and validate it against a schema.
**Prevention:** Implemented `validateSessionData` in `src/utils/security.js` to enforce structure (nodes/edges arrays, IDs) before updating state.
