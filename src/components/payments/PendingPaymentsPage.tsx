import React, { useState, useEffect, useRef } from "react";
import {
  Phone,
  Calendar,
  DollarSign,
  CreditCard,
  ArrowLeft,
  AlertTriangle,
  Clock,
  User,
  Filter,
  MessageSquare,
  Edit,
  PhoneCall,
  Send,
} from "lucide-react";
import { getAllMembers, Member, updateMember } from "@/services/memberService";
import { formatDate, formatNumber } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import TopMobileNavigation from "../layout/TopMobileNavigation";
import MobileNavigationComponent from "../layout/MobileNavigation";
import MemberDialog from "../attendance/MemberDialog";

interface PendingPaymentsPageProps {
  onBack?: () => void;
}

const PendingPaymentsPage = ({ onBack }: PendingPaymentsPageProps) => {
  const [allUnpaidMembers, setAllUnpaidMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<string>("all");
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Computed filtered members based on selected period
  const filteredMembers = React.useMemo(() => {
    if (selectedPeriod === "all") {
      return allUnpaidMembers;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();

    return allUnpaidMembers.filter((member) => {
      if (!member.membershipStartDate) return false;

      const memberDate = new Date(member.membershipStartDate);
      const memberMonth = memberDate.getMonth();
      const memberYear = memberDate.getFullYear();

      switch (selectedPeriod) {
        case "thisMonth":
          return memberMonth === currentMonth && memberYear === currentYear;

        case "lastMonth":
          const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
          const lastMonthYear =
            currentMonth === 0 ? currentYear - 1 : currentYear;
          return memberMonth === lastMonth && memberYear === lastMonthYear;

        case "expired":
          // Check if subscription has expired (more than 1 month old)
          const oneMonthLater = new Date(memberDate);
          oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
          return currentDate > oneMonthLater;

        default:
          return true;
      }
    });
  }, [allUnpaidMembers, selectedPeriod]);

  // Fetch all unpaid members
  useEffect(() => {
    const fetchUnpaidMembers = async () => {
      setLoading(true);
      try {
        const members = await getAllMembers();

        // Filter members with pending payments or expired subscriptions
        const unpaidMembersList = members.filter((member) => {
          const hasUnpaidStatus =
            member.paymentStatus === "unpaid" ||
            member.paymentStatus === "partial";
          const hasPendingMembership = member.membershipStatus === "pending";
          const hasZeroSessions =
            member.sessionsRemaining !== undefined &&
            member.sessionsRemaining === 0;

          // Check if subscription month has ended
          const hasExpiredSubscription = (() => {
            if (!member.membershipStartDate) return false;

            const startDate = new Date(member.membershipStartDate);
            const currentDate = new Date();

            // Calculate one month from start date
            const oneMonthLater = new Date(startDate);
            oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);

            // Check if current date is past the one month mark
            return currentDate > oneMonthLater;
          })();

          return (
            hasUnpaidStatus ||
            hasPendingMembership ||
            hasZeroSessions ||
            hasExpiredSubscription
          );
        });

        setAllUnpaidMembers(unpaidMembersList);
      } catch (error) {
        console.error("Error fetching unpaid members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUnpaidMembers();
  }, []);

  // Simplified scroll handler to manage header visibility
  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const currentScrollY = event.currentTarget.scrollTop;

    // Header visibility logic
    if (currentScrollY > lastScrollY && currentScrollY > 100) {
      // Scrolling down and past threshold - hide header
      setIsHeaderVisible(false);
    } else if (currentScrollY < lastScrollY || currentScrollY <= 50) {
      // Scrolling up or near top - show header
      setIsHeaderVisible(true);
    }

    setLastScrollY(currentScrollY);
  };

  // Handle sending end of month message
  const handleSendEndOfMonthMessage = (member: Member) => {
    let message = `عزيزي المشترك، نحيطك علمًا بأن اشتراكك في النادي الرياضي قد انتهى.
نرجو منك التوجه إلى الإدارة لتجديد الاشتراك ومواصلة التمارين دون انقطاع.
نحن حريصون على دعمك في مسيرتك الرياضية، ونأمل رؤيتك مجددًا في القاعة.`;

    // Add partial payment amount if applicable
    if (member.paymentStatus === "partial" && member.partialPaymentAmount) {
      message += `

ملاحظة: تم دفع مبلغ ${formatNumber(member.partialPaymentAmount)} دج من إجمالي ${formatNumber(member.subscriptionPrice || 0)} دج.`;
    }

    // Create WhatsApp URL if phone number exists
    if (member.phoneNumber) {
      const whatsappUrl = `https://wa.me/${member.phoneNumber.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(message)}`;
      window.open(whatsappUrl, "_blank");
    } else {
      // Copy message to clipboard if no phone number
      navigator.clipboard.writeText(message).then(() => {
        alert("تم نسخ الرسالة إلى الحافظة");
      });
    }
  };

  // Handle calling member
  const handleCallMember = (member: Member) => {
    if (member.phoneNumber) {
      window.open(`tel:${member.phoneNumber}`, "_self");
    } else {
      alert("لا يوجد رقم هاتف لهذا العضو");
    }
  };

  // Handle editing member
  const handleEditMember = (member: Member) => {
    setEditingMember(member);
    setIsEditDialogOpen(true);
  };

  // Handle saving edited member
  const handleSaveMember = async (memberData: Partial<Member>) => {
    if (editingMember) {
      try {
        const updatedMember = { ...editingMember, ...memberData };
        await updateMember(updatedMember);

        // Update the local state
        setAllUnpaidMembers((prev) =>
          prev.map((m) => (m.id === editingMember.id ? updatedMember : m)),
        );

        setIsEditDialogOpen(false);
        setEditingMember(null);
      } catch (error) {
        console.error("Error updating member:", error);
        alert("حدث خطأ أثناء تحديث بيانات العضو");
      }
    }
  };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col overflow-hidden">
      {/* Mobile Navigation */}
      <div className="lg:hidden flex-shrink-0">
        <TopMobileNavigation activeItem="payments" setActiveItem={() => {}} />
      </div>

      {/* Main Container - Fixed height with proper overflow */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col min-h-0 px-2 sm:px-4 pt-2 pb-2">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-600/50 shadow-2xl rounded-xl w-full text-white flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Header Section - Animated Hide/Show */}
            <div
              className={`transition-all duration-300 ease-in-out overflow-hidden border-b border-slate-700/50 ${
                isHeaderVisible
                  ? "max-h-screen opacity-100 p-3 sm:p-4"
                  : "max-h-0 opacity-0 p-0"
              }`}
            >
              {/* Title */}
              <div className="text-center mb-4">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent">
                  المدفوعات المعلقة
                </h2>
                <p className="text-gray-300 text-sm mt-2">
                  متابعة وإدارة المدفوعات المعلقة والمستحقات
                </p>
              </div>

              {/* Statistics Summary */}
              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-4">
                <Card className="overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-slate-500/60">
                  <CardContent className="p-3 sm:p-4 lg:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {formatNumber(allUnpaidMembers.length)}
                        </div>
                        <div className="text-xs sm:text-sm text-gray-300 mt-1 font-medium">
                          إجمالي المعلقة
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500/20 via-blue-500/20 to-purple-500/20 p-2 sm:p-3 lg:p-4 rounded-xl lg:rounded-2xl border border-white/10 shadow-lg">
                        <AlertTriangle className="h-5 w-5 sm:h-6 sm:w-6 lg:h-7 lg:w-7 text-red-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-slate-500/60">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {formatNumber(filteredMembers.length)}
                        </div>
                        <div className="text-sm text-gray-300 mt-1 font-medium">
                          المعروضة حالياً
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500/20 via-blue-500/20 to-purple-500/20 p-3 sm:p-4 rounded-2xl border border-white/10 shadow-lg">
                        <Filter className="h-6 w-6 sm:h-7 sm:w-7 text-green-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-slate-500/60">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {formatNumber(
                            allUnpaidMembers.filter(
                              (m) => m.paymentStatus === "partial",
                            ).length,
                          )}
                        </div>
                        <div className="text-sm text-gray-300 mt-1 font-medium">
                          مدفوعة جزئياً
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500/20 via-blue-500/20 to-purple-500/20 p-3 sm:p-4 rounded-2xl border border-white/10 shadow-lg">
                        <DollarSign className="h-6 w-6 sm:h-7 sm:w-7 text-yellow-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="overflow-hidden bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-slate-600/50 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-slate-500/60">
                  <CardContent className="p-4 sm:p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                          {formatNumber(
                            allUnpaidMembers.filter(
                              (m) => m.sessionsRemaining === 0,
                            ).length,
                          )}
                        </div>
                        <div className="text-sm text-gray-300 mt-1 font-medium">
                          حصص منتهية
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-yellow-500/20 via-blue-500/20 to-purple-500/20 p-3 sm:p-4 rounded-2xl border border-white/10 shadow-lg">
                        <Clock className="h-6 w-6 sm:h-7 sm:w-7 text-pink-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Period Filter Buttons - Mobile Optimized */}
              <div className="flex flex-col lg:flex-row gap-3 lg:gap-6 w-full">
                {/* Mobile: Grid Layout for Better Touch */}
                <div className="grid grid-cols-2 gap-2 sm:hidden">
                  <Button
                    variant="outline"
                    className={`flex items-center justify-center gap-2 backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white py-2 px-3 rounded-lg transition-all duration-300 ${selectedPeriod === "all" ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-blue-400/50 shadow-lg" : ""}`}
                    onClick={() => setSelectedPeriod("all")}
                  >
                    <Filter className="h-4 w-4" />
                    <span className="text-xs font-medium">الكل</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex items-center justify-center gap-2 backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white py-3 px-4 rounded-xl transition-all duration-300 ${selectedPeriod === "thisMonth" ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400/50 shadow-lg" : ""}`}
                    onClick={() => setSelectedPeriod("thisMonth")}
                  >
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-sm font-medium">هذا الشهر</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex items-center justify-center gap-2 backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white py-3 px-4 rounded-xl transition-all duration-300 ${selectedPeriod === "lastMonth" ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/50 shadow-lg" : ""}`}
                    onClick={() => setSelectedPeriod("lastMonth")}
                  >
                    <Calendar className="h-4 w-4 text-purple-400" />
                    <span className="text-sm font-medium">الشهر الماضي</span>
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex items-center justify-center gap-2 backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white py-3 px-4 rounded-xl transition-all duration-300 ${selectedPeriod === "expired" ? "bg-gradient-to-r from-red-500/30 to-orange-500/30 border-red-400/50 shadow-lg" : ""}`}
                    onClick={() => setSelectedPeriod("expired")}
                  >
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    <span className="text-sm font-medium">منتهية الصلاحية</span>
                  </Button>
                </div>

                {/* Desktop & Tablet: Horizontal Scroll */}
                <div className="hidden sm:flex gap-3 overflow-x-auto pb-2 lg:pb-0">
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white whitespace-nowrap px-4 py-2.5 rounded-xl transition-all duration-300 ${selectedPeriod === "all" ? "bg-gradient-to-r from-blue-500/30 to-purple-500/30 border-blue-400/50 shadow-lg" : ""}`}
                    onClick={() => setSelectedPeriod("all")}
                  >
                    <Filter className="h-4 w-4" />
                    الكل
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white whitespace-nowrap px-4 py-2.5 rounded-xl transition-all duration-300 ${selectedPeriod === "thisMonth" ? "bg-gradient-to-r from-blue-500/30 to-cyan-500/30 border-blue-400/50 shadow-lg" : ""}`}
                    onClick={() => setSelectedPeriod("thisMonth")}
                  >
                    <Calendar className="h-4 w-4 text-blue-400" />
                    هذا الشهر
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white whitespace-nowrap px-4 py-2.5 rounded-xl transition-all duration-300 ${selectedPeriod === "lastMonth" ? "bg-gradient-to-r from-purple-500/30 to-pink-500/30 border-purple-400/50 shadow-lg" : ""}`}
                    onClick={() => setSelectedPeriod("lastMonth")}
                  >
                    <Calendar className="h-4 w-4 text-purple-400" />
                    الشهر الماضي
                  </Button>
                  <Button
                    variant="outline"
                    className={`flex items-center gap-2 backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white whitespace-nowrap px-4 py-2.5 rounded-xl transition-all duration-300 ${selectedPeriod === "expired" ? "bg-gradient-to-r from-red-500/30 to-orange-500/30 border-red-400/50 shadow-lg" : ""}`}
                    onClick={() => setSelectedPeriod("expired")}
                  >
                    <AlertTriangle className="h-4 w-4 text-red-400" />
                    منتهية الصلاحية
                  </Button>
                </div>
              </div>
            </div>

            {/* Scrollable Content Area - Flexible */}
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto scrollbar-hide"
              onScroll={handleScroll}
            >
              {loading ? (
                <div className="flex justify-center items-center py-10 sm:py-20">
                  <div className="w-10 h-10 sm:w-16 sm:h-16 border-4 border-red-400 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="text-center py-12 bg-bluegray-700/30 backdrop-blur-md rounded-lg">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-r from-green-400/20 to-emerald-400/20 rounded-full blur-lg opacity-50" />
                    <div className="relative bg-gradient-to-br from-green-500/30 to-emerald-500/30 p-8 rounded-2xl mb-6 border border-green-400/20 max-w-md mx-auto">
                      <DollarSign className="h-16 w-16 text-green-400 mx-auto mb-4" />
                      <h3 className="text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent mb-4">
                        ممتاز!
                      </h3>
                      <p className="text-green-300 text-lg mb-2">
                        {selectedPeriod === "all"
                          ? "لا توجد مدفوعات معلقة حالياً"
                          : "لا توجد مدفوعات معلقة في هذه الفترة"}
                      </p>
                      <p className="text-gray-300">
                        {selectedPeriod === "all"
                          ? "جميع الأعضاء قاموا بسداد مستحقاتهم"
                          : "جرب تغيير الفترة الزمنية للبحث"}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-6 p-3 sm:p-4 pb-20 lg:pb-6">
                  {filteredMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-bluegray-700/60 to-bluegray-800/60 border border-red-500/50 shadow-lg hover:shadow-xl transition-all duration-200 w-full hover:border-red-400/60">
                        <CardContent className="p-3 h-full flex flex-col">
                          {/* Header Section with Avatar and Name */}
                          <div className="flex items-center gap-3 mb-3">
                            <Avatar className="h-12 w-12 border-2 border-red-400/50 shadow-lg flex-shrink-0">
                              <AvatarImage
                                src={member.imageUrl}
                                alt={member.name}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-600 text-white text-sm font-bold">
                                {member.name.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-white truncate mb-1">
                                {member.name}
                              </h3>
                              {member.phoneNumber && (
                                <div className="flex items-center gap-1 text-blue-300">
                                  <Phone className="h-3 w-3 flex-shrink-0" />
                                  <span className="text-xs font-medium truncate">
                                    {member.phoneNumber}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Main Content Area - Flexible */}
                          <div className="flex-1 space-y-2">
                            {/* Sessions & Price Row */}
                            <div className="grid grid-cols-2 gap-2">
                              {/* Sessions Remaining */}
                              {member.subscriptionType &&
                                member.sessionsRemaining !== undefined && (
                                  <div className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg p-2 border border-blue-400/30">
                                    <div className="text-center">
                                      <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs px-2 py-1 font-bold mb-1">
                                        {formatNumber(member.sessionsRemaining)}
                                      </Badge>
                                      <div className="text-xs text-blue-300 font-medium">
                                        حصة متبقية
                                      </div>
                                    </div>
                                  </div>
                                )}

                              {/* Subscription Price */}
                              {member.subscriptionPrice && (
                                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-2 border border-green-400/30">
                                  <div className="text-center">
                                    <div className="text-xs font-bold text-green-400 mb-1">
                                      {formatNumber(member.subscriptionPrice)}{" "}
                                      دج
                                    </div>
                                    {member.paymentStatus === "partial" &&
                                      member.partialPaymentAmount && (
                                        <div className="text-xs text-yellow-400">
                                          مدفوع:{" "}
                                          {formatNumber(
                                            member.partialPaymentAmount,
                                          )}{" "}
                                          دج
                                        </div>
                                      )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* Status Row */}
                            <div className="flex items-center justify-between gap-2">
                              {/* Payment Status */}
                              <Badge
                                className={`text-xs px-2 py-1 flex-1 text-center ${
                                  member.paymentStatus === "unpaid"
                                    ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                                    : member.paymentStatus === "partial"
                                      ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                                      : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                                }`}
                              >
                                {member.paymentStatus === "unpaid" &&
                                  "غير مدفوع"}
                                {member.paymentStatus === "partial" && "جزئي"}
                                {member.paymentStatus === "paid" && "مدفوع"}
                              </Badge>

                              {/* Subscription Type */}
                              {member.subscriptionType && (
                                <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs px-2 py-1 flex-1 text-center">
                                  {member.subscriptionType.split(" ")[0]}
                                </Badge>
                              )}
                            </div>

                            {/* Date */}
                            {member.membershipStartDate && (
                              <div className="text-xs text-gray-400 text-center bg-slate-700/30 rounded-md py-1 px-2">
                                {formatDate(member.membershipStartDate)}
                              </div>
                            )}
                          </div>

                          {/* Action Buttons - Fixed at Bottom */}
                          <div className="grid grid-cols-2 gap-1.5 mt-3 pt-2 border-t border-slate-600/30">
                            {/* End of Month Message Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs border-orange-500/50 text-orange-300 hover:bg-orange-500/20 hover:border-orange-400 transition-all duration-200"
                              onClick={() =>
                                handleSendEndOfMonthMessage(member)
                              }
                            >
                              <Send className="h-3 w-3 mr-1" />
                              انتهى الشهر
                            </Button>

                            {/* Edit Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-8 px-2 text-xs border-blue-500/50 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-200"
                              onClick={() => handleEditMember(member)}
                            >
                              <Edit className="h-3 w-3 mr-1" />
                              تعديل
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Fixed */}
      <div className="lg:hidden flex-shrink-0 bg-slate-900/95 backdrop-blur-xl border-t border-slate-700/50">
        <MobileNavigationComponent
          activeItem="payments"
          setActiveItem={(item) => {
            if (onBack) onBack();
          }}
          onTodayAttendanceClick={() => {
            if (onBack) onBack();
          }}
          onPendingPaymentsClick={() => {}}
        />
      </div>

      {/* Edit Member Dialog */}
      <MemberDialog
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMember}
        member={editingMember || undefined}
        title="تعديل بيانات العضو"
      />
    </div>
  );
};

export default PendingPaymentsPage;
