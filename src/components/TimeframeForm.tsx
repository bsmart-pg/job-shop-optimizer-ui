
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { setTimeframe } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { CalendarIcon } from "lucide-react";
import { z } from "zod";

const dateSchema = z.string().regex(/^\d{2}\.\d{2}\.\d{4}$/, "Date must be in DD.MM.YYYY format");

interface TimeframeFormProps {
  onSubmitSuccess?: () => void;
}

export function TimeframeForm({ onSubmitSuccess }: TimeframeFormProps) {
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    startDate?: string;
    endDate?: string;
    general?: string;
  }>({});
  
  const { toast } = useToast();

  const validateDate = (date: string): boolean => {
    try {
      dateSchema.parse(date);
      return true;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Reset validation errors
    setValidationErrors({});
    
    // Validate dates
    const errors: {
      startDate?: string;
      endDate?: string;
    } = {};
    
    if (!validateDate(startDate)) {
      errors.startDate = "Start date must be in DD.MM.YYYY format";
    }
    
    if (!validateDate(endDate)) {
      errors.endDate = "End date must be in DD.MM.YYYY format";
    }
    
    // If there are validation errors, display them and don't submit
    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await setTimeframe(startDate, endDate);
      
      toast({
        title: "Success",
        description: "Timeframe has been updated",
      });
      
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error) {
      console.error("Error setting timeframe:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to set timeframe",
        variant: "destructive",
      });
      
      setValidationErrors({
        general: error instanceof Error ? error.message : "Failed to set timeframe"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full mb-6">
      <CardHeader className="pb-3">
        <CardTitle>Zeitraum angeben</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="startDate" className="text-sm font-medium">
              Startdatum (DD.MM.YYYY)
            </label>
            <div className="relative">
              <Input
                id="startDate"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="DD.MM.YYYY"
                className={validationErrors.startDate ? "border-red-500" : ""}
              />
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            {validationErrors.startDate && (
              <p className="text-sm text-red-500">{validationErrors.startDate}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <label htmlFor="endDate" className="text-sm font-medium">
              Enddatum (DD.MM.YYYY)
            </label>
            <div className="relative">
              <Input
                id="endDate"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="DD.MM.YYYY"
                className={validationErrors.endDate ? "border-red-500" : ""}
              />
              <CalendarIcon className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            </div>
            {validationErrors.endDate && (
              <p className="text-sm text-red-500">{validationErrors.endDate}</p>
            )}
          </div>
          
          <div className="col-span-1 md:col-span-2">
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="w-full md:w-auto"
            >
              {isSubmitting ? "setzen des Zeitraums..." : "Zeitraum setzen"}
            </Button>
            
            {validationErrors.general && (
              <p className="mt-2 text-sm text-red-500">{validationErrors.general}</p>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
