# Quickstart: Validar "sin texto de términos no existe pendiente"

**Feature**: `008-exclude-terms-pending-no-text`

Guía de validación end-to-end de la regla en sus cuatro superficies. No contiene implementación:
los detalles de contrato están en `contracts/` y el modelo en `data-model.md`.

## Prerrequisitos

- Monorepo instalado (`pnpm install`).
- Base MySQL accesible con la tabla `Sis_propietarios` (columna `texto_disclaimer`) y `Usuarios`.
- Dos empresas de prueba en la misma base:
  - **Empresa A (sin texto)**: `texto_disclaimer` en `NULL`, `''` o solo espacios/tabs/saltos.
  - **Empresa B (con texto)**: `texto_disclaimer` con contenido real.
- Al menos un usuario por empresa. Para el escenario de "solo pendiente de términos": usuario sin
  fila en `disclaimer_firmas` y sin documentos pendientes.

## 1. Prueba automatizada (Vitest)

Regla de negocio por capa (helper, use cases, template) y multi-tenant:

```bash
# Backend — helper y use cases de la regla
pnpm --filter server test -- disclaimerUtils HasDisclaimerText SendReminders \
  GetPendingDisclaimerAcceptances CountPendingDisclaimers GenerateDailyReminder GenerateDailyReport
```

Los specs relevantes viven junto a su capa (`**/specs/`), respetando `server.instructions.md`.
El tester (`@blendverse-tester`) genera/ejecuta los tests de regla de negocio (Principio V).

Cobertura mínima esperada (ver `contracts/*.contract.md`):

- Helper: `null`, `''`, `"   \t\n "`, texto real.
- `disclaimer.hasText`: tabla de verdad por `texto_disclaimer`.
- `GenerateDailyReminder`: `pendingDisclaimerAcceptance` en empresas con/sin texto.
- `GenerateDailyReport`: `hasDisclaimerText`, sección vacía y summary `0` sin texto; HTML sin "Términos".
- `SendReminders`: bloqueo con `NULL`/`''`/solo blancos; envío normal con texto real.

## 2. Verificación del contrato backend↔frontend (bandera)

Con el server en dev:

```bash
pnpm server:dev
```

1. Autenticado como usuario de la **Empresa A**, consultar la query `disclaimer.hasText` desde el
   cliente tRPC (o desde la pantalla de Empleados) ⇒ debe responder `false`.
2. Repetir con un usuario de la **Empresa B** ⇒ debe responder `true`.
3. Confirmar que la procedure **no recibe input** y que cambiar el `ownerId` del cliente no altera el
   resultado (el tenant sale de `RequestContext`).

## 3. Vistas de administración (frontend)

```bash
pnpm app:dev
```

Como administrador de la **Empresa A**, abrir la gestión de empleados:

| Superficie             | Resultado esperado (Empresa A)                                                        |
| ---------------------- | ------------------------------------------------------------------------------------- |
| Tabla                  | **No** aparece la columna "Términos firmados" (`estado_firma`)                        |
| Tarjetas (mobile)      | **No** aparece el bloque "Términos firmados"                                          |
| Estadísticas           | **No** aparece la card "Aceptación de términos"; la grilla muestra 2 cards en desktop |
| "Enviar recordatorios" | Al activar el modo selección, **no** se preselecciona a nadie por términos            |

Repetir con la **Empresa B** ⇒ comportamiento actual exacto (columna, bloque, card con sus conteos y
preselección), sin cambios visuales.

> **Nota de implementación**: `StatisticsEmpleados.tsx` no renderiza un donut de estado de firma; la
> superficie real a ocultar es la _stat card_ "Aceptación de términos". Ver `research.md` §Mapeo.

## 4. Recordatorio diario de empleados (email)

Disparar la corrida diaria de `EmployeeReminders` (scheduler o invocación directa del servicio en un
entorno de prueba con mailer capturable). Con un empleado de la **Empresa A** que **solo** tenía el
pendiente de términos:

- **Esperado**: no se envía correo (`shouldSend === false`).
- Con un empleado de la Empresa A que además tiene documentos sin firmar: el correo llega **sin** la
  sección "Términos y condiciones sin aceptar".
- Con la Empresa B: el correo llega con la sección cuando `estado_firma !== 'Firmado'`.

## 5. Reporte diario a administradores (email)

Disparar la corrida diaria de `DailyReport` para la **Empresa A**:

- **Esperado**: el HTML del correo **no contiene** la cadena "Términos" (ni la fila del resumen
  "Términos sin aceptar" ni la sección detallada). El resto de secciones y conteos no cambia.
- Para la **Empresa B**: fila y sección presentes con el conteo real (SC-004).

## 6. Recordatorio manual de disclaimer

Como administrador de la **Empresa A**, disparar el recordatorio manual (botón "Enviar recordatorios"
sobre selección / procedimiento `disclaimer.sendReminders`):

- **Esperado**: `{ sent: 0, failed: 0, total: 0 }` y ningún correo, incluso si `texto_disclaimer` es
  solo espacios.
- **Empresa B**: envío normal.

## 7. Criterios de éxito (referencia al spec)

- SC-001/SC-003: ningún correo diario de empleados de empresas sin texto incluye términos; cero
  correos cuyo único pendiente era términos.
- SC-002: reporte diario sin sección ni métrica de términos para empresas sin texto.
- SC-004: cero regresión en empresas con texto.
- SC-006/SC-007/SC-008: criterio idéntico en las cuatro superficies; ninguna vista de admin muestra
  "Pendiente" por términos para empresas sin texto.

## Limpieza

Restaurar los valores de `texto_disclaimer` de las empresas de prueba al estado previo.
