# Feature Specification: Excluir usuarios eliminados de todos los envíos de email

**Feature Branch**: `007-exclude-deleted-users-emails`

**Created**: 2026-09-05

**Status**: Draft

**Input**: User description: "Garantizar que ningún envío de email del backend llegue a un usuario soft-deleted (`deletedAt` no nulo en `Users`). Solo deben recibir mails los usuarios activos (`deletedAt IS NULL`). Alcance: todos los flujos de envío de mail que resuelven destinatarios desde `Users` — Disclaimer reminders, EmployeeReminders, DailyReport, Documents (documentSigned, newDocumentNotification, sendDocumentToEmail/sendEmailToAdmins), licenseStatusChange (Certificates). No se modifica el modelo de datos ni se agregan integraciones externas."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Ningún recordatorio de disclaimer llega a un usuario eliminado (Priority: P1)

Un administrador dispara (manual o programado) el envío de recordatorios de aceptación de disclaimer a empleados pendientes. Entre esos empleados hay uno que fue dado de baja (soft-delete) después de haber quedado pendiente de aceptar el disclaimer.

**Why this priority**: Es el flujo con mayor volumen de destinatarios resueltos por lote (batch de hasta 50 IDs) y el que motivó originalmente el pedido — es el riesgo de negocio más visible (contactar a alguien que ya no es usuario del sistema).

**Independent Test**: Puede probarse de forma aislada creando un empleado con disclaimer pendiente, marcándolo como soft-deleted, y verificando que el batch de envío no incluye su email en la lista de destinatarios ni se registra un intento de envío hacia esa dirección.

**Acceptance Scenarios**:

1. **Given** un empleado con disclaimer pendiente y `deletedAt` no nulo, **When** se ejecuta el envío de recordatorios de disclaimer para esa empresa, **Then** el sistema no incluye el email de ese empleado en el envío y el conteo de "enviados" no lo contempla.
2. **Given** un lote mixto de empleados activos y eliminados con disclaimer pendiente, **When** se ejecuta el envío, **Then** solo los empleados activos (`deletedAt IS NULL`) reciben el email.

---

### User Story 2 - El reporte diario a administradores solo considera admins activos (Priority: P1)

El sistema genera y envía diariamente un resumen operativo a los usuarios con rol administrador de cada empresa.

**Why this priority**: Es un envío recurrente y automático (sin intervención humana previa) hacia una lista de destinatarios que se resuelve en cada ejecución; un admin dado de baja no debe seguir recibiendo información operativa de la empresa.

**Independent Test**: Puede probarse dando de baja a un usuario con rol admin y verificando que la próxima ejecución del reporte diario no lo incluye entre los destinatarios, sin afectar el envío al resto de los admins activos.

**Acceptance Scenarios**:

1. **Given** una empresa con un admin activo y un admin soft-deleted, **When** se genera y envía el reporte diario, **Then** el email se envía únicamente al admin activo.
2. **Given** una empresa donde todos los admins están soft-deleted, **When** se intenta enviar el reporte diario, **Then** el sistema no envía ningún email para esa empresa y registra que no hay destinatarios válidos (mismo comportamiento que "sin admins" hoy).

---

### User Story 3 - Notificaciones de documentos (firma, nuevo documento, envío manual) respetan usuarios eliminados (Priority: P2)

Cuando un empleado firma un documento, cuando se sube un documento nuevo, o cuando un usuario reenvía manualmente un documento por email (a sí mismo o a los admins), el sistema no debe notificar a personas eliminadas.

**Why this priority**: Volumen menor que los recordatorios masivos, pero con el mismo riesgo: notificar a alguien que ya no debería tener visibilidad sobre documentos de la empresa. Se agrupan estos flujos porque comparten el mismo mecanismo de resolución de destinatarios (usuario actual + lista de admins).

**Independent Test**: Puede probarse firmando un documento como empleado activo con un admin soft-deleted en la empresa, y verificando que la notificación de firma llega al empleado pero no al admin eliminado. Igual verificación para el flujo de nuevo documento y para el reenvío manual por email.

**Acceptance Scenarios**:

