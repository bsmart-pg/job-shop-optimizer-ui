import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Settings } from "lucide-react";
import { fixCurrentPlanByLines } from "@/lib/services/scheduleService";
import { toast } from "@/components/ui/sonner";
import { Spinner } from "@/components/Spinner";

interface FixLinesButtonProps {
  lines: Array<{ id: string; name: string }>;
  onFixComplete: () => void;
  disabled?: boolean;
}

export function FixLinesButton({ lines, onFixComplete, disabled }: FixLinesButtonProps) {
  const [open, setOpen] = useState(false);
  const [selectedLines, setSelectedLines] = useState<string[]>([]);
  const [fixing, setFixing] = useState(false);

  const handleLineToggle = (lineName: string, checked: boolean) => {
    if (checked) {
      setSelectedLines(prev => [...prev, lineName]);
    } else {
      setSelectedLines(prev => prev.filter(name => name !== lineName));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedLines(lines.map(line => line.name));
    } else {
      setSelectedLines([]);
    }
  };

  const handleFix = async () => {
    if (selectedLines.length === 0) {
      toast.error("Bitte wählen Sie mindestens eine Linie aus");
      return;
    }

    setFixing(true);
    try {
      await fixCurrentPlanByLines(selectedLines);
      toast.success(`Plan für ${selectedLines.length} Linie(n) erfolgreich korrigiert`);
      setOpen(false);
      setSelectedLines([]);
      onFixComplete();
    } catch (error) {
      console.error("Error fixing plan:", error);
      toast.error("Fehler beim Korrigieren des Plans");
    } finally {
      setFixing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          disabled={disabled}
        >
          <Settings className="h-4 w-4 mr-2" />
          Fix
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Plan für Linien korrigieren</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center space-x-2 border-b pb-2">
            <Checkbox
              id="select-all"
              checked={selectedLines.length === lines.length && lines.length > 0}
              onCheckedChange={handleSelectAll}
            />
            <label htmlFor="select-all" className="font-medium">
              Alle auswählen
            </label>
          </div>
          
          <div className="max-h-60 overflow-y-auto space-y-2">
            {lines.map((line) => (
              <div key={line.id} className="flex items-center space-x-2">
                <Checkbox
                  id={line.id}
                  checked={selectedLines.includes(line.name)}
                  onCheckedChange={(checked) => handleLineToggle(line.name, checked === true)}
                />
                <label htmlFor={line.id} className="text-sm">
                  {line.name}
                </label>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="text-sm text-muted-foreground">
              {selectedLines.length} von {lines.length} ausgewählt
            </span>
            <Button 
              onClick={handleFix} 
              disabled={fixing || selectedLines.length === 0}
            >
              {fixing ? (
                <span className="flex items-center">
                  <Spinner size="sm" className="mr-2" />
                  Korrigiere...
                </span>
              ) : (
                "Plan korrigieren"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}