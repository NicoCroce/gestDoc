import { Page } from '@app/Aplication';
import { AddLicenseForm } from '../Components/AddLicenseForm/AddLicenseForm';
import { Card } from '@app/Aplication/Components/ui/card';

export const AddCertificatePage = () => {
  return (
    <Page title="Agregar licencia" size="small" backButton>
      <Card className="p-4">
        <AddLicenseForm />
      </Card>
    </Page>
  );
};