1. **Given** un documento firmado por un empleado activo, y un admin de esa empresa soft-deleted, **When** se dispara la notificación de firma, **Then** el email al empleado se envía, y el email de aviso a admins excluye al admin eliminado.
2. **Given** un nuevo documento asignado a un empleado que fue soft-deleted antes de la asignación, **When** se dispara la notificación de nuevo documento, **Then** no se envía ningún email a ese empleado.
3. **Given** un usuario soft-deleted que en algún momento fue el "usuario actual" de una request (caso límite, ej. token aún válido), **When** se intenta reenviar un documento por email o notificar a admins, **Then** el sistema no completa el envío hacia esa dirección y registra la omisión sin interrumpir el resto del flujo.

---

### User Story 4 - Cambio de estado de licencia solo notifica a empleados activos (Priority: P2)

Cuando un administrador aprueba o rechaza una licencia (certificado), el empleado dueño de la licencia recibe un email de notificación del nuevo estado.

**Why this priority**: Flujo puntual (uno por decisión de licencia), pero puede darse el caso de que la decisión se tome sobre una licencia de un empleado que fue dado de baja después de solicitarla.

**Independent Test**: Puede probarse aprobando o rechazando la licencia de un empleado soft-deleted y verificando que no se dispara ningún email, mientras que la operación de cambio de estado en sí se completa con normalidad.

**Acceptance Scenarios**:

1. **Given** una licencia cuyo empleado dueño está soft-deleted, **When** un admin cambia el estado de la licencia (aprobada/rechazada, con o sin motivo de rechazo), **Then** el cambio de estado se persiste pero no se envía email de notificación al empleado.
2. **Given** una licencia de un empleado activo, **When** se cambia su estado, **Then** el email de notificación se envía con normalidad (comportamiento sin cambios).

---

### Edge Cases

- ¿Qué pasa si un usuario es soft-deleted **entre** el momento en que se arma la lista de destinatarios y el momento real del envío (condición de carrera)? El sistema debe tratar esto como un caso aceptable de "mejor esfuerzo": no se exige una relectura atómica inmediatamente antes de cada envío individual, pero cualquier resolución de destinatarios debe partir siempre de una consulta que ya excluya soft-deleted en ese instante.
- ¿Qué pasa si el envío de mail resuelve una lista de emails a partir de un join/include con otro modelo (por ejemplo, roles o segmentos) y no del modelo `Users` directamente? El filtro de exclusión debe aplicar igual, ya sea porque el join respeta el scope paranoid de `Users` por defecto, o porque se agrega un filtro explícito adicional si el mecanismo de consulta bypasea ese scope (ej. `paranoid: false`, SQL crudo, o resultados cacheados).
- ¿Qué pasa si **todos** los destinatarios de un envío (ej. todos los admins de una empresa) están soft-deleted? El sistema no debe enviar el email y debe registrar la omisión, igual que hoy se maneja el caso de "no hay admins".
- ¿Qué pasa con un usuario soft-deleted que dispara él mismo la acción (ej. reenviar documento por email a su propia casilla)? Aunque técnicamente activo en su sesión, si su registro está soft-deleted el envío hacia su dirección debe omitirse igual que para cualquier otro destinatario.
- ¿Qué pasa si el destinatario no es un `Users.email` sino un email libre ingresado manualmente (si existiera ese caso)? Ese escenario queda fuera de alcance: la exclusión aplica únicamente a destinatarios resueltos desde la tabla `Users`.

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema MUST excluir de todo envío de email a los usuarios cuyo registro en `Users` tenga `deletedAt` no nulo (soft-deleted), sin importar el flujo de origen del envío.
- **FR-002**: El sistema MUST incluir en los envíos de email únicamente a usuarios con `deletedAt` nulo (activos), preservando el comportamiento actual para ese subconjunto de usuarios.
- **FR-003**: El sistema MUST aplicar la exclusión de forma consistente en toda consulta de la capa de persistencia que resuelva destinatarios de email desde `Users`, ya sea de forma directa (consulta simple), indirecta (join/include con otro modelo) o a través de otro dominio que reutilice esos datos.
- **FR-004**: El sistema MUST auditar y corregir cualquier consulta existente que resuelva destinatarios de email bypaseando el filtro de soft-delete (por ejemplo `paranoid: false`, SQL crudo sin condición de exclusión, o listas de usuarios cacheadas/precalculadas sin ese filtro), de modo que ninguna quede exenta de la regla.
- **FR-005**: El sistema MUST continuar enviando el email con normalidad cuando todos los destinatarios restantes tras la exclusión sean válidos (activos), sin cambios de comportamiento visibles para ese caso.
- **FR-006**: El sistema MUST manejar sin error el caso en que, tras excluir a los usuarios soft-deleted, no quede ningún destinatario válido para un envío determinado — omitiendo el envío y dejando registro (log) de la omisión, de forma análoga al manejo actual de "sin destinatarios".
- **FR-007**: El sistema MUST mantener sin cambios el modelo de datos de `Users` (el campo `deletedAt` y la configuración `paranoid: true` ya existen y no se modifican).
- **FR-008**: El sistema MUST NOT introducir nuevas integraciones externas ni cambiar el proveedor/mecanismo de envío de email como parte de esta corrección.

