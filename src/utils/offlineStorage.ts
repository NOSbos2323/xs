// Enhanced offline storage utilities for PWA with performance optimizations
import localforage from "localforage";
import { debounce, batchUpdates } from "./performance";

// Configure localforage for better offline support with compression
localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  name: "AminoGymPWA",
  version: 3.0,
  storeName: "amino_gym_data",
  description:
    "Amino Gym PWA offline data storage with performance optimizations",
});

// Create separate storage instances for better organization
const offlineQueueStorage = localforage.createInstance({
  name: "AminoGymPWA",
  storeName: "offline_queue",
  description: "Offline actions queue",
});

const syncStatusStorage = localforage.createInstance({
  name: "AminoGymPWA",
  storeName: "sync_status",
  description: "Synchronization status and metadata",
});

// Data compression utilities
const compressData = (data: any): string => {
  try {
    return JSON.stringify(data);
  } catch (error) {
    console.error("Data compression failed:", error);
    return JSON.stringify({});
  }
};

const decompressData = (compressedData: string): any => {
  try {
    return JSON.parse(compressedData);
  } catch (error) {
    console.error("Data decompression failed:", error);
    return null;
  }
};

// Enhanced storage with batching and debouncing
class EnhancedStorage {
  private pendingWrites = new Map<string, any>();
  private debouncedWrite = debounce(this.flushPendingWrites.bind(this), 500);

  async setItem(key: string, value: any): Promise<void> {
    this.pendingWrites.set(key, value);
    this.debouncedWrite();
  }

  private async flushPendingWrites(): Promise<void> {
    const writes = Array.from(this.pendingWrites.entries());
    this.pendingWrites.clear();

    await Promise.all(
      writes.map(([key, value]) =>
        localforage.setItem(key, compressData(value)),
      ),
    );
  }

  async getItem(key: string): Promise<any> {
    // Check pending writes first
    if (this.pendingWrites.has(key)) {
      return this.pendingWrites.get(key);
    }

    const compressedData = await localforage.getItem<string>(key);
    return compressedData ? decompressData(compressedData) : null;
  }

  async removeItem(key: string): Promise<void> {
    this.pendingWrites.delete(key);
    return localforage.removeItem(key);
  }

  async clear(): Promise<void> {
    this.pendingWrites.clear();
    return localforage.clear();
  }
}

const enhancedStorage = new EnhancedStorage();

// Offline queue for actions performed while offline
interface OfflineAction {
  id: string;
  type: "member_add" | "member_update" | "payment_add" | "attendance_mark";
  data: any;
  timestamp: string;
}

const OFFLINE_QUEUE_KEY = "offline_actions_queue";

export class OfflineStorageManager {
  private static instance: OfflineStorageManager;
  private offlineQueue: OfflineAction[] = [];

  private constructor() {
    this.loadOfflineQueue();
    this.setupOnlineListener();
  }

  public static getInstance(): OfflineStorageManager {
    if (!OfflineStorageManager.instance) {
      OfflineStorageManager.instance = new OfflineStorageManager();
    }
    return OfflineStorageManager.instance;
  }

  // Load offline queue from storage
  private async loadOfflineQueue() {
    try {
      const queue =
        await offlineQueueStorage.getItem<OfflineAction[]>(OFFLINE_QUEUE_KEY);
      this.offlineQueue = queue || [];
      console.log(
        `Loaded ${this.offlineQueue.length} offline actions from storage`,
      );
    } catch (error) {
      console.error("Error loading offline queue:", error);
      this.offlineQueue = [];
    }
  }

  // Save offline queue to storage
  private async saveOfflineQueue() {
    try {
      await offlineQueueStorage.setItem(OFFLINE_QUEUE_KEY, this.offlineQueue);
      await syncStatusStorage.setItem(
        "last_queue_update",
        new Date().toISOString(),
      );
    } catch (error) {
      console.error("Error saving offline queue:", error);
    }
  }

