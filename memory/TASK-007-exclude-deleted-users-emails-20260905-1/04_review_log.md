---
task_id: 'TASK-007-exclude-deleted-users-emails-20260905-1'
agent: 'Reviewer_Agent'
status: 'APPROVED'
attempts: 1
date: '2026-09-05'
---

# Revisión de Estándares — Excluir usuarios eliminados de todos los envíos de email

## Resultado: ✅ APPROVED

---

## Checklist

| #     | Criterio                                | Nivel | Estado | Detalle                                                                                                    |
| ----- | --------------------------------------- | ----- | ------ | ---------------------------------------------------------------------------------------------------------- |
| 1     | Domain no importa Infrastructure        | 🔴    | ✅     | Ambos archivos son Application, no tocan Domain.                                                           |
| 2     | Use Cases usan interfaz abstracta       | 🔴    | ✅     | `IngestDocument` inyecta `DocumentRepository` (interfaz, `Domain/index.ts`).                               |
| 3     | Archivos globales actualizados          | 🔴    | ✅     | N/A — no se creó dominio ni ruta nueva.                                                                    |
| 4     | Sin `any` explícito                     | 🔴    | ✅     | Sin coincidencias en ambos archivos.                                                                       |
| 5     | Tipos de retorno explícitos             | 🟡    | ✅     | `execute()` tipado; privados con inferencia clara (`Promise` de tipos conocidos).                          |
| 6     | Solo interfaces compartidas entre capas | 🔴    | ✅     | Interfaces (`ISignDocument`, etc.) locales al archivo, no exportadas cross-layer.                          |
| 7     | Zod en controller/formulario            | 🔴    | ✅     | N/A — no hay cambios de controller/input en este fix.                                                      |
| 8     | Filtro `ownerId` en queries             | 🔴    | ✅     | `IngestDocument` usa `requestContext.values.ownerId` para filtrar owners.                                  |
| 9     | Sin `console.log` en producción         | 🟡    | ✅     | Sin coincidencias; se usa `logger`/`loggerContext` (pino) consistentemente.                                |
| 10    | Convenciones de nomenclatura            | 🔴    | ✅     | Clases PascalCase, métodos/params camelCase, archivos `[Domain].service.ts`/`[Action][Entity].usecase.ts`. |
| 11    | Entidad con `static create()` etc.      | 🟡    | ✅     | N/A — no se crea/modifica entidad.                                                                         |
| 12–16 | Frontend (loading/error/empty, botones) | —     | N/A    | Tarea 100% backend, no aplica.                                                                             |
| 17    | Barrels exportan correctamente          | 🟡    | ✅     | Sin cambios en barrels; imports usan rutas ya existentes.                                                  |

### Restricciones adicionales de `server.instructions.md`

| Restricción                                                               | Estado | Detalle                                                                                                                                       |
| ------------------------------------------------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------- |
| #1 Use cases importan solo repos de su propio dominio                     | ✅     | `IngestDocument` no importa repositorios de otros dominios; inyecta `GetUser`/`GetAllActiveOwners`/`NotifyNewDocument` (use cases, no repos). |
| #2 Cross-domain vía use case inyectado (no repo directo)                  | ✅     | Mismo caso anterior — patrón `cross-domain-relations` correcto.                                                                               |
| #3 Magic strings                                                          | ✅     | Statuses (`'aprobado'`/`'rechazado'`) ya preexistentes en la interfaz del dominio, no introducidos por este fix.                              |
| #5 Nunca `new` sobre clases inyectables                                   | ✅     | Único `new` es `new Map<...>()` (nativo), no instanciación de clase de dominio.                                                               |
| Nunca `throw new Error()` / nunca `TRPCError` directo en use case/service | ✅     | Ambos archivos solo relanzan/loguean; no introducen nuevos `throw`.                                                                           |

---

## Evaluación específica: bypass de `executeUseCase` en `getCurrentUser()` / `notifyLicenseStatusChange()` / loop de `IngestDocument`

**Veredicto: arquitectónicamente correcto — es un patrón ya existente en el codebase, no una desviación ad-hoc.**

`executeUseCase` (`Application/Adapters/ExecuteUseCase.ts`) envuelve cualquier error en `TRPCError` vía `TRPCErrorAdapter`, perdiendo la posibilidad de hacer `instanceof AppError` en el caller. Esto ya tiene precedente confirmado en el repo — `UpdateCertificateStatus.usecase.ts` y `DeleteCertificate.usecase.ts` (dominio Certificates) llaman `this.getRoleByUser.execute({...})` **directamente**, sin `executeUseCase`, precisamente para poder actuar sobre el resultado/error del use case inyectado dentro de la misma capa Application. El fix del Tester sigue ese mismo patrón: invocar `.execute()` directo cuando el caller necesita el `AppError` original para tomar una decisión de control de flujo (aquí, distinguir 404 = soft-deleted vs. error real).

No viola ninguna restricción documentada:

- `executeUseCase` no es obligatorio en toda la cadena interna — el `server.instructions.md` solo lo prescribe en la secuencia `Controller → Service → executeUseCase → UseCase`, es decir, en el punto de entrada del controller. Llamadas internas entre use cases/services ya inyectados no están forzadas a pasar por ese adapter.
- Los comentarios agregados en el código explican el motivo (`// No usa executeUseCase: ese adapter envuelve...`), lo cual es buena práctica dado que es una excepción al patrón dominante en el resto del archivo (`getAdmins()` sí usa `executeUseCase`).

**Alternativa considerada y descartada:** podría haberse mantenido `executeUseCase` y chequeado `error.cause instanceof AppError` en el catch (dado que `TRPCErrorAdapter` setea `cause: error`). Es viable pero acopla el catch a un detalle de implementación del adapter (`cause`) que no es parte del contrato público de `TRPCError`/`IUseCase`, y sería menos explícito que invocar `.execute()` directo con el precedente ya existente en Certificates. El enfoque elegido es preferible.

---

## Deuda Técnica

- Los 3 call sites que ahora invocan `.execute()` directo (`getCurrentUser()`, `notifyLicenseStatusChange()`, loop de `IngestDocument`) pierden el log `"Execute usecase: X"` (`loggerContextInput`) que `executeUseCase` emite antes de ejecutar. No es bloqueante — el catch de cada método ya loguea el resultado (éxito implícito / warn en 404 / error genérico) — pero si se detecta necesidad de trazabilidad más fina de estos 3 casos puntuales, evaluar extraer un helper liviano tipo `executeUseCaseRaw` que preserve el log sin el envoltorio `TRPCError`, reutilizable en los 3 sitios y en `Certificates` (mismo patrón ya usado ahí).
