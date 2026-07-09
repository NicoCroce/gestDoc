import React, { useState } from 'react';
import { UploadCloud } from 'lucide-react';
import { cn } from '@app/Application/lib/utils';

export interface UploadFileProps extends Omit<
  React.InputHTMLAttributes<HTMLInputElement>,
  'type' | 'value'
> {
  value?: FileList | null;
  helperText?: string;
  accept?: string;
}

export const UploadFile = React.forwardRef<HTMLInputElement, UploadFileProps>(
  (
    {
      value,
      helperText = 'Arrastre la imagen aquí o haga clic para seleccionarla',
      accept = 'image/*',
      onChange,
      className,
      ...props
    },
    ref,
  ) => {
    const [dragActive, setDragActive] = useState(false);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(true);
    };

    const handleDragLeave = () => {
      setDragActive(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      if (e.dataTransfer.files?.length) {
        const syntheticEvent = {
          target: { files: e.dataTransfer.files },
          currentTarget: { files: e.dataTransfer.files },
        } as unknown as React.ChangeEvent<HTMLInputElement>;
        onChange?.(syntheticEvent);
      }
    };

    return (
      <label
        className={cn(
          'group relative flex min-h-[12rem] cursor-pointer flex-col items-center justify-center gap-5 rounded-lg border-2 border-dashed px-6 py-12 text-center transition-colors focus-within:ring-2 focus-within:ring-ring',
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-input bg-muted/30 hover:border-primary hover:bg-primary/5',
          className,
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <span className="flex h-18 w-18 items-center justify-center rounded-full bg-primary/10 text-primary transition-transform group-hover:scale-110 motion-reduce:transform-none">
          <UploadCloud className="h-9 w-9" strokeWidth={1.75} />
        </span>
        <span className="flex flex-col gap-1">
          {value?.[0]?.name ? (
            <>
              <span className="text-base font-medium text-foreground">
                {value[0].name}
              </span>
              <span className="text-sm text-primary">
                Reemplace el archivo seleccionando uno nuevo
              </span>
            </>
          ) : (
            <>
              <span className="text-base font-medium text-foreground">
                {helperText}
              </span>
              <span className="text-sm text-muted-foreground">
                PNG, JPG o WebP
              </span>
            </>
          )}
        </span>
        <input
          ref={ref}
          type="file"
          accept={accept}
          className="sr-only"
          onChange={onChange}
          {...props}
        />
      </label>
    );
  },
);

UploadFile.displayName = 'UploadFile';
