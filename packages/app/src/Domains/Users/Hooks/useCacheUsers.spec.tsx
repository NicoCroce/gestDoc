import React, { useEffect } from 'react';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useCacheUsers } from './useCacheUsers';

const { invalidateQueriesMock, useQueryClientMock } = vi.hoisted(() => ({
  invalidateQueriesMock: vi.fn(),
  useQueryClientMock: vi.fn(),
}));

vi.mock('@tanstack/react-query', async () => {
  const actual = await vi.importActual('@tanstack/react-query');
  return {
    ...(actual as object),
    useQueryClient: useQueryClientMock,
  };
});

const mockQueryClient = {
  getQueryData: getQueryDataMock,
  invalidateQueries: invalidateQueriesMock,
};

const Harness = ({
  resultRef,
}: {
  resultRef: React.MutableRefObject<
    ReturnType<typeof useCacheUsers> | undefined
  >;
}) => {
  const result = useCacheUsers();
  useEffect(() => {
    resultRef.current = result;
  });
  return null;
};

describe('useCacheUsers', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useQueryClientMock.mockReturnValue(mockQueryClient);
  });

  it('invalidate calls invalidateQueries with the users key', () => {
    const resultRef = { current: undefined } as React.MutableRefObject<
      ReturnType<typeof useCacheUsers> | undefined
    >;
    render(<Harness resultRef={resultRef} />);

    if (resultRef.current) {
      resultRef.current.invalidate();
    }

    expect(invalidateQueriesMock).toHaveBeenCalledWith({
      queryKey: [['users']],
    });
  });
});
