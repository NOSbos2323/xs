// Enhanced offline storage utilities for PWA with performance optimizations
import localforage from "localforage";
import { debounce, batchUpdates } from "./performance";

// Configure localforage for better offline support with compression
localforage.config({
  driver: [localforage.INDEXEDDB, localforage.WEBSQL, localforage.LOCALSTORAGE],
  name: "AminoGymPWA",
  version: 2.0,
  storeName: "amino_gym_data",
  description:
    "Amino Gym PWA offline data storage with performance optimizations",
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
        await localforage.getItem<OfflineAction[]>(OFFLINE_QUEUE_KEY);
      this.offlineQueue = queue || [];
    } catch (error) {
      console.error("Error loading offline queue:", error);
      this.offlineQueue = [];
    }
  }

  // Save offline queue to storage
  private async saveOfflineQueue() {
    try {
      await localforage.setItem(OFFLINE_QUEUE_KEY, this.offlineQueue);
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
    if (this.offlineQueue.length === 0) return;

    console.log(`Processing ${this.offlineQueue.length} offline actions`);

    const processedActions: string[] = [];

    for (const action of this.offlineQueue) {
      try {
        await this.processOfflineAction(action);
        processedActions.push(action.id);
        console.log("Processed offline action:", action.type);
      } catch (error) {
        console.error("Error processing offline action:", error);
        // Keep failed actions in queue for retry
      }
    }

    // Remove successfully processed actions
    this.offlineQueue = this.offlineQueue.filter(
      (action) => !processedActions.includes(action.id),
    );

    await this.saveOfflineQueue();

    if (processedActions.length > 0) {
      // Notify user about synced data
      this.showSyncNotification(processedActions.length);
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
    window.addEventListener("online", () => {
      console.log("Back online - processing offline queue");
      this.processOfflineQueue();
    });

    window.addEventListener("offline", () => {
      console.log("Gone offline - actions will be queued");
    });
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
  public getOfflineQueueStatus() {
    return {
      count: this.offlineQueue.length,
      actions: this.offlineQueue.map((action) => ({
        type: action.type,
        timestamp: action.timestamp,
      })),
    };
  }

  // Clear offline queue (for testing/debugging)
  public async clearOfflineQueue() {
    this.offlineQueue = [];
    await this.saveOfflineQueue();
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
