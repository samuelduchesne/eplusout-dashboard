import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { mdToHtml } from '@/lib/formatting';

interface ChangelogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ChangelogDialog({ open, onOpenChange }: ChangelogDialogProps) {
  const [html, setHtml] = useState('');

  useEffect(() => {
    if (!open) return;
    fetch('./CHANGELOG.md')
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error('Not found'))))
      .then((md) => setHtml(mdToHtml(md)))
      .catch(() => setHtml('<p class="text-muted-foreground">Changelog not available.</p>'));
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[640px] max-h-[70vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Changelog</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-1 pr-4">
          <div className="text-xs leading-relaxed" dangerouslySetInnerHTML={{ __html: html }} />
        </ScrollArea>
        <div className="text-[10px] text-muted-foreground text-right pt-2 border-t">
          Press Esc to close
        </div>
      </DialogContent>
    </Dialog>
  );
}
