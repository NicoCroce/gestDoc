import { Container, FilterButton, FiltersSheet, Page } from '@app/Aplication';
import { Statistics } from '../../Documents/Components';

import { useGetCertificatesByCompany } from '../Hooks';
import { LicensesListWrapper } from '../Components';
import { useState } from 'react';
import { FiltersCertificatesForm } from '@app/Domains/Certificates';

export const LicensesCompanyPage = () => {
  //const { isMobile } = useDevice();
  const service = useGetCertificatesByCompany();
  const [filtersIsOpen, setFiltersIsOpen] = useState(false);

  const handleFilters = () => {
    setFiltersIsOpen((prevState) => !prevState);
  };

  return (
    <Page
      title="Todos los documentos de la empresa"
      headerRight={<FilterButton onClick={handleFilters} variant="secondary" />}
    >
      <Container>
        <Statistics />
        <Container row>
          <div className="min-w-[300px] w-full">
            <LicensesListWrapper service={service} />
          </div>
        </Container>
        <FiltersSheet
          open={filtersIsOpen}
          closeSheet={handleFilters}
          title="Filtros de Certificados"
        >
          <FiltersCertificatesForm />
        </FiltersSheet>
      </Container>
    </Page>
  );
};
