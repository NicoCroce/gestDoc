import { useEffect, useMemo, useState } from 'react';
import { TDocument, TDocumentSearch, VALIDATED } from '../Document.entity';
import { documentsService } from '../Documents.service';
import { useCacheDocuments } from './useCacheDocuments';
import { useURLParams } from '@app/Aplication';

export const useGetDocument = (id: string | undefined = '') => {
  const [currentDocument, setCurrentDocument] = useState<TDocument | null>(
    null,
  );
  const queryDocument = documentsService.get.useQuery(id, {
    enabled: false,
  });
  const { searchParams } = useURLParams<TDocumentSearch>();

  const cacheDocumentsList = useCacheDocuments();
  const { isFetched, isFetching, refetch } = queryDocument;

  // Extraemos los datos de la caché si es que existe.
  const cachedDocuments = useMemo(() => {
    const { id, ...filterSearchParams } = searchParams || {};

    return (
      cacheDocumentsList
        .getData({
          ...filterSearchParams,
          signed: filterSearchParams?.signed === VALIDATED,
          view: filterSearchParams?.signed === VALIDATED,
        })
        ?.find((document) => document.id === id) || null
    );
  }, [cacheDocumentsList, searchParams]);

  useEffect(() => {
    // Si el documento está en caché, lo usamos, de lo contrario, hacemos fetch
    if (cachedDocuments) {
      setCurrentDocument(cachedDocuments);
    } else if (!isFetching && !isFetched && id) {
      refetch().then((res) => {
        setCurrentDocument(res.data || null);
      });
    }
  }, [id, isFetching, isFetched, refetch, cachedDocuments]);

  return {
    currentDocument,
    ...queryDocument,
  };
};
