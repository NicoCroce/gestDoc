import { renderHook, act } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useEmpleadosPage } from '../useEmpleadosPage';

const {
  useGetEmployeesMock,
  useSendRemindersMock,
  useHasDisclaimerTextMock,
  useURLParamsMock,
} = vi.hoisted(() => ({
  useGetEmployeesMock: vi.fn(),
  useSendRemindersMock: vi.fn(),
  useHasDisclaimerTextMock: vi.fn(),
  useURLParamsMock: vi.fn(),
}));

vi.mock('@app/Application/Hooks/useURLParams', () => ({
  useURLParams: useURLParamsMock,
}));

vi.mock('@app/Domains/Admin/Hooks/useEmployeeActions', () => ({
  useGetEmployees: useGetEmployeesMock,
  useSendReminders: useSendRemindersMock,
}));

vi.mock('../useHasDisclaimerText', () => ({
  useHasDisclaimerText: useHasDisclaimerTextMock,
}));

const employees = [
  {
    id: 1,
    nombre: 'Ana',
    apellido: 'Ruiz',
    email: 'ana@test.com',
    renovar_clave: false,
    estado_firma: 'Pendiente' as const,
  },
  {
    id: 2,
    nombre: 'Leo',
    apellido: 'Díaz',
    email: 'leo@test.com',
    renovar_clave: false,
    estado_firma: 'Firmado' as const,
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

const mockEmployeesQuery = (isLoading = false) => {
  useGetEmployeesMock.mockReturnValue(() => ({
    data: { data: employees, meta: {} },
    isLoading,
    isError: false,
    error: null,
  }));
};

describe('useEmpleadosPage — preselección del recordatorio (US4)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useURLParamsMock.mockReturnValue({
      searchParams: { page: '1', limit: '10' },
    });
    useSendRemindersMock.mockReturnValue({ mutate: vi.fn(), isPending: false });
    useHasDisclaimerTextMock.mockReturnValue({
      hasDisclaimerText: true,
      isLoading: false,
    });
    mockEmployeesQuery();
  });

  it('preselects only employees pending signature when the company has terms text', () => {
    const { result } = renderHook(() => useEmpleadosPage());

    act(() => result.current.handleActivateSelection());

    expect(result.current.selectionMode).toBe(true);
    expect([...result.current.selectedIds].sort()).toEqual([1, 3]);
  });

  it('does not preselect anyone by terms pending when the company has no terms text', () => {
    useHasDisclaimerTextMock.mockReturnValue({
      hasDisclaimerText: false,
      isLoading: false,
    });

    const { result } = renderHook(() => useEmpleadosPage());

    act(() => result.current.handleActivateSelection());

    expect(result.current.selectionMode).toBe(true);
    expect(result.current.selectedIds.size).toBe(0);
  });

  it('includes the disclaimer flag loading state in the page isLoading', () => {
    mockEmployeesQuery(false);
    useHasDisclaimerTextMock.mockReturnValue({
      hasDisclaimerText: false,
      isLoading: true,
    });

    const { result } = renderHook(() => useEmpleadosPage());

    expect(result.current.isLoading).toBe(true);
  });

  it('exposes the company flag coming from useHasDisclaimerText', () => {
    useHasDisclaimerTextMock.mockReturnValue({
      hasDisclaimerText: true,
      isLoading: false,
    });

    const { result } = renderHook(() => useEmpleadosPage());

    expect(result.current.hasDisclaimerText).toBe(true);
  });
});
