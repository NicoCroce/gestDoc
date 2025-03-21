import { Container, Page, useDevice } from '@app/Aplication';
import {
  DocumentsListWrapper,
  PDFPreview,
  SignDocument,
  SignedDetail,
} from '../Components';
import { PDFPreviewMobile } from '../Components/PDFPreview/PDFPreviewMobile';
import { useGetDocuments } from '../Hooks';

export const DocumentsListPage = () => {
  const { isMobile } = useDevice();
  const service = useGetDocuments();

  return (
    <Page title="Documentos" headerRight={!isMobile && <SignDocument />}>
      <Container row>
        <div className="min-w-[300px] max-w-[400px] w-full">
          <DocumentsListWrapper service={service} />
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
    </Page>
  );
};
