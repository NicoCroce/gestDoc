import { render, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useGetUser } from './useGetUser';
import { UsersService } from '../Users.service';

const { useQueryMock, refetchMock } = vi.hoisted(() => ({
  useQueryMock: vi.fn(),
  refetchMock: vi.fn(),
}));

vi.mock('../Users.service', () => ({
  UsersService: {
    get: {
      useQuery: useQueryMock,
    },
  },
}));

const mockUser = { id: 1, name: 'Alice', mail: 'alice@test.com' };

const Harness = ({ id }: { id?: number }) => {
  useGetUser(id);
  return null;
};

describe('useGetUser', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    refetchMock.mockResolvedValue({ data: mockUser });
    useQueryMock.mockReturnValue({
      isFetched: false,
      isFetching: false,
      refetch: refetchMock,
    });
  });

  it('calls useQuery with id=0 when id is undefined', () => {
    render(<Harness />);

    expect(UsersService.get.useQuery).toHaveBeenCalledWith(0, {
      enabled: false,
    });
  });

  it('calls useQuery with the given id', () => {
    render(<Harness id={5} />);

    expect(UsersService.get.useQuery).toHaveBeenCalledWith(5, {
      enabled: false,
    });
  });

  it('calls refetch when user is not fetched yet', async () => {
    render(<Harness id={1} />);

    await waitFor(() => {
      expect(refetchMock).toHaveBeenCalled();
    });
  });

  it('does NOT call refetch when isFetching is true', async () => {
    useQueryMock.mockReturnValue({
      isFetched: false,
      isFetching: true,
      refetch: refetchMock,
    });

    render(<Harness id={1} />);

    await waitFor(() => {
      expect(refetchMock).not.toHaveBeenCalled();
    });
  });

  it('does NOT call refetch when isFetched is already true', async () => {
    useQueryMock.mockReturnValue({
      isFetched: true,
      isFetching: false,
      refetch: refetchMock,
    });

    render(<Harness id={1} />);

    await waitFor(() => {
      expect(refetchMock).not.toHaveBeenCalled();
    });
  });
});
