import {
  Container,
  EmptyScreenFilter,
  FiltersSheet,
  Page,
  Title,
} from '@app/Aplication';
import {
  CertificatesGrid,
  ActionsCertificateListPage,
  FiltersCertificatesForm,
} from '../Components';

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
        {data && Object.keys(data).length === 0 ? (
          <EmptyScreenFilter onClick={handleFilters} />
        ) : (
          data &&
          Object.entries(data).map(([year, certificates]) => (
            <Container key={uuidv4()} space="large" className="mt-8">
              <Title variant="h4">
                Certificados correspondientes al año {year}
              </Title>
              <Container block className="md:mx-14">
                <CertificatesGrid certificatesList={certificates} />
              </Container>
            </Container>
          ))
        )}
        <FiltersSheet
          open={filtersIsOpen}
          closeSheet={handleFilters}
          title="Filtros de Certificados"
        >
          <FiltersCertificatesForm />
        </FiltersSheet>
      </>
    </Page>
  );
};
