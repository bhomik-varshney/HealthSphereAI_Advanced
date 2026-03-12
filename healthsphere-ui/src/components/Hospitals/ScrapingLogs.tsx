import { ChevronDown, ChevronUp, Terminal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScrapingLog {
  id: string;
  message: string;
  timestamp: Date;
  type: "info" | "success" | "warning" | "error";
}

interface ScrapingLogsProps {
  logs: ScrapingLog[];
  isActive?: boolean;
}

export function ScrapingLogs({ logs, isActive }: ScrapingLogsProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getLogColor = (type: ScrapingLog["type"]) => {
    switch (type) {
      case "success":
        return "text-success";
      case "warning":
        return "text-warning";
      case "error":
        return "text-destructive";
      default:
        return "text-muted-foreground";
    }
  };

  return (
    <div className="rounded-lg border bg-card">
      <Button
        variant="ghost"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4" />
          <span className="font-medium">Scraping Details</span>
          {isActive && (
            <span className="flex items-center gap-1 text-xs text-primary">
              <span className="h-2 w-2 animate-pulse rounded-full bg-primary" />
              Active
            </span>
          )}
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </Button>

      {isExpanded && (
        <div className="max-h-48 overflow-y-auto border-t bg-secondary/30 p-3 font-mono text-xs">
          {logs.length === 0 ? (
            <p className="text-muted-foreground">No logs yet. Start a search to see progress.</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log) => (
                <div key={log.id} className="flex gap-2">
                  <span className="flex-shrink-0 text-muted-foreground">
                    [{log.timestamp.toLocaleTimeString()}]
                  </span>
                  <span className={cn(getLogColor(log.type))}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export type { ScrapingLog };
