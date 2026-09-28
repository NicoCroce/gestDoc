# {{project_name}} — Cursor Artifacts Index

> Última actualización: {{date}}
> Generado por `/analyze-project` — sincronizar tras cada cambio manual en `.cursor/`.

## Rules

| Archivo | Propósito | Globs / alwaysApply |
|---------|-----------|---------------------|
| `design-adapters.mdc` | Contrato facade Speckit | alwaysApply |
| … | … | … |

## Commands

| Comando | Invocación | Propósito |
|---------|------------|-----------|
| `analyze-project` | `/analyze-project` | Bootstrap / actualización artefactos |
| `audit-improvements` | `/audit-improvements` | Auditoría calidad de código |
| `start-feature` | `/start-feature` | Pipeline feature nueva |
| `improve-feature` | `/improve-feature` | Pipeline mejora feature |
| `orchestrate` | `/orchestrate` | Verificar Speckit ↔ facade |

## Agents

### Facade (seed — no regenerar topología)

| Agente | Rol |
|--------|-----|
| `develop` | Entrypoint features nuevas |
| `design-specify` | Facade → Speckit specify |
| `design-clarify` | Facade → Speckit clarify |
| `design-plan` | Facade → Speckit plan |
| `design-tasks` | Facade → Speckit tasks |
| `design-analyze` | Facade → Speckit analyze |

### Implementación (generados por analyze-project)

| Agente | Rol |
|--------|-----|
| `implement` | Coordinador Fase 6 |
| … | … |

## Skills

| Skill | Trigger |
|-------|---------|
| … | … |

## Hooks

| Evento | Script |
|--------|--------|
| … | … |

## Flujos comunes

```
Feature nueva:  @develop → /start-feature → @design-* → @implement
Mejora:         /improve-feature → @design-* → @implement
Post-upgrade:   /orchestrate
Bootstrap:      /analyze-project
Auditoría:      /audit-improvements
```

## Perfil del proyecto

Ver `.cursor/project-profile.md`.
