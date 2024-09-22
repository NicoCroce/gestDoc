import { Button, Container, List, useURLParams } from '@app/Aplication';
import { useGetDocuments } from '../Hooks/useGetDocuments';
import { Document } from './Document';
import {
  Tabs,
  TabsList,
  TabsTrigger,
} from '@app/Aplication/Components/ui/tabs';
import { useState } from 'react';
import {
  PENDING,
  SIGNED,
  TDocumentSearch,
  TIsSigned,
} from '../Document.entity';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { DOCUMENTS_ROUTE } from '../Documents.routes';
/* import { FiltersSheet } from './FiltersSheet'; */

export const DocumentsList = () => {
  const { searchParams, updateParams } =
    useURLParams<TDocumentSearch>(DOCUMENTS_ROUTE);
  const [isSigned, setIsSigned] = useState<TIsSigned>(
    searchParams?.signed || PENDING,
  );
  const { data } = useGetDocuments();
  /*   const [filtersIsOpen, setFiltersIsOpen] = useState(false);
   */
  if (!data) return null;

  const handleTabsChange = (value: string) => {
    setIsSigned(value as TIsSigned);
    updateParams({ signed: value });
  };

  const handleFilters = () => {
    /* setFiltersIsOpen((prevState) => {
      console.log('DATO :  ', !prevState);
      return !prevState;
    }); */
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
          <Button className="flex-auto" onClick={handleFilters}>
            <FontAwesomeIcon icon={faFilter}></FontAwesomeIcon>
          </Button>
        </Container>
        <List>
          {data?.map((document) => (
            <List.Li key={document.id}>
              <Document {...document} />
            </List.Li>
          ))}
        </List>
      </Tabs>
      {/* <FiltersSheet open={filtersIsOpen} closeSheet={handleFilters} /> */}
    </>
  );
};
