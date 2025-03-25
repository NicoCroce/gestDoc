import { Container, List, Text, Title } from '@app/Aplication';
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
import { uuid } from '@app/Aplication/Helpers/uuid';

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
                        {Object.entries(certificates).map(
                          ([year, certificatesForYear]) => (
                            <Container
                              key={uuid()}
                              className="[&:not(:first-child)]:mt-8"
                            >
                              <Title variant="h4">
                                Licencias correspondientes al año {year}
                              </Title>
                              <Container className="grid gap-2 grid-cols-[repeat(auto-fit,minmax(200px,420px))] md:mx-14">
                                {certificatesForYear.map((cert) => (
                                  <Container block key={cert.id}>
                                    <Certificate data={cert} />
                                  </Container>
                                ))}
                              </Container>
                            </Container>
                          ),
                        )}
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
