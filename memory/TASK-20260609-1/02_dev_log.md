---
task_id: TASK-20260609-1
agent: blendverse.back
attempts: 1
status: DONE
date: 2026-06-09
---

# Dev Log — Autenticación Multiempresas (Backend)

## Resumen

Se implementó el soporte multi-empresa en la capa de autenticación del servidor. Se creó el dominio `EmpresasUsuarios` y se modificó el dominio `Auth` para manejar el flujo de selección.

## Archivos creados

### Dominio `EmpresasUsuarios` (nuevo)

- `packages/server/src/domains/EmpresasUsuarios/Domain/EmpresaUsuario.entity.ts`
- `packages/server/src/domains/EmpresasUsuarios/Domain/EmpresaUsuario.interfaces.ts`
- `packages/server/src/domains/EmpresasUsuarios/Domain/EmpresaUsuario.repository.ts`
- `packages/server/src/domains/EmpresasUsuarios/Domain/index.ts`
- `packages/server/src/domains/EmpresasUsuarios/Application/UseCases/GetCompaniesByUser.usecase.ts`
- `packages/server/src/domains/EmpresasUsuarios/Application/UseCases/index.ts`
- `packages/server/src/domains/EmpresasUsuarios/Application/EmpresasUsuarios.service.ts`
- `packages/server/src/domains/EmpresasUsuarios/Application/index.ts`
- `packages/server/src/domains/EmpresasUsuarios/Infrastructure/Database/EmpresaUsuario.model.ts`
- `packages/server/src/domains/EmpresasUsuarios/Infrastructure/Database/EmpresaUsuarioRepository.implementation.ts`
- `packages/server/src/domains/EmpresasUsuarios/Infrastructure/Database/Relations.ts`
- `packages/server/src/domains/EmpresasUsuarios/Infrastructure/Database/index.ts`
- `packages/server/src/domains/EmpresasUsuarios/Infrastructure/index.ts`
- `packages/server/src/domains/EmpresasUsuarios/empresasUsuarios.di.ts`
- `packages/server/src/domains/EmpresasUsuarios/index.ts`

### Auth — Nuevo use case

- `packages/server/src/domains/Auth/Application/UseCases/SelectCompany.usecase.ts`

## Archivos modificados

### Auth

- `Auth/Application/auth.types.ts` — Union type `ILoginResult` + `ISelectCompanyInput`
- `Auth/Application/UseCases/Login.usecase.ts` — Inyecta `GetCompaniesByUser`, retorna union
- `Auth/Application/UseCases/index.ts` — Exporta `SelectCompany`
- `Auth/Application/Auth.service.ts` — Agrega `selectCompany()`
- `Auth/Infrastructure/Controllers/Auth.controller.ts` — Maneja `requiresSelection` + `selectCompany` procedure
- `Auth/Infrastructure/Routes/Auth.routes.ts` — Ruta `selectCompany`
- `Auth/Infrastructure/Routes/AuthRoutes.ts` — Ruta `selectCompany`
- `Auth/auth.di.ts` — Registra `_selectCompany`

### Globales

- `packages/server/src/domains/register.ts` — Registra `empresasUsuariosApp`
- `packages/server/src/Infrastructure/Database/relations.ts` — Llama `relateEmpresasUsuarios()`

### Tests actualizados

- `Auth/Application/specs/Auth.service.spec.ts`
- `Auth/Application/UseCases/specs/Login.usecase.spec.ts`

## Flujo implementado

```
POST /auth.login
  → validatePassword
  → getCompaniesByUser (403 si 0 empresas)
  → 1 empresa  → JWT completo + cookie
  → N empresas → selectionToken (1h) + lista de empresas

POST /auth.selectCompany
  → verifyToken(selectionToken, type='selection')
  → validar id_empresa en payload
  → getCompaniesByUser + getRoleByUser + getOwnersys
  → JWT completo + cookie
```

## Validación

- `tsc --noEmit`: ✅ 0 errores
