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
  Search,
} from "lucide-react";
import { Input } from "@/components/ui/input";
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
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Get current pricing from settings using the payment service function
  const getCurrentPrice = (subscriptionType: string): number => {
    // Import and use the calculateSubscriptionPrice function from payment service
    const savedPricing = localStorage.getItem("gymPricingSettings");
    let pricing = {
      singleSession: 200,
      sessions13: 1500,
      sessions15: 1800,
      sessions30: 1800,
    };

    if (savedPricing) {
      try {
        const parsedPricing = JSON.parse(savedPricing);
        pricing = {
          singleSession: parsedPricing.singleSession || 200,
          sessions13: parsedPricing.sessions13 || 1500,
          sessions15: parsedPricing.sessions15 || 1800,
          sessions30: parsedPricing.sessions30 || 1800,
        };
      } catch (error) {
        console.error("Error loading pricing:", error);
      }
    }

    switch (subscriptionType?.trim()) {
      case "شهري":
        return pricing.sessions13;
      case "13 حصة":
        return pricing.sessions13;
      case "15 حصة":
        return pricing.sessions15;
      case "30 حصة":
        return pricing.sessions30;
      case "حصة واحدة":
        return pricing.singleSession;
      default:
        return pricing.sessions13;
    }
  };

  // State to force re-render when pricing changes
  const [pricingVersion, setPricingVersion] = useState(0);

  // Listen for pricing updates
  useEffect(() => {
    const handlePricingUpdate = () => {
      setPricingVersion((prev) => prev + 1);
    };

    window.addEventListener("pricing-updated", handlePricingUpdate);
    window.addEventListener("storage", handlePricingUpdate);

    // Check for pricing changes periodically
    const interval = setInterval(() => {
      setPricingVersion((prev) => prev + 1);
    }, 1000);

    return () => {
      window.removeEventListener("pricing-updated", handlePricingUpdate);
      window.removeEventListener("storage", handlePricingUpdate);
      clearInterval(interval);
    };
  }, []);

  // Computed filtered members based on selected period
  const filteredMembers = React.useMemo(() => {
    if (selectedPeriod === "all") {
      return allUnpaidMembers;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return allUnpaidMembers.filter((member) => {
      if (!member.membershipStartDate) return false;

      const memberDate = new Date(member.membershipStartDate);
      const memberMonth = memberDate.getMonth();
      const memberYear = memberDate.getFullYear();
      const memberDateOnly = new Date(memberDate);
      memberDateOnly.setHours(0, 0, 0, 0);

      switch (selectedPeriod) {
        case "today":
          return memberDateOnly.getTime() === today.getTime();

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

  // Get count for today
  const getTodayCount = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return allUnpaidMembers.filter((member) => {
      if (!member.membershipStartDate) return false;
      const memberDate = new Date(member.membershipStartDate);
      memberDate.setHours(0, 0, 0, 0);
      return memberDate.getTime() === today.getTime();
    }).length;
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

    // Create SMS URL to open SMS app with pre-filled message
    const phoneNumber = member.phoneNumber
      ? member.phoneNumber.replace(/[^0-9]/g, "")
      : "";
    const smsUrl = `sms:${phoneNumber}?body=${encodeURIComponent(message)}`;
    window.open(smsUrl, "_self");
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
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white flex flex-col overflow-hidden relative">
      {/* Mobile Navigation */}
      <div className="lg:hidden flex-shrink-0">
        <TopMobileNavigation
          activeItem="payments"
          setActiveItem={() => {}}
          onSettingsClick={() => {}}
        />
      </div>

      {/* Main Container - Fixed height with proper overflow */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 flex flex-col min-h-0 px-2 sm:px-4 pt-2 pb-2">
          <div className="bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl border border-slate-600/50 shadow-2xl rounded-xl w-full text-white flex-1 flex flex-col min-h-0 overflow-hidden">
            {/* Filter Section */}
            <div className="p-3 sm:p-4 border-b border-slate-700/30">
              {/* Title */}
              <div className="text-center mb-4">
                <h2 className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-yellow-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                  المدفوعات المعلقة
                </h2>
              </div>

              {/* Search Field - Mobile Only */}
              <div className="lg:hidden mb-4">
                <div className="relative w-full">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-1 top-1 h-8 w-8 text-gray-400 hover:text-white z-10"
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <Input
                    placeholder="بحث عن عضو..."
                    className="pl-10 pr-4 bg-bluegray-700/50 backdrop-blur-xl border-bluegray-600/50 focus:border-yellow-400 text-white shadow-lg"
                  />
                </div>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 justify-center mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white transition-all duration-300 hover:scale-105 ${
                    selectedPeriod === "all"
                      ? "bg-gradient-to-r from-yellow-500/30 to-blue-500/30 border-yellow-400/50"
                      : ""
                  }`}
                  onClick={() => setSelectedPeriod("all")}
                >
                  الكل ({allUnpaidMembers.length})
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white transition-all duration-300 hover:scale-105 ${
                    selectedPeriod === "today"
                      ? "bg-gradient-to-r from-yellow-500/30 to-blue-500/30 border-yellow-400/50"
                      : ""
                  }`}
                  onClick={() => setSelectedPeriod("today")}
                >
                  اليوم ({getTodayCount()})
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white transition-all duration-300 hover:scale-105 ${
                    selectedPeriod === "thisMonth"
                      ? "bg-gradient-to-r from-yellow-500/30 to-blue-500/30 border-yellow-400/50"
                      : ""
                  }`}
                  onClick={() => setSelectedPeriod("thisMonth")}
                >
                  هذا الشهر (
                  {
                    allUnpaidMembers.filter((m) => {
                      if (!m.membershipStartDate) return false;
                      const memberDate = new Date(m.membershipStartDate);
                      const currentDate = new Date();
                      return (
                        memberDate.getMonth() === currentDate.getMonth() &&
                        memberDate.getFullYear() === currentDate.getFullYear()
                      );
                    }).length
                  }
                  )
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white transition-all duration-300 hover:scale-105 ${
                    selectedPeriod === "lastMonth"
                      ? "bg-gradient-to-r from-yellow-500/30 to-blue-500/30 border-yellow-400/50"
                      : ""
                  }`}
                  onClick={() => setSelectedPeriod("lastMonth")}
                >
                  الشهر الماضي (
                  {
                    allUnpaidMembers.filter((m) => {
                      if (!m.membershipStartDate) return false;
                      const memberDate = new Date(m.membershipStartDate);
                      const currentDate = new Date();
                      const lastMonth =
                        currentDate.getMonth() === 0
                          ? 11
                          : currentDate.getMonth() - 1;
                      const lastMonthYear =
                        currentDate.getMonth() === 0
                          ? currentDate.getFullYear() - 1
                          : currentDate.getFullYear();
                      return (
                        memberDate.getMonth() === lastMonth &&
                        memberDate.getFullYear() === lastMonthYear
                      );
                    }).length
                  }
                  )
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className={`text-xs backdrop-blur-sm bg-bluegray-700/50 border-bluegray-600 hover:bg-bluegray-600 text-white transition-all duration-300 hover:scale-105 ${
                    selectedPeriod === "expired"
                      ? "bg-gradient-to-r from-yellow-500/30 to-blue-500/30 border-yellow-400/50"
                      : ""
                  }`}
                  onClick={() => setSelectedPeriod("expired")}
                >
                  منتهية (
                  {
                    allUnpaidMembers.filter((m) => {
                      if (!m.membershipStartDate) return false;
                      const memberDate = new Date(m.membershipStartDate);
                      const oneMonthLater = new Date(memberDate);
                      oneMonthLater.setMonth(oneMonthLater.getMonth() + 1);
                      return new Date() > oneMonthLater;
                    }).length
                  }
                  )
                </Button>
              </div>

              {/* Current Filter Display */}
              <div className="text-center">
                <Badge variant="secondary" className="text-xs">
                  المعروضة: {formatNumber(filteredMembers.length)} عضو
                </Badge>
              </div>
            </div>

            {/* Scrollable Content Area - Flexible */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
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
                <div className="space-y-3 p-3 pb-20 lg:pb-6">
                  {filteredMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="group flex items-stretch gap-3 p-3 rounded-xl bg-gradient-to-r from-slate-800/60 via-slate-700/40 to-slate-800/60 hover:from-slate-700/70 hover:via-slate-600/50 hover:to-slate-700/70 border border-red-500/50 hover:border-red-400/60 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl backdrop-blur-sm min-h-[80px]"
                      style={{
                        animationDelay: `${index * 100}ms`,
                        animation: "fadeInUp 0.6s ease-out forwards",
                      }}
                    >
                      {/* Avatar Section */}
                      <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-slate-700/80 to-slate-800/80 flex items-center justify-center ring-2 ring-red-500/40 group-hover:ring-red-400/60 transition-all duration-300 shadow-lg flex-shrink-0 self-center">
                        {member.imageUrl ? (
                          <img
                            src={member.imageUrl}
                            alt={member.name}
                            className="w-full h-full rounded-full object-cover border-2 border-slate-600/50"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500/20 to-orange-500/20 flex items-center justify-center">
                            <User className="h-4 w-4 text-red-400" />
                          </div>
                        )}
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-400 to-red-500 rounded-full border-2 border-slate-800 shadow-lg flex items-center justify-center">
                          <AlertTriangle className="w-2 h-2 text-white" />
                        </div>
                      </div>

                      {/* Main Content - Distributed Layout */}
                      <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                        {/* Top Row: Name and Badges */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className="font-semibold text-slate-100 group-hover:text-white transition-colors duration-200 truncate text-sm">
                            {member.name}
                          </h3>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {/* Payment Status Badge */}
                            <Badge
                              className={`text-xs px-1.5 py-0.5 ${
                                member.paymentStatus === "unpaid"
                                  ? "bg-gradient-to-r from-red-500 to-red-600 text-white"
                                  : member.paymentStatus === "partial"
                                    ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                                    : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
                              }`}
                            >
                              {member.paymentStatus === "unpaid" && "غير مدفوع"}
                              {member.paymentStatus === "partial" && "جزئي"}
                              {member.paymentStatus === "paid" && "مدفوع"}
                            </Badge>
                            {/* Subscription Type Badge */}
                            {member.subscriptionType && (
                              <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-xs px-1.5 py-0.5">
                                {member.subscriptionType.split(" ")[0]}
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Middle Row: Contact and Date Info */}
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            {member.phoneNumber && (
                              <div className="flex items-center gap-1 text-blue-300">
                                <Phone className="h-3 w-3 flex-shrink-0" />
                                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-200 truncate">
                                  {member.phoneNumber}
                                </span>
                              </div>
                            )}
                            {member.membershipStartDate && (
                              <div className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 text-slate-400" />
                                <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors duration-200">
                                  {formatDate(member.membershipStartDate)}
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Bottom Row: Price and Sessions */}
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-3 text-xs flex-1">
                            {member.subscriptionType && (
                              <div className="flex items-center gap-1 text-green-400">
                                <DollarSign className="h-3 w-3" />
                                <span className="whitespace-nowrap">
                                  {formatNumber(
                                    getCurrentPrice(member.subscriptionType),
                                  )}{" "}
                                  دج
                                </span>
                                {member.paymentStatus === "partial" &&
                                  member.partialPaymentAmount && (
                                    <span className="text-yellow-400 text-xs whitespace-nowrap">
                                      (مدفوع:{" "}
                                      {formatNumber(
                                        member.partialPaymentAmount,
                                      )}{" "}
                                      دج)
                                    </span>
                                  )}
                              </div>
                            )}
                            {member.subscriptionType &&
                              member.sessionsRemaining !== undefined && (
                                <div className="flex items-center gap-1 text-blue-400">
                                  <Clock className="h-3 w-3" />
                                  <span className="whitespace-nowrap">
                                    {formatNumber(member.sessionsRemaining)} حصة
                                  </span>
                                </div>
                              )}
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons - Vertical Layout */}
                      <div className="flex flex-col gap-1 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-all duration-300 justify-center flex-shrink-0">
                        {/* Send Message Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-orange-500/50 text-orange-300 hover:bg-orange-500/20 hover:border-orange-400 transition-all duration-200 min-w-[60px]"
                          onClick={() => handleSendEndOfMonthMessage(member)}
                        >
                          <Send className="h-3 w-3 mr-1" />
                          رسالة
                        </Button>

                        {/* Edit Button */}
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 px-2 text-xs border-blue-500/50 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-200 min-w-[60px]"
                          onClick={() => handleEditMember(member)}
                        >
                          <Edit className="h-3 w-3 mr-1" />
                          تعديل
                        </Button>
                      </div>
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
          onAddSessionClick={() => {}}
          onAddMemberClick={() => {}}
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
