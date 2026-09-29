# Frontend Design Brief — 008 Sin texto de términos no existe pendiente

## Naturaleza del cambio

Corrección **sustractiva** de la gestión de empleados del administrador. No se introduce
una nueva dirección visual, ni tokens, ni componentes, ni copy nueva. La estética, la
tipografía, los colores y los espaciados son los existentes (tokens shadcn / Tailwind ya
en uso en `packages/app/src/Domains/Admin`). El único trabajo de diseño es **qué dejar de
mostrar** cuando la empresa no tiene texto de términos configurado.

## Superficies afectadas (todas existentes)

| Superficie                         | Archivo actual                                                              | Comportamiento cuando la empresa NO tiene texto                                                                                                                                                                                                                |
| ---------------------------------- | --------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Columna "Estado de firma" (tabla)  | `Components/EmpleadosColumns.tsx`                                           | La columna no se incluye en la definición de columnas.                                                                                                                                                                                                         |
| Estado de firma (tarjetas)         | `Components/EmployeeCards.tsx`                                              | No se renderiza el bloque de estado de firma.                                                                                                                                                                                                                  |
| Stat card "Aceptación de términos" | `Components/StatisticsEmpleados.tsx` + `Hooks/useGetStatisticsEmpleados.ts` | El stat card no se renderiza (no se calculan ni se muestran sus conteos de firmados/pendientes/corruptos). Nota: la superficie real es un stat card con puntos de color, no un donut — `dataChartEstadoFirma` alimenta ese card, no un `PieChart` renderizado. |
| Preselección de recordatorios      | `Hooks/useEmpleadosPage.ts`                                                 | El botón sigue disponible, pero no preselecciona a nadie por términos.                                                                                                                                                                                         |

## Reglas de diseño

1. **Ocultar, no reemplazar.** No inventar un estado "No aplica" ni un badge neutro. Si no
   hay texto, el concepto "estado de firma" no existe para esa empresa: se omite la
   columna y la sección del gráfico por completo. Cero copy nueva.
2. **Un único interruptor.** La condición empresa-con-texto debe venir de una sola fuente
   (una bandera a nivel empresa desde el backend) y derivar de ahí la visibilidad de
   columna, bloque de tarjeta y sección del gráfico. Nada de chequeos repetidos en cada
   componente.
3. **Sin huecos de layout.** Al ocultar la columna, la tabla debe reflowear sin dejar
   columnas fantasma ni encabezado vacío; al ocultar el stat card "Aceptación de términos",
   la grilla de estadísticas (`grid-cols-1 md:grid-cols-3`) debe pasar a una grilla de 2
   columnas (no dejar un card vacío ni una celda huérfana).
4. **Consistencia con el reporte.** Es el mismo principio ya elegido para el reporte
   diario a administradores: cuando no hay texto, se omite toda referencia a términos.
5. **Empresa con texto:** comportamiento actual exacto, sin cambios visuales.

## Fuera de alcance

- Rediseño de la tabla, las tarjetas o el panel de estadísticas.
- Nuevos colores, tipografías, iconografía o animaciones.
- Estados vacíos nuevos o mensajes explicativos sobre la ausencia de términos.
