# Frontend Structure

This document describes the role of the frontend files and folders in the current project.

Generated folders such as `dist/` and `node_modules/` are intentionally omitted because they are build/install outputs, not source structure.

## Root Files

| File | Role |
| --- | --- |
| `.gitignore` | Excludes generated files and local environment artifacts from Git. |
| `eslint.config.js` | ESLint configuration for code quality and lint rules. |
| `index.html` | Vite HTML entry page that loads the app root. |
| `package.json` | Project metadata, scripts, dependencies, and build commands. |
| `package-lock.json` | Locked dependency tree for reproducible installs. |
| `README.md` | Project overview and usage notes. |
| `tsconfig.json` | Base TypeScript configuration used by the app configs. |
| `tsconfig.app.json` | TypeScript config for the browser app source in `src/`. |
| `tsconfig.node.json` | TypeScript config for Node/Vite-side files such as `vite.config.ts`. |
| `vite.config.ts` | Vite build/dev server configuration and plugin setup. |

## Top-Level Folders

| Folder | Role |
| --- | --- |
| `public/` | Static files served directly by Vite. |
| `src/` | Main application source code. |
| `architecture_frontend/` | Existing documentation folder for frontend architecture notes. |
| `erreur/` | Saved analysis reports about discovered problems. |
| `solution/` | Saved remediation notes and solution plans. |

## `src/` Files

| File | Role |
| --- | --- |
| `src/main.tsx` | Client entry point. Mounts the router and imports the global stylesheet. |
| `src/router.tsx` | Creates the TanStack Router instance and provides the query client context. |
| `src/routeTree.gen.ts` | Generated route tree used by TanStack Router. |
| `src/server.ts` | Server entry used by TanStack Start for SSR/runtime handling. |
| `src/start.ts` | TanStack Start middleware/bootstrap configuration. |
| `src/styles.css` | Global Tailwind CSS entry plus theme tokens and design system variables. |
| `src/AppLayout.tsx` | Main application layout with sidebar, top header, role switcher, and logout area. |

## `src/assets/`

| File | Role |
| --- | --- |
| `src/assets/` | Static images and visual assets used by the UI. |

## `src/components/`

| File / Folder | Role |
| --- | --- |
| `src/components/AppLayout.tsx` | Re-export wrapper so imports can use the component from a components path. |
| `src/components/StateBadge.tsx` | Status badge helpers for prospection, demande, and suivi states. |
| `src/components/ui/` | Reusable UI primitives used across the app. |

## `src/components/ui/` Files

| File | Role |
| --- | --- |
| `accordion.tsx` | Accordion UI primitive. |
| `alert-dialog.tsx` | Alert dialog modal primitive. |
| `alert.tsx` | Alert/notification message component. |
| `aspect-ratio.tsx` | Maintains responsive aspect ratios. |
| `avatar.tsx` | Avatar UI primitive. |
| `badge.tsx` | Badge component used for labels and statuses. |
| `breadcrumb.tsx` | Breadcrumb navigation primitive. |
| `button.tsx` | Core button component with variants and sizes. |
| `calendar.tsx` | Calendar/date picker wrapper built on `react-day-picker`. |
| `card.tsx` | Card layout primitive for grouped content. |
| `carousel.tsx` | Carousel UI primitive. |
| `chart.tsx` | Chart helpers and wrappers around Recharts. |
| `checkbox.tsx` | Checkbox input primitive. |
| `collapsivle.tsx` | Collapsible UI primitive; filename appears misspelled but is used as a collapsible component. |
| `command.tsx` | Command palette/search primitive. |
| `context-menu.tsx` | Context menu primitive. |
| `dialog.tsx` | Dialog/modal primitive. |
| `drawer.tsx` | Drawer panel primitive. |
| `dropdown-menu.tsx` | Dropdown menu primitive. |
| `form.tsx` | Form helpers built around `react-hook-form`. |
| `hover-card.tsx` | Hover card popup primitive. |
| `input-otp.tsx` | OTP/code input component. |
| `input.tsx` | Standard text input component. |
| `label.tsx` | Form label component. |
| `menubar.tsx` | Menubar navigation primitive. |
| `navigation-menu.tsx` | Navigation menu primitive. |
| `pagination.tsx` | Pagination controls built from button/link primitives. |
| `popover.tsx` | Popover primitive for floating panels. |
| `progress.tsx` | Progress indicator component. |
| `radio-group.tsx` | Radio group input primitive. |
| `resizable.tsx` | Resizable panel layout wrapper. |
| `scroll-area.tsx` | Scrollable area wrapper with custom scroll behavior. |
| `select.tsx` | Select/dropdown input component. |
| `separator.tsx` | Separator/divider component. |
| `sheet.tsx` | Slide-in sheet/drawer wrapper. |
| `sidebar.tsx` | Sidebar layout system used by the app shell. |
| `skeleton.tsx` | Skeleton placeholder loading component. |
| `slider.tsx` | Slider input primitive. |
| `sonner.tsx` | Toast/notification wrapper around `sonner`. |
| `switch.tsx` | Toggle switch input primitive. |
| `table.tsx` | Table styling and structure helper. |
| `tabs.tsx` | Tabs navigation/content primitive. |
| `textarea.tsx` | Multi-line text input component. |
| `toggle-group.tsx` | Grouped toggle button primitive. |
| `toggle.tsx` | Toggle button primitive. |
| `tooltip.tsx` | Tooltip wrapper and content helpers. |

## `src/hooks/`

| File | Role |
| --- | --- |
| `use-mobile.ts` | Detects mobile viewport state for responsive behavior. |

## `src/lib/`

| File | Role |
| --- | --- |
| `error-capture.ts` | Captures runtime errors for later reporting. |
| `error-page.ts` | Renders the fallback HTML error page. |
| `lovable-error-reporting.ts` | Reports errors to the Lovable error events pipeline when available. |
| `ouvertures-store.ts` | Zustand store containing demo data and app state actions. |
| `photos.ts` | Photo/thumbnail helpers for agencies and local pictures. |
| `utils.ts` | Shared utility helpers, including `cn` for class merging. |

## `src/routes/`

| File | Role |
| --- | --- |
| `__root.tsx` | Root TanStack route, global head metadata, auth gate, and shared providers. |
| `index.tsx` | Dashboard route showing summary cards and workflow overview. |
| `login.tsx` | Login page with demo accounts and authentication flow. |
| `demandes.index.tsx` | List page for opening requests. |
| `demandes.$id.tsx` | Detailed request page with validation and rejection actions. |
| `prospections.index.tsx` | List page for prospect records. |
| `prospections.$id.tsx` | Detailed prospect page with status actions. |
| `suivis.index.tsx` | List page for opening follow-up records. |
| `suivis.$id.tsx` | Detailed follow-up page with process step controls. |

## Notes

- `src/routeTree.gen.ts` is generated and should normally not be edited by hand.
- `dist/` is build output and is not part of the source structure.
- `node_modules/` is the installed dependency tree and is not part of the application source.
