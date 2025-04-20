
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setTimeframe } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useToast } from '@/hooks/use-toast';

interface TimestampSelectorProps {
  onTimeframeSet: () => void;
}

export function TimeframeSelector({ onTimeframeSet }: TimestampSelectorProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const isValidDate = (dateStr: string): boolean => {
    const regex = /^(\d{2})\.(\d{2})\.(\d{4})$/;
    if (!regex.test(dateStr)) return false;
    
    const [, day, month, year] = regex.exec(dateStr) || [];
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    
    return date.getDate() === parseInt(day) &&
           date.getMonth() === parseInt(month) - 1 &&
           date.getFullYear() === parseInt(year);
  };

  const parseDate = (dateStr: string): Date => {
    const [day, month, year] = dateStr.split('.');
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
  };

  const handleSubmit = async () => {
    try {
      setError(null);

      if (!startDate || !endDate) {
        setError('Beide Datumsfelder müssen ausgefüllt sein.');
        return;
      }

      if (!isValidDate(startDate) || !isValidDate(endDate)) {
        setError('Bitte geben Sie die Daten im Format TT.MM.YYYY ein.');
        return;
      }

      const start = parseDate(startDate);
      const end = parseDate(endDate);

      if (start >= end) {
        setError('Das Startdatum muss vor dem Enddatum liegen.');
        return;
      }

      await setTimeframe(startDate, endDate);
      toast({
        title: "Zeitraum aktualisiert",
        description: "Der neue Zeitraum wurde erfolgreich gesetzt."
      });
      onTimeframeSet();
      
    } catch (err) {
      setError('Fehler beim Setzen des Zeitraums. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="startDate" className="block text-sm font-medium mb-2">
            Startdatum
          </label>
          <Input
            id="startDate"
            placeholder="TT.MM.YYYY"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="flex-1">
          <label htmlFor="endDate" className="block text-sm font-medium mb-2">
            Enddatum
          </label>
          <Input
            id="endDate"
            placeholder="TT.MM.YYYY"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSubmit}>
            Zeitraum setzen
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Fehler</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}

