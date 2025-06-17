
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface DateFilterControlsProps {
  startDate: Date | undefined;
  endDate: Date | undefined;
  onStartDateChange: (date: Date | undefined) => void;
  onEndDateChange: (date: Date | undefined) => void;
}

export function DateFilterControls({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateFilterControlsProps) {
  const handleClearFilters = () => {
    onStartDateChange(undefined);
    onEndDateChange(undefined);
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        <div className="flex flex-col sm:flex-row gap-4 flex-1">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Startdatum</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "dd.MM.yyyy") : <span>Datum wählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={onStartDateChange}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Enddatum</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[240px] justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "dd.MM.yyyy") : <span>Datum wählen</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={onEndDateChange}
                  initialFocus
                  disabled={(date) => startDate ? date < startDate : false}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClearFilters}
            disabled={!startDate && !endDate}
            className="whitespace-nowrap"
          >
            Filter zurücksetzen
          </Button>
        </div>
      </div>

      {startDate && endDate && (
        <div className="mt-3 text-sm text-muted-foreground">
          Gefiltert von {format(startDate, "dd.MM.yyyy")} bis {format(endDate, "dd.MM.yyyy")}
        </div>
      )}
    </Card>
  );
}
