---
task_id: 'TASK-20260609-1'
agent: 'Analyst_Agent'
status: 'DONE'
version: '1.0.0'
date: '2026-06-09'
---

# Requerimientos: Autenticación Multiempresas

## Descripción de la Necesidad

Habilitar un sistema multi-tenant donde un usuario puede pertenecer a más de una empresa (`Sis_propietarios`) al mismo tiempo. Al iniciar sesión, el sistema debe derivarlo a una pantalla de selección de empresa (si pertenece a múltiples), ingresar directamente a la aplicación (si sólo tiene una) o denegarle el acceso (si no tiene ninguna). Los datos de la empresa para selección se extraen exclusivamente de `Sis_propietarios`.

## Alcance

- **Incluye:** Modificación del endpoint de login (para retornar empresas del usuario), creación/actualización de repositorios en el servidor para unir `Empresas_usuarios` con `Sis_propietarios`, Frontend: Pantalla de Selección de Empresa, Lógica de redirección condicional post-login, elemento de menú "Cambiar de Empresa", inicialización del contexto global (`ownerId`).
- **Excluye:** Pantallas de asignación/administración de empresas a usuarios; lógica para variar roles por empresa (el rol del usuario es general para todas sus empresas); uso de la tabla `Empresas`.

## Dominio Afectado

| Capa   | Dominio | Tipo de cambio |
| ------ | ------- | -------------- |
| server | Auth    | Modificación   |
| app    | Auth    | Modificación   |
| app    | Layout  | Modificación   |

**Tipo de tarea:** `full-stack`

## User Stories

### US-01: Verificación de empresas tras inicio de sesión

**Como** usuario del sistema, **quiero** que al iniciar sesión mi cuenta sea verificada frente a las empresas asociadas, **para** que el sistema responda de forma adecuada a mi asignación.

**Criterios de Aceptación:**

- [ ] Si el usuario no tiene registros en `Empresas_usuarios`, se deniega el acceso y se muestra en frontend un mensaje alusivo para contactar al administrador.
- [ ] Si el usuario tiene exactamente 1 registro en `Empresas_usuarios`, el sistema asume esa empresa como contexto activo, redirigiendo directamente a la vista principal sin pasos intermedios.
- [ ] Si el usuario tiene 2 o más empresas, el backend devuelve el listado con información (id, nombre, imagen obtenidas mediante join de `Sis_propietarios`) y el frontend redirige a la pantalla selectora de empresas.

### US-02: Selección de Empresa

**Como** usuario con múltiples empresas, **quiero** poder seleccionar el contexto de la empresa a la cual deseo ingresar, **para** visualizar y operar de manera correcta.

**Criterios de Aceptación:**

- [ ] El frontend implementa una "Pantalla de Selección de Empresa" accesible tras una autenticación válida.
- [ ] La UI lista como botón o tarjeta informativa las opciones disponibles (Nombre, Logo/Imagen provistos de `Sis_propietarios`).
- [ ] Al seleccionar, el valor del `ownerId` se carga en el contexto principal del frontend (afectando de manera transparente a las siguientes directivas de la API).

### US-03: Cambio de Empresa Intra-Navegación

**Como** usuario con múltiples empresas, **quiero** volver a la selección de empresa en cualquier momento desde el menú principal, **para** poder trabajar en otra firma sin salir de mi sesión activa.

**Criterios de Aceptación:**

- [ ] Existe un botón/elemento en el menú interactivo para usuarios cuyas empresas excedan 1 de largo (`empresas.length > 1`).
- [ ] Al hacer clic, redirige al usuario de vuelta a la "Pantalla de Selección de Empresa" respetando la preservación del login (token aún es válido) para que actúe el seteo del nuevo `ownerId`.

## Propuestas de Mejora UX

- **Feedback de Selección:** Añadir sutil transición o estado de carga "Iniciando como [Nombre]" una vez que clickea en la tarjeta de la empresa seleccionada antes del redireccionamiento real final al dashboard.
- **Estado de Contexto Visible:** Añadir avatar o texto miniatura en la barra superior o en el sidebar para visualizar constantemente la empresa activa actual antes del botón de cambio.

## Dependencias con Dominios Existentes

| Dominio Proveedor | Tipo de Relación | Skill a usar |
| ----------------- | ---------------- | ------------ |
| Auth / Users      | Autenticación    | -            |

_Si el flujo interno requiere cruzar el modulo Auth con la recolección de usuario, aplicar `cross-domain-relations`._

## Estimación de Complejidad

- **Nivel:** Media
- **Motivo:** Involucra tanto el flujo esencial de autenticación (Backend) como el contexto global activo de react, con variaciones por estado de cuenta en Frontend.
