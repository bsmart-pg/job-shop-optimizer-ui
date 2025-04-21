
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
          </TabsList>
        </Tabs>
      </div>
      <div className="flex items-center gap-2 pt-2">
        <CalendarRange className="h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground text-sm">{timeframeLabel}</span>
      </div>
    </Card>
  );
}
