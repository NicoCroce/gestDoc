# API Contracts

Internal tRPC contracts between the Backend (Node) and Frontend (React Vite).

## Procedure: `auth.login`

**Input**

```typescript
{
  email: string;
  password: string;
}
```

**Output**

```typescript
{
  token: string;
  empresas: [
    {
      id_empresa: number;
      nombre: string;
      imagen: string | null;
    }
  ]
}
```

## Procedure: `auth.me` (or similar profile fetch)

**Output modified to include `empresas`** to support page refreshes:

```typescript
{
  id: number;
  email: string;
  rol: string;
  empresas: [
    {
      id_empresa: number;
      nombre: string;
      imagen: string | null;
    }
  ]
}
```
