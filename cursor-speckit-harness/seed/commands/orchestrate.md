---
description: >-
  Vincula Speckit (stock) con el harness Cursor del proyecto. Ejecutar tras
  specify init, copiar seed, o specify upgrade. Verifica integración sin
  modificar archivos Speckit stock.
version: "1.0.0"
---

# Orchestrate — Puente Speckit + Cursor Harness

Este comando **no modifica** archivos Speckit stock. Verifica que las capas estén
correctamente conectadas y reporta PASS/FAIL.

Leer `.cursor/project-profile.md` si existe.

## Separación de capas (no negociable)

| Zona | Paths típicos | ¿Se regenera con `specify upgrade`? |
| ---- | ------------- | ----------------------------------- |
| **Speckit stock** | `.specify/*`, agents/commands Speckit del CLI | Sí — no editar con lógica del facade |
| **Proyecto** | `.cursor/skills/`, rules de stack, agents de implementación | No — git del proyecto |
| **Facade (seed)** | `develop`, `design-*`, `start-feature`, `improve-feature`, `design-adapters.mdc` | No — kit estable |
| **Overlays** | `.cursor/templates/speckit/` (opcional) | No |

## Instalación desde cero

```bash
# 1. Instalar CLI Speckit
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.9.5

# 2. Inicializar Speckit en el repo
specify init --here --integration cursor

# 3. Copiar seed del kit
cp -R path/to/cursor-speckit-harness/seed/* .cursor/

# 4. Bootstrap del proyecto
/analyze-project

# 5. Verificar (este comando)
/orchestrate
```

## Checklist de verificación

Ejecutar cada ítem y reportar PASS/FAIL:

### 1. Speckit instalado

- Existe `.specify/` con configuración válida
- Existe `.specify/integration.json` (o equivalente del CLI)
- Existen agents/commands Speckit para specify (nombres según integración CLI)

### 2. Speckit sin contaminación del facade

- Los `description:` de comandos/agents Speckit stock **no** mencionan `@develop`, `design-*` ni nombres del harness del proyecto
- El agent `speckit-implement` (o equivalente stock) no redirige a `@implement`

### 3. Contexto del proyecto

- `AGENTS.md` tiene marcadores `<!-- SPECKIT START -->` / `<!-- SPECKIT END -->` (si agent-context está configurado)
- `.specify/extensions/agent-context/agent-context-config.yml` apunta a `AGENTS.md` (si existe la extensión)

### 4. Facade del kit

- Existe `.cursor/agents/develop.md`
- Existen adapters: `design-{specify,clarify,plan,tasks,analyze}.md`
- Existen commands: `start-feature.md`, `improve-feature.md`, `orchestrate.md`, `analyze-project.md`
- Existe `.cursor/rules/design-adapters.mdc`

### 5. Perfil y artefactos generados

- Existe `.cursor/project-profile.md` (tras `/analyze-project`)
- Existe `.cursor/ARTIFACTS.md` sincronizado
- Existe `.cursor/agents/implement.md`

### 6. Overlays (opcional)

- Si `template_overlays` en profile ≠ `none`: existen overlays en `.cursor/templates/speckit/`
- Los adapters `design-plan` / `design-tasks` referencian overlays cuando existen

### 7. Pipeline de implementación

- `@implement` existe y documenta lectura de `specs/{feature}/spec.md` + `tasks.md`
- Fase 6 de `start-feature` y `improve-feature` delega en `@implement` (no `@speckit-implement`)
- `implement_chain` en profile lista agentes que existen en `.cursor/agents/`

## Flujo unificado (entrypoint diario)

```
Usuario
  → @develop
    → /start-feature                 (orquestador)
      → @design-*                    (facade: política del proyecto)
           → @speckit-*              (motor SDD stock)
      → @implement                   (implementación del proyecto)
```

**No usar** agents Speckit directamente en el flujo diario — solo vía `@design-*`.

## Tras `specify upgrade`

1. Verificar que Speckit stock no tenga referencias al harness del proyecto.
2. Verificar que `speckit-implement` no fue sobrescrito con redirect a `@implement`.
3. Re-ejecutar este checklist (`/orchestrate`).
4. Los adapters y overlays en `.cursor/` siguen vigentes; re-ejecutar `/analyze-project --update` si hay deriva.

## Comandos relacionados

| Comando / Agente | Rol |
| ---------------- | --- |
| `/orchestrate` | Verificación post-install (este comando) |
| `@develop` | Entrypoint features nuevas |
| `/start-feature` | Orquestador diseño + implementación |
| `/improve-feature` | Mejora de feature existente |
| `@design-*` | Facade sobre Speckit |
| `/analyze-project` | Bootstrap / actualización artefactos |
| `/audit-improvements` | Auditoría de código (no artefactos IDE) |

## Salida

Tabla resumen:

| # | Ítem | Estado | Notas |
|---|------|--------|-------|
| 1 | Speckit instalado | PASS/FAIL | … |
| … | … | … | … |

Si hay FAIL → acción correctiva concreta por ítem.
