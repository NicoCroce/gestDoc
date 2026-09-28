---
name: back-ddd-generator
description: Genera un dominio DDD completo en el servidor: entidad, interfaces, repositorio, use cases, servicio, controlador, modelo Sequelize, implementación de repositorio, rutas tRPC y registro DI. Incluye las actualizaciones a los archivos globales de registro.
---

# Back DDD Generator

## ⚠️ CONTROL DE CONTEXTO (ESTRICTO)

- **MODO AISLADO:** No uses `@workspace`. Solo el contexto que el usuario te provee.
- **TRABAJA UN DOMINIO A LA VEZ** y verifica errores tras cada creación.
- **NO modifiques archivos fuera de `packages/server/`** excepto los dos archivos de registro global indicados al final.

## Herramientas Requeridas

- `read/readFile` — Para leer archivos de referencia antes de comenzar
- `edit/createFile` — Para crear cada archivo del dominio
- `edit/editFiles` — Para actualizar los archivos globales de registro
- `diagnostics/getErrors` — Para verificar errores al finalizar

---

## Convención de Nombres del Proyecto

| Elemento                                 | Idioma      | Ejemplos                                  |
| ---------------------------------------- | ----------- | ----------------------------------------- |
| Carpeta del dominio                      | **Inglés**  | `ArticleSpecialDiscounts/`, `Customers/`  |
| Clases (Entidad, Modelo, Servicio, etc.) | **Inglés**  | `ArticleSpecialDiscount`, `CustomerModel` |
| Atributos de la entidad                  | **Español** | `cantidad_minima`, `tipo_descuento`       |
| Nombres de columnas en la DB             | **Español** | `id_articulo`, `fecha_sincronizacion_mg`  |
| Parámetros de interfaces                 | **Español** | `id_propietario`, `denominacion`          |

> **IMPORTANTE:** Nunca traducir los nombres de columnas ni atributos de entidad al inglés. Siempre mantener los nombres tal como están en la base de datos.

---

## Protocolo de Preguntas (OBLIGATORIO si faltan datos)

Antes de generar cualquier archivo, pregunta al usuario:

1. **Nombre de la entidad** (PascalCase singular): ej. `Product`
2. **Nombre del dominio** (PascalCase plural): ej. `Products` → carpeta `Products/`
3. **Atributos de la entidad** con sus tipos TypeScript: ej. `nombre: string`, `precio: number`, `activo: boolean`
4. **¿Cuáles son los campos obligatorios vs opcionales?**
5. **Operaciones CRUD necesarias**: `getAll`, `getById`, `create`, `update`, `delete` (¿todas o un subset?)
6. **¿Necesita paginación en `getAll`?** (casi siempre sí)
7. **¿Hay relaciones con otros dominios?** (ver skill `cross-domain-relations`)

---

## Validación de Estructura (OBLIGATORIO)

Antes de crear el primer archivo, lista para el usuario el árbol de carpetas y archivos exactos que vas a crear. **No procedas sin aprobación.**

```
packages/server/src/domains/[Domain]/
├── Domain/
│   ├── [Entity].entity.ts
│   ├── [Entity].repository.ts
│   └── index.ts
├── Application/
│   ├── UseCases/
│   │   ├── GetAll[Entities].usecase.ts
│   │   ├── Get[Entity].usecase.ts
│   │   ├── Create[Entity].usecase.ts
│   │   ├── Update[Entity].usecase.ts
│   │   ├── Delete[Entity].usecase.ts
│   │   └── index.ts
│   ├── [domain].types.ts
│   ├── [Domain].service.ts
│   └── index.ts
├── Infrastructure/
│   ├── Controllers/
│   │   ├── [Domain].controller.ts
│   │   └── index.ts
│   ├── Database/
│   │   ├── [Entity].model.ts
│   │   ├── [Entity]Repository.implementation.ts
│   │   └── index.ts
│   ├── Routes/
│   │   ├── [Domain].routes.ts
│   │   └── index.ts
│   └── index.ts
├── [domain].di.ts
└── index.ts

Archivos globales a actualizar:
  packages/server/src/domains/register.ts
  packages/server/src/Infrastructure/Routes/Router.ts
```

---

## Estructura de Archivos a Generar y Mapeo de Templates

### Variables de sustitución

- `[Entity]` = nombre singular PascalCase → ej. `Product`
- `[Entities]` = nombre plural PascalCase → ej. `Products`
- `[Domain]` = nombre del dominio PascalCase → ej. `Products`
- `[domain]` = nombre del dominio camelCase → ej. `products`
- `[domainFolder]` = nombre de la carpeta → ej. `Products`
- `[fields]` = atributos específicos del usuario

---

## Templates

Los templates de cada archivo están en `.opencode/skills/back-ddd-generator/templates.md`. Leerlo **solo al crear un dominio nuevo**; para cambios en un dominio existente, imitar los archivos hermanos del dominio.

## Archivos Globales a Actualizar

### 1. `packages/server/src/domains/register.ts`

Agregar el import del nuevo app y spreadearlo en `registerDomains`:

```typescript
import { [domain]App } from './[Domain]';

export const registerDomains = () => ({
  // ... existentes ...
  ...[domain]App,
});
```

### 2. `packages/server/src/Infrastructure/Routes/Router.ts`

Agregar el import de las rutas y spreadearlo en `MainRouter`:

```typescript
import { [Domain]Routes } from '@server/domains/[Domain]';

const MainRouter = () => {
  const AllRouters = {
    // ... existentes ...
    ...[Domain]Routes(),
  };
  return router(AllRouters);
};
```

---

## Restricciones

1. Los casos de uso importan e inyectan solo repositorios del mismo dominio, no puede importar otros repositorios.
2. Si un caso de uso necesita un método de otro dominio, deberá ser llamado desde un caso de uso exportado en el otro dominio, por medio de la inyección de dependencia sobre el caso de uso del dominio correspondiente. `Por ejemnplo: Auth necesita renovar contraseña del usuario, por lo que llamará al caso de uso correspondiente del dominio de Users`.

## Checklist Final

Tras crear todos los archivos, ejecuta `diagnostics/getErrors` y verifica:

- [ ] No hay errores de TypeScript
- [ ] Los imports usan `@server/*` (no rutas relativas entre dominios)
- [ ] El `[domain].di.ts` exporta todos los use cases con prefijo `_`
- [ ] `register.ts` incluye el nuevo dominio
- [ ] `Router.ts` incluye las nuevas rutas
- [ ] `id_propietario` NO aparece en los schemas Zod de entrada; se asigna desde `requestContext.values.ownerId` en los use cases de create/update
- [ ] El `index.ts` público exporta SOLO `./Domain`, `./Application`, `./Infrastructure/Routes` y `./[domain].di` (nunca `./Infrastructure` completo)
- [ ] El repositorio filtra por `ownerId` en cada método que corresponde
