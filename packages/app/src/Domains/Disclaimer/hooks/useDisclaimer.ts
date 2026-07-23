import { toast } from 'sonner';
import { DisclaimerService } from '../Disclaimer.service';

export const useGetDisclaimerText = () => {
  return DisclaimerService.getText.useQuery;
};

export const useSignDisclaimer = () => {
  return DisclaimerService.sign.useMutation({
    onError: ({ message }: { message: string }) => toast.error(message),
    onSuccess: () => toast.success('Términos aceptados correctamente'),
  });
};

export const useGetStatus = () => {
  return DisclaimerService.getStatus.useQuery;
};

export const useGetEmployees = () => {
  return DisclaimerService.getEmployees.useQuery;
};

interface ISendRemindersResponse {
  sent: number;
  failed: number;
  total: number;
}

export const useSendReminders = () => {
  return DisclaimerService.sendReminders.useMutation({
    onError: ({ message }: { message: string }) => toast.error(message),
    onSuccess: (data: ISendRemindersResponse) => {
      toast.success(
        `Recordatorios enviados: ${data.sent} exitosos, ${data.failed} fallidos`,
      );
    },
  });
};
