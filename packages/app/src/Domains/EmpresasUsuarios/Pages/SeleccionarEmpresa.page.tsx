import { useGlobalStore } from '@app/Application';
import { TUserLogged } from '@app/Domains/Users';
import { EmpresaCard } from '../Components';
import { useGetEmpresasByUsuario } from '../Hooks';

export const SeleccionarEmpresaPage = () => {
  const { data: dataUser } = useGlobalStore<TUserLogged>('dataUser');
  const { data: empresas = [] } = useGetEmpresasByUsuario(dataUser?.id ?? 0);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-8">
      <h1 className="mb-2 text-2xl font-bold text-gray-800">
        Seleccioná tu empresa
      </h1>
      <p className="mb-8 text-gray-500">
        Tu usuario tiene acceso a las siguientes empresas
      </p>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(empresas ?? []).map((empresa) => (
          <EmpresaCard key={empresa.id} empresa={empresa} />
        ))}
      </div>
    </div>
  );
};
