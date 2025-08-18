
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { setFloorNumber, resetSchedule as resetScheduleApi } from '@/lib/api';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExclamationTriangleIcon } from '@radix-ui/react-icons';
import { useToast } from '@/hooks/use-toast';

interface FloorSelectorProps {
  onFloorNumberSet: () => void;
}

export function FloorNumberSelector({ onFloorNumberSet }: FloorSelectorProps) {
  const [flNumber, setFlNumber] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setError(null);
    setLoading(true);
    try {
      if (!flNumber ) {
        setError('Hallen Nummer müss ausgefüllt sein.');
        setLoading(false);
        return;
      }

      // Set timeframe in backend first
      await setFloorNumber(flNumber.trim());
      // Then reset the schedule so jobs/work calendar are recalculated
      await resetScheduleApi();
      toast({
        title: "Halle aktualisiert",
        description: "Der neue Halle wurde erfolgreich gesetzt und der Zeitplan wurde zurückgesetzt."
      });
      // Refresh data everywhere
      onFloorNumberSet();
    } catch (err) {
      setError('Fehler beim Setzen der Halle. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            id="flNumber"
            placeholder="Hallennummer"
            value={flNumber}
            onChange={(e) => setFlNumber(e.target.value)}
            disabled={loading}
          />
        </div>
        <div className="flex items-end">
          <Button onClick={handleSubmit} disabled={loading}>
            Halle setzen
          </Button>
        </div>
      </div>
    </div>
  );
}
