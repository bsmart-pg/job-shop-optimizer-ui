
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Line } from "@/lib/types";
import { useState, useEffect } from "react";
import { toast } from "@/components/ui/sonner";
import { fetchWithTimeout } from "@/lib/utils/fetchUtils";
import { Spinner } from "@/components/Spinner";

interface LineConfigurationProps {
  lines: Line[];
  onConfigurationSaved: () => void;
}

interface LineConfig {
  lineId: string;
  activateNightshift: boolean;
  lineAvailable: boolean;
}

export function LineConfiguration({ lines, onConfigurationSaved }: LineConfigurationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [configurations, setConfigurations] = useState<LineConfig[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);

  // Load current line configuration when component mounts or lines change
  useEffect(() => {
    const loadLineConfiguration = async () => {
      if (lines.length === 0) return;
      
      setLoading(true);
      try {
        const response = await fetchWithTimeout('/api/schedule/getLineConfig');
        const data = await response.json();
        
        // Map the response to our configuration format
        const loadedConfigs = lines.map(line => {
          const savedConfig = data.find((config: any) => config.id === line.id);
          return {
            lineId: line.id,
            activateNightshift: savedConfig?.activateNightshift === true,
            lineAvailable: savedConfig?.lineAvailable !== undefined ? savedConfig.lineAvailable : true
          };
        });
        
        setConfigurations(loadedConfigs);
      } catch (error) {
        console.error("Error loading line configuration:", error);
        // Fallback to default values if loading fails
        const defaultConfigs = lines.map(line => ({
          lineId: line.id,
          activateNightshift: false,
          lineAvailable: line.lineAvailable !== undefined ? line.lineAvailable : true
        }));
        setConfigurations(defaultConfigs);
      } finally {
        setLoading(false);
      }
    };

    loadLineConfiguration();
  }, [lines]);

  const updateConfiguration = (lineId: string, field: keyof Omit<LineConfig, 'lineId'>, value: boolean) => {
    setConfigurations(prev => 
      prev.map(config => 
        config.lineId === lineId 
          ? { ...config, [field]: value }
          : config
      )
    );
  };

  const handleSaveConfiguration = async () => {
    setSaving(true);
    try {
      const requestBody = configurations.map(config => ({
        id: config.lineId,
        activateNightshift: config.activateNightshift,
        lineAvailable: config.lineAvailable
      }));

      await fetchWithTimeout('/api/schedule/setLineConfig', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });
      
      toast.success("Linien-Konfiguration erfolgreich gespeichert");
      onConfigurationSaved();
    } catch (error) {
      console.error("Error saving line configuration:", error);
      toast.error("Fehler beim Speichern der Linien-Konfiguration");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Linien-Konfiguration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Spinner size="sm" className="mr-2" />
            <span>Lade Konfiguration...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-6">
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <CardTitle>Linien-Konfiguration</CardTitle>
              {isOpen ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {lines.map(line => {
                  const config = configurations.find(c => c.lineId === line.id);
                  if (!config) return null;

                  return (
                    <div key={line.id} className="border rounded-lg p-4 space-y-3">
                      <h4 className="font-semibold text-sm">{line.name}</h4>
                      <p className="text-xs text-muted-foreground">{line.machineTypeDisplayName}</p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`nightshift-${line.id}`}
                            checked={config.activateNightshift}
                            onCheckedChange={(checked) => 
                              updateConfiguration(line.id, 'activateNightshift', checked === true)
                            }
                          />
                          <label
                            htmlFor={`nightshift-${line.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Nachtschicht aktivieren
                          </label>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id={`available-${line.id}`}
                            checked={config.lineAvailable}
                            onCheckedChange={(checked) => 
                              updateConfiguration(line.id, 'lineAvailable', checked === true)
                            }
                          />
                          <label
                            htmlFor={`available-${line.id}`}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            Linie verfügbar
                          </label>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={handleSaveConfiguration}
                  disabled={saving}
                >
                  {saving ? (
                    <span className="flex items-center">
                      <Spinner size="sm" className="mr-2" />
                      Speichern...
                    </span>
                  ) : (
                    "Konfiguration speichern"
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
