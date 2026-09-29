import { describe, expect, it } from 'vitest';
import { hasDisclaimerText } from '../disclaimerUtils';

/**
 * Fuente única de verdad de "sin texto" (FR-001). Se usa en Login,
 * SendReminders, EmployeeReminders y DailyReport.
 */
describe('hasDisclaimerText', () => {
  it('returns false for null and undefined', () => {
    expect(hasDisclaimerText(null)).toBe(false);
    expect(hasDisclaimerText(undefined)).toBe(false);
  });

  it('returns false for an empty string', () => {
    expect(hasDisclaimerText('')).toBe(false);
  });

  it('returns false for whitespace-only strings (spaces, tabs, newlines)', () => {
    expect(hasDisclaimerText('   ')).toBe(false);
    expect(hasDisclaimerText('\t\n')).toBe(false);
    expect(hasDisclaimerText(' \t \n \r ')).toBe(false);
  });

  it('returns true when the text has at least one non-whitespace character', () => {
    expect(hasDisclaimerText('a')).toBe(true);
    expect(hasDisclaimerText('  Términos y condiciones  ')).toBe(true);
    expect(hasDisclaimerText('\nAcepto los términos\n')).toBe(true);
  });
});
