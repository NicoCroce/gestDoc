type EmpresaItem = {
  id: number;
  denominacion: string;
  logo: string | null;
};

type EmpresaCardProps = {
  empresa: EmpresaItem;
  onSelect: (empresaId: number) => void;
  isLoading?: boolean;
};

export const EmpresaCard = ({
  empresa,
  onSelect,
  isLoading,
}: EmpresaCardProps) => {
  const inicial = empresa.denominacion.charAt(0).toUpperCase();

  return (
    <button
      type="button"
      onClick={() => onSelect(empresa.id)}
      disabled={isLoading}
      className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md disabled:opacity-50 cursor-pointer w-full"
    >
      {empresa.logo ? (
        <img
          src={empresa.logo}
          alt={empresa.denominacion}
          className="h-40 w-40 rounded-full object-contain"
        />
      ) : (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-2xl font-semibold text-blue-600">
          {inicial}
        </div>
      )}
      <p className="text-center text-base font-semibold text-gray-800">
        {empresa.denominacion}
      </p>
    </button>
  );
};
