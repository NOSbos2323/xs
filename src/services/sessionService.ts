import { Member } from "./memberService";
import { Payment } from "./paymentService";
import { MemberActivity } from "./memberService";

// نظام إدارة الجلسات والبيانات المحلية
export class SessionService {
  private static instance: SessionService;
  private sessionKey = "gym_session_data";
  private backupKey = "gym_backup_data";
  private settingsKey = "gym_settings";
  private autoSaveInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.initializeSession();
    this.startAutoSave();
    this.setupEventListeners();
  }

  public static getInstance(): SessionService {
    if (!SessionService.instance) {
      SessionService.instance = new SessionService();
    }
    return SessionService.instance;
  }

  // تهيئة الجلسة
  private initializeSession(): void {
    try {
      // إنشاء بيانات الجلسة الأساسية
      const sessionData = {
        sessionId: this.generateSessionId(),
        startTime: new Date().toISOString(),
        lastActivity: new Date().toISOString(),
        isActive: true,
        version: "1.0.0",
        dataIntegrity: true,
      };

      // حفظ بيانات الجلسة
      localStorage.setItem(this.sessionKey, JSON.stringify(sessionData));

      // إنشاء نسخة احتياطية فورية
      this.createBackup();

      console.log("✅ تم تهيئة نظام الجلسة بنجاح");
    } catch (error) {
      console.error("❌ خطأ في تهيئة الجلسة:", error);
    }
  }

  // إنشاء معرف جلسة فريد
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // بدء الحفظ التلقائي
  private startAutoSave(): void {
    // حفظ تلقائي كل 30 ثانية
    this.autoSaveInterval = setInterval(() => {
      this.saveSessionData();
      this.updateLastActivity();
    }, 30000);

    console.log("🔄 تم تفعيل الحفظ التلقائي (كل 30 ثانية)");
  }

  // إعداد مستمعي الأحداث
  private setupEventListeners(): void {
    // حفظ عند إغلاق الصفحة
    window.addEventListener("beforeunload", () => {
      this.saveSessionData();
      this.createBackup();
    });

    // حفظ عند فقدان التركيز
    window.addEventListener("blur", () => {
      this.saveSessionData();
    });

    // حفظ عند استعادة التركيز
    window.addEventListener("focus", () => {
      this.updateLastActivity();
      this.validateDataIntegrity();
    });

    // حفظ عند تغيير حالة الشبكة
    window.addEventListener("online", () => {
      this.syncOfflineData();
    });

    // حفظ عند الضغط على Ctrl+S
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && e.key === "s") {
        e.preventDefault();
        this.forceSave();
      }
    });
  }

  // حفظ بيانات الجلسة
  public saveSessionData(): void {
    try {
      const currentSession = this.getSessionData();
      if (currentSession) {
        currentSession.lastActivity = new Date().toISOString();
        currentSession.saveCount = (currentSession.saveCount || 0) + 1;
        localStorage.setItem(this.sessionKey, JSON.stringify(currentSession));
      }
    } catch (error) {
      console.error("❌ خطأ في حفظ بيانات الجلسة:", error);
    }
  }

  // الحصول على بيانات الجلسة
  public getSessionData(): any {
    try {
      const data = localStorage.getItem(this.sessionKey);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error("❌ خطأ في قراءة بيانات الجلسة:", error);
      return null;
    }
  }

  // تحديث آخر نشاط
  private updateLastActivity(): void {
    const session = this.getSessionData();
    if (session) {
      session.lastActivity = new Date().toISOString();
      localStorage.setItem(this.sessionKey, JSON.stringify(session));
    }
  }

  // إنشاء نسخة احتياطية شاملة
  public async createBackup(): Promise<void> {
    try {
      const { getAllMembers, getRecentActivities } = await import(
        "./memberService"
      );
      const { getAllPayments } = await import("./paymentService");

      const backupData = {
        timestamp: new Date().toISOString(),
        version: "1.0.0",
        sessionId: this.getSessionData()?.sessionId,
        data: {
          members: await getAllMembers(),
          payments: await getAllPayments(),
          activities: await getRecentActivities(1000),
          settings: this.getAllSettings(),
        },
        integrity: {
          membersCount: (await getAllMembers()).length,
          paymentsCount: (await getAllPayments()).length,
          activitiesCount: (await getRecentActivities(1000)).length,
        },
      };

      // حفظ النسخة الاحتياطية
      localStorage.setItem(this.backupKey, JSON.stringify(backupData));

      // حفظ نسخة احتياطية إضافية بالتاريخ
      const dateKey = `gym_backup_${new Date().toISOString().split("T")[0]}`;
      localStorage.setItem(dateKey, JSON.stringify(backupData));

      console.log("💾 تم إنشاء نسخة احتياطية بنجاح");
    } catch (error) {
      console.error("❌ خطأ في إنشاء النسخة الاحتياطية:", error);
    }
  }

  // استعادة النسخة الاحتياطية
  public async restoreBackup(): Promise<boolean> {
    try {
      const backupData = localStorage.getItem(this.backupKey);
      if (!backupData) {
        console.warn("⚠️ لا توجد نسخة احتياطية للاستعادة");
        return false;
      }

      const backup = JSON.parse(backupData);
      const { addOrUpdateMemberWithId, addOrUpdateActivityWithId } =
        await import("./memberService");
      const { addOrUpdatePaymentWithId } = await import("./paymentService");

      // استعادة الأعضاء
      if (backup.data.members) {
        for (const member of backup.data.members) {
          await addOrUpdateMemberWithId(member);
        }
      }

      // استعادة المدفوعات
      if (backup.data.payments) {
        for (const payment of backup.data.payments) {
          await addOrUpdatePaymentWithId(payment);
        }
      }

      // استعادة الأنشطة
      if (backup.data.activities) {
        for (const activity of backup.data.activities) {
          await addOrUpdateActivityWithId(activity);
        }
      }

      // استعادة الإعدادات
      if (backup.data.settings) {
        this.restoreSettings(backup.data.settings);
      }

      console.log("✅ تم استعادة النسخة الاحتياطية بنجاح");
      return true;
    } catch (error) {
      console.error("❌ خطأ في استعادة النسخة الاحتياطية:", error);
      return false;
    }
  }

  // التحقق من سلامة البيانات
  public async validateDataIntegrity(): Promise<boolean> {
    try {
      const { getAllMembers, getRecentActivities } = await import(
        "./memberService"
      );
      const { getAllPayments } = await import("./paymentService");

      const members = await getAllMembers();
      const payments = await getAllPayments();
      const activities = await getRecentActivities(100);

      // التحقق من وجود البيانات الأساسية
      const hasValidData =
        members.every((m) => m.id && m.name) &&
        payments.every((p) => p.id && p.memberId && p.amount) &&
        activities.every((a) => a.timestamp && a.memberId);

      if (!hasValidData) {
        console.warn("⚠️ تم اكتشاف بيانات تالفة - سيتم محاولة الإصلاح");
        await this.repairData();
      }

      return hasValidData;
    } catch (error) {
      console.error("❌ خطأ في التحقق من سلامة البيانات:", error);
      return false;
    }
  }

  // إصلاح البيانات التالفة
  private async repairData(): Promise<void> {
    try {
      const { databaseService } = await import("./databaseService");
      await databaseService.cleanupDatabase();
      console.log("🔧 تم إصلاح البيانات التالفة");
    } catch (error) {
      console.error("❌ خطأ في إصلاح البيانات:", error);
    }
  }

  // مزامنة البيانات غير المتصلة
  private async syncOfflineData(): Promise<void> {
    try {
      const { offlineStorage } = await import("../utils/offlineStorage");
      await offlineStorage.syncOfflineData();
      console.log("🔄 تم مزامنة البيانات غير المتصلة");
    } catch (error) {
      console.error("❌ خطأ في مزامنة البيانات:", error);
    }
  }

  // حفظ إجباري
  public async forceSave(): Promise<void> {
    try {
      this.saveSessionData();
      await this.createBackup();
      console.log("💾 تم الحفظ الإجباري بنجاح");
    } catch (error) {
      console.error("❌ خطأ في الحفظ الإجباري:", error);
    }
  }

  // حفظ الإعدادات
  public saveSetting(key: string, value: any): void {
    try {
      const settings = this.getAllSettings();
      settings[key] = {
        value,
        timestamp: new Date().toISOString(),
        version: "1.0.0",
      };
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.error("❌ خطأ في حفظ الإعداد:", error);
    }
  }

  // الحصول على إعداد
  public getSetting(key: string, defaultValue: any = null): any {
    try {
      const settings = this.getAllSettings();
      return settings[key]?.value || defaultValue;
    } catch (error) {
      console.error("❌ خطأ في قراءة الإعداد:", error);
      return defaultValue;
    }
  }

  // الحصول على جميع الإعدادات
  public getAllSettings(): any {
    try {
      const data = localStorage.getItem(this.settingsKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      console.error("❌ خطأ في قراءة الإعدادات:", error);
      return {};
    }
  }

  // استعادة الإعدادات
  private restoreSettings(settings: any): void {
    try {
      localStorage.setItem(this.settingsKey, JSON.stringify(settings));
    } catch (error) {
      console.error("❌ خطأ في استعادة الإعدادات:", error);
    }
  }

  // تنظيف الجلسة
  public cleanup(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
    this.saveSessionData();
    console.log("🧹 تم تنظيف الجلسة");
  }

  // الحصول على إحصائيات الجلسة
  public getSessionStats(): any {
    const session = this.getSessionData();
    if (!session) return null;

    const now = new Date();
    const startTime = new Date(session.startTime);
    const lastActivity = new Date(session.lastActivity);

    return {
      sessionId: session.sessionId,
      duration: Math.floor((now.getTime() - startTime.getTime()) / 1000 / 60), // بالدقائق
      lastActivity: Math.floor(
        (now.getTime() - lastActivity.getTime()) / 1000 / 60,
      ), // بالدقائق
      saveCount: session.saveCount || 0,
      isActive: session.isActive,
      dataIntegrity: session.dataIntegrity,
    };
  }

  // تصدير البيانات
  public async exportData(): Promise<string> {
    try {
      const { getAllMembers, getRecentActivities } = await import(
        "./memberService"
      );
      const { getAllPayments } = await import("./paymentService");

      const exportData = {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        sessionId: this.getSessionData()?.sessionId,
        data: {
          members: await getAllMembers(),
          payments: await getAllPayments(),
          activities: await getRecentActivities(1000),
          settings: this.getAllSettings(),
        },
      };

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error("❌ خطأ في تصدير البيانات:", error);
      throw error;
    }
  }

  // استيراد البيانات
  public async importData(jsonData: string): Promise<boolean> {
    try {
      const importData = JSON.parse(jsonData);

      if (!importData.data) {
        throw new Error("بيانات الاستيراد غير صحيحة");
      }

      const { addOrUpdateMemberWithId, addOrUpdateActivityWithId } =
        await import("./memberService");
      const { addOrUpdatePaymentWithId } = await import("./paymentService");

      // استيراد الأعضاء
      if (importData.data.members) {
        for (const member of importData.data.members) {
          await addOrUpdateMemberWithId(member);
        }
      }

      // استيراد المدفوعات
      if (importData.data.payments) {
        for (const payment of importData.data.payments) {
          await addOrUpdatePaymentWithId(payment);
        }
      }

      // استيراد الأنشطة
      if (importData.data.activities) {
        for (const activity of importData.data.activities) {
          await addOrUpdateActivityWithId(activity);
        }
      }

      // استيراد الإعدادات
      if (importData.data.settings) {
        this.restoreSettings(importData.data.settings);
      }

      // إنشاء نسخة احتياطية بعد الاستيراد
      await this.createBackup();

      console.log("✅ تم استيراد البيانات بنجاح");
      return true;
    } catch (error) {
      console.error("❌ خطأ في استيراد البيانات:", error);
      return false;
    }
  }
}

// إنشاء مثيل واحد من الخدمة
export const sessionService = SessionService.getInstance();

// تصدير دوال مساعدة
export const saveSessionData = () => sessionService.saveSessionData();
export const createBackup = () => sessionService.createBackup();
export const restoreBackup = () => sessionService.restoreBackup();
export const validateDataIntegrity = () =>
  sessionService.validateDataIntegrity();
export const forceSave = () => sessionService.forceSave();
export const exportData = () => sessionService.exportData();
export const importData = (data: string) => sessionService.importData(data);
export const getSessionStats = () => sessionService.getSessionStats();
