# Feature Specification: Sin texto de términos no existe pendiente de aceptación

**Feature Branch**: `008-exclude-terms-pending-no-text`

**Created**: 2026-09-28

**Status**: Draft

**Input**: User description: "Si la empresa (registro en `sis_propietarios`) tiene `texto_disclaimer` vacío o nulo, el sistema NO debe tratar a ningún usuario de esa empresa como pendiente de aceptar términos y condiciones; nadie de esa empresa (ni empleados ni administradores) debe recibir recordatorios ni ver datos que indiquen ese pendiente. Debe cumplirse tanto en el recordatorio diario de empleados como en el reporte diario de administradores. El recordatorio manual de disclaimer ya bloquea correctamente cuando no hay texto y sirve de referencia."

## Contexto de Negocio

El texto de términos y condiciones se configura por empresa. Cuando una empresa **no tiene texto configurado**, el inicio de sesión nunca solicita aceptar términos (el modal no aparece), por lo que ningún usuario de esa empresa puede firmar nunca. Sin embargo, los flujos automáticos diarios siguen señalando a esos usuarios como "pendientes de aceptar términos", generando correos y conteos que describen una obligación inexistente.

**Regla:** "Sin texto de términos configurado en la empresa, no existe el pendiente de aceptación de términos". Aplica a **todos** los usuarios de esa empresa (empleados y administradores), en **todos** los correos, reportes y vistas de administración que hoy lo mencionan.

**Dominios de negocio involucrados (todos existentes):** recordatorio de pendientes por empleado, reporte diario a administradores y gestión de términos/disclaimer. No se introduce ningún dominio nuevo.

**Comportamiento de referencia:** el recordatorio manual de disclaimer, disparado por un administrador, define el estándar: bloquea el envío cuando la empresa no tiene texto. Ese es el criterio a aplicar en el resto de los canales y superficies, extendiendo la definición de "sin texto" para incluir también los valores compuestos solo por espacios en blanco.

## Clarifications

### Session 2026-09-28

- Q: ¿La regla aplica también a las vistas de administración (tabla/tarjetas de empleados y stat card "Aceptación de términos") además de los correos y reportes? → A: Sí; se amplía el alcance a la UI de administración: ningún usuario de una empresa sin texto debe figurar como "Pendiente" ni contarse en la stat card "Aceptación de términos", conservando el guard del recordatorio manual.
- Q: ¿El recordatorio manual se conserva tal cual o se alinea a la definición de "sin texto" que incluye espacios en blanco? → A: Se alinea: al evaluar el texto se ignoran los espacios en blanco, de modo que un texto solo con espacios/tabs/saltos cuenta como "sin texto" y bloquea el envío; el supuesto de "sin cambios" queda reemplazado.
- Q: ¿Cuando la empresa no tiene texto, el reporte diario debe omitir o mostrar en cero el conteo de términos? → A: Omitir todo: no aparecen ni la sección detallada ni la métrica de términos del resumen estadístico.

## User Scenarios & Testing _(mandatory)_

### User Story 1 - El empleado de una empresa sin términos no recibe un pendiente inexistente (Priority: P1)

Como empleado de una empresa que no configuró texto de términos, no quiero que se me notifique ni se me cuente como "pendiente de aceptar términos", porque esa aceptación no es posible ni aplicable en mi empresa.

**Why this priority**: Es la causa principal del correo espurio: hoy un empleado cuya única tarea pendiente es "términos y condiciones sin aceptar" recibe igualmente un correo diario que no debería existir. Corregirlo elimina el ruido y la desinformación en el canal de mayor volumen (un correo por empleado).

**Independent Test**: Se puede verificar con una empresa sin texto de términos y un empleado sin registro de aceptación: al ejecutarse el recordatorio diario, su correo no debe incluir la sección de términos; y si no tiene ningún otro pendiente, no debe recibir correo alguno. Debe poder probarse sin tocar el reporte de administradores.

**Acceptance Scenarios**:

1. **Given** una empresa sin texto de términos (vacío, nulo o solo espacios) y un empleado con otros pendientes (por ejemplo, documentos sin firmar), **When** se genera su recordatorio diario, **Then** el correo incluye únicamente esos otros pendientes y NO incluye la sección "Términos y condiciones sin aceptar".
2. **Given** una empresa sin texto de términos y un empleado cuyo único pendiente era la aceptación de términos, **When** se genera su recordatorio diario, **Then** NO se le envía ningún correo.
3. **Given** una empresa sin texto de términos y un empleado que nunca registró aceptación, **When** se genera su recordatorio diario, **Then** el pendiente de términos no se cuenta ni se lista, con independencia de que exista o no un registro de aceptación previo.
4. **Given** una empresa **con** texto de términos configurado, **When** se genera el recordatorio diario de sus empleados, **Then** el comportamiento es exactamente el actual (se lista y cuenta el pendiente a quien no haya aceptado).

