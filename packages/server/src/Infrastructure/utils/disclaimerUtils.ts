/**
 * Fuente única de verdad para decidir si una empresa tiene texto de términos.
 *
 * Un texto `null`, `undefined`, vacío o compuesto únicamente por
 * espacios/tabs/saltos de línea NO cuenta como texto configurado.
 */
export const hasDisclaimerText = (text?: string | null): boolean =>
  Boolean(text?.trim());
