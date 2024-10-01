import { Container, Page, useGlobalStore } from '@app/Aplication';
import { DocumentsListWrapper, PDFPreview, SignDocument } from '../Components';

export const DocumentsListPage = () => {
  const { data: isMobile } = useGlobalStore('isMobile');

  return (
    <Page title="Documentos" headerRight={!isMobile && <SignDocument />}>
      <Container row>
        <div className="min-w-[350px] max-w-[400px] w-full">
          <DocumentsListWrapper />
        </div>
        {!isMobile && (
          <Container
            justify="center"
            align="center"
            className="w-full h-[80vh] p-4 border"
          >
            <PDFPreview />
          </Container>
        )}
      </Container>
    </Page>
  );
};
