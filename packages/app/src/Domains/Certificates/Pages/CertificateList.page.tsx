import { Container, FiltersSheet, Page, Title } from '@app/Aplication';
import { CertificatesGrid, ActionsCertificateListPage } from '../Components';

import { v4 as uuidv4 } from 'uuid';
import { useGetCertificates } from '../Hooks';
import { useState } from 'react';

export const CertificateListPage = () => {
  const { data } = useGetCertificates();
  const [filtersIsOpen, setFiltersIsOpen] = useState(false);

  const handleFilters = () => {
    setFiltersIsOpen((prevState) => !prevState);
  };

  return (
    <Page
      title="Licencias"
      headerRight={<ActionsCertificateListPage onClick={handleFilters} />}
    >
      <>
        {data &&
          Object.entries(data).map(([year, certificates]) => (
            <Container key={uuidv4()} space="large">
              <Title variant="h4">
                Certificados correspondientes al año {year}
              </Title>
              <Container block className="md:mx-14">
                <CertificatesGrid certificatesList={certificates} />
              </Container>
            </Container>
          ))}
        <FiltersSheet
          open={filtersIsOpen}
          closeSheet={handleFilters}
          title="Filtros de Certificados"
        >
          <p>Es el filtro</p>
        </FiltersSheet>
      </>
    </Page>
  );
};