---

### User Story 2 - El reporte diario de administradores no muestra el pendiente inexistente (Priority: P1)

Como administrador de una empresa que no configuró texto de términos, no quiero ver en mi reporte diario una sección ni un conteo de "términos y condiciones sin aceptar", porque no existe tal obligación para mis usuarios.

**Why this priority**: El reporte es la vista de control del administrador; mostrar un pendiente inexistente induce a decisiones equivocadas (recordar, perseguir o evaluar a usuarios por algo que no aplica). Tiene la misma causa raíz que la Historia 1 y debe corregirse en el mismo alcance.

**Independent Test**: Se puede verificar con una empresa sin texto de términos: al generarse el reporte diario, el resumen estadístico y la sección detallada no deben mencionar términos ni contar usuarios pendientes. Debe poder probarse sin tocar el recordatorio de empleados.

**Acceptance Scenarios**:

1. **Given** una empresa sin texto de términos, **When** se genera el reporte diario para sus administradores, **Then** NO aparece la sección "Términos y condiciones sin aceptar" ni la métrica de términos en el resumen estadístico (ninguna referencia a términos).
2. **Given** una empresa sin texto de términos, **When** se genera el reporte diario y existen usuarios sin registro de aceptación, **Then** esos usuarios NO se cuentan como pendientes de términos ni en el resumen ni en el detalle.
3. **Given** una empresa **con** texto de términos configurado, **When** se genera el reporte diario, **Then** el conteo y la sección reflejan el comportamiento actual sin cambios.

---

### User Story 3 - La regla es uniforme en todos los canales y superficies que mencionan el pendiente (Priority: P2)

Como responsable del negocio, quiero que la regla "sin texto no hay pendiente de términos" se aplique de forma consistente en todos los correos, reportes y vistas de administración, para evitar inconsistencias entre canales y tener un único criterio de verdad.

**Why this priority**: El recordatorio manual define la regla con su bloqueo; los flujos automáticos no la aplican. Unificarlos —incluida la definición de "sin texto" que abarca los valores solo con espacios en blanco— evita que a futuro se reintroduzca el problema en un canal nuevo o modificado.

**Independent Test**: Se puede verificar comparando el comportamiento de todas las superficies (recordatorio manual, recordatorio diario de empleados, reporte diario de administradores y vistas de administración) ante la misma empresa sin texto: todas deben tratar el pendiente como inexistente.

**Acceptance Scenarios**:

1. **Given** una empresa sin texto de términos (nulo, vacío o solo espacios en blanco), **When** un administrador dispara el recordatorio manual, **Then** no se envía ningún recordatorio (alineado al mismo criterio).
2. **Given** la misma empresa sin texto, **When** se ejecutan el recordatorio diario de empleados y el reporte diario de administradores, **Then** ninguno de los dos señaliza el pendiente de términos, alineándose con el recordatorio manual.
3. **Given** una empresa con texto configurado, **When** se ejecuta cualquiera de los canales o superficies, **Then** todos detectan el pendiente de términos según el comportamiento actual.

---

### User Story 4 - El administrador no ve el pendiente inexistente en la gestión de empleados (Priority: P1)

Como administrador de una empresa que no configuró texto de términos, no quiero que la tabla y las tarjetas de empleados ni la stat card "Aceptación de términos" me muestren usuarios como "Pendiente" por términos, porque esa obligación no existe para mi empresa.

**Why this priority**: La UI de administración es la superficie de decisión operativa; mostrar un "Pendiente" permanente desinforma y habilita acciones equivocadas (por ejemplo, el recordatorio manual preselecciona a esos usuarios y luego no envía nada). Comparte la causa raíz con las Historias 1 y 2 y debe corregirse en el mismo alcance.

**Independent Test**: Con una empresa sin texto de términos y usuarios sin aceptación registrada, al abrir la gestión de empleados, la tabla y las tarjetas no deben mostrar el estado "Pendiente" derivado del pendiente de términos, y la stat card "Aceptación de términos" no debe contarlos. Verificable sin tocar los correos ni los reportes.

**Acceptance Scenarios**:

1. **Given** una empresa sin texto de términos y empleados sin aceptación registrada, **When** el administrador abre la gestión de empleados, **Then** ningún empleado figura como "Pendiente" por términos en la tabla ni en las tarjetas.
2. **Given** una empresa sin texto de términos, **When** el administrador consulta la stat card "Aceptación de términos", **Then** no se cuenta ningún usuario como "Pendiente" por términos.
3. **Given** una empresa sin texto de términos, **When** el administrador activa el envío de recordatorios, **Then** la preselección no incluye a usuarios por el pendiente de términos.
4. **Given** una empresa **con** texto de términos configurado, **When** el administrador abre la gestión de empleados y la stat card "Aceptación de términos", **Then** el estado "Pendiente", los conteos y la preselección reflejan el comportamiento actual sin cambios.

