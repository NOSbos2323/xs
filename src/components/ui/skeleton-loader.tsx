import React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  variant?: "text" | "circular" | "rectangular";
  animation?: "pulse" | "wave" | "none";
}

const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  (
    {
      className,
      width,
      height,
      variant = "rectangular",
      animation = "pulse",
      ...props
    },
    ref,
  ) => {
    const baseClasses = "bg-gray-200 dark:bg-gray-700";

    const variantClasses = {
      text: "h-4 rounded",
      circular: "rounded-full",
      rectangular: "rounded",
    };

    const animationClasses = {
      pulse: "animate-pulse",
      wave: "skeleton",
      none: "",
    };

    const style: React.CSSProperties = {};
    if (width) style.width = typeof width === "number" ? `${width}px` : width;
    if (height)
      style.height = typeof height === "number" ? `${height}px` : height;

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variantClasses[variant],
          animationClasses[animation],
          className,
        )}
        style={style}
        {...props}
      />
    );
  },
);

Skeleton.displayName = "Skeleton";

// Predefined skeleton components for common use cases
const SkeletonText = ({
  lines = 1,
  className,
}: {
  lines?: number;
  className?: string;
}) => (
  <div className={cn("space-y-2", className)}>
    {Array.from({ length: lines }).map((_, i) => (
      <Skeleton
        key={i}
        variant="text"
        width={i === lines - 1 ? "75%" : "100%"}
        className="h-4"
      />
    ))}
  </div>
);

const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cn("p-4 space-y-4", className)}>
    <div className="flex items-center space-x-4">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="space-y-2 flex-1">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" width="40%" />
      </div>
    </div>
    <SkeletonText lines={3} />
  </div>
);

const SkeletonList = ({
  items = 5,
  className,
}: {
  items?: number;
  className?: string;
}) => (
  <div className={cn("space-y-3", className)}>
    {Array.from({ length: items }).map((_, i) => (
      <div key={i} className="flex items-center space-x-3">
        <Skeleton variant="circular" width={32} height={32} />
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="70%" />
          <Skeleton variant="text" width="50%" />
        </div>
      </div>
    ))}
  </div>
);

export { Skeleton, SkeletonText, SkeletonCard, SkeletonList };
