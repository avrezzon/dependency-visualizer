# Gemini Context: Dependency Visualizer

This document provides context for the Gemini agent when working on the `dependency-visualizer` project.

## Project Overview

This is a **Frontend-only React application** designed to simulate and visualize dependency management for a hypothetical microservice ecosystem. It helps users understand how version changes in upstream libraries (Models, Common Libs, Repos) propagate to downstream applications (Readers, Processors).

## Architecture & Codebase

- **Type**: Single Page Application (SPA).
- **Build Tool**: Vite.
- **Styling**: Tailwind CSS (Utility-first).
- **State Management**: React `useState` and `useMemo` within `App.jsx`.

### Key Files

- **`src/App.jsx`**: Currently contains **all** the business logic, UI components, and state definitions.
  - *Note*: This file is large and contains `INITIAL_NODES`, `INITIAL_EDGES`, utility functions, and the main `App` component. Future refactoring tasks might involve breaking this down into smaller sub-components (e.g., `NodeCard`, `Sidebar`, `GraphBoard`).
- **`src/main.jsx`**: Standard React DOM entry point.

## Domain Concepts

When modifying the logic, keep these domain concepts in mind:

1.  **Nodes**: Represent entities in the system.
    - Types: `core` (Foundation), `repo` (Data Access), `app` (Readers/Processors).
    - Properties: `version` (SemVer string), `id`, `label`.
2.  **Edges**: Represent specific dependencies (Source -> Target).
3.  **App Dependencies**: A separate state object (`appDependencies`) tracks what version of a dependency an *App* is currently "using". This is distinct from the *current* version of the dependency node.
4.  **Drift**: Occurs when `appDependencies[appId][depId] !== nodes.find(depId).version`.

## Development Conventions

- **Components**: Functional components with Hooks.
- **Styling**: Use Tailwind classes directly in JSX. Avoid creating separate CSS files unless for global resets.
- **Icons**: Use `lucide-react` for all iconography.
- **Code Style**: Standard JavaScript/React formatting.

## Development Workflow & Standards

### Test-Driven Development (TDD)
**All code changes must be approached using TDD.**

1.  **Red**: Write a failing test that defines the desired behavior or reproduces a bug.
2.  **Green**: Write the minimal amount of code necessary to pass the test.
3.  **Refactor**: Improve the code structure while ensuring tests remain green.

**Do not implement features without first defining them in a test.**

### CI/CD & Feedback Loop
The project uses GitHub Actions for Continuous Integration.
- **Pull Requests**: Tests and Linting are automatically run on every PR.
- **Feedback**: Agents (e.g., Jules) must monitor PR checks. If a PR build fails (Lint or Test), the agent must analyze the failure posted in the PR comments, reproduce it locally, and push a fix. The PR status is the source of truth for task completion.