---

### Edge Cases

- **Texto nulo**: la empresa no tiene valor en su texto de términos → sin pendiente.
- **Texto vacío**: cadena vacía → sin pendiente.
- **Texto solo con espacios en blanco**: una cadena compuesta únicamente por espacios, tabulaciones o saltos de línea se considera "sin texto" → sin pendiente. No se limita a nulo.
- **Texto con contenido real**: cualquier texto con al menos un carácter significativo (no espacio en blanco) → rige el comportamiento actual (sí existe el pendiente para quien no aceptó).
- **Mezcla de empresas en una misma corrida**: una corrida diaria procesa empresas con y sin texto; la regla se decide por empresa, sin afectar a las demás.
- **Usuarios con o sin registro de aceptación**: en una empresa sin texto, ni quienes no registraron aceptación ni quienes tienen un registro inválido se cuentan como pendientes.
- **Empleado con varios pendientes incluyendo términos**: si la empresa no tiene texto, el correo se envía solo por los demás pendientes; el correo nunca se vuelve "inexistente" por excluir términos cuando aún hay otros pendientes.
- **Empleado cuyo único pendiente era términos**: si la empresa no tiene texto y no hay otros pendientes, no se envía correo.
- **Cambio de configuración de la empresa**: la decisión refleja el estado del texto de términos de la empresa al momento de generarse el correo o reporte.
- **Empresa sin usuarios o sin administradores**: el escenario no aplica y se conserva el comportamiento actual de omisión.
- **Administrador de empresa sin texto revisando empleados**: ningún usuario figura como "Pendiente" por términos en la tabla, las tarjetas ni la stat card "Aceptación de términos".
- **Preselección del recordatorio manual**: en una empresa sin texto, el botón que preselecciona pendientes no selecciona usuarios por el pendiente de términos (no se les señala como pendientes inexistentes).
- **Reporte de empresa sin texto**: no se renderiza la sección detallada de términos ni la métrica de términos del resumen estadístico (ambas ausentes por completo).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: El sistema DEBE considerar que una empresa "no tiene texto de términos" cuando su texto de términos es nulo, cadena vacía, o contiene únicamente espacios en blanco (incluyendo tabulaciones y saltos de línea).
- **FR-002**: Cuando una empresa no tiene texto de términos, ningún usuario de esa empresa —empleado o administrador— DEBE ser mostrado, contado ni notificado como pendiente de aceptar términos y condiciones, con independencia del valor interno que registre su estado de firma.
- **FR-003**: El recordatorio diario por empleado DEBE excluir la sección "Términos y condiciones sin aceptar" y no contar ese pendiente para los empleados de empresas sin texto de términos.
- **FR-004**: Si, tras excluir el pendiente de términos, un empleado de una empresa sin texto no tiene ningún otro pendiente, el sistema NO DEBE enviarle correo en esa corrida.
- **FR-005**: Para las empresas sin texto, el reporte diario a administradores DEBE omitir por completo toda referencia a términos: no se renderiza la sección detallada "Términos y condiciones sin aceptar" ni la métrica correspondiente del resumen estadístico, sin señalizar una obligación inexistente.
- **FR-006**: Cuando una empresa SÍ tiene texto de términos con contenido, el sistema DEBE mantener sin cambios la detección, el conteo y la presentación actual del pendiente (para empleados y administradores).
- **FR-007**: La regla DEBE aplicarse de forma uniforme en todos los correos, reportes y vistas de administración que hoy mencionan el pendiente de aceptación de términos, incluidos el recordatorio diario de empleados, el reporte diario de administradores y la gestión de empleados; el recordatorio manual se alinea al mismo criterio, incluidos los textos compuestos solo por espacios en blanco.
- **FR-008**: La evaluación DEBE ser por empresa (multi-tenant), de modo que la condición de una empresa no altere el comportamiento de las demás en la misma corrida.
- **FR-009**: La exclusión del pendiente de términos DEBE ser independiente de la existencia o validez del registro de aceptación de cada usuario: en una empresa sin texto, el pendiente no existe aunque el usuario no tenga aceptación registrada.
- **FR-010**: El sistema NO DEBE alterar ningún otro pendiente, sección, conteo o destinatario a causa de esta regla; solo se suprime lo relativo a la aceptación de términos cuando la empresa carece de texto.
- **FR-011**: En las vistas de administración (tabla y tarjetas de empleados), el sistema NO DEBE mostrar a los usuarios de empresas sin texto como "Pendiente" por aceptación de términos.
- **FR-012**: La stat card "Aceptación de términos" NO DEBE contar usuarios de empresas sin texto como "Pendiente" por términos.
- **FR-013**: En la UI de administración, la preselección de destinatarios del recordatorio manual NO DEBE seleccionar a usuarios por el pendiente de términos cuando la empresa no tiene texto. El envío backend del recordatorio manual ya queda cubierto por el guard descrito en FR-007 y no requiere cambios.