### Key Entities _(include if feature involves data)_

- **Users**: entidad existente que representa a los usuarios del sistema (empleados y administradores). Atributo relevante para esta feature: `deletedAt` (marca de soft-delete; no nulo significa usuario eliminado). No se agregan ni modifican atributos.
- **Flujo de envío de email**: concepto transversal que representa cualquier proceso del backend que resuelve una lista de direcciones de correo a partir de `Users` y dispara un envío (recordatorios de disclaimer, recordatorios de empleados, reporte diario, notificaciones de documentos, notificación de cambio de estado de licencia). No es una entidad de datos nueva, sino el punto de aplicación de la regla de exclusión.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: El 100% de los envíos de email del backend excluye a los usuarios soft-deleted, verificado por al menos un caso de prueba automatizado por cada flujo de envío existente (disclaimer reminders, employee reminders, daily report, notificaciones de documentos, cambio de estado de licencia).
- **SC-002**: Cero regresiones: los usuarios activos siguen recibiendo el 100% de los emails que recibían antes del cambio, en los mismos escenarios que hoy disparan un envío.
- **SC-003**: Cuando un envío queda sin destinatarios válidos por exclusión total de usuarios eliminados, el sistema completa la operación de negocio subyacente (ej. cambio de estado de licencia, generación de reporte) sin lanzar errores ni interrumpir el flujo, y deja evidencia auditable (log) de la omisión.
- **SC-004**: No se detectan en el código, tras la auditoría, consultas de resolución de destinatarios de email que bypaseen el soft-delete sin una justificación y filtro explícito equivalente.

## Assumptions

- El campo `deletedAt` y `paranoid: true` en `Users.model.ts` son la única fuente de verdad para determinar si un usuario está eliminado; no existe otro mecanismo paralelo de "usuario inactivo" relevante para este alcance (ej. un flag `activo` separado no se contempla salvo que ya sea parte del filtro actual).
- Sequelize con `paranoid: true` ya excluye automáticamente los registros soft-deleted en consultas estándar (`findAll`, `findOne`, `findByPk`, `count`) sin necesidad de agregar `deletedAt: null` manualmente, salvo en los casos donde se use `paranoid: false` explícito, SQL crudo, o resultados no obtenidos por el ORM (cache, agregaciones previas).
- El alcance de "todos los flujos de envío de mail" se limita a los procesos de backend ya existentes que resuelven destinatarios desde `Users`; no incluye flujos futuros que se agreguen después de esta feature (esos deberán seguir la misma convención pero no están cubiertos por esta spec).
- No se requiere exponer ninguna interfaz de usuario ni endpoint nuevo: es una corrección interna de lógica de resolución de destinatarios, sin cambios visibles para el usuario final salvo dejar de recibir mails si está eliminado.
- El log/registro de omisión de envío por "sin destinatarios válidos" reutiliza el mecanismo de logging ya existente en cada flujo (no se pide un sistema de auditoría nuevo).
