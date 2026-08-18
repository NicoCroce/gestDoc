import { screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderWithProviders } from '@app/test/renderWithProviders';
import { RejectionReasonModal } from '../RejectionReasonModal';

const defaultProps = {
  open: true,
  onConfirm: vi.fn(),
  onCancel: vi.fn(),
  isPending: false,
};

describe('RejectionReasonModal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── Render ──────────────────────────────────────────────────────────────
  it('renders title and textarea when open=true', () => {
    renderWithProviders(<RejectionReasonModal {...defaultProps} />);
    expect(screen.getByText('Motivo del rechazo')).toBeInTheDocument();
    expect(
      screen.getByPlaceholderText('Describí el motivo del rechazo...'),
    ).toBeInTheDocument();
  });

  // ── Validation — empty ──────────────────────────────────────────────────
  it('shows inline error when submitted with empty textarea', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RejectionReasonModal {...defaultProps} />);

    await user.click(screen.getByRole('button', { name: /rechazar/i }));

    expect(
      await screen.findByText('El motivo es obligatorio'),
    ).toBeInTheDocument();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  // ── Validation — whitespace only (Zod .trim()) ─────────────────────────
  it('shows inline error when submitted with whitespace-only input', async () => {
    const user = userEvent.setup();
    renderWithProviders(<RejectionReasonModal {...defaultProps} />);

    await user.type(
      screen.getByPlaceholderText('Describí el motivo del rechazo...'),
      '   ',
    );
    await user.click(screen.getByRole('button', { name: /rechazar/i }));

    expect(
      await screen.findByText('El motivo es obligatorio'),
    ).toBeInTheDocument();
    expect(defaultProps.onConfirm).not.toHaveBeenCalled();
  });

  // ── Happy path — valid submit ───────────────────────────────────────────
  it('calls onConfirm with the reason text when valid', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithProviders(
      <RejectionReasonModal {...defaultProps} onConfirm={onConfirm} />,
    );

    await user.type(
      screen.getByPlaceholderText('Describí el motivo del rechazo...'),
      'Faltó documentación',
    );
    await user.click(screen.getByRole('button', { name: /rechazar/i }));

    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith('Faltó documentación');
    });
  });

  // ── Cancel ──────────────────────────────────────────────────────────────
  it('calls onCancel and not onConfirm when Cancelar is clicked', async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onCancel = vi.fn();
    renderWithProviders(
      <RejectionReasonModal
        {...defaultProps}
        onConfirm={onConfirm}
        onCancel={onCancel}
      />,
    );

    await user.click(screen.getByRole('button', { name: /cancelar/i }));

    expect(onCancel).toHaveBeenCalled();
    expect(onConfirm).not.toHaveBeenCalled();
  });

  // ── Character counter — initial value ──────────────────────────────────
  it('shows 500 remaining chars by default', () => {
    renderWithProviders(<RejectionReasonModal {...defaultProps} />);
    expect(screen.getByText('500 restantes')).toBeInTheDocument();
  });

  // ── Character counter — updates on input ───────────────────────────────
  it('updates character counter as user types', async () => {
    renderWithProviders(<RejectionReasonModal {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(
      'Describí el motivo del rechazo...',
    );
    fireEvent.change(textarea, { target: { value: 'Hola' } });

    await waitFor(() => {
      expect(screen.getByText('496 restantes')).toBeInTheDocument();
    });
  });

  // ── Character counter — turns red near limit ────────────────────────────
  it('counter turns red when fewer than 50 chars remain', async () => {
    renderWithProviders(<RejectionReasonModal {...defaultProps} />);

    const textarea = screen.getByPlaceholderText(
      'Describí el motivo del rechazo...',
    );
    // 455 chars → 500 - 455 = 45 restantes < 50 → color rojo
    fireEvent.change(textarea, { target: { value: 'a'.repeat(455) } });

    await waitFor(() => {
      const counter = screen.getByText('45 restantes');
      expect(counter).toHaveClass('text-[#EF4444]');
    });
  });
});
