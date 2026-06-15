import { useGlobalStore, Container, Title } from '@app/Application';
import { HalfPage } from '@app/Application/Components/Layout';
import { TUserLogged } from '@app/Domains/Users';
import { EmpresaCard } from '../Components';
import { useGetEmpresasByUsuario, useSelectEmpresa } from '../Hooks';
import { LeftContentPage } from '@app/Domains/Auth';

const bg = '/images/login.png';

export const SeleccionarEmpresaPage = () => {
  const { data: dataUser } = useGlobalStore<TUserLogged>('dataUser');
  const { data: empresas = [] } = useGetEmpresasByUsuario(dataUser?.id ?? 0);
  const { mutate: selectEmpresa, isPending } = useSelectEmpresa();

  return (
    <HalfPage
      title="Seleccioná tu empresa"
      left={<LeftContentPage title="GestDoc" subtitle="Macrosistemas" />}
      background={bg}
    >
      <Container block className="mb-4">
        <Title variant="h4" className="text-primary mb-2">
          Bienvenido, {dataUser?.name}
        </Title>
        <p className="text-gray-500">
          Tu usuario tiene acceso a las siguientes empresas
        </p>
      </Container>
      <Container row>
        {(empresas ?? []).map((empresa) => (
          <EmpresaCard
            key={empresa.id}
            empresa={empresa}
            onSelect={(empresaId) => selectEmpresa({ empresaId })}
            isLoading={isPending}
          />
        ))}
      </Container>
    </HalfPage>
  );
};
