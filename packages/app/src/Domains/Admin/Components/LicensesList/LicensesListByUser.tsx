import { Container, List, Text } from '@app/Aplication';
import { ScrollArea } from '@app/Aplication/Components/ui/scroll-area';
import { Skeleton } from '@app/Aplication/Components/ui/skeleton';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@app/Aplication/Components/ui/accordion';
import { TuseGetCertificatesByCompany } from '../../Hooks';
import { Certificate } from '@app/Domains/Certificates/Components';

const SkeletonLoader = () => (
  <Container space="small">
    {Array.from({ length: 4 }).map((_, index) => (
      <Skeleton key={index} className="h-32 w-full rounded-xl" />
    ))}
  </Container>
);

interface DocumentsListProps {
  service: TuseGetCertificatesByCompany;
}

export const LicensesListByUser = ({ service }: DocumentsListProps) => {
  const { data, isLoading } = service;

  if (isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <>
      {data ? (
        <ScrollArea className="h-[74vh] w-full">
          <List>
            {Object.keys(data)?.map((userId, index) => {
              const certificates = data[Number(userId)].certificates;

              return (
                <List.Li key={userId}>
                  <Accordion type="single" collapsible defaultValue="item-0">
                    <AccordionItem value={`item-${index}`}>
                      <Container className="sticky top-0 bg-slate-50 mb-4">
                        <AccordionTrigger className="px-4 ">
                          {data[Number(userId)].user}
                        </AccordionTrigger>
                      </Container>
                      <AccordionContent>
                        <Container className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(200px,420px))] justify-center">
                          {certificates.map((certificate) => {
                            return (
                              <Container block key={certificate.id}>
                                <Certificate data={certificate} />
                              </Container>
                            );
                          })}
                        </Container>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </List.Li>
              );
            })}
          </List>
        </ScrollArea>
      ) : (
        <Text.Muted>Cargando</Text.Muted>
      )}
    </>
  );
};
