import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGetStatisticsEmpleados } from '../useGetStatisticsEmpleados';

const { useGetEmployeesMock } = vi.hoisted(() => ({
  useGetEmployeesMock: vi.fn(),
}));

vi.mock('../useEmployeeActions', () => ({
  useGetEmployees: useGetEmployeesMock,
}));

const employees = [
  {
    id: 1,
    nombre: 'Ana',
    apellido: 'Ruiz',
    email: 'ana@test.com',
    renovar_clave: false,
    estado_firma: 'Firmado' as const,
  },
  {
    id: 2,
    nombre: 'Leo',
    apellido: 'Díaz',
    email: 'leo@test.com',
    renovar_clave: false,
    estado_firma: 'Pendiente' as const,
  },
  {
    id: 3,
    nombre: 'Eva',
    apellido: 'Gil',
    email: 'eva@test.com',
    renovar_clave: true,
    estado_firma: 'Pendiente' as const,
  },
];

const mockEmployeesQuery = (data: typeof employees | []) => {
  useGetEmployeesMock.mockReturnValue(() => ({
    data: { data, meta: {} },
    isLoading: false,
  }));
};

describe('useGetStatisticsEmpleados (stat card Aceptación de términos)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('computes dataChartEstadoFirma from estado_firma when the company has terms text', () => {
    mockEmployeesQuery(employees);

    const { result } = renderHook(() => useGetStatisticsEmpleados(true));

    expect(result.current.total).toBe(3);
    expect(result.current.dataChartEstadoFirma).toEqual([
      { segment: 'Firmado', data: 1, fill: 'hsl(142, 71%, 45%)' },
      { segment: 'Pendiente', data: 2, fill: 'hsl(45, 93%, 58%)' },
    ]);
  });

  it('returns an empty dataChartEstadoFirma without counting pendings when the company has no terms text', () => {
    mockEmployeesQuery(employees);

    const { result } = renderHook(() => useGetStatisticsEmpleados(false));

    // No se cuenta ningún usuario por términos (FR-012).
    expect(result.current.dataChartEstadoFirma).toEqual([]);
    // Los demás gráficos no se alteran.
    expect(result.current.dataChartRenovacionClave).toEqual([
      { segment: 'Debe renovar', data: 1, fill: 'hsl(0, 84%, 60%)' },
      { segment: 'OK', data: 2, fill: 'hsl(142, 71%, 45%)' },
    ]);
    expect(result.current.dataChartTotal).toEqual([
      { segment: 'empleados', data: 3, fill: 'hsl(var(--chart-1))' },
    ]);
  });

  it('returns an empty dataChartEstadoFirma when there are no employees', () => {
    mockEmployeesQuery([]);

    const { result } = renderHook(() => useGetStatisticsEmpleados(true));

    expect(result.current.total).toBe(0);
    expect(result.current.dataChartEstadoFirma).toEqual([]);
  });
});
