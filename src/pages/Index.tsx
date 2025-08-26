
import { useState, useMemo } from "react";
import { JobShopHeader } from "@/components/JobShopHeader";
import { FileUpload } from "@/components/FileUpload";
import { ScheduleControls } from "@/components/ScheduleControls";
import { TimelineView } from "@/components/TimelineView";
import { UnassignedJobs } from "@/components/UnassignedJobs";
import { useSchedule } from "@/hooks/use-schedule";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ExclamationTriangleIcon } from "@radix-ui/react-icons";
import { Spinner } from "@/components/Spinner";
import { ExcludedJobs } from "@/components/ExcludedJobs";
import { OnTimeRate } from "@/components/OnTimeRate";
import { DelayedJobs } from "@/components/DelayedJobs";
import { StockDoneJobs } from "@/components/StockDoneJobs";
import { PartiallyStockDoneJobs } from "@/components/PartiallyStockDoneJobs";
import { UnfulfillableJobs } from "@/components/UnfulfillableJobs";
import { LeergutView } from "@/components/LeergutView";
import { LineConfiguration } from "@/components/LineConfiguration";

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
  const [selectedJob, setSelectedJob] = useState<any>(null);

  // Memoize processed data to prevent unnecessary recalculations
  const memoizedJobs = useMemo(() => schedule?.jobs || [], [schedule?.jobs]);
  const memoizedLines = useMemo(() => schedule?.lines || [], [schedule?.lines]);
  const memoizedStockDoneJobs = useMemo(() => schedule?.stockDoneJobs || [], [schedule?.stockDoneJobs]);
  const memoizedPartiallyStockDoneJobs = useMemo(() => schedule?.partiallyStockDoneJobs || [], [schedule?.partiallyStockDoneJobs]);
  const memoizedExcludedJobs = useMemo(() => schedule?.excludedJobs || [], [schedule?.excludedJobs]);
  const memoizedUnfulfillableJobs = useMemo(() => schedule?.unfulfillableJobs || [], [schedule?.unfulfillableJobs]);

  const handleUploadSuccess = () => {
    resetSchedule();
    refreshSchedule();
  };

  const workCalendarFromDate = schedule?.workCalendar?.fromDate || null;
  const workCalendarToDate = schedule?.workCalendar?.toDate || null;

  return (
    <div className="container py-6">
      <JobShopHeader />
      
      <FileUpload onUploadSuccess={handleUploadSuccess} />
      
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
          {/* Line Configuration - only show when not solving */}
          {!solving && memoizedLines.length > 0 && (
            <LineConfiguration 
              lines={memoizedLines} 
              onConfigurationSaved={refreshSchedule}
            />
          )}

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
              workCalendarFromDate={workCalendarFromDate}
              workCalendarToDate={workCalendarToDate}
              lines={memoizedLines}
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
                    lines={memoizedLines} 
                    jobs={memoizedJobs} 
                    view="byLine"
                    workCalendarFromDate={schedule.workCalendar.fromDate}
                    loading={false}
                  />
                </TabsContent>
                <TabsContent value="byJob" className="mt-0">
                  <TimelineView 
                    lines={memoizedLines} 
                    jobs={memoizedJobs} 
                    view="byJob"
                    workCalendarFromDate={schedule.workCalendar.fromDate}
                    loading={false}
                  />
                </TabsContent>
                <TabsContent value="leergut" className="mt-0">
                  <LeergutView jobs={memoizedJobs} />
                </TabsContent>
              </Tabs>
            )}
          </div>
          
          {!solving && selectedView !== "leergut" && (
            <>
              {selectedJob && (
                <div className="mt-6">
                  <p className="text-lg font-semibold">Selected Job: {selectedJob.name}</p>
                  <p className="mt-2 text-muted-foreground">Job ID: {selectedJob.id}</p>
                </div>
              )}
              
              <OnTimeRate jobs={memoizedJobs} />
              <DelayedJobs jobs={memoizedJobs} />
              <StockDoneJobs jobs={memoizedStockDoneJobs} />
              <PartiallyStockDoneJobs jobs={memoizedPartiallyStockDoneJobs} />
              <UnassignedJobs jobs={memoizedJobs} />
              <ExcludedJobs 
                jobs={memoizedExcludedJobs} 
                onJobsUpdated={refreshSchedule} 
              />
              <UnfulfillableJobs jobs={memoizedUnfulfillableJobs} />
            </>
          )}
        </>
      ) : null}
    </div>
  );
};

export default Index;
