import { describe, expect, it, vi, beforeEach } from 'vitest';
import { AppError, RequestContext } from '@server/Application';
import { User } from '@server/domains/Users/Domain/User.entity';
import { SendEmailService } from '../SendEmail.service';

const mockLogger = vi.hoisted(() => ({
  warn: vi.fn(),
  info: vi.fn(),
  error: vi.fn(),
}));

vi.mock('@server/Infrastructure/utils/pino', () => ({
  logger: mockLogger,
  loggerContext: vi.fn(() => mockLogger),
  loggerContextInput: vi.fn(() => mockLogger),
}));

const { documentSignedEmployeeTemplate, documentSignedAdminTemplate } =
  vi.hoisted(() => ({
    documentSignedEmployeeTemplate: vi.fn(),
    documentSignedAdminTemplate: vi.fn(),
  }));

vi.mock('@server/Infrastructure', () => ({
  emailTemplates: {
    documentSignedEmployee: documentSignedEmployeeTemplate,
    documentSignedAdmin: documentSignedAdminTemplate,
    addLicense: vi.fn().mockReturnValue({ subject: 's', body: 'b' }),
    licenseStatusChange: vi.fn().mockReturnValue({ subject: 's', body: 'b' }),
  },
}));

const requestContext = new RequestContext(1, 'req-1', 42);

const buildEmployee = () =>
  User.create({
    id: 5,
    mail: 'empleado@test.com',
    name: 'Carlos',
    surname: 'Gómez',
    ownerId: 42,
  });

const buildCertificate = (userId = 5) => ({
  userId,
  values: {
    startDate: new Date(2026, 0, 10),
    endDate: new Date(2026, 0, 20),
    returnDate: new Date(2026, 0, 25),
    reason: 'Vacaciones',
    type: { values: { name: 'Anual' } },
    files: undefined,
  },
});

const buildMocks = () => ({
  getAdmins: { execute: vi.fn() },
  getUser: { execute: vi.fn() },
  mailNotificationService: { sendOne: vi.fn().mockResolvedValue(undefined) },
});

const buildService = (mocks: ReturnType<typeof buildMocks>) =>
  new SendEmailService(
    mocks.getAdmins as never,
    mocks.getUser as never,
    mocks.mailNotificationService as never,
  );

