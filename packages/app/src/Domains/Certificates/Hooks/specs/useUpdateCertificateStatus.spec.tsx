import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useUpdateCertificateStatus } from '../useUpdateCertificateStatus';

const { mutateMock, useMutationMock, invalidateMock } = vi.hoisted(() => {
  const mutateMock = vi.fn();
  const useMutationMock = vi.fn();
  const invalidateMock = vi.fn().mockResolvedValue(undefined);
  return { mutateMock, useMutationMock, invalidateMock };
});

vi.mock('../../Certificates.service', () => ({
  CertificatesService: {
    updateCertificateStatus: {
      useMutation: useMutationMock,
    },
  },
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  queryClient.invalidateQueries = invalidateMock;
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = 'TestWrapper';
  return Wrapper;
};

describe('useUpdateCertificateStatus hook', () => {
  beforeEach(() => {
    mutateMock.mockClear();
    useMutationMock.mockClear();
    invalidateMock.mockClear();

    useMutationMock.mockImplementation(
      (_callbacks: { onError?: (err: Error) => void }) => {
        return {
          mutate: mutateMock,
          isPending: false,
          isError: false,
        };
      },
    );

    mutateMock.mockImplementation(
      (
        _data: unknown,
        opts: { onSuccess?: () => void; onError?: (err: Error) => void },
      ) => {
        opts.onSuccess?.();
      },
    );
  });

  it('calls updateCertificateStatus mutation with id and status', async () => {
    const { result } = renderHook(() => useUpdateCertificateStatus(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateUpdate(42, 'aprobado');
    });

    expect(mutateMock).toHaveBeenCalledWith(
      { id: 42, status: 'aprobado' },
      expect.any(Object),
    );
  });

  // ── rejectionReason feature (006-license-rejection-reason) ──────────────
  it('includes rejectionReason in payload when provided', async () => {
    const { result } = renderHook(() => useUpdateCertificateStatus(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateUpdate(7, 'rechazado', 'Faltó documentación');
    });

    expect(mutateMock).toHaveBeenCalledWith(
      { id: 7, status: 'rechazado', rejectionReason: 'Faltó documentación' },
      expect.any(Object),
    );
  });

  it('omits rejectionReason key from payload when not provided (spread condicional)', async () => {
    const { result } = renderHook(() => useUpdateCertificateStatus(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateUpdate(7, 'aprobado');
    });

    const calledWith = mutateMock.mock.calls[0][0];
    expect(calledWith).not.toHaveProperty('rejectionReason');
    expect(calledWith).toEqual({ id: 7, status: 'aprobado' });
  });

  it('invalidates certificate cache keys on success', async () => {
    const { result } = renderHook(() => useUpdateCertificateStatus(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.mutateUpdate(42, 'aprobado');
    });

    expect(invalidateMock).toHaveBeenCalledWith({
      predicate: expect.any(Function),
    });

    // Verificar que el predicate matchea correctamente las queries de certificates
    const invalidateCall = invalidateMock.mock.calls[0][0];
    const mockQuery = {
      queryKey: [
        ['certificates', 'getCertificatesByCompany'],
        { input: undefined },
      ],
    };
    expect(invalidateCall.predicate(mockQuery)).toBe(true);

    const nonMatchingQuery = {
      queryKey: [['documents', 'getDocumentsByCompany'], { input: undefined }],
    };
    expect(invalidateCall.predicate(nonMatchingQuery)).toBe(false);
  });

  it('exposes isPending state', () => {
    const { result } = renderHook(() => useUpdateCertificateStatus(), {
      wrapper: createWrapper(),
    });

    expect(result.current.isPending).toBe(false);
  });
});
