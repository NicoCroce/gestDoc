import {
  Container,
  FilterButton,
  FiltersSheet,
  useURLParams,
} from '@app/Aplication';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@app/Aplication/Components/ui/tabs';
import { useEffect, useState } from 'react';
import {
  PENDING,
  VALIDATED,
  TDocumentSearch,
  TStateDocument,
} from '../../Document.entity';
import { DOCUMENTS_ROUTE } from '../../Documents.routes';
import { DocumentsList } from './DocumentsList';
import { useViewDocument } from '../../Hooks/useViewDocument';
import { useGetDocumentsTypes } from '../../Hooks/useGetDocumentsTypes';
import { TuseGetDocuments } from '../../Hooks';

import { DocumentsListByUser } from './DocumentsListByUser';
import { TuseGetDocumentsByCompany } from '@app/Domains/Admin/Hooks';
import { FiltersDocumentsForm } from '../FiltersDocumentsForm';

interface DocumentsListWrapperProps {
  service: TuseGetDocuments | TuseGetDocumentsByCompany;
  segmented?: boolean;
}

export const DocumentsListWrapper = ({
  service,
  segmented = false,
}: DocumentsListWrapperProps) => {
  const { searchParams, updateParams } =
    useURLParams<TDocumentSearch>(DOCUMENTS_ROUTE);
  const [isState, setState] = useState<TStateDocument>(
    searchParams?.state || PENDING,
  );

  const [filtersIsOpen, setFiltersIsOpen] = useState(false);
  useViewDocument();
  useGetDocumentsTypes();

  useEffect(() => {
    const value = searchParams?.state || PENDING;
    updateParams({ state: value });
    setState(value);
  }, [searchParams?.state, updateParams]);

  const handleTabsChange = (value: string) => {
    setState(value as TStateDocument);
    updateParams({ state: value, id: undefined });
  };

  const handleFilters = () => {
    setFiltersIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <Tabs
        defaultValue={isState}
        className="w-full flex flex-col gap-4"
        onValueChange={handleTabsChange}
        value={isState}
      >
        <Container row>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={PENDING} className="flex-auto">
              Pendientes
            </TabsTrigger>
            <TabsTrigger value={VALIDATED} className="flex-auto">
              Validados
            </TabsTrigger>
          </TabsList>
          <FilterButton
            onClick={handleFilters}
            ignoreParams={['id', 'state']}
          />
        </Container>
        {segmented ? (
          <DocumentsListByUser
            openFilters={handleFilters}
            service={service as TuseGetDocumentsByCompany}
          />
        ) : (
          <DocumentsList
            openFilters={handleFilters}
            service={service as TuseGetDocuments}
          />
        )}
      </Tabs>
      <FiltersSheet
        open={filtersIsOpen}
        closeSheet={handleFilters}
        title="Filtros de Documentos"
      >
        {<FiltersDocumentsForm />}
      </FiltersSheet>
    </>
  );
};
