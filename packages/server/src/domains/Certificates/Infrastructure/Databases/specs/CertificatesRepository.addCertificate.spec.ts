import { describe, it, expect, vi, beforeEach } from 'vitest';
import { Op } from 'sequelize';
import { AppError, RequestContext } from '@server/Application';
import { Certificate, CertificateTypes } from '../../../Domain';

vi.mock('@server/domains/Users', () => ({ UserModel: {} }));
vi.mock('../Certificates.model', () => ({
  CertificateModel: { findOne: vi.fn(), create: vi.fn() },
}));
vi.mock('../CertificatesTypes.model', () => ({
  CertificatesTypesModel: { findByPk: vi.fn() },
}));

import { CertificateModel } from '../Certificates.model';
import { CertificatesTypesModel } from '../CertificatesTypes.model';
import { CertificatesRepositoryImplementation } from '../CertificatesRepository.implementation';

const requestContext = new RequestContext(1, 'req-test', 10);

const buildCertificate = () =>
  Certificate.create({
    startDate: new Date(2026, 0, 10),
    endDate: new Date(2026, 0, 20),
    returnDate: new Date(2026, 0, 25),
    reason: 'Vacaciones',
    type: CertificateTypes.create({ id: 2, name: 'Vacaciones' }),
    requiresRest: true,
  });

describe('CertificatesRepositoryImplementation.addCertificate', () => {
  let repo: CertificatesRepositoryImplementation;

  beforeEach(() => {
    repo = new CertificatesRepositoryImplementation();
    vi.clearAllMocks();
  });

  it('checks overlap only against blocking statuses (pendiente, aprobado, validando)', async () => {
    vi.mocked(CertificateModel.findOne).mockResolvedValue(null);
    vi.mocked(CertificateModel.create).mockResolvedValue({
      id: 1,
      fecha_inicio: new Date(2026, 0, 10),
      fecha_fin: new Date(2026, 0, 20),
      fecha_reintegro: new Date(2026, 0, 25),
      motivo: 'Vacaciones',
      id_tipo_certificado: 2,
      estado: 'pendiente',
    } as never);
    vi.mocked(CertificatesTypesModel.findByPk).mockResolvedValue({
      id: 2,
      denominacion: 'Vacaciones',
    } as never);

    await repo.addCertificate({
      requestContext,
      certificate: buildCertificate(),
    });

    expect(CertificateModel.findOne).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id_usuario: requestContext.values.userId,
          estado: { [Op.in]: ['pendiente', 'aprobado', 'validando'] },
        }),
      }),
    );
  });

  it('throws 409 AppError when an overlapping certificate exists with a blocking status', async () => {
    vi.mocked(CertificateModel.findOne).mockResolvedValue({
      id: 99,
      estado: 'aprobado',
    } as never);

    await expect(
      repo.addCertificate({ requestContext, certificate: buildCertificate() }),
    ).rejects.toMatchObject({
      statusCode: 409,
      message: expect.stringContaining('solapan'),
    });
  });

  it('creates the certificate when no overlapping blocking certificate exists', async () => {
    vi.mocked(CertificateModel.findOne).mockResolvedValue(null);
    vi.mocked(CertificateModel.create).mockResolvedValue({
      id: 1,
      fecha_inicio: new Date(2026, 0, 10),
      fecha_fin: new Date(2026, 0, 20),
      fecha_reintegro: new Date(2026, 0, 25),
      motivo: 'Vacaciones',
      id_tipo_certificado: 2,
      estado: 'pendiente',
    } as never);
    vi.mocked(CertificatesTypesModel.findByPk).mockResolvedValue({
      id: 2,
      denominacion: 'Vacaciones',
    } as never);

    const result = await repo.addCertificate({
      requestContext,
      certificate: buildCertificate(),
    });

    expect(CertificateModel.create).toHaveBeenCalledOnce();
    expect(result.values.id).toBe(1);
  });

  it('wraps unexpected errors in AppError 500', async () => {
    vi.mocked(CertificateModel.findOne).mockRejectedValue(
      new Error('db connection lost'),
    );

    await expect(
      repo.addCertificate({ requestContext, certificate: buildCertificate() }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
