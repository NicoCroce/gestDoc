import { Container, Page } from '@app/Aplication';
import { DocumentsListWrapper, PDFPreview, SignDocument } from '../Components';

export const DocumentsListPage = () => {
  return (
    <Page title="Documentos" headerRight={<SignDocument />}>
      <Container row>
        <div className="min-w-[350px] max-w-[400px]">
          <DocumentsListWrapper />
        </div>
        <Container
          justify="center"
          align="center"
          className="w-full h-[80vh] p-4 border"
        >
          <PDFPreview />
        </Container>
      </Container>
    </Page>
  );
};