### Key Entities _(include if feature involves data)_

- **Empresa (Owner)**: registrada como propietario del tenant. Atributo relevante: el texto de términos/disclaimer configurado, que puede estar ausente, vacío o contener solo espacios. Determina si existe o no el pendiente de aceptación de términos para toda la empresa.
- **Usuario (empleado o administrador)**: pertenece a una empresa y puede tener o no un registro de aceptación de términos. Su condición de "pendiente de términos" depende de que la empresa tenga texto configurado.
- **Registro de aceptación de términos**: evidencia de que un usuario aceptó los términos de su empresa. Su ausencia o invalidez solo se interpreta como pendiente cuando la empresa tiene texto configurado.
- **Estado de firma (superficie de administración)**: indicador por usuario derivado del pendiente de aceptación de términos que se refleja en la tabla y las tarjetas de empleados y en la stat card "Aceptación de términos". No debe señalar "Pendiente" cuando la empresa carece de texto.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Para el 100% de las empresas sin texto de términos (nulo, vacío o solo espacios), ningún correo diario de empleados incluye la sección "Términos y condiciones sin aceptar".
- **SC-002**: Para el 100% de las empresas sin texto de términos, el reporte diario de administradores no incluye la sección detallada de términos ni la métrica de términos en el resumen estadístico (ambas ausentes).
- **SC-003**: Se reduce a cero la cantidad de correos diarios a empleados cuyo único pendiente era la aceptación de términos en empresas sin texto configurado.
- **SC-004**: Para las empresas con texto de términos configurado, el 100% de los conteos y secciones de términos coincide con el comportamiento actual (sin regresión).
- **SC-005**: En una ventana de al menos 7 corridas diarias consecutivas, cero usuarios pertenecientes a empresas sin texto de términos aparecen señalizados como pendientes de términos en cualquier correo, reporte o vista de administración.
- **SC-006**: Todos los canales y superficies que mencionan el pendiente (recordatorio manual, recordatorio diario de empleados, reporte diario de administradores y vistas de administración) presentan un criterio idéntico para una misma empresa sin texto, verificable con una única empresa de prueba.
- **SC-007**: Para el 100% de las empresas sin texto de términos, ninguna vista de administración (tabla, tarjetas de empleados ni stat card "Aceptación de términos") muestra a sus usuarios como pendientes de términos.
- **SC-008**: Para el 100% de las empresas sin texto de términos, la stat card "Aceptación de términos" no cuenta usuarios como "Pendiente" por términos.

## Assumptions

- "Vacío" incluye explícitamente cadenas en blanco compuestas solo por espacios, tabulaciones o saltos de línea, no únicamente el valor nulo.
- La regla se decide con el estado del texto de términos de la empresa al momento de generar cada correo, reporte o vista; no se evalúa contra un valor histórico.
- Los canales/superficies existentes que mencionan el pendiente son: recordatorio manual de disclaimer (alineado), recordatorio diario por empleado, reporte diario a administradores y las vistas de administración (tabla/tarjetas de empleados y stat card "Aceptación de términos"). No se identificaron otros canales en el alcance.
- El contrato de la lista de empleados de administración y su campo de estado de firma no cambian: el valor interno "Pendiente" puede seguir presente en la respuesta, pero su único consumidor visible (la UI de Admin) lo oculta y no lo cuenta como pendiente de términos.
- El camino backend que obtiene los empleados pendientes de firma del recordatorio manual no se modifica: el guard del recordatorio manual (FR-007) ya lo cubre.
- El recordatorio manual se alinea al criterio común de "sin texto" (nulo, vacío o solo espacios en blanco); su bloqueo actual se toma como comportamiento de referencia.
- La infraestructura de envío de correos y los programadores diarios existentes siguen operativos; no se modifican horarios ni destinatarios.
- Cada usuario pertenece a una sola empresa y la condición se evalúa por empresa (aislamiento multi-tenant).
- No se introduce ningún dominio nuevo; el cambio vive en los dominios existentes de pendientes por empleado, reporte diario y términos/disclaimer.
- No se agregan nuevas secciones ni pantallas de UI; el alcance sí incluye ajustar vistas de administración existentes (tabla y tarjetas de empleados, stat card "Aceptación de términos") para reflejar la regla.
