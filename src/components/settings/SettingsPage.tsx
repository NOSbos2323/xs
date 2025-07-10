import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import {
  ArrowLeft,
  Save,
  Tag,
  User,
  Lock,
  Eye,
  EyeOff,
  Settings,
  Database,
  Download,
  Upload,
  Trash2,
  DollarSign,
  Key,
} from "lucide-react";
import { formatNumber } from "@/lib/utils";
import TopMobileNavigation from "../layout/TopMobileNavigation";
import MobileNavigationComponent from "../layout/MobileNavigation";
import { databaseService } from "@/services/databaseService";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SettingsPageProps {
  onBack: () => void;
  onNavigate?: (page: string) => void;
}

const SettingsPage = ({ onBack, onNavigate }: SettingsPageProps) => {
  // Pricing state - start with empty values
  const [singleSession, setSingleSession] = useState("");
  const [sessions13, setSessions13] = useState("");
  const [sessions15, setSessions15] = useState("");
  const [sessions30, setSessions30] = useState("");

  // User settings state
  const [username, setUsername] = useState("ADMIN");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [databaseHealth, setDatabaseHealth] = useState<any>(null);
  const [isCheckingDatabase, setIsCheckingDatabase] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [showActivationDialog, setShowActivationDialog] = useState(false);
  const [activationCode, setActivationCode] = useState("");
  const { toast } = useToast();

  // Load settings from localStorage
  useEffect(() => {
    const savedPricing = localStorage.getItem("gymPricingSettings");
    if (savedPricing) {
      try {
        const pricing = JSON.parse(savedPricing);
        setSingleSession(
          pricing.singleSession ? pricing.singleSession.toString() : "200",
        );
        setSessions13(
          pricing.sessions13 ? pricing.sessions13.toString() : "1500",
        );
        setSessions15(
          pricing.sessions15 ? pricing.sessions15.toString() : "1800",
        );
        setSessions30(
          pricing.sessions30 ? pricing.sessions30.toString() : "1800",
        );
      } catch (error) {
        console.error("Error loading pricing:", error);
        // Set default values if error
        setSingleSession("200");
        setSessions13("1500");
        setSessions15("1800");
        setSessions30("1800");
      }
    } else {
      // Set default values if no saved pricing
      setSingleSession("200");
      setSessions13("1500");
      setSessions15("1800");
      setSessions30("1800");
    }

    const savedUser = localStorage.getItem("gymUserSettings");
    if (savedUser) {
      try {
        const user = JSON.parse(savedUser);
        setUsername(user.username || "ADMIN");
      } catch (error) {
        console.error("Error loading user settings:", error);
      }
    }

    // Check database health on load
    checkDatabaseHealth();
  }, []);

  // Check database health
  const checkDatabaseHealth = async () => {
    setIsCheckingDatabase(true);
    try {
      const health = await databaseService.checkDatabaseHealth();
      setDatabaseHealth(health);
    } catch (error) {
      console.error("Error checking database health:", error);
    } finally {
      setIsCheckingDatabase(false);
    }
  };

  // Clean database
  const cleanDatabase = async () => {
    if (
      !confirm(
        "هل أنت متأكد من تنظيف قاعدة البيانات؟ سيتم حذف السجلات التالفة.",
      )
    ) {
      return;
    }

    try {
      const result = await databaseService.cleanupDatabase();
      if (result.success) {
        toast({
          title: "تم التنظيف",
          description: `تم حذف ${result.cleaned.members + result.cleaned.payments + result.cleaned.activities} سجل تالف`,
        });
        checkDatabaseHealth(); // Refresh health check
      } else {
        toast({
          title: "خطأ",
          description: result.errors.join(", "),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تنظيف قاعدة البيانات",
        variant: "destructive",
      });
    }
  };

  // Optimize database
  const optimizeDatabase = async () => {
    if (
      !confirm(
        "هل أنت متأكد من تحسين قاعدة البيانات؟ سيتم حذف الأنشطة القديمة (أكثر من 3 أشهر).",
      )
    ) {
      return;
    }

    try {
      const result = await databaseService.optimizeDatabase();
      if (result.success) {
        toast({
          title: "تم التحسين",
          description: `تم حذف ${result.optimized.oldActivitiesRemoved} نشاط قديم`,
        });
        checkDatabaseHealth(); // Refresh health check
      } else {
        toast({
          title: "خطأ",
          description: result.errors.join(", "),
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "خطأ",
        description: "حدث خطأ أثناء تحسين قاعدة البيانات",
        variant: "destructive",
      });
    }
  };

  // Save pricing to localStorage
  const savePricing = () => {
    const pricing = {
      singleSession: parseInt(singleSession) || 0,
      sessions13: parseInt(sessions13) || 0,
      sessions15: parseInt(sessions15) || 0,
      sessions30: parseInt(sessions30) || 0,
    };

    localStorage.setItem("gymPricingSettings", JSON.stringify(pricing));

    toast({
      title: "تم حفظ الأسعار",
      description: "تم تحديث الأسعار في جميع أنحاء الموقع",
    });

    // Trigger price update event
    window.dispatchEvent(new Event("pricing-updated"));

    // Force page refresh to update all pricing throughout the system
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Save user settings to localStorage
  const saveUserSettings = () => {
    // Validate new password if provided
    if (newPassword && newPassword.length < 4) {
      toast({
        title: "خطأ",
        description: "كلمة المرور يجب أن تكون 4 أحرف على الأقل",
        variant: "destructive",
      });
      return;
    }

    // Get current saved password or default
    const savedPassword = localStorage.getItem("gymPassword") || "ADMIN";

    // If changing password, validate current password
    if (newPassword) {
      if (!currentPassword) {
        toast({
          title: "خطأ",
          description: "يجب إدخال كلمة المرور الحالية",
          variant: "destructive",
        });
        return;
      }

      if (currentPassword !== savedPassword) {
        toast({
          title: "خطأ",
          description: "كلمة المرور الحالية غير صحيحة",
          variant: "destructive",
        });
        return;
      }
    }

    // Save username
    const userSettings = { username };
    localStorage.setItem("gymUserSettings", JSON.stringify(userSettings));

    // Update current user data
    const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
    currentUser.userInfo = { ...currentUser.userInfo, username };
    localStorage.setItem("user", JSON.stringify(currentUser));

    // Save new password if provided
    if (newPassword) {
      localStorage.setItem("gymPassword", newPassword);
      toast({
        title: "تم التحديث",
        description:
          "تم تحديث اسم المستخدم وكلمة المرور بنجاح. سيتم تسجيل الخروج الآن.",
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");

      // Log out user after password change
      setTimeout(() => {
        localStorage.removeItem("user");
        window.location.href = "/login";
      }, 2000);
    } else {
      toast({
        title: "تم التحديث",
        description: "تم تحديث اسم المستخدم بنجاح",
      });

      // Clear form
      setCurrentPassword("");
      setNewPassword("");
    }
  };

  // Play sound effect
  const playSound = (type: "success" | "error") => {
    try {
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      if (type === "success") {
        // Success sound: ascending notes
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(
          659.25,
          audioContext.currentTime + 0.1,
        ); // E5
        oscillator.frequency.setValueAtTime(
          783.99,
          audioContext.currentTime + 0.2,
        ); // G5
      } else {
        // Error sound: descending notes
        oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
        oscillator.frequency.setValueAtTime(
          415.3,
          audioContext.currentTime + 0.1,
        ); // G#4
        oscillator.frequency.setValueAtTime(
          349.23,
          audioContext.currentTime + 0.2,
        ); // F4
      }

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3,
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.log("Sound not supported");
    }
  };

  // Import data with comprehensive handling - same as PaymentsPage
  const importData = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.style.display = "none";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;

      setIsLoading(true);

      try {
        toast({
          title: "جاري استيراد جميع البيانات...",
          description: "يرجى الانتظار، جاري معالجة الملف",
        });

        // File validation
        if (file.size > 100 * 1024 * 1024) {
          throw new Error("حجم الملف كبير جداً (الحد الأقصى 100 ميجابايت)");
        }

        if (file.size < 10) {
          throw new Error("الملف فارغ أو تالف");
        }

        // Read and parse file
        const text = await file.text();
        if (!text.trim()) {
          throw new Error("الملف فارغ");
        }

        let importData;
        try {
          importData = JSON.parse(text);
        } catch (parseError) {
          throw new Error("ملف JSON غير صحيح أو تالف");
        }

        // Extract data from different formats
        let payments = [];
        let members = [];
        let activities = [];

        // Handle new format with metadata
        if (importData.data) {
          payments = importData.data.payments || [];
          members = importData.data.members || [];
          activities = importData.data.activities || [];
        }
        // Handle old format - direct arrays
        else if (importData.payments || importData.members) {
          payments = importData.payments || [];
          members = importData.members || [];
          activities = importData.activities || [];
        }
        // Handle array format
        else if (Array.isArray(importData)) {
          // Try to detect data type
          for (const item of importData) {
            if (item.amount !== undefined) {
              payments.push(item);
            } else if (item.name !== undefined) {
              members.push(item);
            } else if (item.activityType !== undefined) {
              activities.push(item);
            }
          }
        }

        if (!Array.isArray(payments)) payments = [];
        if (!Array.isArray(members)) members = [];
        if (!Array.isArray(activities)) activities = [];

        console.log(
          `Import: Found ${payments.length} payments, ${members.length} members, ${activities.length} activities`,
        );

        if (
          payments.length === 0 &&
          members.length === 0 &&
          activities.length === 0
        ) {
          throw new Error("لا توجد بيانات صالحة للاستيراد في الملف");
        }

        let importedMembers = 0;
        let importedPayments = 0;
        let importedActivities = 0;
        const errors = [];

        // Import members with enhanced error handling and verification
        const memberService = await import("@/services/memberService");

        // Process members in smaller batches to avoid overwhelming the database
        const BATCH_SIZE = 10;
        const memberBatches = [];
        for (let i = 0; i < members.length; i += BATCH_SIZE) {
          memberBatches.push(members.slice(i, i + BATCH_SIZE));
        }

        for (const batch of memberBatches) {
          const batchPromises = [];

          for (let i = 0; i < batch.length; i++) {
            try {
              const member = batch[i];
              if (!member || typeof member !== "object") {
                errors.push(`عضو غير صحيح في المجموعة`);
                continue;
              }

              if (
                !member.name ||
                typeof member.name !== "string" ||
                member.name.trim() === ""
              ) {
                errors.push(`عضو بدون اسم`);
                continue;
              }

              const cleanMember = {
                id:
                  member.id ||
                  `imported_member_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                name: String(member.name).trim(),
                membershipStatus: ["active", "expired", "pending"].includes(
                  member.membershipStatus,
                )
                  ? member.membershipStatus
                  : "pending",
                lastAttendance:
                  member.lastAttendance ||
                  new Date().toISOString().split("T")[0],
                imageUrl: member.imageUrl || member.profileImage || "",
                phoneNumber: member.phoneNumber || member.phone || "",
                email: member.email || "",
                membershipType: member.membershipType || "",
                membershipStartDate: member.membershipStartDate || "",
                membershipEndDate: member.membershipEndDate || "",
                subscriptionType: member.subscriptionType,
                sessionsRemaining: Math.max(
                  0,
                  Number(member.sessionsRemaining) || 0,
                ),
                subscriptionPrice: Math.max(
                  0,
                  Number(member.subscriptionPrice) || 0,
                ),
                paymentStatus: ["paid", "unpaid", "partial"].includes(
                  member.paymentStatus,
                )
                  ? member.paymentStatus
                  : "unpaid",
                note: member.note || "",
              };

              // Add to batch promises with enhanced error handling
              batchPromises.push(
                memberService
                  .addOrUpdateMemberWithId(cleanMember)
                  .then(() => {
                    importedMembers++;
                    console.log(`تم استيراد العضو: ${cleanMember.name}`);
                  })
                  .catch((error) => {
                    console.error(
                      `خطأ في استيراد العضو ${cleanMember.name}:`,
                      error,
                    );
                    errors.push(
                      `خطأ في استيراد العضو ${cleanMember.name}: ${error.message || error}`,
                    );
                  }),
              );
            } catch (error) {
              console.error(`خطأ في معالجة العضو:`, error);
              errors.push(`خطأ في معالجة العضو: ${error}`);
            }
          }

          // Wait for current batch to complete before processing next batch
          await Promise.allSettled(batchPromises);

          // Small delay between batches to prevent overwhelming the database
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Import payments with enhanced batch processing
        const paymentService = await import("@/services/paymentService");

        // Process payments in smaller batches
        const paymentBatches = [];
        for (let i = 0; i < payments.length; i += BATCH_SIZE) {
          paymentBatches.push(payments.slice(i, i + BATCH_SIZE));
        }

        for (const batch of paymentBatches) {
          const batchPromises = [];

          for (let i = 0; i < batch.length; i++) {
            try {
              const payment = batch[i];
              if (!payment || typeof payment !== "object") {
                errors.push(`دفعة غير صحيحة في المجموعة`);
                continue;
              }

              if (payment.amount === undefined || payment.amount === null) {
                errors.push(`دفعة بدون مبلغ`);
                continue;
              }

              const cleanPayment = {
                id:
                  payment.id ||
                  `imported_payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                memberId: payment.memberId || "unknown",
                amount: Math.max(0, Number(payment.amount) || 0),
                date: payment.date || new Date().toISOString(),
                subscriptionType: payment.subscriptionType || "غير محدد",
                paymentMethod: ["cash", "card", "transfer"].includes(
                  payment.paymentMethod,
                )
                  ? payment.paymentMethod
                  : "cash",
                status: ["completed", "pending", "cancelled"].includes(
                  payment.status,
                )
                  ? payment.status
                  : "completed",
                invoiceNumber:
                  payment.invoiceNumber ||
                  `INV-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
                notes: payment.notes || "",
                receiptUrl: payment.receiptUrl || "",
              };

              // Add to batch promises with enhanced error handling
              batchPromises.push(
                paymentService
                  .addOrUpdatePaymentWithId(cleanPayment)
                  .then(() => {
                    importedPayments++;
                    console.log(`تم استيراد الدفعة: ${cleanPayment.amount} دج`);
                  })
                  .catch((error) => {
                    console.error(
                      `خطأ في استيراد الدفعة ${cleanPayment.amount}:`,
                      error,
                    );
                    errors.push(
                      `خطأ في استيراد دفعة ${cleanPayment.amount} دج: ${error.message || error}`,
                    );
                  }),
              );
            } catch (error) {
              console.error(`خطأ في معالجة الدفعة:`, error);
              errors.push(`خطأ في معالجة الدفعة: ${error}`);
            }
          }

          // Wait for current batch to complete
          await Promise.allSettled(batchPromises);

          // Small delay between batches
          await new Promise((resolve) => setTimeout(resolve, 100));
        }

        // Import activities with enhanced batch processing
        const activityBatches = [];
        for (let i = 0; i < activities.length; i += BATCH_SIZE) {
          activityBatches.push(activities.slice(i, i + BATCH_SIZE));
        }

        for (const batch of activityBatches) {
          const batchPromises = [];

          for (let i = 0; i < batch.length; i++) {
            try {
              const activity = batch[i];
              if (
                !activity ||
                typeof activity !== "object" ||
                !activity.memberId
              ) {
                continue; // Skip invalid activities silently
              }

              const cleanActivity = {
                id:
                  activity.id ||
                  `imported_activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                memberId: activity.memberId,
                memberName: activity.memberName || "",
                memberImage: activity.memberImage || "",
                activityType: [
                  "check-in",
                  "membership-renewal",
                  "payment",
                  "other",
                ].includes(activity.activityType)
                  ? activity.activityType
                  : "other",
                timestamp: activity.timestamp || new Date().toISOString(),
                details: activity.details || "",
              };

              // Add to batch promises
              batchPromises.push(
                memberService
                  .addOrUpdateActivityWithId(cleanActivity)
                  .then(() => {
                    importedActivities++;
                    console.log(
                      `تم استيراد النشاط: ${cleanActivity.activityType}`,
                    );
                  })
                  .catch((error) => {
                    console.warn(`تم تجاهل نشاط غير صحيح:`, error);
                  }),
              );
            } catch (error) {
              // Skip failed activities silently
              console.warn(`تم تجاهل نشاط غير صحيح:`, error);
            }
          }

          // Wait for current batch to complete
          await Promise.allSettled(batchPromises);

          // Small delay between batches
          await new Promise((resolve) => setTimeout(resolve, 50));
        }

        // Success feedback
        playSound("success");
        toast({
          title: "✅ تم استيراد جميع البيانات بنجاح",
          description: `تم استيراد ${importedMembers} عضو، ${importedPayments} دفعة، و ${importedActivities} نشاط`,
        });

        // Show errors summary if any
        if (errors.length > 0) {
          setTimeout(() => {
            toast({
              title: "⚠️ تحذيرات الاستيراد",
              description: `تم تجاهل ${errors.length} عنصر بسبب بيانات غير صحيحة`,
              variant: "destructive",
            });
          }, 2000);
          console.warn("Import errors:", errors);
        }

        // Show final success message with reload option
        setTimeout(() => {
          toast({
            title: "🔄 تحديث البيانات",
            description:
              "تم تحديث البيانات بنجاح. سيتم إعادة تحميل الصفحة لضمان عرض جميع التغييرات.",
          });

          // Reload after showing the message
          setTimeout(() => {
            window.location.reload();
          }, 3000);
        }, 1500);
      } catch (error) {
        console.error("Import error:", error);
        playSound("error");
        toast({
          title: "❌ خطأ في الاستيراد",
          description:
            error instanceof Error
              ? error.message
              : "حدث خطأ غير متوقع أثناء الاستيراد",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        if (input.parentNode) {
          input.parentNode.removeChild(input);
        }
      }
    };

    document.body.appendChild(input);
    input.click();
  };

  // Handle activation code verification
  const handleActivationSubmit = () => {
    const correctCode = "je suis la"; // Same as content lock code

    if (activationCode.toLowerCase().trim() === correctCode) {
      setShowActivationDialog(false);
      setActivationCode("");
      exportDataWithCode();
    } else {
      toast({
        title: "خطأ",
        description: "كود التفعيل غير صحيح",
        variant: "destructive",
      });
    }
  };

  // Export all data as downloadable file - same as PaymentsPage
  const exportDataWithCode = async () => {
    setIsLoading(true);

    try {
      toast({
        title: "جاري تحضير البيانات...",
        description: "يرجى الانتظار، جاري جمع البيانات",
      });

      // Fetch all data from all sources
      const [payments, members, activities] = await Promise.all([
        import("@/services/paymentService").then((service) =>
          service.getAllPayments(),
        ),
        import("@/services/memberService").then((service) =>
          service.getAllMembers(),
        ),
        import("@/services/memberService").then(
          (service) => service.getRecentActivities(100000), // Get all activities
        ),
      ]);

      console.log(
        `Export: Found ${payments?.length || 0} payments, ${members?.length || 0} members, ${activities?.length || 0} activities`,
      );

      // Validate and clean data
      const cleanPayments = (payments || []).map((payment, index) => ({
        id: payment?.id || `payment_${Date.now()}_${index}`,
        memberId: payment?.memberId || `unknown_${index}`,
        amount: Number(payment?.amount) || 0,
        date: payment?.date || new Date().toISOString(),
        subscriptionType: payment?.subscriptionType || "غير محدد",
        paymentMethod: payment?.paymentMethod || "cash",
        status: payment?.status || "completed",
        invoiceNumber: payment?.invoiceNumber || `INV-${Date.now()}-${index}`,
        notes: payment?.notes || "",
        receiptUrl: payment?.receiptUrl || "",
      }));

      const cleanMembers = (members || []).map((member, index) => ({
        id: member?.id || `member_${Date.now()}_${index}`,
        name: member?.name || `عضو ${index + 1}`,
        membershipStatus: member?.membershipStatus || "pending",
        lastAttendance:
          member?.lastAttendance || new Date().toISOString().split("T")[0],
        imageUrl: member?.imageUrl || "",
        phoneNumber: member?.phoneNumber || member?.phone || "",
        email: member?.email || "",
        membershipType: member?.membershipType || "",
        membershipStartDate: member?.membershipStartDate || "",
        membershipEndDate: member?.membershipEndDate || "",
        subscriptionType: member?.subscriptionType,
        sessionsRemaining: Number(member?.sessionsRemaining) || 0,
        subscriptionPrice: Number(member?.subscriptionPrice) || 0,
        paymentStatus: member?.paymentStatus || "unpaid",
        note: member?.note || "",
      }));

      const cleanActivities = (activities || []).map((activity, index) => ({
        id: activity?.id || `activity_${Date.now()}_${index}`,
        memberId: activity?.memberId || `unknown_${index}`,
        memberName: activity?.memberName || "",
        memberImage: activity?.memberImage || "",
        activityType: activity?.activityType || "other",
        timestamp: activity?.timestamp || new Date().toISOString(),
        details: activity?.details || "",
      }));

      // Create comprehensive export data
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: "4.0",
          gymName: "Amino Gym",
          exportId: `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          totalPayments: cleanPayments.length,
          totalMembers: cleanMembers.length,
          totalActivities: cleanActivities.length,
          totalRevenue: cleanPayments.reduce(
            (sum, p) => sum + (p.amount || 0),
            0,
          ),
          dataIntegrity: {
            paymentsChecksum: cleanPayments.length,
            membersChecksum: cleanMembers.length,
            activitiesChecksum: cleanActivities.length,
            exportComplete: true,
          },
        },
        data: {
          payments: cleanPayments,
          members: cleanMembers,
          activities: cleanActivities,
        },
        settings: {
          pricing: localStorage.getItem("gymPricingSettings") || "{}",
          user: localStorage.getItem("gymUserSettings") || "{}",
          password: localStorage.getItem("gymPassword") || "ADMIN",
          notifications:
            localStorage.getItem("gymNotificationSettings") || "{}",
        },
      };

      // Create file content
      const dataStr = JSON.stringify(exportData, null, 2);

      if (!dataStr || dataStr.length < 10) {
        throw new Error("فشل في إنشاء ملف التصدير");
      }

      const now = new Date();
      const date = now.toISOString().split("T")[0].replace(/-/g, "");
      const time = now.toTimeString().split(" ")[0].replace(/:/g, "");
      const fileName = `بياناتي-${date}-${time}.json`;

      // Create and trigger download
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      playSound("success");
      toast({
        title: "✅ تم تصدير البيانات بنجاح",
        description: `تم تحميل ${cleanPayments.length} دفعة، ${cleanMembers.length} عضو، و ${cleanActivities.length} نشاط`,
      });
    } catch (error) {
      console.error("Export error:", error);
      playSound("error");

      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع";

      toast({
        title: "❌ خطأ في التصدير",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Clear all data
  const clearAllData = () => {
    if (
      confirm(
        "هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!",
      )
    ) {
      // Clear all gym-related data
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("gym-tracker") || key.startsWith("gym"))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));

      toast({
        title: "تم المسح",
        description: "تم حذف جميع البيانات بنجاح",
      });

      setTimeout(() => window.location.reload(), 1500);
    }
  };

  return (
    <>
      <TopMobileNavigation
        activeItem="settings"
        setActiveItem={(item) => {
          if (onNavigate) {
            onNavigate(item);
          }
        }}
        onSettingsClick={() => {}}
      />

      <div className="bg-gradient-to-br from-bluegray-900 via-bluegray-800 to-bluegray-900 text-white min-h-screen overflow-y-auto fixed inset-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pt-20 pb-32 sm:pb-32 lg:pt-8 lg:pb-24 max-w-6xl xl:max-w-7xl h-full overflow-y-auto">
          {/* Header */}
          <div className="flex items-center gap-4 sm:gap-6 lg:gap-6 mb-6 sm:mb-8 lg:mb-12">
            <Button
              variant="ghost"
              size="icon"
              onClick={onBack}
              className="text-white hover:bg-white/10 h-10 w-10 sm:h-12 sm:w-12 lg:h-14 lg:w-14"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />
            </Button>
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-4xl xl:text-5xl font-bold bg-gradient-to-r from-yellow-400 to-blue-400 bg-clip-text text-transparent mb-2 lg:mb-3">
                الإعدادات
              </h1>
              <p className="text-gray-300 text-sm sm:text-base lg:text-lg xl:text-xl leading-relaxed">
                تخصيص إعدادات النظام
              </p>
            </div>
          </div>

          {/* Data Management Button - Same as PaymentsPage */}
          <div className="mb-6 sm:mb-8 lg:mb-8 xl:mb-12">
            <div className="text-center mb-4">
              <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/50">
                <h2 className="text-xl font-bold text-yellow-400 mb-2">
                  إدارة البيانات
                </h2>
                <p className="text-slate-300 text-sm">
                  تصدير واستيراد ومسح البيانات بطريقة احترافية ومنظمة
                </p>

                {/* Data Management Button */}
                <div className="flex justify-center mt-4">
                  <div className="relative group">
                    <Button
                      className="bg-gradient-to-r from-yellow-500 to-blue-600 hover:from-yellow-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-semibold"
                      onClick={() => {}}
                      disabled={isLoading}
                    >
                      <Database
                        className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
                      />
                      {isLoading ? "جاري المعالجة..." : "إدارة البيانات"}
                    </Button>

                    {/* Dropdown Menu */}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-20">
                      <div className="bg-slate-800/95 backdrop-blur-xl rounded-lg shadow-2xl border border-slate-600/50 p-2 min-w-[200px]">
                        <Button
                          onClick={() => setShowActivationDialog(true)}
                          disabled={isLoading}
                          className="w-full justify-start bg-transparent hover:bg-slate-700/50 text-gray-200 hover:text-white border-0 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Download
                            className={`h-4 w-4 mr-2 ${isLoading ? "animate-pulse" : ""}`}
                          />
                          {isLoading ? "جاري المعالجة..." : "تحميل البيانات"}
                        </Button>
                        <Button
                          onClick={importData}
                          disabled={isLoading}
                          className="w-full justify-start bg-transparent hover:bg-slate-700/50 text-gray-200 hover:text-white border-0 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Upload
                            className={`h-4 w-4 mr-2 ${isLoading ? "animate-pulse" : ""}`}
                          />
                          {isLoading ? "جاري الاستيراد..." : "استيراد البيانات"}
                        </Button>
                        <Button
                          onClick={clearAllData}
                          disabled={isLoading}
                          className="w-full justify-start bg-transparent hover:bg-slate-700/50 text-gray-200 hover:text-white border-0 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Trash2
                            className={`h-4 w-4 mr-2 ${isLoading ? "animate-pulse" : ""}`}
                          />
                          {isLoading ? "جاري المعالجة..." : "مسح جميع البيانات"}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 sm:space-y-8 lg:space-y-8 xl:space-y-12">
            {/* Pricing Section */}
            <Card className="bg-gradient-to-br from-bluegray-800/80 to-bluegray-900/80 backdrop-blur-xl border border-bluegray-600/50 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <CardHeader className="p-6 lg:p-8 xl:p-10">
                <CardTitle className="text-xl lg:text-2xl xl:text-3xl font-bold text-white flex items-center gap-3 lg:gap-4">
                  <Tag className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-yellow-400" />
                  الأسعار
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 lg:space-y-6 xl:space-y-8 p-6 lg:p-8 xl:p-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 xl:gap-8">
                  <div>
                    <Label className="text-gray-300 mb-2 lg:mb-3 block text-sm lg:text-base xl:text-lg font-medium">
                      حصة واحدة
                    </Label>
                    <Input
                      type="number"
                      value={singleSession}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers
                        if (value === "" || /^\d+$/.test(value)) {
                          setSingleSession(value);
                        }
                      }}
                      className="bg-bluegray-700/50 border-bluegray-600 text-white h-12 lg:h-14 text-base lg:text-lg"
                      placeholder="Enter price"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-2 lg:mb-3 block text-sm lg:text-base xl:text-lg font-medium">
                      13 حصة
                    </Label>
                    <Input
                      type="number"
                      value={sessions13}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers
                        if (value === "" || /^\d+$/.test(value)) {
                          setSessions13(value);
                        }
                      }}
                      className="bg-bluegray-700/50 border-bluegray-600 text-white h-12 lg:h-14 text-base lg:text-lg"
                      placeholder="Enter price"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-2 lg:mb-3 block text-sm lg:text-base xl:text-lg font-medium">
                      15 حصة
                    </Label>
                    <Input
                      type="number"
                      value={sessions15}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers
                        if (value === "" || /^\d+$/.test(value)) {
                          setSessions15(value);
                        }
                      }}
                      className="bg-bluegray-700/50 border-bluegray-600 text-white h-12 lg:h-14 text-base lg:text-lg"
                      placeholder="Enter price"
                      dir="ltr"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300 mb-2 lg:mb-3 block text-sm lg:text-base xl:text-lg font-medium">
                      30 حصة
                    </Label>
                    <Input
                      type="number"
                      value={sessions30}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow numbers
                        if (value === "" || /^\d+$/.test(value)) {
                          setSessions30(value);
                        }
                      }}
                      className="bg-bluegray-700/50 border-bluegray-600 text-white h-12 lg:h-14 text-base lg:text-lg"
                      placeholder="Enter price"
                      dir="ltr"
                    />
                  </div>
                </div>

                <Button
                  onClick={savePricing}
                  className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white h-12 lg:h-14 text-base lg:text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <Save className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
                  حفظ الأسعار
                </Button>
              </CardContent>
            </Card>

            {/* User Settings Section */}
            <Card className="bg-gradient-to-br from-bluegray-800/80 to-bluegray-900/80 backdrop-blur-xl border border-bluegray-600/50 shadow-2xl hover:shadow-3xl transition-all duration-500">
              <CardHeader className="p-6 lg:p-8 xl:p-10">
                <CardTitle className="text-xl lg:text-2xl xl:text-3xl font-bold text-white flex items-center gap-3 lg:gap-4">
                  <User className="h-5 w-5 lg:h-6 lg:w-6 xl:h-7 xl:w-7 text-blue-400" />
                  إعدادات المستخدم
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 lg:space-y-6 xl:space-y-8 p-6 lg:p-8 xl:p-10">
                <div>
                  <Label className="text-gray-300 mb-2 block">
                    اسم المستخدم
                  </Label>
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="bg-bluegray-700/50 border-bluegray-600 text-white"
                    placeholder="أدخل اسم المستخدم"
                  />
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">
                    كلمة المرور الحالية
                  </Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className="bg-bluegray-700/50 border-bluegray-600 text-white pr-12"
                      placeholder="أدخل كلمة المرور الحالية"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <Label className="text-gray-300 mb-2 block">
                    كلمة المرور الجديدة
                  </Label>
                  <div className="relative">
                    <Input
                      type={showNewPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="bg-bluegray-700/50 border-bluegray-600 text-white pr-12"
                      placeholder="أدخل كلمة المرور الجديدة"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                    >
                      {showNewPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <Button
                  onClick={saveUserSettings}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  حفظ الإعدادات
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Toaster />

      {/* Activation Code Dialog */}
      <Dialog
        open={showActivationDialog}
        onOpenChange={setShowActivationDialog}
      >
        <DialogContent className="bg-gradient-to-br from-bluegray-800/95 to-bluegray-900/95 backdrop-blur-xl border border-bluegray-600/50 text-white">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-yellow-400 flex items-center gap-2">
              <Key className="h-5 w-5" />
              كود التفعيل
            </DialogTitle>
            <DialogDescription className="text-gray-300">
              يرجى إدخال كود التفعيل لتصدير البيانات
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label className="text-gray-300 mb-2 block">كود التفعيل</Label>
              <Input
                type="text"
                value={activationCode}
                onChange={(e) => setActivationCode(e.target.value)}
                className="bg-bluegray-700/50 border-bluegray-600 text-white"
                placeholder="أدخل كود التفعيل"
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    handleActivationSubmit();
                  }
                }}
              />
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowActivationDialog(false);
                setActivationCode("");
              }}
              className="bg-transparent border-gray-600 text-gray-300 hover:bg-gray-700/50"
            >
              إلغاء
            </Button>
            <Button
              onClick={handleActivationSubmit}
              className="bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white"
            >
              تأكيد
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Mobile Bottom Navigation */}
      <MobileNavigationComponent
        activeItem="settings"
        setActiveItem={(item) => {
          if (onNavigate) {
            onNavigate(item);
          }
        }}
        onTodayAttendanceClick={() => {
          if (onNavigate) {
            onNavigate("today-attendance");
          }
        }}
        onPendingPaymentsClick={() => {
          if (onNavigate) {
            onNavigate("pending-payments");
          }
        }}
        onAddSessionClick={() => {
          // Handle add session from settings
          if (onNavigate) {
            onNavigate("dashboard");
            // Trigger add session dialog after navigation
            setTimeout(() => {
              const event = new CustomEvent("openAddSessionDialog");
              window.dispatchEvent(event);
            }, 100);
          }
        }}
        onAddMemberClick={() => {
          // Handle add member from settings
          if (onNavigate) {
            onNavigate("attendance");
            // Trigger add member dialog after navigation
            setTimeout(() => {
              const event = new CustomEvent("openAddMemberDialog");
              window.dispatchEvent(event);
            }, 100);
          }
        }}
      />
    </>
  );
};

export default SettingsPage;
