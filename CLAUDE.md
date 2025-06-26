# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Zero-Knowledge Proof Demo Interface** - a Next.js web application that demonstrates ZK-SNARK proof generation and verification through an educational interface. The app simulates cryptographic operations to teach users about zero-knowledge proofs without requiring actual cryptographic libraries.

## Development Commands

```bash
# Development server
pnpm dev

# Production build
pnpm build

# Production server
pnpm start

# Code linting (ESLint + TypeScript)
pnpm lint
```

## Tech Stack & Architecture

- **Framework**: Next.js 15.2.4 with App Router (`/app/` directory structure)
- **Package Manager**: pnpm (use pnpm for all package operations)
- **Styling**: Tailwind CSS with extensive custom design system
- **UI Components**: Complete shadcn/ui component library in `/components/ui/`
- **TypeScript**: Strict configuration with path aliases (`@/*` maps to root)

## Key Files & Structure

- `/app/page.tsx` - Root page that renders the demo component
- `/components/` - **All components (custom + external)**:
  - `zk-proof-demo.tsx` - Main demo component (orchestration and layout)
  - `header.tsx` - App header with title and description
  - `key-benefits.tsx` - Three benefit cards (Privacy, Verification, Blockchain)
  - `generate-tab.tsx` - Secret input and proof generation interface
  - `share-tab.tsx` - Proof display and sharing functionality
  - `verify-tab.tsx` - Verification interface with educational content
  - `ui/` - shadcn/ui design system components (external library)
- `/hooks/` - **All hooks (custom + framework)**:
  - `use-zk-proof.ts` - Custom ZK proof business logic and state management
  - Framework hooks for mobile detection and toasts (external)
- `/lib/utils.ts` - Utility functions for className merging

## Application Architecture

The app follows **standard Next.js conventions** with clear separation of concerns:
1. **Components** (`/components/`) - All components in one place
   - Custom application components (main, header, tabs, etc.)
   - External UI library components (`ui/` subdirectory)
2. **Hooks** (`/hooks/`) - All hooks in one place  
   - Custom business logic (`use-zk-proof.ts`)
   - Framework utilities (mobile detection, toasts)
3. **App Router** (`/app/`) - Next.js 13+ app structure
   - Pages, layouts, and routing only

**Tab Structure**:
- **GenerateTab**: Secret input and proof generation simulation
- **ShareTab**: Proof export and sharing functionality  
- **VerifyTab**: Local and on-chain verification simulation

All cryptographic operations are **simulated** - the app demonstrates ZK-SNARK concepts without real cryptographic computations.

## Deployment & Sync

- **Auto-synced** with v0.dev deployments
- Changes from v0.dev are automatically pushed to this repository
- Deployed on Vercel: any changes here will trigger redeployment

## Design System

- Uses HSL-based color tokens with light/dark mode support
- Comprehensive Tailwind configuration in `tailwind.config.ts`
- Consistent spacing, typography, and component patterns
- Accessible design via Radix UI primitives

## Development Notes

- **Component-first approach**: Prefer editing existing components over creating new ones
- **Simulation-based**: All ZK proof operations are mocked for educational purposes
- **TypeScript strict mode**: All new code should be properly typed
- **Responsive design**: Components should work on mobile and desktop