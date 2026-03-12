import { useCallback, useState } from "react";
import { Upload, X, FileText, Image as ImageIcon, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FileUploadProps {
  accept?: string;
  maxSize?: number; // in MB
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
  selectedFile?: File | null;
  status?: "idle" | "processing" | "complete" | "error";
  className?: string;
}

export function FileUpload({
  accept = ".pdf,image/*",
  maxSize = 10,
  onFileSelect,
  onRemove,
  selectedFile,
  status = "idle",
  className,
}: FileUploadProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      // Validate file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File size must be less than ${maxSize}MB`);
        return;
      }

      onFileSelect(file);
    },
    [maxSize, onFileSelect]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        handleFile(e.dataTransfer.files[0]);
      }
    },
    [handleFile]
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        handleFile(e.target.files[0]);
      }
    },
    [handleFile]
  );

  const getFileIcon = (file: File) => {
    if (file.type.startsWith("image/")) {
      return <ImageIcon className="h-5 w-5 text-primary" />;
    }
    return <FileText className="h-5 w-5 text-primary" />;
  };

  const getStatusBadge = () => {
    switch (status) {
      case "processing":
        return (
          <span className="medical-badge animate-pulse">
            Processing...
          </span>
        );
      case "complete":
        return (
          <span className="medical-badge bg-success/10 text-success">
            <CheckCircle className="h-3 w-3" />
            Analysis complete
          </span>
        );
      case "error":
        return (
          <span className="medical-badge bg-destructive/10 text-destructive">
            Error occurred
          </span>
        );
      default:
        return null;
    }
  };

  if (selectedFile) {
    return (
      <div className={cn("space-y-3", className)}>
        <div className="flex items-center gap-3 rounded-lg border bg-secondary/30 p-3">
          {getFileIcon(selectedFile)}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
          {getStatusBadge()}
          {onRemove && status !== "processing" && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onRemove}
              className="h-8 w-8 flex-shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={cn(
          "relative flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-all",
          dragActive
            ? "border-primary bg-primary/5"
            : "border-muted-foreground/25 hover:border-primary/50 hover:bg-secondary/30",
          error && "border-destructive"
        )}
      >
        <input
          type="file"
          accept={accept}
          onChange={handleChange}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <Upload
          className={cn(
            "mb-2 h-8 w-8",
            dragActive ? "text-primary" : "text-muted-foreground"
          )}
        />
        <p className="text-sm font-medium">
          {dragActive ? "Drop file here" : "Drag & drop or click to upload"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          PDF or images up to {maxSize}MB
        </p>
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
