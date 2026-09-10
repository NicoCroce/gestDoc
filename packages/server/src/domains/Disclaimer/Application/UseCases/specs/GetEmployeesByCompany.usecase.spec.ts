import { describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetEmployeesByCompany } from '../GetEmployeesByCompany.usecase';

const requestContext = new RequestContext(1, 'req-1', 99);

const createIsDisclaimerEnabled = (enabled: boolean) => ({
  execute: vi.fn().mockResolvedValue(enabled),
});

const mockEmployees = [
  {
    id: 1,
    nombre: 'Juan',
    apellido: 'Perez',
    email: 'juan@test.com',
    renovar_clave: false,
    estado_firma: 'Firmado' as const,
  },
  {
    id: 2,
    nombre: 'Maria',
    apellido: 'Gomez',
    email: 'maria@test.com',
    renovar_clave: true,
    estado_firma: 'Pendiente' as const,
  },
  {
    id: 3,
    nombre: 'Carlos',
    apellido: 'Lopez',
    email: 'carlos@test.com',
    renovar_clave: false,
    estado_firma: 'Corrupto' as const,
  },
];

const makePaginatedResponse = (data: typeof mockEmployees) => ({
  data,
  meta: {
    totalItems: data.length,
    totalPages: 1,
    currentPage: 1,
    hasMore: false,
  },
});

describe('GetEmployeesByCompany', () => {
  it('returns employees scoped by ownerId for regular admin', async () => {
    const mockRepo = {
      getEmployeesByCompany: vi
        .fn()
        .mockResolvedValue(makePaginatedResponse(mockEmployees)),
    };

    const useCase = new GetEmployeesByCompany(
      mockRepo as never,
      createIsDisclaimerEnabled(true) as never,
    );
    const result = await useCase.execute({
      input: { search: '' },
      requestContext,
    });

    expect(result.data).toHaveLength(3);
    expect(result.data[0]).toEqual(mockEmployees[0]);
    expect(result.meta.totalItems).toBe(3);
    expect(mockRepo.getEmployeesByCompany).toHaveBeenCalledWith({
      ownerId: 99,
      search: '',
      page: undefined,
      limit: undefined,
      requestContext,
    });
  });

  it('overrides estado_firma to No aplica when disclaimer is not enabled', async () => {
    const mockRepo = {
      getEmployeesByCompany: vi
        .fn()
        .mockResolvedValue(makePaginatedResponse(mockEmployees)),
    };

    const useCase = new GetEmployeesByCompany(
      mockRepo as never,
      createIsDisclaimerEnabled(false) as never,
    );
    const result = await useCase.execute({
      input: { search: '' },
      requestContext,
    });

    expect(result.data).toHaveLength(3);
    expect(result.data.every((e) => e.estado_firma === 'No aplica')).toBe(true);
    expect(result.meta.totalItems).toBe(3);
  });

  it('passes search filter to repository', async () => {
    const mockRepo = {
      getEmployeesByCompany: vi
        .fn()
        .mockResolvedValue(makePaginatedResponse([mockEmployees[0]])),
    };

    const useCase = new GetEmployeesByCompany(
      mockRepo as never,
      createIsDisclaimerEnabled(true) as never,
    );
    const result = await useCase.execute({
      input: { search: 'Juan' },
      requestContext,
    });

    expect(result.data).toHaveLength(1);
    expect(mockRepo.getEmployeesByCompany).toHaveBeenCalledWith({
      ownerId: 99,
      search: 'Juan',
      page: undefined,
      limit: undefined,
      requestContext,
    });
  });

  it('uses provided ownerId when given (superadmin)', async () => {
    const mockRepo = {
      getEmployeesByCompany: vi
        .fn()
        .mockResolvedValue(makePaginatedResponse(mockEmployees)),
    };

    const useCase = new GetEmployeesByCompany(
      mockRepo as never,
      createIsDisclaimerEnabled(true) as never,
    );
    await useCase.execute({
      input: { ownerId: 200, search: '' },
      requestContext,
    });

    expect(mockRepo.getEmployeesByCompany).toHaveBeenCalledWith({
      ownerId: 200,
      search: '',
      page: undefined,
      limit: undefined,
      requestContext,
    });
  });

  it('passes page and limit when provided', async () => {
    const mockRepo = {
      getEmployeesByCompany: vi
        .fn()
        .mockResolvedValue(makePaginatedResponse(mockEmployees.slice(0, 2))),
    };

    const useCase = new GetEmployeesByCompany(
      mockRepo as never,
      createIsDisclaimerEnabled(true) as never,
    );
    await useCase.execute({
      input: { search: '', page: '1', limit: '2' },
      requestContext,
    });

    expect(mockRepo.getEmployeesByCompany).toHaveBeenCalledWith({
      ownerId: 99,
      search: '',
      page: '1',
      limit: '2',
      requestContext,
    });
  });
});
