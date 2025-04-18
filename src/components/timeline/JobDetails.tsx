
import { Job } from "@/lib/types";
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangleIcon, CheckIcon, ClockIcon, CalendarIcon } from "lucide-react";

interface JobDetailsProps {
  job: Job | null;
}

export function JobDetails({ job }: JobDetailsProps) {
  if (!job) return null;

  const formatDuration = (durationInSeconds: number) => {
    const hours = Math.floor(durationInSeconds / 3600);
    const minutes = Math.floor((durationInSeconds % 3600) / 60);
    return `${hours} h ${minutes} min`;
  };

  const isBeforeReady = job?.startProductionDateTime && 
    new Date(job.startProductionDateTime) < new Date(job.readyDateTime);
    
  const isAfterDue = job?.endDateTime && 
    new Date(job.endDateTime) > new Date(job.dueDateTime);

  return (
    <Card className="w-full border">
      <CardHeader className="pb-3">
        <CardTitle>Job Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-1">
          <h3 className="font-medium text-lg mb-2">{job.name}</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              {job.product && (
                <p className="flex items-center">
                  <span className="text-muted-foreground mr-1">Produkt:</span>
                  <span>{job.product.name}</span>
                </p>
              )}
              
              {job.line && (
                <p className="flex items-center">
                  <span className="text-muted-foreground mr-1">Linie:</span>
                  <span>{job.line.name}</span>
                </p>
              )}

              {job.product && (
                <p className="flex items-center">
                  <span className="text-muted-foreground mr-1">Kompatible Maschinentypen:</span>
                  <span>{job.product.compatibleMachines.join(', ')}</span>
                </p>
              )}
              
              <p className="flex items-center">
                <ClockIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground mr-1">Produktionsdauer:</span>
                <span>{formatDuration(job.duration)}</span>
              </p>
            </div>

            <div className="space-y-2">
              <p className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground mr-1">Bereit ab:</span>
                <span>{format(parseISO(job.readyDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
              </p>
              
              <p className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground mr-1">Ideales Enddatum:</span>
                <span>{format(parseISO(job.idealEndDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
              </p>
              
              <p className="flex items-center">
                <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-muted-foreground mr-1">Fälligkeitsdatum:</span>
                <span>{format(parseISO(job.dueDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
              </p>

              {job.startProductionDateTime && (
                <p className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">Produktionsstart:</span>
                  <span>{format(parseISO(job.startProductionDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                </p>
              )}

              {job.endDateTime && (
                <p className="flex items-center">
                  <CalendarIcon className="h-4 w-4 mr-1 text-muted-foreground" />
                  <span className="text-muted-foreground mr-1">Produktionsende:</span>
                  <span>{format(parseISO(job.endDateTime), 'dd.MM.yyyy HH:mm', { locale: de })}</span>
                </p>
              )}
            </div>
          </div>

          <div className="mt-4 space-x-1">
            {isBeforeReady && (
              <span className="inline-flex items-center text-xs bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 rounded-full px-2 py-0.5">
                <AlertTriangleIcon className="h-3 w-3 mr-1" />
                Zu früh gestartet
              </span>
            )}
            {isAfterDue && (
              <span className="inline-flex items-center text-xs bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200 rounded-full px-2 py-0.5">
                <AlertTriangleIcon className="h-3 w-3 mr-1" />
                Zu spät beendet
              </span>
            )}
            {!isBeforeReady && !isAfterDue && job.endDateTime && (
              <span className="inline-flex items-center text-xs bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200 rounded-full px-2 py-0.5">
                <CheckIcon className="h-3 w-3 mr-1" />
                Optimal geplant
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
