import { useMemo, useState } from 'react';
import {
  Container,
  EmptyScreenFilter,
  FilterButton,
  FiltersSheet,
  Input,
} from '@app/Application';
import { MagnifyingGlassIcon, Cross2Icon } from '@radix-ui/react-icons';
import { LicensesListByUser } from './LicensesListByUser';
import { TuseGetCertificatesByCompany } from '@app/Domains/Admin/Hooks';
import { FiltersCertificatesForm } from '@app/Domains/Certificates';

interface LicensesListSearchProps {
  service: TuseGetCertificatesByCompany;
}

export const LicensesListSearch = ({ service }: LicensesListSearchProps) => {
  const { data } = service;
  const [query, setQuery] = useState('');
  const [filtersIsOpen, setFiltersIsOpen] = useState(false);

  const handleFilters = () => {
    setFiltersIsOpen((prevState) => !prevState);
  };

  const filteredData = useMemo(() => {
    if (!data) return data;
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) return data;
    const result: typeof data = {};
    for (const userId of Object.keys(data)) {
      const user = data[Number(userId)].user;
      if (user.toLowerCase().includes(trimmed)) {
        result[Number(userId)] = data[Number(userId)];
      }
    }
    return result;
  }, [data, query]);

  const isEmptyScreen = data && !Object.keys(data).length;

  return (
    <>
      <Container className="sticky top-0 z-10 bg-slate-50 py-2" row>
        <Container className="relative w-full">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none" />
          <Input
            type="text"
            value={query}
            placeholder="Buscar por empleado"
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9 pr-9"
            aria-label="Buscar por empleado"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              aria-label="Limpiar búsqueda"
            >
              <Cross2Icon className="size-4" />
            </button>
          )}
        </Container>
        <FilterButton onClick={handleFilters} variant="secondary" />
      </Container>
      {isEmptyScreen ? (
        <EmptyScreenFilter onClick={handleFilters} />
      ) : (
        <LicensesListByUser
          service={service as TuseGetCertificatesByCompany}
          filteredData={filteredData}
          query={query}
        />
      )}
      <FiltersSheet
        open={filtersIsOpen}
        closeSheet={handleFilters}
        title="Filtros de Certificados"
      >
        <FiltersCertificatesForm isAdmin />
      </FiltersSheet>
    </>
  );
};
