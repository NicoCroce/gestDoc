import {
  Container,
  EmptyScreenFilter,
  FilterButton,
  FiltersSheet,
  Page,
} from '@app/Aplication';

import { useGetCertificatesByCompany } from '../Hooks';
import { LicensesListWrapper, StatisticsCertificates } from '../Components';
import { useState } from 'react';
import { FiltersCertificatesForm } from '@app/Domains/Certificates';

export const LicensesCompanyPage = () => {
  //const { isMobile } = useDevice();
  const service = useGetCertificatesByCompany();
  const [filtersIsOpen, setFiltersIsOpen] = useState(false);

  const { data } = service;

  const handleFilters = () => {
    setFiltersIsOpen((prevState) => !prevState);
  };

  const isEmptyScreen = data && !Object.keys(data).length;

  console.log(isEmptyScreen);

  return (
    <Page
      title="Todos los certificados de la empresa"
      headerRight={<FilterButton onClick={handleFilters} variant="secondary" />}
    >
      <Container>
        <StatisticsCertificates />
        <Container row>
          {!isEmptyScreen ? (
            <div className="min-w-[300px] w-full">
              <LicensesListWrapper service={service} />
            </div>
          ) : (
            <EmptyScreenFilter onClick={() => setFiltersIsOpen} />
          )}
        </Container>
        <FiltersSheet
          open={filtersIsOpen}
          closeSheet={handleFilters}
          title="Filtros de Certificados"
        >
          <FiltersCertificatesForm isAdmin />
        </FiltersSheet>
      </Container>
    </Page>
  );
};
