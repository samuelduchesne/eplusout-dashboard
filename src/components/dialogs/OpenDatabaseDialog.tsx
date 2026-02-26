import { useCallback, useRef, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Upload } from 'lucide-react';

interface OpenDatabaseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFileSelect: (file: File) => void;
  onLoadSample: () => void;
}

export function OpenDatabaseDialog({
  open,
  onOpenChange,
  onFileSelect,
  onLoadSample,
}: OpenDatabaseDialogProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
        onOpenChange(false);
      }
    },
    [onFileSelect, onOpenChange],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        onFileSelect(file);
        onOpenChange(false);
      }
    },
    [onFileSelect, onOpenChange],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[56rem] aspect-square max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Open eplusout.sql</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          <div
            className={`flex-1 min-h-[12rem] border-2 border-dashed rounded-lg transition-colors cursor-pointer
              ${dragActive ? 'border-primary bg-primary/5' : 'border-border bg-secondary/40'}
            `}
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
              <Upload className="h-10 w-10 text-muted-foreground" />
              <div className="text-sm font-medium">Drag &amp; drop your eplusout.sql here</div>
              <div className="text-xs text-muted-foreground">or click to choose a file</div>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept=".sql,.sqlite,.db"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Accepted: .sql, .sqlite, .db</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onLoadSample();
                onOpenChange(false);
              }}
            >
              Load Sample
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
