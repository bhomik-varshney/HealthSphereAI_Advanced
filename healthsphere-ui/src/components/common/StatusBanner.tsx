import { AlertTriangle, X, Info, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type BannerType = "error" | "warning" | "info" | "success";

interface ErrorBannerProps {
  type?: BannerType;
  title?: string;
  message: string;
  details?: string;
  onDismiss?: () => void;
  className?: string;
}

const bannerConfig = {
  error: {
    icon: AlertTriangle,
    bgClass: "bg-destructive/10 border-destructive/20",
    iconClass: "text-destructive",
    titleClass: "text-destructive",
  },
  warning: {
    icon: AlertTriangle,
    bgClass: "bg-warning/10 border-warning/20",
    iconClass: "text-warning",
    titleClass: "text-warning-foreground",
  },
  info: {
    icon: Info,
    bgClass: "bg-primary/10 border-primary/20",
    iconClass: "text-primary",
    titleClass: "text-primary",
  },
  success: {
    icon: CheckCircle,
    bgClass: "bg-success/10 border-success/20",
    iconClass: "text-success",
    titleClass: "text-success",
  },
};

export function StatusBanner({
  type = "error",
  title,
  message,
  details,
  onDismiss,
  className,
}: ErrorBannerProps) {
  const config = bannerConfig[type];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative rounded-lg border p-4 fade-in",
        config.bgClass,
        className
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("mt-0.5 h-5 w-5 flex-shrink-0", config.iconClass)} />
        <div className="flex-1 space-y-1">
          {title && (
            <h4 className={cn("font-medium", config.titleClass)}>{title}</h4>
          )}
          <p className="text-sm text-foreground/80">{message}</p>
          {details && (
            <details className="mt-2">
              <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
                View technical details
              </summary>
              <pre className="mt-2 overflow-x-auto rounded bg-secondary/50 p-2 text-xs">
                {details}
              </pre>
            </details>
          )}
        </div>
        {onDismiss && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onDismiss}
            className="h-6 w-6 flex-shrink-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
