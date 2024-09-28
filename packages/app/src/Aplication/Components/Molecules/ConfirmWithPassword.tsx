import { Button } from './Button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';

const formSchema = z.object({
  password: z.string().min(8, {
    message: 'La contraseña debe ser mayor a 8 caracteres',
  }),
});

interface ConfirmWithPasswordProps {
  onConfirm: (password: string) => void;
  textDescription: string;
  isLoading: boolean;
  isOpen: boolean;
  onCloseDialog: () => void;
}

export const ConfirmWithPassword = ({
  onConfirm,
  textDescription,
  isLoading,
  isOpen,
  onCloseDialog,
}: ConfirmWithPasswordProps) => {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: '',
    },
  });

  const handleSubmit = (values: z.infer<typeof formSchema>) =>
    onConfirm(values.password);

  const handleClose = () => {
    console.log('pasa por acá');
    onCloseDialog();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="mb-4">Firmar documento</DialogTitle>
          <DialogDescription>{textDescription}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="w-full">
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contraseña</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="mt-8">
              <Button
                onClick={handleClose}
                variant="ghost"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" isLoading={isLoading}>
                Firmar
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
