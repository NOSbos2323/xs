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
                <h2 className="text-xl sm:text-2xl font-bold text-white">
                  المدفوعات المعلقة
                </h2>
              </div>

              {/* Filter Buttons */}
              <div className="flex flex-wrap gap-2 justify-center mb-3">
                <Button
                  variant={selectedPeriod === "all" ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedPeriod("all")}
                >
                  الكل ({allUnpaidMembers.length})
                </Button>

                <Button
                  variant={selectedPeriod === "today" ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
                  onClick={() => setSelectedPeriod("today")}
                >
                  اليوم ({getTodayCount()})
                </Button>

                <Button
                  variant={
                    selectedPeriod === "thisMonth" ? "default" : "outline"
                  }
                  size="sm"
                  className="text-xs"
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
                  variant={
                    selectedPeriod === "lastMonth" ? "default" : "outline"
                  }
                  size="sm"
                  className="text-xs"
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
                  variant={selectedPeriod === "expired" ? "default" : "outline"}
                  size="sm"
                  className="text-xs"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3 p-3 pb-20 lg:pb-6">
                  {filteredMembers.map((member, index) => (
                    <motion.div
                      key={member.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      whileHover={{ scale: 1.02 }}
                    >
                      <Card className="overflow-hidden backdrop-blur-xl bg-gradient-to-br from-slate-700/60 to-slate-800/60 border border-red-500/50 shadow-lg hover:shadow-xl transition-all duration-200 w-full hover:border-red-400/60">
                        <CardContent className="p-2.5 h-full flex flex-col">
                          {/* Header Section with Avatar and Name */}
                          <div className="flex items-center gap-2 mb-3">
                            <Avatar className="h-10 w-10 border-2 border-red-400/50 shadow-lg flex-shrink-0">
                              <AvatarImage
                                src={member.imageUrl}
                                alt={member.name}
                              />
                              <AvatarFallback className="bg-gradient-to-br from-red-500 to-orange-600 text-white text-xs font-bold">
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
                              {member.subscriptionType && (
                                <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-2 border border-green-400/30">
                                  <div className="text-center">
                                    <div className="text-xs font-bold text-green-400 mb-1">
                                      {formatNumber(
                                        getCurrentPrice(
                                          member.subscriptionType,
                                        ),
                                      )}{" "}
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
                          <div className="grid grid-cols-2 gap-1 mt-2 pt-2 border-t border-slate-600/30">
                            {/* End of Month Message Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-1.5 text-xs border-orange-500/50 text-orange-300 hover:bg-orange-500/20 hover:border-orange-400 transition-all duration-200"
                              onClick={() =>
                                handleSendEndOfMonthMessage(member)
                              }
                            >
                              <Send className="h-3 w-3 mr-1" />
                              رسالة
                            </Button>

                            {/* Edit Button */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 px-1.5 text-xs border-blue-500/50 text-blue-300 hover:bg-blue-500/20 hover:border-blue-400 transition-all duration-200"
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
