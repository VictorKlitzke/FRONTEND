import {
  CircleAlertIcon,
  BanIcon,
  CircleCheckIcon,
  InfoIcon,
  X,
} from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { useAlert } from "../hooks/use-alert";
import { cn } from "../lib/utils";
import { useEffect } from "react";

const alertStyles = {
  success: {
    border: "border-green-500/30",
    bg: "bg-green-500/10",
    iconBg: "bg-green-500/20",
    icon: CircleCheckIcon,
  },
  warning: {
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/10",
    iconBg: "bg-yellow-500/20",
    icon: CircleAlertIcon,
  },
  destructive: {
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    iconBg: "bg-red-500/20",
    icon: BanIcon,
  },
  error: {
    border: "border-red-500/30",
    bg: "bg-red-500/10",
    iconBg: "bg-red-500/20",
    icon: BanIcon,
  },
  default: {
    border: "border-blue-500/30",
    bg: "bg-blue-500/10",
    iconBg: "bg-blue-500/20",
    icon: InfoIcon,
  },
};

export const AppAlert = () => {
  const { open, title, message, type, closeAlert } = useAlert();

  useEffect(() => {
    if (!open) return;
    const timer = window.setTimeout(() => {
      closeAlert();
    }, 3500);
    return () => window.clearTimeout(timer);
  }, [open, closeAlert]);

  if (!open) return null;

  const config = alertStyles[type ?? "default"] ?? alertStyles.default;
  const Icon = config.icon;

  return (
    <div className="fixed top-6 right-6 z-100 max-w-sm animate-in slide-in-from-top-2 fade-in duration-300">
      <Alert
        className={cn(
          "relative flex items-start gap-4 shadow-xl backdrop-blur-md p-4",
          config.border,
          config.bg
        )}
      >
        <button
          type="button"
          onClick={closeAlert}
          className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          aria-label="Fechar alerta"
        >
          <X className="h-4 w-4" />
        </button>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full ring-1 ring-white/20",
            config.iconBg
          )}
        >
          <Icon className="h-5 w-5" />
        </div>

        <div className="flex flex-col gap-1 pr-6">
          <AlertTitle className="text-sm font-semibold">
            {title}
          </AlertTitle>
          <AlertDescription className="text-sm text-muted-foreground">
            {message}
          </AlertDescription>
        </div>
      </Alert>
    </div>
  );
};
