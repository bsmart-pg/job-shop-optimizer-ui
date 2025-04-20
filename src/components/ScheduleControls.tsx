
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { RefreshCw, Play, Square } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { TimeframeSelector } from "@/components/TimeframeSelector";

interface ScheduleControlsProps {
  score: string | null;
  solving: boolean;
  loading: boolean;
  onRefresh: () => void;
  onSolve: () => void;
  onStopSolving: () => void;
  selectedView: string;
  onViewChange: (view: string) => void;
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
}: ScheduleControlsProps) {
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
            Neu laden
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
    </Card>
  );
}
