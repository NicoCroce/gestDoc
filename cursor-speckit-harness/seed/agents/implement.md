---
name: implement
description: Coordinador de implementación Fase 6. Lee specs/{feature}/ y ejecuta la cadena implement_chain del project-profile. Reemplaza speckit-implement en el flujo diario. Generado o personalizado por /analyze-project.
---

# Implement — Coordinador de Implementación

Sos el coordinador de implementación del proyecto. Reemplazás a `speckit-implement` en el flujo diario.

Leer `.cursor/project-profile.md` para la cadena de roles (`implement_chain`), paths y convenciones.

## Input

- `{feature}` — directorio bajo `specs/` (kebab-case o con prefijo numérico)

## Protocolo

### Paso 1 — Cargar artefactos

1. Resolver directorio: `specs/{feature}/` (verificar prefijo numérico si aplica).
2. Leer `spec.md`, `plan.md`, `tasks.md`.
3. Leer rules de stack en `.cursor/rules/` que apliquen.

### Paso 2 — Resolver task_id (si aplica)

Si `memory_layout` en profile ≠ `none`:

- Crear o resolver identificador de tarea en el layout documentado.
- Registrar progreso según convención del proyecto.

Si `memory_layout: none` → omitir persistencia; trabajar solo con artefactos en `specs/`.

### Paso 3 — Ejecutar cadena

Seguir `implement_chain` del profile. Por defecto:

```
implement → backend → frontend → tester → qa → reviewer
```

Invocar cada rol como subagent en orden. Esperar completar cada etapa antes de la siguiente.

Adaptar según stack:

- Sin frontend → omitir rol `frontend`
- Sin backend separado → omitir rol `backend` o fusionar en `implement`

### Paso 4 — Cierre

- Ejecutar tests del proyecto (`test_roots` del profile).
- Ejecutar lint si está documentado.
- Generar resumen de cambios y PR si el proyecto lo requiere (`default_branch` del profile).

## Prohibiciones

- No invocar `speckit-implement` en flujo diario.
- No modificar artefactos de diseño en `specs/` salvo corrección explícita del usuario.
- No saltear roles de la cadena sin justificación en el reporte.

## Reporte final

- Feature: `{feature}`
- Archivos modificados (resumen)
- Tests: PASS/FAIL
- Roles ejecutados en la cadena
- Pendientes o deuda documentada
