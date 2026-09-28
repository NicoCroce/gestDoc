# Cursor Speckit Harness

Kit portable para bootstrappear un harness de desarrollo asistido por IA en **Cursor IDE**, integrado con [Speckit](https://github.com/github/spec-kit) (Spec-Driven Development).

Este kit es **independiente del proyecto destino**: copiá `seed/` al repo que quieras instrumentar. No asume stack, arquitectura ni naming de producto.

## Qué incluye

| Capa | Contenido |
|------|-----------|
| **Speckit stock** | Instalado vía CLI (`specify init`) — no incluido en el kit |
| **Facade (seed)** | `develop`, `design-*`, `start-feature`, `improve-feature`, `orchestrate`, `design-adapters` |
| **Proyecto (generado)** | Rules, skills, agents de implementación — producidos por `/analyze-project` |

## Instalación en cualquier proyecto

### 1. Instalar Speckit

```bash
uv tool install specify-cli --from git+https://github.com/github/spec-kit.git@v0.9.5
specify init --here --integration cursor
```

> Si tu versión de Speckit no soporta `--integration cursor`, usá la integración disponible y adaptá los paths de agents Speckit en `project-profile.md` tras el paso 3.

### 2. Copiar el seed

Desde la raíz del proyecto destino:

```bash
# Copiar contenido de seed/ dentro de .cursor/
mkdir -p .cursor
cp -R path/to/cursor-speckit-harness/seed/* .cursor/
```

Estructura resultante:

```
.cursor/
├── commands/
├── agents/
├── rules/
└── templates/
```

### 3. Bootstrap del proyecto

En Cursor, invocar:

```
/analyze-project
```

Flujo: Plan mode (descubrimiento + plan) → aprobación → Agent mode (escribir artefactos).

Genera entre otros:

- `.cursor/project-profile.md` — slots concretos del proyecto
- `.cursor/ARTIFACTS.md` — índice de artefactos
- Rules, skills y agents de implementación según el stack detectado

### 4. Verificar vinculación

```
/orchestrate
```

Checklist PASS/FAIL: Speckit ↔ facade ↔ implement.

### 5. Uso diario

```
@develop
```

o directamente `/start-feature` / `/improve-feature`.

## Comandos del seed

| Comando | Rol |
|---------|-----|
| `/analyze-project` | Bootstrap / actualización de artefactos Cursor |
| `/audit-improvements` | Auditoría de calidad de **código** (no artefactos IDE) |
| `/start-feature` | Pipeline completo feature nueva (`plan` \| `auto`) |
| `/improve-feature` | Pipeline de mejora (siempre `plan`) |
| `/orchestrate` | Verificación post-install / post-upgrade Speckit |

## Documentación de referencia

- [`reference/philosophy.md`](reference/philosophy.md) — tres zonas y contrato facade
- [`reference/mapping-from-opencode.md`](reference/mapping-from-opencode.md) — equivalencias OpenCode → Cursor

## Extraer a repo propio

Este directorio puede vivir como repositorio independiente:

```bash
cp -R cursor-speckit-harness ~/cursor-speckit-harness
cd ~/cursor-speckit-harness && git init
```

No requiere estar dentro del proyecto que instrumentás.

## Criterio de éxito

Speckit instalado → seed copiado → `/analyze-project` aprobado → `/orchestrate` PASS → `@develop` orquesta Fases 1–6 con handoff a `@implement` sin tocar Speckit stock.
