// Performance optimization utilities
import React from "react";

// Debounce function for search and input handling
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

// Throttle function for scroll events
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number,
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// Memoization utility
export const memoize = <T extends (...args: any[]) => any>(fn: T): T => {
  const cache = new Map();
  return ((...args: Parameters<T>) => {
    const key = JSON.stringify(args);
    if (cache.has(key)) {
      return cache.get(key);
    }
    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// Image preloader
export const preloadImage = (src: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve();
    img.onerror = reject;
    img.src = src;
  });
};

// Batch DOM updates
export const batchUpdates = (callback: () => void) => {
  if ("requestIdleCallback" in window) {
    requestIdleCallback(callback);
  } else {
    setTimeout(callback, 0);
  }
};

// Memory usage monitor
export const getMemoryUsage = () => {
  if ("memory" in performance) {
    const memory = (performance as any).memory;
    return {
      used: Math.round(memory.usedJSHeapSize / 1048576), // MB
      total: Math.round(memory.totalJSHeapSize / 1048576), // MB
      limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    };
  }
  return null;
};

// Performance timing
export const measurePerformance = (name: string, fn: () => void) => {
  const start = performance.now();
  fn();
  const end = performance.now();
  console.log(`${name} took ${end - start} milliseconds`);
};

// Lazy loading utility
export const createIntersectionObserver = (
  callback: (entries: IntersectionObserverEntry[]) => void,
  options?: IntersectionObserverInit,
) => {
  if ("IntersectionObserver" in window) {
    return new IntersectionObserver(callback, {
      threshold: 0.1,
      rootMargin: "50px",
      ...options,
    });
  }
  return null;
};

// Resource hints
export const addResourceHint = (
  href: string,
  rel: "preload" | "prefetch" | "dns-prefetch",
) => {
  const link = document.createElement("link");
  link.rel = rel;
  link.href = href;
  if (rel === "preload") {
    link.as = "fetch";
    link.crossOrigin = "anonymous";
  }
  document.head.appendChild(link);
};

// Service Worker registration
export const registerServiceWorker = async () => {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      console.log("SW registered: ", registration);
      return registration;
    } catch (registrationError) {
      console.log("SW registration failed: ", registrationError);
    }
  }
};

// Cache management
export const clearOldCaches = async () => {
  if ("caches" in window) {
    try {
      const cacheNames = await caches.keys();
      const currentVersion = "amino-gym-v4";
      const oldCaches = cacheNames.filter(
        (name) =>
          !name.includes(currentVersion) &&
          (name.includes("amino-gym") || name.includes("v1")),
      );
      await Promise.allSettled(oldCaches.map((name) => caches.delete(name)));
    } catch (error) {
      console.warn("Cache cleanup failed:", error);
    }
  }
};

// Enhanced resource preloading
export const preloadCriticalResources = async () => {
  const criticalResources = [
    { href: "/yacin-gym-logo.png", as: "image" },
    { href: "/success-sound.mp3", as: "audio" },
  ];

  const preloadPromises = criticalResources.map(({ href, as }) => {
    return new Promise<void>((resolve) => {
      // Check if already preloaded
      const existingLink = document.querySelector(
        `link[rel="preload"][href="${href}"]`,
      );

      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement("link");
      link.rel = "preload";
      link.as = as;
      link.href = href;
      link.crossOrigin = "anonymous";

      link.onload = () => resolve();
      link.onerror = () => {
        console.warn(`Failed to preload ${href}`);
        resolve(); // Don't block on failed preloads
      };

      document.head.appendChild(link);

      // Timeout after 5 seconds
      setTimeout(() => resolve(), 5000);
    });
  });

  await Promise.allSettled(preloadPromises);
};

// Virtual scrolling utility
export const createVirtualList = <T>(
  items: T[],
  containerHeight: number,
  itemHeight: number,
  overscan: number = 5,
) => {
  const [scrollTop, setScrollTop] = React.useState(0);

  const visibleStart = Math.floor(scrollTop / itemHeight);
  const visibleEnd = Math.min(
    visibleStart + Math.ceil(containerHeight / itemHeight),
    items.length - 1,
  );

  const startIndex = Math.max(0, visibleStart - overscan);
  const endIndex = Math.min(items.length - 1, visibleEnd + overscan);

  const visibleItems = items.slice(startIndex, endIndex + 1);
  const offsetY = startIndex * itemHeight;

  return {
    visibleItems,
    startIndex,
    endIndex,
    offsetY,
    totalHeight: items.length * itemHeight,
    setScrollTop,
  };
};

// Image optimization utility
export const optimizeImageUrl = (
  url: string,
  width?: number,
  quality?: number,
) => {
  if (url.includes("unsplash.com")) {
    const params = new URLSearchParams();
    if (width) params.set("w", width.toString());
    if (quality) params.set("q", quality.toString());
    params.set("auto", "format");
    params.set("fit", "crop");

    return `${url}${url.includes("?") ? "&" : "?"}${params.toString()}`;
  }
  return url;
};

// Component lazy loading with retry
export const createLazyComponent = <T extends React.ComponentType<any>>(
  importFn: () => Promise<{ default: T }>,
  retries: number = 3,
) => {
  return React.lazy(async () => {
    let lastError: Error;

    for (let i = 0; i <= retries; i++) {
      try {
        return await importFn();
      } catch (error) {
        lastError = error as Error;
        if (i < retries) {
          // Wait before retrying (exponential backoff)
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, i) * 1000),
          );
        }
      }
    }

    throw lastError!;
  });
};
