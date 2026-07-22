import { describe, expect, it, vi } from 'vitest';
import { RequestContext } from '@server/Application';
import { GetEmployeesByCompany } from '../GetEmployeesByCompany.usecase';

const requestContext = new RequestContext(1, 'req-1', 99);

describe('GetEmployeesByCompany', () => {
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

  it('returns employees scoped by ownerId for regular admin', async () => {
    const mockRepo = {
      getEmployeesByCompany: vi.fn().mockResolvedValue(mockEmployees),
    };

    const useCase = new GetEmployeesByCompany(mockRepo as never);
    const result = await useCase.execute({
      input: { search: '' },
      requestContext,
    });

    expect(result).toHaveLength(3);
    expect(result[0]).toEqual(mockEmployees[0]);
    expect(mockRepo.getEmployeesByCompany).toHaveBeenCalledWith({
      ownerId: 99,
      search: '',
      requestContext,
    });
  });

  it('passes search filter to repository', async () => {
    const mockRepo = {
      getEmployeesByCompany: vi.fn().mockResolvedValue([mockEmployees[0]]),
    };

    const useCase = new GetEmployeesByCompany(mockRepo as never);
    const result = await useCase.execute({
      input: { search: 'Juan' },
      requestContext,
    });

    expect(result).toHaveLength(1);
    expect(mockRepo.getEmployeesByCompany).toHaveBeenCalledWith({
      ownerId: 99,
      search: 'Juan',
      requestContext,
    });
  });

  it('uses provided ownerId when given (superadmin)', async () => {
    const mockRepo = {
      getEmployeesByCompany: vi.fn().mockResolvedValue(mockEmployees),
    };

    const useCase = new GetEmployeesByCompany(mockRepo as never);
    await useCase.execute({
      input: { ownerId: 200, search: '' },
      requestContext,
    });

    expect(mockRepo.getEmployeesByCompany).toHaveBeenCalledWith({
      ownerId: 200,
      search: '',
      requestContext,
    });
  });
});
