import { useEffect, useMemo, useState } from 'react';
import { TDocument } from '../Document.entity';
import { documentsService } from '../Documents.service';
import { useCacheDocuments } from './useCacheDocuments';

export const useGetDocument = (id: string | undefined = '') => {
  const [currentDocument, setCurrentDocument] = useState<TDocument | null>(
    null,
  );
  const queryDocumentDetail = documentsService.get.useQuery(id, {
    enabled: id !== undefined,
  });

  const cacheDocumentsList = useCacheDocuments();
  const { isFetched, isFetching, refetch } = queryDocumentDetail;

  // Extraemos los datos de la caché si es que existe.
  const cachedDocuments = useMemo(
    () =>
      cacheDocumentsList.getData()?.find((document) => document.id === id) ||
      null,
    [cacheDocumentsList, id],
  );

  useEffect(() => {
    // Si el usuario está en caché, lo usamos, de lo contrario, hacemos fetch
    if (cachedDocuments) {
      setCurrentDocument(cachedDocuments);
    } else if (!isFetching && !isFetched) {
      refetch().then((res) => {
        setCurrentDocument(res.data || null);
      });
    }
  }, [id, isFetching, isFetched, refetch, cachedDocuments]);

  return {
    currentDocument,
    ...queryDocumentDetail,
  };
};
