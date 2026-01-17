# Nebula White V.2 Theme Rules

> **STRICT ENFORCEMENT**: All UI/UX decisions must align exclusively with this design system. No exceptions.

## 1. Core Philosophy
**"A clean, clinical atmosphere utilizing stark white and carbon black for a sophisticated architectural feel."**

## 2. Color Palette (Strict Hex Codes)
Use **only** these colors. Do not dilute or introduce new hues.

| Role | Color | Hex | Usage |
| :--- | :--- | :--- | :--- |
| **Canvas / Base** | **Nebula White** | `#FFFFFF` | Main backgrounds, clean space |
| **Surface / Contrast** | **Carbon Black** | `#111111` | High-contrast panels, text, primary buttons |
| **Structure** | **Concrete Grey** | `#F5F5F5` | Subtle backgrounds, dividers |
| **Detail** | **Steel Grey** | `#333333` | Secondary text, inactive states |
| **Action / Alert** | **Flare Orange** | `#FF4D00` | CTAs, active states, highlights (**Use sparingly**) |

## 3. Typography
| Type | Font Family | Weight | Usage |
| :--- | :--- | :--- | :--- |
| **Primary** | **Montserrat** | 400, 600, 800 | Headings, Body, UI elements |
| **Technical** | **Roboto Mono** | 400, 500 | Code, Data values, Micro-labels |

## 4. Component Rules
### Buttons & Actions
*   **Primary Action**: Carbon Black (`#111111`) background, White Text. Sharp/Slightly rounded corners (`4px`).
*   **High Priority / CALL TO ACTION**: Flare Orange (`#FF4D00`) background, White Text.
*   **Secondary**: Transparent background, Carbon Black border (`1px`).

### Visual Style
*   **Shadows**: Minimal or absent. Rely on high contrast boundaries.
*   **Borders**: Thin, crisp lines.
*   **Spacing**: Architectural and airy. Avoid clutter.
*   **Glassmorphism**: **BANNED**. Use solid, opaque surfaces.

## 5. React & TypeScript Architecture

### Core Principles
*   **Single Responsibility**: Components must be small, atomic, and strictly focused on a single functionality.
*   **View Layer Structure**: "Views" or "Pages" must **only** instantiate and orchestrate layout. Application logic belongs in custom hooks or dedicated feature components.
*   **Shared Components**: All reusable UI elements must reside in a `components/shared/` directory.
*   **Type Definitions**: strictly use `type` over `interface` for all definitions. Interfaces are reserved ONLY for cases where declaration merging is technically required.

### UI Framework (Material UI)
*   **Base Library**: Strictly use **MUI (Material UI)** components.
*   **Styling Strategy**:
    *   Use the `sx` prop exclusively for styling overrides.
    *   **No "Inline" Arbitrary Values**: Do not rely on inline hardcoded values (e.g., `15px`, `#ccc`). **ALWAYS** use Theme tokens (e.g., `p: 2`, `color: 'text.secondary'`) inside `sx`.
    *   **No `style={{}}`**: The `style` prop is banned.

### Performance & React Flow
*   **Render Control**: Treat `useEffect`, `useMemo`, and `useCallback` as critical program flow controls.
*   **Prevention**: actively prevent unnecessary re-renders. Memoize functions passed as props and expensive calculations. Ensure dependency arrays are accurate to avoid render loops.
*   **Render Scope**: Components must **only** trigger updates in related components that genuinely require re-rendering. **Mandatory Check**: Verify render behavior after *every* implementation to prevent performance regression.



## 6. Package Management
*   **Runtime & Manager**: Strictly use **Bun** for all package management and runtime tasks.
    *   **Install**: `bun install`
    *   **Run**: `bun run <script>`
    *   **Execute**: `bunx <command>`
*   **Prohibited**: Do NOT use `npm`, `pnpm`, or `yarn`.
