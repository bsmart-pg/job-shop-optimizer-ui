import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { uploadFiles } from '@/lib/api';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, Upload, X, FileCheck } from 'lucide-react';

interface FileUploadProps {
  onUploadSuccess: () => void;
}

export function FileUpload({ onUploadSuccess }: FileUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Only keep up to 2 files (as per the original implementation)
    const newFiles = [...files, ...acceptedFiles].slice(0, 2);
    setFiles(newFiles);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    maxFiles: 2
  });

  const handleUpload = async () => {
    if (files.length === 0) {
      toast({
        title: "Error",
        description: "Please select at least one file to upload",
        variant: "destructive"
      });
      return;
    }

    setUploading(true);
    try {
      await uploadFiles(files);
      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });
      setFiles([]);
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

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Datei-Upload</CardTitle>
      </CardHeader>
      <CardContent>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-md p-6 cursor-pointer mb-4 ${
            isDragActive ? 'border-primary bg-primary/5' : 'border-border'
          }`}
        >
          <input {...getInputProps()} />
          <div className="flex flex-col items-center justify-center gap-2 text-center">
            <Upload className="h-10 w-10 text-muted-foreground" />
            {isDragActive ? (
              <p>Dateien hier ablegen...</p>
            ) : (
              <>
                <p className="text-sm font-medium">Dateien hierher ziehen oder klicken zum Auswählen</p>
                <p className="text-xs text-muted-foreground">Maximal 2 Dateien</p>
              </>
            )}
          </div>
        </div>

        {files.length > 0 && (
          <div className="space-y-2 my-4">
            {files.map((file, index) => (
              <div key={index} className="flex items-center justify-between bg-muted/40 p-2 rounded-md">
                <div className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5 text-green-600" />
                  <span className="text-sm truncate">{file.name}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => removeFile(index)}
                  disabled={uploading}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end mt-4">
          <Button 
            onClick={handleUpload} 
            disabled={files.length === 0 || uploading}
          >
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : (
              'Hochladen'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
