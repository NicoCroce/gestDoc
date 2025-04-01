'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';

import { cn } from '@/Aplication/lib/utils';
import { Button } from '@/Aplication/Components/ui/button';
import { Calendar } from '@/Aplication/Components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/Aplication/Components/ui/popover';
import { Container } from '../Layout';

interface DatePickerProps {
  onClose: (date: Date) => void;
}

export const DatePicker = ({ onClose }: DatePickerProps) => {
  const [date, setDate] = useState<Date>();
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;
    setDate(selectedDate);
    onClose(selectedDate);
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={() => setIsOpen(!isOpen)}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-[240px] justify-start text-left font-normal',
            !date && 'text-muted-foreground',
          )}
        >
          <Container row space="small" align="center">
            <CalendarIcon />
            {date ? format(date, 'PPP') : <span>Seleccionar Fecha</span>}
          </Container>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={handleSelect}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
};
