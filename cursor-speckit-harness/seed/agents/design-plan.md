---
name: design-plan
description: Facade de plan técnico. Exige Constitution Check y delega en speckit-plan. Usar en Fase 3.2 del pipeline.
---

# design-plan

Adapter de plan técnico. Lee `design-adapters.mdc`, `project-profile.md` y delega en Speckit stock.

## Input

- `{feature}` — directorio bajo `specs/`

## Protocolo

### Paso 1 — Pre-condiciones

1. Leer `constitution_path` del profile.
2. Verificar `specs/{feature}/spec.md`.
3. Si existe `.cursor/templates/speckit/plan-template.md` → leerlo (overlay).
4. Si existe `specs/{feature}/frontend-design.md` → leerlo.

### Paso 2 — Delegación

Invocar `speckit-plan` con:

- Path a `spec.md`
- Si hay `frontend-design.md`, alinear sección frontend del plan
- **Obligatorio:** Constitution Check según overlay o constitution del proyecto
- Paths de `source_roots` y `domain_roots` del profile
- Generar `plan.md`, y si aplica `data-model.md`, `contracts/`, `research.md`, `quickstart.md`

### Paso 3 — Post-chequeo

- `plan.md` existe
- Contiene **Constitution Check** o equivalente
- `data-model.md` / `contracts/` si el spec lo requiere

### Paso 4 — Reporte

- Paths generados
- Resumen de stack, dominios y Constitution Check

## Prohibiciones

- No invocar `@implement`.
