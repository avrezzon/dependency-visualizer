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

## 2025-05-23 - Missing Limits in Data Validation
**Vulnerability:** `validateSessionData` checked for property existence but did not limit the number of nodes/edges or validate the `history` array structure, exposing the app to DoS via large payloads or malformed history data.
**Learning:** Validating the "happy path" structure is not enough. Defensive validation must assume the worst-case size and structure (e.g., million-node graph) and enforce hard limits to protect the client.
**Prevention:** Enforce strict counts on collection fields (e.g., max 200 nodes) and recursively validate all nested objects (like `history`) with type and content checks.
