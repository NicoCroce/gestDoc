import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RequestContext, AppError } from '@server/Application';
import { DeleteCertificate } from '../DeleteCertificate.usecase';
import type { CertificateRepository } from '../../../Domain/Certificate.respository';
import { Certificate } from '../../../Domain/Certificate.entity';
import { CertificateTypes } from '../../../Domain/CertificateTypes.entity';

vi.mock('@server/domains/Permissions', () => ({
  GetRoleByUser: class GetRoleByUser {},
}));

const certificateType = CertificateTypes.create({
  id: 1,
  name: 'Licencia',
});

const createCertificate = (
  overrides: Partial<Parameters<typeof Certificate.create>[0]> = {},
) =>
  Certificate.create({
    id: 1,
    startDate: new Date(2026, 0, 10),
    endDate: new Date(2026, 0, 20),
    returnDate: new Date(2026, 0, 25),
    reason: 'Test',
    type: certificateType,
    requiresRest: false,
    status: 'pendiente',
    userId: 5,
    ...overrides,
  });

const mockRepository: CertificateRepository = {
  getCertificates: vi.fn(),
  getCertificatesTypes: vi.fn(),
  addCertificate: vi.fn(),
  appendImages: vi.fn(),
  getAllCompanyCertificates: vi.fn(),
  getStatisticsCertificates: vi.fn(),
  getMonthlyStatisticsCertificates: vi.fn(),
  deleteCertificate: vi.fn(),
  updateCertificateStatus: vi.fn(),
  getCertificate: vi.fn(),
};

const mockGetRoleByUser = { execute: vi.fn() };

const ownerContext = new RequestContext(5, 'req-owner', 10);
const adminContext = new RequestContext(99, 'req-admin', 10);
const otherUserContext = new RequestContext(7, 'req-other', 10);

describe('DeleteCertificate use case', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetRoleByUser.execute.mockResolvedValue('');
  });

  // ── Owner deletes own pendiente certificate (success) ──────────────────
  it('allows owner to delete own pendiente certificate', async () => {
    const cert = createCertificate({ status: 'pendiente', userId: 5 });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);
    vi.mocked(mockRepository.deleteCertificate).mockResolvedValue(undefined);

    const useCase = new DeleteCertificate(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await useCase.execute({
      input: { id: 1 },
      requestContext: ownerContext,
    });

    expect(mockRepository.deleteCertificate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, requestContext: ownerContext }),
    );
  });

  // ── Owner tries to delete non-pendiente certificate (blocked) ──────────
  it('throws when owner tries to delete a non-pendiente certificate', async () => {
    const cert = createCertificate({ status: 'aprobado', userId: 5 });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);

    const useCase = new DeleteCertificate(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await expect(
      useCase.execute({
        input: { id: 1 },
        requestContext: ownerContext,
      }),
    ).rejects.toThrow(AppError);

    expect(mockRepository.deleteCertificate).not.toHaveBeenCalled();
  });

  // ── Owner tries to delete someone else's certificate (blocked) ─────────
  it('throws when non-owner non-admin tries to delete another user certificate', async () => {
    const cert = createCertificate({ status: 'pendiente', userId: 5 });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);

    const useCase = new DeleteCertificate(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await expect(
      useCase.execute({
        input: { id: 1 },
        requestContext: otherUserContext,
      }),
    ).rejects.toThrow(AppError);

    expect(mockRepository.deleteCertificate).not.toHaveBeenCalled();
  });

  // ── Admin deletes any-status certificate (success) ─────────────────────
  it('allows admin to delete any-status certificate in tenant', async () => {
    const cert = createCertificate({ status: 'aprobado', userId: 5 });
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(cert);
    vi.mocked(mockRepository.deleteCertificate).mockResolvedValue(undefined);
    mockGetRoleByUser.execute.mockResolvedValue('Full Admin');

    const useCase = new DeleteCertificate(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await useCase.execute({
      input: { id: 1 },
      requestContext: adminContext,
    });

    expect(mockRepository.deleteCertificate).toHaveBeenCalledWith(
      expect.objectContaining({ id: 1, requestContext: adminContext }),
    );
  });

  // ── Certificate not found ──────────────────────────────────────────────
  it('throws when certificate is not found', async () => {
    vi.mocked(mockRepository.getCertificate).mockResolvedValue(null);

    const useCase = new DeleteCertificate(
      mockRepository,
      mockGetRoleByUser as never,
    );

    await expect(
      useCase.execute({
        input: { id: 999 },
        requestContext: ownerContext,
      }),
    ).rejects.toThrow(AppError);

    expect(mockRepository.deleteCertificate).not.toHaveBeenCalled();
  });
});
