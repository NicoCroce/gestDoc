type EmpresaItem = {
  id: number;
  razon_social: string;
  cuit: number;
  logo: string | null;
};

type EmpresaCardProps = {
  empresa: EmpresaItem;
};

export const EmpresaCard = ({ empresa }: EmpresaCardProps) => {
  const inicial = empresa.razon_social.charAt(0).toUpperCase();

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
      {empresa.logo ? (
        <img
          src={empresa.logo}
          alt={empresa.razon_social}
          className="h-16 w-16 rounded-full object-contain"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-semibold text-blue-600">
          {inicial}
        </div>
      )}
      <p className="text-center text-base font-semibold text-gray-800">
        {empresa.razon_social}
      </p>
      <p className="text-sm text-gray-500">CUIT: {empresa.cuit}</p>
    </div>
  );
};
