import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: "primary" | "secondary" | "white";
}

const LoadingSpinner = React.forwardRef<HTMLDivElement, LoadingSpinnerProps>(
  ({ className, size = "md", color = "primary", ...props }, ref) => {
    const sizeClasses = {
      sm: "w-4 h-4",
      md: "w-6 h-6",
      lg: "w-8 h-8",
    };

    const colorClasses = {
      primary: "border-blue-500",
      secondary: "border-gray-500",
      white: "border-white",
    };

    return (
      <div
        ref={ref}
        className={cn(
          "animate-spin rounded-full border-2 border-t-transparent",
          sizeClasses[size],
          colorClasses[color],
          className,
        )}
        {...props}
      />
    );
  },
);

LoadingSpinner.displayName = "LoadingSpinner";

export { LoadingSpinner };
