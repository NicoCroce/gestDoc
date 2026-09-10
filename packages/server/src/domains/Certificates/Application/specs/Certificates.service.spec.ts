import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  RequestContext,
  executeUseCase,
  parseDateOnly,
} from '@server/Application';
import { CertificatesServices } from '../Certificates.service';

vi.mock('@server/Application', async () => {
  const actual = await vi.importActual<typeof import('@server/Application')>(
    '@server/Application',
  );
  return { ...actual, executeUseCase: vi.fn() };
});

vi.mock('@server/Infrastructure', () => ({
  uploadImages: vi.fn(),
}));

vi.mock('@server/Application/Services/SendEmail.service', () => ({
  SendEmailService: class {
    addLincence() {}
  },
}));

const requestContext = new RequestContext(1, 'req-test', 10);

const buildService = () =>
  new CertificatesServices(
    {} as never, // getCertificates
    {} as never, // getCertificateTypes
    {} as never, // addCertificate
    {} as never, // appendImages
    {} as never, // getCertificatesByCompany
    {} as never, // getStatistisCertificates
    {} as never, // getMonthlyStatistisCertificates
    { addLincence: vi.fn() } as never, // sendEmailService
    {} as never, // deleteCertificate
    {} as never, // updateCertificateStatus
  );

describe('CertificatesServices', () => {
  beforeEach(() => vi.clearAllMocks());

  describe('addCertificate()', () => {
    it('normalizes returnDate with parseDateOnly and delegates to executeUseCase', async () => {
      const mockCertificate = {
        values: {
          id: 1,
          startDate: new Date(),
          endDate: new Date(),
          returnDate: new Date(),
          reason: 'test',
          type: { values: { name: 'Anual' } },
          files: undefined,
          requiresRest: false,
        },
      };
      vi.mocked(executeUseCase).mockResolvedValue(mockCertificate as never);

      const service = buildService();
      await service.addCertificate({
        input: {
          startDate: '2026-01-10',
          endDate: '2026-01-20',
          returnDate: '2026-01-25',
          type: 2,
          reason: 'Vacaciones',
          requiresRest: false,
        },
        requestContext,
      });

      expect(executeUseCase).toHaveBeenCalledWith(
        expect.objectContaining({
          input: expect.objectContaining({
            returnDate: parseDateOnly('2026-01-25'),
            requiresRest: false,
          }),
          requestContext,
        }),
      );
    });

    it('propagates errors as AppError', async () => {
      vi.mocked(executeUseCase).mockRejectedValue(new Error('Overlap'));

      const service = buildService();

      await expect(
        service.addCertificate({
          input: {
            startDate: '2026-01-10',
            endDate: '2026-01-20',
            returnDate: '2026-01-25',
            type: 1,
            reason: 'Test',
            requiresRest: false,
          },
          requestContext,
        }),
      ).rejects.toThrow();
    });
  });

  // ── updateCertificateStatus (006-license-rejection-reason) ─────────────
  describe('updateCertificateStatus()', () => {
    const mockCertificate = {
      values: {
        id: 1,
        startDate: new Date(2026, 0, 10),
        endDate: new Date(2026, 0, 20),
        returnDate: new Date(2026, 0, 25),
        reason: 'Test',
        type: { values: { name: 'Anual' } },
        requiresRest: false,
        status: 'rechazado' as const,
        files: undefined,
        rejectionReason: 'Faltó documentación',
      },
    };

    const buildUpdateService = (notifyMock = vi.fn()) =>
      new CertificatesServices(
        {} as never, // _getCertificates
        {} as never, // _getCertificateTypes
        {} as never, // _addCertificate
        {} as never, // _appendImages
        {} as never, // _getCertificatesByCompany
        {} as never, // _getStatistisCertificates
        {} as never, // _getMonthlyStatistisCertificates
        {
          addLincence: vi.fn(),
          notifyLicenseStatusChange: notifyMock,
        } as never,
        {} as never, // _deleteCertificate
        {} as never, // _updateCertificateStatus
      );

    it('calls executeUseCase with correct params and inputLog', async () => {
      vi.mocked(executeUseCase).mockResolvedValue(mockCertificate as never);
      const service = buildUpdateService();

      await service.updateCertificateStatus({
        input: {
          id: 1,
          status: 'rechazado',
          rejectionReason: 'Faltó documentación',
        },
        requestContext,
      });

      expect(executeUseCase).toHaveBeenCalledWith(
        expect.objectContaining({
          input: {
            id: 1,
            status: 'rechazado',
            rejectionReason: 'Faltó documentación',
          },
          requestContext,
          inputLog: { id: 1, status: 'rechazado' },
        }),
      );
    });

    it('forwards rejectionReason to notifyLicenseStatusChange when status is rechazado', async () => {
      vi.mocked(executeUseCase).mockResolvedValue(mockCertificate as never);
      const notifyMock = vi.fn();
      const service = buildUpdateService(notifyMock);

      await service.updateCertificateStatus({
        input: {
          id: 1,
          status: 'rechazado',
          rejectionReason: 'Faltó documentación',
        },
        requestContext,
      });

      expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          newStatus: 'rechazado',
          rejectionReason: 'Faltó documentación',
          requestContext,
        }),
      );
    });

    it('calls notifyLicenseStatusChange with rejectionReason=undefined for aprobado', async () => {
      const mockAprobado = {
        ...mockCertificate,
        values: {
          ...mockCertificate.values,
          status: 'aprobado' as const,
          rejectionReason: undefined,
        },
      };
      vi.mocked(executeUseCase).mockResolvedValue(mockAprobado as never);
      const notifyMock = vi.fn();
      const service = buildUpdateService(notifyMock);

      await service.updateCertificateStatus({
        input: { id: 1, status: 'aprobado' },
        requestContext,
      });

      expect(notifyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          newStatus: 'aprobado',
          rejectionReason: undefined,
        }),
      );
    });

    it('does not call notifyLicenseStatusChange when status is pendiente', async () => {
      const mockPendiente = {
        ...mockCertificate,
        values: {
          ...mockCertificate.values,
          status: 'pendiente' as const,
          rejectionReason: undefined,
        },
      };
      vi.mocked(executeUseCase).mockResolvedValue(mockPendiente as never);
      const notifyMock = vi.fn();
      const service = buildUpdateService(notifyMock);

      await service.updateCertificateStatus({
        input: { id: 1, status: 'pendiente' },
        requestContext,
      });

      expect(notifyMock).not.toHaveBeenCalled();
    });

    // ── Regresión T018 (007-exclude-deleted-users-emails) ─────────────────
    // `notifyLicenseStatusChange` se invoca sin `await` (fire-and-forget):
    // el estado de la licencia ya quedó persistido por `executeUseCase`
    // ANTES de esta llamada, así que un fallo de envío (p.ej. empleado dueño
    // de la licencia soft-deleted, T016) nunca puede bloquear ni revertir el
    // cambio de estado — el detalle de la exclusión en sí se prueba en
    // `SendEmail.service.spec.ts` (T017).
    it('completes updateCertificateStatus without waiting for notifyLicenseStatusChange to resolve (fire-and-forget)', async () => {
      vi.mocked(executeUseCase).mockResolvedValue(mockCertificate as never);
      let resolveNotify: () => void = () => {};
      const pendingNotify = new Promise<void>((resolve) => {
        resolveNotify = resolve;
      });
      const notifyMock = vi.fn().mockReturnValue(pendingNotify);
      const service = buildUpdateService(notifyMock);

      const result = await service.updateCertificateStatus({
        input: {
          id: 1,
          status: 'rechazado',
          rejectionReason: 'Faltó documentación',
        },
        requestContext,
      });

      // La operación de negocio (persistencia del estado, ya resuelta por
      // executeUseCase) se completa sin esperar a que el email se envíe.
      expect(result).toBeDefined();
      expect(notifyMock).toHaveBeenCalledOnce();

      resolveNotify(); // limpieza: no dejar la promesa pendiente colgada
    });
  });
});
