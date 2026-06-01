import { useEffect, useState } from 'react';
import { UsersService } from '../Users.service';
import { TUser } from '../User.entity';

export const useGetUser = (id?: number) => {
  const [currentUser, setCurrentUser] = useState<TUser | null>(null);
  const queryUserDetail = UsersService.get.useQuery(id || 0, {
    enabled: false,
  });
  const { isFetched, isFetching, refetch } = queryUserDetail;

  useEffect(() => {
    if (!isFetching && !isFetched) {
      refetch().then((res) => {
        setCurrentUser(res.data || null);
      });
    }
  }, [id, isFetching, isFetched, refetch]);

  return {
    currentUser,
    ...queryUserDetail,
  };
};
