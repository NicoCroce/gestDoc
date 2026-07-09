import { useState } from 'react';
import { Container, Text } from '@app/Application';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from '@app/Application/Components/ui/dialog';
import { ICertificate } from '../../Certificate.entity';

interface CertificateProps {
  data: ICertificate;
}

export const Certificate = ({ data }: CertificateProps) => {
  const { startDate, endDate, reason, type, files } = data;
  const [activeFile, setActiveFile] = useState<string | null>(null);
  const hasFiles = Array.isArray(files) && files.length > 0;

  console.log(hasFiles, data);

  return (
    <>
      <Container
        space="small"
        className="h-full w-full border-l-4 border-primary border bg-card rounded-lg shadow-sm p-4 transition duration-200"
      >
        <Container row justify="between" align="center" className="mb-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-primary">
            {type}
          </span>
          <span className="text-xs font-medium tabular-nums text-muted-foreground">
            {startDate} &rarr; {endDate}
          </span>
        </Container>
        <Text.Small className="text-card-foreground text-pretty">
          {reason}
        </Text.Small>
        {hasFiles && (
          <Container block className="mt-3">
            <div className="grid grid-cols-[repeat(auto-fill,minmax(40px,1fr))] gap-1.5">
              {files!.map((file) => (
                <button
                  key={file}
                  type="button"
                  onClick={() => setActiveFile(file)}
                  className="aspect-square overflow-hidden rounded bg-muted transition-transform duration-150 hover:scale-[1.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <img
                    src={file}
                    alt={`Adjunto del certificado ${type}`}
                    className="h-full w-full object-cover cursor-pointer"
                  />
                </button>
              ))}
            </div>
            <Text.Label className="mt-2 text-xs text-muted-foreground">
              {files!.length} {files!.length === 1 ? 'adjunto' : 'adjuntos'}
            </Text.Label>
          </Container>
        )}
      </Container>
      <Dialog
        open={activeFile !== null}
        onOpenChange={(open) => !open && setActiveFile(null)}
      >
        <DialogContent className="max-w-3xl gap-0 p-2 sm:p-2">
          <DialogTitle className="sr-only">
            Adjunto del certificado {type}
          </DialogTitle>
          {activeFile && (
            <img
              src={activeFile}
              alt={`Adjunto del certificado ${type}`}
              className="max-h-[80vh] w-full object-contain rounded"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
