import { renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useHasDisclaimerText } from '../useHasDisclaimerText';

const { useQueryMock } = vi.hoisted(() => ({ useQueryMock: vi.fn() }));

vi.mock('../../Admin.service', () => ({
  AdminDisclaimerService: {
    hasText: {
      useQuery: useQueryMock,
    },
  },
}));

describe('useHasDisclaimerText', () => {
  beforeEach(() => vi.clearAllMocks());

  it('exposes the company flag from disclaimer.hasText', () => {
    useQueryMock.mockReturnValue({ data: true, isLoading: false });

    const { result } = renderHook(() => useHasDisclaimerText());

    expect(useQueryMock).toHaveBeenCalledTimes(1);
    expect(result.current.hasDisclaimerText).toBe(true);
    expect(result.current.isLoading).toBe(false);
  });

  it('exposes false when the company has no terms text', () => {
    useQueryMock.mockReturnValue({ data: false, isLoading: false });

    const { result } = renderHook(() => useHasDisclaimerText());

    expect(result.current.hasDisclaimerText).toBe(false);
  });

  it('defaults to false while the flag is undefined (loading)', () => {
    useQueryMock.mockReturnValue({ data: undefined, isLoading: true });

    const { result } = renderHook(() => useHasDisclaimerText());

    expect(result.current.hasDisclaimerText).toBe(false);
    expect(result.current.isLoading).toBe(true);
  });
});
