import { Button, Container, useURLParams } from '@app/Aplication';
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
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { DOCUMENTS_ROUTE } from '../../Documents.routes';
import { FiltersSheet } from '../FiltersSheet/FiltersSheet';
import { useGetFiltersSetted } from '../../Hooks/useGetFiltersSetted';
import { DocumentsList } from './DocumentsList';
import { useViewDocument } from '../../Hooks/useViewDocument';
import { useGetDocumentsTypes } from '../../Hooks/useGetDocumentsTypes';
import { TuseGetDocuments } from '../../Hooks';
import { TuseGetDocumentsByCompany } from '../../Hooks/useGetDocumentsByCompany';
import { DocumentsListByUser } from './DocumentsListByUser';

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
  const hasFilters = useGetFiltersSetted();
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
          <Button className="relative" onClick={handleFilters}>
            {hasFilters && (
              <span className="w-3 h-3 bg-red-700 rounded-full absolute top-[-4px] right-[-4px]"></span>
            )}
            <FontAwesomeIcon icon={faFilter}></FontAwesomeIcon>
          </Button>
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
      <FiltersSheet open={filtersIsOpen} closeSheet={handleFilters} />
    </>
  );
};
