
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, Play, Square, Download, CalendarRange } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeframeSelector } from "@/components/TimeframeSelector";
import { exportToExcel } from "@/lib/excelExport";
import { toast } from "@/components/ui/sonner";
import { format, parseISO } from "date-fns";
import { de } from "date-fns/locale";
import { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchWithTimeout } from "@/lib/utils/fetchUtils";
import { Spinner } from "@/components/Spinner";
import { resetSchedule } from "@/lib/services/scheduleService";

interface ScheduleControlsProps {
  score: string | null;
  solving: boolean;
  loading: boolean;
  onRefresh: () => void;
  onSolve: () => void;
  onStopSolving: () => void;
  selectedView: string;
  onViewChange: (view: string) => void;
  workCalendarFromDate: string | null;
  workCalendarToDate: string | null;
}

export function ScheduleControls({
  score,
  solving,
  loading,
  onRefresh,
  onSolve,
  onStopSolving,
  selectedView,
  onViewChange,
  workCalendarFromDate,
  workCalendarToDate,
}: ScheduleControlsProps) {
  const [nightshift, setNightshift] = useState<boolean>(false);
  const [savingNightshift, setSavingNightshift] = useState<boolean>(false);

  // Formatting helper
  let timeframeLabel = null;
  if (workCalendarFromDate && workCalendarToDate) {
    try {
      const from = format(parseISO(workCalendarFromDate), "dd.MM.yyyy", { locale: de });
      const to = format(parseISO(workCalendarToDate), "dd.MM.yyyy", { locale: de });
      timeframeLabel = `Zeitraum: ${from} – ${to}`;
    } catch (e) {
      // fallback in case of parse error
      timeframeLabel = `Zeitraum: ${workCalendarFromDate} – ${workCalendarToDate}`;
    }
  } else {
    timeframeLabel = "Zeitraum: —";
  }

  const handleSaveNightshift = async () => {
    setSavingNightshift(true);
    try {
      await fetchWithTimeout('/api/schedule/setNightshift', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(nightshift)
      });
      
      // Reset the schedule after saving nightshift settings
      await resetSchedule();
      
      toast.success("Nachtschicht-Einstellung erfolgreich gespeichert");
      
      // Refresh the schedule data
      onRefresh();
    } catch (error) {
      console.error("Error saving nightshift setting:", error);
      toast.error("Fehler beim Speichern der Nachtschicht-Einstellung");
    } finally {
      setSavingNightshift(false);
    }
  };

  return (
    <Card className="p-4 mb-6 space-y-4">
      <TimeframeSelector onTimeframeSet={onRefresh} />
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={onRefresh}
            disabled={loading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Reload
          </Button>
          
          {solving ? (
            <Button 
              variant="destructive" 
              onClick={onStopSolving}
              disabled={loading}
            >
              <Square className="h-4 w-4 mr-2" />
              Berechnung stoppen
            </Button>
          ) : (
            <Button 
              variant="default" 
              onClick={onSolve}
              disabled={loading}
            >
              <Play className="h-4 w-4 mr-2" />
              Berechnen
            </Button>
          )}
          
          <Button
            variant="outline"
            onClick={() => {
              try {
                exportToExcel();
                toast.success("Timeline erfolgreich exportiert");
              } catch (error) {
                toast.error("Fehler beim Exportieren der Timeline");
              }
            }}
            disabled={loading}
          >
            <Download className="h-4 w-4 mr-2" />
            Exportieren
          </Button>
          
          {loading ? (
            <Skeleton className="h-9 w-32" />
          ) : (
            <div className="flex items-center px-4 font-semibold">
              Score: {score || "?"}
            </div>
          )}
        </div>
        
        <Tabs value={selectedView} onValueChange={onViewChange} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="byLine">Produktionslinienansicht</TabsTrigger>
            <TabsTrigger value="byJob">Jobansicht</TabsTrigger>
            <TabsTrigger value="leergut">Leergut-Ansicht</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-row justify-between items-center border-t pt-4">
        <div className="flex items-center gap-2">
          <CalendarRange className="h-4 w-4 text-muted-foreground" />
          <span className="text-muted-foreground text-sm">{timeframeLabel}</span>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="nightshift" 
              checked={nightshift} 
              onCheckedChange={(checked) => setNightshift(checked === true)}
            />
            <label
              htmlFor="nightshift"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Nachtschicht aktivieren
            </label>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={handleSaveNightshift}
            disabled={savingNightshift}
          >
            {savingNightshift ? (
              <span className="flex items-center">
                <Spinner size="sm" className="mr-2" />Speichern...
              </span>
            ) : (
              "übernehmen"
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
}
