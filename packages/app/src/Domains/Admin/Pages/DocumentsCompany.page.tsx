import { useState } from 'react';
import { Container, Page, useDevice } from '@app/Application';
import {
  DocumentsListWrapper,
  PDFPreview,
  SignedDetail,
  Statistics,
} from '../../Documents/Components';
import { PDFPreviewMobile } from '../../Documents/Components/PDFPreview/PDFPreviewMobile';
import { useGetDocumentsByCompany } from '../Hooks';
import { SegmentsFilter } from '@app/Domains/Segments/Components/SegmentsFilter';
import { useGetUsersBySegments } from '@app/Domains/Segments/Application/segments.queries';

export const DocumentsCompanyPage = () => {
  const { isMobile } = useDevice();
  const service = useGetDocumentsByCompany();
  const [segmentIds, setSegmentIds] = useState<number[]>([]);

  const { data: filteredUserIds } = useGetUsersBySegments(
    { segmentIds },
    { enabled: segmentIds.length > 0 },
  );

  return (
    <Page title="Todos los documentos de la empresa">
      <Container>
        <Statistics />
        <Container row align="center" space="small">
          <div className="w-full max-w-[320px]">
            <SegmentsFilter value={segmentIds} onChange={setSegmentIds} />
          </div>
        </Container>
        <Container row>
          <div className="min-w-75 max-w-100 w-full">
            <DocumentsListWrapper
              service={service}
              segmented
              filteredUserIds={
                filteredUserIds ? new Set(filteredUserIds) : undefined
              }
            />
          </div>
          {isMobile ? (
            <PDFPreviewMobile />
          ) : (
            <Container className="w-full">
              <SignedDetail />
              <Container
                justify="center"
                align="center"
                className="w-full h-[80vh] p-4 border"
              >
                <PDFPreview />
              </Container>
            </Container>
          )}
        </Container>
      </Container>
    </Page>
  );
};