describe('SendEmailService (007-exclude-deleted-users-emails — T011/T017)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    documentSignedEmployeeTemplate.mockReturnValue({
      subject: 'Firma registrada',
      body: '<p>firma</p>',
    });
    documentSignedAdminTemplate.mockReturnValue({
      subject: 'Documento firmado',
      body: '<p>admin</p>',
    });
  });

  // ── signDocument — regresión SC-002 (empleado y admin activos) ──────────
  describe('signDocument()', () => {
    it('sends both emails (employee + admins) when everyone is active (SC-002 regression)', async () => {
      const mocks = buildMocks();
      mocks.getUser.execute.mockResolvedValue(buildEmployee());
      mocks.getAdmins.execute.mockResolvedValue(['admin-activo@test.com']);
      const service = buildService(mocks);

      await service.signDocument({
        documentId: 1,
        agreement: true,
        reasonSignatureNonConformity: null,
        requestContext,
      });

      expect(mocks.mailNotificationService.sendOne).toHaveBeenCalledTimes(2);
      expect(mocks.mailNotificationService.sendOne).toHaveBeenNthCalledWith(
        1,
        expect.objectContaining({ to: 'empleado@test.com' }),
      );
      expect(mocks.mailNotificationService.sendOne).toHaveBeenNthCalledWith(
        2,
        expect.objectContaining({ to: ['admin-activo@test.com'] }),
      );
    });

    // ── T007 (Gap 2 — ya corregido, no depende de executeUseCase) ─────────
    it('sends the employee email but skips the admins email (and logs the omission) when the only admin is soft-deleted', async () => {
      const mocks = buildMocks();
      mocks.getUser.execute.mockResolvedValue(buildEmployee());
      // GetAdmins (paranoid) excluye al admin soft-deleted: resuelve [].
      mocks.getAdmins.execute.mockResolvedValue([]);
      const service = buildService(mocks);

      await service.signDocument({
        documentId: 1,
        agreement: true,
        reasonSignatureNonConformity: null,
        requestContext,
      });

      expect(mocks.mailNotificationService.sendOne).toHaveBeenCalledTimes(1);
      expect(mocks.mailNotificationService.sendOne).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'empleado@test.com' }),
      );
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Document signing email to admins skipped: no active admins found',
      );
    });

    // ── T009 (Gap 1 — empleado soft-deleted) ───────────────────────────────
    it('does not throw and skips the employee email when the signing employee is soft-deleted', async () => {
      const mocks = buildMocks();
      // GetUser (paranoid) no resuelve al empleado: AppError 404.
      mocks.getUser.execute.mockRejectedValue(
        new AppError('User not found', 404),
      );
      mocks.getAdmins.execute.mockResolvedValue(['admin@test.com']);
      const service = buildService(mocks);

      await expect(
        service.signDocument({
          documentId: 1,
          agreement: true,
          reasonSignatureNonConformity: null,
          requestContext,
        }),
      ).resolves.toBeUndefined(); // Contrato 2: nunca lanza hacia el caller

      expect(mocks.mailNotificationService.sendOne).not.toHaveBeenCalled();
      // Contrato 2: el log debe ser distinguible ('recipient not active') de
      // un fallo de infraestructura genérico. `getCurrentUser()` llama a
      // `_getUser.execute()` directo (no vía `executeUseCase`) para que el
      // catch reciba el `AppError` original sin envolver en `TRPCError`.
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Document signing email skipped: recipient not active',
      );
    });
  });

  // ── sendDocumentToEmail — T008 (Gap 1 — usuario actual soft-deleted) ────
  describe('sendDocumentToEmail()', () => {
    it('sends the email to the resolved user mail when the user is active (SC-002 regression)', async () => {
      const mocks = buildMocks();
      mocks.getUser.execute.mockResolvedValue(buildEmployee());
      const service = buildService(mocks);

      await service.sendDocumentToEmail({
        documentId: 1,
        documentTitle: 'Recibo',
        pdfBuffer: Buffer.from('pdf'),
        requestContext,
      });

      expect(mocks.mailNotificationService.sendOne).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'empleado@test.com' }),
      );
    });

    it('does not throw and does not send when the current (self) user is soft-deleted', async () => {
      const mocks = buildMocks();
      mocks.getUser.execute.mockRejectedValue(
        new AppError('User not found', 404),
      );
      const service = buildService(mocks);

      await expect(
        service.sendDocumentToEmail({
          documentId: 1,
          documentTitle: 'Recibo',
          pdfBuffer: Buffer.from('pdf'),
          requestContext,
        }),
      ).resolves.toBeUndefined();

      expect(mocks.mailNotificationService.sendOne).not.toHaveBeenCalled();
      // Mismo tratamiento que en signDocument (T009): `getCurrentUser()`
      // llama a `_getUser.execute()` directo, así el catch de T008 recibe
      // el `AppError(404)` original y produce el log distinguible.
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Document email skipped: recipient not active',
      );
    });

    it('logs the generic infrastructure error (not the soft-delete warn) when the mail provider fails for an active user', async () => {
      const mocks = buildMocks();
      mocks.getUser.execute.mockResolvedValue(buildEmployee());
      mocks.mailNotificationService.sendOne.mockRejectedValue(
        new Error('SMTP timeout'),
      );
      const service = buildService(mocks);

      await service.sendDocumentToEmail({
        documentId: 1,
        documentTitle: 'Recibo',
        pdfBuffer: Buffer.from('pdf'),
        requestContext,
      });

      expect(mockLogger.error).toHaveBeenCalledWith(
        expect.any(Error),
        'Failed to send document to email',
      );
      expect(mockLogger.warn).not.toHaveBeenCalledWith(
        'Document email skipped: recipient not active',
      );
    });
  });

  // ── notifyLicenseStatusChange — T016 (Gap 1 — empleado dueño soft-deleted) [T017]
  describe('notifyLicenseStatusChange()', () => {
    it('sends the status change email when the employee owner is active (SC-002 regression)', async () => {
      const mocks = buildMocks();
      mocks.getUser.execute
        .mockResolvedValueOnce(buildEmployee()) // empleado dueño de la licencia
        .mockResolvedValueOnce(
          User.create({
            id: 1,
            mail: 'revisor@test.com',
            name: 'Ana',
            surname: 'Ruiz',
            ownerId: 42,
          }),
        ); // reviewer (currentUser)
      const service = buildService(mocks);

      await service.notifyLicenseStatusChange({
        certificate: buildCertificate(5) as never,
        newStatus: 'aprobado',
        requestContext,
      });

      expect(mocks.mailNotificationService.sendOne).toHaveBeenCalledWith(
        expect.objectContaining({ to: 'empleado@test.com' }),
      );
    });

    it('does not throw and does not send when the employee who owns the license is soft-deleted', async () => {
      const mocks = buildMocks();
      // GetUser(certificate.userId) no resuelve al empleado dueño: AppError 404.
      mocks.getUser.execute.mockRejectedValue(
        new AppError('User not found', 404),
      );
      const service = buildService(mocks);

      await expect(
        service.notifyLicenseStatusChange({
          certificate: buildCertificate(5) as never,
          newStatus: 'rechazado',
          rejectionReason: 'Faltó documentación',
          requestContext,
        }),
      ).resolves.toBeUndefined();

      expect(mocks.mailNotificationService.sendOne).not.toHaveBeenCalled();
      // Mismo tratamiento que T008/T009: la resolución del empleado dueño
      // de la licencia llama a `_getUser.execute()` directo (T016), sin
      // pasar por `executeUseCase`.
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'License status email skipped: employee not active',
      );
    });
  });

  // ── addLincence / sendEmailToAdmins — T015 (Gap 2 — admins soft-deleted) [T017]
  describe('addLincence()', () => {
    it('sends the email to admins when at least one is active (SC-002 regression)', async () => {
      const mocks = buildMocks();
      mocks.getUser.execute.mockResolvedValue(buildEmployee());
      mocks.getAdmins.execute.mockResolvedValue(['admin-activo@test.com']);
      const service = buildService(mocks);

      await service.addLincence({
        certificate: buildCertificate(5) as never,
        requestContext,
      });

      expect(mocks.mailNotificationService.sendOne).toHaveBeenCalledWith(
        expect.objectContaining({ to: ['admin-activo@test.com'] }),
      );
    });

    it('does not send and logs the omission when every admin of the company is soft-deleted', async () => {
      const mocks = buildMocks();
      mocks.getUser.execute.mockResolvedValue(buildEmployee());
      mocks.getAdmins.execute.mockResolvedValue([]);
      const service = buildService(mocks);

      await service.addLincence({
        certificate: buildCertificate(5) as never,
        requestContext,
      });

      expect(mocks.mailNotificationService.sendOne).not.toHaveBeenCalled();
      expect(mockLogger.warn).toHaveBeenCalledWith(
        'Email to admins skipped: no active admins found',
      );
    });
  });
});
