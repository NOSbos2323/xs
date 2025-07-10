import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LogOut,
  Search,
  X,
  Calendar,
  CreditCard,
  Settings,
  Tag,
  User,
  Database,
  Edit,
  Download,
  Upload,
  Trash2,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface TopMobileNavigationProps {
  activeItem: string;
  setActiveItem: (item: string) => void;
  onTodayAttendanceClick?: () => void;
  onPendingPaymentsClick?: () => void;
  onSettingsClick?: () => void;
}

const TopMobileNavigation = ({
  activeItem,
  setActiveItem,
  onTodayAttendanceClick = () => {},
  onPendingPaymentsClick = () => {},
  onSettingsClick = () => {},
}: TopMobileNavigationProps) => {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPricingDialogOpen, setIsPricingDialogOpen] = useState(false);
  const [isUserSettingsDialogOpen, setIsUserSettingsDialogOpen] =
    useState(false);
  const [isDataSettingsDialogOpen, setIsDataSettingsDialogOpen] =
    useState(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [isAccountDialogOpen, setIsAccountDialogOpen] = useState(false);
  const [isNotificationDialogOpen, setIsNotificationDialogOpen] =
    useState(false);
  const [isBackupDialogOpen, setIsBackupDialogOpen] = useState(false);
  const [isImportDialogOpen, setIsImportDialogOpen] = useState(false);
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const [isClearDataDialogOpen, setIsClearDataDialogOpen] = useState(false);

  // Form states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [accountName, setAccountName] = useState("المدير");
  const [accountEmail, setAccountEmail] = useState("admin@aminoGym.com");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  // Export data with comprehensive database handling - same as PaymentsPage
  const exportData = async () => {
    try {
      alert("جاري تحضير البيانات...\nيرجى الانتظار، جاري جمع البيانات");

      // Fetch all data from all sources using dynamic imports
      const [paymentService, memberService] = await Promise.all([
        import("@/services/paymentService"),
        import("@/services/memberService"),
      ]);

      const [payments, members, activities] = await Promise.all([
        paymentService.getAllPayments(),
        memberService.getAllMembers(),
        memberService.getRecentActivities(100000), // Get all activities
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
      const fileName = `amino-gym-complete-backup-${timestamp}.json`;

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

      alert(
        `✅ تم التصدير بنجاح\nتم تحميل ${cleanPayments.length} دفعة، ${cleanMembers.length} عضو، و ${cleanActivities.length} نشاط`,
      );
    } catch (error) {
      console.error("Export error:", error);
      const errorMessage =
        error instanceof Error ? error.message : "حدث خطأ غير متوقع";
      alert(`❌ خطأ في التصدير\n${errorMessage}`);
    }
  };

  // Import data with comprehensive handling - same as PaymentsPage
  const importData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Show confirmation dialog
    if (
      !confirm(
        "⚠️ هل أنت متأكد من استيراد البيانات؟ سيتم استبدال جميع البيانات الحالية في قاعدة البيانات.",
      )
    ) {
      return;
    }

    try {
      alert("جاري استيراد جميع البيانات...\nيرجى الانتظار، جاري معالجة الملف");

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

      // Import services
      const [memberService, paymentService] = await Promise.all([
        import("@/services/memberService"),
        import("@/services/paymentService"),
      ]);

      // Extract data from different formats
      let members = [];
      let payments = [];
      let activities = [];

      // Handle new format with metadata
      if (importData.data) {
        members = importData.data.members || [];
        payments = importData.data.payments || [];
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

      if (!Array.isArray(members)) members = [];
      if (!Array.isArray(payments)) payments = [];
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
      const BATCH_SIZE = 5; // Smaller batches for mobile
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
                member.lastAttendance || new Date().toISOString().split("T")[0],
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

        await Promise.allSettled(batchPromises);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }

      // Import payments with enhanced batch processing
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

        await Promise.allSettled(batchPromises);
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
            console.warn(`تم تجاهل نشاط غير صحيح:`, error);
          }
        }

        await Promise.allSettled(batchPromises);
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      alert(
        `✅ تم استيراد جميع البيانات بنجاح\nتم استيراد ${importedMembers} عضو، ${importedPayments} دفعة، و ${importedActivities} نشاط`,
      );

      // Show errors summary if any
      if (errors.length > 0) {
        setTimeout(() => {
          alert(
            `⚠️ تحذيرات الاستيراد\nتم تجاهل ${errors.length} عنصر بسبب بيانات غير صحيحة`,
          );
        }, 2000);
        console.warn("Import errors:", errors);
      }

      // Show reload message and then reload
      setTimeout(() => {
        alert(
          "🔄 تحديث البيانات\nسيتم إعادة تحميل الصفحة لضمان عرض جميع التغييرات المستوردة.",
        );

        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }, 1500);
    } catch (error) {
      console.error("Import error:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "حدث خطأ غير متوقع أثناء الاستيراد";
      alert(`❌ خطأ في الاستيراد\n${errorMessage}`);
    }
  };

  // Clear all data
  const clearAllData = () => {
    if (
      confirm(
        "هل أنت متأكد من حذف جميع البيانات؟ لا يمكن التراجع عن هذا الإجراء!",
      )
    ) {
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.startsWith("gym-tracker") || key.startsWith("gym"))) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach((key) => localStorage.removeItem(key));
      alert("تم حذف جميع البيانات بنجاح");
      setTimeout(() => window.location.reload(), 1500);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  const handleSearch = () => {
    if (isSearchActive) {
      // Perform search with the query
      console.log("Searching for:", searchQuery);
      // You can implement actual search functionality here
    } else {
      // Activate search mode
      setIsSearchActive(true);
    }
  };

  const closeSearch = () => {
    setIsSearchActive(false);
    setSearchQuery("");
  };

  return (
    <div className="fixed top-0 left-0 right-0 bg-gradient-to-br from-bluegray-800/95 to-bluegray-900/95 backdrop-blur-xl border-b border-bluegray-500/50 shadow-2xl lg:hidden z-40 h-16 safe-area-top">
      {/* Enhanced gradient background with better mobile optimization */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/8 via-blue-500/8 to-purple-500/8" />

      <div className="relative flex justify-between items-center h-full px-3 sm:px-4">
        {/* Settings Button - Far Left */}
        <motion.div
          className="p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-400/40 backdrop-blur-sm"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={onSettingsClick}
        >
          <Settings
            size={16}
            className="sm:w-[18px] sm:h-[18px] text-bluegray-800"
          />
        </motion.div>

        <div className="flex-1 text-center">
          <h2
            className="text-lg sm:text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 drop-shadow-[0_1.2px_1.2px_rgba(255,215,0,0.3)]"
            style={{ textShadow: "0 0 8px rgba(234, 179, 8, 0.3)" }}
          >
            Amino Gym
          </h2>
        </div>

        <motion.div
          className="p-2.5 sm:p-3 rounded-full bg-gradient-to-r from-yellow-500 to-yellow-600 flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 border border-yellow-400/40 backdrop-blur-sm"
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.1 }}
          onClick={handleLogout}
        >
          <LogOut
            size={16}
            className="sm:w-[18px] sm:h-[18px] text-bluegray-800"
          />
        </motion.div>
      </div>

      {/* Settings Menu */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            {/* Overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
              onClick={() => setIsSettingsOpen(false)}
            />

            {/* Settings Menu */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-80 bg-gradient-to-br from-bluegray-800/95 to-bluegray-900/95 backdrop-blur-xl shadow-2xl z-50 border-r border-bluegray-600/50 overflow-y-auto"
            >
              <div className="p-6">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
                    الإعدادات
                  </h2>
                  <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="p-2 rounded-full bg-bluegray-700/50 hover:bg-bluegray-600 transition-colors"
                  >
                    <X className="h-5 w-5 text-white" />
                  </button>
                </div>

                {/* Settings Sections */}
                <div className="space-y-6">
                  {/* Pricing Section */}
                  <div>
                    <button
                      onClick={() => {
                        setIsPricingDialogOpen(true);
                        setIsSettingsOpen(false);
                      }}
                      className="w-full bg-bluegray-700/50 hover:bg-bluegray-600/50 rounded-lg p-4 border border-bluegray-600/50 text-right transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Tag className="h-5 w-5 text-yellow-400" />
                          <span className="text-white font-semibold">
                            الأسعار
                          </span>
                        </div>
                        <span className="text-yellow-400">›</span>
                      </div>
                    </button>
                  </div>

                  {/* User Settings Section */}
                  <div>
                    <button
                      onClick={() => {
                        setIsUserSettingsDialogOpen(true);
                        setIsSettingsOpen(false);
                      }}
                      className="w-full bg-bluegray-700/50 hover:bg-bluegray-600/50 rounded-lg p-4 border border-bluegray-600/50 text-right transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <User className="h-5 w-5 text-blue-400" />
                          <span className="text-white font-semibold">
                            الإعدادات الشخصية
                          </span>
                        </div>
                        <span className="text-blue-400">›</span>
                      </div>
                    </button>
                  </div>

                  {/* Data Settings Section */}
                  <div>
                    <button
                      onClick={() => {
                        setIsDataSettingsDialogOpen(true);
                        setIsSettingsOpen(false);
                      }}
                      className="w-full bg-bluegray-700/50 hover:bg-bluegray-600/50 rounded-lg p-4 border border-bluegray-600/50 text-right transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Database className="h-5 w-5 text-green-400" />
                          <span className="text-white font-semibold">
                            إعدادات البيانات
                          </span>
                        </div>
                        <span className="text-green-400">›</span>
                      </div>
                    </button>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 rounded-lg p-4 text-white font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <LogOut className="h-5 w-5" />
                      <span>تسجيل الخروج</span>
                    </div>
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Pricing Dialog */}
      <Dialog open={isPricingDialogOpen} onOpenChange={setIsPricingDialogOpen}>
        <DialogContent className="bg-bluegray-800 text-white border-bluegray-700 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-600 bg-clip-text text-transparent">
              الأسعار
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-3">
              <div className="bg-bluegray-700/50 rounded-lg p-4 border border-bluegray-600/50">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">حصة واحدة</span>
                  <span className="text-yellow-400 font-semibold">200 دج</span>
                </div>
              </div>
              <div className="bg-bluegray-700/50 rounded-lg p-4 border border-bluegray-600/50">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">13 حصة</span>
                  <span className="text-yellow-400 font-semibold">
                    1,500 دج
                  </span>
                </div>
              </div>
              <div className="bg-bluegray-700/50 rounded-lg p-4 border border-bluegray-600/50">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">15 حصة</span>
                  <span className="text-yellow-400 font-semibold">
                    1,800 دج
                  </span>
                </div>
              </div>
              <div className="bg-bluegray-700/50 rounded-lg p-4 border border-bluegray-600/50">
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">30 حصة</span>
                  <span className="text-yellow-400 font-semibold">
                    1,800 دج
                  </span>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsPricingDialogOpen(false)}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* User Settings Dialog */}
      <Dialog
        open={isUserSettingsDialogOpen}
        onOpenChange={setIsUserSettingsDialogOpen}
      >
        <DialogContent className="bg-bluegray-800 text-white border-bluegray-700 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              الإعدادات الشخصية
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <button
              onClick={() => {
                setIsUserSettingsDialogOpen(false);
                setIsPasswordDialogOpen(true);
              }}
              className="w-full bg-bluegray-700/50 hover:bg-bluegray-600/50 rounded-lg p-4 border border-bluegray-600/50 text-right transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-300">تغيير كلمة المرور</span>
                <span className="text-blue-400">›</span>
              </div>
            </button>
            <button
              onClick={() => {
                setIsUserSettingsDialogOpen(false);
                setIsAccountDialogOpen(true);
              }}
              className="w-full bg-bluegray-700/50 hover:bg-bluegray-600/50 rounded-lg p-4 border border-bluegray-600/50 text-right transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-300">معلومات الحساب</span>
                <span className="text-blue-400">›</span>
              </div>
            </button>
            <button
              onClick={() => {
                setIsUserSettingsDialogOpen(false);
                setIsNotificationDialogOpen(true);
              }}
              className="w-full bg-bluegray-700/50 hover:bg-bluegray-600/50 rounded-lg p-4 border border-bluegray-600/50 text-right transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-gray-300">إعدادات الإشعارات</span>
                <span className="text-blue-400">›</span>
              </div>
            </button>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsUserSettingsDialogOpen(false)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Data Settings Dialog */}
      <Dialog
        open={isDataSettingsDialogOpen}
        onOpenChange={setIsDataSettingsDialogOpen}
      >
        <DialogContent className="bg-bluegray-800 text-white border-bluegray-700 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-green-400 to-green-600 bg-clip-text text-transparent">
              إعدادات البيانات
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="text-center p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
              <p className="text-blue-300 text-sm">
                تم نقل إدارة البيانات إلى صفحة الإعدادات
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsDataSettingsDialogOpen(false)}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
            >
              إغلاق
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Change Dialog */}
      <Dialog
        open={isPasswordDialogOpen}
        onOpenChange={setIsPasswordDialogOpen}
      >
        <DialogContent className="bg-bluegray-800 text-white border-bluegray-700 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              تغيير كلمة المرور
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="currentPassword" className="text-gray-300">
                كلمة المرور الحالية
              </Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-bluegray-700 border-bluegray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="newPassword" className="text-gray-300">
                كلمة المرور الجديدة
              </Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-bluegray-700 border-bluegray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="confirmPassword" className="text-gray-300">
                تأكيد كلمة المرور
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-bluegray-700 border-bluegray-600 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPasswordDialogOpen(false)}
              className="border-bluegray-600 text-gray-300 hover:bg-bluegray-700"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                // Handle password change logic here
                setIsPasswordDialogOpen(false);
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Account Info Dialog */}
      <Dialog open={isAccountDialogOpen} onOpenChange={setIsAccountDialogOpen}>
        <DialogContent className="bg-bluegray-800 text-white border-bluegray-700 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              معلومات الحساب
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="accountName" className="text-gray-300">
                اسم المستخدم
              </Label>
              <Input
                id="accountName"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="bg-bluegray-700 border-bluegray-600 text-white"
              />
            </div>
            <div>
              <Label htmlFor="accountEmail" className="text-gray-300">
                البريد الإلكتروني
              </Label>
              <Input
                id="accountEmail"
                type="email"
                value={accountEmail}
                onChange={(e) => setAccountEmail(e.target.value)}
                className="bg-bluegray-700 border-bluegray-600 text-white"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsAccountDialogOpen(false)}
              className="border-bluegray-600 text-gray-300 hover:bg-bluegray-700"
            >
              إلغاء
            </Button>
            <Button
              onClick={() => {
                // Handle account info update logic here
                setIsAccountDialogOpen(false);
              }}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Notifications Dialog */}
      <Dialog
        open={isNotificationDialogOpen}
        onOpenChange={setIsNotificationDialogOpen}
      >
        <DialogContent className="bg-bluegray-800 text-white border-bluegray-700 max-w-md w-full">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold bg-gradient-to-r from-blue-400 to-blue-600 bg-clip-text text-transparent">
              إعدادات الإشعارات
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-bluegray-700/50 rounded-lg border border-bluegray-600/50">
              <span className="text-gray-300">تفعيل الإشعارات</span>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={`w-12 h-6 rounded-full transition-colors ${notificationsEnabled ? "bg-blue-500" : "bg-gray-600"}`}
              >
                <div
                  className={`w-5 h-5 bg-white rounded-full transition-transform ${notificationsEnabled ? "translate-x-6" : "translate-x-1"}`}
                />
              </button>
            </div>
          </div>
          <DialogFooter>
            <Button
              onClick={() => setIsNotificationDialogOpen(false)}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
            >
              حفظ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TopMobileNavigation;
