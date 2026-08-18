import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@app/Application/Components';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@app/Application/Components/ui/dialog';
import { Textarea } from '@app/Application/Components/ui/textarea';

const MAX_CHARS = 500;
const COUNTER_WARN_THRESHOLD = 50;

const rejectionSchema = z.object({
  reason: z
    .string()
    .trim()
    .min(1, 'El motivo es obligatorio')
    .max(MAX_CHARS, `El motivo no puede superar ${MAX_CHARS} caracteres`),
});

type RejectionFormValues = z.infer<typeof rejectionSchema>;

interface RejectionReasonModalProps {
  open: boolean;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  isPending: boolean;
}

export const RejectionReasonModal = ({
  open,
  onConfirm,
  onCancel,
  isPending,
}: RejectionReasonModalProps) => {
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<RejectionFormValues>({
    resolver: zodResolver(rejectionSchema),
    defaultValues: { reason: '' },
  });

  const reasonValue = watch('reason');
  const charsRemaining = MAX_CHARS - (reasonValue?.length ?? 0);
  const isNearLimit = charsRemaining < COUNTER_WARN_THRESHOLD;

  // Reset form each time the modal opens
  useEffect(() => {
    if (open) reset({ reason: '' });
  }, [open, reset]);

  const onSubmit = (values: RejectionFormValues) => {
    onConfirm(values.reason);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isPending) onCancel();
      }}
    >
      <DialogContent className="max-w-md p-0 gap-0 overflow-hidden">
        {/* Header with rejection-tint background and 4px left danger stripe */}
        <div
          className="px-6 py-4 border-l-[4px]"
          style={{
            backgroundColor: '#FEF2F2',
            borderLeftColor: '#EF4444',
          }}
        >
          <DialogHeader>
            <DialogTitle className="font-semibold text-base text-[#0F172A]">
              Motivo del rechazo
            </DialogTitle>
            <DialogDescription className="text-sm text-[#64748B] mt-1">
              Al empleado se le notificará el motivo por correo.
            </DialogDescription>
          </DialogHeader>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="px-6 py-4 flex flex-col gap-2">
            <label
              htmlFor="rejection-reason"
              className="text-xs font-medium uppercase tracking-wide text-[#EF4444]"
            >
              Motivo
            </label>
            <Textarea
              id="rejection-reason"
              rows={4}
              maxLength={MAX_CHARS}
              placeholder="Describí el motivo del rechazo..."
              className="resize-none"
              disabled={isPending}
              {...register('reason')}
            />
            <div className="flex items-start justify-between gap-2">
              {errors.reason ? (
                <span className="text-xs text-[#EF4444]">
                  {errors.reason.message}
                </span>
              ) : (
                <span />
              )}
              <span
                className={`text-xs font-mono tabular-nums ml-auto ${
                  isNearLimit ? 'text-[#EF4444]' : 'text-slate-400'
                }`}
              >
                {charsRemaining} restantes
              </span>
            </div>
          </div>

          <DialogFooter className="px-6 pb-4">
            <Button
              type="button"
              variant="ghost"
              disabled={isPending}
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="destructive" isLoading={isPending}>
              Rechazar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
