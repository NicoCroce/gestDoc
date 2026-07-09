import {
  Container,
  EmptyScreenError,
  EmptyScreenFilter,
  FiltersSheet,
  Page,
} from '@app/Application';
import {
  CertificatesGrid,
  ActionsCertificateListPage,
  FiltersCertificatesForm,
} from '../Components';

import { useGetCertificates } from '../Hooks';
import { useState } from 'react';
import { ICertificate } from '..';

export const CertificateListPage = () => {
  const { data, isError, error } = useGetCertificates();
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
        {isError ? (
          <EmptyScreenError message={error?.message} />
        ) : data && Object.keys(data).length === 0 ? (
          <EmptyScreenFilter onClick={handleFilters} />
        ) : (
          data &&
          Object.entries(data).map(([year, certificates]) => {
            const list = certificates as ICertificate[];
            return (
              <Container key={year} block className="mt-10 first:mt-0">
                <div className="flex items-end justify-between gap-4 pb-3 border-b">
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl font-semibold tracking-tight tabular-nums text-foreground">
                      {year}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {list.length}{' '}
                      {list.length === 1 ? 'licencia' : 'licencias'}
                    </span>
                  </div>
                </div>
                <Container block className="mt-6">
                  <CertificatesGrid
                    certificatesList={list}
                    year={Number(year)}
                  />
                </Container>
              </Container>
            );
          })
        )}
        <FiltersSheet
          open={filtersIsOpen}
          closeSheet={handleFilters}
          title="Filtros de Certificados"
          description="Puedes filtrar los certificados por los siguientes parámetros"
        >
          <FiltersCertificatesForm />
        </FiltersSheet>
      </>
    </Page>
  );
};
