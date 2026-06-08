import { useEffect, useMemo, useState } from 'react';
import { TDocument, TDocumentSearch } from '../Document.entity';
import { documentsService } from '../Documents.service';
import { useCacheDocuments } from './useCacheDocuments';
import { useURLParams } from '@app/Application';

export const useGetDocument = (id: string | undefined) => {
  const [currentDocument, setCurrentDocument] = useState<TDocument | null>(
    null,
  );
  const queryDocument = documentsService.get.useQuery(Number(id), {
    enabled: false,
  });
  const { searchParams } = useURLParams<TDocumentSearch>();

  const cacheDocumentsList = useCacheDocuments();
  const { isFetched, isFetching, refetch } = queryDocument;

  // Extraemos los datos de la caché si es que existe.
  const cachedDocuments = useMemo(() => {
    const { id: paramId, ...filterSearchParams } = searchParams || {};

    return cacheDocumentsList
      .getData({
        ...filterSearchParams,
      })
      ?.find((document) => document.id === Number(paramId));
  }, [cacheDocumentsList, searchParams]);

  useEffect(() => {
    if (!searchParams?.id) {
      const timer = setTimeout(() => setCurrentDocument(null), 0);
      return () => clearTimeout(timer);
    }

    // Si el documento está en caché, lo usamos, de lo contrario, hacemos fetch
    if (cachedDocuments) {
      const timer = setTimeout(() => setCurrentDocument(cachedDocuments), 0);
      return () => clearTimeout(timer);
    } else if (!isFetching && !isFetched && id && searchParams?.id) {
      refetch().then((res) => {
        setCurrentDocument(res.data || null);
      });
    }
  }, [id, isFetching, isFetched, refetch, cachedDocuments, searchParams]);

  return {
    currentDocument,
    ...queryDocument,
  };
};
