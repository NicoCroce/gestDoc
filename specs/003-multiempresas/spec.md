# Specification: Multiempresas

## 1. Feature Description

Habilitar un sistema multi-empresas (multi-tenant) donde un único usuario puede pertenecer a más de una empresa (propietario) al mismo tiempo. Al iniciar sesión, el sistema identificará a cuántas empresas está asociado el usuario. Si tiene múltiples empresas, verá una pantalla de selección antes de ingresar. Si tiene solo una, ingresará directamente. Todos los datos de la empresa a presentar se obtendrán de la tabla `Sis_propietarios`. Una vez dentro de la aplicación, los usuarios con múltiples empresas tendrán un ítem en el menú que los redirigirá de vuelta a la pantalla de "Selección de Empresa".

## Clarifications

### Session 2026-06-09

- Q: ¿Qué comportamiento se espera si un usuario inicia sesión y no tiene ninguna empresa asociada? → A: Denegar acceso y mostrar mensaje para notificar al administrador (B2B standard).
- Q: ¿Debería la FK en `Empresas_usuarios` apuntar a `Sis_propietarios` directamente? → A: Sí, el `id_empresa` referencia de manera directa a `Sis_propietarios(id)`.
- Q: ¿Los roles del usuario cambian por empresa? → A: No, el rol es "general" y los mismos permisos de acceso se aplican en todas sus empresas asignadas.
- Q: ¿Debe existir la capacidad de cambiar de empresa desde adentro? → A: Sí, los usuarios con múltiples empresas tendrán un ítem en el menú que los redirigirá de vuelta a la pantalla de selección de empresa.

## 2. User Scenarios / Use Cases

- **Escenario 1: Inicio de sesión con una sola empresa asignada**
  1. El usuario ingresa sus credenciales válidas y hace clic en iniciar sesión.
  2. El sistema verifica en `Empresas_usuarios` y detecta que pertenece a 1 sola empresa.
  3. El sistema omite la pantalla de selección e ingresa directamente al dashboard (o pantalla principal) bajo el contexto de esa empresa.

- **Escenario 2: Inicio de sesión con múltiples empresas asignadas**
  1. El usuario ingresa sus credenciales válidas y hace clic en iniciar sesión.
  2. El sistema verifica en `Empresas_usuarios` y detecta que pertenece a 2 o más empresas.
  3. El sistema redirige al usuario a una pantalla de selección mostrando botones con el nombre y la imagen de cada empresa (obtenidos de `Sis_propietarios`).
  4. El usuario hace clic en una de las empresas.
  5. El sistema carga el contexto bajo la empresa seleccionada y lo redirige a la pantalla principal.

- **Escenario 3: Inicio de sesión sin empresas asignadas**
  1. El usuario inicia sesión y no posee registros en `Empresas_usuarios`.
  2. El sistema deniega el acceso y muestra un mensaje de error indicando que no tiene empresas asignadas y notificando que debe contactar al administrador.

- **Escenario 4: Cambio de empresa intra-navegación**
  1. El usuario ya se encuentra dentro del dashboard bajo el contexto de la "Empresa A".
  2. El usuario selecciona la opción "Cambiar de empresa" en el menú principal.
  3. El sistema lo redirige de vuelta a la pantalla de "Selección de Empresa".
  4. El usuario selecciona la "Empresa B" de su lista asignada y el sistema carga el nuevo contexto.

## 3. Functional Requirements

- **FR1:** El backend debe definir u obtener la relación muchos-a-muchos (`n a n`) en la tabla `Empresas_usuarios` (`id`, `id_empresa`, `id_usuario`).
- **FR2:** Durante el proceso de autenticación o post-autenticación inmediata, el backend debe proporcionar el listado de empresas a las que pertenece el usuario.
- **FR3:** Los detalles visuales de la empresa (nombre, imagen, etc.) deben consultarse obligatoriamente relacionando la información con la tabla `Sis_propietarios`. La FK en `Empresas_usuarios` (`id_empresa`) apunta directamente a `Sis_propietarios` (`id`).
- **FR4:** El frontend debe implementar una "Pantalla de Selección de Empresa" que liste botones u opciones visuales (incluyendo nombre e imagen) para las empresas del usuario.
- **FR5:** El frontend debe implementar lógica condicional tras el login: si `empresas.length > 1` -> Pantalla de selección. Si `empresas.length === 1` -> Autoseleccionar la única empresa. Si `empresas.length === 0` -> Mostrar alerta y bloquear acceso.
- **FR6:** El contexto de navegación, llamadas a la API futuras y estado global (ej. `ownerId`) deben setearse según la empresa seleccionada de manera acorde a las reglas del monorepo.
- **FR7:** El frontend debe proveer un ítem en el menú principal (para usuarios con `empresas.length > 1`) que los redirija a la Pantalla de Selección de Empresa, permitiendo cambiar de contexto sin re-login.
- **FR8:** El control de accesos se determina bajo un "Rol General" por usuario que se mantiene idéntico no importando en qué contexto de empresa opere.

## 4. Success Criteria

- El 100% de los usuarios con más de una empresa son dirigidos a la pantalla de selección de empresa al iniciar sesión.
- El 100% de los usuarios con una sola empresa acceden a la aplicación sin pasos adicionales (saltan la pantalla de selección).
- Los usuarios con 0 empresas son bloqueados correctamente con mensaje alusivo.
- Ningún dato mostrado en la selección proviene de la tabla `Empresas`; todo proviene de `Sis_propietarios`.
- Los usuarios con múltiples empresas pueden volver a la pantalla de selección desde el menú principal fácilmente.

## 5. Key Entities / Data Model (High Level)

- **Empresas_usuarios:** Tabla asociativa `n a n`. Relaciona un `id_usuario` con un `id_empresa` el cual referencia a `Sis_propietarios` (`id`).
- **Usuarios / Sec_usuarios:** Entidad existente del usuario autenticado. El rol de estos es global a todas sus empresas.
- **Sis_propietarios:** Entidad que contiene la información de la empresa (nombre, imagen, etc.) que será presentada en la interfaz.

## 6. Assumptions & Constraints

- **Restricción 1:** No se puede usar la tabla `Empresas` para obtener los datos de la empresa, todo se lee de `Sis_propietarios`.
- **Restricción 2:** Uso estricto de `Sis_propietarios` para alimentar la UI (pantalla de selección).
- **Asunción 1:** La estructura general y librerías del proyecto (tRPC, React, Vite) se mantendrán para el desarrollo de las pantallas y endpoints.
