import { AdminDisclaimerService } from '../Admin.service';

export const useHasDisclaimerText = () => {
  const { data, isLoading } = AdminDisclaimerService.hasText.useQuery();

  return {
    hasDisclaimerText: data ?? false,
    isLoading,
  };
};
