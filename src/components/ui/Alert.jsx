// src/components/ui/Alert.jsx
import React from "react";
import { cn } from "@/utils/classNames";

const Alert = React.forwardRef(
  ({ className, variant = "default", ...props }, ref) => {
    const classes = cn(
      "relative w-full rounded-lg border px-4 py-3 text-sm",
      "[&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7",
      variant === "destructive" &&
        "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
      className,
    );

    return <div ref={ref} role="alert" className={classes} {...props} />;
  },
);

Alert.displayName = "Alert";

const AlertTitle = React.forwardRef(({ className, ...props }, ref) => (
  <h5
    ref={ref}
    className={cn("mb-1 font-medium leading-none tracking-tight", className)}
    {...props}
  />
));

AlertTitle.displayName = "AlertTitle";

const AlertDescription = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("text-sm [&_p]:leading-relaxed", className)}
    {...props}
  />
));

AlertDescription.displayName = "AlertDescription";

export { Alert, AlertTitle, AlertDescription };
