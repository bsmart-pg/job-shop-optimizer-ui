
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadFiles } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, FileCheck, Upload, X, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [masterDataFile, setMasterDataFile] = useState<File | null>(null);
  const [callOffsFile, setCallOffsFile] = useState<File | null>(null);
  const [initialSetupFile, setInitialSetupFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setFile: (file: File | null) => void) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      // Check if file is Excel format
      if (!file.name.toLowerCase().endsWith('.xlsx')) {
        setError('Bitte nur Excel-Dateien (.xlsx) hochladen');
        setFile(null);
        return;
      }
      setFile(file);
      setError(null);
    }
  };

  const clearFile = (setFile: (file: File | null) => void) => {
    setFile(null);
  };

  const handleUpload = async () => {
    // Check if all files are selected
    if (!masterDataFile || !callOffsFile || !initialSetupFile) {
      setError('Bitte wählen Sie alle drei Dateien aus');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      // Create new File objects with the required names
      const renamedMasterData = new File([masterDataFile], "masterdata.xlsx", { type: masterDataFile.type });
      const renamedCallOffs = new File([callOffsFile], "calloffs.xlsx", { type: callOffsFile.type });
      const renamedInitialSetup = new File([initialSetupFile], "initial_setup.xlsx", { type: initialSetupFile.type });
      
      await uploadFiles([renamedMasterData, renamedCallOffs, renamedInitialSetup]);
      
      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });
      
      // Reset state
      setMasterDataFile(null);
      setCallOffsFile(null);
      setInitialSetupFile(null);
      onUploadSuccess();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to upload files",
        variant: "destructive"
      });
    } finally {
      setUploading(false);
    }
  };

  const renderFileInput = (
    label: string, 
    description: string,
    file: File | null, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
    onClear: () => void
  ) => (
    <div className="mb-4">
      <label className="text-sm font-medium mb-2 block">{label}</label>
      <p className="text-xs text-muted-foreground mb-2">{description}</p>
      {file ? (
        <div className="flex items-center justify-between bg-muted/40 p-3 rounded-md">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-green-600" />
            <span className="text-sm truncate">{file.name}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClear}
            disabled={uploading}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            type="file"
            accept=".xlsx"
            onChange={onChange}
            disabled={uploading}
            className="cursor-pointer"
          />
        </div>
      )}
    </div>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datei-Upload</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {renderFileInput(
          "Master Daten", 
          "Stammdaten für die Produktion",
          masterDataFile, 
          (e) => handleFileChange(e, setMasterDataFile), 
          () => clearFile(setMasterDataFile)
        )}
        
        {renderFileInput(
          "Call-Off Daten", 
          "Abrufdaten für die Produktion",
          callOffsFile, 
          (e) => handleFileChange(e, setCallOffsFile), 
          () => clearFile(setCallOffsFile)
        )}
        
        {renderFileInput(
          "Initial Setup", 
          "Initiale Konfigurationsdaten",
          initialSetupFile, 
          (e) => handleFileChange(e, setInitialSetupFile), 
          () => clearFile(setInitialSetupFile)
        )}

        <div className="flex justify-end mt-6">
          <Button 
            onClick={handleUpload} 
            disabled={!masterDataFile || !callOffsFile || !initialSetupFile || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Alle Dateien hochladen
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
