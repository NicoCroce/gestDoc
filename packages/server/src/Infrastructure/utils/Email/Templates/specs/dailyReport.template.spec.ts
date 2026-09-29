import { describe, expect, it } from 'vitest';
import { dailyReport } from '../dailyReport.template';
import type { IDailyReport } from '../types';

/**
 * El flag `hasDisclaimerText` viaja en el DTO y el template decide si
 * renderiza la fila del resumen y la sección detallada de términos (FR-005).
 */
const buildReport = (overrides: Partial<IDailyReport> = {}): IDailyReport => ({
  companyName: 'Acme S.A.',
  date: '2026-08-06',
  hasDisclaimerText: true,
  sections: {
    employeesOnLeaveToday: { items: [], totalCount: 0 },
    pendingLicenses: { items: [], totalCount: 0 },
    unsignedDocuments: { items: [], totalCount: 0 },
    pendingDisclaimerAcceptances: {
      items: [{ employeeName: 'Ana Ruiz' }],
      totalCount: 1,
    },
    upcomingVacations: { items: [], totalCount: 0 },
    expiringLicenses: { items: [], totalCount: 0 },
    statisticalSummary: {
      activeEmployees: 50,
      licensesInProgress: 3,
      pendingLicenses: 5,
      unsignedDocuments: 10,
      pendingDisclaimerAcceptances: 8,
    },
  },
  ...overrides,
});

describe('dailyReport template — términos sin aceptar', () => {
  it('renders the summary row and the detailed section when the company has terms text', () => {
    const { subject, body } = dailyReport(buildReport());

    expect(subject).toContain('Reporte diario');
    expect(body).toContain('Términos sin aceptar');
    expect(body).toContain('Términos y condiciones sin aceptar (1)');
    expect(body).toContain('Ana Ruiz');
    // El resumen muestra el conteo real de pendientes de términos (8)
    expect(body).toMatch(/Términos sin aceptar<\/td>\s*<td[^>]*>8<\/td>/);
  });

  it('omits the row, the detailed section and any terms zero when the company has no terms text', () => {
    const { body } = dailyReport(buildReport({ hasDisclaimerText: false }));

    // Ninguna referencia a términos: sin fila, sin sección y sin "0".
    expect(body).not.toContain('Términos sin aceptar');
    expect(body).not.toContain('Términos y condiciones sin aceptar');
    expect(body).not.toContain('Términos');
    expect(body).not.toMatch(/Términos sin aceptar<\/td>\s*<td[^>]*>0<\/td>/);
    // El resto del reporte se mantiene intacto.
    expect(body).toContain('Empleados activos');
    expect(body).toContain('Documentos sin firmar');
    expect(body).toContain('Resumen');
  });

  it('renders the summary row with zero and omits the detailed section when the company has text but nobody is pending', () => {
    const base = buildReport();
    const { body } = dailyReport({
      ...base,
      hasDisclaimerText: true,
      sections: {
        ...base.sections,
        pendingDisclaimerAcceptances: { items: [], totalCount: 0 },
        statisticalSummary: {
          ...base.sections.statisticalSummary,
          pendingDisclaimerAcceptances: 0,
        },
      },
    });

    // Con texto configurado el comportamiento actual se mantiene: la fila del
    // resumen aparece (con 0) y la sección detallada no se renderiza por vacía.
    expect(body).toMatch(/Términos sin aceptar<\/td>\s*<td[^>]*>0<\/td>/);
    expect(body).not.toContain('Términos y condiciones sin aceptar');
  });
});
