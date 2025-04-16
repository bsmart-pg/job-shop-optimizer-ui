
import { useState } from "react";
import { JobShopHeader } from "@/components/JobShopHeader";
import { FileUpload } from "@/components/FileUpload";
import { ScheduleControls } from "@/components/ScheduleControls";
import { TimelineView } from "@/components/TimelineView";
import { UnassignedJobs } from "@/components/UnassignedJobs";
import { TimeframeForm } from "@/components/TimeframeForm";
import { useSchedule } from "@/hooks/use-schedule";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Spinner } from "@/components/Spinner";

const Index = () => {
  const {
    schedule,
    loading,
    error,
    solving,
    refreshSchedule,
    startSolving,
    stopSolving,
    resetSchedule
  } = useSchedule();
  const [selectedView, setSelectedView] = useState<string>("byLine");

  const handleUploadSuccess = () => {
    resetSchedule();
    refreshSchedule();
  };

  return (
    <div className="container py-6">
      <JobShopHeader />
      
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      
      <TimeframeForm onSubmitSuccess={handleUploadSuccess} />
      
      {error && (
        <Alert variant="destructive" className="my-6">
          <ExclamationTriangleIcon className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {loading && !schedule ? (
        <div className="space-y-6 mt-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-[500px] w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : schedule ? (
        <>
          <div className="mt-6">
            <ScheduleControls 
              score={schedule.score}
              solving={solving}
              loading={loading}
              onRefresh={refreshSchedule}
              onSolve={startSolving}
              onStopSolving={stopSolving}
              selectedView={selectedView}
              onViewChange={setSelectedView}
            />
            
            {solving ? (
              <div className="card-loading-container">
                <div className="flex flex-col items-center justify-center h-[500px] w-full border rounded-lg bg-card">
                  <Spinner size="lg" />
                  <p className="mt-4 text-muted-foreground">Optimizing schedule...</p>
                </div>
              </div>
            ) : (
              <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
                <TabsContent value="byLine" className="mt-0">
                  <TimelineView 
                    lines={schedule.lines} 
                    jobs={schedule.jobs} 
                    view="byLine"
                    workCalendarFromDate={schedule.workCalendar.fromDate}
                    loading={false}
                  />
                </TabsContent>
                <TabsContent value="byJob" className="mt-0">
                  <TimelineView 
                    lines={schedule.lines} 
                    jobs={schedule.jobs} 
                    view="byJob"
                    workCalendarFromDate={schedule.workCalendar.fromDate}
                    loading={false}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
          
          {!solving && <UnassignedJobs jobs={schedule.jobs} />}
        </>
      ) : null}
    </div>
  );
};

export default Index;
