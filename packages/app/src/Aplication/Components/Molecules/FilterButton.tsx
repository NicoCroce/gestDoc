import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from './Button';
import { faFilter } from '@fortawesome/free-solid-svg-icons';
import { ButtonProps } from '../ui/button';

interface FilterButtonProps {
  onClick: () => void;
  hasFilters: boolean;
  variant?: ButtonProps['variant'];
}

export const FilterButton = ({
  hasFilters,
  onClick,
  variant = 'default',
}: FilterButtonProps) => (
  <Button className="relative" onClick={onClick} variant={variant}>
    {hasFilters && (
      <span className="w-3 h-3 bg-red-700 rounded-full absolute top-[-4px] right-[-4px]"></span>
    )}
    <FontAwesomeIcon icon={faFilter}></FontAwesomeIcon>
  </Button>
);