  // Add action to offline queue
  public async addToOfflineQueue(
    action: Omit<OfflineAction, "id" | "timestamp">,
  ) {
    const offlineAction: OfflineAction = {
      ...action,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    this.offlineQueue.push(offlineAction);
    await this.saveOfflineQueue();

    console.log("Action added to offline queue:", offlineAction);
  }

  // Process offline queue when back online
  private async processOfflineQueue() {
    if (this.offlineQueue.length === 0) {
      console.log("No offline actions to process");
      return;
    }

    console.log(`Processing ${this.offlineQueue.length} offline actions`);
    await syncStatusStorage.setItem("sync_in_progress", true);

    const processedActions: string[] = [];
    const failedActions: OfflineAction[] = [];

    // Process actions in batches to avoid overwhelming the system
    const batchSize = 5;
    for (let i = 0; i < this.offlineQueue.length; i += batchSize) {
      const batch = this.offlineQueue.slice(i, i + batchSize);

      await Promise.allSettled(
        batch.map(async (action) => {
          try {
            await this.processOfflineAction(action);
            processedActions.push(action.id);
            console.log(
              `Processed offline action: ${action.type} (${action.id})`,
            );
          } catch (error) {
            console.error(
              `Error processing offline action ${action.id}:`,
              error,
            );
            failedActions.push(action);
          }
        }),
      );

      // Small delay between batches to prevent overwhelming
      if (i + batchSize < this.offlineQueue.length) {
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
    }

    // Update queue with only failed actions
    this.offlineQueue = failedActions;
    await this.saveOfflineQueue();
    await syncStatusStorage.setItem("sync_in_progress", false);
    await syncStatusStorage.setItem("last_sync", new Date().toISOString());

    if (processedActions.length > 0) {
      console.log(
        `Successfully processed ${processedActions.length} offline actions`,
      );
      this.showSyncNotification(processedActions.length);
    }

    if (failedActions.length > 0) {
      console.warn(
        `${failedActions.length} actions failed to process and will be retried later`,
      );
    }
  }

  // Process individual offline action
  private async processOfflineAction(action: OfflineAction) {
    // Import services dynamically to avoid circular dependencies
    const { addMember, updateMember, markAttendance } = await import(
      "@/services/memberService"
    );
    const { addPayment } = await import("@/services/paymentService");

    switch (action.type) {
      case "member_add":
        await addMember(action.data);
        break;
      case "member_update":
        await updateMember(action.data);
        break;
      case "payment_add":
        await addPayment(action.data);
        break;
      case "attendance_mark":
        await markAttendance(action.data.memberId);
        break;
      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  // Setup online/offline event listeners
  private setupOnlineListener() {
    window.addEventListener("online", async () => {
      console.log("Back online - processing offline queue");
      await syncStatusStorage.setItem("connection_status", "online");
      await syncStatusStorage.setItem("last_online", new Date().toISOString());

      // Wait a moment for connection to stabilize
      setTimeout(() => {
        this.processOfflineQueue();
      }, 1000);
    });

    window.addEventListener("offline", async () => {
      console.log("Gone offline - actions will be queued");
      await syncStatusStorage.setItem("connection_status", "offline");
      await syncStatusStorage.setItem("last_offline", new Date().toISOString());
    });

    // Periodic sync attempt when online
    setInterval(async () => {
      if (this.isOnline() && this.offlineQueue.length > 0) {
        const syncInProgress =
          await syncStatusStorage.getItem("sync_in_progress");
        if (!syncInProgress) {
          console.log("Periodic sync check - processing offline queue");
          this.processOfflineQueue();
        }
      }
    }, 30000); // Check every 30 seconds
  }

  // Show sync notification
  private showSyncNotification(count: number) {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Amino Gym", {
        body: `تم مزامنة ${count} إجراء بنجاح`,
        icon: "/yacin-gym-logo.png",
        badge: "/yacin-gym-logo.png",
      });
    }
  }

  // Get offline queue status
  public async getOfflineQueueStatus() {
    const syncStatus = {
      last_sync: await syncStatusStorage.getItem("last_sync"),
      sync_in_progress: await syncStatusStorage.getItem("sync_in_progress"),
      connection_status: await syncStatusStorage.getItem("connection_status"),
      last_online: await syncStatusStorage.getItem("last_online"),
      last_offline: await syncStatusStorage.getItem("last_offline"),
    };

    return {
      count: this.offlineQueue.length,
      actions: this.offlineQueue.map((action) => ({
        id: action.id,
        type: action.type,
        timestamp: action.timestamp,
      })),
      syncStatus,
      isOnline: this.isOnline(),
    };
  }

  // Clear offline queue (for testing/debugging)
  public async clearOfflineQueue() {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
    await syncStatusStorage.clear();
    console.log("Offline queue and sync status cleared");
  }

  // Force sync (manual trigger)
  public async forcSync() {
    if (!this.isOnline()) {
      throw new Error("Cannot sync while offline");
    }

    console.log("Force sync triggered");
    await this.processOfflineQueue();
  }

  // Get storage usage statistics
  public async getStorageStats() {
    try {
      const queueSize = JSON.stringify(this.offlineQueue).length;
      const estimate = await navigator.storage?.estimate?.();

      return {
        queueSize: Math.round(queueSize / 1024), // KB
        totalUsage: estimate ? Math.round(estimate.usage! / 1024 / 1024) : null, // MB
        totalQuota: estimate ? Math.round(estimate.quota! / 1024 / 1024) : null, // MB
        usagePercentage: estimate
          ? Math.round((estimate.usage! / estimate.quota!) * 100)
          : null,
      };
    } catch (error) {
      console.error("Error getting storage stats:", error);
      return null;
    }
  }

  // Check if device is online
  public isOnline(): boolean {
    return navigator.onLine;
  }

  // Request notification permission
  public async requestNotificationPermission() {
    if ("Notification" in window && Notification.permission === "default") {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    }
    return Notification.permission === "granted";
  }
}

// Export singleton instance
export const offlineStorage = OfflineStorageManager.getInstance();
