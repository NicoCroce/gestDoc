'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { DateRange } from 'react-day-picker';

import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { Button } from '../Molecules/Button';
import { Button as ButtonLib } from '../ui/button';
import { cn } from '@app/Aplication/lib/utils';
import { Calendar } from '../ui/calendar';
import { Container } from '../Layout';

interface DatePickerWithRangeProps
  extends React.HTMLAttributes<HTMLDivElement> {
  onChangeDate: ({ from, to }: DateRange) => void;
}

export const DatePickerWithRange = ({
  onChangeDate,
}: DatePickerWithRangeProps) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: undefined,
    to: undefined,
  });

  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const saveDate = () => {
    onChangeDate(date!);
    setIsPopoverOpen(false); // Cierra el Popover
  };

  return (
    <div className={cn('grid gap-2')}>
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <ButtonLib
            id="date"
            variant={'outline'}
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
            )}
          >
            <Container row align="center">
              <CalendarIcon />
              {date?.from ? (
                date.to ? (
                  <>
                    {format(date.from, 'LLL dd, y')} -{' '}
                    {format(date.to, 'LLL dd, y')}
                  </>
                ) : (
                  format(date.from, 'LLL dd, y')
                )
              ) : (
                <span>Mostrar calendario</span>
              )}
            </Container>
          </ButtonLib>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
          <Container row align="center" justify="end" className="m-4">
            <Button
              appearance="cancel"
              onClick={() => setIsPopoverOpen(false)}
            />
            <Button appearance="accept" onClick={saveDate} />
          </Container>
        </PopoverContent>
      </Popover>
    </div>
  );
};
