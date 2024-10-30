import { Button, Container, useURLParams } from '@app/Aplication';
import { SignDocument } from '../SignDocument';

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@app/Aplication/Components/ui/drawer';
import { TDocumentSearch } from '../../Document.entity';
import { useEffect, useState } from 'react';
import { SignedDetail } from '../SignedDetail';

interface PDFPreviewMobileProps {
  file: string;
}

export const PDFPreviewMobile = ({ file }: PDFPreviewMobileProps) => {
  const { searchParams } = useURLParams<TDocumentSearch>();
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (searchParams?.id) setIsOpen(true);
  }, [searchParams?.id]);

  return (
    <Drawer open={isOpen} onOpenChange={() => setIsOpen(false)}>
      <DrawerContent className="h-[90%]">
        <DrawerHeader className="justify-start">
          <DrawerTitle>Detalle del documento</DrawerTitle>
        </DrawerHeader>
        <Container className="p-4 h-full">
          <SignDocument />
          <SignedDetail />
          <iframe src={file} height="100%" width="100%"></iframe>
        </Container>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};
