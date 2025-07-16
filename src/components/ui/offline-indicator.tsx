import React, { useState, useEffect } from "react";
import { Wifi, WifiOff } from "lucide-react";
import { Badge } from "./badge";

interface OfflineIndicatorProps {
  className?: string;
}

export function OfflineIndicator({ className = "" }: OfflineIndicatorProps) {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      console.log("اتصال الإنترنت متاح");
    };

    const handleOffline = () => {
      setIsOnline(false);
      console.log("لا يوجد اتصال بالإنترنت - العمل في الوضع المحلي");
    };

    // Check offline queue status
    const checkOfflineQueue = async () => {
      try {
        const { offlineStorage } = await import("@/utils/offlineStorage");
        const status = offlineStorage.getOfflineQueueStatus();
        setOfflineQueueCount(status.count);
      } catch (error) {
        console.error("Error checking offline queue:", error);
      }
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // Check queue status periodically
    const interval = setInterval(checkOfflineQueue, 5000);
    checkOfflineQueue();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Badge
        variant={isOnline ? "default" : "secondary"}
        className={`flex items-center gap-1 ${
          isOnline
            ? "bg-green-500 hover:bg-green-600"
            : "bg-orange-500 hover:bg-orange-600"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3 h-3" />
            <span className="text-xs">متصل</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3 h-3" />
            <span className="text-xs">غير متصل</span>
          </>
        )}
      </Badge>

      {offlineQueueCount > 0 && (
        <Badge variant="outline" className="text-xs">
          {offlineQueueCount} في الانتظار
        </Badge>
      )}
    </div>
  );
}

export default OfflineIndicator;
