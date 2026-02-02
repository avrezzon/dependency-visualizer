## 2024-05-22 - Prevent XSS in External Links
**Vulnerability:** Unvalidated `href` attribute in `DependencyDetails.jsx` allowed execution of `javascript:` URIs (XSS) via the "View PR" link.
**Learning:** React escapes text content but does not sanitize `href` attributes. Developers often assume React handles all XSS, but `javascript:` protocol remains a vector.
**Prevention:** Always validate user-provided URLs using a strict allowlist of protocols (e.g., `http:`, `https:`) before rendering them in `<a>` tags.

## 2024-05-23 - Session Import Input Validation
**Vulnerability:** The session import feature (`MainPage.jsx`) parsed and used JSON content without strictly validating its structure, leading to potential Denial of Service (DoS) or UI crashes if keys like `nodes` or `id` were missing or malformed.
**Learning:** `JSON.parse` is not enough; blindly assuming the presence and type of deep properties in imported data is unsafe.
**Prevention:** Implement strict schema validation (checking types, existence of required fields like `id`, arrays) before loading any external data into the application state. Added `validateSessionData` in `src/utils/security.js`.
