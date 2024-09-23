import { Button, Container, useURLParams } from '@app/Aplication';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@app/Aplication/Components/ui/tabs';
import { useEffect, useState } from 'react';
import {
  PENDING,
  SIGNED,
  TDocumentSearch,
  TIsSigned,
} from '../../Document.entity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { DOCUMENTS_ROUTE } from '../../Documents.routes';
import { FiltersSheet } from '../FiltersSheet/FiltersSheet';
import { useGetFiltersSetted } from '../../Hooks/useGetFiltersSetted';
import { DocumentsList } from './DocumentsList';

export const DocumentsListWrapper = () => {
  const { searchParams, updateParams } =
    useURLParams<TDocumentSearch>(DOCUMENTS_ROUTE);
  const [isSigned, setIsSigned] = useState<TIsSigned>(
    searchParams?.signed || PENDING,
  );

  const [filtersIsOpen, setFiltersIsOpen] = useState(false);
  const hasFilters = useGetFiltersSetted();

  useEffect(() => {
    updateParams({ signed: searchParams?.signed || PENDING });
  }, [searchParams?.signed, updateParams]);

  const handleTabsChange = (value: string) => {
    setIsSigned(value as TIsSigned);
    updateParams({ signed: value });
  };

  const handleFilters = () => {
    setFiltersIsOpen((prevState) => !prevState);
  };

  return (
    <>
      <Tabs
        defaultValue={isSigned}
        className="w-full flex flex-col gap-4"
        onValueChange={handleTabsChange}
      >
        <Container row>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value={PENDING} className="flex-auto">
              Pendientes
            </TabsTrigger>
            <TabsTrigger value={SIGNED} className="flex-auto">
              Firmados
            </TabsTrigger>
          </TabsList>
          <Button className="relative" onClick={handleFilters}>
            {hasFilters && (
              <span className="w-3 h-3 bg-red-700 rounded-full absolute top-[-4px] right-[-4px]"></span>
            )}
            <FontAwesomeIcon icon={faFilter}></FontAwesomeIcon>
          </Button>
        </Container>
        <DocumentsList openFilters={handleFilters} />
      </Tabs>
      <FiltersSheet open={filtersIsOpen} closeSheet={handleFilters} />
    </>
  );
};
