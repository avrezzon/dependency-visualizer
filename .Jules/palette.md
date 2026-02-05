## 2024-05-22 - Accessibility Patterns
**Learning:** Found hardcoded `aria-expanded="false"` on mobile menu toggle. This is a common React anti-pattern when porting static HTML.
**Action:** Always check toggle buttons for dynamic ARIA state binding.

## 2024-05-22 - Skip Link Pattern
**Learning:** The "Skip to main content" link pattern using Tailwind's `sr-only focus:not-sr-only` is highly effective and clean.
**Action:** Use this standard class set for all future skip links: `sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-indigo-600 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`

## 2024-05-23 - Accessible Modal Pattern
**Learning:** Modals require `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` for screen readers. Using `useId` from React 18 simplifies unique ID generation for labels. Escape key support is critical for keyboard users.
**Action:** Ensure all future modals implement this pattern: `useEffect` for Escape key, `useId` for title, and correct ARIA roles.

## 2024-05-24 - Modal Consistency
**Learning:** Found `WelcomeModal` implemented as a custom div overlay, ignoring the accessible `Modal.jsx` pattern. This leads to missing `role="dialog"` and focus management.
**Action:** Audit all custom overlays and replace with the standard `Modal` component or ensure they implement the accessibility primitives found in `Modal.jsx`.

## 2026-02-04 - Accessible Modal Pattern & Focus Management
**Learning:** Fixed invalid nesting of inputs inside buttons and implemented focus management for the WelcomeModal. Focusing the first interactive element on mount significantly improves keyboard usability for mandatory modals.
**Action:** Ensure all future modals, even custom ones, have role="dialog", aria-modal="true", and manage initial focus.

## 2026-02-05 - Accessible State Indicators
**Learning:** Visual-only state indicators (like icons or colors) must be exposed to screen readers. Modifying the parent container's `aria-label` is often cleaner than adding hidden text if the container is already interactive.
**Action:** When adding status icons to interactive elements, update the parent's `aria-label` with the status text and hide the icon with `aria-hidden='true'` and add a `title` for mouse users.
