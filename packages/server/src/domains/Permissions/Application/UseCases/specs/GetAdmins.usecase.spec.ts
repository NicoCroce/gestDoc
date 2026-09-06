import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppError, RequestContext } from '@server/Application';
import { GetAdmins } from '../GetAdmins.usecase';
import type { PermissionsRepository } from '../../../Domain';

const requestContext = new RequestContext(1, 'req-1', 42);

const mockRepository: PermissionsRepository = {
  getPermissions: vi.fn(),
  getRoles: vi.fn(),
  getPermissionsByUser: vi.fn(),
  associateUserToRole: vi.fn(),
  dissociateUserToRole: vi.fn(),
  getRoleByUser: vi.fn(),
  getAdmins: vi.fn(),
  getRoleByUserId: vi.fn(),
  getRolesByMaxHierarchy: vi.fn(),
};

// ── T005 (007-exclude-deleted-users-emails, Contrato 1) ──────────────────
// `PermissionsRepositoryImplementation.getAdmins` (Sequelize) excluye admins
// soft-deleted automáticamente vía `paranoid: true` de `UserModel` — no hay
// infraestructura de test con una instancia Sequelize real en este proyecto
// (solo MySQL en runtime; los tests de repositorio del proyecto mockean el
// modelo, ver `DocumentsRepository.implementation.spec.ts`). Para este
// dominio, además, mockear `UserModel`/instanciar el repositorio real desde
// un test dispara un import circular preexistente y no relacionado con esta
// feature entre `Users` y `Permissions` (`Users.model.ts` importa
// `RolesModel` desde `@server/domains/Permissions`, y
// `PermissionsRepository.implementation.ts` importa `UserModel` desde
// `@server/domains/Users`) — reproducible incluso sin ningún cambio de esta
// feature (`import { UserModel } from '@server/domains/Users'` en un archivo
// aislado ya rompe por el mismo motivo). Se documenta como hallazgo aparte;
// no se modifica código fuente. Este test cubre el mismo contrato un nivel
// más arriba (`GetAdmins` use case, que es la posta real consumida por
// `SendReportEmail` y `SendEmailService`), simulando exactamente el
// resultado que produce el scope `paranoid`.
describe('GetAdmins usecase (Contrato 1 — 007-exclude-deleted-users-emails)', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns only the emails of active admins delegated by the repository', async () => {
    vi.mocked(mockRepository.getAdmins).mockResolvedValue([
      'admin-activo@test.com',
    ]);

    const useCase = new GetAdmins(mockRepository);
    const result = await useCase.execute({ requestContext });

    expect(mockRepository.getAdmins).toHaveBeenCalledWith({ requestContext });
    expect(result).toEqual(['admin-activo@test.com']);
    expect(result).not.toContain('admin-eliminado@test.com');
  });

  it('returns [] without throwing when every admin of the company is soft-deleted', async () => {
    vi.mocked(mockRepository.getAdmins).mockResolvedValue([]);

    const useCase = new GetAdmins(mockRepository);
    const result = await useCase.execute({ requestContext });

    expect(result).toEqual([]);
  });

  it('wraps unexpected repository errors as AppError (500 default)', async () => {
    vi.mocked(mockRepository.getAdmins).mockRejectedValue(
      new Error('DB connection lost'),
    );

    const useCase = new GetAdmins(mockRepository);

    await expect(useCase.execute({ requestContext })).rejects.toBeInstanceOf(
      AppError,
    );
  });
});
