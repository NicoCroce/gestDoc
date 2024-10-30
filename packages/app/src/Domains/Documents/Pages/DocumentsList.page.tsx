import { Container, Page, useGlobalStore } from '@app/Aplication';
import {
  DocumentsListWrapper,
  PDFPreview,
  SignDocument,
  SignedDetail,
} from '../Components';

export const DocumentsListPage = () => {
  const { data: isMobile } = useGlobalStore('isMobile');

  return (
    <Page title="Documentos" headerRight={!isMobile && <SignDocument />}>
      <Container row>
        <div className="min-w-[300px] max-w-[400px] w-full">
          <DocumentsListWrapper />
        </div>
        {isMobile ? (
          <PDFPreview />
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
