import React, { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import PaymentForm from "./PaymentForm";
import PaymentsList from "./PaymentsList";
import {
  Payment,
  getPaymentStatistics,
  getAllPayments,
} from "@/services/paymentService";
import { getAllMembers } from "@/services/memberService";
import { formatNumber } from "@/lib/utils";
import {
  TrendingUp,
  DollarSign,
  Download,
  Upload,
  Database,
  Cloud,
} from "lucide-react";

const PaymentsPage = () => {
  const [refreshPaymentsList, setRefreshPaymentsList] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [statistics, setStatistics] = useState<{
    totalRevenue: number;
    monthRevenue: number;
    weekRevenue: number;
    todayRevenue: number;
  }>({ totalRevenue: 0, monthRevenue: 0, weekRevenue: 0, todayRevenue: 0 });
  const paymentsListRef = useRef<{ fetchPayments?: () => Promise<void> }>({});
  const { toast } = useToast();

  const handlePaymentSuccess = () => {
    setRefreshPaymentsList((prev) => prev + 1);
    setEditingPayment(null);
    // If we have a direct reference to the fetchPayments function, call it
    if (paymentsListRef.current?.fetchPayments) {
      paymentsListRef.current.fetchPayments();
    }
    // Refresh statistics
    fetchStatistics();
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
  };

  const handleCancelEdit = () => {
    setEditingPayment(null);
  };

  // Function to fetch payment statistics
  const fetchStatistics = async () => {
    try {
      const stats = await getPaymentStatistics();
      // Ensure all values are valid numbers
      const safeRound = (value: any) => {
        const num = Number(value);
        return isNaN(num) || !isFinite(num) ? 0 : Math.round(num);
      };

      setStatistics({
        totalRevenue: safeRound(stats.totalRevenue),
        monthRevenue: safeRound(stats.monthRevenue),
        weekRevenue: safeRound(stats.weekRevenue),
        todayRevenue: safeRound(stats.todayRevenue),
      });
    } catch (error) {
      console.error("Error fetching payment statistics:", error);
      // Set default values in case of error
      setStatistics({
        totalRevenue: 0,
        monthRevenue: 0,
        weekRevenue: 0,
        todayRevenue: 0,
      });
    }
  };

  // Function to expose the fetchPayments method from PaymentsList
  const registerPaymentsList = (methods: {
    fetchPayments: () => Promise<void>;
  }) => {
    paymentsListRef.current = methods;
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

  // Export all data as downloadable file
  const handleExportData = async () => {
    setIsLoading(true);

    try {
      toast({
        title: "جاري تحضير البيانات...",
        description: "يرجى الانتظار، جاري جمع البيانات",
      });

      // Fetch all data from all sources
      const [payments, members, activities] = await Promise.all([
        getAllPayments(),
        getAllMembers(),
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
          gymName: "Yacin Gym",
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
      };

      // Create file content
      const dataStr = JSON.stringify(exportData, null, 2);

      if (!dataStr || dataStr.length < 10) {
        throw new Error("فشل في إنشاء ملف التصدير");
      }

      const timestamp = new Date()
        .toISOString()
        .split("T")[0]
        .replace(/-/g, "");
      const fileName = `yacin-gym-complete-backup-${timestamp}.json`;

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

  // Import all data with comprehensive handling
  const handleImportData = () => {
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

        // Refresh all data immediately
        await fetchStatistics();
        setRefreshPaymentsList((prev) => prev + 1);

        // Force refresh the payments list component
        if (paymentsListRef.current?.fetchPayments) {
          await paymentsListRef.current.fetchPayments();
        }

        // Force a final database sync before showing completion message
        try {
          const finalMemberService = await import("@/services/memberService");
          const finalPaymentService = await import("@/services/paymentService");

          // Force all databases to sync
          await Promise.all([
            finalMemberService.getAllMembers(),
            finalPaymentService.getAllPayments(),
            finalMemberService.getRecentActivities(1),
          ]);

          console.log(
            `استيراد مكتمل: ${importedMembers} أعضاء، ${importedPayments} دفعات، ${importedActivities} أنشطة`,
          );
        } catch (syncError) {
          console.warn("تحذير في المزامنة النهائية:", syncError);
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

  // Fetch statistics on component mount and when payments are refreshed
  useEffect(() => {
    fetchStatistics();
  }, [refreshPaymentsList]);

  return (
    <div className="space-y-4 max-w-6xl mx-auto p-4">
      {/* Simple Welcome Header */}
      <div className="text-center mb-4">
        <div className="bg-slate-800/80 rounded-lg p-4 border border-slate-700/50">
          <h2 className="text-xl font-bold text-yellow-400 mb-2">
            إدارة المدفوعات
          </h2>
          <p className="text-slate-300 text-sm">
            تتبع وإدارة جميع المدفوعات والإيرادات بطريقة احترافية ومنظمة
          </p>

          {/* Data Management Button */}
          <div className="flex justify-center mt-4"></div>
        </div>
      </div>
      {/* Statistics Cards - Same as Dashboard */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold text-yellow-400">
                {formatNumber(statistics.totalRevenue)}
              </div>
              <div className="text-sm text-gray-300 mt-1">إجمالي الإيرادات</div>
              <div className="text-xs text-gray-400 mt-1">دينار جزائري</div>
            </div>
            <div className="bg-yellow-500/20 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-yellow-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold text-green-400">
                {formatNumber(statistics.monthRevenue)}
              </div>
              <div className="text-sm text-gray-300 mt-1">إيرادات الشهر</div>
              <div className="text-xs text-gray-400 mt-1">دينار جزائري</div>
            </div>
            <div className="bg-green-500/20 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-green-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold text-blue-400">
                {formatNumber(statistics.weekRevenue)}
              </div>
              <div className="text-sm text-gray-300 mt-1">إيرادات الأسبوع</div>
              <div className="text-xs text-gray-400 mt-1">دينار جزائري</div>
            </div>
            <div className="bg-blue-500/20 p-3 rounded-lg">
              <TrendingUp className="h-6 w-6 text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="text-2xl font-bold text-purple-400">
                {formatNumber(statistics.todayRevenue)}
              </div>
              <div className="text-sm text-gray-300 mt-1">إيرادات اليوم</div>
              <div className="text-xs text-gray-400 mt-1">دينار جزائري</div>
            </div>
            <div className="bg-purple-500/20 p-3 rounded-lg">
              <DollarSign className="h-6 w-6 text-purple-400" />
            </div>
          </div>
        </Card>
      </div>
      {/* Main Content - Same Layout as Dashboard */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Payment Form */}
        <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">
              إضافة دفعة جديدة
            </h3>
            <p className="text-gray-300 text-sm">
              قم بإدخال تفاصيل الدفعة الجديدة
            </p>
          </div>
          <PaymentForm
            onSuccess={handlePaymentSuccess}
            editingPayment={editingPayment}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Payments List */}
        <div className="bg-slate-800/60 rounded-lg p-4 border border-slate-700/50">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-yellow-400 mb-2">
              قائمة المدفوعات
            </h3>
            <p className="text-gray-300 text-sm">عرض وإدارة جميع المدفوعات</p>
          </div>
          <PaymentsList
            onRefresh={refreshPaymentsList}
            onEditPayment={handleEditPayment}
            ref={registerPaymentsList}
          />
        </div>
      </div>
      <Toaster />
    </div>
  );
};

export default PaymentsPage;
