import { Container, Page, useDevice, Text } from '@app/Aplication';
import { DocumentsListWrapper, PDFPreview, SignedDetail } from '../Components';
import { PDFPreviewMobile } from '../Components/PDFPreview/PDFPreviewMobile';
import { useGetDocumentsByCompany } from '../Hooks/useGetDocumentsByCompany';

export const DocumentsCompanyPage = () => {
  const { isMobile } = useDevice();
  const service = useGetDocumentsByCompany();

  return (
    <Page title="Todos los documentos de la empresa">
      <Container>
        <Container>
          <Text>
            Usuarios Totales: {service.data && Object.keys(service.data).length}
          </Text>
        </Container>
        <Container row>
          <div className="min-w-[300px] max-w-[400px] w-full">
            <DocumentsListWrapper service={service} segmented />
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
