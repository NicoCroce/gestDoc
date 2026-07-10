import { useMemo, useState } from 'react';
import { Container, Input } from '@app/Application';
import { MagnifyingGlassIcon, Cross2Icon } from '@radix-ui/react-icons';
import { LicensesListByUser } from './LicensesListByUser';
import { TuseGetCertificatesByCompany } from '@app/Domains/Admin/Hooks';

interface LicensesListSearchProps {
  service: TuseGetCertificatesByCompany;
}

export const LicensesListSearch = ({ service }: LicensesListSearchProps) => {
  const { data } = service;
  const [query, setQuery] = useState('');

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

  return (
    <>
      <Container className="sticky top-0 z-1">
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
      </Container>
      <LicensesListByUser
        service={service as TuseGetCertificatesByCompany}
        filteredData={filteredData}
        query={query}
      />
    </>
  );
};
