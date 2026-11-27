# NYX Admin Dashboard

NYX is a React application built with Vite for managing POS and class-related operations.

## Architecture

The frontend follows a **feature-based modular architecture with layered organization**. Business areas are grouped into feature folders, while shared UI, hooks, and API access are separated into technical layers. This is a practical modular structure, not a strict Clean Architecture implementation.

## Source layout

| Location | Responsibility |
| --- | --- |
| `src/app/` | Application shell, route declarations, providers, and global styles |
| `src/features/auth/` | Login pages, login service, and login styles |
| `src/features/pos/` | POS pages grouped by categories, customers, inventory, orders, products, reports, and settings |
| `src/features/training/` | Training pages and services grouped by bookings, courses, overview, students, venues, and settings |
| `src/features/rentals/` | Rental pages and supporting components |
| `src/features/canteen/` | Canteen pages, components, and services |
| `src/features/tournaments/` | Tournament pages and styles |
| `src/shared/` | Shared components, hooks, services, and utilities used across features |
| `src/assets/` | Application images and static assets |
| `src/main.jsx` | Vite application entry point |

Feature-specific pages, components, hooks, services, and styles live together where practical. Feature hooks manage feature-specific UI state and call feature services; those services use the shared API client. Shared hooks and UI remain in `shared/` to avoid duplicating cross-feature behavior.

React components and pages use PascalCase filenames, CSS files use kebab-case, and hooks use the `use` prefix.
## Development

Install dependencies and start the Vite development server:

```sh
npm install
npm run dev
```

Create a production build with:

```sh
npm run build
```

Run ESLint with:

```sh
npm run lint
```

Run the API URL configuration tests with:

```sh
npm test
```

## API configuration

Local API origins are configured in the ignored `.env` file using `VITE_BASE_URL` and `VITE_PAYMENT_BASE_URL`. Feature API service modules use `src/shared/services/apiClient.js`, which builds request URLs from these two origins. Keep using the client when adding feature service requests; component-level requests can be migrated incrementally.

Production builds receive these values through GitHub Actions secrets. Vite variables are included in the public frontend bundle and must not contain credentials.
