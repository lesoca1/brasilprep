# BrasilPrep engineering agreement

Implement only the phase explicitly approved by the user. Phase 1 is the application foundation and visual system. Stop after delivery and wait for approval before adding future phases.

- Preserve Next.js App Router, strict TypeScript, React and Tailwind.
- Keep pages in src/app, reusable UI in src/components, feature screens in src/modules, synthetic fixtures in src/data and shared utilities in src/lib.
- Keep database access, business rules, scoring and analytics out of UI. They are not implemented in Phase 1.
- UI language is pt-BR. Do not use em dashes, gamification, invented official scores or fake benchmarks.
- All demonstration metrics must remain visibly labeled. Never copy synthetic data into production pathways.
- Only use provided, synthetic or licensed questions.
- Run lint, typecheck, formatting, production build and delivery tests before handoff. Do not write calculation tests until calculations exist.
- Every future database change requires a migration. Document significant architecture changes before implementing them.
- Preserve light and dark themes, keyboard navigation and responsive layout.
