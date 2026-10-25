import { UIProvider } from 'macro-design';
import { useGlobalStore } from '../Hooks/useGlobalStore';
import { useHasPermission } from '../Hooks/useHasPermission';
import { useIsEditable } from '../Hooks/useIsEditable';

/** Conecta el Design System con los hooks y el store global de esta app. */
export const AppUIProvider = ({ children }: { children: React.ReactNode }) => {
  const isEditable = useIsEditable();
  const { setQueryData: setBackButtonEnabled } =
    useGlobalStore<boolean>('backButtonEnabled');

  return (
    <UIProvider
      isEditable={isEditable}
      useHasPermission={useHasPermission}
      onBackButtonChange={setBackButtonEnabled}
    >
      {children}
    </UIProvider>
  );
};
