# Solution Setup

## What is broken
The build fails because the app is missing several required dependencies and has a few import/configuration mismatches.

Main causes:
- The `@/` alias is not configured in Vite and TypeScript.
- `AppLayout` is imported from `@/components/AppLayout`, but the file is actually `src/AppLayout.tsx`.
- `src/routes/__root.tsx` imports `../lib/lovable-error-reporting`, but that file does not exist.
- `package.json` is missing multiple packages used by the code, especially TanStack Router, Sonner, Zustand, clsx, tailwind-merge, and the Radix UI packages used in `src/components/ui/*`.

## Fix order

### 1. Configure the `@` alias
Add the same alias in both TypeScript and Vite so `@/...` resolves to `src/...`.

`tsconfig.app.json`:
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  }
}
```

`vite.config.ts`:
```ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
})
```

### 2. Fix the `AppLayout` import
The current route imports point to `@/components/AppLayout`, but the real file is `src/AppLayout.tsx`.

Use one of these options:
- Update the imports to `../AppLayout` where needed.
- Or create `src/components/AppLayout.tsx` that re-exports the component from `../AppLayout`.

Recommended simplest fix: update the route imports.

### 3. Restore or remove the missing error-reporting helper
`src/routes/__root.tsx` imports `../lib/lovable-error-reporting`, but that file is absent.

Use one of these options:
- Create `src/lib/lovable-error-reporting.ts` with a `reportLovableError` export.
- Or remove that import and the call if error reporting is not needed.

### 4. Install the missing packages
The code already imports these libraries, but they are not listed in `package.json`:
- `@tanstack/react-router`
- `sonner`
- `zustand`
- `clsx`
- `tailwind-merge`
- `@radix-ui/react-select`
- `@radix-ui/react-slider`
- `@radix-ui/react-slot`
- `@radix-ui/react-accordion`
- `@radix-ui/react-alert-dialog`
- `@radix-ui/react-aspect-ratio`
- `@radix-ui/react-avatar`
- `@radix-ui/react-checkbox`
- `@radix-ui/react-collapsible`
- `@radix-ui/react-context-menu`
- `@radix-ui/react-dialog`
- `@radix-ui/react-dropdown-menu`
- `@radix-ui/react-hover-card`
- `@radix-ui/react-label`
- `@radix-ui/react-menubar`
- `@radix-ui/react-navigation-menu`
- `@radix-ui/react-popover`
- `@radix-ui/react-progress`
- `@radix-ui/react-radio-group`
- `@radix-ui/react-scroll-area`
- `@radix-ui/react-separator`
- `@radix-ui/react-switch`
- `@radix-ui/react-tabs`
- `@radix-ui/react-toggle`
- `@radix-ui/react-toggle-group`
- `@radix-ui/react-tooltip`

Install them with npm, for example:
```bash
npm install @tanstack/react-router sonner zustand clsx tailwind-merge @radix-ui/react-select @radix-ui/react-slider @radix-ui/react-slot @radix-ui/react-accordion @radix-ui/react-alert-dialog @radix-ui/react-aspect-ratio @radix-ui/react-avatar @radix-ui/react-checkbox @radix-ui/react-collapsible @radix-ui/react-context-menu @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-hover-card @radix-ui/react-label @radix-ui/react-menubar @radix-ui/react-navigation-menu @radix-ui/react-popover @radix-ui/react-progress @radix-ui/react-radio-group @radix-ui/react-scroll-area @radix-ui/react-separator @radix-ui/react-switch @radix-ui/react-tabs @radix-ui/react-toggle @radix-ui/react-toggle-group @radix-ui/react-tooltip
```

## Expected result
After those changes, `npm run build` should stop failing on module resolution and missing dependency errors.

## Notes
If you want the smallest possible patch, start with:
1. Alias configuration
2. `AppLayout` import path
3. Missing packages
4. Missing `lovable-error-reporting` helper

That sequence matches the build failures in the current codebase.
