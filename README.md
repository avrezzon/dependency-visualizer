# Dependency Visualizer

A React-based interactive tool for visualizing and managing version dependencies within a microservice architecture. This application helps track relationships between core libraries, repositories, and applications (readers/processors), identifying dependency drifts and simulating version bumps.

## Features

- **Interactive Visualization**: Visual representation of dependency chains (Core -> Repositories -> Apps).
- **Dependency Drift Detection**: Automatically identifies when an application is built against an older version of a dependency.
- **Version Management**: Simulate Major/Minor/Patch version bumps for any node.
- **Rebuild & Update**: One-click action to update an application's dependencies to the latest versions and bump its patch version.
- **Filtering & Inspection**: Filter by category (Foundation, Data Access, Readers, Processors) and inspect specific node details.
- **Versioning Guide**: Integrated documentation explaining versioning strategies and concepts.

## Tech Stack

- **Framework**: React (Vite)
- **Routing**: React Router Dom
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Testing**: Vitest, React Testing Library
- **Language**: JavaScript (ES6+)

## Getting Started

### Prerequisites

- Node.js (v16 or higher recommended)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd dependency-visualizer
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running the Application

Start the development server:
```bash
npm run dev
```
Open your browser to the URL provided (usually `http://localhost:5173`).

### Building for Production

Build the assets for deployment:
```bash
npm run build
```
The output will be in the `dist` directory.

### Running Tests

Run the test suite:
```bash
npm test
```

## Project Structure

- `src/App.jsx`: Application shell and routing configuration.
- `src/main.jsx`: Application entry point.
- `src/pages/`: Page components.
  - `MainPage.jsx`: Core visualizer dashboard and logic.
  - `VersioningGuide.jsx`: Documentation page.
- `src/components/`: Reusable UI components (Navbar, Modal, DependencyDetails).
- `src/index.css`: Global styles and Tailwind directives.