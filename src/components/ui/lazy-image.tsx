import React, { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallback?: string;
  className?: string;
  placeholder?: React.ReactNode;
}

const LazyImage = React.forwardRef<HTMLImageElement, LazyImageProps>(
  ({ src, alt, fallback, className, placeholder, ...props }, ref) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isError, setIsError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    useEffect(() => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        },
        { threshold: 0.1 },
      );

      if (imgRef.current) {
        observer.observe(imgRef.current);
      }

      return () => observer.disconnect();
    }, []);

    const handleLoad = () => {
      setIsLoaded(true);
      setIsError(false);
    };

    const handleError = () => {
      setIsError(true);
      setIsLoaded(false);
    };

    return (
      <div
        ref={imgRef}
        className={cn("relative overflow-hidden", className)}
        {...props}
      >
        {!isInView && (
          <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
            {placeholder || (
              <div className="w-8 h-8 bg-gray-300 rounded-full animate-pulse" />
            )}
          </div>
        )}

        {isInView && (
          <img
            ref={ref}
            src={isError && fallback ? fallback : src}
            alt={alt}
            onLoad={handleLoad}
            onError={handleError}
            className={cn(
              "transition-opacity duration-300",
              isLoaded ? "opacity-100" : "opacity-0",
              className,
            )}
            loading="lazy"
            decoding="async"
          />
        )}
      </div>
    );
  },
);

LazyImage.displayName = "LazyImage";

export { LazyImage };
