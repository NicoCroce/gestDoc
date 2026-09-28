# Start Feature — Skeleton Reference

Plantilla de referencia. El comando activo es `.cursor/commands/start-feature.md`.
No copiar este archivo al proyecto destino salvo para documentación.

## Slots (rellenados en project-profile.md)

- `{{feature}}` — nombre kebab-case
- `{{modo}}` — `plan` | `auto`
- `implement_chain` — cadena Fase 6
- `frontend_design_skill` — skill Fase 3.1 (o skip)
- `domain_roots` — para preguntar dominio nuevo

## Fases fijas

| # | Fase | Agent / Skill |
|---|------|---------------|
| 0 | Complejidad | directo (solo auto) |
| 1 | Specify | @design-specify |
| 2 | Clarify | @design-clarify (condicional) |
| 3.1 | Frontend design | skill (condicional) |
| 3.2 | Plan | @design-plan |
| 4 | Tasks | @design-tasks |
| 5 | Analyze | @design-analyze |
| 6 | Implement | @implement |

## Modos

- `plan`: stop after each phase 1–5
- `auto`: chain 1–5 if phase 0 passes; checkpoint before phase 6
