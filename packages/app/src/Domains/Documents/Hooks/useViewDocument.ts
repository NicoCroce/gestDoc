import { useGlobalStore } from '@app/Aplication';
import { documentsService } from '../Documents.service';
import { useCacheDocuments } from './useCacheDocuments';
import { useGetDocument } from './useGetDocument';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export const useViewDocument = () => {
  const [searchParams] = useSearchParams();
  const { data: documentViewedId, setQueryData } =
    useGlobalStore('documentViewed');
  const { currentDocument } = useGetDocument(documentViewedId as string);
  const cacheDocuments = useCacheDocuments();
  const { mutate } = documentsService.view.useMutation();

  useEffect(() => {
    console.log(currentDocument?.view);
    if (documentViewedId && currentDocument && currentDocument.view === null) {
      setQueryData(null);
      if (searchParams.get('id') !== documentViewedId) {
        cacheDocuments.invalidate();
      }
      setTimeout(() => mutate(documentViewedId as number), 500);
    }
  }, [
    cacheDocuments,
    currentDocument,
    documentViewedId,
    mutate,
    searchParams,
    setQueryData,
  ]);

  const markAsViewed = (id: string) => setQueryData(id);

  return { markAsViewed };
};
