import { Container, Page } from '@app/Aplication';
import { DocumentsListWrapper } from '../Components';

export const DocumentsListPage = () => {
  return (
    <Page title="Documentos">
      <Container row>
        <div className="min-w-[350px] max-w-[400px]">
          <DocumentsListWrapper />
        </div>

        <object
          data="https://firebasestorage.googleapis.com/v0/b/chabashoytest.appspot.com/o/CV_Nicola%CC%81s_Croce.pdf?alt=media&token=83802297-5edf-4456-9e71-34246caf1eae"
          type="application/pdf"
          width="100%"
          className="h-[100vh]"
        >
          {/* <p>
            PDF
            <a href="https://firebasestorage.googleapis.com/v0/b/chabashoytest.appspot.com/o/CV_Nicola%CC%81s_Croce.pdf?alt=media&token=83802297-5edf-4456-9e71-34246caf1eae">
              to the PDF!
            </a>
          </p> */}
        </object>
      </Container>
    </Page>
  );
};
