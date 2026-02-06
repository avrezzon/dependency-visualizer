## 2024-05-22 - Prevent XSS in External Links
**Vulnerability:** Unvalidated `href` attribute in `DependencyDetails.jsx` allowed execution of `javascript:` URIs (XSS) via the "View PR" link.
**Learning:** React escapes text content but does not sanitize `href` attributes. Developers often assume React handles all XSS, but `javascript:` protocol remains a vector.
**Prevention:** Always validate user-provided URLs using a strict allowlist of protocols (e.g., `http:`, `https:`) before rendering them in `<a>` tags.

## 2026-02-03 - Missing Session Data Validation
**Vulnerability:** `MainPage.jsx` accepted uploaded JSON files without validation, leading to potential app crashes or invalid state if malformed data was uploaded.
**Learning:** React apps importing state from files must treat file content as untrusted input and validate it against a schema.
**Prevention:** Implemented `validateSessionData` in `src/utils/security.js` to enforce structure (nodes/edges arrays, IDs) before updating state.

## 2025-05-15 - Loose Type Validation in Data Import
**Vulnerability:** The initial `validateSessionData` implementation checked for property existence but ignored data types and lengths. This allowed non-string values (causing render crashes) and excessively large payloads (DoS risk).
**Learning:** "Existence checks" are insufficient for security validation. Defensive coding requires strict type enforcement and boundary checks (e.g., max string length) on all external inputs.
**Prevention:** Updated `validateSessionData` to strictly verify that `id`, `label`, and other text fields are strings and fall within defined length limits (1000 chars).

## 2025-10-28 - Denial of Service Protection in Data Import
**Vulnerability:** The application was vulnerable to client-side DoS attacks via excessively large JSON file uploads or complex graph structures (millions of nodes), which could freeze the browser tab.
**Learning:** Client-side applications must enforce limits on both file size (bytes) and logical structure size (item counts) to prevent resource exhaustion, even if the data never reaches a server.
**Prevention:** Implemented strict file size limits (1MB) in `MainPage.jsx` and logical limits (200 nodes, 500 edges) in `validateSessionData` to reject malicious payloads early.
