## 2024-05-22 - Accessibility Patterns
**Learning:** Found hardcoded `aria-expanded="false"` on mobile menu toggle. This is a common React anti-pattern when porting static HTML.
**Action:** Always check toggle buttons for dynamic ARIA state binding.

## 2024-05-22 - Skip Link Pattern
**Learning:** The "Skip to main content" link pattern using Tailwind's `sr-only focus:not-sr-only` is highly effective and clean.
**Action:** Use this standard class set for all future skip links: `sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-white focus:text-indigo-600 focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500`

## 2024-05-23 - Accessible Modal Pattern
**Learning:** Modals require `role="dialog"`, `aria-modal="true"`, and `aria-labelledby` for screen readers. Using `useId` from React 18 simplifies unique ID generation for labels. Escape key support is critical for keyboard users.
**Action:** Ensure all future modals implement this pattern: `useEffect` for Escape key, `useId` for title, and correct ARIA roles.
